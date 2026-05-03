'use client'

import AdminHeader from "../components/admin/AdminHeader"
import AdminPlayerList from "../components/admin/AdminPlayerList"
import ManagePlayers from "../components/admin/ManagePlayers"

const page = () => {
  return (
    <div>
        <AdminHeader />
        <ManagePlayers onAddPlayer={() => {}} />
        <AdminPlayerList />
    </div>
  )
}

export default page