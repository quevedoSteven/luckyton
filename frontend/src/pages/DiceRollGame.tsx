import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { useGamePlay } from '../hooks/useGamePlay'
import { useAppStore } from '../store'
import { hapticSuccess, hapticError } from '../services/telegram'
import { getWalletBalance } from '../services/ton'
import { useTonWallet } from '@tonconnect/ui-react'

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export default function DiceRollGame() {
  // -- State --
  const [betAmount, setBetAmount] = useState(0.1)
  const [isRolling, setIsRolling] = useState(false)
  const [playerRoll, setPlayerRoll] = useState<number | null>(null)
  const [opponentRoll, setOpponentRoll] = useState<number | null>(null)
  const [hasWon, setHasWon] = useState<boolean | null>(null)
  const [gameMode, setGameMode] = useState<'pvp' | 'house'>('house')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [animationTimer, setAnimationTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [balance, setBalance] = useState(0)

  const user = useAppStore((state) => state.user)
  const { playGame, isProcessing, error, clearError, hasSufficientBalance, lastResult, createSession } = useGamePlay()
  const wallet = useTonWallet()
  const setStoreBalance = useAppStore((state) => state.setBalance)

  // Fetch on-chain balance
  useEffect(() => {
    if (wallet?.account?.address) {
      getWalletBalance(wallet.account.address).then((bal) => {
        setBalance(bal)
        setStoreBalance(bal)
      })
    }
  }, [wallet?.account?.address])

  const quickBets = [0.01, 0.05, 0.1, 0.5, 1, 5]

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimer) clearTimeout(animationTimer)
    }
  }, [animationTimer])

  const handleBetChange = useCallback(  
    (newAmount: number) => {
      const maxBet = Math.min(newAmount, balance)
      if (maxBet < 0.01) {
        setBetAmount(0.01)
        return
      }
      setBetAmount(maxBet)
    },
    [balance]
  )

  const handleRoll = async () => {
    if (isRolling || isProcessing || !wallet?.account) return

    if (!hasSufficientBalance(betAmount, balance)) {
      return
    }

    setIsRolling(true)
    setPlayerRoll(null)
    setOpponentRoll(null)
    setHasWon(null)
    clearError()

    try {
      // Create the session first
      const result = await playGame('dice', betAmount)

      if (result && result.result && result.result.details) {
        const details = result.result.details
        // Show player roll after a short delay
        const timer = setTimeout(() => {
          setPlayerRoll(details.playerRoll)
          setOpponentRoll(details.houseRoll)

          const won = result.result.winner === 'player'
          setHasWon(won)

          if (won) {
            hapticSuccess()
          } else {
            hapticError()
          }

          setIsRolling(false)

          // Update balance after result comes back
          if (lastResult) {
            setBalance(lastResult.newBalance)
          }
        }, 1500)

        setAnimationTimer(timer)
      } else {
        setIsRolling(false)
      }

    } catch (error) {
      console.error('Game error:', error)
      setIsRolling(false)
    }
  }

  const canRoll = !isRolling && !isProcessing && wallet?.account?.address && balance >= 0.01 && balance >= betAmount

  return (
    <div className="p-4 space-y-6">
      {/* Game Title & Balance */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Dice Roll</h2>
        <p className="text-text-secondary text-sm">Roll higher than your opponent</p>
        <p className="text-text-secondary text-xs mt-1">
          Balance: {balance.toFixed(2)} TON
        </p>
      </div>

      {/* Balance Warning */}
      {balance < betAmount && (
        <div className="text-center p-2 rounded-lg bg-neon-red/10 border border-neon-red/30">
          <p className="text-neon-red text-sm">
            Insufficient balance. You have {balance.toFixed(2)} TON, but bet is {betAmount.toFixed(2)} TON.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-center p-2 rounded-lg bg-neon-red/10 border border-neon-red/30">
          <p className="text-neon-red text-sm">{error}</p>
        </div>
      )}

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
        {hasWon !== null && !isRolling && lastResult && (
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
                ? `You won ${lastResult.winnings.toFixed(2)} TON!`
                : playerRoll === opponentRoll
                ? "It's a tie! Bet returned."
                : 'House wins this round!'}
            </p>
            <p className="text-text-secondary text-sm mt-1">
              New Balance: {Number(lastResult.newBalance).toFixed(2)} TON
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
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              setBetAmount(isNaN(val) ? 0.01 : val)
            }}
            className="w-24 bg-bg-tertiary rounded-lg px-3 py-2 text-center font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
            min={0.01}
            step={0.01}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {quickBets.map((amount) => {
            const isDisabled = balance < amount
            return (
              <Button
                key={amount}
                variant={betAmount === amount ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleBetChange(amount)}
                disabled={isDisabled}
                className={isDisabled ? 'opacity-50' : ''}
              >
                {amount}
              </Button>
            )
          })}
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
        disabled={!canRoll}
        onClick={handleRoll}
      >
        {isProcessing ? 'Processing...' : isRolling ? 'Rolling...' : 'Roll Dice'}
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
