import { Router } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js'
import prisma from '../db/index.js'

const router = Router()

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = parseInt(req.query.offset as string) || 0
    const userId = (req as any).userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const gamePlayers = await prisma.gamePlayer.findMany({
      where: { walletAddress: user.walletAddress },
      include: {
        game: {
          include: {
            players: {
              include: { user: { select: { username: true, walletAddress: true } } },
            },
          },
        },
      },
      orderBy: { game: { createdAt: 'desc' } },
      take: limit,
      skip: offset,
    })

    const games = gamePlayers.map((gp) => ({
      id: gp.game.id,
      type: gp.game.type,
      result: gp.isWinner ? 'win' : 'loss',
      betAmount: Number(gp.game.betAmount),
      winnings: gp.isWinner ? Number(gp.game.pot) : 0,
      createdAt: gp.game.createdAt,
    }))

    const total = await prisma.gamePlayer.count({
      where: { walletAddress: user.walletAddress },
    })

    res.json({ games, total })
  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({ message: 'Failed to get game history' })
  }
})

router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const gameId = String(req.params.id)

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: { user: { select: { username: true, walletAddress: true } } },
        },
      },
    })

    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }

    res.json({
      id: game.id,
      type: game.type,
      status: game.status,
      betAmount: Number(game.betAmount),
      pot: Number(game.pot),
      result: game.result,
      players: game.players,
      provablyFair: {
        serverSeedHash: game.serverSeedHash,
        clientSeed: game.clientSeed,
        nonce: game.nonce,
        revealedServerSeed: game.revealedSeed,
      },
      createdAt: game.createdAt,
      finishedAt: game.finishedAt,
    })
  } catch (error) {
    console.error('Get game error:', error)
    res.status(500).json({ message: 'Failed to get game' })
  }
})

router.get('/:id/verify', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const gameId = String(req.params.id)

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }

    res.json({
      gameId,
      verifiable: !!game.revealedSeed,
      serverSeedHash: game.serverSeedHash,
      clientSeed: game.clientSeed,
      nonce: game.nonce,
      revealedServerSeed: game.revealedSeed,
      type: game.type,
      result: game.result,
    })
  } catch (error) {
    console.error('Verify game error:', error)
    res.status(500).json({ message: 'Failed to verify game' })
  }
})

export default router
