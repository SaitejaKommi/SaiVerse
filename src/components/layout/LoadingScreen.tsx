'use client'

import { useEffect, useState, useRef } from 'react'

interface LoadingScreenProps {
  minimumDuration?: number
  onComplete?: () => void
}

export function LoadingScreen({ minimumDuration = 1500, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [hidden, setHidden] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    const startTime = performance.now()

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime
      const raw = Math.min(elapsed / minimumDuration, 1)
      setProgress(1 - Math.pow(1 - raw, 3))

      if (elapsed >= minimumDuration && !done.current) {
        done.current = true
        clearInterval(interval)
        setFading(true)
        setTimeout(() => {
          setHidden(true)
          onComplete?.()
        }, 500)
      }
    }, 16)

    return () => clearInterval(interval)
  }, [minimumDuration, onComplete])

  if (hidden) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-950 transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="mb-8 flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold tracking-wider text-white">
          <span className="text-neon-blue">Sai</span>
          <span className="text-neon-purple">Verse</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.3em] text-surface-400/60">
          Loading Experience
        </p>
      </div>

      <div className="relative h-1 w-48 overflow-hidden rounded-full bg-surface-800">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-100 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p className="mt-4 text-xs text-surface-500">
        {Math.round(progress * 100)}%
      </p>
    </div>
  )
}
