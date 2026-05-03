import { PLAYER_DATA } from "@/app/lib/constants"
import AdminPlayerItem from "./AdminPlayerItem"

interface AdminPlayerListProps {
    players: {
        id: number,
        playerName: string,
        role: string,
    }[]
}

const AdminPlayerList = ({ players }: AdminPlayerListProps) => {
  return (
    <div className="flex flex-col gap-3">
        {PLAYER_DATA?.map(({ pid, playerName, role }) => (
            <AdminPlayerItem 
                key={pid}
                playerName={playerName.toUpperCase()}
                role={role}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        ))}
    </div>
  )
}

export default AdminPlayerList