import { Router } from 'express'

const router = Router()

router.get('/me', (req, res) => {
  res.json({
    id: 'user_demo',
    walletAddress: '0x1234...4f2a',
    username: 'Player_7x3k',
    balance: 12.45,
    totalGames: 247,
    totalWins: 142,
    totalLosses: 105,
    winStreak: 3,
    bestWinStreak: 7,
    level: 12,
    xp: 2450,
    isPremium: true,
    premiumExpiry: '2026-06-17T00:00:00Z',
  })
})

router.patch('/me', (req, res) => {
  const { username, avatar } = req.body
  res.json({ success: true, username, avatar })
})

router.get('/stats', (req, res) => {
  res.json({
    totalGames: 247,
    wins: 142,
    losses: 105,
    winRate: 57.5,
    totalWagered: 124.5,
    totalWon: 156.8,
    profit: 32.3,
    byGame: {
      coinflip: { games: 89, wins: 52, winRate: 58.4 },
      dice: { games: 67, wins: 38, winRate: 56.7 },
      crash: { games: 56, wins: 31, winRate: 55.4 },
      numberguess: { games: 35, wins: 21, winRate: 60 },
    },
  })
})

export default router
