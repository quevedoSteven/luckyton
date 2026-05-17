import { Routes, Route } from 'react-router-dom'
import { useTonWallet } from '@tonconnect/ui-react'
import BottomNav from './components/common/BottomNav'
import Header from './components/common/Header'
import Lobby from './pages/Lobby'
import CoinFlipGame from './pages/CoinFlipGame'
import DiceRollGame from './pages/DiceRollGame'
import CrashGame from './pages/CrashGame'
import NumberGuessGame from './pages/NumberGuessGame'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Shop from './pages/Shop'
import Particles from './components/common/Particles'

function App() {
  const wallet = useTonWallet()

  return (
    <div className="h-full w-full bg-bg-primary gradient-bg relative">
      <Particles />
      <div className="relative z-10 h-full flex flex-col max-w-lg mx-auto">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/coinflip" element={<CoinFlipGame />} />
            <Route path="/dice" element={<DiceRollGame />} />
            <Route path="/crash" element={<CrashGame />} />
            <Route path="/numberguess" element={<NumberGuessGame />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

export default App
