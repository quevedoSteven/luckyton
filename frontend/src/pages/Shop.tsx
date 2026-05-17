import { useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

const skins = [
  { id: '1', name: 'Golden Coin', type: 'Coin', price: 0.5, isPremium: false, owned: true, emoji: '🪙' },
  { id: '2', name: 'Neon Dice', type: 'Dice', price: 0.3, isPremium: false, owned: true, emoji: '🎲' },
  { id: '3', name: 'Cosmic Theme', type: 'Theme', price: 1.0, isPremium: false, owned: true, emoji: '🌌' },
  { id: '4', name: 'Diamond Coin', type: 'Coin', price: 2.5, isPremium: true, owned: false, emoji: '💎' },
  { id: '5', name: 'Fire Dice', type: 'Dice', price: 1.5, isPremium: true, owned: false, emoji: '🔥' },
  { id: '6', name: 'Cyberpunk Theme', type: 'Theme', price: 3.0, isPremium: true, owned: false, emoji: '🤖' },
  { id: '7', name: 'Rainbow Avatar', type: 'Avatar', price: 1.0, isPremium: true, owned: false, emoji: '🌈' },
  { id: '8', name: 'Dragon Coin', type: 'Coin', price: 5.0, isPremium: true, owned: false, emoji: '🐉' },
]

export default function Shop() {
  const [filter, setFilter] = useState<'all' | 'coin' | 'dice' | 'theme' | 'avatar'>('all')

  const filteredSkins = filter === 'all'
    ? skins
    : skins.filter((s) => s.type.toLowerCase() === filter)

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Shop</h2>
        <p className="text-text-secondary text-sm">Customize your LuckyTON experience</p>
      </div>

      {/* Premium Banner */}
      <Card glow="gold" className="bg-gradient-to-r from-gold/20 to-neon-pink/20 border-gold/30">
        <div className="text-center py-4">
          <span className="text-4xl">👑</span>
          <h3 className="text-xl font-bold text-gold mt-2">Go Premium</h3>
          <p className="text-text-secondary text-sm">Unlock all skins, VIP rooms & more</p>
          <p className="text-2xl font-black text-gold mt-2">0.5 TON<span className="text-sm">/month</span></p>
          <Button variant="gold" size="md" className="mt-3">
            Subscribe Now
          </Button>
        </div>
      </Card>

      {/* Filter Tabs */}
      <Card>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'coin', 'dice', 'theme', 'avatar'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f as any)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      {/* Skins Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredSkins.map((skin, index) => (
          <motion.div
            key={skin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              glow={skin.isPremium ? 'gold' : skin.owned ? 'green' : 'none'}
              className="text-center"
            >
              <motion.div
                className="text-5xl py-4"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                {skin.emoji}
              </motion.div>
              <h4 className="font-bold">{skin.name}</h4>
              <p className="text-text-secondary text-xs">{skin.type}</p>
              {skin.isPremium && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-bold">
                  Premium
                </span>
              )}
              <div className="mt-3">
                {skin.owned ? (
                  <Button variant="secondary" size="sm" fullWidth>
                    Equipped
                  </Button>
                ) : (
                  <Button
                    variant={skin.isPremium ? 'gold' : 'primary'}
                    size="sm"
                    fullWidth
                  >
                    {skin.price} TON
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gift Section */}
      <Card>
        <div className="text-center py-4">
          <span className="text-4xl">🎁</span>
          <h3 className="text-lg font-bold mt-2">Send a Gift</h3>
          <p className="text-text-secondary text-sm">
            Share TON with your friends
          </p>
          <Button variant="secondary" className="mt-3">
            Open Gifting
          </Button>
        </div>
      </Card>
    </div>
  )
}
