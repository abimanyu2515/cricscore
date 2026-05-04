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
import AddPlayerDialog from "./components/AddPlayerDialog"

const page = () => {
  const router = useRouter()
  const handlers = useLongPress(
    () => router.push('/player/1/profile'),
    () => router.push('/player/1/add-score')
  )

  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [addPlayerTrigger, setAddPlayerTrigger] = useState(false)

  // When + NEW PLAYER card is tapped
  const handleAddPlayerCard = () => {
    setAddPlayerTrigger(true)  // remember why admin dialog was opened
    setShowAdminDialog(true)
  }

  // When admin PIN is verified
  const handleAdminVerified = () => {
    setShowAdminDialog(false)
    if (addPlayerTrigger) {
      setShowAddPlayer(true)   // open add player dialog
      setAddPlayerTrigger(false)
    } else {
      router.push('/admin')    // go to admin panel
    }
  }

  return (
    <div>
      <TopNav setShowAdminDialog={setShowAdminDialog} />
      <AdminPinDialog 
        isOpen={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
        onVerified={handleAdminVerified}
      />
      <AddPlayerDialog        // ← moved outside the grid
        isOpen={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        onCreate={(name, role) => {
          console.log(name, role)
          setShowAddPlayer(false)
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
        <AddPlayerCard onClick={handleAddPlayerCard} />
      </div>
      <BottomNav />
    </div>
  )
}

export default page