'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../components/admin/AdminHeader"
import AdminPlayerList from "../components/admin/AdminPlayerList"
import ManagePlayers from "../components/admin/ManagePlayers"
import AddPlayerDialog from "../components/AddPlayerDialog"
import AdminPinDialog from "../components/AdminPinDialog"
import { toast } from "sonner";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";

const Page = () => {
  const router = useRouter()
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [players, setPlayers] = useState<Array<{
    id: string
    name: string
    role: string
  }>>([])
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const refreshPlayers = async () => {
    setLoading(true)
    const res = await fetch('/api/players')
    const data = await res.json()
    setPlayers(data)
    setLoading(false)
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return

    const res = await fetch(`/api/players/${confirmDeleteId}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Failed to delete player', {
        unstyled: true,
        className: 'font-mono text-sm text-red-400 bg-zinc-900 border border-red-500 rounded-md p-3'
      })
      return
    }
    toast.success('Player deleted successfully')
    await refreshPlayers()
    setConfirmDeleteId(null)
  }

  useEffect(() => {
    if (!isPinVerified) return
    const fetchPlayers = async () => {
      setLoading(true)
      const res = await fetch('/api/players')
      const data = await res.json()
      setPlayers(data)
      setLoading(false)
    }
    fetchPlayers()
  }, [isPinVerified])

  if (!isPinVerified) {
    return (
      <AdminPinDialog
        isOpen
        onClose={() => router.push('/')}
        onVerified={() => setIsPinVerified(true)}
      />
    )
  }

  if (loading) return (
    <p className="font-mono text-xs text-zinc-500 p-4">// LOADING...</p>
  )

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

        <ConfirmDeleteDialog 
          isOpen={!!confirmDeleteId}
          title="DELETE PLAYER"
          message="Are you sure you want to delete this player? This will permanently remove all their match history and stats."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />

        <ManagePlayers onAddPlayer={() => setShowAddPlayer(true)} />
        <AdminPlayerList players={players.map(({ id, name, role }) => ({
          id,
          playerName: name,
          role,
          onUpdate: async (newName: string, newRole: string) => {
            const res = await fetch(`/api/players/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newName, role: newRole })
            })

            if (!res.ok) {
              toast.error('Failed to update player')
              return
            }
            toast.success('Player updated successfully')

            await refreshPlayers()
          },
          onDelete: async () => {
            setConfirmDeleteId(id)
          }
        }))} />
    </div>
  )
}

export default Page
