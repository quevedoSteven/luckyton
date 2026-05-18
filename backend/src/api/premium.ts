import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import prisma from '../db/index.js'

const router = Router()

router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiry: true },
    })

    res.json({
      isPremium: user?.isPremium || false,
      premiumExpiry: user?.premiumExpiry || null,
      plan: {
        price: 0.5,
        currency: 'TON',
        interval: 'monthly',
        benefits: [
          'Higher bet limits (up to 50 TON)',
          'All 50+ skins unlocked',
          'VIP game rooms access',
          'Advanced statistics',
          'Gold profile badge',
          'Ad-free experience',
          'Enhanced daily bonus (0.05 TON)',
        ],
      },
    })
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({ message: 'Failed to get subscription' })
  }
})

router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      paymentRequest: {
        amount: 0.5,
        currency: 'TON',
        description: 'LuckyTON Premium - Monthly Subscription',
        validUntil: new Date(Date.now() + 600000).toISOString(),
      },
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    res.status(500).json({ message: 'Failed to process subscription' })
  }
})

router.get('/skins', authMiddleware, async (req, res) => {
  res.json({
    skins: [
      { id: '1', name: 'Golden Coin', type: 'coin', price: 0.5, isPremium: false, owned: false, preview: '' },
      { id: '2', name: 'Diamond Coin', type: 'coin', price: 2.5, isPremium: true, owned: false, preview: '' },
      { id: '3', name: 'Neon Dice', type: 'dice', price: 0.3, isPremium: false, owned: false, preview: '' },
      { id: '4', name: 'Fire Dice', type: 'dice', price: 1.5, isPremium: true, owned: false, preview: '' },
    ],
  })
})

router.post('/skins/:id/purchase', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId

    res.json({
      success: true,
      skinId: req.params.id,
      message: 'Skin purchased successfully',
    })
  } catch (error) {
    console.error('Skin purchase error:', error)
    res.status(500).json({ message: 'Failed to purchase skin' })
  }
})

export default router
