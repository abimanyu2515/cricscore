import PlayerCard from "./PlayerCard"
import useLongPress from "@/app/hooks/useLongPress"
import { useRouter } from "next/navigation"

type PlayerCardWrapperProps = {
  id: string
  name: string
  role: string
  computed_stats: {
    total_runs: number
    total_wickets: number
  } | null
}

const PlayerCardWrapper = ({ id, name, role, computed_stats }: PlayerCardWrapperProps) => {
  const router = useRouter()
  const handlers = useLongPress(
    () => router.push(`/player/${id}/profile`),
    () => router.push(`/player/${id}/add-score`)
  )

  return (
    <div {...handlers} style={{ touchAction: 'manipulation' }}>
      <PlayerCard
        playerName={name}
        role={role}
        totalRuns={computed_stats?.total_runs ?? 0}
        totalWickets={computed_stats?.total_wickets ?? 0}
      />
    </div>
  )
}

export default PlayerCardWrapper
