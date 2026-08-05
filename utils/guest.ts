const GUEST_MODE_KEY = 'skillmatch-guest-mode'

export const GUEST_USER = {
  id: 'guest-user',
  email: 'guest@skillmatch.local',
} as const

export function enterGuestMode() {
  window.localStorage.setItem(GUEST_MODE_KEY, 'true')
}

export function exitGuestMode() {
  window.localStorage.removeItem(GUEST_MODE_KEY)
}

export function isGuestMode() {
  return typeof window !== 'undefined' && window.localStorage.getItem(GUEST_MODE_KEY) === 'true'
}
