import AdminPlayerItem from "./AdminPlayerItem"

interface AdminPlayerListProps {
    players: {
        id: string,
        playerName: string,
        role: string,
        onUpdate: (newName: string, newRole: string) => void,
        onDelete: () => void,
    }[]
}

const AdminPlayerList = ({ players }: AdminPlayerListProps) => {
  return (
    <div className="flex flex-col gap-3">
        {players?.sort((a, b) => a.playerName.localeCompare(b.playerName)).map(({ id, playerName, role, onUpdate, onDelete }) => (
            <AdminPlayerItem 
                key={id}
                id={id}
                playerName={playerName}
                role={role}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
        ))}
    </div>
  )
}

export default AdminPlayerList
