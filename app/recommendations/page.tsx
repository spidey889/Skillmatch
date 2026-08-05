'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'
import { DEMO_PROFILE, DEMO_RECOMMENDATIONS } from '@/utils/demo-data'

interface Profile {
  id: string
  full_name: string
  university: string
  year_of_study: string
  bio: string
  skills: string[]
}

interface RecommendedStudent extends Profile {
  commonSkills: string[]
}

export default function RecommendationsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [recommendations, setRecommendations] = useState<RecommendedStudent[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getRecommendations = async () => {
      if (isGuestMode()) {
        setCurrentUserProfile(DEMO_PROFILE)
        setRecommendations(DEMO_RECOMMENDATIONS)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Fetch Current User Profile
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!myProfile) {
        setLoading(false)
        return
      }
      setCurrentUserProfile(myProfile)

      if (!myProfile.skills || myProfile.skills.length === 0) {
        setLoading(false)
        return
      }

      // 2. Fetch All Other Profiles
      const { data: others, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)

      if (error) {
        console.error('Error fetching profiles:', error)
        setLoading(false)
        return
      }

      // 3. Find Matches
      const matches: RecommendedStudent[] = (others || [])
        .map((other: Profile) => {
          const common = (other.skills || []).filter((skill: string) => 
            myProfile.skills.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase())
          )
          return { ...other, commonSkills: common }
        })
        .filter((match: RecommendedStudent) => match.commonSkills.length > 0)
        .sort((a: RecommendedStudent, b: RecommendedStudent) => b.commonSkills.length - a.commonSkills.length)

      setRecommendations(matches)
      setLoading(false)
    }

    getRecommendations()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 text-indigo-600 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    )
  }

  if (!currentUserProfile?.skills || currentUserProfile.skills.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 border border-indigo-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your skills are empty</h1>
        <p className="text-slate-500 mt-2 max-w-sm">Add skills to your profile to see students who share similar interests and expertise.</p>
        <Link 
          href="/profile/setup"
          className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
        >
          Add Skills Now
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Recommendations</h1>
            <p className="text-slate-600 mt-2">Based on your expertise in <span className="font-bold text-indigo-600">{currentUserProfile.skills.join(', ')}</span>.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Dashboard
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((student) => (
              <Link 
                key={student.id} 
                href={`/students/${student.id}`}
                className="group bg-white rounded-3xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col h-full relative overflow-hidden"
              >
                {/* Match Badge */}
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {student.commonSkills.length} {student.commonSkills.length === 1 ? 'Skill' : 'Skills'} Match
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-2xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                    {student.full_name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.full_name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{student.university}</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 line-clamp-2 mb-6 flex-grow leading-relaxed">
                  {student.bio || 'No bio provided.'}
                </p>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matching Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {student.commonSkills.map((skill) => (
                      <span 
                        key={skill} 
                        className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-green-100"
                      >
                        {skill}
                      </span>
                    ))}
                    {student.skills.filter(s => !student.commonSkills.includes(s)).slice(0, 2).map((skill) => (
                      <span 
                        key={skill} 
                        className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-slate-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No matches found</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">We couldn't find any students who share your specific skills yet. Try adding more skills or browsing all students.</p>
            <Link 
              href="/students"
              className="mt-10 inline-block bg-indigo-600 text-white px-10 py-4 rounded-3xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              Browse All Students
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
