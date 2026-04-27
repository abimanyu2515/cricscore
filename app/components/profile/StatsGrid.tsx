import statsGridProps from "@/types/statsGridProps"

const StatsGrid = ({runs, batAvg, str, hs, wkts, eco, bbm, games}: statsGridProps) => {
  const statTiles = [
    { label: 'RUNS', value: runs, accent: 'text-cyan-300' },
    { label: 'BAT AVG', value: batAvg, accent: 'text-cyan-300' },
    { label: 'STR', value: str, accent: 'text-cyan-300' },
    { label: 'HIGHEST', value: hs, accent: 'text-cyan-300' },
    { label: 'WICKETS', value: wkts, accent: 'text-purple-300' },
    { label: 'ECONOMY', value: eco, accent: 'text-purple-300' },
    { label: 'BBM', value: bbm, accent: 'text-purple-300' },
    { label: 'GAMES', value: games, accent: 'text-purple-200' },
  ]

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden mt-5">
      <div className="grid grid-cols-4">
        {statTiles.map(({label, accent, value}) => (
          <div
            key={label}
            className="border-r border-b border-zinc-700 p-3 font-mono last:border-r-0"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-lg font-semibold mt-1 ${accent}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsGrid
