'use client'

import { AssistantMessage } from './AssistantMessage'
import { ArrowRightToLine } from 'lucide-react';
import { useState, useRef, useEffect } from 'react'

interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

interface AssistantChatProps {
  isOpen: boolean
  onClose: () => void
}

const GREETINGS = [
  "Hey! I'm LYST — your THUNDERBOLTS cricket assistant. Ask me anything about our players, match history, or overall stats. How can I help you lyst it today? 🏏",
  "Welcome back! LYST here, ready to break down all things about THUNDERBOLTS. What stats or match info are we diving into today? ⚡",
  "Ready for some THUNDERBOLTS action? I'm LYST, your dedicated cricket assistant. What would you like to know? 🏏",
];

const GREETING = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

export default function AssistantChat({ isOpen, onClose }: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: GREETING },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const history = newMessages.slice(-11, -1)
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      let data: { error?: string; detail?: string; text?: string; message?: string } = {}
      try {
        data = await res.json()
      } catch {
        // non-JSON body (e.g. Next.js error page) — fall through to status-based message
        data = {}
      }
      if (!res.ok) {
        // Prefer the mapped friendly `error` from the route; fall back to `detail` (raw Gemini msg)
        // so high-demand / quota / MAX_TOOL_ROUNDS are all surfaced verbatim in the chat.
        const rawError = data.error || data.detail || data.message
        const statusHint = !rawError ? `Request failed (${res.status}). Please try again.` : rawError
        // If route provided both error + detail and they differ, surface the friendly error.
        // The detail is kept for debugging via console but not concatenated to avoid duplicate noise
        // — the friendly error already encodes the failure mode (429 vs 503 vs tool loop).
        const displayText = rawError ?? statusHint
        // For generic 500 fallback where error=="Assistant failed to respond", prefer detail if present
        const finalText =
          data.error === 'Assistant failed to respond' && data.detail ? data.detail : displayText
        setMessages((prev) => [...prev, { role: 'model', text: finalText }])
      } else {
        const answer = typeof data.text === 'string' ? data.text : 'No response'
        setMessages((prev) => [...prev, { role: 'model', text: answer }])
      }
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : 'Network error — please try again.'
      setMessages((prev) => [...prev, { role: 'model', text: msg }])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 bg-black backdrop-blur-sm z-60" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed z-70 flex flex-col bg-blue-500 border border-cyan-500/30 shadow-2xl
          inset-x-3 bottom-3 top-2 rounded-xl overflow-hidden
          lg:inset-auto lg:bottom-4 lg:left-4 lg:right-4 lg:h-170 lg:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="LYST assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a3040] bg-[#111d2e]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-sans text-sm font-bold tracking-widest text-white">LYST</h2>
            <span className="font-sans text-sm tracking-widest text-white">- THUNDERBOLTS' ANALYST</span>
          </div>
          <button aria-label="Close LYST" onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-[#0d1420] font-sans">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`py-2 leading-relaxed whitespace-pre-wrap wrap-break-word sm:text-2xl lg:text-[18px] ${
                  m.role === 'user'
                    ? 'bg-[#fafa98] max-w-[80%] px-3 text-black font-semibold rounded-md'
                    : 'text-zinc-100 max-w-full'
                }`}
              >
                <AssistantMessage content={m.text} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="text-zinc-400 py-2 text-sm">LYST is analysing...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-[#1a3040] bg-[#111d2e] flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about runs, wickets, form…"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-4 py-2.5 sm:text-sm lg:text-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 font-sans"
            disabled={loading}
            aria-label="Message LYST"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black rounded-md p-2 text-sm font-sans font-bold cursor-pointer disabled:cursor-not-allowed transition-colors"
            aria-label="Send"
          >
            <ArrowRightToLine width={25} height={25} />
          </button>
        </div>
      </div>
    </>
  )
}
