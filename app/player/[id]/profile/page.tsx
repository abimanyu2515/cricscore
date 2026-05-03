'use client'

import { useState } from 'react'
import MatchHistory from '@/app/components/profile/MatchHistory'
import ProfileHeader from '@/app/components/profile/ProfileHeader'
import StatsGrid from '@/app/components/profile/StatsGrid'
import AdminPinDialog from '@/app/components/AdminPinDialog'
import { useRouter } from 'next/navigation'

const page = () => {
  const router = useRouter()
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const playerId = '1' // For now, static value

  const matchEntries = [
    {
      id: "1",
      date: "2026.04.09",
      matchLabel: "MRNG MATCH 1",
      batting: "45 (32)",
      bowling: "2/18",
      onEdit: () => handleEditClick("1")
    },
    {
      id: "2",
      date: "2026.04.02",
      matchLabel: "EVNG MATCH",
      batting: "12 (15)",
      onEdit: () => handleEditClick("2")
    }
  ]

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
        <MatchHistory entries={matchEntries} />
        
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