'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'

const FINALE_TEXT = [
  'You studied the fundamentals on that whiteboard — just as Sai did. You wrote your first program on that terminal — just as Sai did. You proved that engineering isn\'t about knowing everything from the start. It\'s about showing up, staying curious, and writing the next line.',
  'Java is now part of your toolkit. But more importantly, you now think like an engineer. You plan before you code. You check your assumptions. You persevere when the compiler says no.',
  'This campus was where Sai\'s journey began. And now it\'s where yours continues. The road ahead leads to a place Sai built with everything he learned — a city of pure code. But that\'s a story for another day.',
  'For now — take a moment. You\'ve earned it.',
]

function FinaleDialogueOverlay({ onContinue }: { onContinue: () => void }) {
  const [page, setPage] = useState(0)
  const [pageVisible, setPageVisible] = useState(true)

  const handleClick = () => {
    if (page < FINALE_TEXT.length - 1) {
      setPageVisible(false)
      setTimeout(() => {
        setPage((p) => p + 1)
        setPageVisible(true)
      }, 300)
    } else {
      onContinue()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/60 cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={`max-w-2xl mx-auto px-8 transition-all duration-500 ${
          pageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="text-neon-gold/60 text-xs tracking-[0.25em] uppercase mb-4 text-center font-mono">
          Professor Mehta
        </div>
        <p className="text-white/90 text-lg leading-relaxed text-center font-mono">
          {FINALE_TEXT[page]}
        </p>
        <div className="mt-8 flex justify-center">
          <div className="text-white/30 text-xs font-mono animate-pulse">
            {page < FINALE_TEXT.length - 1 ? 'click to continue' : 'click to finish'}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChapterCompleteOverlay({ onContinue }: { onContinue: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-[#020617]/90 cursor-pointer" onClick={onContinue}>
      <div
        className={`flex flex-col items-center gap-6 transition-all duration-1000 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="text-neon-gold/40 text-xs tracking-[0.3em] uppercase font-mono">
          Chapter 1
        </div>
        <div className="text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
            Complete
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="text-white/60 text-sm font-mono">+50 Knowledge</div>
          <div className="text-white/60 text-sm font-mono">+ Java Language Unlocked</div>
          <div className="text-white/60 text-sm font-mono">+ Badge: First Lesson</div>
          <div className="text-white/60 text-sm font-mono">+ Badge: Chapter 1 Complete</div>
        </div>
        <div className="mt-4 text-white/30 text-xs font-mono animate-pulse">
          click to continue
        </div>
      </div>
    </div>
  )
}

function NextChapterTeaser({ onContinue }: { onContinue: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-[#020617]/90 cursor-pointer" onClick={onContinue}>
      <div
        className={`flex flex-col items-center gap-6 transition-all duration-1000 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="text-xs tracking-[0.3em] uppercase font-mono text-white/30">
          Next Chapter Unlocked
        </div>
        <div className="text-4xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple bg-clip-text text-transparent">
            Software City
          </span>
        </div>
        <div className="text-white/40 text-sm font-mono mt-2 text-center max-w-md">
          A city built from pure code awaits. Every skyscraper, every street, every light — written by Sai, line by line.
        </div>
        <div className="mt-6 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-neon-blue/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <div className="mt-4 text-white/30 text-xs font-mono animate-pulse">
          click to continue your journey
        </div>
      </div>
    </div>
  )
}

export function ChapterFinale() {
  const setFinalePhase = useGameStore((s) => s.setFinalePhase)
  const setCinematic = useGameStore((s) => s.setCinematic)
  const finalePhase = useGameStore((s) => s.finalePhase)

  const handleDialogueDone = () => {
    setFinalePhase('rewards')
  }

  const handleCompleteDone = () => {
    setFinalePhase('teaser')
  }

  const handleTeaserDone = () => {
    setFinalePhase('done')
    setCinematic(false)
  }

  if (finalePhase === 'idle' || finalePhase === 'pullback') return null

  return (
    <>
      {finalePhase === 'dialogue' && <FinaleDialogueOverlay onContinue={handleDialogueDone} />}
      {finalePhase === 'rewards' && (
        <div className="fixed inset-0 z-[85] bg-black/40 pointer-events-none" />
      )}
      {finalePhase === 'complete_show' && <ChapterCompleteOverlay onContinue={handleCompleteDone} />}
      {finalePhase === 'teaser' && <NextChapterTeaser onContinue={handleTeaserDone} />}
    </>
  )
}
