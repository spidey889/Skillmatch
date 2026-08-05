'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'

interface Badge {
  id: string
  badge_type: string
  earned_at: string
}

interface BadgeInfo {
  type: string
  title: string
  description: string
  icon: string
  color: string
}

const BADGE_DEFINITIONS: BadgeInfo[] = [
  {
    type: 'profile_complete',
    title: 'Profile Complete',
    description: 'You filled out your name, bio, and university!',
    icon: '👤',
    color: 'bg-green-500'
  },
  {
    type: 'skill_master',
    title: 'Skill Master',
    description: 'You have added 5 or more skills to your profile.',
    icon: '🎓',
    color: 'bg-purple-500'
  },
  {
    type: 'first_project',
    title: 'First Project',
    description: 'You started your very first community project.',
    icon: '🚩',
    color: 'bg-amber-500'
  },
  {
    type: 'team_player',
    title: 'Team Player',
    description: 'You have joined 3 or more collaboration teams.',
    icon: '🤝',
    color: 'bg-blue-500'
  }
]

export default function BadgesPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [newlyAwarded, setNewlyAwarded] = useState<string[]>([])

  useEffect(() => {
    const checkBadges = async () => {
      if (isGuestMode()) {
        setEarnedBadges(['profile_complete', 'skill_master'])
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Fetch all data needed for criteria
      const [
        { data: profile },
        { data: badges },
        { data: myCreatedProjects },
        { data: allProjects }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('badges').select('badge_type').eq('user_id', user.id),
        supabase.from('projects').select('id').eq('creator_id', user.id),
        supabase.from('projects').select('id, members')
      ])

      const currentBadges = (badges || []).map((b: Pick<Badge, 'badge_type'>) => b.badge_type)
      const joinedProjectsCount = (allProjects || []).filter(
        (p: { members?: string[] | null }) => p.members?.includes(user.id) ?? false
      ).length
      
      const toAward: string[] = []

      // 2. Check Criteria
      if (!currentBadges.includes('profile_complete')) {
        if (profile?.full_name && profile?.bio && profile?.university) {
          toAward.push('profile_complete')
        }
      }

      if (!currentBadges.includes('skill_master')) {
        if (profile?.skills && profile.skills.length >= 5) {
          toAward.push('skill_master')
        }
      }

      if (!currentBadges.includes('first_project')) {
        if (myCreatedProjects && myCreatedProjects.length > 0) {
          toAward.push('first_project')
        }
      }

      if (!currentBadges.includes('team_player')) {
        if (joinedProjectsCount >= 3) {
          toAward.push('team_player')
        }
      }

      // 3. Award new badges
      if (toAward.length > 0) {
        const insertData = toAward.map(type => ({
          user_id: user.id,
          badge_type: type
        }))
        
        const { error } = await supabase.from('badges').insert(insertData)
        if (!error) {
          setNewlyAwarded(toAward)
        }
      }

      setEarnedBadges([...currentBadges, ...toAward])
      setLoading(false)
    }

    checkBadges()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 text-indigo-600 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-inner">
                Hall of Fame
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Achievements</h1>
              <p className="text-slate-300 mt-3 font-medium text-lg">Track your progress and unlock special community badges.</p>
            </div>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 group shadow-sm hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg> Back
            </Link>
          </div>
        </div>

        {newlyAwarded.length > 0 && (
          <div className="mb-12 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 flex flex-col sm:flex-row items-center gap-8 animate-in slide-in-from-top-6 duration-700">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/20 animate-bounce">
              ✨
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black text-white tracking-tight">Phenomenal Work!</h2>
              <p className="text-indigo-100 font-medium text-lg mt-1">You just earned {newlyAwarded.length} new {newlyAwarded.length === 1 ? 'badge' : 'badges'}. Your influence is growing!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {BADGE_DEFINITIONS.map((badge) => {
            const isEarned = earnedBadges.includes(badge.type)
            return (
              <div 
                key={badge.type} 
                className={`premium-card rounded-[3rem] p-10 flex flex-col items-center text-center group transition-all duration-500 ${
                  isEarned 
                    ? 'border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:shadow-[0_0_50px_rgba(147,51,234,0.2)] hover:scale-105' 
                    : 'opacity-40 grayscale blur-[1px] border-white/5'
                }`}
              >
                {!isEarned && (
                  <div className="absolute top-8 right-10 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                )}
                
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-inner border transition-all duration-500 group-hover:rotate-6 ${
                  isEarned 
                    ? badge.color + ' border-white/20 shadow-white/10' 
                    : 'bg-white/5 border-white/5 text-slate-700'
                }`}>
                  {badge.icon}
                </div>

                <h3 className={`text-2xl font-black mb-3 tracking-tight ${isEarned ? 'text-white' : 'text-slate-600'}`}>
                  {badge.title}
                </h3>
                <p className={`text-sm leading-relaxed font-medium max-w-[200px] ${isEarned ? 'text-slate-400' : 'text-slate-700'}`}>
                  {badge.description}
                </p>

                {isEarned && (
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                    Legendary Status
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-20 premium-card p-12 rounded-[4rem] text-center bg-gradient-to-b from-white/5 to-transparent border-white/5 shadow-inner">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mb-8 rounded-full"></div>
          <h4 className="text-xl font-black text-white mb-3">More milestones are on the way.</h4>
          <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">Keep building, sharing, and helping others. New ways to show your progress can fit here later.</p>
        </div>
      </div>
    </div>
  )
}
