import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { makeMove as coinFlipMove } from './coinflip.js'
import { makeMove as diceMove } from './dice.js'
import { handleCrash } from './crash.js'
import { makeMove as numberGuessMove } from './numberguess.js'
import { matchmakingQueue, joinQueue, leaveQueue } from './matchmaking.js'

export function handleSocketConnection(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication required'))

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
      socket.data.user = decoded
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user
    console.log(`Player connected: ${user.walletAddress}`)

    socket.on('join_queue', (data: { gameType: string; betAmount: number; choice?: string }) => {
      joinQueue(socket.id, user, data.gameType, data.betAmount, data.choice)
    })

    socket.on('leave_queue', () => {
      leaveQueue(socket.id)
    })

    socket.on('join_crash', (data: { betAmount: number }) => {
      handleCrash.joinPlayer(socket, io, user, data.betAmount)
    })

    socket.on('cash_out_crash', () => {
      handleCrash.cashOutPlayer(socket, io, user)
    })

    socket.on('make_move', (data: { gameId: string; move: any }) => {
      switch (data.move.type) {
        case 'coinflip':
          coinFlipMove(socket, user, data.gameId, data.move)
          break
        case 'dice':
          diceMove(socket, user, data.gameId, data.move)
          break
        case 'numberguess':
          numberGuessMove(socket, user, data.gameId, data.move)
          break
      }
    })

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${user.walletAddress}`)
      leaveQueue(socket.id)
      handleCrash.removePlayer(socket, user)
    })
  })

  setInterval(() => {
    matchmakingQueue.processQueue(io)
  }, 1000)

  handleCrash.startGameLoop(io)
}
