import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import jwt from 'jsonwebtoken'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import authRouter from '../routes/auth.routes.js'
import userRouter from '../routes/user.routes.js'
import itemRouter from '../routes/item.routes.js'
import shopRouter from '../routes/shop.routes.js'
import orderRouter from '../routes/order.routes.js'

let mongoServer

export async function setupTestDB(){
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri, { })
}

export async function teardownTestDB(){
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
}

export function createApp(){
  const app = express()
  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())
  app.use('/api/auth', authRouter)
  app.use('/api/user', userRouter)
  app.use('/api/shop', shopRouter)
  app.use('/api/item', itemRouter)
  app.use('/api/order', orderRouter)
  return app
}

export function createTokenCookie(userId){
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'testsecret')
  return `token=${token}`
}
