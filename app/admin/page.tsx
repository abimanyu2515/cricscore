'use client'

import { useEffect, useState } from "react";
import AdminHeader from "../components/admin/AdminHeader"
import AdminPlayerList from "../components/admin/AdminPlayerList"
import ManagePlayers from "../components/admin/ManagePlayers"

const page = () => {
  const [players, setPlayers] = useState<Array<{
    id: string
    name: string
    role: string
  }>>([])

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch('/api/players')
      const data = await res.json()
      setPlayers(data)
    }
    fetchPlayers()
  }, [])

  const handleAddPlayer = async () => {
    const res = await fetch('/api/players')
    const data = await res.json()
    setPlayers(data)
  }

  return (
    <div>
        <AdminHeader />
        <ManagePlayers onAddPlayer={handleAddPlayer} />
        <AdminPlayerList players={players.map(({ id, name, role }) => ({
          id,
          playerName: name,
          role
        }))} />
    </div>
  )
}

export default page