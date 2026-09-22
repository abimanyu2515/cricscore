'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface AddMatchDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

const AddMatchDialog = ({ isOpen, onClose, onCreated }: AddMatchDialogProps) => {
  const [team1, setTeam1] = useState('Thunderbolts')
  const [score1, setScore1] = useState('')
  const [overs1, setOvers1] = useState('')
  const [team2, setTeam2] = useState('')
  const [score2, setScore2] = useState('')
  const [overs2, setOvers2] = useState('')
  const [location, setLocation] = useState('')
  const [matchType, setMatchType] = useState('PRACTICE MATCH')
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().split('T')[0])
  const [matchResultDesc, setMatchResultDesc] = useState('')
  const [matchResult, setMatchResult] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setTeam1('Thunderbolts')
    setScore1('')
    setOvers1('')
    setTeam2('')
    setScore2('')
    setOvers2('')
    setLocation('')
    setMatchType('PRACTICE MATCH')
    setMatchDate(new Date().toISOString().split('T')[0])
    setMatchResultDesc('')
    setMatchResult('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!matchDate.trim()) {
      toast.error('Match date is required')
      return
    }
    if (!team2.trim()) {
      toast.error('Team 2 name is required')
      return
    }
    if (!location.trim()) {
      toast.error('Location is required')
      return
    }
    if (!matchResultDesc.trim()) {
      toast.error('Match result description is required')
      return
    }
    if (matchResult === '') {
      toast.error('Match result is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_1: team1.trim() || 'Thunderbolts',
          score_1: score1.trim() === '' ? 0 : score1.trim(),
          overs_played_1: overs1.trim() === '' ? 0 : overs1.trim(),
          team_2: team2.trim(),
          score_2: score2.trim() === '' ? 0 : score2.trim(),
          overs_played_2: overs2.trim() === '' ? 0 : overs2.trim(),
          location: location.trim(),
          match_type: matchType,
          match_date: matchDate.trim(),
          match_result_desc: matchResultDesc.trim(),
          match_result: matchResult,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add match')
      }

      toast.success('Match added successfully')
      handleClose()
      onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="w-full max-w-md bg-zinc-900 border border-cyan-400 rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-xs text-cyan-400 tracking-widest">{'// ADD MATCH'}</span>
          <button onClick={handleClose} aria-label="Close add match dialog">
            <X width={16} height={16} className="text-zinc-500 hover:text-white" />
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">MATCH DATE</label>
            <input
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none [color-scheme:dark]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">TEAM 1 NAME</label>
            <input
              type="text"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              placeholder="Thunderbolts"
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">TEAM 1 SCORE</label>
            <input
              type="text"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              placeholder="e.g. 129/9"
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">OVERS PLAYED BY TEAM 1</label>
            <input
              type="text"
              value={overs1}
              onChange={(e) => setOvers1(e.target.value)}
              placeholder="e.g. 20.0"
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">TEAM 2 NAME</label>
            <input
              type="text"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              placeholder="Opponent name"
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">TEAM 2 SCORE</label>
            <input
              type="text"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              placeholder="e.g. 129/9"
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">OVERS PLAYED BY TEAM 2</label>
            <input
              type="text"
              value={overs2}
              onChange={(e) => setOvers2(e.target.value)}
              placeholder="e.g. 18.3"
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">LOCATION</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Pallikaranai"
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">MATCH TYPE</label>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            >
              <option value="PRACTICE MATCH">PRACTICE MATCH</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">MATCH RESULT DESCRIPTION</label>
            <input
              type="text"
              value={matchResultDesc}
              onChange={(e) => setMatchResultDesc(e.target.value)}
              placeholder="e.g. Thunderbolts won by 20 runs"
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-zinc-500 tracking-widest">MATCH RESULT</label>
            <select
              value={matchResult}
              onChange={(e) => setMatchResult(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-3 py-2.5 text-white font-mono text-sm focus:outline-none"
            >
              <option value="">Select result</option>
              <option value="true">Won</option>
              <option value="false">Lost</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-cyan-400 text-black font-mono font-bold text-sm tracking-widest py-3 rounded-md hover:bg-cyan-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'ADDING...' : 'ADD MATCH'}
        </button>
      </div>
    </div>
  )
}

export default AddMatchDialog
