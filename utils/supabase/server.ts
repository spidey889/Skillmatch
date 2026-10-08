import { createServerClient } from '@supabase/ssr'
import { backendEnabled, supabaseUrl, supabaseKey } from './config'
import { cookies } from 'next/headers'

export async function createClient() {
  if (!backendEnabled) throw new Error('Supabase is disabled. Use guest mode.')
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
