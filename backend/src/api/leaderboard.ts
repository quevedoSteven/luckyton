import { Router } from 'express'

const router = Router()

router.get('/global', (req, res) => {
  const timeframe = req.query.timeframe || 'all'

  res.json({
    timeframe,
    leaderboard: [
      { rank: 1, name: 'CryptoKing', wagered: 12450, won: 15230, winRate: 68, level: 45, isPremium: true },
      { rank: 2, name: 'LuckyRoller', wagered: 9820, won: 11450, winRate: 64, level: 38, isPremium: true },
      { rank: 3, name: 'TONWhale', wagered: 8750, won: 9200, winRate: 61, level: 42, isPremium: true },
    ],
  })
})

router.get('/friends', (req, res) => {
  res.json({
    leaderboard: [],
    message: 'Connect with friends to see their rankings',
  })
})

export default router
