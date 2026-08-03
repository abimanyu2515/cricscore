'use client'

import ScoreHeader from '@/app/components/addScore/ScoreHeader'
import StatInputCard from '@/app/components/addScore/StatInputCard'
import ScoreAction from '@/app/components/addScore/ScoreAction'
import ConfirmDeleteDialog from '@/app/components/ConfirmDeleteDialog'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner';

const EditPage = () => {
  const params = useParams()
  const playerId = params.id as string
  const entryId = params.entryId as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [date, setDate] = useState('')
  const [matchLabel, setMatchLabel] = useState('')

  const [runs, setRuns] = useState('')
  const [ballsFaced, setBallsFaced] = useState('')
  const [singles, setSingles] = useState('')
  const [doubles, setDoubles] = useState('')
  const [triples, setTriples] = useState('')
  const [fours, setFours] = useState('')
  const [sixes, setSixes] = useState('')
  const [howOut, setHowOut] = useState('NOT OUT')
  const [overs, setOvers] = useState('')
  const [runsGiven, setRunsGiven] = useState('')
  const [wickets, setWickets] = useState('')
  const [maidens, setMaidens] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const battingFields = [
    { label: 'RUNS', value: runs, onChange: setRuns, type: 'number' as const },
    { label: 'BALLS FACED', value: ballsFaced, onChange: setBallsFaced, type: 'number' as const },
    { label: '1S', value: singles, onChange: setSingles, type: 'number' as const },
    { label: '2S', value: doubles, onChange: setDoubles, type: 'number' as const },
    { label: '3S', value: triples, onChange: setTriples, type: 'number' as const },
    { label: '4S', value: fours, onChange: setFours, type: 'number' as const },
    { label: '6S', value: sixes, onChange: setSixes, type: 'number' as const },
    { label: 'HOW OUT', value: howOut, onChange: setHowOut, type: 'select' as const, options: ['NOT OUT', 'BOWLED', 'CAUGHT', 'RUN OUT', 'STUMPED', 'LBW'] },
  ]

  const bowlingFields = [
    { label: 'OVERS', value: overs, onChange: setOvers, type: 'number' as const },
    { label: 'RUNS GIVEN', value: runsGiven, onChange: setRunsGiven, type: 'number' as const },
    { label: 'WICKETS', value: wickets, onChange: setWickets, type: 'number' as const },
    { label: 'MAIDENS', value: maidens, onChange: setMaidens, type: 'number' as const },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerRes, scoreRes] = await Promise.all([
          fetch(`/api/players/${playerId}`),
          fetch(`/api/players/${playerId}/scores/${entryId}`)
        ])

        const playerData = await playerRes.json()
        const scoreData = await scoreRes.json()

        setPlayerName(playerData.name)
        setDate(scoreData.match_date)
        setMatchLabel(scoreData.match_label)
        setRuns(scoreData.runs?.toString() || '')
        setBallsFaced(scoreData.balls_faced?.toString() || '')
        setSingles(scoreData.singles?.toString() || '')
        setDoubles(scoreData.doubles?.toString() || '')
        setTriples(scoreData.triples?.toString() || '')
        setFours(scoreData.fours?.toString() || '')
        setSixes(scoreData.sixes?.toString() || '')
        setHowOut(scoreData.how_out || 'NOT OUT')
        setOvers(scoreData.overs_bowled?.toString() || '')
        setRunsGiven(scoreData.runs_given?.toString() || '')
        setWickets(scoreData.wickets?.toString() || '')
        setMaidens(scoreData.maidens?.toString() || '')
      } catch (err) {
        toast.error('Failed to load score data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [playerId, entryId])

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/players/${playerId}/scores/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runs: Number(runs),
          balls_faced: Number(ballsFaced),
          singles: Number(singles),
          doubles: Number(doubles),
          triples: Number(triples),
          fours: Number(fours),
          sixes: Number(sixes),
          how_out: howOut,
          not_out: howOut === 'NOT OUT',
          overs_bowled: Number(overs),
          runs_given: Number(runsGiven),
          wickets: Number(wickets),
          maidens: Number(maidens),
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to update score')
        return
      }

      toast.success('Score updated successfully')
      router.back()
    } catch (error) {
      toast.error('An error occurred while updating the score')
    }
  }

  const handleDelete = () => {
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    setIsDeleteOpen(false)
    try {
      const res = await fetch(`/api/players/${playerId}/scores/${entryId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete score')
        return
      }
      toast.success('Score deleted successfully')
      router.push(`/player/${playerId}/profile`)
    } catch (error) {
      toast.error('An error occurred while deleting the score')
    }
  }

  if (loading) return (
    <p className="font-mono text-xs text-zinc-500 p-4">// LOADING EDIT SCORE...</p>
  )

  return (
    <div>
      <ScoreHeader playerName={playerName} onBack={() => router.back()} />
      
      <div className="flex items-center gap-3 mt-4 font-mono text-xs">
        <span className="border border-zinc-700 px-3 py-1 rounded-md text-cyan-400">
          {date}
        </span>
        <span className="text-cyan-400 text-[15px]">{matchLabel}</span>
      </div>

      <div className="flex items-center gap-2 mt-4 mb-4">
        <span className="font-mono text-xs text-red-500 uppercase tracking-widest">// EDITING PREVIOUS ENTRY</span>
      </div>

      <StatInputCard 
        title='BATTING'
        accentColor='cyan'
        fields={battingFields}
      />

      <StatInputCard 
        title='BOWLING'
        accentColor='purple'
        fields={bowlingFields}
      />

      <ScoreAction
        onSave={handleSave}
        onCancel={() => router.back()}
        onDelete={handleDelete}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        title="DELETE SCORE"
        message="Are you sure you want to delete this score? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  )
}

export default EditPage
