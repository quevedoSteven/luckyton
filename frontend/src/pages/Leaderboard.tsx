import { useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

const leaderboardData = [
  { rank: 1, name: 'CryptoKing', wagered: 12450, won: 15230, winRate: 68, level: 45, isPremium: true },
  { rank: 2, name: 'LuckyRoller', wagered: 9820, won: 11450, winRate: 64, level: 38, isPremium: true },
  { rank: 3, name: 'TONWhale', wagered: 8750, won: 9200, winRate: 61, level: 42, isPremium: true },
  { rank: 4, name: 'DiceMaster', wagered: 7200, won: 8100, winRate: 59, level: 35, isPremium: false },
  { rank: 5, name: 'CrashPro', wagered: 6500, won: 7800, winRate: 62, level: 33, isPremium: true },
  { rank: 6, name: 'FlipKing', wagered: 5800, won: 6200, winRate: 55, level: 28, isPremium: false },
  { rank: 7, name: 'HighStakes', wagered: 5200, won: 5900, winRate: 57, level: 31, isPremium: true },
  { rank: 8, name: 'LuckyTON', wagered: 4800, won: 5100, winRate: 54, level: 25, isPremium: false },
  { rank: 9, name: 'BetMaster', wagered: 4200, won: 4800, winRate: 56, level: 27, isPremium: false },
  { rank: 10, name: 'Player_7x3k', wagered: 124, won: 156, winRate: 57, level: 12, isPremium: true, isYou: true },
]

const timeframes = ['Daily', 'Weekly', 'Monthly', 'All Time']

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState('All Time')

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Leaderboard</h2>
        <p className="text-text-secondary text-sm">Top players on LuckyTON</p>
      </div>

      {/* Timeframe Tabs */}
      <Card>
        <div className="grid grid-cols-4 gap-2">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'primary' : 'secondary'}
              size="sm"
              fullWidth
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </Card>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-3 py-6">
        {/* 2nd Place */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 mx-auto mb-2 flex items-center justify-center">
            <span className="text-2xl">🥈</span>
          </div>
          <p className="font-semibold text-sm">{leaderboardData[1].name}</p>
          <p className="text-text-secondary text-xs">{leaderboardData[1].won} TON</p>
          <div className="h-24 bg-bg-secondary rounded-t-xl mt-2 flex items-center justify-center border-t-2 border-gray-400">
            <span className="text-2xl font-black text-gray-400">2</span>
          </div>
        </motion.div>

        {/* 1st Place */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-yellow-500 mx-auto mb-2 flex items-center justify-center shadow-gold">
            <span className="text-3xl">👑</span>
          </div>
          <p className="font-bold">{leaderboardData[0].name}</p>
          <p className="text-gold text-sm">{leaderboardData[0].won} TON</p>
          <div className="h-32 bg-bg-secondary rounded-t-xl mt-2 flex items-center justify-center border-t-2 border-gold">
            <span className="text-3xl font-black text-gold">1</span>
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 mx-auto mb-2 flex items-center justify-center">
            <span className="text-2xl">🥉</span>
          </div>
          <p className="font-semibold text-sm">{leaderboardData[2].name}</p>
          <p className="text-text-secondary text-xs">{leaderboardData[2].won} TON</p>
          <div className="h-16 bg-bg-secondary rounded-t-xl mt-2 flex items-center justify-center border-t-2 border-orange-600">
            <span className="text-2xl font-black text-orange-600">3</span>
          </div>
        </motion.div>
      </div>

      {/* Full Leaderboard */}
      <Card>
        <div className="space-y-2">
          {leaderboardData.slice(3).map((player, index) => (
            <motion.div
              key={player.rank}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                player.isYou ? 'bg-neon-blue/10 border border-neon-blue/20' : 'bg-bg-tertiary/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <span className="w-8 text-center font-bold text-text-secondary">
                #{player.rank}
              </span>
              <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center">
                <span className="text-sm">{player.isPremium ? '💎' : '👤'}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {player.name}
                  {player.isYou && (
                    <span className="ml-2 text-xs text-neon-blue">(You)</span>
                  )}
                </p>
                <p className="text-text-secondary text-xs">LVL {player.level}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-neon-green">{player.won} TON</p>
                <p className="text-text-secondary text-xs">{player.winRate}% WR</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}
