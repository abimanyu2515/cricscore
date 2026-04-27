'use client'

import DateMatchRowProps from "@/types/dateMatchRowProps"
import { useMemo } from "react"

const DateMatchRow = ({ date, onDateChange, matchLabel, onMatchLabelChange }: DateMatchRowProps) => {
  const maxDate = useMemo(() => {
    const now = new Date()
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    return localNow.toISOString().slice(0, 10)
  }, [])

  return (
    <div className="flex items-center font-mono gap-5 mt-4 px-0 py-2">
      <div className="flex items-center gap-2 border border-zinc-700 px-3 py-1 rounded-md">
        <span className="w-2 h-2 rounded-full bg-[#b9e03c] shadow shadow-[#b9e03c]" />
        <input
          type="date"
          value={date}
          max={maxDate}
          onChange={(e) => {
            const nextValue = e.target.value
            onDateChange(nextValue > maxDate ? maxDate : nextValue)
          }}
          className="bg-transparent text-sm text-slate-200 focus:outline-none"
        />
      </div>

      <div className="w-full">
        <input 
          type="text" 
          value={matchLabel}
          onChange={(e) => onMatchLabelChange(e.target.value)}
          className="border-b w-full border-zinc-700 font-medium text-cyan-400 focus:outline-none focus:border-cyan-400" 
          placeholder="// MATCH LABEL" 
        />
      </div>
    </div>
  )
}

export default DateMatchRow
