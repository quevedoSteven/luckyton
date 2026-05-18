import { Router } from 'express'
import prisma from '../db/index.js'

const router = Router()

router.get('/global', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'all'

    const users = await prisma.user.findMany({
      where: {
        totalGames: { gt: 0 },
      },
      orderBy: [
        { totalWins: 'desc' },
        { xp: 'desc' },
      ],
      take: 100,
      select: {
        id: true,
        walletAddress: true,
        username: true,
        totalGames: true,
        totalWins: true,
        totalLosses: true,
        level: true,
        xp: true,
        isPremium: true,
      },
    })

    const leaderboard = users.map((user, index) => {
      const winRate = user.totalGames > 0
        ? Math.round((user.totalWins / user.totalGames) * 100)
        : 0

      return {
        rank: index + 1,
        userId: user.id,
        walletAddress: user.walletAddress,
        username: user.username || `Player_${user.walletAddress.slice(-6)}`,
        totalWagered: 0,
        totalWon: 0,
        winRate,
        gamesPlayed: user.totalGames,
        level: user.level,
        isPremium: user.isPremium,
      }
    })

    res.json({ timeframe, leaderboard })
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ message: 'Failed to get leaderboard' })
  }
})

router.get('/friends', async (req, res) => {
  res.json({
    leaderboard: [],
    message: 'Connect with friends to see their rankings',
  })
})

export default router
