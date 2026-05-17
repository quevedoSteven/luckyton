import { Socket } from 'socket.io'
import { generateGameResult, createProvablyFairData } from '../engine/provably-fair.js'

export function makeMove(socket: Socket, user: any, gameId: string, move: any) {
  const provablyFair = createProvablyFairData()
  const actualNumber = generateGameResult(provablyFair.serverSeed, provablyFair.clientSeed, provablyFair.nonce, 100) + 1
  const playerGuess = move.guess

  const diff = Math.abs(actualNumber - playerGuess)
  let multiplier = 0
  let hasWon = false

  if (diff === 0) {
    multiplier = 10
    hasWon = true
  } else if (diff <= 5) {
    multiplier = 2
    hasWon = true
  } else if (diff <= 15) {
    multiplier = 1.5
    hasWon = true
  }

  const result = {
    gameId,
    actualNumber,
    playerGuess,
    diff,
    multiplier,
    hasWon,
    provablyFair: {
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed,
      nonce: provablyFair.nonce,
      revealedServerSeed: provablyFair.serverSeed,
    },
  }

  socket.emit('game_result', result)
}
