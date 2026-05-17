const API_URL = import.meta.env.VITE_API_URL || 'https://luckyton-production.up.railway.app'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

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
