'use client'

import type { MatchProps } from '@/types/matchesProps'
import MatchResultCard from './MatchResultCard'

interface MatchResultsProps {
  matches: MatchProps[]
}

const MatchResults = ({ matches }: MatchResultsProps) => {
  if (matches.length === 0) {
    return <p className="font-mono text-xs text-slate-500 mt-3">No matches found.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
      {matches.map((m) => (
        <MatchResultCard key={m.id} match={m} />
      ))}
    </div>
  )
}

export default MatchResults
