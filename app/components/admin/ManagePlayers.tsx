type ManagePlayersProps = {
  onAddPlayer: () => void
}

const ManagePlayers = ({ onAddPlayer }: ManagePlayersProps) => {
  return (
    <div className="flex justify-between font-mono text-sm pt-10 pb-2">
        <span className="text-slate-500">{'// MANAGE PLAYERS'}</span> 
        <button
          onClick={onAddPlayer}
          className="text-cyan-400 px-2 py-0.5 rounded hover:border-cyan-400"
        >
          + ADD PLAYER
        </button>
    </div>
  )
}

export default ManagePlayers
