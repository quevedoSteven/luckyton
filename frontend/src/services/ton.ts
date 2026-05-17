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

function rawToUserFriendly(rawAddress: string): string {
  if (rawAddress.startsWith('EQ') || rawAddress.startsWith('UQ')) {
    return rawAddress
  }

  const parts = rawAddress.split(':')
  if (parts.length !== 2) return rawAddress

  const tag = parseInt(parts[0], 10)
  const hex = parts[1]

  const buf = new Uint8Array(36)
  buf[0] = tag
  for (let i = 0; i < 32; i++) {
    buf[1 + i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }

  const crc = crc16(buf)
  const addrWithCrc = new Uint8Array(38)
  addrWithCrc.set(buf)
  addrWithCrc[36] = (crc >> 8) & 0xff
  addrWithCrc[37] = crc & 0xff

  return btoa(String.fromCharCode(...addrWithCrc))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function crc16(data: Uint8Array): number {
  let crc = 0
  for (let i = 0; i < data.length; i++) {
    crc = ((crc << 8) ^ crcTable[((crc >> 8) ^ data[i]) & 0xff]) & 0xffff
  }
  return crc
}

const crcTable = (() => {
  const table = new Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? (0xa001 ^ (c >> 1)) : (c >> 1)
    }
    table[i] = c
  }
  return table
})()

export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const addr = rawToUserFriendly(walletAddress)
    console.log('[TON] Fetching balance for:', addr)
    const result = await rpcCall('getAddressBalance', { address: addr })
    console.log('[TON] Raw balance response:', result)
    if (!result) return 0
    const balance = Number(result) / 1e9
    console.log('[TON] Parsed balance:', balance)
    return balance
  } catch (e) {
    console.error('[TON] Failed to fetch balance:', e)
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

  const { toNano } = await import('@ton/ton')

  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: rawToUserFriendly(params.recipient),
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
