import { useState, useEffect } from 'react'
import { useTonWallet, useTonConnectUI, TonConnectButton } from '@tonconnect/ui-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { hapticImpact } from '../../services/telegram'
import { getWalletBalance } from '../../services/ton'
import { setAuthToken } from '../../services/api'

interface UserSession {
  id: string
  walletAddress: string
  username: string
  balance: number
  isPremium: boolean
  level: number
  totalGames: number
  totalWins: number
  totalLosses: number
  winStreak: number
  bestWinStreak: number
  xp: number
  createdAt: string
}

interface HeaderProps {
  showBalance?: boolean
}

export default function Header({ showBalance = true }: HeaderProps) {
  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()
  const [showConnect, setShowConnect] = useState(false)
  const [headerBalance, setHeaderBalance] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(0)

  const getUserFromStorage = (): UserSession | null => {
    try {
      const userStr = localStorage.getItem('luckyton_user')
      if (userStr) return JSON.parse(userStr)
      return null
    } catch {
      return null
    }
  }

  const updateHeaderBalance = async () => {
    if (wallet?.account?.address) {
      try {
        // Always get actual on-chain balance from the TON wallet
        const onChainBalance = await getWalletBalance(wallet.account.address)
        setHeaderBalance(onChainBalance)
      } catch {
        setHeaderBalance(0)
      }
    }
  }

  useEffect(() => {
    updateHeaderBalance()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'luckyton_user') {
        updateHeaderBalance()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [wallet?.account?.address])

  const handleConnectToggle = () => {
    setShowConnect(!showConnect)
  }

  const handleDisconnect = () => {
    tonConnectUI.disconnect()
    setAuthToken(null)
    setHeaderBalance(0)
  }

  return (
    <header className="safe-top bg-bg-secondary/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => hapticImpact('light')}>
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-white font-bold text-sm">L</span>
          </motion.div>
          <span className="font-bold text-lg bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            LuckyTON
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {showBalance && wallet && (
            <motion.div
              className="px-3 py-1.5 rounded-full bg-bg-tertiary border border-neon-blue/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-neon-blue font-mono font-semibold">
                {headerBalance.toFixed(2)}
              </span>
              <span className="text-text-secondary text-sm ml-1">TON</span>
            </motion.div>
          )}

          {wallet ? (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {wallet.account.address.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-text-secondary text-xs hover:text-neon-red transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectToggle}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white text-sm font-semibold shadow-neon-blue btn-press"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showConnect && !wallet && (
          <motion.div
            className="mt-3 p-4 rounded-xl bg-bg-tertiary border border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-text-secondary text-sm mb-3">
              Connect your TON wallet to start playing
            </p>
            <div className="flex justify-center">
              <TonConnectButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
