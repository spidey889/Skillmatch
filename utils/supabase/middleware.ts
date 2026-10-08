import { createServerClient } from '@supabase/ssr'
import { backendEnabled, supabaseUrl, supabaseKey } from './config'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Guest mode is the default while the Supabase backend is unavailable.
  // Do not even construct an auth client in this mode: getUser() can perform
  // its own internal retries before a surrounding catch can run.
  if (!backendEnabled) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // The backend may be deleted or unreachable. Middleware must fail open and
  // never hold every request hostage to an auth refresh/network retry.
  try {
    await supabase.auth.getUser()
  } catch {
    // Continue as a guest when Supabase cannot be reached.
  }

  return supabaseResponse
}
