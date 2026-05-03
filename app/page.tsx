'use client'

import AddPlayerCard from "./components/AddPlayerCard"
import BottomNav from "./components/BottomNav"
import FilterRow from "./components/FilterRow"
import PlayerCard from "./components/PlayerCard"
import TopNav from "./components/TopNav"
import { PLAYER_DATA } from "./lib/constants"
import useLongPress from "./hooks/useLongPress"
import { useRouter } from "next/navigation"
import { useState } from "react"
import AdminPinDialog from "./components/AdminPinDialog"

const page = () => {
  const router = useRouter()
  const handlers = useLongPress(
    () => router.push('/player/1/profile'),
    () => router.push('/player/1/add-score')
  )

  const [showAdminDialog, setShowAdminDialog] = useState(false)

  return (
    <div>
      <TopNav setShowAdminDialog={setShowAdminDialog} />
      <AdminPinDialog 
        isOpen={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
        onVerified={() => {
          setShowAdminDialog(false)
          router.push('/admin')
        }}
      />
      <FilterRow />
      <div className="grid grid-cols-2 lg:grid-cols-3 mt-6 gap-4">
        {
          PLAYER_DATA.map(({ pid, playerName, role, totalRuns, totalWickets }) => (
            <div {...handlers} key={pid}>
              <PlayerCard
                pid={pid}
                playerName={playerName}
                role={role}
                totalRuns={totalRuns}
                totalWickets={totalWickets}
              />
            </div>
          ))
        }      
        <AddPlayerCard />
      </div>
      <BottomNav />
    </div>
  )
}

export default page