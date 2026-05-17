async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmacSHA256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function generateGameResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  maxRange: number = 100
): Promise<number> {
  const message = `${clientSeed}:${nonce}`
  const hash = await hmacSHA256(serverSeed, message)
  const hashInt = parseInt(hash.substring(0, 8), 16)
  return hashInt % maxRange
}

export async function generateCrashPoint(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<number> {
  const hash = await hmacSHA256(serverSeed, `${clientSeed}:${nonce}`)
  const hashInt = parseInt(hash.substring(0, 13), 16)
  const e = Math.pow(2, 32)
  const crashPoint = Math.floor((100 * e - hashInt) / (e - hashInt)) / 100
  return Math.max(1.0, crashPoint)
}

export async function generateCoinFlip(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<'heads' | 'tails'> {
  const result = await generateGameResult(serverSeed, clientSeed, nonce, 2)
  return result === 0 ? 'heads' : 'tails'
}

export async function generateDiceRoll(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<number> {
  const result = await generateGameResult(serverSeed, clientSeed, nonce, 6)
  return result + 1
}

export async function verifyServerSeed(
  revealedSeed: string,
  expectedHash: string
): Promise<boolean> {
  const actualHash = await sha256(revealedSeed)
  return actualHash === expectedHash
}

export function formatProvablyFair(result: {
  serverSeed: string
  clientSeed: string
  nonce: number
  serverSeedHash: string
}): string {
  return `Server Seed Hash: ${result.serverSeedHash}\nClient Seed: ${result.clientSeed}\nNonce: ${result.nonce}\n\nYou can verify this result independently using any SHA-256 tool.`
}
