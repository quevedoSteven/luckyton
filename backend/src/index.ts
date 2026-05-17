import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './api/auth.js'
import userRoutes from './api/users.js'
import gameRoutes from './api/games.js'
import leaderboardRoutes from './api/leaderboard.js'
import premiumRoutes from './api/premium.js'
import bettingRoutes from './api/betting.js'
import { handleSocketConnection } from './socket/index.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

const PORT = process.env.PORT || 4045

app.use(cors())
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
})
app.use('/api/', limiter)

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/premium', premiumRoutes)
app.use('/api/betting', bettingRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

handleSocketConnection(io)

httpServer.listen(PORT, () => {
  console.log(`LuckyTON server running on port ${PORT}`)
  console.log(`WebSocket server ready`)
})

export { io }
