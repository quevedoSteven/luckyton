import { useState, useCallback } from 'react'
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { toNano } from '@ton/ton'
import { getWalletBalance } from './ton'

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
      // Step 1: Create bet session
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

      if (!createRes.ok) throw new Error('Failed to create bet')

      const { sessionId, paymentRequest } = await createRes.json()

      // Step 2: Send TON payment
      const transaction = {
        validUntil: paymentRequest.validUntil,
        messages: [
          {
            address: paymentRequest.recipient,
            amount: toNano(paymentRequest.amount).toString(),
            payload: undefined,
          },
        ],
      }

      const result = await tonConnectUI.sendTransaction(transaction)
      const txHash = result.boc[0] || result.hash || ''

      // Step 3: Verify and get game result
      const verifyRes = await fetch(`${API_URL}/api/betting/verify/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      })

      if (!verifyRes.ok) throw new Error('Failed to verify bet')

      const gameResult = await verifyRes.json()

      // Refresh balance
      getWalletBalance(wallet.account.address)

      return gameResult
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [wallet, tonConnectUI])

  return { placeBet, isProcessing, error }
}
