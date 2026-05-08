'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../components/admin/AdminHeader"
import AdminPlayerList from "../components/admin/AdminPlayerList"
import ManagePlayers from "../components/admin/ManagePlayers"
import AddPlayerDialog from "../components/AddPlayerDialog"

const Page = () => {
  const router = useRouter()
  const [players, setPlayers] = useState<Array<{
    id: string
    name: string
    role: string
  }>>([])
  const [showAddPlayer, setShowAddPlayer] = useState(false)

  const refreshPlayers = async () => {
    const res = await fetch('/api/players')
    const data = await res.json()
    setPlayers(data)
  }

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
        <AdminHeader onExit={() => router.push('/')} />
        <AddPlayerDialog
          isOpen={showAddPlayer}
          onClose={() => setShowAddPlayer(false)}
          onCreate={async () => {
            setShowAddPlayer(false)
            await refreshPlayers()
          }}
        />
        <ManagePlayers onAddPlayer={() => setShowAddPlayer(true)} />
        <AdminPlayerList players={players.map(({ id, name, role }) => ({
          id,
          playerName: name,
          role,
          onUpdate: async (newName: string, newRole: string) => {
            await fetch(`/api/players/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newName, role: newRole })
            })
            await refreshPlayers()
          },
          onDelete: async () => {
            if (!confirm('Are you sure you want to delete this player?')) return
            await fetch(`/api/players/${id}`, { method: 'DELETE' })
            await refreshPlayers()
          }
        }))} />
    </div>
  )
}

export default Page
