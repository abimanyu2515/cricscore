const AddPlayerCard = () => {
  return (
      <div className="bg-[#111c2e] border border-dashed border-zinc-700 hover:border-cyan-400 pb-1 cursor-pointer rounded-lg">
        <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-sm font-mono gap-2">
          <span className="bg-[#111c2e] border border-zinc-700 text-xl text-center px-2.5 py-0.5 rounded-full">+</span>
          <span className="text-center">NEW PLAYER</span>
        </div>
      </div>
  )
}

export default AddPlayerCard
