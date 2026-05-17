import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import prisma from '../db/index.js'
import { generateDiceRoll, generateCoinFlip, createProvablyFairData } from '../engine/provably-fair.js'

const router = Router()

interface BetSession {
  id: string
  type: string
  betAmount: number
  choice?: string
  userId: string
  walletAddress: string
  provablyFair: ReturnType<typeof createProvablyFairData>
  status: 'pending' | 'completed'
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
        details: { playerRoll, houseRoll, isWin, houseEdge, sessionId: session.id }
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
        details: { result, choice: session.choice, isWin, houseEdge, sessionId: session.id }
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

    const balance = Number(user.balance)

    if (balance < betAmount) {
      return res.status(400).json({
        message: `Insufficient balance. You have ${balance.toFixed(2)} TON, but tried to bet ${betAmount} TON.`
      })
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

    // Deduct balance immediately on bet creation
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: betAmount } }
    })

    // Record the bet transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'bet',
        amount: betAmount,
        status: 'confirmed',
      }
    })

    sessions.set(id, session)

    res.json({
      sessionId: id,
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed,
      message: `${betAmount} TON deducted from balance. Good luck!`,
    })
  } catch (error) {
    console.error('Create bet error:', error)
    res.status(500).json({ message: 'Failed to create bet' })
  }
})

router.post('/result/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params
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
      // Credit winnings
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: winnings },
          totalWins: { increment: 1 },
          winStreak: { increment: 1 },
          totalGames: { increment: 1 },
        }
      })

      await prisma.transaction.create({
        data: {
          userId,
          type: 'win',
          amount: winnings,
          status: 'confirmed',
        }
      })
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalLosses: { increment: 1 },
          winStreak: 0,
          totalGames: { increment: 1 },
        }
      })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: result.winner === 'player' ? 10 : 1 }
      }
    })

    // Clean up session
    sessions.delete(sessionId)

    res.json({
      sessionId,
      result,
      betAmount: session.betAmount,
      winnings,
      netProfit: result.winner === 'player' ? winnings - session.betAmount : -session.betAmount,
      newBalance: (await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } }))?.balance,
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
      select: { balance: true }
    })
    res.json({ balance: Number(user?.balance || 0) })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get balance' })
  }
})

export default router
