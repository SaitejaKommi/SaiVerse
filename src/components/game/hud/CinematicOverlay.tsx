'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'

export function CinematicOverlay() {
  const isCinematic = useGameStore((s) => s.isCinematic)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isCinematic) {
      setVisible(true)
      return
    }
    const timeout = setTimeout(() => setVisible(false), 300)
    return () => clearTimeout(timeout)
  }, [isCinematic])

  if (!visible) return null

  return (
    <>
      <div
        className="fixed left-0 right-0 z-50 pointer-events-none"
        style={{
          top: 0,
          height: '8vh',
          transition: 'transform 0.5s ease, opacity 0.5s ease',
          transform: isCinematic ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isCinematic ? 1 : 0,
        }}
      >
        <div className="w-full h-full bg-black" />
      </div>

      <div
        className="fixed left-0 right-0 z-50 pointer-events-none"
        style={{
          bottom: 0,
          height: '8vh',
          transition: 'transform 0.5s ease, opacity 0.5s ease',
          transitionDelay: isCinematic ? '0s' : '0.3s',
          transform: isCinematic ? 'translateY(0)' : 'translateY(100%)',
          opacity: isCinematic ? 1 : 0,
        }}
      >
        <div className="w-full h-full bg-black" />
      </div>

      {isCinematic && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            opacity: 0.5,
            animation: 'cinematic-grain 0.3s steps(4) infinite',
          }}
        />
      )}

      <style>{`
        @keyframes cinematic-grain {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
        }
      `}</style>
    </>
  )
}
