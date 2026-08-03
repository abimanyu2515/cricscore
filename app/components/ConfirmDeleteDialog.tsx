'use client'

type ConfirmDeleteDialogProps = {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDeleteDialog = ({ isOpen, title, message, onConfirm, onCancel }: ConfirmDeleteDialogProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="w-full bg-zinc-900 border border-red-500 rounded-xl p-6">

        {/* Header */}
        <div className="mb-4">
          <span className="font-mono text-xs text-red-400 tracking-widest">
            // {title}
          </span>
        </div>

        {/* Message */}
        <p className="font-mono text-sm text-zinc-300 mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="font-mono text-sm text-slate-500 border border-zinc-700
              rounded-md py-3 hover:border-slate-500 hover:text-white
              transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="font-mono font-semibold text-sm text-white bg-red-500
              rounded-md py-3 hover:bg-red-400 transition-colors"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteDialog