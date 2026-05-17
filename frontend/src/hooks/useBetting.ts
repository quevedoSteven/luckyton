import { useState, useCallback } from 'react'
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { getWalletBalance } from '../services/ton'

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
      const createRes = await fetch(`${API_URL}/api/betting/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType,
          betAmount,
          choice,
          playerWallet: wallet.account.address,
        }),
      })

      if (!createRes.ok) {
        const errText = await createRes.text()
        throw new Error(`Failed to create bet: ${createRes.status} ${errText}`)
      }

      const { sessionId, paymentRequest } = await createRes.json()

      const transaction = {
        validUntil: paymentRequest.validUntil,
        messages: [
          {
            address: paymentRequest.recipient,
            amount: toNano(paymentRequest.amount).toString(),
          },
        ],
      }

      const result = await tonConnectUI.sendTransaction(transaction)
      const txHash = result.boc[0] || ''

      const verifyRes = await fetch(`${API_URL}/api/betting/verify/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      })

      if (!verifyRes.ok) {
        const errText = await verifyRes.text()
        throw new Error(`Failed to verify: ${verifyRes.status} ${errText}`)
      }

      const gameResult = await verifyRes.json()

      getWalletBalance(wallet.account.address)

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
