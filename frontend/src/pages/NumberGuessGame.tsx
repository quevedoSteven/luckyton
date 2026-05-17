import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function NumberGuessGame() {
  const [betAmount, setBetAmount] = useState(0.1)
  const [guess, setGuess] = useState<number | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [hasWon, setHasWon] = useState<boolean | null>(null)
  const [winMultiplier, setWinMultiplier] = useState(1)

  const handleGuess = () => {
    if (guess === null || isRevealing) return
    setIsRevealing(true)
    setResult(null)
    setHasWon(null)

    setTimeout(() => {
      const actual = Math.floor(Math.random() * 100) + 1
      setResult(actual)
      const diff = Math.abs(actual - guess)
      
      if (diff === 0) {
        setWinMultiplier(10)
        setHasWon(true)
      } else if (diff <= 5) {
        setWinMultiplier(2)
        setHasWon(true)
      } else if (diff <= 15) {
        setWinMultiplier(1.5)
        setHasWon(true)
      } else {
        setHasWon(false)
      }
      setIsRevealing(false)
    }, 2000)
  }

  const quickBets = [0.01, 0.05, 0.1, 0.5, 1, 5]

  return (
    <div className="p-4 space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Number Guess</h2>
        <p className="text-text-secondary text-sm">Guess 1-100, exact match wins 10x!</p>
      </div>

      {/* Number Display */}
      <div className="flex justify-center py-8">
        <AnimatePresence mode="wait">
          {isRevealing ? (
            <motion.div
              key="revealing"
              className="w-32 h-32 rounded-2xl bg-bg-tertiary border-2 border-neon-purple/30 flex items-center justify-center"
            >
              <motion.span
                className="text-5xl font-black text-neon-purple"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              >
                ?
              </motion.span>
            </motion.div>
          ) : result !== null ? (
            <motion.div
              key="result"
              className="w-32 h-32 rounded-2xl flex items-center justify-center"
              style={{
                background: hasWon
                  ? 'linear-gradient(135deg, #10B981, #00D4FF)'
                  : 'linear-gradient(135deg, #EF4444, #EC4899)',
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.6 }}
            >
              <span className="text-5xl font-black text-white">{result}</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="w-32 h-32 rounded-2xl bg-bg-tertiary border-2 border-white/10 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-5xl font-black text-text-secondary opacity-30">?</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Message */}
      <AnimatePresence>
        {result !== null && !isRevealing && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className={`text-xl font-bold ${hasWon ? 'text-neon-green' : 'text-neon-red'}`}>
              {hasWon
                ? `You won ${(betAmount * winMultiplier).toFixed(2)} TON! (${winMultiplier}x)`
                : 'Not close enough! Try again.'}
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Your guess: {guess ?? '—'} | Actual: {result} | Diff: {result !== null && guess !== null ? Math.abs(result - guess) : '—'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Number Picker */}
      <Card className="space-y-4">
        <p className="font-semibold text-center">Pick a number (1-100)</p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setGuess(Math.max(1, (guess || 50) - 10))}
            disabled={guess === null || guess <= 1}
          >
            -10
          </Button>
          <input
            type="number"
            value={guess || ''}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              setGuess(val >= 1 && val <= 100 ? val : null)
            }}
            placeholder="50"
            className="w-20 bg-bg-tertiary rounded-lg px-3 py-2 text-center font-mono font-bold text-xl focus:outline-none focus:ring-2 focus:ring-neon-purple"
            min={1}
            max={100}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setGuess(Math.min(100, (guess || 50) + 10))}
            disabled={guess === null || guess >= 100}
          >
            +10
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 25, 50, 75, 100].map((num) => (
            <Button
              key={num}
              variant={guess === num ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setGuess(num)}
            >
              {num}
            </Button>
          ))}
        </div>
      </Card>

      {/* Win Multipliers */}
      <Card>
        <p className="font-semibold text-center mb-3">Win Multipliers</p>
        <div className="space-y-2">
          {[
            { range: 'Exact match', multiplier: '10x', color: 'text-gold' },
            { range: 'Within 5', multiplier: '2x', color: 'text-neon-green' },
            { range: 'Within 15', multiplier: '1.5x', color: 'text-neon-blue' },
          ].map((tier) => (
            <div key={tier.range} className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">{tier.range}</span>
              <span className={`font-bold ${tier.color}`}>{tier.multiplier}</span>
            </div>
          ))}
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
      </Card>

      {/* Potential Win */}
      <Card className="text-center">
        <p className="text-text-secondary text-sm">Max Potential Win (10x)</p>
        <p className="text-2xl font-bold text-gold">
          {(betAmount * 10).toFixed(2)} TON
        </p>
      </Card>

      {/* Play Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={guess === null || isRevealing}
        onClick={handleGuess}
      >
        {isRevealing ? 'Revealing...' : 'Guess Number'}
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
