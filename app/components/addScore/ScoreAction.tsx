interface ScoreActionProps {
    onCancel: () => void,
    onSave: () => void,
}

const ScoreAction = ({onCancel, onSave}: ScoreActionProps) => {
  return (
    <div className="grid grid-cols-2 mt-8 gap-3">
        <button onClick={onCancel} className="font-mono text-sm text-slate-500 hover:text-white hover:font-bold border border-zinc-700 hover:border-cyan-200 p-3 rounded-md cursor-pointer">CANCEL</button>
        <button onClick={onSave} className="font-mono font-semibold text-sm text-black bg-cyan-400 hover:bg-[#cdeb6b] hover:shadow hover:shadow-[#b9e03c] rounded-md cursor-pointer">SAVE SCORE</button>
    </div>
  )
}

export default ScoreAction