import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App'
import './styles/globals.css'
import { initTelegram } from './services/telegram'

const MANIFEST_URL: `${string}://${string}` = (import.meta.env.VITE_TONCONNECT_MANIFEST_URL as any) || 'https://luckyton.vercel.app/tonconnect-manifest.json'
const TG_BOT_URL: `${string}://${string}` = (import.meta.env.VITE_TG_BOT_URL as any) || 'https://t.me/luckyton_bot'

initTelegram()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider
      manifestUrl={MANIFEST_URL}
      actionsConfiguration={{
        twaReturnUrl: TG_BOT_URL,
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TonConnectUIProvider>
  </React.StrictMode>,
)
