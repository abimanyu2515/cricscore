import { useRouter } from "next/navigation"

const BottomNav = () => {
  const router = useRouter()

  return (
    <div className="absolute bottom-17 left-35 md:top-5 md:left-173">
      <button onClick={() => router.push('/leaderboard')} className="border border-cyan-500 p-3 font-mono text-sm text-center rounded-full cursor-pointer">
        LEADERBOARD
      </button>
    </div>
  )
}

export default BottomNav