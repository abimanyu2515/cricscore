export interface MatchProps {
  id: string
  match_date: string
  match_type: string
  location: string
  team_1: string
  team_2: string
  score_1: number | null
  overs_played_1: number | null
  score_2: number | null
  overs_played_2: number | null
  match_result_desc: string
  match_result: boolean | null
  created_at?: string
  updated_at?: string
}

export interface CreateMatchPayload {
  team_1: string
  score_1: string
  overs_played_1: number
  team_2: string
  score_2: string
  overs_played_2: number
  location: string
  match_type: string
  match_date: string
  match_result_desc: string
  match_result: string
}

export interface MatchesOverviewProps {
  matches: MatchProps[]
}
