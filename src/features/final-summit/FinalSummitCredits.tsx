'use client'

import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'

const CREDITS = [
  { type: 'title', text: 'SAIVERSE' },
  { type: 'subtitle', text: 'An Interactive 3D Adventure Game' },
  { type: 'spacer' },
  { type: 'label', text: 'Created by' },
  { type: 'name', text: 'Saiteja Kommi' },
  { type: 'spacer' },
  { type: 'label', text: 'Built with' },
  { type: 'tech', text: 'Next.js \u00b7 React Three Fiber \u00b7 Three.js' },
  { type: 'tech', text: 'Rapier \u00b7 GSAP \u00b7 Framer Motion \u00b7 Zustand' },
  { type: 'spacer' },
  { type: 'label', text: 'Special Thanks' },
  { type: 'thanks', text: 'To everyone who believed in the journey.' },
  { type: 'spacer' },
  { type: 'spacer' },
  { type: 'final-line', text: 'Every project began as an idea.' },
  { type: 'final-line', text: 'Every skill began with a first attempt.' },
  { type: 'final-line', text: 'This was my journey.' },
  { type: 'spacer' },
  { type: 'final-line-em', text: 'Now go build yours.' },
]

function FinalMessageOverlay({ onExplore }: { onExplore: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 200)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-6 max-w-lg px-6 text-center">
        <div className="text-white/90 text-xl font-mono leading-relaxed">
          Every project began as an idea.
        </div>
        <div className="text-white/90 text-xl font-mono leading-relaxed">
          Every skill began with a first attempt.
        </div>
        <div className="text-white/90 text-xl font-mono leading-relaxed">
          This was my journey.
        </div>
        <div className="mt-4 text-2xl font-mono font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
          Now go build yours.
        </div>
        <div className="mt-10">
          <button
            onClick={onExplore}
            className="px-8 py-3 border border-neon-gold/40 text-neon-gold font-mono text-sm tracking-widest hover:bg-neon-gold/10 transition-all duration-300 animate-pulse"
          >
            EXPLORE MY PORTFOLIO
          </button>
        </div>
        <div className="mt-6 flex gap-4 text-white/30 text-xs font-mono">
          <a href="https://github.com/SaitejaKommi" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
            GitHub
          </a>
          <a href="https://linkedin.com/in/saitejakommi" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
            LinkedIn
          </a>
          <a href="https://github.com/SaitejaKommi/Portfolio" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
            Portfolio
          </a>
        </div>
      </div>
    </div>
  )
}

export function FinalSummitCredits() {
  const setFinalePhase = useGameStore((s) => s.setFinalePhase)
  const setCinematic = useGameStore((s) => s.setCinematic)
  const finalePhase = useGameStore((s) => s.finalePhase)
  const [scrollPhase, setScrollPhase] = useState<'scrolling' | 'fade' | 'final' | 'done'>('scrolling')
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(0)
  const scrollPhaseRef = useRef<'scrolling' | 'fade' | 'final' | 'done'>('scrolling')

  useEffect(() => {
    if (finalePhase !== 'complete_show') return

    scrollPhaseRef.current = 'scrolling'
    scrollRef.current = 0
    let animId: number
    const startTime = Date.now()
    const totalDuration = CREDITS.length * 2000 + 3000

    const tick = () => {
      const elapsed = Date.now() - startTime
      scrollRef.current = Math.min(elapsed / totalDuration, 1)
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${-scrollRef.current * 60}vh)`
      }

      const phase = scrollPhaseRef.current
      if (scrollRef.current >= 0.85 && phase === 'scrolling') {
        scrollPhaseRef.current = 'fade'
        setScrollPhase('fade')
      }

      if (scrollRef.current >= 1 && phase !== 'final') {
        scrollPhaseRef.current = 'final'
        setScrollPhase('final')
        setTimeout(() => {
          scrollPhaseRef.current = 'done'
          setScrollPhase('done')
        }, 100)
        return
      }

      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(animId)
  }, [finalePhase])

  const handleExplore = () => {
    window.open('https://github.com/SaitejaKommi', '_blank')
    setFinalePhase('done')
    setCinematic(false)
  }

  if (finalePhase === 'idle' || finalePhase === 'pullback' || finalePhase === 'dialogue' || finalePhase === 'rewards') return null

  return (
    <>
      {finalePhase === 'complete_show' && scrollPhase !== 'final' && scrollPhase !== 'done' && (
        <div className="fixed inset-0 z-[100] bg-[#020617] overflow-hidden">
          <div ref={containerRef} className="flex flex-col items-center pt-[50vh] gap-6">
            {CREDITS.map((item, i) => {
              if (item.type === 'spacer') return <div key={i} className="h-8" />
              if (item.type === 'title') {
                return (
                  <div key={i} className="text-5xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                    {item.text}
                  </div>
                )
              }
              if (item.type === 'subtitle') {
                return <div key={i} className="text-white/40 text-sm font-mono tracking-wide">{item.text}</div>
              }
              if (item.type === 'label') {
                return <div key={i} className="text-white/50 text-xs font-mono tracking-[0.2em] uppercase mt-4">{item.text}</div>
              }
              if (item.type === 'name') {
                return <div key={i} className="text-white/90 text-xl font-mono">{item.text}</div>
              }
              if (item.type === 'tech') {
                return <div key={i} className="text-white/60 text-sm font-mono">{item.text}</div>
              }
              if (item.type === 'thanks') {
                return <div key={i} className="text-white/60 text-sm font-mono italic">{item.text}</div>
              }
              if (item.type === 'final-line') {
                return <div key={i} className="text-white/80 text-lg font-mono">{item.text}</div>
              }
              if (item.type === 'final-line-em') {
                return <div key={i} className="text-2xl font-bold font-mono bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent mt-4">{item.text}</div>
              }
              return null
            })}
          </div>
          <div className="fixed inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020617] to-transparent pointer-events-none" />
        </div>
      )}

      {scrollPhase === 'final' && (
        <FinalMessageOverlay onExplore={handleExplore} />
      )}
    </>
  )
}
