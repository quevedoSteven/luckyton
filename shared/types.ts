export interface User {
  id: string
  walletAddress: string
  username?: string
  avatar?: string
  balance: number
  totalGames: number
  totalWins: number
  totalLosses: number
  winStreak: number
  bestWinStreak: number
  level: number
  xp: number
  isPremium: boolean
  premiumExpiry?: Date
  achievements: Achievement[]
  createdAt: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
}

export interface Game {
  id: string
  type: 'coinflip' | 'dice' | 'numberguess' | 'crash'
  status: 'waiting' | 'active' | 'finished' | 'cancelled'
  players: GamePlayer[]
  betAmount: number
  houseFee: number
  pot: number
  winnerId?: string
  result?: GameResult
  provablyFair: ProvablyFairData
  createdAt: Date
  startedAt?: Date
  finishedAt?: Date
}

export interface GamePlayer {
  userId: string
  walletAddress: string
  username?: string
  choice?: string
  roll?: number
  guess?: number
  cashedOut?: boolean
  cashOutMultiplier?: number
  isWinner?: boolean
}

export interface GameResult {
  serverSeed: string
  clientSeed: string
  nonce: number
  outcome: string
  hash: string
}

export interface ProvablyFairData {
  serverSeedHash: string
  clientSeed: string
  nonce: number
  revealedServerSeed?: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  walletAddress: string
  username?: string
  totalWagered: number
  totalWon: number
  winRate: number
  gamesPlayed: number
  level: number
  isPremium: boolean
}

export interface Skin {
  id: string
  name: string
  type: 'coin' | 'dice' | 'card' | 'avatar' | 'theme'
  price: number
  isPremium: boolean
  owned: boolean
  preview: string
}

export interface Transaction {
  id: string
  type: 'bet' | 'win' | 'deposit' | 'withdrawal' | 'fee' | 'premium' | 'gift'
  amount: number
  currency: 'TON'
  status: 'pending' | 'confirmed' | 'failed'
  gameId?: string
  createdAt: Date
}

export type GameType = 'coinflip' | 'dice' | 'crash' | 'numberguess'

export interface MatchmakingQueue {
  gameType: GameType
  betAmount: number
  players: {
    userId: string
    walletAddress: string
    username?: string
    choice?: string
  }[]
  maxPlayers: number
  createdAt: Date
}

export interface CrashState {
  multiplier: number
  isRunning: boolean
  hasCrashed: boolean
  crashPoint: number
  players: {
    userId: string
    bet: number
    cashedOut: boolean
    cashOutMultiplier?: number
    profit?: number
  }[]
}
