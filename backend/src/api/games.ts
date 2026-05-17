import { Router } from 'express'

const router = Router()

router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20
  const offset = parseInt(req.query.offset as string) || 0

  res.json({
    games: [
      {
        id: 'game_1',
        type: 'coinflip',
        result: 'win',
        betAmount: 0.5,
        winnings: 0.985,
        createdAt: '2026-05-17T10:30:00Z',
      },
      {
        id: 'game_2',
        type: 'crash',
        result: 'loss',
        betAmount: 1.0,
        winnings: 0,
        createdAt: '2026-05-17T10:15:00Z',
      },
    ],
    total: 247,
  })
})

router.get('/:id', (req, res) => {
  res.json({
    id: req.params.id,
    type: 'coinflip',
    status: 'finished',
    result: 'win',
    provablyFair: {
      serverSeedHash: 'abc123...',
      clientSeed: 'client_seed_here',
      nonce: 42,
      revealedServerSeed: 'server_seed_here',
    },
  })
})

router.get('/:id/verify', (req, res) => {
  res.json({
    gameId: req.params.id,
    verifiable: true,
    instructions: 'Use the server seed, client seed, and nonce to independently verify the result.',
  })
})

export default router
