'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { readDemo } from '@/utils/demo-store'
import { createClient } from '@/utils/supabase/client'
import NeuralCanvas from '@/components/NeuralCanvas'
import { GUEST_USER, isGuestMode } from '@/utils/guest'

type ProjectRow = {
  title: string
  created_at: string
  creator_id: string
  members?: string[] | null
}

type IdeaRow = {
  title: string
  created_at: string
}

type BadgeRow = {
  badge_type: string
  earned_at: string
}

type MessageRow = {
  sender_id: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    const getData = async () => {
      if (isGuestMode()) {
        setUser(GUEST_USER)
        setProfile(readDemo('profile'))
        setActivities([
          ...readDemo('projects').filter(project => project.creator_id === GUEST_USER.id || project.members.includes(GUEST_USER.id)).map(project => ({ type: 'project', title: `${project.creator_id === GUEST_USER.id ? 'Started' : 'Joined'} "${project.title}"`, time: project.created_at, date: new Date(project.created_at), icon: '?' })),
          ...readDemo('pitches').filter(pitch => pitch.creator_id === GUEST_USER.id).map(pitch => ({ type: 'idea', title: `Pitched "${pitch.title}"`, time: pitch.created_at, date: new Date(pitch.created_at), icon: '?' })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5))
        setProjectCount(readDemo('projects').filter(project => project.members.includes(GUEST_USER.id)).length)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)

      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      // Fetch Activities in parallel
      const [
        { data: myProjects },
        { data: allProjects },
        { data: myIdeas },
        { data: myBadges },
        { data: myMessages }
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('projects').select('*'),
        supabase.from('idea_pitches').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('badges').select('*').eq('user_id', user.id).order('earned_at', { ascending: false }).limit(5),
        supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(5)
      ])

      // Calculate project count (creator + member)
      const joinedProjects = (allProjects || []).filter(
        (p: { members?: string[] | null }) => p.members?.includes(user.id) ?? false
      )
      setProjectCount(joinedProjects.length)

      // Consolidate activity
      const combined: any[] = []
      
      myProjects?.forEach((p: ProjectRow) => combined.push({ 
        type: 'project', 
        title: `Started "${p.title}"`, 
        time: p.created_at, 
        icon: '🚀',
        date: new Date(p.created_at)
      }))

      joinedProjects?.filter((p: ProjectRow) => p.creator_id !== user.id).forEach((p: ProjectRow) => combined.push({
        type: 'project',
        title: `Joined "${p.title}"`,
        time: p.created_at, // This should ideally be 'joined_at' if we had a join table
        icon: '🤝',
        date: new Date(p.created_at)
      }))

      myIdeas?.forEach((i: IdeaRow) => combined.push({
        type: 'idea',
        title: `Pitched "${i.title}"`,
        time: i.created_at,
        icon: '💡',
        date: new Date(i.created_at)
      }))

      myBadges?.forEach((b: BadgeRow) => combined.push({
        type: 'badge',
        title: `Earned "${b.badge_type.replace('_', ' ')}" badge`,
        time: b.earned_at,
        icon: '🏆',
        date: new Date(b.earned_at)
      }))

      myMessages?.forEach((m: MessageRow) => {
        const isSent = m.sender_id === user.id
        combined.push({
          type: 'message',
          title: isSent ? `Message sent` : `New message received`,
          time: m.created_at,
          icon: '💬',
          date: new Date(m.created_at)
        })
      })

      // Sort and limit
      setActivities(combined.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5))
      setLoading(false)
    }
    
    getData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-indigo-400 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full"></div>
      </div>
    )
  }

  const quotes = [
    "Good projects start with the right people.",
    "Small progress is still progress.",
    "The best ideas get better when they are shared.",
    "Make something useful, then make it better.",
    "A clear next step is enough for today.",
    "The strongest teams make room for different strengths.",
    "Start with the part you can do now."
  ]
  const todayQuote = quotes[new Date().getDate() % quotes.length]

  const completionPercentage = profile ? (
    (profile.full_name ? 20 : 0) +
    (profile.university ? 20 : 0) +
    (profile.year_of_study ? 20 : 0) +
    (profile.bio ? 20 : 0) +
    (profile.skills?.length > 0 ? 20 : 0)
  ) : 0

  const stats = [
    { label: 'Skills Added', value: profile?.skills?.length || 0, icon: '⚡', href: '/profile/setup' },
    { label: 'Projects Joined', value: projectCount, icon: '🚀', href: '/projects' },
    { label: 'Achievements', value: activities.filter(a => a.type === 'badge').length || 0, icon: '🏆', href: '/badges' },
  ]

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-10 border-b border-white/10 bg-[#0b1020]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(99,102,241,0.16),transparent_38%)] z-0"></div>
        
        {/* Neural Visualization */}
        <div className="absolute right-0 top-0 w-1/2 h-full z-0 opacity-80">
          <NeuralCanvas />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-400/10 border border-indigo-300/15 text-indigo-200 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Your workspace
              </div>
              <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-[-0.04em] mb-5">
                Welcome back, <span className="text-indigo-300">{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mb-4 leading-relaxed">“{todayQuote}”</p>
              
              {/* Profile Completion Bar */}
              <div className="max-w-md mt-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-300">Profile completion</span>
                  <span className="text-sm font-semibold text-indigo-300">{completionPercentage}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  {completionPercentage < 100 ? 'Add a little more detail so people know how to work with you.' : 'Your profile is ready to share.'}
                </p>
              </div>
            </div>
            
            {/* Right side spacer for canvas visibility */}
            <div className="hidden lg:block h-64"></div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {stats.map((stat) => (
            <Link 
              key={stat.label} 
              href={stat.href}
              className="premium-card rounded-2xl p-6 group flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-[0.98] shadow-lg border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-400/10 flex items-center justify-center text-2xl border border-indigo-300/10 group-hover:bg-indigo-400/20 transition-all duration-300">
                {stat.icon}
              </div>
              <div className="flex-grow">
                <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-semibold text-white tracking-tight">{stat.value}</p>
                  <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500/30 w-full group-hover:bg-indigo-500 transition-colors"></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            <section className="premium-card rounded-2xl overflow-hidden border-white/5">
              <div className="px-7 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="font-semibold text-white text-lg tracking-tight">Keep moving</h2>
                  <p className="text-sm text-slate-500 mt-1">Pick up where you left off.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-3 gap-2">
                <Link href="/students" className="p-5 rounded-xl hover:bg-white/5 transition-all duration-300 group border border-transparent hover:border-white/5">
                  <div className="w-11 h-11 bg-indigo-500/10 text-indigo-300 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">Students</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Find people with complementary skills.</p>
                </Link>
                
                <Link href="/projects" className="p-5 rounded-xl hover:bg-white/5 transition-all duration-300 group border border-transparent hover:border-white/5">
                  <div className="w-11 h-11 bg-purple-500/10 text-purple-300 rounded-xl flex items-center justify-center mb-5 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">Projects</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">See what is open and what needs help.</p>
                </Link>

                <Link href="/profile/setup" className="p-5 rounded-xl hover:bg-white/5 transition-all duration-300 group border border-transparent hover:border-white/5">
                  <div className="w-11 h-11 bg-sky-500/10 text-sky-300 rounded-xl flex items-center justify-center mb-5 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-sky-300 transition-colors">Profile</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Keep your skills and goals up to date.</p>
                </Link>
              </div>
            </section>

            {/* Recent Activity */}
            {activities.length > 0 && (
              <section className="premium-card rounded-2xl p-7 border-white/5">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="font-semibold text-white text-lg tracking-tight">Recent activity</h2>
                  <div className="w-10 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full"></div>
                </div>
                <div className="space-y-4">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group hover:bg-white/5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        {activity.icon}
                      </div>
                      <div className="flex-grow">
                        <p className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{activity.title}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">{formatTime(activity.date)}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]"></div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* User Status Sidebar */}
          <div className="space-y-8">
            <div className="premium-card p-7 rounded-2xl border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full"></div>
              
              <div className="flex items-center gap-3 mb-10">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse"></div>
                <h2 className="font-semibold text-white text-lg tracking-tight">About you</h2>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="text-xs font-medium text-indigo-300 mb-2 block ml-1">University</label>
                  <p className="text-white font-bold text-lg bg-black/20 px-5 py-3 rounded-2xl border border-white/5 shadow-inner">{profile?.university || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-purple-300 mb-2 block ml-1">Academic year</label>
                  <p className="text-white font-bold text-lg bg-black/20 px-5 py-3 rounded-2xl border border-white/5 shadow-inner">{profile?.year_of_study || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-sky-300 mb-2 block ml-1">Short bio</label>
                  <div className="relative">
                    <div className="absolute -left-2 top-0 text-white/10 text-4xl font-serif">"</div>
                    <p className="text-slate-300 text-sm italic bg-black/10 px-6 py-4 rounded-2xl border border-white/5 leading-relaxed">
                  {profile?.bio || 'No bio yet. Add one so people know what you want to build.'}
                    </p>
                  </div>
                </div>
                <div className="pt-6">
                  <Link 
                    href="/profile/setup" 
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-lg active:scale-95"
                  >
                    Edit profile <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
