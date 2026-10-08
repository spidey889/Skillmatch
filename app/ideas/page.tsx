'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { readDemo, writeDemo } from '@/utils/demo-store'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'

interface Pitch {
  id: string
  title: string
  description: string
  skills_needed: string[]
  creator_id: string
  revealed: boolean
  upvotes: number
  created_at: string
  creator_profile?: {
    full_name: string
  }
}

export default function IdeasPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const getData = async () => {
      if (isGuestMode()) {
        setUser({ id: 'guest-user' })
        setPitches(readDemo('pitches'))
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      fetchPitches()
    }
    getData()
  }, [])

  const fetchPitches = async () => {
    setLoading(true)
    const { data: pitchesData, error } = await supabase
      .from('idea_pitches')
      .select('*, creator_profile:profiles(full_name)')
      .order('upvotes', { ascending: false })

    if (error) {
      console.error('Error fetching pitches:', error)
        setRequestError('Could not load data. Check the backend connection and reload.')
    } else {
      setPitches(pitchesData || [])
    }
    setLoading(false)
  }

  const handleUpvote = async (pitchId: string) => {
    if (isGuestMode()) {
      if (readDemo('votes').includes(pitchId)) return
      writeDemo('votes', [...readDemo('votes'), pitchId])
      const next = readDemo('pitches').map(pitch => pitch.id === pitchId ? { ...pitch, upvotes: pitch.upvotes + 1 } : pitch)
      writeDemo('pitches', next); setPitches(next); return
    }

    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase.rpc('upvote_idea', { pitch_id: pitchId })

    if (error) setRequestError('Could not vote. Please try again.')
    else {
      setPitches(pitches.map(p => p.id === pitchId ? { ...p, upvotes: data as number } : p))
    }
  }

  const handleReveal = async (pitchId: string) => {
    if (isGuestMode()) {
      const next = readDemo('pitches').map(pitch => pitch.id === pitchId ? { ...pitch, revealed: true, creator_profile: { full_name: readDemo('profile').full_name } } : pitch)
      writeDemo('pitches', next); setPitches(next); return
    }

    const { error } = await supabase
      .from('idea_pitches')
      .update({ revealed: true })
      .eq('id', pitchId)

    if (error) setRequestError('Could not reveal the idea. Please try again.')
    else {
      fetchPitches() // Refresh to get profile info
    }
  }

  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault()
      if (!skillsNeeded.includes(currentSkill.trim())) {
        setSkillsNeeded([...skillsNeeded, currentSkill.trim()])
      }
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkillsNeeded(skillsNeeded.filter(skill => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    if (isGuestMode()) {
      const next = [{ id: crypto.randomUUID(), title, description, skills_needed: skillsNeeded, creator_id: 'guest-user', revealed: false, upvotes: 0, created_at: new Date().toISOString() }, ...readDemo('pitches')]
      writeDemo('pitches', next); setPitches(next)
      setIsModalOpen(false); setTitle(''); setDescription(''); setSkillsNeeded([])
      setFormLoading(false)
      return
    }

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('idea_pitches')
      .insert({
        title,
        description,
        skills_needed: skillsNeeded,
        creator_id: user.id
      })

    if (!error) {
      setIsModalOpen(false)
      setTitle('')
      setDescription('')
      setSkillsNeeded([])
      fetchPitches()
    }
    if (error) setRequestError('Could not save the idea. Please try again.')
    setFormLoading(false)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {requestError && <p role="alert" className="p-4 text-red-400">{requestError}</p>}
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-inner">
                Innovation Labs
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight">Idea Pitches</h1>
              <p className="text-slate-300 mt-3 font-medium text-lg">Pitch anonymously, get upvotes, and reveal your identity when you're ready.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 group shadow-sm hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg> Back
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] active:scale-95 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Submit Idea
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 text-indigo-400 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full"></div>
          </div>
        ) : pitches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pitches.map((pitch) => {
              const isOwner = user?.id === pitch.creator_id
              const showIdentity = pitch.revealed || isOwner
              
              return (
                <div key={pitch.id} className="premium-card rounded-[2.5rem] overflow-hidden flex flex-col group h-full">
                  <div className="p-10 flex-grow">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border transition-all duration-300 ${
                          showIdentity 
                            ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-white border-white/10 shadow-inner' 
                            : 'bg-white/5 text-slate-500 border-white/5'
                        }`}>
                          {showIdentity ? (pitch.creator_profile?.full_name?.[0] || 'U') : '?'}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Author</p>
                          <p className={`text-sm font-bold ${showIdentity ? 'text-white' : 'text-slate-500 italic'}`}>
                            {showIdentity ? (pitch.revealed ? pitch.creator_profile?.full_name : `${pitch.creator_profile?.full_name} (Private)`) : 'Anonymous Student'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <button 
                          onClick={() => handleUpvote(pitch.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-white transition-all text-slate-400 active:scale-95 shadow-inner group/vote"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/vote:-translate-y-0.5 transition-transform"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                          <span className="font-black text-xs">{pitch.upvotes}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white mb-4 group-hover:text-indigo-300 transition-colors leading-tight">{pitch.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-8 font-medium italic bg-black/20 p-4 rounded-2xl border border-white/5">
                      "{pitch.description}"
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {pitch.skills_needed?.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-black rounded-lg border border-white/10 uppercase tracking-widest">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-10 py-5 border-t border-white/5 bg-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {new Date(pitch.created_at).toLocaleDateString()}
                    </span>
                    {isOwner && !pitch.revealed && (
                      <button 
                        onClick={() => handleReveal(pitch.id)}
                        className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 underline underline-offset-4 tracking-widest uppercase"
                      >
                        Reveal Identity
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-32 premium-card rounded-[3rem]">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#idea-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="idea-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs><path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><circle cx="12" cy="17" r="1"/></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">No pitches yet</h3>
            <p className="text-slate-400 font-medium max-w-md mx-auto">Have a revolutionary idea? Pitch it anonymously to get feedback!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-10 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg active:scale-95"
            >
              Pitch Your Idea
            </button>
          </div>
        )}
      </div>

      {/* Submit Idea Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="premium-card w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-white/20">
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-10 py-8 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight">Pitch New Idea</h2>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mt-1">Your identity is hidden by default.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1 block">Project Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Decentralized Campus Marketplace"
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-bold transition-all shadow-inner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest ml-1 block">Pitch Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain your vision. Why should people care?"
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-medium leading-relaxed transition-all resize-none shadow-inner"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1 block">Target Skills</label>
                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-black/10 rounded-2xl border border-white/5 min-h-[50px]">
                  {skillsNeeded.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-200 text-xs font-black rounded-lg border border-white/10 uppercase tracking-widest">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a required skill..."
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-bold transition-all shadow-inner"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
              </div>

              <div className="pt-6 flex gap-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 border border-white/10 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/5 hover:text-white transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 shadow-lg active:scale-95"
                >
                  {formLoading ? 'Pitching...' : 'Submit Pitch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
