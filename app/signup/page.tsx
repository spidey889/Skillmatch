'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import NeuralCanvas from '@/components/NeuralCanvas'
import { enterGuestMode } from '@/utils/guest'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(searchParams.get('message'))

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Google signup error:', error.message)
      setMessage(error.message)
      setGoogleLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const origin = window.location.origin

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${origin}/auth/callback?next=/profile/setup`,
      },
    })

    setLoading(false)

    if (error) {
      console.error('Signup error:', error.message)
      setMessage(error.message)
      return
    }

    setMessage('Verification link sent! Please check your email to synchronize.')
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
            Create your profile, showcase your skills, and connect with thoughtful student collaborators.
          </p>
          
          <div className="mt-16 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[5,6,7,8].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#060213] bg-slate-800 shadow-xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    U{i}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Students building together</p>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-30">
          <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">SkillMatch for student builders</p>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative overflow-y-auto">
        <Link
          href="/"
          className="lg:hidden absolute left-8 top-8 p-3 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">Create Account</h1>
            <p className="text-slate-400 font-medium">Create a profile that makes it easier for the right collaborators to find you.</p>
          </div>

          {message && (
            <div className={`p-5 mb-8 text-xs font-black uppercase tracking-widest rounded-2xl ${message.includes('sent') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border animate-in fade-in slide-in-from-top-2`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex items-center justify-center gap-4 w-full px-6 py-4 bg-white/[0.04] border border-white/10 rounded-2xl text-white font-bold hover:bg-white/[0.08] hover:border-white/20 transition-all shadow-sm disabled:opacity-50 group"
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
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1" htmlFor="fullName">
                  Full name
                </label>
                <input
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-white font-bold shadow-inner"
                  name="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1" htmlFor="email">
                  Email address
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
                <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-1" htmlFor="password">
                  Password
                </label>
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
              className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-6 py-5 text-white text-xs font-black uppercase tracking-[0.2em] hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_24px_rgba(79,70,229,0.24)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : 'Create Account'}</span>
            </button>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="group w-full bg-transparent border border-white/15 rounded-2xl px-6 py-4 text-slate-300 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 hover:border-indigo-300/30 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <span>Continue as Guest</span>
            </button>

            <div className="text-center mt-8">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Existing identity found?{' '}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors ml-1">
                  Authenticate
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Signup() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  )
}
