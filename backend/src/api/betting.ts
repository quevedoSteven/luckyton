import { Router } from 'express'
import crypto from 'crypto'

const TONCENTER_API = 'https://testnet.toncenter.com/api/v2'

interface BetSession {
  id: string
  type: string
  betAmount: number
  choice?: string
  playerWallet: string
  txHash?: string
  result?: any
  winnings: number
  status: 'pending' | 'paid' | 'completed'
  createdAt: Date
}

const sessions: Map<string, BetSession> = new Map()

function generateResult(type: string, choice?: string): { winner: 'player' | 'house'; multiplier: number; details: any } {
  const serverSeed = crypto.randomBytes(32).toString('hex')
  const clientSeed = crypto.randomBytes(16).toString('hex')
  const nonce = Date.now()

  const hash = crypto.createHmac('sha256', serverSeed).update(`${clientSeed}:${nonce}`).digest('hex')
  const hashInt = parseInt(hash.substring(0, 8), 16)

  switch (type) {
    case 'coinflip': {
      const result = hashInt % 2 === 0 ? 'heads' : 'tails'
      const won = result === choice
      return { winner: won ? 'player' : 'house', multiplier: won ? 1.97 : 0, details: { result, choice } }
    }
    case 'dice': {
      const playerRoll = (hashInt % 6) + 1
      const houseHash = crypto.createHmac('sha256', serverSeed).update(`${clientSeed}:${nonce + 1}`).digest('hex')
      const houseRoll = (parseInt(houseHash.substring(0, 8), 16) % 6) + 1
      const won = playerRoll > houseRoll
      return { winner: won ? 'player' : 'house', multiplier: won ? 1.97 : 0, details: { playerRoll, houseRoll } }
    }
    case 'numberguess': {
      const actual = (hashInt % 100) + 1
      const guess = parseInt(choice || '50')
      const diff = Math.abs(actual - guess)
      let multiplier = 0
      if (diff === 0) multiplier = 10
      else if (diff <= 5) multiplier = 2
      else if (diff <= 15) multiplier = 1.5
      return { winner: multiplier > 0 ? 'player' : 'house', multiplier, details: { actual, guess, diff } }
    }
    default:
      return { winner: 'house', multiplier: 0, details: {} }
  }
}

const router = Router()

router.post('/create', async (req, res) => {
  try {
    const { gameType, betAmount, choice, playerWallet } = req.body

    if (!gameType || !betAmount || betAmount < 0.01) {
      return res.status(400).json({ message: 'Invalid bet parameters' })
    }

    const id = `bet_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

    const session: BetSession = {
      id,
      type: gameType,
      betAmount,
      choice,
      playerWallet: playerWallet || '',
      winnings: 0,
      status: 'pending',
      createdAt: new Date(),
    }

    sessions.set(id, session)

    res.json({
      sessionId: id,
      paymentRequest: {
        amount: betAmount,
        recipient: process.env.HOUSE_WALLET_ADDRESS || '',
        comment: `LuckyTON:${id}`,
        validUntil: Math.floor(Date.now() / 1000) + 300,
      },
    })
  } catch {
    res.status(500).json({ message: 'Failed to create bet' })
  }
})

router.post('/verify/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { txHash } = req.body

    const session = sessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (txHash) {
      session.txHash = txHash
      session.status = 'paid'
    }

    const result = generateResult(session.type, session.choice)
    session.result = result
    session.winnings = result.winner === 'player' ? session.betAmount * result.multiplier : 0
    session.status = 'completed'

    res.json({
      sessionId,
      result,
      winnings: session.winnings,
      betAmount: session.betAmount,
    })
  } catch {
    res.status(500).json({ message: 'Failed to verify bet' })
  }
})

export default router
