'use client'

import DateMatchRow from '@/app/components/addScore/DateMatchRow'
import ScoreAction from '@/app/components/addScore/ScoreAction'
import ScoreHeader from '@/app/components/addScore/ScoreHeader'
import StatInputCard from '@/app/components/addScore/StatInputCard'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const today = new Date()
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
const todayString = localToday.toISOString().slice(0, 10)

const Page = () => {
  const redirect = useRouter()

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
    { label: 'HOW OUT', value: howOut, onChange: setHowOut, type: 'select' as const, options: ['NOT OUT', 'BOWLED', 'CAUGHT', 'LBW', 'RUN OUT', 'STUMPED'] },
  ]

  const bowlingFields = [
    { label: 'OVERS', value: overs, onChange: setOvers, type: 'number' as const },
    { label: 'RUNS GIVEN', value: runsGiven, onChange: setRunsGiven, type: 'number' as const },
    { label: 'WICKETS', value: wickets, onChange: setWickets, type: 'number' as const },
    { label: 'MAIDENS', value: maidens, onChange: setMaidens, type: 'number' as const },
  ]

  return (
    <div className='py-5'>
        <ScoreHeader playerName='Abimanyu S' onBack={() => redirect.push('/')} />
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
        <ScoreAction onCancel={() => redirect.push('/')} />
    </div>
  )
}

export default Page
