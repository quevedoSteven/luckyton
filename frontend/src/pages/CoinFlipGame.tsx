import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { hapticSuccess, hapticError } from '../services/telegram'

type Choice = 'heads' | 'tails' | null

export default function CoinFlipGame() {
  const [choice, setChoice] = useState<Choice>(null)
  const [betAmount, setBetAmount] = useState(0.1)
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [hasWon, setHasWon] = useState<boolean | null>(null)

  const handleFlip = () => {
    if (!choice || isFlipping) return
    setIsFlipping(true)
    setResult(null)
    setHasWon(null)

    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'heads' : 'tails'
      setResult(outcome)
      const won = outcome === choice
      setHasWon(won)
      if (won) hapticSuccess()
      else hapticError()
      setIsFlipping(false)
    }, 2000)
  }

  const quickBets = [0.01, 0.05, 0.1, 0.5, 1, 5]

  return (
    <div className="p-4 space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Coin Flip</h2>
        <p className="text-text-secondary text-sm">Pick a side, flip the coin</p>
      </div>

      {/* Coin Animation */}
      <div className="flex justify-center py-8">
        <AnimatePresence mode="wait">
          {isFlipping ? (
            <motion.div
              key="flipping"
              className="w-40 h-40 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center"
              animate={{ rotateY: 3600 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span className="text-6xl">🪙</span>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              className="w-40 h-40 rounded-full flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: hasWon
                  ? 'linear-gradient(135deg, #10B981, #00D4FF)'
                  : 'linear-gradient(135deg, #EF4444, #EC4899)',
              }}
            >
              <span className="text-6xl">{result === 'heads' ? '👑' : '🌙'}</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="w-40 h-40 rounded-full bg-bg-tertiary border-2 border-white/10 flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-6xl opacity-50">🪙</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Message */}
      <AnimatePresence>
        {result && !isFlipping && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              className={`text-xl font-bold ${
                hasWon ? 'text-neon-green' : 'text-neon-red'
              }`}
            >
              {hasWon ? `You won ${(betAmount * 1.97).toFixed(2)} TON!` : 'Better luck next time!'}
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Result: {result === 'heads' ? '👑 Heads' : '🌙 Tails'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choice Selection */}
      <Card className="space-y-4">
        <p className="font-semibold text-center">Choose your side</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={choice === 'heads' ? 'primary' : 'secondary'}
            fullWidth
            onClick={() => setChoice('heads')}
          >
            👑 Heads
          </Button>
          <Button
            variant={choice === 'tails' ? 'primary' : 'secondary'}
            fullWidth
            onClick={() => setChoice('tails')}
          >
            🌙 Tails
          </Button>
        </div>
      </Card>

      {/* Bet Amount */}
      <Card className="space-y-4">
        <p className="font-semibold text-center">Bet Amount</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-text-secondary text-sm">TON</span>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
            className="w-24 bg-bg-tertiary rounded-lg px-3 py-2 text-center font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
            min={0.01}
            max={10}
            step={0.01}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {quickBets.map((amount) => (
            <Button
              key={amount}
              variant={betAmount === amount ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setBetAmount(amount)}
            >
              {amount}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" fullWidth onClick={() => setBetAmount(0.01)}>
            Min
          </Button>
          <Button variant="secondary" size="sm" fullWidth onClick={() => setBetAmount(10)}>
            Max
          </Button>
        </div>
      </Card>

      {/* Potential Win */}
      <Card className="text-center">
        <p className="text-text-secondary text-sm">Potential Win</p>
        <p className="text-2xl font-bold text-neon-green">
          {(betAmount * 1.97).toFixed(2)} TON
        </p>
        <p className="text-text-secondary text-xs mt-1">
          House fee: 3%
        </p>
      </Card>

      {/* Play Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!choice || isFlipping}
        onClick={handleFlip}
      >
        {isFlipping ? 'Flipping...' : 'Flip Coin'}
      </Button>

      {/* Provably Fair */}
      <div className="text-center">
        <button className="text-text-secondary text-xs hover:text-neon-blue transition-colors">
          🔐 Provably Fair — Verify this game
        </button>
      </div>
    </div>
  )
}
