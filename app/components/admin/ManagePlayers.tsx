type ManagePlayersProps = {
  onAddPlayer: () => void;
}

const ManagePlayers = ({ onAddPlayer }: ManagePlayersProps) => {
  return (
    <div className="flex justify-between font-mono text-sm pt-10 pb-2">
        <span className="text-slate-500">// MANAGE PLAYERS</span>

        <button 
          className="text-cyan-400 hover:text-[#b9e03c] active:text-[#b9e03c]"
          onClick={onAddPlayer}
        >
            + ADD PLAYER
        </button>        
    </div>
  )
}

export default ManagePlayers