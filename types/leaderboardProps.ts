export interface derivedStatsProps {
    batInnings: number
    ballsFaced: number
    fours: number
    sixes: number
    notOuts: number
    bowlInnings: number
    oversBowled: number
    runsGiven: number
    threeWi: number
    fiveWi: number
}

export interface leaderboardPlayerProps {
    id: string
    name: string
    role: string | null
    computed_stats: {
        games_played: number | null
        total_runs: number | null
        total_wickets: number | null
        batting_avg: number | null
        strike_rate: number | null
        bowling_avg: number | null
        economy: number | null
        highest_score: number | null
        best_figures: string | null
    } | null
    derived_stats: derivedStatsProps | null
}

export interface leaderBoardTableColumnProps {
    label: string
    align?: 'left' | 'right'
}

export interface leaderBoardTableRowProps {
    id: string
    playerName: string
    values: (string | number)[]
}
