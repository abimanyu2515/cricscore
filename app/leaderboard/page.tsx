'use client'

import { useRouter } from "next/navigation"
import LeaderBoardHeader from "../components/leaderboard/LeaderBoardHeader"
import LeaderBoardTabs from "../components/leaderboard/LeaderBoardTabs"
import { useState } from "react"
import LeaderBoardList from "../components/leaderboard/LeaderBoardList"

const page = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"BATTING" | "BOWLING">("BATTING")

  const battingPlayers = [
  {
    id: 1,
    playerName: 'VIRAT K',
    stats: [
      { label: 'RUNS', value: 88 },
      { label: 'AVG', value: 88.5 },
      { label: 'SR', value: 163.1 },
    ]
  },
  {
    id: 2,
    playerName: 'Talari J reuben',
    stats: [
      { label: 'RUNS', value: 57 },
      { label: 'AVG', value: 28.5 },
      { label: 'SR', value: 121.3 },
    ]
  },
  {
    id: 3,
    playerName: 'SAM CURRAN',
    stats: [
      { label: 'RUNS', value: 0 },
      { label: 'AVG', value: '-' },
      { label: 'SR', value: '-' },
    ]
  },
]

const bowlingPlayers = [
  {
    id: 1,
    playerName: 'SAM CURRAN',
    stats: [
      { label: 'WKTS', value: 3 },
      { label: 'ECO', value: 10.5 },
      { label: 'BEST', value: '3/42' },
    ]
  },
  // ... rest of players
]

  return (
    <>
        <LeaderBoardHeader 
            onBack={() => router.back()}
        />
        <LeaderBoardTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
        />
        <LeaderBoardList 
            type={activeTab}
            players={activeTab === 'BATTING' ? battingPlayers : bowlingPlayers}
        />
    </>
  )
}

export default page