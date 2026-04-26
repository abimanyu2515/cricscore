import PlayerCardProps from "@/types/playerCardProps"

const PlayerCard = ({ playerName, role, totalRuns, totalWickets }: PlayerCardProps) => {
  return (
    <div className="bg-linear-to-r from-cyan-400 to-[#b9e03c] pt-0.5 rounded-lg">
        <div className="bg-[#111c2e] border border-zinc-700 pt-3 text-black rounded-lg">
            <h1 className="ml-3 font-bold text-xl text-white">{playerName.toUpperCase()}</h1>
            <span className="ml-3 text-sm text-slate-500 font-mono">{role}</span>
            <hr className="mt-2 text-zinc-700" />
            <div className="grid grid-cols-2 m-0 font-mono">
                <div className="flex flex-col text-center justify-center py-2 text-slate-500"><b className="text-cyan-300">{totalRuns}</b> <span className="text-slate-400 text-xs">RUNS</span></div>
                <div className="flex flex-col text-center justify-center text-slate-500 border-l border-zinc-700"><b className="text-cyan-300">{totalWickets}</b> <span className="text-slate-400 text-xs">WICKETS</span></div>
            </div>
        </div>
    </div>
  )
}

export default PlayerCard