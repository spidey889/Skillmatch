'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { readDemo, writeDemo, demoStudents, demoConversation } from '@/utils/demo-store'
import { createClient } from '@/utils/supabase/client'
import { isGuestMode } from '@/utils/guest'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let currentId: string | null = null
    let refreshing = false
    let cancelled = false
    const getData = async () => {
      if (isGuestMode()) {
        setCurrentUser({ id: 'guest-user', email: 'guest@skillmatch.local' })
        setOtherUser(demoStudents().find(student => student.id === userId) || null)
        const messages = demoConversation(userId).map(message => ({ ...message, read: true }))
        const ids = new Set(messages.map(message => message.id))
        writeDemo('messages', readDemo('messages').map(message => ids.has(message.id) ? { ...message, read: true } : message))
        setMessages(messages)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      currentId = user.id
      setCurrentUser(user)

      // Fetch other user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setOtherUser(profile)

      // Fetch messages
      fetchMessages(user.id)
    }

    const fetchMessages = async (currentId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentId})`)
        .order('created_at', { ascending: true })

      if (cancelled) return
      if (error) setRequestError("Could not refresh messages. Check the backend connection.")
      else {
        setRequestError(null)
        setMessages(data || [])
        
        // Mark as read
        const unreadIds = data
          ?.filter((m: Message) => m.receiver_id === currentId && !m.read)
          .map((m: Message) => m.id)
        if (unreadIds && unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadIds)
        }
      }
      setLoading(false)
      // Do not force-scroll on every background refresh; keep reading position.
    }

    getData().catch(() => { setRequestError('Could not load messages. Please reload.'); setLoading(false) })
    const timer = window.setInterval(async () => {
      if (!currentId || document.hidden || refreshing) return
      refreshing = true
      try { await fetchMessages(currentId) } catch { setRequestError('Could not refresh messages. Please try again.') } finally { refreshing = false }
    }, 5000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [supabase, userId, router])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !currentUser) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')
    if (isGuestMode()) {
      writeDemo('messages', [...readDemo('messages'), { id: crypto.randomUUID(), sender_id: 'guest-user', receiver_id: userId, content, read: false, created_at: new Date().toISOString() }])
      setMessages(demoConversation(userId)); setSending(false); scrollToBottom(); return
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: userId,
        content: content
      })

    if (error) {
      console.error('Error sending message:', error)
      setRequestError('Failed to send message. Your draft has been restored.')
      setNewMessage(content)
    } else {
      // Re-fetch or manually update state
      const { data: freshMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true })
      
      setMessages(freshMessages || [])
      setRequestError(null)
      scrollToBottom()
    }
    setSending(false)
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 text-indigo-600 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto border-x border-slate-200">
      {requestError && <p role="alert" className="p-4 text-red-600">{requestError}</p>}
      {/* Sticky Chat Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 p-4 flex items-center gap-4">
        <Link href="/messages" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
          {otherUser?.full_name?.[0].toUpperCase() || '?'}
        </div>
        <div>
          <h1 className="font-bold text-slate-900 leading-none">{otherUser?.full_name || 'Chat'}</h1>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Student</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto min-h-[calc(100vh-140px)]">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUser?.id
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                isMine 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMine && msg.read && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/><path d="m12 11 4 4 4-4"/></svg>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  )
}
