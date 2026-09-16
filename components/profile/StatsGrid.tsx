import statsGridProps from "@/types/statsGridProps"

const StatsGrid = ({
  runs,
  batAvg,
  str,
  hs,
  wkts,
  eco,
  innings,
  bowlInnings,
  fours,
  sixes,
  fifties,
  hundreds,
  oversBowled,
  maidens,
  threeWi,
  fiveWi,
  bbm,
  games
}: statsGridProps) => {
  const statTiles = [
    { label: 'MATCHES', value: games, accent: 'text-purple-200' },
    { label: 'BAT INN', value: innings, accent: 'text-purple-200' },
    { label: 'RUNS', value: runs, accent: 'text-cyan-300' },
    { label: 'AVG', value: batAvg, accent: 'text-cyan-300' },
    { label: 'STR', value: str, accent: 'text-cyan-300' },
    { label: 'FOURS', value: fours, accent: 'text-cyan-300' },
    { label: 'SIXES', value: sixes, accent: 'text-cyan-300' },
    { label: 'HIGHEST', value: hs, accent: 'text-cyan-300' },
    { label: '50s', value: fifties, accent: 'text-cyan-300' },
    { label: '100s', value: hundreds, accent: 'text-cyan-300' },
    { label: 'BOW INN', value: bowlInnings, accent: 'text-purple-300' },
    { label: 'WICKETS', value: wkts, accent: 'text-purple-300' },
    { label: 'OVERS', value: oversBowled, accent: 'text-purple-300' },
    { label: 'ECO', value: eco, accent: 'text-purple-300' },
    { label: 'MAIDENS', value: maidens, accent: 'text-purple-300' },
    { label: '3WI', value: threeWi, accent: 'text-purple-300' },
    { label: '5WI', value: fiveWi, accent: 'text-purple-300' },
    { label: 'BBM', value: bbm, accent: 'text-purple-300' },
  ]

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden mt-5">
      <div className="grid grid-cols-6">
        {statTiles.map(({label, accent, value}) => (
          <div
            key={label}
            className="border-r border-b border-zinc-700 px-1 py-2 font-mono last:border-r-0"
          >
            <p className="text-xs md:text-sm text-center text-slate-500">{label}</p>
            <p className={`text-md md:text-lg font-semibold mt-1 text-center ${accent}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsGrid
