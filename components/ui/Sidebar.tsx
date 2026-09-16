'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Prevent background scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Only show on homepage
  if (pathname !== '/') {
    return null
  }

  const handleNavigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        aria-label="Open sidebar"
        onClick={() => setOpen(true)}
        className="border border-cyan-400 z-50 p-2 rounded-md flex items-center justify-center hover:text-[#b9e03c] active:text-[#b9e03c] cursor-pointer"
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="text-cyan-400"
        >
          <line x1="3" y1="8" x2="21" y2="8" />
          <line x1="3" y1="16" x2="21" y2="16" />
        </svg>
      </button>

      {/* Overlay - mobile/tablet only (hidden on desktop via TopNav wrapper, but also ensure lg:hidden) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer - mobile/tablet drawer, hidden on desktop */}
      <div
        className={`fixed top-0 right-0 h-full w-full lg:w-150 bg-[#0d1420] border-l border-[#1a3040] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        {/* First row: Appname + close icon */}
        <div className="flex justify-between items-center p-5 border-b border-[#1a3040]">
          <h1 className="font-mono text-xl">
            <span className="text-cyan-300">CRIC</span>
            <span className="text-[#b9e03c]">SCORE</span>
          </h1>
          <button
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white cursor-pointer p-1"
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Menus - mobile/tablet sidebar */}
        <nav className="flex flex-col p-5 gap-4">
          <button
            onClick={() => handleNavigate('/leaderboard')}
            className="group relative flex items-center gap-3 text-white text-md font-mono hover:text-[#b9e03c] transition-colors cursor-pointer text-left w-fit"
          >
            OVERALL STATS
            <span className="pointer-events-none absolute left-0 -bottom-1 h-[2px] w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
          </button>
          <button
            onClick={() => handleNavigate('/admin')}
            className="group relative flex items-center gap-3 text-white text-md font-mono hover:text-[#b9e03c] transition-colors cursor-pointer text-left w-fit"
          >
            MANAGE PLAYERS
            <span className="pointer-events-none absolute left-0 -bottom-1 h-[2px] w-0 bg-[#b9e03c] transition-all duration-300 ease-out group-hover:w-full" />
          </button>
        </nav>
      </div>
    </>
  )
}

export default Sidebar
