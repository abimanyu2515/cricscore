'use client'

import { useRef, useState } from "react"
import { X } from "lucide-react"

type AdminPinDialogProps = {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
}

const CORRECT_PIN = "1234" // temporary — will come from DB later

const AdminPinDialog = ({ isOpen, onClose, onVerified }: AdminPinDialogProps) => {
  const [pin, setPin] = useState(['', '', '', ''])
  const [shaking, setShaking] = useState(false)
  const [error, setError] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  if (!isOpen) return null

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return // only allow numbers

    const newPin = [...pin]
    newPin[index] = value.slice(-1) // only take last character
    setPin(newPin)

    // auto focus next box
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = () => {
    const enteredPin = pin.join('')
    if (enteredPin === CORRECT_PIN) {
      setPin(['', '', '', ''])
      setError(false)
      onVerified()
    } else {
      setError(true)
      setShaking(true)
      setPin(['', '', '', ''])
      inputRefs.current[0]?.focus()
      setTimeout(() => setShaking(false), 400) // reset shake after animation
    }
  }

  const handleClose = () => {
    setPin(['', '', '', ''])
    setError(false)
    onClose()
  }

  return (
    // Overlay
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      
      {/* Dialog */}
      <div className={`w-full bg-zinc-900 border border-cyan-400 rounded-xl p-6 ${shaking ? 'shake' : ''}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-xs text-cyan-400 tracking-widest">
            // ADMIN PIN REQUIRED
          </span>
          <button onClick={handleClose}>
            <X width={16} height={16} className="text-zinc-500 hover:text-white" />
          </button>
        </div>

        {/* 4 PIN boxes */}
        <div className="flex justify-center gap-3 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-12 h-12 text-center text-xl font-mono bg-zinc-800 
                border rounded-md focus:outline-none
                ${error 
                  ? 'border-red-500 text-red-400' 
                  : 'border-zinc-600 text-cyan-400 focus:border-cyan-400'
                }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="font-mono text-xs text-red-400 text-center mb-4 tracking-widest">
            // INVALID PIN
          </p>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          className="w-full font-mono text-sm text-cyan-400 border border-cyan-400 
            rounded-md py-3 hover:bg-cyan-400 hover:text-black transition-colors"
        >
          VERIFY
        </button>
      </div>
    </div>
  )
}

export default AdminPinDialog