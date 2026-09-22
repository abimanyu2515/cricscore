'use client'

import type { MatchProps } from '@/types/matchesProps'

interface MatchResultCardProps {
  match: MatchProps
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  return `${n}${s[n % 10] ?? 'th'}`
}

function formatMatchDate(dateStr: string): string {
  if (!dateStr) return dateStr
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return dateStr
  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) return dateStr
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const dayName = dayNames[date.getDay()]
  const monthName = monthNames[date.getMonth()]
  return `${dayName}, ${getOrdinal(day)} ${monthName}`
}

const MatchResultCard = ({ match }: MatchResultCardProps) => {
  const team1 = (match.team_1 ?? 'THUNDERBOLTS').toUpperCase()
  const team2 = (match.team_2 ?? '').toUpperCase()
  const score1 = match.score_1 ?? 0
  const score2 = match.score_2 ?? 0
  const overs1 = match.overs_played_1 ?? 0
  const overs2 = match.overs_played_2 ?? 0
  const location = match.location
  const matchDate = formatMatchDate(match.match_date)
  const matchType = match.match_type
  const desc = match.match_result_desc

  return ( 
    <div className="rounded-2xl border border-zinc-400 bg-zinc-900/40 flex flex-col gap-2">
      <span className="font-mono bg-transparent border-b border-zinc-400 p-3 text-xs font-semibold text-[#b9e03c] tracking-widest uppercase">{desc}</span>

      <div className="flex flex-col gap-1 mt-1 px-3">
        <div>
          <p className="font-sans font-bold text-white text-lg uppercase">{team1}</p>
          <p className="font-mono font-bold text-md mt-1 text-white">
            {score1} <span className="font-light text-slate-400">({overs1})</span>
          </p>
        </div>
        <div className="mt-2.5">
          <p className="font-sans font-bold text-white text-lg uppercase">{team2}</p>
          <p className="font-mono font-bold text-md mt-1 text-white">
            {score2} <span className="font-light text-slate-400">({overs2})</span>
          </p>
        </div>
      </div>

      <span className="font-mono text-xs text-cyan-400 px-3 mt-2">
        {location.toUpperCase()} | {matchDate}
      </span>
      <span className="rounded-b-2xl font-mono font-semibold text-xs px-3 py-2 bg-zinc-800 border-t border-zinc-400 text-[#b9e03c] uppercase tracking-widest">{matchType}</span>
    </div>
  )
}

export default MatchResultCard
