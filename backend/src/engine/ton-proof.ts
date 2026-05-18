import { sha256 } from '@ton/crypto'
import { Address, Cell, loadStateInit, contractAddress } from '@ton/ton'
import { Buffer } from 'buffer'
import nacl from 'tweetnacl'

const TON_PROOF_PREFIX = 'ton-proof-item-v2/'
const TON_CONNECT_PREFIX = 'ton-connect'
const VALID_AUTH_TIME = 15 * 60

export interface TonProofPayload {
  address: string
  network: string
  public_key: string
  proof: {
    timestamp: number
    domain: {
      lengthBytes: number
      value: string
    }
    payload: string
    signature: string
    state_init: string
  }
}

export interface ConnectEventData {
  address: string
  network: string
  publicKey: string
  walletStateInit: string
  proof: {
    timestamp: number
    domain: {
      lengthBytes: number
      value: string
    }
    payload: string
    signature: string
  }
}

function tryParsePublicKey(stateInit: Cell): Buffer | null {
  try {
    const cs = stateInit.beginParse()
    if (cs.remainingBits < 1) return null
    if (cs.loadBit()) {
      const ref = cs.loadRef()
      const data = ref.beginParse()
      const pubKeyPrefix = data.loadUint(8)
      if (pubKeyPrefix === 0x4e) {
        const remainingBits = data.remainingBits
        const pubKeyBytes = Buffer.alloc(32)
        for (let i = 0; i < 32 && i * 8 < remainingBits; i++) {
          pubKeyBytes[i] = data.loadUint(8)
        }
        return pubKeyBytes
      }
    }
    return null
  } catch {
    return null
  }
}

function getStateInitBase64(payload: TonProofPayload | ConnectEventData): string {
  if ('state_init' in payload.proof) {
    return (payload.proof as any).state_init
  }
  return (payload as any).walletStateInit || ''
}

function getPublicKeyHex(payload: TonProofPayload | ConnectEventData): string {
  if ('public_key' in payload) {
    return (payload as any).public_key
  }
  return (payload as any).publicKey || ''
}

export async function verifyTonProof(
  payload: TonProofPayload | ConnectEventData,
  allowedDomains: string[]
): Promise<boolean> {
  try {
    const stateInitB64 = getStateInitBase64(payload)
    if (!stateInitB64) return false

    const stateInit = loadStateInit(
      Cell.fromBase64(stateInitB64).beginParse()
    )

    const stateInitCell = Cell.fromBase64(stateInitB64)

    let publicKey = tryParsePublicKey(stateInitCell)
    if (!publicKey) return false

    const wantedPublicKey = Buffer.from(getPublicKeyHex(payload), 'hex')
    if (!publicKey.equals(wantedPublicKey)) return false

    const wantedAddress = Address.parse(payload.address)
    const address = contractAddress(wantedAddress.workChain, stateInit)
    if (!address.equals(wantedAddress)) return false

    if (!allowedDomains.includes(payload.proof.domain.value)) return false

    const now = Math.floor(Date.now() / 1000)
    if (now - VALID_AUTH_TIME > payload.proof.timestamp) return false

    const wc = Buffer.alloc(4)
    wc.writeUInt32BE(address.workChain, 0)

    const ts = Buffer.alloc(8)
    ts.writeBigUInt64LE(BigInt(payload.proof.timestamp), 0)

    const dl = Buffer.alloc(4)
    dl.writeUInt32LE(payload.proof.domain.lengthBytes, 0)

    const msg = Buffer.concat([
      Buffer.from(TON_PROOF_PREFIX),
      wc,
      address.hash,
      dl,
      Buffer.from(payload.proof.domain.value),
      ts,
      Buffer.from(payload.proof.payload),
    ])

    const msgHash = Buffer.from(await sha256(msg))

    const fullMsg = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from(TON_CONNECT_PREFIX),
      msgHash,
    ])

    const fullMsgHash = Buffer.from(await sha256(fullMsg))

    const signature = Buffer.from(payload.proof.signature, 'base64')

    return nacl.sign.detached.verify(
      fullMsgHash,
      signature,
      publicKey
    )
  } catch (err) {
    console.error('TON Proof verification error:', err)
    return false
  }
}

export function extractWalletAddress(rawAddress: string): string {
  try {
    const addr = Address.parse(rawAddress)
    return addr.toRawString()
  } catch {
    return rawAddress
  }
}
