import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const achievements = await prisma.achievement.createMany({
    data: [
      { name: 'First Win', description: 'Win your first game', icon: '🏆' },
      { name: 'High Roller', description: 'Bet 10 TON in one game', icon: '💎' },
      { name: 'Lucky Streak', description: 'Win 5 games in a row', icon: '🔥' },
      { name: 'Crash Master', description: 'Cash out at 10x+', icon: '📈' },
      { name: 'Centurion', description: 'Play 100 games', icon: '💯' },
      { name: 'Whale', description: 'Wager 1000 TON total', icon: '🐋' },
      { name: 'Sharpshooter', description: 'Exact number guess', icon: '🎯' },
      { name: 'Double Down', description: 'Win 2 games simultaneously', icon: '⚡' },
    ],
    skipDuplicates: true,
  })
  console.log(`✅ Created ${achievements.count} achievements`)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { walletAddress: '0xTEST_USER_1' },
      update: {},
      create: {
        walletAddress: '0xTEST_USER_1',
        username: 'CryptoKing',
        balance: 124.5,
        totalGames: 450,
        totalWins: 306,
        totalLosses: 144,
        winStreak: 3,
        bestWinStreak: 12,
        level: 45,
        xp: 12450,
        isPremium: true,
        premiumExpiry: new Date('2026-12-31'),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xTEST_USER_2' },
      update: {},
      create: {
        walletAddress: '0xTEST_USER_2',
        username: 'LuckyRoller',
        balance: 89.2,
        totalGames: 320,
        totalWins: 205,
        totalLosses: 115,
        winStreak: 1,
        bestWinStreak: 8,
        level: 38,
        xp: 9820,
        isPremium: true,
        premiumExpiry: new Date('2026-11-30'),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xTEST_USER_3' },
      update: {},
      create: {
        walletAddress: '0xTEST_USER_3',
        username: 'TONWhale',
        balance: 200.0,
        totalGames: 510,
        totalWins: 311,
        totalLosses: 199,
        winStreak: 0,
        bestWinStreak: 15,
        level: 42,
        xp: 11200,
        isPremium: true,
        premiumExpiry: new Date('2027-01-15'),
      },
    }),
  ])
  console.log(`✅ Created ${users.length} test users`)

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
