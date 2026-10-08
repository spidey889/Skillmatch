import { NextResponse } from 'next/server'
import { backendEnabled } from '@/utils/supabase/config'
// The client you created in Step 2
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Always redirect to dashboard after successful auth
  const next = searchParams.get('next') === '/profile/setup' ? '/profile/setup' : '/dashboard'

  if (!backendEnabled) return NextResponse.redirect(`${origin}/login?message=Backend+disabled.+Continue+as+Guest.`)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Error exchanging code for session:', error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
