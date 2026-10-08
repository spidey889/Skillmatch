import { createBrowserClient } from '@supabase/ssr'
import { backendEnabled, supabaseUrl, supabaseKey } from './config'

let client: ReturnType<typeof createBrowserClient> | undefined
export function createClient() {
  if (client) return client
  client = createBrowserClient(
    backendEnabled ? supabaseUrl : 'http://127.0.0.1:9',
    backendEnabled ? supabaseKey : 'demo-disabled',
    backendEnabled ? {} : {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { fetch: async () => new Response(JSON.stringify({ message: 'Backend disabled. Use guest mode.' }), { status: 503 }) },
    },
  )
  return client
}
