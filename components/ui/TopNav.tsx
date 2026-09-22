'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "./Sidebar"
import AssistantChat from "@/components/assistant/AssistantChat"

const TopNav = () => {
  const router = useRouter()
  const [askOpen, setAskOpen] = useState(false)

  return (
    <>
      <div className="flex justify-between text-white items-center gap-1">
        <div className="shrink-0">
          <h1 className="font-mono text-xl">
            <span className="text-cyan-300">CRIC</span><span className="text-[#b9e03c]">SCORE</span>
          </h1>
          <span className="text-xs text-slate-500 font-mono">// THUNDERBOLTS STATS TRACKER</span>
        </div>

        <div className="flex items-center lg:gap-6">
          <button
            onClick={() => setAskOpen(true)}
            aria-label="Ask LYST"
            className="group relative font-mono text-sm tracking-wide rounded-md border border-cyan-400 px-2.5 py-2 cursor-pointer shrink-0 xl:hidden"
          >
            <span className="animate-swap-yellow-blue inline-block mr-1.5">
              Ask
            </span>
            <span className="animate-swap-blue-yellow inline-block">
              LYST
            </span>
            <span className="pointer-events-none absolute left-0 -bottom-1 h-0.5 w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
          </button>

          <nav className="hidden xl:flex items-center gap-8" aria-label="Primary navigation">
            <button
              onClick={() => setAskOpen(true)}
              aria-label="Ask LYST"
              className="group relative font-mono text-sm tracking-wide text-white transition-colors cursor-pointer py-1"
            >
              <span className="animate-swap-yellow-blue inline-block mr-1.5">
                Ask
              </span>
              <span className="animate-swap-blue-yellow inline-block">
                LYST
              </span>
              <span className="pointer-events-none absolute left-0 -bottom-1 h-0.5 w-0 lg:bg-cyan-400 transition-all duration-300 ease-out group-hover:w-full" />
            </button>
            <button
              onClick={() => router.push('/matches')}
              className="group relative font-mono text-sm tracking-wide text-white transition-colors cursor-pointer py-1"
            >
              MATCHES
              <span className="pointer-events-none absolute left-0 -bottom-1 h-0.5 w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="group relative font-mono text-sm tracking-wide text-white transition-colors cursor-pointer py-1"
            >
              OVERALL STATS
              <span className="pointer-events-none absolute left-0 -bottom-1 h-0.5 w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="group relative font-mono text-sm tracking-wide text-white transition-colors cursor-pointer py-1"
            >
              MANAGE PLAYERS
              <span className="pointer-events-none absolute left-0 -bottom-1 h-0.5 w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
            </button>
            {/* <button
              onClick={() => router.push('/how-to-use')}
              className="group relative font-mono text-sm tracking-wide text-white transition-colors cursor-pointer py-1"
            >
              HOW TO USE
              <span className="pointer-events-none absolute left-0 -bottom-1 h-0.5 w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
            </button> */}
          </nav>

          <div className="xl:hidden shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
      <AssistantChat isOpen={askOpen} onClose={() => setAskOpen(false)} />
    </>
  )
}

export default TopNav
