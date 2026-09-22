'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MatchHistoryFilterDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedMonths: string[]
  selectedYears: string[]
  onApply: (months: string[], years: string[]) => void
  onClear: () => void
  availableYears: number[]
}

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const MatchHistoryFilterDialog = ({
  isOpen,
  onClose,
  selectedMonths,
  selectedYears,
  onApply,
  onClear,
  availableYears,
}: MatchHistoryFilterDialogProps) => {
  const [draftMonths, setDraftMonths] = useState<string[]>(selectedMonths)
  const [draftYears, setDraftYears] = useState<string[]>(selectedYears)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftMonths(selectedMonths)
    setDraftYears(selectedYears)
  }, [selectedMonths, selectedYears])

  if (!isOpen) return null

  const toggleMonth = (value: string) => {
    setDraftMonths((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const toggleYear = (value: string) => {
    setDraftYears((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const handleApply = () => {
    onApply(draftMonths, draftYears)
    onClose()
  }

  const handleClear = () => {
    setDraftMonths([])
    setDraftYears([])
    onClear()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-xs text-cyan-400 tracking-widest">{'// FILTER MATCHES'}</span>
          <button onClick={onClose} aria-label="Close filter dialog">
            <X width={16} height={16} className="text-zinc-500 hover:text-white" />
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* Also keep select boxes for compatibility */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-month" className="font-mono text-xs text-zinc-500">
              Month (select)
            </label>
            <select
              id="filter-month"
              value={draftMonths[0] ?? ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') setDraftMonths([])
                else setDraftMonths([val])
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">Select month</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-year" className="font-mono text-xs text-zinc-500">
              Year (select)
            </label>
            <select
              id="filter-year"
              value={draftYears[0] ?? ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') setDraftYears([])
                else setDraftYears([val])
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">Select year</option>
              {availableYears.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 font-mono text-sm text-zinc-400 border border-zinc-700 rounded-md py-2.5 hover:border-zinc-500 hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="flex-1 font-mono text-sm text-cyan-400 border border-cyan-400 rounded-md py-2.5 hover:bg-cyan-400 hover:text-black transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default MatchHistoryFilterDialog
