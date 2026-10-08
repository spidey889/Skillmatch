import { DEMO_PROFILE, DEMO_PROJECTS, DEMO_PITCHES, DEMO_MESSAGES, DEMO_STUDENTS } from './demo-data'

const defaults = { profile: DEMO_PROFILE, projects: DEMO_PROJECTS, pitches: DEMO_PITCHES, messages: DEMO_MESSAGES, votes: [] as string[] }
type Store = typeof defaults
const memory: Partial<Store> = {}
const key = (name: keyof Store) => `skillmatch-demo-v1-${name}`

// Storage can be blocked or full. Keep this session usable even when persistence fails.
export function readDemo<K extends keyof Store>(name: K): Store[K] {
  if (memory[name]) return memory[name] as Store[K]
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(key(name))
      if (saved) {
        const parsed = JSON.parse(saved)
        if (name === 'profile' ? parsed && typeof parsed.full_name === 'string' && Array.isArray(parsed.skills) : Array.isArray(parsed)) return parsed as Store[K]
      }
    } catch { /* Ignore corrupt or unavailable browser storage. */ }
  }
  return structuredClone(defaults[name])
}

export function writeDemo<K extends keyof Store>(name: K, value: Store[K]) {
  if (typeof window === 'undefined') return
  memory[name] = value
  try { window.localStorage.setItem(key(name), JSON.stringify(value)) } catch { /* Session fallback above. */ }
}

export function demoStudents() {
  return DEMO_STUDENTS.map(student => student.id === DEMO_PROFILE.id ? readDemo('profile') : student)
}

export function demoConversation(userId: string) {
  return readDemo('messages').filter(message =>
    (message.sender_id === 'guest-user' && message.receiver_id === userId) ||
    (message.sender_id === userId && message.receiver_id === 'guest-user'))
}
