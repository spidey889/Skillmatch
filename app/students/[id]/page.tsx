'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { isGuestMode } from '@/utils/guest'
import { demoStudents } from '@/utils/demo-store'
import { createClient } from '@/utils/supabase/client'

interface Profile {
  id: string
  full_name: string
  university: string
  year_of_study: string
  bio: string
  skills: string[]
}

export default function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  
  const [student, setStudent] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestError, setRequestError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudent = async () => {
      if (isGuestMode()) { setStudent(demoStudents().find(student => student.id === id) || null); setLoading(false); return }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching student:', error)
        setRequestError('Could not load data. Check the backend connection and reload.')
      } else {
        setStudent(data)
      }
      setLoading(false)
    }

    fetchStudent()
  }, [supabase, id])

  if (requestError) return <div role="alert" className="p-8 text-center"><p>{requestError}</p><button onClick={() => window.location.reload()} className="mt-4 underline">Reload</button></div>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 text-indigo-600 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="22" y2="13"/><line x1="22" y1="8" x2="17" y2="13"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Student not found</h1>
        <p className="text-slate-500 mt-2 mb-8">The student you are looking for doesn't exist or has a private profile.</p>
        <Link 
          href="/students"
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Back to Browse
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href="/students"
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
            Back to students
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
            </div>
          </div>

          <div className="px-8 pb-10">
            {/* Profile Info Section */}
            <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-md">
                  <div className="w-full h-full rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-4xl border-4 border-indigo-50">
                    {student.full_name?.[0].toUpperCase()}
                  </div>
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{student.full_name}</h1>
                  <p className="text-slate-500 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="m22 10-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    {student.university} • {student.year_of_study} Year
                  </p>
                </div>
              </div>
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Message
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    About
                  </h2>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed">
                    "{student.bio || 'This student hasn\'t added a bio yet.'}"
                  </div>
                </section>

                {/* Skills Section */}
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    Expertise & Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {student.skills?.length > 0 ? (
                      student.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm italic">No skills listed yet.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4">Verification</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Status</p>
                        <p className="text-sm font-semibold text-slate-700">Verified Student</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                  <p className="text-sm text-slate-400 font-medium">Interested in collaborating?</p>
                  <p className="text-xs text-slate-400 mt-1">Send a message to start a project together.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
