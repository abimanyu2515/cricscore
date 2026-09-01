import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { BATTING_HAND_OPTIONS, BOWLING_HAND_OPTIONS, BOWLING_STYLE_OPTIONS, type BattingHand, type BowlingHand, type BowlingStyle } from "@/lib/playerStyles"

const ROLE_OPTIONS = ['Batsman', 'Bowler', 'All-rounder'] as const

interface AdminPlayerItemProps {
    id: string,
    playerName: string,
    role: string,
    batting_hand?: string | null,
    bowling_hand?: string | null,
    bowling_style?: string | null,
    onUpdate: (newName: string, newRole: string, battingHand: string, bowlingHand: string, bowlingStyle: string) => void,
    onDelete: () => void,
}

const AdminPlayerItem = ({ id, playerName, role, batting_hand, bowling_hand, bowling_style, onUpdate, onDelete }: AdminPlayerItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(playerName)
  const [editedRole, setEditedRole] = useState(role)
  const [editedBattingHand, setEditedBattingHand] = useState<BattingHand>((batting_hand as BattingHand) === 'Left' ? 'Left' : 'Right')
  const [editedBowlingHand, setEditedBowlingHand] = useState<BowlingHand>((bowling_hand as BowlingHand) === 'Left' ? 'Left' : 'Right')
  const [editedBowlingStyle, setEditedBowlingStyle] = useState<BowlingStyle>(
    (BOWLING_STYLE_OPTIONS as readonly string[]).includes(bowling_style ?? '') ? (bowling_style as BowlingStyle) : 'Medium'
  )

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
                <div className="flex flex-col w-full gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <input
                            type="text"
                            className="text-xl w-full p-1 bg-transparent font-bold border border-slate-600 focus:border-cyan-400 focus:outline-none rounded"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 w-full gap-2">
                        {ROLE_OPTIONS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setEditedRole(option)}
                                aria-pressed={editedRole === option}
                                className={`rounded border px-2 py-1.5 text-center font-mono text-xs transition-colors ${
                                    editedRole === option
                                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                                }`}
                            >
                                {option.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <label className="font-mono text-xs text-zinc-500 tracking-widest mt-1">BATTING HAND</label>
                    <select
                      value={editedBattingHand}
                      onChange={(e) => setEditedBattingHand(e.target.value as BattingHand)}
                      className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-2 py-2 text-white font-mono text-xs focus:outline-none"
                    >
                      {BATTING_HAND_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}-hand</option>
                      ))}
                    </select>
                    <label className="font-mono text-xs text-zinc-500 tracking-widest">BOWLING HAND</label>
                    <select
                      value={editedBowlingHand}
                      onChange={(e) => setEditedBowlingHand(e.target.value as BowlingHand)}
                      className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-2 py-2 text-white font-mono text-xs focus:outline-none"
                    >
                      {BOWLING_HAND_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}-arm</option>
                      ))}
                    </select>
                    <label className="font-mono text-xs text-zinc-500 tracking-widest">BOWLING STYLE</label>
                    <select
                      value={editedBowlingStyle}
                      onChange={(e) => setEditedBowlingStyle(e.target.value as BowlingStyle)}
                      className="w-full bg-zinc-800 border border-zinc-600 focus:border-cyan-400 rounded-md px-2 py-2 text-white font-mono text-xs focus:outline-none"
                    >
                      {BOWLING_STYLE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 font-mono text-sm">
                        <button onClick={() => setIsEditing(false)} className="w-full border border-zinc-700 p-1.5 rounded hover:border-slate-500 text-slate-500 hover:text-cyan-400 active:border-cyan-500 active:text-cyan-500">
                            CANCEL
                        </button>
                        <button
                            onClick={() => {
                                onUpdate(editedName, editedRole, editedBattingHand, editedBowlingHand, editedBowlingStyle)
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
