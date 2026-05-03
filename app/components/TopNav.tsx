import { Lock } from 'lucide-react';

const TopNav = ({ setShowAdminDialog }: { setShowAdminDialog: (show: boolean) => void }) => {
  return (
    <div className='flex justify-between text-white items-center'>
      <div>
        <h1 className='font-mono text-xl'>
          <span className='text-cyan-300'>CRIC</span><span className='text-[#b9e03c]'>SCORE</span>
        </h1>
        <span className='text-xs text-slate-500 font-mono'>// PLAYERS STATS TRACKER</span>
      </div>

      <button onClick={() => setShowAdminDialog(true)} className='bg-[#111c2e] border border-[#1a3040] p-2 rounded-md flex items-center gap-1 hover:text-[#b9e03c] active:text-[#b9e03c] cursor-pointer'>
        <Lock width={20} />
      </button>
    </div>
  )
}

export default TopNav
