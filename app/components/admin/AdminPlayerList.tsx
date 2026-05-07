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
        {players?.map(({ id, playerName, role }) => (
            <AdminPlayerItem 
                key={id}
                playerName={playerName}
                role={role}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        ))}
    </div>
  )
}

export default AdminPlayerList