import LeaderBoardItem from "./LeaderBoardItem"

interface LeaderBoardListProps {
    type: 'BATTING' | 'BOWLING',
    players: {
        id: number,
        playerName: string,
        stats: {
            label: string,
            value: string | number
        }[],
    }[]
}

const LeaderBoardList = ({ type, players }: LeaderBoardListProps) => {
  const accentColor = type === 'BATTING' ? 'cyan' : 'purple'

  return (
    <div className="flex flex-col gap-3 mt-4">
        {players.map((player, index) => (
            <LeaderBoardItem 
                key={player.id}
                rank={index + 1}
                playerName={player.playerName}
                stats={player.stats}
                accentColor={accentColor}
            />
        ))}
    </div>
  )
}

export default LeaderBoardList