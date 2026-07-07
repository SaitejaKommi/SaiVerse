'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const STORAGE_KEY = 'saiverse-controls-seen'

interface ControlItem {
  keys: string
  desc: string
}

const CONTROLS: ControlItem[] = [
  { keys: 'W A S D', desc: 'Move' },
  { keys: 'Mouse', desc: 'Look' },
  { keys: 'Space', desc: 'Jump' },
  { keys: 'Shift', desc: 'Sprint' },
  { keys: 'E', desc: 'Interact' },
  { keys: 'I', desc: 'Inventory' },
  { keys: 'Esc', desc: 'Pause' },
]

const DIALOGUE = [
  { text: 'Welcome to SaiVerse.', delay: 0 },
  { text: 'An engineering journey awaits.', delay: 800 },
  { text: 'Here are your controls.', delay: 1800 },
]

export function ControlsOverlay() {
  const [visible, setVisible] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const dismissed = useRef(false)
  const dismissedByKey = useRef(false)

  const dismiss = useCallback(() => {
    if (dismissed.current) return
    dismissed.current = true
    setFadingOut(true)
    setTimeout(() => {
      setVisible(false)
      localStorage.setItem(STORAGE_KEY, 'true')
    }, 500)
  }, [])

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') return
    setVisible(true)

    const timers: ReturnType<typeof setTimeout>[] = []
    DIALOGUE.forEach((d, i) => {
      timers.push(setTimeout(() => setDialogueIdx(i), d.delay))
    })

    const handleKey = (e: KeyboardEvent) => {
      if (dismissed.current) return
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', ' ', 'e', 'i', 'shift', 'escape'].includes(key) || e.code === 'ShiftLeft') {
        e.preventDefault()
        if (!dismissedByKey.current) {
          dismissedByKey.current = true
          dismiss()
        }
      }
    }

    const handleMouse = () => {
      if (dismissed.current) return
      dismiss()
    }

    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousemove', handleMouse)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [dismiss])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center transition-opacity duration-500 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/95 via-[#020617]/90 to-[#020617]/95" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-[480px] px-6">
        <div className="text-center space-y-2">
          {DIALOGUE.slice(0, dialogueIdx + 1).map((d, i) => (
            <p
              key={i}
              className="text-white/80 font-mono animate-fade-in"
              style={{
                animation: 'fadeIn 0.6s ease-out',
                fontSize: i === 0 ? '1.25rem' : '0.875rem',
                opacity: i === 0 ? 1 : 0.6,
              }}
            >
              {d.text}
            </p>
          ))}
        </div>

        <div
          className={`transition-all duration-700 delay-300 ${
            dialogueIdx >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-3">
              {CONTROLS.map((c) => (
                <div key={c.keys} className="flex items-center gap-3">
                  <kbd className="min-w-[80px] px-2.5 py-1.5 text-xs font-mono text-white/80 bg-white/10 rounded-md border border-white/20 text-center">
                    {c.keys}
                  </kbd>
                  <span className="text-xs text-white/50 font-mono">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={dismiss}
              className="px-6 py-2 text-xs font-mono text-white/60 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white/80 transition-all"
            >
              Begin Your Journey
            </button>
            <p className="text-[10px] text-white/20 mt-3 font-mono">
              Press any key or move the mouse to dismiss
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
