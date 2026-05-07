import matchHistoryItemProps from "@/types/matchHistoryItemProps"

const MatchHistoryItem = ({ date, matchLabel, batting, bowling, onEdit }: matchHistoryItemProps) => {
    return (
        <div className="border border-zinc-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between font-mono text-xs text-slate-500">
                <span>{date}</span>
                {/* <button onClick={onEdit} className="border border-zinc-700 text-[12px] p-0.5 rounded hover:border-cyan-300 hover:text-cyan-300">// EDIT</button> */}
            </div>

            <h1 className="text-base font-bold text-white">{matchLabel}</h1>

            <div className="flex mt-3 gap-3">
                {batting && 
                    <span className="border border-cyan-300 text-cyan-300 px-3 py-1 text-sm rounded">{batting}</span> 
                }
                {bowling && 
                    <span className="border border-purple-400 text-purple-400 px-3 py-1 text-sm rounded">{bowling}</span>
                }
            </div>
        </div>
    )
}

export default MatchHistoryItem
