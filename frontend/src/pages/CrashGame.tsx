import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { useGamePlay } from '../hooks/useGamePlay'
import { useAppStore } from '../store'
import { hapticSuccess, hapticError } from '../services/telegram'
import { useTonWallet } from '@tonconnect/ui-react'

export default function CrashGame() {
  const [betAmount, setBetAmount] = useState(0.1)
  const [multiplier, setMultiplier] = useState(1.0)
  const [isRunning, setIsRunning] = useState(false)
  const [hasCrashed, setHasCrashed] = useState(false)
  const [hasBet, setHasBet] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashOutMultiplier, setCashOutMultiplier] = useState<number | null>(null)
  const [crashPoint, setCrashPoint] = useState(0)
  const [winnings, setWinnings] = useState(0)
  const [hasWon, setHasWon] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const balance = useAppStore((state) => state.balance)
  const setBalance = useAppStore((state) => state.setBalance)
  const { playGame, isProcessing, error: gameError, getBalance } = useGamePlay()
  const wallet = useTonWallet()

  const quickBets = [0.01, 0.05, 0.1, 0.5, 1, 5]

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animationRef])

  const generateCrashPoint = () => {
    const e = Math.pow(2, 32)
    const hashInt = Math.floor(Math.random() * e)
    const point = Math.floor((100 * e - hashInt) / (e - hashInt)) / 100
    return Math.max(1.01, Math.min(point, 100))
  }

  const startGame = async () => {
    if (isRunning || isProcessing || !wallet?.account?.address) return

    if (balance < betAmount) {
      setError('Insufficient balance')
      return
    }

    // Place the bet on backend
    const result = await playGame('crash', betAmount)
    if (!result) {
      setError('Failed to place bet')
      return
    }

    const point = generateCrashPoint()
    setCrashPoint(point)
    setMultiplier(1.0)
    setIsRunning(true)
    setHasCrashed(false)
    setCashedOut(false)
    setCashOutMultiplier(null)
    setHasWon(null)
    setWinnings(0)
    setError(null)
    setHasBet(true)
    startTimeRef.current = Date.now()

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const newMultiplier = Math.min(Math.pow(Math.E, 0.07 * elapsed * elapsed), 1000)

      if (newMultiplier >= point) {
        setMultiplier(point)
        setIsRunning(false)
        setHasCrashed(true)
        setHasWon(false)
        if (!cashedOut) {
          hapticError()
          setWinnings(0)
        }
        return
      }

      setMultiplier(newMultiplier)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const handleCashOut = () => {
    if (!isRunning || cashedOut || !hasBet) return
    setCashedOut(true)
    setCashOutMultiplier(multiplier)
    setIsRunning(false)
    setHasWon(true)
    const winAmount = betAmount * multiplier * 0.97
    setWinnings(winAmount)
    hapticSuccess()

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const getMultiplierColor = () => {
    if (hasCrashed) return 'text-neon-red'
    if (multiplier >= 5) return 'text-neon-pink'
    if (multiplier >= 2) return 'text-neon-green'
    return 'text-neon-blue'
  }

  const getGraphHeight = () => {
    return Math.min((multiplier - 1) * 30, 100)
  }

  const canPlay = !isProcessing && !isRunning && wallet?.account?.address
  const hasEnoughBalance = balance >= betAmount

  return (
    <div className="p-4 space-y-6">
      {/* Game Title & Balance */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Crash</h2>
        <p className="text-text-secondary text-sm">Cash out before it crashes!</p>
        <p className="text-text-secondary text-xs mt-1">Balance: {balance.toFixed(2)} TON</p>
      </div>

      {/* Balance Warning */}
      {!hasEnoughBalance && hasBet && (
        <div className="text-center p-2 rounded-lg bg-neon-red/10 border border-neon-red/30">
          <p className="text-neon-red text-sm">Insufficient balance for next bet.</p>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {(error || gameError) && !hasBet && (
          <motion.div
            className="text-center p-2 rounded-lg bg-neon-red/10 border border-neon-red/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-neon-red text-sm">{error || gameError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graph Display */}
      <Card className="relative overflow-hidden" glow={hasCrashed ? 'pink' : isRunning ? 'green' : 'none'}>
        <div className="h-64 flex items-end justify-center relative">
          <div className="absolute inset-0 flex flex-col justify-between py-4 px-4">
            {[5, 4, 3, 2, 1].map((m) => (
              <div key={m} className="border-b border-white/5 flex items-center">
                <span className="text-text-secondary text-xs">{m}x</span>
              </div>
            ))}
          </div>

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="graphGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={hasCrashed ? '#EF4444' : '#00D4FF'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={hasCrashed ? '#EF4444' : '#10B981'} stopOpacity="0" />
              </linearGradient>
            </defs>
            {(isRunning || hasCrashed || multiplier > 1) && (
              <>
                <path
                  d={`M 0 100 Q 50 ${100 - getGraphHeight()} 100 ${100 - getGraphHeight()}`}
                  fill="url(#graphGradient)"
                />
                <path
                  d={`M 0 100 Q 50 ${100 - getGraphHeight()} 100 ${100 - getGraphHeight()}`}
                  fill="none"
                  stroke={hasCrashed ? '#EF4444' : '#00D4FF'}
                  strokeWidth="0.5"
                />
              </>
            )}
          </svg>

          <div className="relative z-10 text-center">
            <motion.p
              className={`text-6xl font-black ${getMultiplierColor()}`}
              animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0 }}
            >
              {multiplier.toFixed(2)}x
            </motion.p>
            {hasCrashed && (
              <motion.p className="text-neon-red font-bold text-lg mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                CRASHED!
              </motion.p>
            )}
            {cashedOut && cashOutMultiplier && (
              <motion.p className="text-neon-green font-bold text-lg mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                Cashed out at {cashOutMultiplier.toFixed(2)}x!
              </motion.p>
            )}
          </div>
        </div>
      </Card>

      {/* Bet Amount (only visible before game starts) */}
      {!hasBet && (
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
                <Button key={amount} variant={betAmount === amount ? 'primary' : 'secondary'} size="sm" onClick={() => setBetAmount(Math.min(amount, balance))} disabled={isDisabled}>
                  {amount}
                </Button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Result Message */}
      <AnimatePresence>
        {(hasCrashed || cashedOut) && !isRunning && (
          <motion.div className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className={`text-xl font-bold ${hasWon ? 'text-neon-green' : 'text-neon-red'}`}>
              {hasWon
                ? `You won ${winnings.toFixed(2)} TON!`
                : 'Crashed! Better luck next time.'}
            </p>
            {cashedOut && (
              <p className="text-text-secondary text-sm mt-1">
                New Balance: {balance.toFixed(2)} TON
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {!hasBet ? (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canPlay || !hasEnoughBalance || isProcessing}
          onClick={startGame}
        >
          {isProcessing ? 'Processing...' : 'Place Bet & Start'}
        </Button>
      ) : isRunning && !cashedOut ? (
        <Button
          variant="gold"
          size="lg"
          fullWidth
          onClick={handleCashOut}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          Cash Out at {multiplier.toFixed(2)}x — {(betAmount * multiplier).toFixed(2)} TON
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            setHasBet(false)
            setMultiplier(1.0)
            setHasCrashed(false)
            setHasWon(null)
            setWinnings(0)
            getBalance()
          }}
        >
          Play Again
        </Button>
      )}

      {/* History */}
      <Card>
        <p className="font-semibold mb-3 text-center">Recent Crashes</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {[1.23, 3.45, 1.89, 7.12, 2.34, 1.01, 5.67, 2.89].map((point, i) => (
            <span
              key={i}
              className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                point >= 2
                  ? 'bg-neon-green/20 text-neon-green'
                  : 'bg-neon-red/20 text-neon-red'
              }`}
            >
              {point.toFixed(2)}x
            </span>
          ))}
        </div>
      </Card>

      {/* Provably Fair */}
      <div className="text-center">
        <button className="text-text-secondary text-xs hover:text-neon-blue transition-colors">
          🔐 Provably Fair — Verify this game
        </button>
      </div>
    </div>
  )
}
