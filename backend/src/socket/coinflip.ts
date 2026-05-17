import { Socket } from 'socket.io'
import { generateCoinFlip, createProvablyFairData } from '../engine/provably-fair.js'

interface CoinFlipGame {
  id: string
  player1: { socketId: string; userId: string; choice: string; bet: number }
  player2: { socketId: string; userId: string; choice: string; bet: number }
  provablyFair: ReturnType<typeof createProvablyFairData>
  status: 'waiting' | 'flipping' | 'finished'
}

const activeGames: Map<string, CoinFlipGame> = new Map()

export function makeMove(socket: Socket, user: any, gameId: string, move: any) {
  const game = activeGames.get(gameId)
  if (!game || game.status !== 'waiting') return

  if (move.choice) {
    if (game.player1.userId === user.id) {
      game.player1.choice = move.choice
    } else if (game.player2.userId === user.id) {
      game.player2.choice = move.choice
    }

    if (game.player1.choice && game.player2.choice) {
      flipCoin(socket, game)
    }
  }
}

function flipCoin(socket: Socket, game: CoinFlipGame) {
  game.status = 'flipping'

  const { serverSeed, serverSeedHash, clientSeed, nonce } = game.provablyFair
  const result = generateCoinFlip(serverSeed, clientSeed, nonce)

  socket.to(game.player1.socketId).emit('game_state', {
    gameId: game.id,
    status: 'flipping',
  })
  socket.to(game.player2.socketId).emit('game_state', {
    gameId: game.id,
    status: 'flipping',
  })

  setTimeout(() => {
    game.status = 'finished'
    const p1Wins = game.player1.choice === result
    const winner = p1Wins ? game.player1 : game.player2
    const loser = p1Wins ? game.player2 : game.player1
    const houseFee = (game.player1.bet + game.player2.bet) * 0.03
    const winnings = game.player1.bet + game.player2.bet - houseFee

    const resultData = {
      gameId: game.id,
      result,
      winner: {
        userId: winner.userId,
        choice: winner.choice,
        winnings,
      },
      loser: {
        userId: loser.userId,
        choice: loser.choice,
      },
      provablyFair: {
        serverSeedHash,
        clientSeed,
        nonce,
        revealedServerSeed: serverSeed,
      },
    }

    socket.to(winner.socketId).emit('game_result', resultData)
    socket.to(loser.socketId).emit('game_result', resultData)

    activeGames.delete(game.id)
  }, 2000)
}

export function createGame(player1: any, player2: any, betAmount: number) {
  const gameId = `cf_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const provablyFair = createProvablyFairData()

  const game: CoinFlipGame = {
    id: gameId,
    player1: {
      socketId: player1.socketId,
      userId: player1.userId,
      choice: player1.choice || '',
      bet: betAmount,
    },
    player2: {
      socketId: player2.socketId,
      userId: player2.userId,
      choice: player2.choice || '',
      bet: betAmount,
    },
    provablyFair,
    status: 'waiting',
  }

  activeGames.set(gameId, game)
  return game
}
