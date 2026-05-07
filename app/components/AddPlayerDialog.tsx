'use client'

import { useState } from "react"
import { X } from "lucide-react"

type AddPlayerDialogProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, role: string) => void
}

const AddPlayerDialog = ({ isOpen, onClose, onCreate }: AddPlayerDialogProps) => {
  const [name, setName] = useState('')
  const [role, setRole] = useState('Batsman')

  if (!isOpen) return null

  const handleCreate = async () => {
    if (!name.trim()) return // name is required

    try {
      const res = await fetch('api/players', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: name.trim(), role })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create player')
      }

      onCreate(data.name, data.role)
      setName('')
      setRole('Batsman')
    } catch (err) {
        console.error('Error creating player:', err)
        alert(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  const handleClose = () => {
    setName('')
    setRole('Batsman')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="w-full bg-zinc-900 border border-cyan-400 rounded-xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-xs text-cyan-400 tracking-widest">
            // ADD NEW PLAYER
          </span>
          <button onClick={handleClose}>
            <X width={16} height={16} className="text-zinc-500 hover:text-white" />
          </button>
        </div>

        {/* Name field */}
        <label className="font-mono text-xs text-zinc-500 tracking-widest">NAME</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="PLAYER NAME"
          className="w-full mt-2 mb-4 bg-zinc-800 border border-zinc-600 
            focus:border-cyan-400 rounded-md px-4 py-3 text-white 
            font-rajdhani font-bold text-lg placeholder-zinc-600 
            focus:outline-none"
        />

        {/* Role field */}
        <label className="font-mono text-xs text-zinc-500 tracking-widest">ROLE</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mt-2 mb-6 bg-zinc-800 border border-zinc-600 
            focus:border-cyan-400 rounded-md px-4 py-3 text-white 
            font-rajdhani font-bold text-lg focus:outline-none"
        >
          <option value="Batsman">Batsman</option>
          <option value="Bowler">Bowler</option>
          <option value="All-rounder">All-Rounder</option>
        </select>

        {/* Create button */}
        <button
          onClick={handleCreate}
          className="w-full bg-cyan-400 text-black font-rajdhani font-bold 
            text-sm tracking-widest py-3 rounded-md hover:bg-cyan-300 
            transition-colors"
        >
          CREATE PLAYER
        </button>
      </div>
    </div>
  )
}

export default AddPlayerDialog