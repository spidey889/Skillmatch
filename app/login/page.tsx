'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { backendEnabled } from '@/utils/supabase/config'
import NeuralCanvas from '@/components/NeuralCanvas'
import { enterGuestMode, exitGuestMode } from '@/utils/guest'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(searchParams.get('message'))

  const handleGoogleLogin = async () => {
    if (!backendEnabled) { setMessage('Backend disabled. Use Continue as Guest to try the app.'); return }
    exitGuestMode()
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Google login error:', error.message)
      setMessage(error.message)
      setGoogleLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!backendEnabled) { setMessage('Backend disabled. Use Continue as Guest to try the app.'); return }
    exitGuestMode()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error.message)
      setMessage(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleGuestContinue = () => {
    enterGuestMode()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#060213]">
      {/* Left Side: Branding & Visualization */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-black items-center justify-center p-12 border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <NeuralCanvas />
        </div>
        
        <div className="relative z-10 max-w-lg text-center lg:text-left">
          <Link href="/" className="inline-flex items-center gap-4 group mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] border border-white/20 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-4xl italic">S</span>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">SkillMatch</span>
          </Link>

          <h2 className="text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
            Connect.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Collaborate.</span><br />
            Create.
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Find thoughtful collaborators, share early ideas, and turn a good project into something real.
          </p>
          
          <div className="mt-16 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#060213] bg-slate-800 shadow-xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    U{i}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">500+ Students online</p>
          </div>
        </div>

        {/* Decorative footer element */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-30">
          <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">SkillMatch Systems v4.0</p>
          <div className="flex gap-4">
            <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
            <div className="w-1 h-1 rounded-full bg-purple-500"></div>
            <div className="w-1 h-1 rounded-full bg-pink-500"></div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative">
        <Link
          href="/"
          className="lg:hidden absolute left-8 top-8 p-3 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-12 text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl italic">S</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">SkillMatch</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">Welcome Back</h1>
            <p className="text-slate-400 font-medium">Initialize your session to continue creating.</p>
          </div>

          {message && (
            <div className="p-5 mb-8 text-xs font-black uppercase tracking-widest rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 animate-in fade-in slide-in-from-top-2">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex items-center justify-center gap-4 w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all shadow-sm disabled:opacity-50 group"
            >
              {googleLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="group-hover:scale-110 transition-transform">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  <span className="text-xs uppercase tracking-widest font-black">Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="bg-[#060213] px-4 text-slate-500">OR USE EMAIL</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1" htmlFor="email">
                  Email Identity
                </label>
                <input
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-white font-bold shadow-inner"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest" htmlFor="password">
                    Access Key
                  </label>
                  <button type="button" className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">Forgot Key?</button>
                </div>
                <input
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-white font-bold shadow-inner"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-6 py-5 text-white text-xs font-black uppercase tracking-[0.2em] hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] active:scale-[0.98] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Initializing...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-sm active:scale-[0.98]"
            >
              Continue as Guest
            </button>

            <div className="text-center mt-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                No access credentials?{' '}
                <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors ml-1">
                  Establish Identity
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* System footer for right side */}
        <div className="absolute bottom-12 text-[10px] font-black text-slate-600 uppercase tracking-widest hidden lg:block">
          SkillMatch Secure Gateway Protocol v4.0.1
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
