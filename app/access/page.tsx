'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'

const Access = () => {
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return
    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)
    if (value && index < pin.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const enteredPin = pin.join('')

    const res = await fetch('/api/auth/verify-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: enteredPin })
    })

    if (res.ok) {
      window.location.href = '/'
    } else {
      toast.error('Invalid PIN')
      setPin(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c12] px-6">
      <div className="w-full max-w-sm border border-cyan-400 rounded-xl p-6 bg-zinc-900">
        <h1 className="font-mono text-cyan-400 text-xs tracking-widest mb-1">
          // CRICSCORE
        </h1>
        <p className="font-mono text-zinc-500 text-xs mb-6">
          ARE YOU A THUNDERBOLT? ENTER ACCESS PIN.
        </p>

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
              className="w-12 h-12 text-center text-xl font-mono bg-zinc-800
                border border-zinc-600 text-cyan-400 rounded-md
                focus:outline-none focus:border-cyan-400"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full font-mono text-sm text-cyan-400 border border-cyan-400
            rounded-md py-3 hover:bg-cyan-400 hover:text-black transition-colors"
        >
          ENTER
        </button>
      </div>
    </div>
  )
}

export default Access