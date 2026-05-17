import crypto from 'crypto'

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashServerSeed(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex')
}

export function generateGameResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  maxRange: number = 100
): number {
  const message = `${clientSeed}:${nonce}`
  const hmac = crypto.createHmac('sha256', serverSeed)
  const hash = hmac.update(message).digest('hex')
  const hashInt = parseInt(hash.substring(0, 8), 16)
  return hashInt % maxRange
}

export function generateCrashPoint(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number {
  const message = `${clientSeed}:${nonce}`
  const hmac = crypto.createHmac('sha256', serverSeed)
  const hash = hmac.update(message).digest('hex')
  const hashInt = parseInt(hash.substring(0, 13), 16)
  const e = Math.pow(2, 32)
  const crashPoint = Math.floor((100 * e - hashInt) / (e - hashInt)) / 100
  return Math.max(1.0, crashPoint)
}

export function generateCoinFlip(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): 'heads' | 'tails' {
  const result = generateGameResult(serverSeed, clientSeed, nonce, 2)
  return result === 0 ? 'heads' : 'tails'
}

export function generateDiceRoll(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number {
  const result = generateGameResult(serverSeed, clientSeed, nonce, 6)
  return result + 1
}

export function verifyServerSeed(
  revealedSeed: string,
  expectedHash: string
): boolean {
  const actualHash = hashServerSeed(revealedSeed)
  return actualHash === expectedHash
}

export function createProvablyFairData() {
  const serverSeed = generateServerSeed()
  return {
    serverSeed,
    serverSeedHash: hashServerSeed(serverSeed),
    clientSeed: crypto.randomBytes(16).toString('hex'),
    nonce: 0,
  }
}
