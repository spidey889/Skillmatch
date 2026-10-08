'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { readDemo, writeDemo } from '@/utils/demo-store'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'

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

export default function ProjectsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [projects, setProjects] = useState<Project[]>([])
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
    if (isGuestMode()) {
      setProjects(readDemo('projects'))
      setLoading(false)
      return
    }
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
        setRequestError('Could not load data. Check the backend connection and reload.')
    } else {
      setProjects(data || [])
    }
    setLoading(false)
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    if (isGuestMode()) {
      const next = [{ id: crypto.randomUUID(), title, description, skills_needed: skillsNeeded, creator_id: 'guest-user', members: ['guest-user'], status: 'open', created_at: new Date().toISOString() }, ...readDemo('projects')]
      writeDemo('projects', next)
      setProjects(next)
      setIsModalOpen(false)
      setTitle(''); setDescription(''); setSkillsNeeded([])
      setFormLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        skills_needed: skillsNeeded,
        creator_id: user.id,
        members: [user.id], // Creator is the first member
        status: 'open'
      })

    if (error) {
      console.error('Error creating project:', error)
      setRequestError('Could not create the project. Please try again.')
    } else {
      setIsModalOpen(false)
      setTitle('')
      setDescription('')
      setSkillsNeeded([])
      fetchProjects()
    }
    setFormLoading(false)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {requestError && <p role="alert" className="p-4 text-red-400">{requestError}</p>}
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-inner">
                Project Hub
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Community Projects</h1>
              <p className="text-slate-300 mt-3 font-medium text-lg">Find a project to join or start your own initiative.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 group shadow-sm hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg> Back
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] active:scale-95 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Create Project
              </button>
            </div>
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 text-indigo-400 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="premium-card rounded-3xl overflow-hidden flex flex-col group h-full">
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      project.status === 'open' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}>
                      {project.status}
                    </span>
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {project.members?.length || 0} Members
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-indigo-300 transition-colors">{project.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills_needed?.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-white/5 text-slate-300 text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-8 py-5 border-t border-white/5 bg-white/5">
                  <Link 
                    href={`/projects/${project.id}`}
                    className="w-full text-indigo-400 font-black text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 group"
                  >
                    View Project <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 premium-card rounded-[3rem]">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#project-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="project-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">No projects yet</h3>
            <p className="text-slate-400 font-medium max-w-md mx-auto">Be the first to start a project in your community!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95"
            >
              Start one now
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="premium-card w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-white/20">
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-10 py-8 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Start a Project</h2>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mt-1">Recruit collaborators for your vision</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1 block">Project Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Campus Study App"
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-bold transition-all shadow-inner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest ml-1 block">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What is your project about? What are your goals?"
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white font-medium leading-relaxed transition-all resize-none shadow-inner"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1 block">Skills Needed</label>
                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-black/10 rounded-2xl border border-white/5 min-h-[50px]">
                  {skillsNeeded.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-200 text-xs font-black rounded-lg border border-white/10 uppercase tracking-widest">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </span>
                  ))}
                  {skillsNeeded.length === 0 && <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic ml-1 mt-1">Add some skills below...</span>}
                </div>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter..."
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.2)] active:scale-95"
                >
                  {formLoading ? 'Creating...' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
