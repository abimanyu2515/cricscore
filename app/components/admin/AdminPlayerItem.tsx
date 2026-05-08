import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

interface AdminPlayerItemProps {
    id: string,
    playerName: string,
    role: string,
    onUpdate: (newName: string, newRole: string) => void,
    onDelete: () => void,
}

const AdminPlayerItem = ({ id, playerName, role, onUpdate, onDelete }: AdminPlayerItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(playerName)
  const [editedRole, setEditedRole] = useState(role)

  return (
    <div data-player-id={id} className="flex justify-between items-center border p-3 bg-[#111c2e] border-slate-600 rounded-lg">
        {!isEditing ? (
            <>
              <div>
                <h1 className="text-2xl font-bold">{playerName.toUpperCase()}</h1>
                <p className="text-sm font-mono text-slate-400">{role}</p>
            </div>

            <div className="flex items-center text-slate-500 gap-3">
                <button onClick={() => setIsEditing(true)} className="border border-transparent p-1.5 rounded hover:border-cyan-400 hover:text-cyan-400 active:border-cyan-400 active:text-cyan-400">
                    <Pencil width={16} height={16} />
                </button>

                <button onClick={onDelete} className="border border-transparent p-1.5 rounded hover:border-red-400 hover:text-red-400 active:border-red-400 active:text-red-400">
                    <Trash2 width={16} height={16} />
                </button>
            </div>
            </>
        ) : (
            <>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <input
                            type="text"
                            className="text-xl w-50 p-1 bg-transparent font-bold border border-slate-600 focus:border-cyan-400 focus:outline-none rounded"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                        />
                        <select
                            value={editedRole}
                            onChange={(e) => setEditedRole(e.target.value)}
                            className={`bg-transparent font-mono text-sm text-cyan-400 border p-2 border-zinc-700 rounded focus:border-cyan-400`}
                            >
                            {(['Batsman', 'Bowler', 'All-rounder']).map((option) => (
                                <option key={option} value={option} className="bg-zinc-900">
                                    {option.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 font-mono text-sm">
                        <button onClick={() => setIsEditing(false)} className="w-full border border-zinc-700 p-1.5 rounded hover:border-slate-500 text-slate-500 hover:text-cyan-400 active:border-cyan-500 active:text-cyan-500">
                            CANCEL
                        </button>
                        <button
                            onClick={() => {
                                onUpdate(editedName, editedRole)
                                setIsEditing(false)
                            }}
                            className="w-full bg-cyan-500 text-[#111c2e] font-semibold p-1.5 rounded"
                        >
                            UPDATE
                        </button>
                    </div>
                </div>
            </>
        )
    }
    </div>
  )
}

export default AdminPlayerItem
