'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { soundFX } from '@/systems/audio/SoundFX'
import { useHackathonStore } from './HackathonStore'

export function HackathonAudio() {
  const lastStateRef = useRef<string>('')
  const panicPulseRef = useRef(0)
  const victoryPlayedRef = useRef(false)
  const pressurePlayedRef = useRef(false)

  useEffect(() => {
    const unsub = useHackathonStore.subscribe((state) => {
      lastStateRef.current = state.musicState
    })
    return unsub
  }, [])

  useFrame((state, delta) => {
    const store = useHackathonStore.getState()
    const ms = store.musicState

    if (ms === 'victory' && !victoryPlayedRef.current) {
      victoryPlayedRef.current = true
      soundFX.playBadgeEarned()
      setTimeout(() => soundFX.playBadgeEarned(), 800)
    }

    if (ms === 'panic') {
      panicPulseRef.current += delta
      if (panicPulseRef.current >= 0.5) {
        panicPulseRef.current = 0
        soundFX.playUIBeep(200, 0.06, 0.08)
      }
    } else {
      panicPulseRef.current = 0
    }

    if (ms === 'pressure' && !pressurePlayedRef.current) {
      pressurePlayedRef.current = true
      soundFX.playUIBeep(400, 0.2, 0.1)
      setTimeout(() => soundFX.playUIBeep(500, 0.15, 0.08), 300)
    }

    if (ms === 'normal' && pressurePlayedRef.current) {
      pressurePlayedRef.current = false
    }

    if (ms === 'normal' && victoryPlayedRef.current) {
      victoryPlayedRef.current = false
    }
  })

  return null
}
