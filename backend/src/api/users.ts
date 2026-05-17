import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import prisma from '../db/index.js'

const router = Router()

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      balance: Number(user.balance),
      totalGames: user.totalGames,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      winStreak: user.winStreak,
      bestWinStreak: user.bestWinStreak,
      level: user.level,
      xp: user.xp,
      isPremium: user.isPremium,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Failed to get profile' })
  }
})

router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { username, avatar } = req.body
    const userId = (req as any).userId

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { username, avatar }
    })

    res.json({ success: true, username: updated.username, avatar: updated.avatar })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        transactions: true,
        _count: { select: { gamePlayers: true } }
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const totalWagered = user.transactions
      .filter(t => t.type === 'bet')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalWon = user.transactions
      .filter(t => t.type === 'win')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    res.json({
      totalGames: user.totalGames,
      wins: user.totalWins,
      losses: user.totalLosses,
      winRate: user.totalGames > 0 ? (user.totalWins / user.totalGames) * 100 : 0,
      totalWagered,
      totalWon,
      profit: totalWon - totalWagered,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'Failed to get stats' })
  }
})

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
      select: { balance: true }
    })

    res.json({ balance: Number(user?.balance || 0) })
  } catch (error) {
    console.error('Get balance error:', error)
    res.status(500).json({ message: 'Failed to get balance' })
  }
})

export default router
