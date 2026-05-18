import { Socket } from 'socket.io'
import { generateDiceRoll, createProvablyFairData } from '../engine/provably-fair.js'

const activeGames: Map<string, {
  provablyFair: ReturnType<typeof createProvablyFairData>
  result: any
  revealedAt: number
}> = new Map()

export function makeMove(socket: Socket, user: any, gameId: string, move: any) {
  const provablyFair = createProvablyFairData()
  const playerRoll = generateDiceRoll(provablyFair.serverSeed, provablyFair.clientSeed, provablyFair.nonce)
  const houseRoll = generateDiceRoll(provablyFair.serverSeed, provablyFair.clientSeed, provablyFair.nonce + 1)

  const result = {
    gameId,
    playerRoll,
    houseRoll,
    winner: playerRoll > houseRoll ? 'player' : playerRoll < houseRoll ? 'house' : 'tie',
    provablyFair: {
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed,
      nonce: provablyFair.nonce,
      revealedServerSeed: provablyFair.serverSeed,
    },
  }

  socket.emit('game_result', result)

  activeGames.set(gameId, {
    provablyFair,
    result,
    revealedAt: Date.now(),
  })

  setTimeout(() => activeGames.delete(gameId), 300000)
}

export function verifyGame(socket: Socket, gameId: string) {
  const game = activeGames.get(gameId)
  if (!game) {
    socket.emit('verify_result', { error: 'Game not found or expired' })
    return
  }

  const { serverSeed, serverSeedHash, clientSeed, nonce } = game.provablyFair
  const expectedHash = require('crypto').createHash('sha256').update(serverSeed).digest('hex')

  socket.emit('verify_result', {
    gameId,
    serverSeed,
    serverSeedHash,
    clientSeed,
    nonce,
    hashMatches: expectedHash === serverSeedHash,
  })
}
