'use client'

import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuestStore } from '@/stores/questStore'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import { FS_QUEST_ID } from '@/data/final-summit/fs-quest'
import { CENTRAL_PEDESTAL_POSITION } from '@/data/final-summit/fs-layout'

type PedestalPhase = 'idle' | 'booting' | 'display' | 'complete'

const BOOT_MESSAGES = [
  'Initializing...',
  'Loading Journey...',
  'Loading Portfolio...',
]

export function CentralPedestal() {
  const [phase, setPhase] = useState<PedestalPhase>('idle')
  const [hovered, setHovered] = useState(false)
  const [bootIndex, setBootIndex] = useState(-1)
  const [allMonumentsDone, setAllMonumentsDone] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const notif = useNotificationStore()

  useEffect(() => {
    const unsub = EventBus.on(GameEvents.QUEST_PROGRESS, () => {
      const quest = useQuestStore.getState().quests[FS_QUEST_ID]
      if (!quest) return
      const monumentObjectives = quest.objectives.filter((o) => o.id.startsWith('obj-monument-'))
      const allDone = monumentObjectives.every((o) => o.current >= o.count)
      if (allDone) setAllMonumentsDone(true)
    })
    return () => { unsub() }
  }, [])

  const handleActivate = useCallback(() => {
    if (phase === 'display') {
      EventBus.emit(GameEvents.CHAPTER_FINALE_TRIGGER, { chapterId: 'chapter-7' })
      return
    }
    if (phase !== 'idle') return
    if (!allMonumentsDone) {
      notif.addNotification('system', 'Not Yet', 'Visit all monuments before approaching the pedestal.')
      return
    }
    soundFX.playQuestAccept()
    setPhase('booting')
    setBootIndex(0)

    let idx = 0
    const interval = setInterval(() => {
      idx++
      if (idx < BOOT_MESSAGES.length) {
        setBootIndex(idx)
        soundFX.playUIBeep(400 + idx * 100, 0.1, 0.06)
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setPhase('display')
          soundFX.playBadgeEarned()
        }, 500)
      }
    }, 1200)
  }, [phase, allMonumentsDone, notif])

  const displayTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256
    const ctx = c.getContext('2d')!

    if (phase === 'booting') {
      ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 512, 256)

      ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1
      ctx.roundRect(10, 10, 492, 236, 8); ctx.stroke()

      ctx.fillStyle = '#00d4ff'
      ctx.font = '14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      const msg = bootIndex >= 0 && bootIndex < BOOT_MESSAGES.length ? BOOT_MESSAGES[bootIndex] ?? '...' : '...'
      ctx.fillText(msg, 256, 128)

      for (let i = 0; i < BOOT_MESSAGES.length; i++) {
        ctx.fillStyle = i <= bootIndex ? '#00d4ff' : '#333344'
        ctx.font = '10px monospace'
        ctx.fillText(BOOT_MESSAGES[i]!, 256, 180 + i * 18)
      }
    }

    if (phase === 'display') {
      ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 512, 256)

      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2
      ctx.roundRect(10, 10, 492, 236, 12); ctx.stroke()

      ctx.fillStyle = '#ffd700'
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('SAITEJA KOMMI', 256, 35)

      ctx.fillStyle = '#ffffff'
      ctx.font = '12px monospace'
      ctx.fillText('Software Engineer | Open Source Contributor', 256, 65)
      ctx.fillText('Fullstack Developer | Lifelong Learner', 256, 85)

      ctx.strokeStyle = '#333355'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(50, 105); ctx.lineTo(462, 105); ctx.stroke()

      const labels: string[] = ['Resume', 'Projects', 'GitHub', 'LinkedIn', 'Contact']
      const colors: string[] = ['#00d4ff', '#00ff88', '#a855f7', '#ff6600', '#ffd700']
      ctx.font = 'bold 11px monospace'
      for (let i = 0; i < labels.length; i++) {
        const x = 256 - 160 + i * 80
        ctx.fillStyle = colors[i]!
        ctx.fillText(labels[i]!, x, 135)
      }

      ctx.fillStyle = '#888899'
      ctx.font = '10px monospace'
      ctx.fillText('View my portfolio at', 256, 170)
      ctx.fillStyle = '#00d4ff'
      ctx.font = 'bold 12px monospace'
      ctx.fillText('github.com/SaitejaKommi', 256, 195)
      ctx.fillStyle = '#888899'
      ctx.font = '9px monospace'
      ctx.fillText('linkedin.com/in/saitejakommi', 256, 220)
    }

    return new THREE.CanvasTexture(c)
  }, [phase, bootIndex])

  useFrame((state) => {
    if (!groupRef.current) return
    if (phase === 'display') {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.03
    }
  })

  return (
    <group ref={groupRef} position={CENTRAL_PEDESTAL_POSITION}>
      {/* Pedestal base */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.15, 12]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pedestal column */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.6, 10]} />
        <meshStandardMaterial
          color={phase === 'display' ? '#ffd700' : '#1a1a3e'}
          metalness={0.7}
          roughness={0.2}
          emissive={phase === 'display' ? '#ffd700' : '#00d4ff'}
          emissiveIntensity={phase === 'display' ? 0.4 : allMonumentsDone ? 0.15 : 0.02}
        />
      </mesh>

      {/* Laptop-like surface */}
      <mesh
        position={[0, 0.7, 0]}
        onClick={handleActivate}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.7, 0.04, 0.5]} />
        <meshStandardMaterial
          color="#0a0a1a"
          metalness={0.9}
          roughness={0.1}
          emissive={allMonumentsDone ? '#00d4ff' : '#000000'}
          emissiveIntensity={allMonumentsDone ? 0.1 : 0}
        />
      </mesh>

      {/* Screen glow */}
      <mesh position={[0, 0.72, 0.05]}>
        <planeGeometry args={[0.6, 0.35]} />
        <meshBasicMaterial
          color={phase === 'display' ? '#ffd700' : allMonumentsDone ? '#00d4ff' : '#0a0a1a'}
          transparent
          opacity={phase === 'display' ? 0.15 : allMonumentsDone ? 0.08 : 0}
          depthWrite={false}
        />
      </mesh>

      {/* Holographic display */}
      {displayTexture && (
        <sprite position={[0, 1.6, 0]} scale={[2.5, 1.3, 1]}>
          <spriteMaterial map={displayTexture} transparent depthTest={false} />
        </sprite>
      )}

      {/* Prompt label */}
      <sprite position={[0, -0.3, 0.8]} scale={[1.2, 0.08, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 20
          const ctx = c.getContext('2d')!
          const label = phase === 'idle' ? (allMonumentsDone ? 'APPROACH PEDESTAL' : '-- LOCKED --') : phase === 'display' ? 'PORTFOLIO' : 'BOOTING...'
          ctx.fillStyle = allMonumentsDone ? '#ffd700' : '#555566'
          ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(label, 128, 10)
          return new THREE.CanvasTexture(c)
        })()} transparent depthTest={false} />
      </sprite>

      {/* Hover glow */}
      {hovered && allMonumentsDone && (
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.8, 0.02, 0.6]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
