import MatchHistoryItem from "./MatchHistoryItem"

type MatchHistoryProps = {
  entries?: {
    date: string
    matchLabel: string
    batting: string
    bowling?: string
    onEdit: () => void
  }[]
}

const MatchHistory = ({ entries = [] }: MatchHistoryProps) => {
  return (
    <div className="mt-5">
      <label className="font-mono text-sm text-slate-500">// MATCH HISTORY</label>
      {entries.length > 0 ? (
        <div className="flex flex-col gap-3 mt-3">
          {entries.map((entry) => (
            <MatchHistoryItem
              key={`${entry.date}-${entry.matchLabel}`}
              {...entry}
            />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 italic">No match history available.</p>
      )}
    </div>
  )
}

export default MatchHistory
