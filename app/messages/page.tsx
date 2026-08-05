'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'
import { DEMO_CONVERSATIONS } from '@/utils/demo-data'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

interface Conversation {
  otherUserId: string
  otherUserName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function MessagesList() {
  const router = useRouter()
  const supabase = createClient()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      if (isGuestMode()) {
        setConversations(DEMO_CONVERSATIONS)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch all messages for current user
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (msgError) {
        console.error('Error fetching messages:', msgError)
        setLoading(false)
        return
      }

      if (!messages || messages.length === 0) {
        setLoading(false)
        return
      }

      // Group by other user ID
      const groups: Record<string, Message[]> = {}
      messages.forEach((msg: Message) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!groups[otherId]) groups[otherId] = []
        groups[otherId].push(msg)
      })

      // Fetch profiles for all other users
      const otherUserIds = Object.keys(groups)
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', otherUserIds)

      if (profError) {
        console.error('Error fetching profiles:', profError)
        setLoading(false)
        return
      }

      const profileMap: Record<string, string> = {}
      profiles?.forEach((p: { id: string; full_name: string }) => profileMap[p.id] = p.full_name)

      // Map to Conversation objects
      const convos: Conversation[] = otherUserIds.map(otherId => {
        const userMsgs = groups[otherId]
        const lastMsg = userMsgs[0]
        const unreadCount = userMsgs.filter(m => m.receiver_id === user.id && !m.read).length

        return {
          otherUserId: otherId,
          otherUserName: profileMap[otherId] || 'Unknown Student',
          lastMessage: lastMsg.content,
          lastMessageTime: lastMsg.created_at,
          unreadCount
        }
      })

      // Sort by time
      convos.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
      
      setConversations(convos)
      setLoading(false)
    }

    fetchConversations()
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
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-inner">
                Inbox
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Messages</h1>
              <p className="text-slate-300 mt-3 font-medium text-lg">Connect and collaborate with your peers.</p>
            </div>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 group shadow-sm hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg> Back
            </Link>
          </div>
        </div>

        {conversations.length > 0 ? (
          <div className="premium-card rounded-[2.5rem] overflow-hidden divide-y divide-white/5 border-white/10 shadow-2xl">
            {conversations.map((convo) => (
              <Link 
                key={convo.otherUserId} 
                href={`/messages/${convo.otherUserId}`}
                className="flex items-center gap-6 p-8 hover:bg-white/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-white font-black text-2xl border border-white/10 group-hover:scale-110 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 shadow-inner">
                  {convo.otherUserName[0].toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-lg text-white group-hover:text-indigo-300 transition-colors">{convo.otherUserName}</h3>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      {new Date(convo.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-400 truncate pr-6 font-medium italic leading-relaxed">
                      "{convo.lastMessage}"
                    </p>
                    {convo.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-white/20 animate-pulse">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 premium-card rounded-[3rem]">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#msg-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="msg-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">No conversations yet</h3>
            <p className="text-slate-400 font-medium max-w-md mx-auto">Start a conversation by visiting a student's profile.</p>
            <Link 
              href="/students"
              className="mt-10 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg active:scale-95 inline-block"
            >
              Browse Students
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
