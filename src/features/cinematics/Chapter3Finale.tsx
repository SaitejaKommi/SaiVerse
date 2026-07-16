'use client'

import { useEffect, useState, useRef } from 'react'
import { useQuestStore } from '@/stores/questStore'
import { AI_QUEST_ID } from '@/data/ai-district/ai-quest'

export function Chapter3Finale() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const shownRef = useRef(false)

  useEffect(() => {
    const check = () => {
      const completed = useQuestStore.getState().completedQuestIds.includes(AI_QUEST_ID)
      if (completed && !shownRef.current) {
        shownRef.current = true
        setTimeout(() => setVisible(true), 800)
        setTimeout(() => setFading(true), 4000)
        setTimeout(() => setVisible(false), 5000)
      }
    }

    check()
    const interval = setInterval(check, 500)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[95] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="text-xs tracking-[0.3em] uppercase font-mono text-neon-purple/40">
          Chapter 3
        </div>
        <div className="text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange bg-clip-text text-transparent">
            Research Complete
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 mt-3">
          <div className="text-white/60 text-sm font-mono">+100 Knowledge</div>
          <div className="text-white/60 text-sm font-mono">+ Python Unlocked</div>
          <div className="text-white/60 text-sm font-mono">+ Machine Learning Basics Unlocked</div>
          <div className="text-white/60 text-sm font-mono">+ Badge: Chapter 3 Complete</div>
        </div>
      </div>
    </div>
  )
}
