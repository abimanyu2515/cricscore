'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LeaderBoardHeader from '@/components/leaderboard/LeaderBoardHeader';
import LeaderBoardTabs from '@/components/leaderboard/LeaderBoardTabs';
import LeaderBoardTable from '@/components/leaderboard/LeaderBoardTable';
import type {
    leaderBoardTableColumnProps,
    leaderBoardTableRowProps,
    leaderboardPlayerProps,
} from '@/types/leaderboardProps';

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

const battingColumns: leaderBoardTableColumnProps[] = [
  { label: 'Matches' },
  { label: 'Inns' },
  { label: 'Runs' },
  { label: 'BF' },
  { label: 'Avg' },
  { label: 'STR' },
  { label: '4s' },
  { label: '6s' },
  { label: 'HS' },
  { label: '50s' },
  { label: '100s' },
  { label: 'NOs' },
]

const bowlingColumns: leaderBoardTableColumnProps[] = [
  { label: 'Matches' },
  { label: 'Inns' },
  { label: 'WKTS' },
  { label: 'Overs' },
  { label: 'ECO' },
  { label: 'Maidens' },
  { label: 'Runs Given' },
  { label: '3WI' },
  { label: '5WI' },
  { label: 'BBM' },
]

const Page = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'BATTING' | 'BOWLING'>('BATTING')
  const [players, setPlayers] = useState<leaderboardPlayerProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch('/api/players')
      const data: leaderboardPlayerProps[] = await res.json()
      setPlayers(data)
      setLoading(false)
    }
    fetchPlayers()
  }, [])

  // Sort by runs for batting
  const battingRows: leaderBoardTableRowProps[] = [...players]
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
          a.derived_stats?.batInnings,
          b.derived_stats?.batInnings
        )
        if (inningsOrder !== 0) return inningsOrder

        return 0
    })
    .map((player) => ({
      id: player.id,
      playerName: player.name,
      values: [
        player.computed_stats?.games_played ?? 0,
        player.derived_stats?.batInnings ?? 0,
        player.computed_stats?.total_runs ?? 0,
        player.derived_stats?.ballsFaced ?? 0,
        player.computed_stats?.batting_avg ?? '-',
        player.computed_stats?.strike_rate ?? '-',
        player.derived_stats?.fours ?? 0,
        player.derived_stats?.sixes ?? 0,
        player.computed_stats?.highest_score ?? 0,
        player.derived_stats?.fifties ?? 0,
        player.derived_stats?.hundreds ?? 0,
        player.derived_stats?.notOuts ?? 0,
      ],
    }))

  // Sort by wickets for bowling
  const bowlingRows: leaderBoardTableRowProps[] = [...players]
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
      values: [
        player.computed_stats?.games_played ?? 0,
        player.derived_stats?.bowlInnings ?? 0,
        player.computed_stats?.total_wickets ?? 0,
        (player.derived_stats?.oversBowled ?? 0).toFixed(1),
        player.computed_stats?.economy ?? '-',
        player.derived_stats?.maidens ?? 0,
        player.derived_stats?.runsGiven ?? 0,
        player.derived_stats?.threeWi ?? 0,
        player.derived_stats?.fiveWi ?? 0,
        player.computed_stats?.best_figures ?? '-',
      ],
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
        <LeaderBoardTable type='BATTING' columns={battingColumns} rows={battingRows} />
      ) : (
        <LeaderBoardTable type='BOWLING' columns={bowlingColumns} rows={bowlingRows} />
      )}
    </div>
  )
}

export default Page
