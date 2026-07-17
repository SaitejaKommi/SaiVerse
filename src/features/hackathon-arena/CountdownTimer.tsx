'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuestStore } from '@/stores/questStore'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { useHackathonStore } from './HackathonStore'
import { HA_QUEST_ID } from '@/data/hackathon-arena/ha-quest'
import { STATION_POSITIONS } from '@/data/hackathon-arena/ha-layout'

const SPRINT_1_END = 90
const SPRINT_2_END = 50
const SPRINT_3_END = 0
const TIMER_START_DELAY = 3

export function CountdownTimer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const startedRef = useRef(false)
  const countdownActiveRef = useRef(false)
  const startDelayRef = useRef(TIMER_START_DELAY)
  const lastSecondRef = useRef(120)
  const announceRef = useRef(false)

  const notif = useNotificationStore()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 256
    canvasRef.current = canvas
    textureRef.current = new THREE.CanvasTexture(canvas)
  }, [])

  useEffect(() => {
    const unsub = useQuestStore.subscribe((state) => {
      const done = state.completedQuestIds.includes(HA_QUEST_ID)
      if (done) useHackathonStore.getState().setPhase('complete')
    })
    return unsub
  }, [])

  useFrame((state, delta) => {
    const store = useHackathonStore.getState()
    const phase = store.phase

    if (phase === 'waiting' && !startedRef.current) {
      startDelayRef.current -= delta
      if (startDelayRef.current <= 0) {
        startedRef.current = true
        countdownActiveRef.current = true
        store.setPhase('sprint-1')
        store.setMusicState('normal')
        soundFX.playQuestAccept()
        notif.addNotification('quest', 'HACKATHON START!', 'Sprint 1: Build your foundation!')
      }
    }

    if (countdownActiveRef.current && phase !== 'presentation' && phase !== 'complete') {
      const t = Math.max(0, store.timeRemaining - delta)
      store.setTimeRemaining(t)

      if (t <= SPRINT_3_END && !store.sprint3Done && phase === 'sprint-3') {
        countdownActiveRef.current = false
        store.setPhase('presentation')
        store.setMusicState('silence')
        return
      }
      if (t <= SPRINT_2_END && !store.sprint2Done && phase === 'sprint-2') {
        store.setPhase('sprint-3')
        store.setMusicState('panic')
        notif.addNotification('quest', 'FINAL SPRINT!', 'Sprint 3: Ship it!')
      }
      if (t <= SPRINT_1_END && !store.sprint1Done && phase === 'sprint-1') {
        store.setPhase('sprint-2')
        store.setMusicState('pressure')
        notif.addNotification('quest', 'Sprint 2: Features!', 'Keep building!')
      }

      // Music state transitions based on timer
      const seconds = Math.floor(t)
      if (seconds <= 10 && seconds > 0) {
        store.setMusicState('panic')
      } else if (seconds <= 30 && seconds > 10) {
        store.setMusicState('pressure')
      }

      // Tick sound every second in final 10
      if (seconds !== lastSecondRef.current && seconds <= 10 && seconds > 0) {
        lastSecondRef.current = seconds
        soundFX.playQuestComplete()
      }
      if (seconds === 0) {
        lastSecondRef.current = 0
      }
    }

    // Announce sprint 3 at t=50 for first time
    if (phase === 'sprint-3' && !announceRef.current) {
      announceRef.current = true
    }
  })

  const seconds = Math.max(0, Math.ceil(useHackathonStore((s) => s.timeRemaining)))
  const phase = useHackathonStore((s) => s.phase)
  const setback = useHackathonStore((s) => s.activeSetback)

  return <ProjectorScreen seconds={seconds} phase={phase} setback={setback} />
}

function ProjectorScreen({ seconds, phase, setback }: { seconds: number; phase: string; setback: { name: string; description: string } | null }) {
  const ref = useRef<THREE.Mesh>(null)

  const texture = useRef(new THREE.CanvasTexture((() => {
    const c = document.createElement('canvas')
    c.width = 1024; c.height = 256
    return c
  })()))

  useFrame((state) => {
    if (!ref.current) return
    const tex = texture.current
    const c = tex.image as HTMLCanvasElement
    const ctx = c.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, 1024, 256)

    // Background
    ctx.fillStyle = setback ? '#1a0a0a' : '#0a0a1a'
    ctx.roundRect(4, 4, 1016, 248, 12)
    ctx.fill()

    // Border
    const borderColor = setback
      ? '#ff0000'
      : phase === 'complete' ? '#ffd700' : seconds <= 10 ? '#ff0000' : seconds <= 30 ? '#ff6600' : '#00d4ff'
    ctx.strokeStyle = borderColor
    ctx.lineWidth = setback ? 5 : 3
    ctx.roundRect(4, 4, 1016, 248, 12)
    ctx.stroke()

    // Timer number
    if (!setback) {
      if (phase === 'complete') {
        // Champion screen
        ctx.fillStyle = '#ffd700'
        ctx.font = 'bold 48px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#ffd700'
        ctx.shadowBlur = 40 + Math.sin(state.clock.elapsedTime * 3) * 10
        ctx.fillText('MONAD BLITZ', 512, 70)
        ctx.fillText('CHAMPION', 512, 130)
        ctx.shadowBlur = 0

        ctx.fillStyle = '#888899'
        ctx.font = '14px monospace'
        ctx.fillText('Congratulations — you built it all under pressure.', 512, 185)
        ctx.fillText('The Valley celebrates your victory.', 512, 210)
      } else if (phase === 'presentation') {
        // Presentation screen
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('TIME TO PRESENT', 512, 60)

        ctx.fillStyle = '#a855f7'
        ctx.font = '18px monospace'
        const scoreStore = useHackathonStore.getState()
        const timeBonus = Math.floor(scoreStore.timeRemaining * 0.5)
        const energyBonus = Math.floor(scoreStore.teamEnergy * 0.3 + 30)
        const resolveBonus = (scoreStore.totalSetbacksResolved ?? 0) * 15
        const total = timeBonus + energyBonus + resolveBonus + 50

        ctx.fillText('INNOVATION    EXECUTION    PRESENTATION', 512, 110)
        ctx.fillStyle = '#ffd700'
        ctx.font = '24px monospace'
        ctx.fillText(`${timeBonus}         ${energyBonus}         ${resolveBonus}`, 512, 145)
        ctx.fillStyle = '#888899'
        ctx.font = '12px monospace'
        ctx.fillText('(time)        (energy)      (setbacks)', 512, 170)
        ctx.fillStyle = '#00ff88'
        ctx.font = 'bold 28px monospace'
        ctx.fillText(`TOTAL SCORE: ${total}`, 512, 220)
      } else {
        // Normal timer display
        ctx.fillStyle = seconds <= 10 ? '#ff3333' : '#ffffff'
        ctx.font = `bold ${seconds <= 10 ? 140 : 120}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = seconds <= 10 ? '#ff0000' : borderColor
        ctx.shadowBlur = seconds <= 10 ? 40 : 20
        ctx.fillText(String(seconds), 512, 130)
        ctx.shadowBlur = 0

        // Phase label
        ctx.fillStyle = '#888899'
        ctx.font = '16px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(phaseLabel(phase), 512, 35)
      }
    } else {
      // Setback warning
      ctx.fillStyle = '#ff3333'
      ctx.font = 'bold 36px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = '#ff0000'
      ctx.shadowBlur = 30 + Math.sin(state.clock.elapsedTime * 6) * 10
      ctx.fillText('! ' + setback.name.toUpperCase() + ' !', 512, 80)
      ctx.shadowBlur = 0

      ctx.fillStyle = '#ff8888'
      ctx.font = '16px monospace'
      ctx.fillText(setback.description, 512, 140)

      ctx.fillStyle = '#ff4444'
      ctx.font = '12px monospace'
      ctx.fillText('FIX THE ISSUE AT THE DEBUG CONSOLE', 512, 190)
    }

    tex.needsUpdate = true
  })

  return (
    <mesh ref={ref} position={[STATION_POSITIONS.projectorScreen[0], STATION_POSITIONS.projectorScreen[1], STATION_POSITIONS.projectorScreen[2]]}>
      <planeGeometry args={[14, 3.5]} />
      <meshBasicMaterial map={texture.current} transparent depthTest={false} />
    </mesh>
  )
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case 'waiting': return 'STANDING BY'
    case 'sprint-1': return 'SPRINT 1: FOUNDATION'
    case 'sprint-2': return 'SPRINT 2: FEATURES'
    case 'sprint-3': return 'SPRINT 3: SHIP IT'
    case 'presentation': return 'PRESENTATION'
    case 'complete': return 'CHAMPION'
    default: return ''
  }
}
