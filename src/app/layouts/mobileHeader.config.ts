export type TopbarState = 'in-flow' | 'hidden' | 'floating'

export interface MobileHeaderConfig {
  title: string
  backTo?: string
  hideProfile?: boolean
}

export const MOBILE_TOPBAR_BREAKPOINT = '(max-width: 767px)'

export const TOPBAR_SCROLL_CONFIG = {
  minDelta: 2,
  hideDelta: 24,
  showDelta: 60,
  nearTop: 8,
  inFlowTop: 72,
} as const
