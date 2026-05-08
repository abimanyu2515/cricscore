'use client'

import ScoreHeader from '@/app/components/addScore/ScoreHeader'
import StatInputCard from '@/app/components/addScore/StatInputCard'
import ScoreAction from '@/app/components/addScore/ScoreAction'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
        alert('Failed to load score data')
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
        alert(data.error || 'Failed to update score')
        return
      }

      alert('Score updated successfully')
      router.back()
    } catch (error) {
      alert('An error occurred while updating the score')
    }
  }

  if (loading) return <div className="text-white text-center py-10">Loading...</div>

  return (
    <div>
      <ScoreHeader playerName={playerName} onBack={() => router.back()} />
      
      <div className="flex items-center gap-3 mt-4 font-mono text-xs">
        <span className="border border-zinc-700 px-3 py-1 rounded-md text-cyan-400">
          {date}
        </span>
        <span className="text-zinc-500">{matchLabel}</span>
      </div>

      <div className="flex items-center gap-2 mt-4 mb-4">
        <span className="font-mono text-xs text-yellow-500 uppercase tracking-widest">// EDITING PREVIOUS ENTRY</span>
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
      />
    </div>
  )
}

export default EditPage
