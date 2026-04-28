interface LeaderBoardTabsProps {
    activeTab: "BATTING" | "BOWLING",
    onTabChange: (tab: "BATTING" | "BOWLING") => void
}

const LeaderBoardTabs = ({ activeTab = 'BATTING', onTabChange }: LeaderBoardTabsProps) => {
  return (
    <div className="border-b border-slate-700 mt-4">
        <div className="grid grid-cols-2 font-mono text-sm">
            <button 
                className={`pb-3 text-center transition-colors ${activeTab === "BATTING" ? "text-cyan-300" : "text-slate-400"}`}
                onClick={() => onTabChange("BATTING")}
            >
                BATTING
            </button>
            <button 
                className={`pb-3 text-center transition-colors ${activeTab === "BOWLING" ? "text-purple-300" : "text-slate-400"}`}
                onClick={() => onTabChange("BOWLING")}
            >
                BOWLING
            </button>
        </div>
        <div className="flex">
            <div className={`h-1 transition-all ${activeTab === "BATTING" ? "w-1/2 bg-cyan-300" : "w-1/2 ml-auto bg-purple-300"}`}></div>
        </div>
    </div>
  )
}

export default LeaderBoardTabs