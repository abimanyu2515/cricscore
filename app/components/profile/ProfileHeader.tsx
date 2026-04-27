import profileHeaderProps from "@/types/profileHeaderProps"
import { ChevronLeft } from "lucide-react"

const ProfileHeader = ({name, role, onBack}: profileHeaderProps) => {
  return (
    <div className="py-5">
        <button onClick={onBack} className="flex items-center font-mono text-xs text-slate-400">
            <ChevronLeft width={14} height={14}/>
            BACK
        </button>

        <h1 className="text-4xl font-bold mt-6 uppercase">{name}</h1>
        <span className="font-mono text-sm text-slate-500 uppercase">// {role}</span>
    </div>
  )
}

export default ProfileHeader