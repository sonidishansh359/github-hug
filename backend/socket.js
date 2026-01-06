import User from "./models/user.model.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id)

    // Handle identity - called when user logs in or reconnects
    socket.on('identity', async ({ userId }) => {
      try {
        console.log('Socket identity for user:', userId, 'socket:', socket.id)
        const user = await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true
        }, { new: true })

        if (user) {
          // Join user-specific room for targeted events
          socket.join(`user_${userId}`)
          console.log(`User ${userId} (${user.role}) joined room user_${userId}`)

          // Additional room for delivery boys
          if (user.role === 'deliveryBoy') {
            socket.join('delivery_boys')
            console.log(`Delivery boy ${userId} joined delivery_boys room`)
          }
        }
      } catch (error) {
        console.log('Identity error:', error)
      }
    })

    // Handle location updates
    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        })

        if (user) {
          // Emit to all clients for delivery tracking
          io.emit('updateDeliveryLocation', {
            deliveryBoyId: userId,
            latitude,
            longitude
          })
        }
      } catch (error) {
        console.log('updateDeliveryLocation error:', error)
      }
    })

    // Handle disconnect
    socket.on('disconnect', async (reason) => {
      console.log('Socket disconnected:', socket.id, 'reason:', reason)
      try {
        await User.findOneAndUpdate({ socketId: socket.id }, {
          socketId: null,
          isOnline: false
        })
      } catch (error) {
        console.log('Disconnect cleanup error:', error)
      }
    })

    // Handle reconnection - re-identify if needed
    socket.on('reconnect', () => {
      console.log('Socket reconnected:', socket.id)
      // The frontend should handle re-identification
    })
  })
}
