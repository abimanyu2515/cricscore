import { useRouter } from "next/navigation"

const BottomNav = () => {
  const router = useRouter()

  return (
    <div className="fixed top-7 right-20 md:top-5 md:left-163 md:bottom-auto z-40">
      <button onClick={() => router.push('/leaderboard')} className="border border-cyan-500 bg-black p-2 font-mono text-sm text-center rounded-sm cursor-pointer">
        LEADERBOARD
      </button>
    </div>
  )
}

export default BottomNav
