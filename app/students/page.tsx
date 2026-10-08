'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { demoStudents } from '@/utils/demo-store'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'

interface Profile {
  id: string
  full_name: string
  university: string
  year_of_study: string
  bio: string
  skills: string[]
}

export default function StudentsBrowse() {
  const supabase = createClient()
  
  const [students, setStudents] = useState<Profile[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('All Years')

  useEffect(() => {
    const fetchStudents = async () => {
      if (isGuestMode()) {
        setStudents(demoStudents())
        setFilteredStudents(demoStudents())
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

      if (error) {
        console.error('Error fetching students:', error)
        setRequestError('Could not load data. Check the backend connection and reload.')
      } else {
        setStudents(data || [])
        setFilteredStudents(data || [])
      }
      setLoading(false)
    }

    fetchStudents()
  }, [supabase])

  useEffect(() => {
    let result = students

    // Apply Year Filter
    if (yearFilter !== 'All Years') {
      result = result.filter(s => s.year_of_study === yearFilter)
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s => 
        s.full_name?.toLowerCase().includes(query) ||
        s.skills?.some(skill => skill.toLowerCase().includes(query))
      )
    }

    setFilteredStudents(result)
  }, [searchQuery, yearFilter, students])

  if (requestError) return <div role="alert" className="p-8 text-center"><p>{requestError}</p><button onClick={() => window.location.reload()} className="mt-4 underline">Reload</button></div>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 text-indigo-600 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    )
  }

  const commonSkills = ['React', 'Python', 'Design', 'Node.js', 'Figma', 'TypeScript', 'Marketing']

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-inner">
                Student Directory
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Browse Students</h1>
              <p className="text-slate-300 mt-3 font-medium text-lg">Find potential collaborators and friends across campus.</p>
            </div>
            <Link 
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 group shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg> Back to Dashboard
            </Link>
          </div>

          {/* Controls */}
          <div className="premium-card p-6 rounded-[2rem] mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-14 pr-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none shadow-inner text-white placeholder-slate-500 text-lg font-medium transition-all"
                  placeholder="Search by name, skill, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="md:w-48 px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white font-bold transition-all appearance-none cursor-pointer pr-12 shadow-inner"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a8b2d1\' stroke-width=\'3\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
              >
                <option value="All Years" className="bg-[#060213]">All Years</option>
                <option value="1st" className="bg-[#060213]">1st Year</option>
                <option value="2nd" className="bg-[#060213]">2nd Year</option>
                <option value="3rd" className="bg-[#060213]">3rd Year</option>
                <option value="4th" className="bg-[#060213]">4th Year</option>
                <option value="Graduate" className="bg-[#060213]">Graduate</option>
              </select>
            </div>

            {/* Skill Chips */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Popular Skills:</span>
              <div className="flex gap-2">
                {commonSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSearchQuery(searchQuery === skill ? '' : skill)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      searchQuery.toLowerCase().includes(skill.toLowerCase())
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Link 
                key={student.id} 
                href={`/students/${student.id}`}
                className="premium-card rounded-3xl p-6 flex flex-col h-full group"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-black text-xl group-hover:scale-110 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 shadow-inner">
                    {student.full_name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{student.full_name}</h3>
                    <p className="text-xs text-indigo-200/70 font-semibold uppercase tracking-wider">{student.university} • {student.year_of_study}</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 line-clamp-3 mb-6 flex-grow font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                  {student.bio || 'No bio provided.'}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {student.skills?.slice(0, 3).map((skill) => (
                    <span 
                      key={skill} 
                      className="px-2.5 py-1 bg-white/5 text-slate-200 text-[10px] font-black rounded-lg uppercase tracking-wider border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                  {student.skills?.length > 3 && (
                    <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-200 text-[10px] font-black rounded-lg uppercase tracking-wider border border-indigo-500/30">
                      +{student.skills.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 premium-card rounded-[3rem]">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#search-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg"><defs><linearGradient id="search-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">No students found</h3>
            <p className="text-slate-400 font-medium max-w-md mx-auto">We couldn't find anyone matching your current search criteria. Try adjusting your filters.</p>
            <button 
              onClick={() => {setSearchQuery(''); setYearFilter('All Years');}}
              className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
