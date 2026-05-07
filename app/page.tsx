'use client'

import AddPlayerCard from "./components/AddPlayerCard"
import BottomNav from "./components/BottomNav"
import FilterRow from "./components/FilterRow"
import TopNav from "./components/TopNav"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AddPlayerDialog from "./components/AddPlayerDialog"
import AdminPinDialog from "./components/AdminPinDialog"
import PlayerCardWrapper from "./components/PlayerCardWrapper"

const page = () => {
  const router = useRouter()

  const [players, setPlayers] = useState<Array<{
    id: string
    name: string
    role: string
    computed_stats: {
      total_runs: number
      total_wickets: number
    } | null
  }>>([])

  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)

  // When + NEW PLAYER card is tapped
  const handleAddPlayerCard = () => {
    setShowAddPlayer(true)
  }

  // Fetching player data from supabase
  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch('/api/players')
      const data = await res.json()
      setPlayers(data)
    }
    fetchPlayers()
  }, [])

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
      <AddPlayerDialog        // ← moved outside the grid
        isOpen={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        onCreate={async () => {
          setShowAddPlayer(false)
          const res = await fetch('/api/players')
          const data = await res.json()
          setPlayers(data)
        }}
      />
      <FilterRow />
      <div className="grid grid-cols-2 lg:grid-cols-3 mt-6 gap-4">
        {
          players.map(({ id, name, role, computed_stats }) => (
            <PlayerCardWrapper
              key={id}
              id={id}
              name={name}
              role={role}
              computed_stats={computed_stats}
            />
          ))
        }
        <AddPlayerCard onClick={handleAddPlayerCard} />
      </div>
      <BottomNav />
    </div>
  )
}

export default page