interface ScoreActionProps {
    onCancel: () => void,
    onSave: () => void,
    onDelete?: () => void,
}

const ScoreAction = ({onCancel, onSave, onDelete}: ScoreActionProps) => {
  const gridCols = onDelete ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <div className={`grid ${gridCols} mt-8 gap-3`}>
        <button onClick={onCancel} className="font-mono text-sm text-slate-500 hover:text-white hover:font-bold border border-zinc-700 hover:border-cyan-200 p-3 rounded-md cursor-pointer">CANCEL</button>
        {onDelete && (
          <button onClick={onDelete} className="font-mono text-sm text-white bg-red-600 hover:bg-red-700 p-3 rounded-md cursor-pointer">DELETE</button>
        )}
        <button onClick={onSave} className="font-mono font-semibold text-sm text-black bg-cyan-400 hover:bg-[#cdeb6b] hover:shadow hover:shadow-[#b9e03c] rounded-md cursor-pointer">SAVE SCORE</button>
    </div>
  )
}

export default ScoreAction