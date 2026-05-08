'use client'

type FilterRowProps = {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const FilterRow = ({ activeFilter, onFilterChange }: FilterRowProps) => {

  return (
    <div className="flex items-center justify-between mt-4">
        <span className="font-mono text-xs text-zinc-500 tracking-widest">
            {'// ACTIVE PLAYERS'}
        </span>
        <div className="flex gap-2">
            {['ALL', 'BAT', 'BOWL', '3D'].map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`font-mono text-xs px-3 py-1 border rounded ${
                  activeFilter === filter
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-zinc-700 text-zinc-500'
                }`}
              >
                {filter}
              </button>
            ))}
        </div>        
    </div>
  )
}

export default FilterRow
