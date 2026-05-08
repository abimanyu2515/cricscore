'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LeaderBoardHeader from '../components/leaderboard/LeaderBoardHeader';
import LeaderBoardTabs from '../components/leaderboard/LeaderBoardTabs';
import LeaderBoardList from '../components/leaderboard/LeaderBoardList';

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
    .sort((a, b) =>
      (b.computed_stats?.total_runs ?? 0) - (a.computed_stats?.total_runs ?? 0)
    )
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
    .sort((a, b) =>
      (b.computed_stats?.total_wickets ?? 0) - (a.computed_stats?.total_wickets ?? 0)
    )
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
    <p className="font-mono text-xs text-zinc-500 p-4">// LOADING...</p>
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