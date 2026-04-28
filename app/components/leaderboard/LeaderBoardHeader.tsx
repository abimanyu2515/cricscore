import { ChevronLeft } from "lucide-react"

interface LeaderBoardHeaderProps {
    onBack: () => void
}

const LeaderBoardHeader = ({ onBack }: LeaderBoardHeaderProps) => {
  return (
    <div className="flex justify-between py-5">
        <button onClick={onBack} className="flex items-center font-mono text-xs text-slate-400">
            <ChevronLeft width={14} height={14}/>
            BACK
        </button>

        <h1 className="text-lg text-cyan-300 font-mono">// LEADERBOARD</h1>
    </div>
  )
}

export default LeaderBoardHeader