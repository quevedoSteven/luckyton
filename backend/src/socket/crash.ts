import { Server, Socket } from 'socket.io'
import { generateCrashPoint, createProvablyFairData } from '../engine/provably-fair.js'

interface CrashPlayer {
  socketId: string
  userId: string
  walletAddress: string
  username?: string
  bet: number
  cashedOut: boolean
  cashOutMultiplier?: number
}

class CrashGame {
  private players: CrashPlayer[] = []
  private isRunning = false
  private multiplier = 1.0
  private crashPoint = 0
  private gameLoop: NodeJS.Timeout | null = null
  private startTime = 0

  joinPlayer(socket: Socket, io: Server, user: any, betAmount: number) {
    if (this.isRunning) {
      socket.emit('error', { message: 'Game already in progress' })
      return
    }

    const existingPlayer = this.players.find((p) => p.userId === user.id)
    if (existingPlayer) {
      socket.emit('error', { message: 'Already in game' })
      return
    }

    this.players.push({
      socketId: socket.id,
      userId: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      bet: betAmount,
      cashedOut: false,
    })

    socket.join('crash')
    socket.emit('crash_joined', { bet: betAmount })

    if (this.players.length >= 1 && !this.isRunning) {
      setTimeout(() => this.startGame(io), 3000)
    }

    this.broadcastState(io)
  }

  cashOutPlayer(socket: Socket, io: Server, user: any) {
    const player = this.players.find((p) => p.userId === user.id)
    if (!player || !this.isRunning || player.cashedOut) return

    player.cashedOut = true
    player.cashOutMultiplier = this.multiplier

    socket.emit('cashed_out', {
      multiplier: this.multiplier,
      winnings: player.bet * this.multiplier,
    })

    this.broadcastState(io)
  }

  removePlayer(socket: Socket, user: any) {
    const index = this.players.findIndex((p) => p.userId === user.id)
    if (index !== -1) {
      this.players.splice(index, 1)
    }
  }

  private startGame(io: Server) {
    if (this.players.length === 0) return

    this.isRunning = true
    this.multiplier = 1.0
    this.startTime = Date.now()

    const provablyFair = createProvablyFairData()
    this.crashPoint = generateCrashPoint(
      provablyFair.serverSeed,
      provablyFair.clientSeed,
      provablyFair.nonce
    )

    io.to('crash').emit('crash_start', {
      serverSeedHash: provablyFair.serverSeedHash,
      playerCount: this.players.length,
    })

    this.gameLoop = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000
      this.multiplier = Math.pow(Math.E, 0.07 * elapsed * elapsed)

      if (this.multiplier >= this.crashPoint) {
        this.crash(io)
        return
      }

      this.broadcastState(io)
    }, 50)
  }

  private crash(io: Server) {
    if (this.gameLoop) {
      clearInterval(this.gameLoop)
      this.gameLoop = null
    }

    this.isRunning = false
    this.multiplier = this.crashPoint

    io.to('crash').emit('crash_end', {
      crashPoint: this.crashPoint,
      results: this.players.map((p) => ({
        userId: p.userId,
        bet: p.bet,
        cashedOut: p.cashedOut,
        cashOutMultiplier: p.cashOutMultiplier,
        winnings: p.cashedOut ? p.bet * (p.cashOutMultiplier || 0) : 0,
      })),
    })

    setTimeout(() => {
      this.players = []
      this.broadcastState(io)
    }, 5000)
  }

  private broadcastState(io: Server) {
    io.to('crash').emit('crash_update', {
      multiplier: this.multiplier,
      isRunning: this.isRunning,
      players: this.players.map((p) => ({
        userId: p.userId,
        username: p.username,
        bet: p.bet,
        cashedOut: p.cashedOut,
        cashOutMultiplier: p.cashOutMultiplier,
      })),
    })
  }

  startGameLoop(io: Server) {
    setInterval(() => {
      if (!this.isRunning && this.players.length > 0) {
        this.startGame(io)
      }
    }, 1000)
  }
}

export const handleCrash = new CrashGame()
