'use client'

import { useState } from "react";

const FilterRow = () => {
  const [isActive, setIsActive] = useState("ALL");
  const roles = ["ALL", "BAT", "BOWL", "3D"];

  return (
    <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-slate-500 font-mono">// PLAYERS</span>

        <div className="flex text-sm text-slate-500 font-mono gap-2">
            {
              roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setIsActive(role)}
                  className={`border hover:border-cyan-400 hover:text-cyan-400 hover:cursor-pointer ${isActive == role ? "border-cyan-400 text-cyan-400" : "border-zinc-700"} rounded-md text-xs px-3 py-1`}
                >
                  {role}
                </button>
              ))
            }
        </div>        
    </div>
  )
}

export default FilterRow