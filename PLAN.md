# 🎰 LuckyTON — Product Plan

> **Telegram Mini App for Crypto Betting on TON**
> Format: 1080×1920 (mobile-first)
> Status: Planned

---

## 📱 Product Overview

**LuckyTON** is a premium Telegram Mini App for real-time crypto betting on the TON blockchain. Players connect their TON wallets, compete in skill-and-luck games with provably fair outcomes, and climb global leaderboards — all inside Telegram.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Telegram Client                     │
│              (1080×1920 Mini App)                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           React + Framer Motion              │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │   │
│  │  │ Lobby  │ │ CoinFlip│ │ Dice  │ │Crash  │ │   │
│  │  │ Screen │ │ 1v1    │ │ Roll  │ │ Game  │ │   │
│  │  └────────┘ └────────┘ └────────┘ └───────┘ │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │   │
│  │  │Number  │ │Profile │ │Leader  │ │Shop   │ │   │
│  │  │Guess   │ │& Stats │ │boards  │ │Premium│ │   │
│  │  └────────┘ └────────┘ └────────┘ └───────┘ │   │
│  └──────────────────────────────────────────────┘   │
│         ▲                    ▲                       │
│         │ HTTPS              │ WebSocket             │
└─────────┼────────────────────┼───────────────────────┘
          │                    │
┌─────────┴────────────────────┴───────────────────────┐
│                  Backend (Railway)                     │
│                                                      │
│  ┌──────────────────┐    ┌────────────────────────┐ │
│  │  Express.js API  │    │  Socket.IO Game Server │ │
│  │                  │    │                        │ │
│  │  • Auth (TON)    │    │  • Matchmaking         │ │
│  │  • User profiles │    │  • Real-time game state│ │
│  │  • Leaderboards  │    │  • Provably fair engine│ │
│  │  • Transactions  │    │  • Room management     │ │
│  │  • Premium subs  │    │  • Anti-cheat          │ │
│  └────────┬─────────┘    └───────────┬────────────┘ │
│           │                          │               │
│  ┌────────┴──────────────────────────┴────────────┐ │
│  │              PostgreSQL Database               │ │
│  │  • users  • games  • transactions              │ │
│  │  • leaderboards  • achievements  • subscriptions│ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
          │
          │ TON Blockchain
          ▼
┌──────────────────────────────────────────────────────┐
│              TON Blockchain / TON Connect             │
│  • Wallet connect  • Smart contract escrow (optional) │
│  • Transaction verification  • On-chain settlement   │
└──────────────────────────────────────────────────────┘
```

---

## 🎮 Game Mechanics

### 1. Coin Flip (1v1)
- Two players matched, each bets X TON
- Both pick Heads or Tails
- Animated 3D coin flip with Framer Motion
- Winner takes pot minus 3% house fee
- **Provably fair**: server seed hash shown before flip, revealed after

### 2. Dice Roll
- Player vs Player or Player vs House
- Each rolls 1-6 (or 2d6 for variation)
- Higher roll wins the pot
- Animated dice tumble with physics-like bounce
- **Provably fair**: hash chain verification

### 3. Crash Game
- Single-player (multiplayer variant: all cash out before crash)
- Multiplier climbs from 1.00x upward
- Player must cash out before it crashes
- Crash point determined by provably fair algorithm
- Beautiful rising graph animation with neon trail
- **Provably fair**: crash point pre-computed from seed

### 4. Number Guessing
- Server picks number 1-100
- Players bet and guess
- Closer guess wins, exact match = 10x multiplier
- Animated number reveal with slot-machine style rolling
- **Provably fair**: committed hash revealed after guesses locked

---

## 🔐 Provably Fair System

```
Game Result = HMAC-SHA256(server_seed, client_seed + nonce)

Flow:
1. Server generates random server_seed, publishes its SHA256 hash
2. Player provides client_seed (or uses wallet address)
3. Game outcome computed from both seeds
4. After game, server reveals server_seed
5. Player can verify: SHA256(revealed_seed) == published_hash
6. Player can independently compute result
```

---

## 🎨 UI/UX Design System

### Color Palette (Dark + Neon)
| Token | Color | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0A0E17` | Main background |
| `--bg-secondary` | `#111827` | Cards, panels |
| `--bg-tertiary` | `#1F2937` | Inputs, buttons |
| `--neon-blue` | `#00D4FF` | Primary accent, CTAs |
| `--neon-purple` | `#8B5CF6` | Secondary accent |
| `--neon-pink` | `#EC4899` | Winning effects, highlights |
| `--neon-green` | `#10B981` | Success, profit |
| `--neon-red` | `#EF4444` | Loss, crash |
| `--gold` | `#F59E0B` | Premium, VIP |
| `--text-primary` | `#F9FAFB` | Main text |
| `--text-secondary` | `#9CA3AF` | Secondary text |

### Visual Effects
- **Glow effects**: CSS `box-shadow` with neon colors on interactive elements
- **Particle effects**: Confetti on wins, subtle floating particles in background
- **Smooth transitions**: Framer Motion for all page transitions (slide, fade, scale)
- **Animated gradients**: Shifting gradient backgrounds on hero sections
- **Haptic feedback**: Telegram WebApp HapticFeedback API for taps, wins, losses
- **Micro-interactions**: Button press animations, card hover lifts, number counting animations

### Screen Layout (1080×1920)
```
┌─────────────────────┐
│  Status Bar          │
├─────────────────────┤
│  Header: Logo + TON │
│  Balance + Profile  │
├─────────────────────┤
│                     │
│   Main Content      │
│   (scrollable)      │
│                     │
│                     │
├─────────────────────┤
│  Bottom Nav Bar     │
│  🏠 🎮 🏆 👤 🛒    │
└─────────────────────┘
```

---

## 📁 Project Structure

```
luckyton/
├── frontend/                    # React Mini App (Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Buttons, Cards, Modals, Inputs
│   │   │   ├── games/           # Game-specific components
│   │   │   │   ├── CoinFlip/
│   │   │   │   ├── DiceRoll/
│   │   │   │   ├── Crash/
│   │   │   │   └── NumberGuess/
│   │   │   ├── lobby/           # Game lobby, matchmaking
│   │   │   ├── profile/         # Profile, stats, achievements
│   │   │   ├── leaderboard/     # Leaderboard views
│   │   │   └── shop/            # Premium shop, skins
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API, WebSocket, TON Connect
│   │   ├── store/               # Zustand state management
│   │   ├── styles/              # Global CSS, theme, animations
│   │   ├── utils/               # Provably fair, formatters
│   │   ├── pages/               # Route-level components
│   │   └── App.tsx
│   ├── public/                  # Assets, icons
│   └── package.json
│
├── backend/                     # Node.js Game Server (Railway)
│   ├── src/
│   │   ├── api/                 # Express routes
│   │   │   ├── auth.ts          # TON wallet auth
│   │   │   ├── users.ts         # Profile management
│   │   │   ├── games.ts         # Game history, stats
│   │   │   ├── leaderboard.ts   # Rankings
│   │   │   └── premium.ts       # Subscriptions, shop
│   │   ├── socket/              # Socket.IO handlers
│   │   │   ├── matchmaking.ts   # Player pairing
│   │   │   ├── coinflip.ts      # Coin flip game logic
│   │   │   ├── dice.ts          # Dice roll game logic
│   │   │   ├── crash.ts         # Crash game logic
│   │   │   └── numberguess.ts   # Number guess logic
│   │   ├── engine/              # Core game engine
│   │   │   ├── provably-fair.ts # Provably fair algorithms
│   │   │   ├── escrow.ts        # Bet management
│   │   │   └── anti-cheat.ts    # Fraud detection
│   │   ├── db/                  # Database layer
│   │   │   ├── models/          # Prisma/SQL models
│   │   │   └── queries/         # Query functions
│   │   └── utils/               # Helpers
│   ├── prisma/                  # Database schema
│   └── package.json
│
├── shared/                      # Shared types & constants
│   └── types.ts
│
└── docs/                        # Documentation
    ├── api.md
    ├── provably-fair.md
    └── deployment.md
```

---

## 💰 Revenue Model

### House Edge
- **3% fee** on every bet pot (transparent, shown to players)
- Goes to the house treasury wallet

### Premium Subscription (TON/month)
| Feature | Free | Premium |
|---------|------|---------|
| Max bet | 1 TON | 50 TON |
| Skins | 3 basic | All 50+ |
| VIP rooms | ❌ | ✅ |
| Advanced stats | ❌ | ✅ |
| Profile badge | ❌ | ✅ Gold badge |
| Ad-free | ❌ | ✅ |
| Daily bonus | 0.01 TON | 0.05 TON |

**Pay-to-win limit**: Premium gives NO gameplay advantage beyond higher bet limits and cosmetics. Stats are informational only.

### Bet Limits
- **Default**: 0.01 - 10 TON
- **Premium**: 0.01 - 50 TON

---

## 🔌 TON Integration

- **TON Connect 2.0** for wallet connection
- Supports: Tonkeeper, OpenMask, MyTonWallet, Telegram Wallet
- **Transaction flow**:
  1. User clicks "Play" → TON Connect prompts payment
  2. Payment sent to house escrow address
  3. Game executes, winner determined
  4. Payout sent to winner's wallet (minus house fee)
- **Smart contract escrow** (Phase 2): Fully on-chain settlement for trustless play

---

## 🚀 Deployment

| Component | Platform | Details |
|-----------|----------|---------|
| Frontend | Vercel | React SPA, auto-deploy from Git |
| Backend | Railway | Node.js, auto-scaling, PostgreSQL addon |
| Database | Railway PostgreSQL | Managed, daily backups |
| WebSocket | Railway (same server) | Socket.IO with sticky sessions |
| CDN | Vercel Edge | Static assets, global |
| Telegram Bot | @BotFather | Mini App link, bot commands |

---

## 📋 Development Phases

### Phase 1: Foundation (Week 1-2)
- Project setup, CI/CD, database schema
- TON Connect integration
- User authentication & profiles
- Basic UI with dark+neon theme

### Phase 2: Core Games (Week 3-4)
- Coin Flip 1v1 with WebSocket matchmaking
- Dice Roll game
- Provably fair system
- Real-time animations

### Phase 3: Advanced Games (Week 5-6)
- Crash Game with live multiplier
- Number Guessing
- Game history & statistics
- Leaderboards

### Phase 4: Social & Premium (Week 7-8)
- Achievements & rewards system
- Telegram share/invite
- Premium subscription flow
- Shop with skins/themes
- In-app gifting
- VIP rooms

### Phase 5: Polish & Launch (Week 9-10)
- Performance optimization
- Security audit
- Bug fixes
- Telegram Bot setup
- Launch!

---

## 🔒 Security Considerations

- **Rate limiting** on all API endpoints
- **Input validation** on all game actions
- **Anti-cheat**: Server-authoritative game logic, no client-side trust
- **Transaction verification**: Verify all TON payments on-chain before crediting
- **SQL injection prevention**: Parameterized queries via ORM
- **WebSocket auth**: Token-based authentication for game rooms
- **DDoS protection**: Cloudflare in front of both frontend and backend

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Animations | Framer Motion |
| State | Zustand |
| Styling | Tailwind CSS + CSS custom properties |
| Routing | React Router v6 |
| TON SDK | @tonconnect/ui-react |
| Backend | Node.js + Express + TypeScript |
| Real-time | Socket.IO |
| Database | PostgreSQL + Prisma ORM |
| Auth | TON Connect 2.0 + JWT |
| Hosting (FE) | Vercel |
| Hosting (BE) | Railway |

---

*Plan created: 2026-05-17*
*Status: Ready for implementation*
