'use client'

import { useEffect, useMemo, useState } from 'react'
import MatchHistory from '@/app/components/profile/MatchHistory'
import ProfileHeader from '@/app/components/profile/ProfileHeader'
import StatsGrid from '@/app/components/profile/StatsGrid'
import AdminPinDialog from '@/app/components/AdminPinDialog'
import { useParams, useRouter } from 'next/navigation'

const page = () => {
  const router = useRouter()
  const params = useParams()
  const playerId = params.id as string
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [player, setPlayer] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const computedFromScores = useMemo(() => {
    let batInnings = 0
    let bowlInnings = 0
    let bf = 0
    let fours = 0
    let sixes = 0
    let nos = 0
    let totalRunsGiven = 0
    let totalWickets = 0
    let threeWi = 0

    for (const score of scores) {
      const runs = Number(score.runs) || 0
      const ballsFaced = Number(score.balls_faced) || 0
      const wickets = Number(score.wickets) || 0
      const runsGiven = Number(score.runs_given) || 0

      const hasBatted = ballsFaced > 0 || runs > 0
      if (hasBatted) {
        batInnings += 1
        if (score.not_out) nos += 1
      }

      const hasBowled = score.overs_bowled > 0 || runsGiven > 0
      if (hasBowled) {
        bowlInnings += 1
        if (score.not_out) nos += 1
      }

      bf += ballsFaced
      fours += Number(score.fours) || 0
      sixes += Number(score.sixes) || 0
      totalWickets += wickets
      totalRunsGiven += runsGiven

      if (wickets >= 3) {
        threeWi += 1
      }
    }

    return { batInnings, bowlInnings, bf, fours, sixes, nos, threeWi }
  }, [scores])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerRes, scoresRes] = await Promise.all([
          fetch(`/api/players/${playerId}`),
          fetch(`/api/players/${playerId}/scores`),
        ])

        if (!playerRes.ok || !scoresRes.ok) {
          throw new Error(`API failed: player=${playerRes.status}, scores=${scoresRes.status}`)
        }

        const playerData = await playerRes.json()
        const scoresData = await scoresRes.json()

        setPlayer(playerData)
        setScores(scoresData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [playerId])

  const handleEditClick = (entryId: string) => {
    setSelectedEntryId(entryId)
    setIsAdminPinOpen(true)
  }

  const handlePinVerified = () => {
    setIsAdminPinOpen(false)
    if (selectedEntryId) {
      router.push(`/player/${playerId}/add-score/${selectedEntryId}/edit`)
    }
  }

  if (loading) return (
    <p className="font-mono text-xs text-zinc-500 p-4">// LOADING PLAYER STATS...</p>
  )

  return (
    <div>
        {player && (
          <>
            <ProfileHeader
              name={player.name}
              role={player.role}
              onBack={() => router.push('/')} 
            />
            <StatsGrid 
              runs={player.computed_stats?.total_runs ?? 0}
              batAvg={player.computed_stats?.batting_avg ?? 0}
              str={player.computed_stats?.strike_rate ?? 0}
              hs={player.computed_stats?.highest_score ?? 0}
              wkts={player.computed_stats?.total_wickets ?? 0}
              eco={player.computed_stats?.economy ?? 0}
              innings={computedFromScores.batInnings}
              bf={computedFromScores.bf}
              fours={computedFromScores.fours}
              sixes={computedFromScores.sixes}
              nos={computedFromScores.nos}
              bowlInnings={computedFromScores.bowlInnings}
              threeWi={computedFromScores.threeWi}
              bbm={player.computed_stats?.best_figures ?? ''}
              games={player.computed_stats?.games_played ?? 0}
            />
            <MatchHistory
              entries={
                scores.map((score) => ({
                  date: score.match_date,
                  matchLabel: score.match_label,
                  batting: score.balls_faced > 0 ? `${score.runs} (${score.balls_faced})` : 'DNB',
                  bowling: score.wickets > 0 || score.runs_given > 0 
                    ? `${score.wickets}/${score.runs_given}` : 'DNB',
                  onEdit: () => router.push(`/player/${playerId}/add-score/${score.id}/edit`)
                }))
              }
            />
          </>
        )}
        
        <AdminPinDialog
          isOpen={isAdminPinOpen}
          onClose={() => {
            setIsAdminPinOpen(false)
            setSelectedEntryId(null)
          }}
          onVerified={handlePinVerified}
        />
    </div>
  )
}

export default page