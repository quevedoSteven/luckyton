import { create } from 'zustand'
import { User, Game, Transaction, LeaderboardEntry } from '../types'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  balance: number
  setBalance: (balance: number) => void
  activeGame: Game | null
  setActiveGame: (game: Game | null) => void
  transactions: Transaction[]
  setTransactions: (txs: Transaction[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => {
    // Sync with localStorage for cross-component communication
    if (user) {
      localStorage.setItem('luckyton_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('luckyton_user');
    }
    set({ user });
  },
  balance: 0,
  setBalance: (balance) => {
    // Also update localStorage for Header component
    const userStr = localStorage.getItem('luckyton_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.balance = balance;
      localStorage.setItem('luckyton_user', JSON.stringify(user));
    }
    set({ balance });
  },
  activeGame: null,
  setActiveGame: (game) => set({ activeGame: game }),
  transactions: [],
  setTransactions: (txs) => set({ transactions: txs }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
}))

interface GameStore {
  crashState: {
    multiplier: number
    isRunning: boolean
    hasCrashed: boolean
    crashPoint: number
    myBet: number
    cashedOut: boolean
    cashOutMultiplier: number | null
  } | null
  setCrashState: (state: GameStore['crashState']) => void
  queueStatus: {
    gameType: string
    betAmount: number
    players: number
    maxPlayers: number
  } | null
  setQueueStatus: (status: GameStore['queueStatus']) => void
}

export const useGameStore = create<GameStore>((set) => ({
  crashState: null,
  setCrashState: (state) => set({ crashState: state }),
  queueStatus: null,
  setQueueStatus: (status) => set({ queueStatus: status }),
}))
