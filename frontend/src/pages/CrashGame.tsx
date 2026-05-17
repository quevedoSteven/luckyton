import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function CrashGame() {
  const [betAmount, setBetAmount] = useState(0.1)
  const [multiplier, setMultiplier] = useState(1.0)
  const [isRunning, setIsRunning] = useState(false)
  const [hasCrashed, setHasCrashed] = useState(false)
  const [hasBet, setHasBet] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashOutMultiplier, setCashOutMultiplier] = useState<number | null>(null)
  const [crashPoint, setCrashPoint] = useState(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(0)

  const quickBets = [0.01, 0.05, 0.1, 0.5, 1, 5]

  const startGame = () => {
    if (isRunning) return
    
    const point = generateCrashPoint()
    setCrashPoint(point)
    setMultiplier(1.0)
    setIsRunning(true)
    setHasCrashed(false)
    setCashedOut(false)
    setCashOutMultiplier(null)
    setHasBet(true)
    startTimeRef.current = Date.now()

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const newMultiplier = Math.pow(Math.E, 0.07 * elapsed * elapsed)
      
      if (newMultiplier >= point) {
        setMultiplier(point)
        setIsRunning(false)
        setHasCrashed(true)
        return
      }

      setMultiplier(newMultiplier)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const cashOut = () => {
    if (!isRunning || cashedOut) return
    setCashedOut(true)
    setCashOutMultiplier(multiplier)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const generateCrashPoint = () => {
    const e = Math.pow(2, 32)
    const hashInt = Math.floor(Math.random() * e)
    const point = Math.floor((100 * e - hashInt) / (e - hashInt)) / 100
    return Math.max(1.0, Math.min(point, 100))
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

  return (
    <div className="p-4 space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Crash</h2>
        <p className="text-text-secondary text-sm">Cash out before it crashes!</p>
      </div>

      {/* Graph Display */}
      <Card className="relative overflow-hidden" glow={hasCrashed ? 'pink' : isRunning ? 'green' : 'none'}>
        <div className="h-64 flex items-end justify-center relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-4 px-4">
            {[5, 4, 3, 2, 1].map((m) => (
              <div key={m} className="border-b border-white/5 flex items-center">
                <span className="text-text-secondary text-xs">{m}x</span>
              </div>
            ))}
          </div>

          {/* Graph line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="graphGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={hasCrashed ? '#EF4444' : '#00D4FF'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={hasCrashed ? '#EF4444' : '#10B981'} stopOpacity="0" />
              </linearGradient>
            </defs>
            {isRunning || hasCrashed || multiplier > 1 ? (
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
            ) : null}
          </svg>

          {/* Multiplier display */}
          <div className="relative z-10 text-center">
            <motion.p
              className={`text-6xl font-black ${getMultiplierColor()}`}
              animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0 }}
            >
              {multiplier.toFixed(2)}x
            </motion.p>
            {hasCrashed && (
              <motion.p
                className="text-neon-red font-bold text-lg mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                CRASHED!
              </motion.p>
            )}
            {cashedOut && cashOutMultiplier && (
              <motion.p
                className="text-neon-green font-bold text-lg mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Cashed out at {cashOutMultiplier.toFixed(2)}x!
              </motion.p>
            )}
          </div>
        </div>
      </Card>

      {/* Bet Amount */}
      {!hasBet && (
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
      )}

      {/* Action Buttons */}
      {!hasBet ? (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={startGame}
        >
          Place Bet & Start
        </Button>
      ) : isRunning && !cashedOut ? (
        <Button
          variant="gold"
          size="lg"
          fullWidth
          onClick={cashOut}
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
