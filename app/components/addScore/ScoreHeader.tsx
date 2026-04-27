import ScoreHeaderProps from "@/types/scoreHeaderProps"
import { ChevronLeft } from "lucide-react"

const ScoreHeader = ({ playerName, onBack }: ScoreHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center font-mono text-sm text-slate-400">
            <ChevronLeft width={14} height={14}/>
            BACK
        </button>
        <h1 className="font-bold text-3xl">{playerName.toUpperCase()}</h1>
    </div>
  )
}

export default ScoreHeader