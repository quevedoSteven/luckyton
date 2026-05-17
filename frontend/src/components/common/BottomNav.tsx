import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/leaderboard', icon: '🏆', label: 'Ranks' },
  { path: '/profile', icon: '👤', label: 'Profile' },
  { path: '/shop', icon: '🛒', label: 'Shop' },
]

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary/90 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-neon-blue'
                  : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-neon-blue/10"
                    layoutId="nav-active"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="text-xl relative z-10">{item.icon}</span>
                <span className="text-xs font-medium relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
