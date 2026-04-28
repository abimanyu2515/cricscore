interface LeaderBoardItemProps {
    rank: number,
    playerName: string,
    stats: {
        label: string,
        value: string | number
    }[],
    accentColor: 'cyan' | 'purple'
}

const LeaderBoardItem = ({ rank, playerName, stats, accentColor }: LeaderBoardItemProps) => {
  const isFirst = rank === 1
  const leftBorderClass = isFirst 
    ? accentColor === 'cyan' 
      ? 'border-l-4 border-l-cyan-400' 
      : 'border-l-4 border-l-purple-500'
    : 'border-l border-l-slate-600'
  const textColor = accentColor === 'cyan' ? 'text-cyan-300' : 'text-purple-300'
  
  return (
    <div className={`flex items-center gap-3 ${leftBorderClass} border border-slate-700 rounded-xl px-2 py-4 bg-slate-900/50`}>
        <span className="text-slate-400 font-mono w-3">{rank}.</span>
        <span className="text-white font-bold font-mono uppercase flex-1">{playerName}</span>
        <div className="grid grid-cols-3 gap-1">
            {stats.map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center border border-slate-600 rounded px-2 py-1">
                    <span className={`font-mono font-bold text-xs ${textColor}`}>{value}</span>
                    <span className="font-mono text-xs text-slate-500">{label}</span>
                </div>
            ))}
        </div>
    </div>
  )
}

export default LeaderBoardItem