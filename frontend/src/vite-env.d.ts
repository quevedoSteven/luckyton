/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_TON_NETWORK: string
  readonly VITE_TONCONNECT_MANIFEST_URL: string
  readonly VITE_TG_BOT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
