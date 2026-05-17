const API_URL = import.meta.env.VITE_API_URL || 'https://luckyton-production.up.railway.app'

let authToken: string | null = localStorage.getItem('auth_token')

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

export function getAuthToken(): string | null {
  return authToken
}

export async function authenticate(walletAddress: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.token) {
      setAuthToken(data.token)
      localStorage.setItem('luckyton_user', JSON.stringify(data.user))
      return data.token
    }
    return null
  } catch {
    return null
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && authToken) {
    const walletAddress = JSON.parse(localStorage.getItem('luckyton_user') || '{}')?.walletAddress
    if (walletAddress) {
      const newToken = await authenticate(walletAddress)
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        const retry = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
        if (!retry.ok) {
          const error = await retry.json().catch(() => ({ message: 'Unknown error' }))
          throw new Error(error.message || `HTTP ${retry.status}`)
        }
        return retry.json()
      }
    }
    setAuthToken(null)
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  auth: {
    verify: (walletAddress: string, signature: string) =>
      request<{ token: string; user: any }>('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, signature }),
      }),
  },

  users: {
    getProfile: () => request<any>('/api/users/me'),
    updateProfile: (data: { username?: string; avatar?: string }) =>
      request<any>('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getStats: () => request<any>('/api/users/stats'),
    getBalance: () => request<{ balance: number }>('/api/users/balance'),
  },

  betting: {
    create: (gameType: string, betAmount: number, choice?: string | number) =>
      request<{
        sessionId: string
        serverSeedHash: string
        clientSeed: string
        message: string
        newBalance?: number
      }>('/api/betting/create', {
        method: 'POST',
        body: JSON.stringify({ gameType, betAmount, choice }),
      }),

    result: (sessionId: string) =>
      request<{ sessionId: string; result: any; betAmount: number; winnings: number; netProfit: number; newBalance?: any }>(`/api/betting/result/${sessionId}`, {
        method: 'POST',
      }),

    getBalance: () => request<{ balance: number }>('/api/betting/balance'),
  },

  games: {
    getHistory: (limit = 20, offset = 0) =>
      request<any>(`/api/games/history?limit=${limit}&offset=${offset}`),
    getGame: (id: string) => request<any>(`/api/games/${id}`),
    verifyFairness: (gameId: string) =>
      request<any>(`/api/games/${gameId}/verify`),
  },

  leaderboard: {
    getGlobal: (timeframe: 'daily' | 'weekly' | 'monthly' | 'all' = 'all') =>
      request<any>(`/api/leaderboard/global?timeframe=${timeframe}`),
    getFriends: () => request<any>('/api/leaderboard/friends'),
  },

  premium: {
    getSubscription: () => request<any>('/api/premium/subscription'),
    subscribe: () => request<any>('/api/premium/subscribe', { method: 'POST' }),
    getSkins: () => request<any>('/api/premium/skins'),
    purchaseSkin: (skinId: string) =>
      request<any>(`/api/premium/skins/${skinId}/purchase`, { method: 'POST' }),
  },

  transactions: {
    getHistory: (limit = 20) => request<any>(`/api/transactions?limit=${limit}`),
    createDeposit: (amount: number) =>
      request<any>('/api/transactions/deposit', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
  },
}

export default api
