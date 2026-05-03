'use client'

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

const AdminHeader = () => {
  const router = useRouter()

  return (
    <div className="flex justify-between items-center font-mono">
        <button onClick={() => router.push("/")} className="flex items-center text-sm text-slate-500">
            <ChevronLeft width={16} />
            <span>EXIT ADMIN</span>
        </button>

        <h1 className="text-red-500">// ADMIN PANEL</h1>
    </div>
  )
}

export default AdminHeader