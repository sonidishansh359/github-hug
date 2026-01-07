import User from "../models/user.model.js"
import Order from "../models/order.model.js"

export const getEarnings = async (req, res) => {
    try {
        const owner = await User.findById(req.userId)
        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ message: "Access denied" })
        }

        // Calculate today's earnings
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const todaysOrders = await Order.find({
            "shopOrders.owner": req.userId,
            "shopOrders.status": "delivered",
            "shopOrders.deliveredAt": { $gte: startOfDay }
        })

        let todaysEarnings = 0
        todaysOrders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if (shopOrder.owner.toString() === req.userId && shopOrder.status === "delivered") {
                    todaysEarnings += shopOrder.subtotal
                }
            })
        })

        return res.status(200).json({
            totalEarnings: owner.earnings,
            todaysEarnings
        })
    } catch (error) {
        return res.status(500).json({ message: `get earnings error ${error}` })
    }
}
