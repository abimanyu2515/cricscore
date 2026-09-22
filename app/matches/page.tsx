'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ListFilter } from 'lucide-react'
import MatchesOverview from '@/components/matches/MatchesOverview'
import MatchResults from '@/components/matches/MatchResults'
import AddMatchDialog from '@/components/matches/AddMatchDialog'
import MatchHistoryFilterDialog from '@/components/matches/MatchHistoryFilterDialog'
import type { MatchProps } from '@/types/matchesProps'

const Page = () => {
  const router = useRouter()
  const [matches, setMatches] = useState<MatchProps[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])

  const fetchMatches = async () => {
    const res = await fetch('/api/matches')
    const data: MatchProps[] = await res.json()
    if (Array.isArray(data)) {
      setMatches(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMatches()
  }, [])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    for (const m of matches) {
      const d = new Date(m.match_date)
      if (!isNaN(d.getTime())) years.add(d.getFullYear())
    }
    if (years.size === 0) {
      const currentYear = new Date().getFullYear()
      return [currentYear, currentYear - 1, currentYear - 2]
    }
    return Array.from(years).sort((a, b) => b - a)
  }, [matches])

  const isFilterActive = selectedMonths.length > 0 || selectedYears.length > 0

  const displayMatches = useMemo(() => {
    if (!isFilterActive) return matches
    return matches.filter((m) => {
      const d = new Date(m.match_date)
      if (isNaN(d.getTime())) return false
      const monthOk = selectedMonths.length === 0 || selectedMonths.includes(String(d.getMonth() + 1))
      const yearOk = selectedYears.length === 0 || selectedYears.includes(String(d.getFullYear()))
      // if both filters have values, need AND; if only one has, that one applies
      if (selectedMonths.length > 0 && selectedYears.length > 0) return monthOk && yearOk
      if (selectedMonths.length > 0) return monthOk
      return yearOk
    })
  }, [matches, selectedMonths, selectedYears, isFilterActive])

  const handleApply = (months: string[], years: string[]) => {
    setSelectedMonths(months)
    setSelectedYears(years)
  }

  const handleClear = () => {
    setSelectedMonths([])
    setSelectedYears([])
  }

  if (loading) {
    return <p className="font-mono text-xs text-zinc-500 p-4">{'// LOADING MATCHES...'}</p>
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/')} className="flex items-center font-mono text-xs text-slate-400">
          <ChevronLeft width={14} height={14} />
          BACK
        </button>

        <h1 className="text-sm text-cyan-300 font-mono">// MATCHES</h1>
      </div>

      <MatchesOverview matches={matches} />

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="font-mono text-sm text-slate-500">{'// MATCH RESULTS'}</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="font-mono text-xs px-3 py-1.5 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400 hover:text-black transition-colors"
            >
              ADD MATCH
            </button>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 font-mono text-xs px-3 py-1 border border-zinc-700 text-zinc-400 rounded hover:border-cyan-400 hover:text-cyan-400 transition-colors"
              aria-label="Open match history filter"
            >
              <ListFilter size={14} />
              FILTER
            </button>
          </div>
        </div>

        {isFilterActive && (
          <p className="font-mono text-xs text-slate-500 mt-2">
            Listing matches for {selectedMonths.join(',') || 'all months'} / {selectedYears.join(',') || 'all years'}
          </p>
        )}

        <MatchResults matches={displayMatches} />
      </div>

      <AddMatchDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={fetchMatches}
      />

      {isFilterOpen && (
        <MatchHistoryFilterDialog
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedMonths={selectedMonths}
          selectedYears={selectedYears}
          onApply={handleApply}
          onClear={handleClear}
          availableYears={availableYears}
        />
      )}
    </>
  )
}

export default Page
