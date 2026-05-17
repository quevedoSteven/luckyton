import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

const games = [
  {
    id: 'coinflip',
    name: 'Coin Flip',
    description: 'Heads or Tails — 1v1 classic',
    icon: '🪙',
    gradient: 'from-neon-blue to-neon-purple',
    players: 128,
    path: '/coinflip',
  },
  {
    id: 'dice',
    name: 'Dice Roll',
    description: 'Roll higher, win bigger',
    icon: '🎲',
    gradient: 'from-neon-pink to-neon-purple',
    players: 84,
    path: '/dice',
  },
  {
    id: 'crash',
    name: 'Crash',
    description: 'Cash out before it crashes!',
    icon: '📈',
    gradient: 'from-neon-green to-neon-blue',
    players: 256,
    path: '/crash',
  },
  {
    id: 'numberguess',
    name: 'Number Guess',
    description: 'Guess the number, win 10x',
    icon: '🔢',
    gradient: 'from-gold to-neon-pink',
    players: 67,
    path: '/numberguess',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Lobby() {
  return (
    <div className="p-4 space-y-6">
      {/* Hero Section */}
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-4xl font-black mb-2"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{
            background: 'linear-gradient(90deg, #00D4FF, #8B5CF6, #EC4899, #00D4FF)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Play. Bet. Win.
        </motion.h1>
        <p className="text-text-secondary text-lg">
          Choose your game and test your luck
        </p>
      </motion.div>

      {/* Games Grid */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {games.map((game) => (
          <motion.div key={game.id} variants={item}>
            <Link to={game.path}>
              <Card glow="blue" className="h-full">
                <div className="flex flex-col items-center text-center py-4">
                  <motion.div
                    className="text-5xl mb-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {game.icon}
                  </motion.div>
                  <h3 className="font-bold text-lg mb-1">{game.name}</h3>
                  <p className="text-text-secondary text-xs mb-3">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    {game.players} playing
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { label: 'Total Players', value: '12.4K' },
          { label: 'Games Today', value: '8,234' },
          { label: 'TON Wagered', value: '45.2K' },
        ].map((stat) => (
          <Card key={stat.label} className="text-center py-3">
            <p className="text-neon-blue font-bold text-lg">{stat.value}</p>
            <p className="text-text-secondary text-xs">{stat.label}</p>
          </Card>
        ))}
      </motion.div>

      {/* Provably Fair Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card glow="green" className="bg-gradient-to-r from-neon-green/10 to-neon-blue/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="font-semibold text-neon-green">Provably Fair</p>
              <p className="text-text-secondary text-xs">
                Every game result is verifiable on-chain
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
