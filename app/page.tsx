import AddPlayerCard from "./components/AddPlayerCard"
import BottomNav from "./components/BottomNav"
import FilterRow from "./components/FilterRow"
import PlayerCard from "./components/PlayerCard"
import TopNav from "./components/TopNav"
import { PLAYER_DATA } from "./lib/constants"

const page = () => {
  return (
    <div>
      <TopNav />
      <FilterRow />
      <div className="grid grid-cols-2 lg:grid-cols-3 mt-6 gap-4">
        {
          PLAYER_DATA.map((player) => (
            <PlayerCard 
              key={player.pid}
              playerName={player.playerName}
              role={player.role}
              totalRuns={player.totalRuns}
              totalWickets={player.totalWickets}
            />
          ))
        }      
        <AddPlayerCard />
      </div>
      <BottomNav />
    </div>
  )
}

export default page