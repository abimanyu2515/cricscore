'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type GuideStepperCardProps = {
  number: string
  title: string
  summary: string
  children: React.ReactNode
}

const GuideStepperCard = ({ number, title, summary, children }: GuideStepperCardProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <details className="group bg-black border border-zinc-700 rounded overflow-hidden transition-all duration-300 hover:border-zinc-600">
      <summary className="flex items-start gap-4 p-5 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50">
        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-black border border-[#b9e03c] flex items-center justify-center font-rajdhani font-bold text-[#b9e03c] text-lg">
          {number}
        </span>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-sans font-bold text-white text-base">{title}</h3>
          <p className="font-mono text-xs text-zinc-400 mt-1 line-clamp-2">{summary}</p>
        </div>
        <span className="flex-shrink-0 text-cyan-400 transition-transform duration-300 group-open:rotate-180" aria-hidden="true">
          {isOpen ? <ChevronUp width={20} height={20} /> : <ChevronDown width={20} height={20} />}
        </span>
      </summary>
      <div className="px-5 pb-5 pt-2 border-t border-zinc-800 animate-in fade-in-0 duration-200 ease-out">
        {children}
      </div>
    </details>
  )
}

export default GuideStepperCard