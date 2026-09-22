import profileHeaderProps from "@/types/profileHeaderProps"
import { ChevronLeft } from "lucide-react"
import { formatPlayerStyle } from "@/lib/playerStyles"

const ProfileHeader = ({name, role, batting_hand, bowling_hand, bowling_style, onBack}: profileHeaderProps) => {
  const styleLabel = formatPlayerStyle({ batting_hand, bowling_hand, bowling_style, role })
  return (
    <div>
        <button onClick={onBack} className="flex items-center font-mono text-xs text-slate-400">
            <ChevronLeft width={14} height={14}/>
            BACK
        </button>

        <h1 className="text-4xl font-bold mt-6 mb-1 uppercase">{name}</h1>
        <span className="font-mono text-sm text-slate-500 uppercase">// {role}</span>
        <p className="font-mono text-sm text-slate-500 uppercase">// {styleLabel}</p>
    </div>
  )
}

export default ProfileHeader