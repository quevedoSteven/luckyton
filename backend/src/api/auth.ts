import { Router } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../db/index.js'

const router = Router()

router.post('/verify', async (req, res) => {
  try {
    const { walletAddress } = req.body

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address required' })
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          username: `Player_${walletAddress.slice(-6)}`,
        }
      })
    }

    const token = jwt.sign(
      { walletAddress, id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        balance: user.balance,
        isPremium: user.isPremium,
        totalGames: user.totalGames,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        level: user.level,
        xp: user.xp,
      },
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ message: 'Authentication failed' })
  }
})

export default router
