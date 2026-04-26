import { Lock } from 'lucide-react';

const TopNav = () => {
  return (
    <div className='flex justify-between text-white items-center py-4'>
      <div>
        <h1 className='font-mono'>
          <span className='text-cyan-300'>CRIC</span><span className='text-[#b9e03c]'>SCORE</span>
        </h1>
        <span className='text-xs text-slate-500 font-mono'>// PLAYERS STATS TRACKER</span>
      </div>

      <button className='bg-[#111c2e] border border-[#1a3040] p-2 rounded-md flex items-center gap-1 cursor-pointer'>
        <Lock width={20} />
      </button>
    </div>
  )
}

export default TopNav
