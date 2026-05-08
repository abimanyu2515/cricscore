'use client'

import { ChevronLeft } from "lucide-react"

type AdminHeaderProps = {
  onExit?: () => void
}

const AdminHeader = ({ onExit }: AdminHeaderProps) => {

  return (
    <div className="flex justify-between items-center font-mono">
        <button onClick={onExit} className="flex items-center text-sm text-slate-500">
            <ChevronLeft width={16} />
            <span>EXIT ADMIN</span>
        </button>

        <h1 className="text-red-500">{'// ADMIN PANEL'}</h1>
    </div>
  )
}

export default AdminHeader
