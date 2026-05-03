'use client'

import ScoreHeader from '@/app/components/addScore/ScoreHeader'
import StatInputCard from '@/app/components/addScore/StatInputCard'
import ScoreAction from '@/app/components/addScore/ScoreAction'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const EditPage = ({ params }: { params: { id: string; entryId: string } }) => {
  const router = useRouter()
  
  // Static data for now
  const [runs, setRuns] = useState('65')
  const [ballsFaced, setBallsFaced] = useState('25')
  const [singles, setSingles] = useState('')
  const [doubles, setDoubles] = useState('')
  const [triples, setTriples] = useState('')
  const [fours, setFours] = useState('')
  const [sixes, setSixes] = useState('')
  const [howOut, setHowOut] = useState('NOT OUT')
  const [overs, setOvers] = useState('4')
  const [runsGiven, setRunsGiven] = useState('42')
  const [wickets, setWickets] = useState('3')
  const [maidens, setMaidens] = useState('0')
  const [wides, setWides] = useState('2')
  const [noBalls, setNoBalls] = useState('0')

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
    { label: 'WIDES', value: wides, onChange: setWides, type: 'number' as const },
    { label: 'NO-BALLS', value: noBalls, onChange: setNoBalls, type: 'number' as const },
  ]

  return (
    <div>
      <ScoreHeader playerName='Sam Curran' onBack={() => router.back()} />
      
      {/* Match Info Display */}
      <div className="flex items-center font-mono gap-5 mt-4 px-0 py-2">
        <div className="flex items-center gap-2 border border-zinc-700 px-3 py-1 rounded-md">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-slate-200">2025.03.28</span>
        </div>
        <div className="text-cyan-400 font-medium text-sm">
          VS METEORS
        </div>
      </div>

      {/* Editing Previous Entry Label */}
      <div className="flex items-center gap-2 mt-4 mb-4">
        <span className="font-mono text-xs text-yellow-500 uppercase tracking-widest">// EDITING PREVIOUS ENTRY</span>
      </div>

      {/* Batting Section */}
      <StatInputCard 
        title='BATTING'
        accentColor='cyan'
        fields={battingFields}
      />

      {/* Bowling Section */}
      <StatInputCard 
        title='BOWLING'
        accentColor='purple'
        fields={bowlingFields}
      />

      {/* Action Buttons */}
      <div className="mt-8">
        <ScoreAction onCancel={() => router.back()} />
      </div>
    </div>
  )
}

export default EditPage