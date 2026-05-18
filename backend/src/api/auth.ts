import { Router } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../db/index.js'
import { verifyTonProof, extractWalletAddress } from '../engine/ton-proof.js'

const router = Router()

const ALLOWED_DOMAINS = [
  'luckyton.vercel.app',
  'localhost:3000',
  'localhost:5173',
  't.me',
]

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'your-super-secret-jwt-key-change-in-production') {
    console.warn('WARNING: Using default JWT secret. Set JWT_SECRET env var in production.')
    return 'your-super-secret-jwt-key-change-in-production'
  }
  return secret
}

router.post('/verify', async (req, res) => {
  try {
    const { walletAddress, proof, connectEvent } = req.body

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address required' })
    }

    if (!proof && !connectEvent) {
      return res.status(400).json({
        message: 'Wallet proof required. Send the TON Connect proof object to verify wallet ownership.',
      })
    }

    const proofPayload = proof || connectEvent

    const isValid = await verifyTonProof(proofPayload, ALLOWED_DOMAINS)
    if (!isValid) {
      return res.status(401).json({ message: 'Wallet proof verification failed. Cannot verify wallet ownership.' })
    }

    const rawAddress = extractWalletAddress(walletAddress)

    let user = await prisma.user.findUnique({
      where: { walletAddress: rawAddress },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: rawAddress,
          username: `Player_${rawAddress.slice(-6)}`,
        },
      })
    }

    const token = jwt.sign(
      { walletAddress: rawAddress, id: user.id },
      getJwtSecret(),
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        balance: Number(user.balance),
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
