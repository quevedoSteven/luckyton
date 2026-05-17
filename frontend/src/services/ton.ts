import { TonConnectUI } from '@tonconnect/ui-react'
import { toNano, Address, TonClient } from '@ton/ton'

const TON_CLIENT = new TonClient({
  endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
})

export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const address = Address.parse(walletAddress)
    const balance = await TON_CLIENT.getBalance(address)
    return Number(balance) / 1e9
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
        amount: toNano(params.amount).toString(),
        payload: params.comment ? btoa(
          new TextEncoder().encode(
            '\x00\x00\x00\x00' + params.comment
          ).reduce((data, byte) => data + String.fromCharCode(byte), '')
        ) : undefined,
      },
    ],
  }

  try {
    const result = await tonConnectUI.sendTransaction(transaction)
    return true
  } catch (error: any) {
    if (error?.message?.includes('User declined')) {
      throw new Error('Transaction cancelled by user')
    }
    throw error
  }
}

export function formatAddress(address: string): string {
  try {
    const addr = Address.parse(address)
    return addr.toString({ bounceable: true, testOnly: true })
  } catch {
    return address
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}
