'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'
import { DEMO_PROJECTS } from '@/utils/demo-data'

interface Project {
  id: string
  title: string
  description: string
  skills_needed: string[]
  creator_id: string
  members: string[]
  status: string
  created_at: string
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  
  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const getData = async () => {
      if (isGuestMode()) {
        setProject(DEMO_PROJECTS.find((item) => item.id === id) || DEMO_PROJECTS[0])
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
      } else {
        setProject(data)
      }
      setLoading(false)
    }

    getData()
  }, [supabase, id])

  const handleJoin = async () => {
    if (!user || !project) return
    setActionLoading(true)
    
    const newMembers = [...(project.members || []), user.id]
    
    const { error } = await supabase
      .from('projects')
      .update({ members: newMembers })
      .eq('id', id)

    if (error) {
      console.error('Error joining project:', error)
      alert('Error joining project. Please try again.')
    } else {
      setProject({ ...project, members: newMembers })
    }
    setActionLoading(false)
  }

  const handleLeave = async () => {
    if (!user || !project) return
    setActionLoading(true)
    
    const newMembers = (project.members || []).filter(m => m !== user.id)
    
    const { error } = await supabase
      .from('projects')
      .update({ members: newMembers })
      .eq('id', id)

    if (error) {
      console.error('Error leaving project:', error)
      alert('Error leaving project. Please try again.')
    } else {
      setProject({ ...project, members: newMembers })
    }
    setActionLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return
    setActionLoading(true)
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project.')
    } else {
      router.push('/projects')
      router.refresh()
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 text-indigo-600 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Project not found</h1>
        <p className="text-slate-500 mt-2 mb-8">This project might have been removed or the link is broken.</p>
        <Link 
          href="/projects"
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Back to Projects
        </Link>
      </div>
    )
  }

  const isCreator = user?.id === project.creator_id
  const isMember = project.members?.includes(user?.id)

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href="/projects"
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
            Back to projects
          </Link>

          {isCreator && (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                Edit
              </button>
              <button 
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    project.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    Created on {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                  {project.title}
                </h1>
              </div>

              {!isCreator && (
                <button 
                  onClick={isMember ? handleLeave : handleJoin}
                  disabled={actionLoading || !user}
                  className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    isMember 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-slate-100' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                  } disabled:opacity-50`}
                >
                  {actionLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : isMember ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Leave Project
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                      Join Project
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
                  <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                    {project.description}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Required Skills</h2>
                  <div className="flex flex-wrap gap-3">
                    {project.skills_needed?.map((skill) => (
                      <span 
                        key={skill} 
                        className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold rounded-2xl tracking-tight"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Project Team
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                      <span className="text-sm font-medium text-slate-500">Current Members</span>
                      <span className="text-lg font-black text-indigo-600">{project.members?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-slate-500">Max Capacity</span>
                      <span className="text-lg font-black text-slate-400">∞</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Project Creator</p>
                    <Link href={`/students/${project.creator_id}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-bold shadow-sm group-hover:border-indigo-200 transition-all">
                        C
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">View Creator Profile</span>
                    </Link>
                  </div>
                </div>

                {!user && (
                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center text-center">
                    <p className="text-sm text-amber-800 font-bold mb-2">Want to join?</p>
                    <Link href="/login" className="text-sm font-bold text-amber-900 underline underline-offset-4">Sign in to participate</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
