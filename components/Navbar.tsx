'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { isGuestMode } from '@/utils/guest'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [guestMode, setGuestMode] = useState(false)

  useEffect(() => {
    // The browser client intentionally has no persisted session. Do not make
    // a mount-time auth request to a backend that may be unavailable.
    setLoading(false)
    setGuestMode(isGuestMode())

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      if (session?.user) setGuestMode(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Don't show navbar on login/signup pages
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  if (isAuthPage) return null

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/students', label: 'Students' },
    { href: '/projects', label: 'Projects' },
    { href: '/ideas', label: 'Ideas' },
    { href: '/messages', label: 'Messages' },
    { href: '/badges', label: 'Badges' },
  ]

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] border border-white/20">
                <span className="text-white font-black text-3xl italic">S</span>
              </div>
              <span className="text-3xl font-black text-white tracking-tighter drop-shadow-md group-hover:text-indigo-300 transition-colors">SkillMatch</span>
            </Link>

            <div className="hidden lg:flex items-center gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                    pathname === link.href
                      ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
            {loading ? (
              <div className="h-12 w-12 bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>
            ) : user ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 group/user cursor-pointer">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5 opacity-70">Authenticated</p>
                    <p className="text-sm font-bold text-white group-hover/user:text-indigo-300 transition-colors">{user.email?.split('@')[0]}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-inner group-hover/user:scale-110 group-hover/user:from-indigo-500 group-hover/user:to-purple-500 transition-all duration-500 relative">
                    <span className="text-white font-black text-lg">
                      {user.email?.[0].toUpperCase()}
                    </span>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#060213] shadow-lg"></div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 group/logout active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/logout:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            ) : guestMode ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guest mode</span>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
