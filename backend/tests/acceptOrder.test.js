import test from 'node:test'
import assert from 'assert'
import supertest from 'supertest'
import mongoose from 'mongoose'
import User from '../models/user.model.js'
import Order from '../models/order.model.js'
import DeliveryAssignment from '../models/deliveryAssignment.model.js'
import { setupTestDB, teardownTestDB, createApp, createTokenCookie } from './test-helpers.js'

test('accept-order flow: delivery boy can accept assignment', async (t) => {
  await setupTestDB()
  process.env.JWT_SECRET = 'testsecret'
  try {
    // create app and server
    const app = createApp()
    const request = supertest(app)

    // create a delivery boy user
    const deliveryBoy = await User.create({ fullName: 'DBoy', role: 'deliveryBoy', email: 'dboy@test.com', mobile: '9999999999', location: { type: 'Point', coordinates: [0,0] } })

    // create a dummy user (customer)
    const customer = await User.create({ fullName: 'Cust', role: 'user', email: 'cust@test.com', mobile: '8888888888' })

    // create an order and a shopOrder inside it (minimal fields required by schema)
    const order = await Order.create({ user: customer._id, paymentMethod: 'cod', deliveryAddress: { text: 'addr', latitude: 0, longitude: 0 }, shopOrders: [{ shop: mongoose.Types.ObjectId(), owner: mongoose.Types.ObjectId(), subtotal: 100, shopOrderItems: [] }] })

    // create delivery assignment targeted to deliveryBoy
    const assignment = await DeliveryAssignment.create({ order: order._id, shop: order.shopOrders[0].shop, shopOrderId: order.shopOrders[0]._id, brodcastedTo: [deliveryBoy._id], status: 'brodcasted' })

    // Call accept endpoint with the delivery boy token cookie
    const cookie = createTokenCookie(String(deliveryBoy._id))
    const res = await request.post(`/api/order/accept-order/${assignment._id}`).set('Cookie', cookie)

    assert.equal(res.status, 200, `expected 200 OK but got ${res.status} - ${JSON.stringify(res.body)}`)
    assert.equal(res.body.message, 'order accepted')

    // verify assignment updated
    const updated = await DeliveryAssignment.findById(assignment._id)
    assert.equal(String(updated.assignedTo), String(deliveryBoy._id))
    assert.equal(updated.status, 'assigned')

  } finally {
    await teardownTestDB()
  }
})
