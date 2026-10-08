import { backendEnabled } from './supabase/config'

const GUEST_MODE_KEY = 'skillmatch-guest-mode'

export const GUEST_USER = {
  id: 'guest-user',
  email: 'guest@skillmatch.local',
} as const

export function enterGuestMode() {
  try { window.localStorage.setItem(GUEST_MODE_KEY, 'true') } catch { /* Default offline mode remains available. */ }
}

export function exitGuestMode() {
  try { window.localStorage.removeItem(GUEST_MODE_KEY) } catch { /* Storage may be blocked. */ }
}

export function isGuestMode() {
  if (!backendEnabled) return true
  try { return typeof window !== 'undefined' && window.localStorage.getItem(GUEST_MODE_KEY) === 'true' } catch { return false }
}
