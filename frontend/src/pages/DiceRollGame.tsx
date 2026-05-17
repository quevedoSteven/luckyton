import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { hapticSuccess, hapticError } from '../services/telegram'

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export default function DiceRollGame() {
  const [betAmount, setBetAmount] = useState(0.1)
  const [isRolling, setIsRolling] = useState(false)
  const [playerRoll, setPlayerRoll] = useState<number | null>(null)
  const [opponentRoll, setOpponentRoll] = useState<number | null>(null)
  const [hasWon, setHasWon] = useState<boolean | null>(null)
  const [gameMode, setGameMode] = useState<'pvp' | 'house'>('house')

  const handleRoll = () => {
    if (isRolling) return
    setIsRolling(true)
    setPlayerRoll(null)
    setOpponentRoll(null)
    setHasWon(null)

    setTimeout(() => {
      const pRoll = Math.floor(Math.random() * 6) + 1
      const oRoll = gameMode === 'house' ? Math.floor(Math.random() * 6) + 1 : Math.floor(Math.random() * 6) + 1
      setPlayerRoll(pRoll)
      setOpponentRoll(oRoll)
      const won = pRoll > oRoll
      setHasWon(won)
      if (won) hapticSuccess()
      else hapticError()
      setIsRolling(false)
    }, 1500)
  }

  const quickBets = [0.01, 0.05, 0.1, 0.5, 1, 5]

  return (
    <div className="p-4 space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Dice Roll</h2>
        <p className="text-text-secondary text-sm">Roll higher than your opponent</p>
      </div>

      {/* Game Mode Toggle */}
      <Card>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={gameMode === 'pvp' ? 'primary' : 'secondary'}
            size="sm"
            fullWidth
            onClick={() => setGameMode('pvp')}
          >
            👥 vs Player
          </Button>
          <Button
            variant={gameMode === 'house' ? 'primary' : 'secondary'}
            size="sm"
            fullWidth
            onClick={() => setGameMode('house')}
          >
            🏠 vs House
          </Button>
        </div>
      </Card>

      {/* Dice Display */}
      <div className="flex justify-center items-center gap-8 py-8">
        {/* Player Dice */}
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-3">You</p>
          <AnimatePresence mode="wait">
            {isRolling ? (
              <motion.div
                key="rolling-player"
                className="w-24 h-24 rounded-2xl bg-bg-tertiary border-2 border-neon-blue/30 flex items-center justify-center"
                animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: 0 }}
              >
                <span className="text-4xl">🎲</span>
              </motion.div>
            ) : playerRoll ? (
              <motion.div
                key="result-player"
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                style={{
                  background: hasWon
                    ? 'linear-gradient(135deg, #10B981, #00D4FF)'
                    : 'linear-gradient(135deg, #1F2937, #374151)',
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                {diceFaces[playerRoll - 1]}
              </motion.div>
            ) : (
              <motion.div
                key="idle-player"
                className="w-24 h-24 rounded-2xl bg-bg-tertiary border-2 border-white/10 flex items-center justify-center"
              >
                <span className="text-4xl opacity-30">🎲</span>
              </motion.div>
            )}
          </AnimatePresence>
          {playerRoll && (
            <p className="text-xl font-bold mt-2">{playerRoll}</p>
          )}
        </div>

        {/* VS */}
        <div className="text-2xl font-black text-neon-purple">VS</div>

        {/* Opponent Dice */}
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-3">
            {gameMode === 'house' ? 'House' : 'Opponent'}
          </p>
          <AnimatePresence mode="wait">
            {isRolling ? (
              <motion.div
                key="rolling-opponent"
                className="w-24 h-24 rounded-2xl bg-bg-tertiary border-2 border-neon-pink/30 flex items-center justify-center"
                animate={{ rotate: [0, -360], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: 0 }}
              >
                <span className="text-4xl">🎲</span>
              </motion.div>
            ) : opponentRoll ? (
              <motion.div
                key="result-opponent"
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                style={{
                  background: !hasWon
                    ? 'linear-gradient(135deg, #EF4444, #EC4899)'
                    : 'linear-gradient(135deg, #1F2937, #374151)',
                }}
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              >
                {diceFaces[opponentRoll - 1]}
              </motion.div>
            ) : (
              <motion.div
                key="idle-opponent"
                className="w-24 h-24 rounded-2xl bg-bg-tertiary border-2 border-white/10 flex items-center justify-center"
              >
                <span className="text-4xl opacity-30">🎲</span>
              </motion.div>
            )}
          </AnimatePresence>
          {opponentRoll && (
            <p className="text-xl font-bold mt-2">{opponentRoll}</p>
          )}
        </div>
      </div>

      {/* Result Message */}
      <AnimatePresence>
        {hasWon !== null && !isRolling && (
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
              {hasWon
                ? `You won ${(betAmount * 1.97).toFixed(2)} TON!`
                : playerRoll === opponentRoll
                ? "It's a tie! Bet returned."
                : 'House wins this round!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
        <p className="text-text-secondary text-sm">Potential Win</p>
        <p className="text-2xl font-bold text-neon-green">
          {(betAmount * 1.97).toFixed(2)} TON
        </p>
      </Card>

      {/* Roll Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={isRolling}
        onClick={handleRoll}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
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
