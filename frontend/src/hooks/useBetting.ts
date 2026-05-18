import { useState, useCallback } from 'react'
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { getWalletBalance } from '../services/ton'
import { api, getAuthToken, authenticate } from '../services/api'

function toNano(amount: number): string {
  return BigInt(Math.floor(amount * 1e9)).toString()
}

const API_URL = import.meta.env.VITE_API_URL || 'https://luckyton-production.up.railway.app'

export function useBetting() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const placeBet = useCallback(async (
    gameType: string,
    betAmount: number,
    choice?: string
  ) => {
    if (!wallet?.account?.address) {
      setError('Connect wallet first')
      return null
    }

    setIsProcessing(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        const newToken = await authenticate(wallet.account.address)
        if (!newToken) {
          setError('Authentication failed')
          return null
        }
      }

      const createRes = await fetch(`${API_URL}/api/betting/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          gameType,
          betAmount,
          choice,
        }),
      })

      if (!createRes.ok) {
        const errText = await createRes.text()
        throw new Error(`Failed to create bet: ${createRes.status} ${errText}`)
      }

      const { sessionId } = await createRes.json()

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: import.meta.env.VITE_HOUSE_WALLET || '0:ba0440e34b26e89304678b69d9a199a2d53aa3689513e9730a979997a86daa89',
            amount: toNano(betAmount),
          },
        ],
      }

      const txResult = await tonConnectUI.sendTransaction(transaction)
      const txHash = txResult.boc[0] || ''

      const verifyRes = await fetch(`${API_URL}/api/betting/verify/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ txHash }),
      })

      if (!verifyRes.ok) {
        const errText = await verifyRes.text()
        throw new Error(`Failed to verify: ${verifyRes.status} ${errText}`)
      }

      const gameResult = await verifyRes.json()

      getWalletBalance(wallet.account.address).catch(() => {})

      return gameResult
    } catch (err: any) {
      const msg = err.message || 'Transaction failed'
      setError(msg)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [wallet, tonConnectUI])

  return { placeBet, isProcessing, error }
}
