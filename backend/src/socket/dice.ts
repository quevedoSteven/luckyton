import { Socket } from 'socket.io'
import { generateDiceRoll, createProvablyFairData } from '../engine/provably-fair.js'

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
}
