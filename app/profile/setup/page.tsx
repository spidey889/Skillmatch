'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'
import { DEMO_PROFILE } from '@/utils/demo-data'

export default function ProfileSetup() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState('')
  const [university, setUniversity] = useState('')
  const [yearOfStudy, setYearOfStudy] = useState('1st')

  useEffect(() => {
    const checkUser = async () => {
      if (isGuestMode()) {
        setFullName(DEMO_PROFILE.full_name)
        setBio(DEMO_PROFILE.bio)
        setSkills(DEMO_PROFILE.skills)
        setUniversity(DEMO_PROFILE.university)
        setYearOfStudy(DEMO_PROFILE.year_of_study)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      // Try to load existing profile if any
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (profile) {
        setFullName(profile.full_name || '')
        setBio(profile.bio || '')
        setSkills(profile.skills || [])
        setUniversity(profile.university || '')
        setYearOfStudy(profile.year_of_study || '1st')
      }
    }
    
    checkUser()
  }, [supabase, router])

  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault()
      if (!skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()])
      }
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isGuestMode()) {
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          bio,
          skills,
          university,
          year_of_study: yearOfStudy,
          updated_at: new Date().toISOString(),
        })

      if (upsertError) throw upsertError

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'An error occurred while saving your profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto premium-card rounded-[3rem] overflow-hidden shadow-2xl border-white/10">
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-10 py-10 border-b border-white/10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-6 shadow-inner">
            Identity Matrix
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Complete Your Profile</h1>
          <p className="text-slate-400 mt-2 font-medium">Give people a quick sense of what you do and what you want to build next.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold uppercase tracking-widest animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1 block">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-bold transition-all shadow-inner"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-[10px] font-black text-purple-300 uppercase tracking-widest ml-1 block">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              maxLength={200}
              className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-medium leading-relaxed transition-all resize-none shadow-inner"
              placeholder="Tell us about your interests and goals..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
              {bio.length}/200
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1 block">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2 p-4 bg-black/10 rounded-2xl border border-white/5 min-h-[60px]">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-200 text-xs font-black rounded-lg border border-white/10 uppercase tracking-widest"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </span>
              ))}
              {skills.length === 0 && <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic ml-1 mt-1">No skills added yet...</span>}
            </div>
            <input
              type="text"
              className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-bold transition-all shadow-inner"
              placeholder="Type a skill and press Enter..."
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={handleAddSkill}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="university" className="text-[10px] font-black text-emerald-300 uppercase tracking-widest ml-1 block">
                University/College
              </label>
              <input
                id="university"
                type="text"
                required
                className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-bold transition-all shadow-inner"
                placeholder="Stanford University"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="year" className="text-[10px] font-black text-amber-300 uppercase tracking-widest ml-1 block">
                Year of Study
              </label>
              <select
                id="year"
                className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-bold transition-all shadow-inner appearance-none cursor-pointer"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
              >
                <option value="1st" className="bg-slate-900 text-white">1st Year</option>
                <option value="2nd" className="bg-slate-900 text-white">2nd Year</option>
                <option value="3rd" className="bg-slate-900 text-white">3rd Year</option>
                <option value="4th" className="bg-slate-900 text-white">4th Year</option>
                <option value="Graduate" className="bg-slate-900 text-white">Graduate</option>
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest py-5 px-8 rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.2)] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Synchronizing...
                </span>
              ) : (
                'Save and Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
