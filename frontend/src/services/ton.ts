import { TonConnectUI } from '@tonconnect/ui-react'

const TONCENTER_API = 'https://testnet.toncenter.com/api/v2/jsonRPC'

async function rpcCall(method: string, params: Record<string, unknown>) {
  const res = await fetch(TONCENTER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: '1', jsonrpc: '2.0', method, params }),
  })
  const data = await res.json()
  return data.result
}

export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const result = await rpcCall('getAddressBalance', { address: walletAddress })
    if (!result) return 0
    return Number(result) / 1e9
  } catch {
    return 0
  }
}

export interface PaymentParams {
  amount: number
  recipient: string
  comment?: string
}

export async function sendTONPayment(
  tonConnectUI: TonConnectUI,
  params: PaymentParams
): Promise<boolean> {
  if (!tonConnectUI.connected) {
    throw new Error('Wallet not connected')
  }

  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: params.recipient,
        amount: BigInt(Math.floor(params.amount * 1e9)).toString(),
      },
    ],
  }

  try {
    await tonConnectUI.sendTransaction(transaction)
    return true
  } catch (error: any) {
    if (error?.message?.includes('User declined')) {
      throw new Error('Transaction cancelled by user')
    }
    throw error
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}
