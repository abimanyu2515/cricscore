'use client'

import { useMemo, useState } from 'react'
import { ListFilter } from 'lucide-react'
import MatchHistoryFilterDialog from './MatchHistoryFilterDialog'
import MatchHistoryItem from './MatchHistoryItem'

type MatchHistoryProps = {
  entries?: {
    date: string
    matchLabel: string
    batting: string
    bowling?: string
    onEdit: () => void
  }[]
}

const MatchHistory = ({ entries = [] }: MatchHistoryProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    for (const e of entries) {
      const d = new Date(e.date)
      if (!isNaN(d.getTime())) years.add(d.getFullYear())
    }
    if (years.size === 0) {
      const currentYear = new Date().getFullYear()
      return [currentYear, currentYear - 1, currentYear - 2]
    }
    return Array.from(years).sort((a, b) => b - a)
  }, [entries])

  const isFilterActive = selectedMonth !== '' && selectedYear !== ''

  const displayEntries = useMemo(() => {
    if (isFilterActive) {
      const monthNum = Number(selectedMonth)
      const yearNum = Number(selectedYear)
      return entries.filter((entry) => {
        const d = new Date(entry.date)
        if (isNaN(d.getTime())) return false
        return d.getMonth() + 1 === monthNum && d.getFullYear() === yearNum
      })
    }
    return entries.slice().filter((entry) => {
      const d = new Date(entry.date)
      if (isNaN(d.getTime())) return false
      return d.getFullYear() === new Date().getFullYear()
    }) // Return all entries from current year if no filter is active
  }, [entries, isFilterActive, selectedMonth, selectedYear])

  const handleApply = (month: string, year: string) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  const handleClear = () => {
    setSelectedMonth('')
    setSelectedYear('')
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <label className="font-mono text-sm text-slate-500">{'// MATCH HISTORY'}</label>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-1.5 font-mono text-xs px-3 py-1 border border-zinc-700 text-zinc-400 rounded hover:border-cyan-400 hover:text-cyan-400 transition-colors"
          aria-label="Open match history filter"
        >
          <ListFilter size={14} />
          FILTER
        </button>
      </div>

      {isFilterActive && (
        <p className="font-mono text-xs text-slate-500 mt-2">
          Listing matches for {selectedMonth}/{selectedYear}
        </p>
      )}

      {displayEntries.length > 0 ? (
        <div className="flex flex-col gap-3 mt-3">
          {displayEntries.map((entry) => (
            <MatchHistoryItem key={`${entry.date}-${entry.matchLabel}`} {...entry} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 italic mt-3">
          {isFilterActive ? 'No matches found for selected month.' : 'No match history available.'}
        </p>
      )}

      {isFilterOpen && (
        <MatchHistoryFilterDialog
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onApply={handleApply}
          onClear={handleClear}
          availableYears={availableYears}
        />
      )}
    </div>
  )
}

export default MatchHistory
