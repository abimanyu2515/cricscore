'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "./Sidebar"
import AssistantChat from "@/components/assistant/AssistantChat"
import StarBorder from "./StarBorder"

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

        <div className="flex items-center gap-3 lg:gap-6">
          {/* Desktop navbar: visible >= lg, hidden on mobile/tablet */}
          <StarBorder
            as="button"
            className="ask-lyst-star custom-class cursor-pointer shrink-0 lg:hidden"
            color="cyan"
            speed="1.5s"
            onClick={() => setAskOpen(true)}
            aria-label="Ask LYST"
          >
            <span className="animate-swap-yellow-blue inline-block mr-1.5">
              Ask
            </span>
            <span className="animate-swap-blue-yellow inline-block">
              LYST
            </span>
          </StarBorder>

          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
            <button
              onClick={() => router.push('/leaderboard')}
              className="group relative font-mono text-sm tracking-wide text-white transition-colors cursor-pointer py-1"
            >
              OVERALL STATS
              <span className="pointer-events-none absolute left-0 -bottom-1 h-[2px] w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="group relative font-mono text-sm tracking-wide text-white transition-colors cursor-pointer py-1"
            >
              MANAGE PLAYERS
              <span className="pointer-events-none absolute left-0 -bottom-1 h-[2px] w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
            </button>
          </nav>

          {/* Sidebar hamburger + drawer: visible < lg, hidden on desktop */}
          <div className="lg:hidden">
            <Sidebar />
          </div>
        </div>
      </div>
      <AssistantChat isOpen={askOpen} onClose={() => setAskOpen(false)} />
    </>
  )
}

export default TopNav
