import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

const achievements = [
  { id: '1', name: 'First Win', description: 'Win your first game', icon: '🏆', unlocked: true },
  { id: '2', name: 'High Roller', description: 'Bet 10 TON in one game', icon: '💎', unlocked: true },
  { id: '3', name: 'Lucky Streak', description: 'Win 5 games in a row', icon: '🔥', unlocked: false },
  { id: '4', name: 'Crash Master', description: 'Cash out at 10x+', icon: '📈', unlocked: false },
  { id: '5', name: 'Centurion', description: 'Play 100 games', icon: '💯', unlocked: false },
  { id: '6', name: 'Whale', description: 'Wager 1000 TON total', icon: '🐋', unlocked: false },
]

export default function Profile() {
  const stats = {
    totalGames: 247,
    wins: 142,
    losses: 105,
    winRate: 57.5,
    totalWagered: 124.5,
    totalWon: 156.8,
    profit: 32.3,
    bestStreak: 7,
    level: 12,
    xp: 2450,
    xpToNext: 3000,
  }

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple mx-auto mb-3 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-4xl">👤</span>
        </motion.div>
        <h2 className="text-2xl font-bold">Player_7x3k</h2>
        <p className="text-text-secondary text-sm">0x...4f2a</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="px-2 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
            LVL {stats.level}
          </span>
          <span className="px-2 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-bold">
            Premium
          </span>
        </div>
      </div>

      {/* XP Bar */}
      <Card>
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>XP Progress</span>
          <span>{stats.xp} / {stats.xpToNext}</span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.xp / stats.xpToNext) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-neon-blue">{stats.totalGames}</p>
          <p className="text-text-secondary text-xs">Games Played</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-neon-green">{stats.winRate}%</p>
          <p className="text-text-secondary text-xs">Win Rate</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-neon-purple">{stats.totalWagered}</p>
          <p className="text-text-secondary text-xs">TON Wagered</p>
        </Card>
        <Card className="text-center">
          <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
            {stats.profit >= 0 ? '+' : ''}{stats.profit}
          </p>
          <p className="text-text-secondary text-xs">Net Profit</p>
        </Card>
      </div>

      {/* Win/Loss Bar */}
      <Card>
        <p className="font-semibold mb-3 text-center">Win / Loss</p>
        <div className="flex h-4 rounded-full overflow-hidden">
          <motion.div
            className="bg-neon-green"
            initial={{ width: 0 }}
            animate={{ width: `${stats.winRate}%` }}
          />
          <motion.div
            className="bg-neon-red"
            initial={{ width: 0 }}
            animate={{ width: `${100 - stats.winRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-secondary mt-2">
          <span>{stats.wins} Wins</span>
          <span>{stats.losses} Losses</span>
        </div>
      </Card>

      {/* Achievements */}
      <Card>
        <p className="font-semibold mb-3">Achievements</p>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`text-center p-3 rounded-xl ${
                achievement.unlocked
                  ? 'bg-bg-tertiary'
                  : 'bg-bg-tertiary/50 opacity-50'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <p className="text-xs font-semibold mt-1">{achievement.name}</p>
              <p className="text-xs text-text-secondary">{achievement.description}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Best Streak */}
      <Card className="text-center">
        <p className="text-text-secondary text-sm">Best Win Streak</p>
        <p className="text-3xl font-bold text-neon-pink">{stats.bestStreak} 🔥</p>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button variant="secondary" fullWidth>
          Transaction History
        </Button>
        <Button variant="secondary" fullWidth>
          Verify Fairness
        </Button>
        <Button variant="danger" fullWidth>
          Disconnect Wallet
        </Button>
      </div>
    </div>
  )
}
