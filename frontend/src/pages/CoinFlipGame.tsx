import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { useGamePlay } from '../hooks/useGamePlay'
import { useAppStore } from '../store'
import { hapticSuccess, hapticError } from '../services/telegram'
import { getWalletBalance } from '../services/ton'
import { useTonWallet } from '@tonconnect/ui-react'

type Choice = 'heads' | 'tails' | null

export default function CoinFlipGame() {
  const [choice, setChoice] = useState<Choice>(null)
  const [betAmount, setBetAmount] = useState(0.1)
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [hasWon, setHasWon] = useState<boolean | null>(null)
  const [winnings, setWinnings] = useState(0)
  const [balance, setBalance] = useState(0)

  const { playGame, isProcessing, error, clearError, hasSufficientBalance } = useGamePlay()
  const wallet = useTonWallet()
  const setStoreBalance = useAppStore((state) => state.setBalance)

  useEffect(() => {
    if (wallet?.account?.address) {
      getWalletBalance(wallet.account.address).then((bal) => {
        setBalance(bal)
        setStoreBalance(bal)
      })
    }
  }, [wallet?.account?.address])

  const quickBets = [0.01, 0.05, 0.1, 0.5, 1, 5]

  const handleBetChange = useCallback((newAmount: number) => {
    const maxBet = Math.min(newAmount, balance)
    if (maxBet < 0.01) {
      setBetAmount(0.01)
      return
    }
    setBetAmount(maxBet)
  }, [balance])

  const handleFlip = async () => {
    if (!choice || isFlipping || isProcessing || !wallet?.account?.address) return
    if (!hasSufficientBalance(betAmount, balance)) return

    setIsFlipping(true)
    setResult(null)
    setHasWon(null)
    setWinnings(0)
    clearError()

    try {
      const gameResult = await playGame('coinflip', betAmount, choice, wallet.account.address)

      if (gameResult && gameResult.result) {
        const outcome = gameResult.result.details?.result
        const won = gameResult.result.winner === 'player'

        // Simulate flip animation
        await new Promise(resolve => setTimeout(resolve, 1500))

        setResult(outcome)
        setHasWon(won)
        setWinnings(gameResult.winnings)

        if (won) hapticSuccess()
        else hapticError()
      }
    } catch (err) {
      console.error('Coin flip error:', err)
    } finally {
      setIsFlipping(false)
    }
  }

  const canFlip = !isFlipping && !isProcessing && wallet?.account?.address && balance >= betAmount && choice !== null

  return (
    <div className="p-4 space-y-6">
      {/* Game Title & Balance */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Coin Flip</h2>
        <p className="text-text-secondary text-sm">Pick a side, flip the coin</p>
        <p className="text-text-secondary text-xs mt-1">Balance: {balance.toFixed(2)} TON</p>
      </div>

  {/* Balance Warning - only show if wallet connected and insufficient */}
  {wallet && balance < betAmount && (
  <div className="text-center p-2 rounded-lg bg-neon-red/10 border border-neon-red/30">
  <p className="text-neon-red text-sm">Insufficient balance. Need {betAmount.toFixed(2)} TON, have {balance.toFixed(2)} TON.</p>
  </div>
  )}

      {/* Error Display */}
      {error && (
        <div className="text-center p-2 rounded-lg bg-neon-red/10 border border-neon-red/30">
          <p className="text-neon-red text-sm">{error}</p>
        </div>
      )}

      {/* Coin Animation */}
      <div className="flex justify-center py-8">
        <AnimatePresence mode="wait">
          {isFlipping || isProcessing ? (
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

      {/* Result */}
      <AnimatePresence>
        {result && !isFlipping && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className={`text-xl font-bold ${hasWon ? 'text-neon-green' : 'text-neon-red'}`}>
              {hasWon
                ? `You won ${winnings.toFixed(2)} TON!`
                : 'Better luck next time!'}
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Result: {result === 'heads' ? '👑 Heads' : '🌙 Tails'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choose Side */}
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
        <p className="text-text-secondary text-xs mt-1">House fee: 3%</p>
      </Card>

      {/* Flip Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!canFlip}
        onClick={handleFlip}
      >
        {isProcessing ? 'Processing...' : isFlipping ? 'Flipping...' : 'Flip Coin'}
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
