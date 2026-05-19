import { Router, Request } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import prisma from '../db/index.js'
import { generateDiceRoll, generateCoinFlip, createProvablyFairData } from '../engine/provably-fair.js'
import { verifyPayment, sendWinnings } from '../engine/betting.js'

const router = Router()

function getParam(req: Request, key: string): string {
  const val = req.params[key]
  return Array.isArray(val) ? val[0] : val
}

interface BetSession {
  id: string
  type: string
  betAmount: number
  choice?: string
  userId: string
  walletAddress: string
  provablyFair: ReturnType<typeof createProvablyFairData>
  status: 'pending' | 'paid' | 'completed'
  txHash?: string
  createdAt: Date
}

const sessions: Map<string, BetSession> = new Map()

async function processBet(session: BetSession): Promise<any> {
  const pf = session.provablyFair

  switch (session.type) {
    case 'dice': {
      const playerRoll = generateDiceRoll(pf.serverSeed, pf.clientSeed, pf.nonce)
      const houseRoll = generateDiceRoll(pf.serverSeed, pf.clientSeed, pf.nonce + 1)
      const isWin = playerRoll > houseRoll
      const houseEdge = 0.03
      const multiplier = isWin ? (2 - houseEdge) : 0

      return {
        gameType: 'dice',
        winner: isWin ? ('player' as const) : ('house' as const),
        multiplier: isWin ? multiplier : 0,
        details: { playerRoll, houseRoll, isWin, houseEdge, sessionId: session.id },
      }
    }

    case 'coinflip': {
      const result = generateCoinFlip(pf.serverSeed, pf.clientSeed, pf.nonce)
      const isWin = result === session.choice
      const houseEdge = 0.03
      const multiplier = isWin ? (2 - houseEdge) : 0

      return {
        gameType: 'coinflip',
        winner: isWin ? ('player' as const) : ('house' as const),
        multiplier: isWin ? multiplier : 0,
        details: { result, choice: session.choice, isWin, houseEdge, sessionId: session.id },
      }
    }

    default:
      return { winner: 'house', multiplier: 0, details: {} }
  }
}

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { gameType, betAmount, choice } = req.body
    const userId = (req as any).userId

    if (!gameType || !betAmount || betAmount <= 0) {
      return res.status(400).json({ message: 'Invalid bet parameters. betAmount must be greater than 0.' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (betAmount < 0.01) {
      return res.status(400).json({ message: 'Minimum bet is 0.01 TON' })
    }

    const id = `bet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const provablyFair = createProvablyFairData()

    const session: BetSession = {
      id,
      type: gameType,
      betAmount,
      choice,
      userId,
      walletAddress: user.walletAddress,
      provablyFair,
      status: 'pending',
      createdAt: new Date(),
    }

    sessions.set(id, session)

    res.json({
      sessionId: id,
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed,
      message: `Send ${betAmount} TON to house wallet to place your bet.`,
    })
  } catch (error) {
    console.error('Create bet error:', error)
    res.status(500).json({ message: 'Failed to create bet' })
  }
})

router.post('/verify/:sessionId', authMiddleware, async (req, res) => {
  try {
    const sessionId = getParam(req, 'sessionId')
    const { txHash } = req.body
    const userId = (req as any).userId

    if (!txHash) {
      return res.status(400).json({ message: 'Transaction hash required' })
    }

    const session = sessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (session.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized for this session' })
    }

    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Session already processed' })
    }

    if (session.status === 'paid') {
      return res.status(400).json({ message: 'Payment already verified for this session' })
    }

    const game = await verifyPayment(sessionId, txHash, session.betAmount, session.walletAddress)
    if (!game) {
      return res.status(400).json({ message: 'Payment verification failed. Transaction not found or amount mismatch.' })
    }

    session.status = 'paid'
    session.txHash = txHash

    res.json({
      sessionId,
      message: 'Payment verified. You can now get the result.',
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({ message: 'Failed to verify payment' })
  }
})

router.post('/result/:sessionId', authMiddleware, async (req, res) => {
  try {
    const sessionId = getParam(req, 'sessionId')
    const userId = (req as any).userId

    const session = sessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (session.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized for this session' })
    }

    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Session already processed' })
    }

    const result = await processBet(session)
    session.status = 'completed'

    let winnings = 0
    if (result.winner === 'player') {
      winnings = session.betAmount * result.multiplier
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: winnings },
          totalWins: { increment: 1 },
          winStreak: { increment: 1 },
          totalGames: { increment: 1 },
          xp: { increment: 10 },
        },
      })

      await sendWinnings(session.walletAddress, winnings, sessionId)
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: session.betAmount },
          totalLosses: { increment: 1 },
          winStreak: 0,
          totalGames: { increment: 1 },
          xp: { increment: 1 },
        },
      })
    }

    sessions.delete(sessionId)

    res.json({
      sessionId,
      result,
      betAmount: session.betAmount,
      winnings,
      netProfit: result.winner === 'player' ? winnings - session.betAmount : -session.betAmount,
    })
  } catch (error) {
    console.error('Process result error:', error)
    res.status(500).json({ message: 'Failed to process bet result' })
  }
})

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    })
    res.json({ balance: Number(user?.balance || 0) })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get balance' })
  }
})

export default router
