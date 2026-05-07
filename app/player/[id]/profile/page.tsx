'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const fetchData = async () => {
      const [playerRes, scoresRes] = await Promise.all([
        fetch(`/api/players/${playerId}`),
        fetch(`/api/players/${playerId}/scores`)
      ])

      const playerData = await playerRes.json()
      const scoresData = await scoresRes.json()
      
      setPlayer(playerData)
      setScores(scoresData)
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
              bbm={player.computed_stats?.best_figures ?? ''}
              games={player.computed_stats?.games_played ?? 0}
            />
            <MatchHistory
              entries={
                scores.map((score) => ({
                  date: score.match_date,
                  matchLabel: score.match_label,
                  batting: `${score.runs} (${score.balls_faced})`,
                  bowling: score.wickets > 0 || score.runs_given > 0 
                    ? `${score.wickets}/${score.runs_given}` : undefined,
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