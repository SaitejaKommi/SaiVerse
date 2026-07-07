'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'saiverse-controls-seen'

interface ControlKeyProps {
  label: string
  desc: string
}

function ControlKey({ label, desc }: ControlKeyProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 flex items-center justify-center border border-white/20 rounded bg-white/5 font-mono text-sm text-white/80">
        {label}
      </div>
      <span className="text-xs text-white/40 font-mono">{desc}</span>
    </div>
  )
}

export function ControlsOverlay() {
  const [visible, setVisible] = useState(false)
  const dismissed = useRef(false)
  const moveCount = useRef(0)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (seen === 'true') return

    setVisible(true)

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', ' ', 'e', 'shift'].includes(key)) {
        moveCount.current++
        if (moveCount.current >= 3 && !dismissed.current) {
          dismissed.current = true
          setVisible(false)
          localStorage.setItem(STORAGE_KEY, 'true')
        }
      }
    }

    const handleMouse = () => {
      moveCount.current++
      if (moveCount.current >= 5 && !dismissed.current) {
        dismissed.current = true
        setVisible(false)
        localStorage.setItem(STORAGE_KEY, 'true')
      }
    }

    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousemove', handleMouse)

    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none flex items-end justify-center pb-16">
      <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl px-8 py-6">
        <div className="text-xs text-white/30 tracking-[0.2em] uppercase text-center mb-4 font-mono">
          Controls
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <ControlKey label="WASD" desc="Move" />
          <ControlKey label="Mouse" desc="Look" />
          <ControlKey label="Shift" desc="Sprint" />
          <ControlKey label="Space" desc="Jump" />
          <ControlKey label="E" desc="Interact" />
        </div>
        <div className="text-[10px] text-white/20 text-center mt-4 font-mono">
          start moving to dismiss
        </div>
      </div>
    </div>
  )
}
