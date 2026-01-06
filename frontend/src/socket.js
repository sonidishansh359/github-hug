import { io } from 'socket.io-client'

// Singleton socket instance
let socket = null

export function initSocket(url) {
  if (!socket) {
    const connectUrl = url || 'http://localhost:8000'

    socket = io(connectUrl, {
      withCredentials: true,
      // Reconnection configuration
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      // Transport options
      transports: ['websocket', 'polling'],
      // Force new connection to avoid issues
      forceNew: false,
      // Timeout settings
      timeout: 20000,
      // Additional options for better reliability
      autoConnect: false, // We'll connect manually
      upgrade: true
    })

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        // Server disconnected, manual reconnection needed
        socket.connect()
      }
    })

    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
    })

    socket.on('reconnect_error', (error) => {
      console.log('Socket reconnection failed:', error)
    })

    socket.on('reconnect_failed', () => {
      console.log('Socket reconnection failed permanently')
    })

    // Connect the socket
    socket.connect()
  }
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Helper function to emit identity (call this after login)
export function identifySocket(userId) {
  if (socket && socket.connected) {
    console.log('Emitting identity for user:', userId)
    socket.emit('identity', { userId })
  } else {
    console.log('Socket not connected, cannot identify')
  }
}

// Helper function to check connection status
export function isSocketConnected() {
  return socket && socket.connected
}
