import { Server } from 'socket.io'

interface QueuedPlayer {
  socketId: string
  userId: string
  walletAddress: string
  username?: string
  gameType: string
  betAmount: number
  choice?: string
  joinedAt: Date
}

class MatchmakingQueue {
  private queues: Map<string, QueuedPlayer[]> = new Map()

  addPlayer(player: QueuedPlayer) {
    if (!this.queues.has(player.gameType)) {
      this.queues.set(player.gameType, [])
    }
    const queue = this.queues.get(player.gameType)!
    queue.push(player)
    console.log(`Player joined ${player.gameType} queue (${queue.length} waiting)`)
  }

  removePlayer(socketId: string) {
    for (const [gameType, queue] of this.queues) {
      const index = queue.findIndex((p) => p.socketId === socketId)
      if (index !== -1) {
        queue.splice(index, 1)
        console.log(`Player removed from ${gameType} queue`)
      }
    }
  }

  processQueue(io: Server) {
    for (const [gameType, queue] of this.queues) {
      while (queue.length >= 2) {
        const player1 = queue.shift()!
        const player2 = queue.shift()!

        const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(7)}`

        io.to(player1.socketId).emit('match_found', {
          gameId,
          gameType,
          opponent: {
            userId: player2.userId,
            username: player2.username,
            walletAddress: player2.walletAddress,
          },
          betAmount: player1.betAmount,
        })

        io.to(player2.socketId).emit('match_found', {
          gameId,
          gameType,
          opponent: {
            userId: player1.userId,
            username: player1.username,
            walletAddress: player1.walletAddress,
          },
          betAmount: player2.betAmount,
        })

        console.log(`Match created: ${gameId}`)
      }

      if (queue.length > 0) {
        io.to(queue[0].socketId).emit('queue_update', {
          gameType,
          playersInQueue: queue.length,
          estimatedWait: queue.length > 1 ? '30s' : '2m',
        })
      }
    }
  }

  getQueueLength(gameType: string): number {
    return this.queues.get(gameType)?.length || 0
  }
}

export const matchmakingQueue = new MatchmakingQueue()

export function joinQueue(
  socketId: string,
  user: any,
  gameType: string,
  betAmount: number,
  choice?: string
) {
  matchmakingQueue.addPlayer({
    socketId,
    userId: user.id,
    walletAddress: user.walletAddress,
    username: user.username,
    gameType,
    betAmount,
    choice,
    joinedAt: new Date(),
  })
}

export function leaveQueue(socketId: string) {
  matchmakingQueue.removePlayer(socketId)
}
