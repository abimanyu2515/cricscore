'use client'

import MatchHistory from '@/app/components/profile/MatchHistory'
import ProfileHeader from '@/app/components/profile/ProfileHeader'
import StatsGrid from '@/app/components/profile/StatsGrid'
import { useRouter } from 'next/navigation'

const page = () => {
  const router = useRouter()

  return (
    <div>
        <ProfileHeader
          name='Abimanyu S'
          role='All rounder'
          onBack={() => router.push('/')} 
        />
        <StatsGrid 
          runs={58}
          batAvg={28.5}
          str={121.3}
          hs={45}
          wkts={2}
          eco={2.5}
          bbm='2/18'
          games={2}
        />
        <MatchHistory entries={[
            {
                date: "2026.04.09",
                matchLabel: "MRNG MATCH 1",
                batting: "45 (32)",
                bowling: "2/18",
                onEdit: () => {}
            },
            {
                date: "2026.04.02",
                matchLabel: "EVNG MATCH",
                batting: "12 (15)",
                onEdit: () => {}
            }
        ]} />
    </div>
  )
}

export default page