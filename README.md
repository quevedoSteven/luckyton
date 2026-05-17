# 🎰 LuckyTON

> Crypto Betting Mini App for Telegram on the TON Blockchain

Play, bet, and win with TON cryptocurrency in a beautifully designed Telegram Mini App with provably fair games.

## 🎮 Games

- **Coin Flip** — Classic 1v1 heads or tails
- **Dice Roll** — Roll higher than your opponent
- **Crash** — Cash out before the multiplier crashes
- **Number Guess** — Guess 1-100, exact match wins 10x

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Tonkeeper wallet (for testnet testing)

### 1. Start PostgreSQL

```bash
sudo pg_ctlcluster 18 main start
```

### 2. Create Database

```bash
sudo -u postgres psql -c "CREATE DATABASE luckyton;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env   # Already configured for local
npm install
npx prisma generate
npx prisma db push      # Creates all tables
npm run db:seed         # Adds test users + achievements
npm run dev             # Starts on http://localhost:4000
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env    # Already configured for testnet
npm install
npm run dev             # Starts on http://localhost:3000
```

### 5. Test with Tonkeeper Testnet

1. Open **Tonkeeper** app → Settings → switch to **Testnet**
2. Get test TON from https://t.me/testgiver_ton_bot
3. Open http://localhost:3000 in browser
4. Click **Connect** → choose **Tonkeeper** → scan QR or use deep link
5. Your testnet balance will show and you can play!

## 📁 Project Structure

```
luckyton/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Game screens
│   │   ├── services/      # API, WebSocket, Telegram, TON
│   │   ├── store/         # Zustand state
│   │   ├── styles/        # Tailwind + globals
│   │   └── utils/         # Provably fair
├── backend/           # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── api/           # REST endpoints
│   │   ├── socket/        # WebSocket game handlers
│   │   ├── engine/        # Provably fair algorithms
│   │   └── db/            # Prisma client
│   └── prisma/            # Schema + seed
├── shared/            # Shared TypeScript types
└── PLAN.md            # Full product plan
```

## 🔐 Provably Fair

Every game uses HMAC-SHA256 with server seed + client seed + nonce:

1. Server generates seed, publishes SHA-256 hash
2. Outcome computed from both seeds
3. After game, server reveals seed
4. Players verify independently

## 💰 Revenue

- 3% house fee on all bets
- Premium: 0.5 TON/month (cosmetic only, no pay-to-win)

## 📋 Development Phases

1. **Foundation** — Setup, auth, basic UI ✅
2. **Core Games** — Coin Flip, Dice Roll, provably fair ✅
3. **Advanced Games** — Crash, Number Guess ✅
4. **Social & Premium** — Leaderboards, achievements, shop ✅
5. **Polish & Launch** — Telegram Bot, deployment

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| State | Zustand |
| TON | @tonconnect/ui-react, @ton/ton |
| Telegram | Telegram WebApp SDK (haptic, theme, user) |
| Backend | Node.js, Express, TypeScript, Socket.IO |
| Database | PostgreSQL, Prisma ORM v7 |
| Hosting | Vercel (FE), Railway (BE) |

## 📄 License

Private — All rights reserved
