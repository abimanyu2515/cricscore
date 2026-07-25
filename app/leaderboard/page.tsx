'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LeaderBoardHeader from '../components/leaderboard/LeaderBoardHeader';
import LeaderBoardTabs from '../components/leaderboard/LeaderBoardTabs';
import LeaderBoardList from '../components/leaderboard/LeaderBoardList';

const compareOptionalNumbersAsc = (
  a: number | null | undefined,
  b: number | null | undefined
) => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

const parseBestFigures = (bestFigures: string | null | undefined) => {
  const [wicketsRaw = '0', runsRaw = '0'] = (bestFigures ?? '0/0').split('/')
  const wickets = Number.parseInt(wicketsRaw, 10)
  const runs = Number.parseInt(runsRaw, 10)

  return {
    wickets: Number.isFinite(wickets) ? wickets : 0,
    runs: Number.isFinite(runs) ? runs : 0,
  }
}

const Page = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'BATTING' | 'BOWLING'>('BATTING')
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch('/api/players')
      const data = await res.json()
      setPlayers(data)
      setLoading(false)
    }
    fetchPlayers()
  }, [])

  // Sort by runs for batting
  const battingPlayers = [...players]
    .sort((a, b) => {
          // 1. Primary: Total Runs (Descending)
        const runsA = a.computed_stats?.total_runs ?? 0;
        const runsB = b.computed_stats?.total_runs ?? 0;
        if (runsB !== runsA) return runsB - runsA;

        // 2. Tie-breaker 1: Batting Average (Descending)
        const avgA = a.computed_stats?.batting_avg ?? 0;
        const avgB = b.computed_stats?.batting_avg ?? 0;
        if (avgB !== avgA) return avgB - avgA;

        // 3. Tie-breaker 2: Strike Rate (Descending)
        const srA = a.computed_stats?.strike_rate ?? 0;
        const srB = b.computed_stats?.strike_rate ?? 0;
        if (srB !== srA) return srB - srA;

        // 4. Tie-breaker 3: Innings Played (Ascending - fewer is better)
        const inningsOrder = compareOptionalNumbersAsc(
          a.computed_stats?.innings,
          b.computed_stats?.innings
        )
        if (inningsOrder !== 0) return inningsOrder

        return 0
    })
    .map((player) => ({
      id: player.id,
      playerName: player.name,
      stats: [
        { label: 'RUNS', value: player.computed_stats?.total_runs ?? 0 },
        { label: 'AVG', value: player.computed_stats?.batting_avg ?? '-' },
        { label: 'SR', value: player.computed_stats?.strike_rate ?? '-' },
      ]
    }))

  // Sort by wickets for bowling
  const bowlingPlayers = [...players]
    .sort((a, b) => {
        // 1. Primary: Total Wickets (Descending)
        const wicketsA = a.computed_stats?.total_wickets ?? 0;
        const wicketsB = b.computed_stats?.total_wickets ?? 0;
        if (wicketsB !== wicketsA) return wicketsB - wicketsA;

        // 2. Tie-breaker 1: Economy Rate (Ascending - lower is better)
        const ecoA = a.computed_stats?.economy;
        const ecoB = b.computed_stats?.economy;
        const economyOrder = compareOptionalNumbersAsc(ecoA, ecoB)
        if (economyOrder !== 0) return economyOrder

        // 3. Tie-breaker 2: Bowling Average (Ascending - lower is better)
        const avgA = a.computed_stats?.bowling_avg;
        const avgB = b.computed_stats?.bowling_avg;
        const averageOrder = compareOptionalNumbersAsc(avgA, avgB)
        if (averageOrder !== 0) return averageOrder

        // 4. Tie-breaker 3: Best Bowling Figures (Descending)
        const { wickets: wicketsBestA, runs: runsBestA } = parseBestFigures(a.computed_stats?.best_figures)
        const { wickets: wicketsBestB, runs: runsBestB } = parseBestFigures(b.computed_stats?.best_figures)
        if (wicketsBestB !== wicketsBestA) return wicketsBestB - wicketsBestA;
        if (runsBestA !== runsBestB) return runsBestA - runsBestB;
        return 0
    })
    .map((player) => ({
      id: player.id,
      playerName: player.name,
      stats: [
        { label: 'WKTS', value: player.computed_stats?.total_wickets ?? 0 },
        { label: 'ECO', value: player.computed_stats?.economy ?? '-' },
        { label: 'BEST', value: player.computed_stats?.best_figures ?? '-' },
      ]
    }))

  if (loading) return (
    <p className="font-mono text-xs text-zinc-500 p-4">// LOADING OVERALL STATS...</p>
  )

  return (
    <div>
      <LeaderBoardHeader onBack={() => router.push('/')} />
      <LeaderBoardTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === 'BATTING' ? (
        <LeaderBoardList type='BATTING' players={battingPlayers} />
      ) : (
        <LeaderBoardList type='BOWLING' players={bowlingPlayers} />
      )}
    </div>
  )
}

export default Page