'use client'

import type { MatchProps } from '@/types/matchesProps'

interface MatchesOverviewProps {
  matches: MatchProps[]
}

const MatchesOverview = ({ matches }: MatchesOverviewProps) => {
  const played = matches.length
  const won = matches.filter((m) => m.match_result === true).length
  const loss = matches.filter((m) => m.match_result === false).length
  const winPercentage = played > 0 ? ((won / played) * 100).toFixed(1) : '0.0'

  const items = [
    { label: 'Matches Played', value: String(played) },
    { label: 'Won', value: String(won) },
    { label: 'Loss', value: String(loss) },
    { label: 'Win Percentage', value: `${winPercentage}%` },
  ]

  return (
    <div className="mt-6">
      <h1 className="text-3xl font-bold text-white">MATCHES OVERVIEW</h1>
      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="border border-zinc-600 rounded-lg px-4 py-4 bg-zinc-900/40 flex flex-col gap-1"
          >
            <span className="font-mono text-xs text-white tracking-widest uppercase">{item.label}</span>
            <span className="font-mono text-xl font-bold text-purple-400">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MatchesOverview
