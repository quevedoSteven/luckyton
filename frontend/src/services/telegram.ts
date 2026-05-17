export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    receiver?: TelegramUser
    chat?: { id: number; type: string; title?: string; username?: string }
    chat_type?: string
    chat_instance?: string
    auth_date: number
    hash: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  bottomBarColor: string
  isClosingConfirmationEnabled: boolean
  isVerticalSwipesEnabled: boolean
  BackButton: { isVisible: boolean; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void; show: () => void; hide: () => void }
  MainButton: { text: string; color: string; textColor: string; isVisible: boolean; isActive: boolean; isProgressVisible: boolean; show: () => void; hide: () => void; enable: () => void; disable: () => void; showProgress: (leaveActive: boolean) => void; hideProgress: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void; setText: (text: string) => void; setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void }
  HapticFeedback: { impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void; notificationOccurred: (type: 'error' | 'success' | 'warning') => void; selectionChanged: () => void }
  CloudStorage: { getItem: (key: string, callback: (error: string | null, value: string | null) => void) => void; setItem: (key: string, value: string, callback: (error: string | null) => void) => void; removeItem: (key: string, callback: (error: string | null) => void) => void; getItems: (keys: string[], callback: (error: string | null, values: (string | null)[]) => void) => void }
  ready: () => void
  expand: () => void
  close: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  onEvent: (eventType: string, eventHandler: () => void) => void
  offEvent: (eventType: string, eventHandler: () => void) => void
  sendData: (data: string) => void
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void
  openLink: (url: string, options?: { try_instant_view: boolean }) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

function getWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

export function isTelegram(): boolean {
  return getWebApp() !== null
}

export function getTelegramUser(): TelegramUser | null {
  return getWebApp()?.initDataUnsafe?.user ?? null
}

export function getTelegramInitData(): string | null {
  return getWebApp()?.initData ?? null
}

export function initTelegram() {
  const tg = getWebApp()
  if (!tg) return

  tg.ready()
  tg.expand()

  if (tg.colorScheme === 'dark') {
    document.documentElement.classList.add('telegram-dark')
  }

  return tg
}

export function hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
  getWebApp()?.HapticFeedback?.impactOccurred(style)
}

export function hapticSuccess() {
  getWebApp()?.HapticFeedback?.notificationOccurred('success')
}

export function hapticError() {
  getWebApp()?.HapticFeedback?.notificationOccurred('error')
}

export function hapticWarning() {
  getWebApp()?.HapticFeedback?.notificationOccurred('warning')
}
