'use client'

import AdminHeader from "../components/admin/AdminHeader"
import AdminPlayerList from "../components/admin/AdminPlayerList"
import ManagePlayers from "../components/admin/ManagePlayers"
import { PLAYER_DATA } from "../lib/constants"

const page = () => {
  return (
    <div>
        <AdminHeader />
        <ManagePlayers onAddPlayer={() => {}} />
        <AdminPlayerList players={PLAYER_DATA.map(({ pid, playerName, role }) => ({
          id: pid,
          playerName,
          role
        }))} />
    </div>
  )
}

export default page