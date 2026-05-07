'use client'

import DateMatchRow from '@/app/components/addScore/DateMatchRow'
import ScoreAction from '@/app/components/addScore/ScoreAction'
import ScoreHeader from '@/app/components/addScore/ScoreHeader'
import StatInputCard from '@/app/components/addScore/StatInputCard'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'

const today = new Date()
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
const todayString = localToday.toISOString().slice(0, 10)

const Page = () => {
  const redirect = useRouter()
  const params =useParams()
  const playerId = params.id as string
  const [playerName, setPlayerName] = useState('')

  const [date, setDate] = useState(todayString)
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
    { label: 'HOW OUT', value: howOut, onChange: setHowOut, type: 'select' as const, options: ['NOT OUT', 'BOWLED', 'CAUGHT', 'RUN OUT', 'STUMPED'] },
  ]

  const bowlingFields = [
    { label: 'OVERS', value: overs, onChange: setOvers, type: 'number' as const },
    { label: 'RUNS GIVEN', value: runsGiven, onChange: setRunsGiven, type: 'number' as const },
    { label: 'WICKETS', value: wickets, onChange: setWickets, type: 'number' as const },
    { label: 'MAIDENS', value: maidens, onChange: setMaidens, type: 'number' as const },
  ]

  useEffect(() => {
    const fetchPlayer = async () => {
      const res = await fetch(`/api/players/${playerId}`)
      const data = await res.json()
      setPlayerName(data.name)
    }
    fetchPlayer()
  }, [playerId])

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/players/${playerId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_date: date,
          match_label: matchLabel,
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

      const data =  await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to save score')
        return
      }

      setRuns('')
      setBallsFaced('')
      setSingles('')
      setDoubles('')
      setTriples('')
      setFours('')
      setSixes('')
      setHowOut('NOT OUT')
      setOvers('')
      setRunsGiven('')
      setWickets('')
      setMaidens('')
      setMatchLabel('')
      setDate(todayString)

      alert('Score saved successfully')
    } catch (error) {
      alert('An error occurred while saving the score')
    }
  }

  return (
    <div>
        <ScoreHeader playerName={playerName} onBack={() => redirect.push('/')} />
        <DateMatchRow  
          date={date}
          onDateChange={setDate}
          matchLabel={matchLabel}
          onMatchLabelChange={setMatchLabel}
        />
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
        <ScoreAction onCancel={() => redirect.push('/')} onSave={handleSave} />
    </div>
  )
}

export default Page
