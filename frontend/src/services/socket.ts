import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'https://luckyton-production.up.railway.app'

class GameSocket {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect(token: string) {
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      this.emit('connected', true)
    })

    this.socket.on('disconnect', () => {
      this.emit('disconnected', true)
    })

    this.socket.on('error', (_error: any) => {
      this.emit('error', 'connection_error')
    })

    this.socket.on('game_state', (data: any) => {
      this.emit('game_state', data)
    })

    this.socket.on('match_found', (data: any) => {
      this.emit('match_found', data)
    })

    this.socket.on('queue_update', (data: any) => {
      this.emit('queue_update', data)
    })

    this.socket.on('crash_update', (data: any) => {
      this.emit('crash_update', data)
    })

    this.socket.on('game_result', (data: any) => {
      this.emit('game_result', data)
    })

    this.socket.on('balance_update', (data: any) => {
      this.emit('balance_update', data)
    })

    return this.socket
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  joinQueue(gameType: string, betAmount: number, choice?: string) {
    this.socket?.emit('join_queue', { gameType, betAmount, choice })
  }

  leaveQueue() {
    this.socket?.emit('leave_queue')
  }

  joinCrash(betAmount: number) {
    this.socket?.emit('join_crash', { betAmount })
  }

  cashOutCrash() {
    this.socket?.emit('cash_out_crash')
  }

  makeMove(gameId: string, move: any) {
    this.socket?.emit('make_move', { gameId, move })
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data))
  }

  getSocket() {
    return this.socket
  }
}

export const gameSocket = new GameSocket()
export default gameSocket
