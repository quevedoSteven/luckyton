import { useState, useCallback, useEffect } from 'react'
import { api } from '../services/api'
import { useAppStore } from '../store'

export interface GameSession {
  sessionId: string
  serverSeedHash: string
  clientSeed: string
}

export interface GameResult {
  sessionId: string
  result: {
    gameType: string
    winner: 'player' | 'house'
    multiplier: number
    details: any
  }
  betAmount: number
  winnings: number
  netProfit: number
  newBalance: any
}

interface GameError {
  message: string
  code?: string
}

export function useGamePlay() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<GameResult | null>(null)
  const setBalance = useAppStore((state) => state.setBalance)

  const getBalance = useCallback(async () => {
    try {
      const { balance } = await api.users.getBalance()
      setBalance(balance)
      return balance
    } catch {
      return null
    }
  }, [setBalance])

  const createSession = useCallback(async (gameType: string, betAmount: number, choice?: string | number): Promise<GameSession | null> => {
    setIsProcessing(true)
    setError(null)
    setLastResult(null)

    try {
      const data = await api.betting.create(gameType, betAmount, choice)
      const newBalance = data.newBalance !== undefined ? data.newBalance : (await getBalance() ?? 0)
      setBalance(Number(newBalance))
      return {
        sessionId: data.sessionId,
        serverSeedHash: data.serverSeedHash,
        clientSeed: data.clientSeed,
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to create game session'
      setError(msg)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [setBalance, getBalance])

  const playGame = useCallback(async (gameType: string, betAmount: number, choice?: string | number): Promise<GameResult | null> => {
    setIsProcessing(true)
    setError(null)
    setLastResult(null)

    try {
      // Step 1: Create session (deducts balance)
      const createData = await api.betting.create(gameType, betAmount, choice)
      if (createData?.newBalance !== undefined) {
        setBalance(Number(createData.newBalance))
      } else {
        await getBalance()
      }

      // Step 2: Get result
      const resultData = await api.betting.result(createData.sessionId)
      const newBalance = resultData.newBalance !== undefined ? Number(resultData.newBalance) : (await getBalance() ?? 0)
      setBalance(newBalance)
      setLastResult(resultData)
      return resultData
    } catch (err: any) {
      const msg = err?.message || 'Game failed'
      setError(msg)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [setBalance, getBalance])

  const getResult = useCallback(async (sessionId: string): Promise<GameResult | null> => {
    try {
      const data = await api.betting.result(sessionId)
      const newBalance = data.newBalance !== undefined ? Number(data.newBalance) : (await getBalance() ?? 0)
      setBalance(newBalance)
      setLastResult(data)
      return data
    } catch (err: any) {
      setError(err?.message || 'Failed to get result')
      return null
    }
  }, [setBalance, getBalance])

  return {
    createSession,
    playGame,
    getResult,
    getBalance,
    isProcessing,
    error,
    lastResult,
    clearError: () => setError(null),
    clearResult: () => setLastResult(null),
    hasSufficientBalance: (amount: number, currentBalance: number) => currentBalance >= amount,
  }
}
