import { ChevronLeft } from "lucide-react"

interface LeaderBoardHeaderProps {
    onBack: () => void
}

const LeaderBoardHeader = ({ onBack }: LeaderBoardHeaderProps) => {
  return (
    <div className="flex justify-between">
        <button onClick={onBack} className="flex items-center font-mono text-xs text-slate-400">
            <ChevronLeft width={14} height={14}/>
            BACK
        </button>

        <h1 className="text-sm text-cyan-300 font-mono">// OVERALL STATS</h1>
    </div>
  )
}

export default LeaderBoardHeader