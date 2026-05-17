import crypto from 'crypto'
import { generateCoinFlip, generateDiceRoll, generateCrashPoint, generateGameResult, createProvablyFairData } from './provably-fair.js'

const TONCENTER_API = 'https://testnet.toncenter.com/api/v2'

interface BetGame {
  id: string
  type: string
  betAmount: number
  choice?: string
  playerWallet: string
  serverSeedHash: string
  clientSeed: string
  nonce: number
  revealedSeed: string
  status: 'pending' | 'paid' | 'completed'
  createdAt: Date
}

const activeGames: Map<string, BetGame> = new Map()

export function createGame(gameType: string, betAmount: number, choice?: string): BetGame {
  const id = `game_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
  const provablyFair = createProvablyFairData()

  const game: BetGame = {
    id,
    type: gameType,
    betAmount,
    choice,
    playerWallet: '',
    serverSeedHash: provablyFair.serverSeedHash,
    clientSeed: provablyFair.clientSeed,
    nonce: provablyFair.nonce,
    revealedSeed: provablyFair.serverSeed,
    status: 'pending',
    createdAt: new Date(),
  }

  activeGames.set(id, game)
  return game
}

export async function verifyPayment(gameId: string, txHash: string): Promise<BetGame | null> {
  const game = activeGames.get(gameId)
  if (!game) return null

  try {
    const res = await fetch(`${TONCENTER_API}/getTransactions?address=${process.env.HOUSE_WALLET_ADDRESS}&limit=10`)
    const data = await res.json()
    
    if (data.ok && data.result) {
      const tx = data.result.find((t: any) => t.transaction_id?.hash === txHash)
      if (tx) {
        game.status = 'paid'
        game.playerWallet = tx.in_msg?.source_address || ''
        return game
      }
    }
  } catch {
    console.error('Payment verification failed')
  }

  return null
}

export function getGameResult(game: BetGame): { winner: 'player' | 'house'; multiplier: number; result: any } {
  const { serverSeed, clientSeed, nonce } = {
    serverSeed: game.revealedSeed,
    clientSeed: game.clientSeed,
    nonce: game.nonce,
  }

  switch (game.type) {
    case 'coinflip': {
      const result = generateCoinFlip(serverSeed, clientSeed, nonce)
      const won = result === game.choice
      return { winner: won ? 'player' : 'house', multiplier: won ? 1.97 : 0, result }
    }
    case 'dice': {
      const playerRoll = generateDiceRoll(serverSeed, clientSeed, nonce)
      const houseRoll = generateDiceRoll(serverSeed, clientSeed, nonce + 1)
      const won = playerRoll > houseRoll
      return { winner: won ? 'player' : 'house', multiplier: won ? 1.97 : 0, result: { playerRoll, houseRoll } }
    }
    case 'numberguess': {
      const actual = generateGameResult(serverSeed, clientSeed, nonce, 100) + 1
      const guess = parseInt(game.choice || '50')
      const diff = Math.abs(actual - guess)
      let multiplier = 0
      if (diff === 0) multiplier = 10
      else if (diff <= 5) multiplier = 2
      else if (diff <= 15) multiplier = 1.5
      return { winner: multiplier > 0 ? 'player' : 'house', multiplier, result: { actual, guess, diff } }
    }
    case 'crash': {
      const crashPoint = generateCrashPoint(serverSeed, clientSeed, nonce)
      return { winner: 'house', multiplier: 0, result: { crashPoint } }
    }
    default:
      return { winner: 'house', multiplier: 0, result: {} }
  }
}

export async function sendWinnings(toAddress: string, amount: number, gameId: string): Promise<boolean> {
  try {
    const nanoAmount = BigInt(Math.floor(amount * 1e9))
    const body = Buffer.concat([
      Buffer.alloc(4),
      Buffer.from(`LuckyTON win: ${gameId}`)
    ])

    const res = await fetch(`${TONCENTER_API}/sendBoc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boc: '',
      }),
    })

    return true
  } catch {
    return false
  }
}
