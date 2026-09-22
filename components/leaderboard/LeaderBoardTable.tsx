import type {
    leaderBoardTableColumnProps,
    leaderBoardTableRowProps,
} from "@/types/leaderboardProps";

interface LeaderBoardTableProps {
    type: 'BATTING' | 'BOWLING'
    columns: leaderBoardTableColumnProps[]
    rows: leaderBoardTableRowProps[]
}

const LeaderBoardTable = ({ type, columns, rows }: LeaderBoardTableProps) => {
    const isBatting = type === 'BATTING'
    const accentText = isBatting ? 'text-cyan-300' : 'text-purple-300'
    const accentBorder = isBatting ? 'border-l-cyan-500' : 'border-l-purple-500'
    const rank1RowBg = isBatting ? 'bg-cyan-500' : 'bg-purple-400'
    const rank1Name = isBatting ? 'text-black' : 'text-black'
    const rank1Value = isBatting ? 'text-black' : 'text-black'

    return (
        <div className="mt-4 border border-slate-700 bg-zinc-900 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse font-mono">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-500 text-xs uppercase">
                            <th className="sticky left-0 z-10 bg-slate-900 text-left px-3 py-3 w-36 min-w-36 border-r border-slate-700">
                                Player
                            </th>
                            {columns.map(({ label }) => (
                                <th key={label} className="px-3 py-3 text-center whitespace-nowrap">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const isFirst = index === 0
                            return (
                                <tr
                                    key={row.id}
                                    className={`border-b border-slate-800 last:border-b-0 ${
                                        isFirst ? rank1RowBg : ''
                                    }`}
                                >
                                    <td
                                        className={`sticky left-0 z-10 bg-inherit px-3 py-3 border-r border-slate-700 whitespace-nowrap font-sans font-bold uppercase ${
                                            isFirst
                                                ? `${rank1Name} ${accentBorder} border-l-4`
                                                : 'bg-slate-900 text-white text-md border-l border-l-transparent'
                                        }`}
                                    >
                                        {row.playerName}
                                    </td>
                                    {row.values.map((value, valueIndex) => (
                                        <td
                                            key={valueIndex}
                                            className={`px-3 py-3 text-center text-sm whitespace-nowrap ${
                                                isFirst
                                                    ? `${rank1Value} font-bold`
                                                    : `bg-black ${accentText}`
                                            }`}
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default LeaderBoardTable
