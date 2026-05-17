import { Router } from 'express'

const router = Router()

router.get('/subscription', (req, res) => {
  res.json({
    isPremium: false,
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
})

router.post('/subscribe', (req, res) => {
  res.json({
    success: true,
    paymentRequest: {
      amount: 0.5,
      currency: 'TON',
      description: 'LuckyTON Premium - Monthly Subscription',
      validUntil: new Date(Date.now() + 600000).toISOString(),
    },
  })
})

router.get('/skins', (req, res) => {
  res.json({
    skins: [
      { id: '1', name: 'Golden Coin', type: 'coin', price: 0.5, isPremium: false },
      { id: '2', name: 'Diamond Coin', type: 'coin', price: 2.5, isPremium: true },
      { id: '3', name: 'Neon Dice', type: 'dice', price: 0.3, isPremium: false },
      { id: '4', name: 'Fire Dice', type: 'dice', price: 1.5, isPremium: true },
    ],
  })
})

router.post('/skins/:id/purchase', (req, res) => {
  res.json({
    success: true,
    skinId: req.params.id,
    message: 'Skin purchased successfully',
  })
})

export default router
