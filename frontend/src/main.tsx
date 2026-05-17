import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { Buffer } from 'buffer'
import App from './App'
import './styles/globals.css'
import { initTelegram } from './services/telegram'

globalThis.Buffer = Buffer

const MANIFEST_URL = 'https://luckyton.vercel.app/tonconnect-manifest.json'
const TG_BOT_URL = 'https://t.me/your_bot'

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
