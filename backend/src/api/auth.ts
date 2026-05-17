import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/verify', async (req, res) => {
  try {
    const { walletAddress, signature } = req.body

    if (!walletAddress || !signature) {
      return res.status(400).json({ message: 'Wallet address and signature required' })
    }

    const token = jwt.sign(
      { walletAddress, id: `user_${walletAddress.slice(-8)}` },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: `user_${walletAddress.slice(-8)}`,
        walletAddress,
        balance: 0,
        isPremium: false,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Authentication failed' })
  }
})

export default router
