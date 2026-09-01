import AdminPlayerItem from "./AdminPlayerItem"

interface AdminPlayerListProps {
    players: {
        id: string,
        playerName: string,
        role: string,
        batting_hand?: string | null,
        bowling_hand?: string | null,
        bowling_style?: string | null,
        onUpdate: (newName: string, newRole: string, battingHand: string, bowlingHand: string, bowlingStyle: string) => void,
        onDelete: () => void,
    }[]
}

const AdminPlayerList = ({ players }: AdminPlayerListProps) => {
  return (
    <div className="flex flex-col gap-3">
        {players?.sort((a, b) => a.playerName.localeCompare(b.playerName)).map(({ id, playerName, role, batting_hand, bowling_hand, bowling_style, onUpdate, onDelete }) => (
            <AdminPlayerItem 
                key={id}
                id={id}
                playerName={playerName}
                role={role}
                batting_hand={batting_hand}
                bowling_hand={bowling_hand}
                bowling_style={bowling_style}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
        ))}
    </div>
  )
}

export default AdminPlayerList
