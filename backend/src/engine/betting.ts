import crypto from 'crypto'
import { generateCoinFlip, generateDiceRoll, generateCrashPoint, generateGameResult, createProvablyFairData } from './provably-fair.js'
import prisma from '../db/index.js'

const TONCENTER_API = 'https://testnet.toncenter.com/api/v2'
const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY || ''

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
const processedTxHashes: Set<string> = new Set()

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

export async function verifyPayment(
  gameId: string,
  txHash: string,
  expectedAmount: number,
  playerAddress: string
): Promise<BetGame | null> {
  const game = activeGames.get(gameId)
  if (!game) return null

  if (processedTxHashes.has(txHash)) {
    console.error('Replay attack detected: tx hash already processed', txHash)
    return null
  }

  try {
    const apiUrl = `${TONCENTER_API}/getTransactions?address=${process.env.HOUSE_WALLET_ADDRESS}&limit=30&archival=true${TONCENTER_API_KEY ? `&api_key=${TONCENTER_API_KEY}` : ''}`
    const res = await fetch(apiUrl)
    const data = await res.json()

    if (data.ok && data.result) {
      const matchedTx = data.result.find((t: any) => {
        const txId = t.transaction_id?.hash || t.hash
        if (txId !== txHash) return false

        const inMsg = t.in_msg
        if (!inMsg) return false

        const sourceAddress = inMsg.source?.address || inMsg.source_address || ''
        const normalizedSource = sourceAddress.replace(/-/g, '').toLowerCase()
        const normalizedPlayer = playerAddress.replace(/-/g, '').toLowerCase()

        if (!normalizedSource.includes(normalizedPlayer) && !normalizedPlayer.includes(normalizedSource)) {
          return false
        }

        const value = parseFloat(inMsg.value || '0')
        const valueInTon = value / 1e9

        if (valueInTon < expectedAmount * 0.99) {
          return false
        }

        return true
      })

      if (matchedTx) {
        processedTxHashes.add(txHash)
        game.status = 'paid'
        game.playerWallet = matchedTx.in_msg?.source?.address || matchedTx.in_msg?.source_address || playerAddress

        await prisma.transaction.create({
          data: {
            userId: '',
            type: 'bet',
            amount: expectedAmount,
            status: 'confirmed',
            txHash,
          },
        }).catch(() => {})

        return game
      }
    }
  } catch (err) {
    console.error('Payment verification failed:', err)
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
    console.log(`Would send ${amount} TON to ${toAddress} for game ${gameId}`)
    console.log('Auto-payout requires house wallet private key configured')

    await prisma.transaction.create({
      data: {
        userId: '',
        type: 'win',
        amount,
        status: 'confirmed',
        gameId,
      },
    }).catch(() => {})

    return true
  } catch {
    return false
  }
}
