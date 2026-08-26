import statInputCardProps from "@/types/statInputCardProps"

const StatInputCard = ({ title, accentColor, fields }: statInputCardProps) => {
  const dotColor = accentColor === "cyan" ? "bg-cyan-400" : "bg-purple-500"
  const inputColor = accentColor === "cyan" ? "text-cyan-400 border-cyan-400" : "text-purple-400 border-purple-500"

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 ${dotColor}`} />
        <h1 className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
          {title}
        </h1>
      </div>

      <div className="border border-zinc-800 rounded-lg bg-zinc-900 p-3">
        <div className="grid grid-cols-2">
          {fields.map(({ label, value, onChange, type, options }) => (
            <div
              key={label}
              className="flex flex-col gap-1 p-3"
            >
              <label className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                {label}
              </label>

              {type === "select" ? (
                <select
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className={`bg-transparent font-mono text-sm text-cyan-400 border-b border-zinc-700 focus:border-cyan-400`}
                >
                  {(options ?? []).map((option) => (
                    <option key={option} value={option} className="bg-zinc-900">
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  type={type ?? "number"}
                  min={0}
                  className={`bg-transparent font-mono text-sm ${inputColor} border-b border-zinc-700 ${accentColor == 'cyan' ? "focus:border-cyan-400" : "focus:border-purple-500"} focus:outline-none w-full`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatInputCard