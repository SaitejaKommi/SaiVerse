'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { useHackathonStore } from './HackathonStore'
import { HA_QUEST_ID } from '@/data/hackathon-arena/ha-quest'
import { STATION_POSITIONS } from '@/data/hackathon-arena/ha-layout'

const STATION_POS = new THREE.Vector3(...STATION_POSITIONS.codeStation)
const INTERACT_RADIUS = 4
const CODE_RATE = 25

const SPRINT_REQUIREMENTS: Record<string, number> = {
  'sprint-1': 80,
  'sprint-2': 120,
  'sprint-3': 160,
}

export function CodeStation() {
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.Mesh>(null)
  const barRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)
  const heldRef = useRef(false)
  const keyMapRef = useRef<Record<string, boolean>>({})
  const completedRef = useRef(false)
  const notif = useNotificationStore()

  const screenTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 160
    const tex = new THREE.CanvasTexture(c)
    tex.minFilter = THREE.LinearFilter
    return tex
  }, [])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keyMapRef.current[e.key.toLowerCase()] = true
    }
    const onUp = (e: KeyboardEvent) => {
      keyMapRef.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (completedRef.current) return

    const store = useHackathonStore.getState()
    const phase = store.phase
    if (phase !== 'sprint-1' && phase !== 'sprint-2' && phase !== 'sprint-3') return
    if (store.activeSetback && store.activeSetback.station === 'code') return

    const player = useGameStore.getState().player
    if (!player) return

    const dx = player.position[0] - STATION_POS.x
    const dz = player.position[2] - STATION_POS.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const inRange = dist < INTERACT_RADIUS

    const holdingE = keyMapRef.current['e'] || keyMapRef.current['E']

    if (inRange && holdingE) {
      if (!heldRef.current) {
        heldRef.current = true
      }
      const req = SPRINT_REQUIREMENTS[phase] ?? 100
      progressRef.current = Math.min(req, progressRef.current + CODE_RATE * delta)
      store.setSprintProgress(progressRef.current / req)

      if (progressRef.current >= req) {
        completedRef.current = true
        progressRef.current = 0
        store.setSprintProgress(0)
        store.setTimeRemaining(store.timeRemaining + 5)
        store.modifyTeamEnergy(5)

        if (phase === 'sprint-1') {
          store.setSprint1Done(true)
          soundFX.playQuestComplete()
          notif.addNotification('quest', 'Sprint 1 Complete!', 'Foundation built!')
          QuestManager.completeObjective(HA_QUEST_ID, 'obj-sprint-1')
        } else if (phase === 'sprint-2') {
          store.setSprint2Done(true)
          soundFX.playQuestComplete()
          notif.addNotification('quest', 'Sprint 2 Complete!', 'Features shipped!')
          QuestManager.completeObjective(HA_QUEST_ID, 'obj-sprint-2')
        } else if (phase === 'sprint-3') {
          store.setSprint3Done(true)
          soundFX.playQuestComplete()
          notif.addNotification('quest', 'Sprint 3 Complete!', 'Project shipped!')
          QuestManager.completeObjective(HA_QUEST_ID, 'obj-sprint-3')
        }
      }
    } else {
      heldRef.current = false
    }

    // Screen display
    if (screenRef.current) {
      const tex = screenTexture
      const c = tex.image as HTMLCanvasElement
      const ctx = c.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#0a0a1a'
        ctx.fillRect(0, 0, 256, 160)

        if (inRange && holdingE) {
          const req = SPRINT_REQUIREMENTS[phase] ?? 100
          const pct = progressRef.current / req

          // Code lines scrolling
          ctx.fillStyle = '#00d4ff'
          ctx.font = '9px monospace'
          for (let i = 0; i < 12; i++) {
            const lineAlpha = Math.max(0, 1 - Math.abs((state.clock.elapsedTime * 3 + i * 0.5) % 12 - i) * 0.3)
            ctx.globalAlpha = lineAlpha * 0.4
            const lineLen = 10 + Math.floor(Math.sin(i * 2.5 + state.clock.elapsedTime * 2) * 8)
            ctx.fillText('> ' + '='.repeat(Math.max(1, Math.floor(lineLen * pct))), 8, 14 + i * 12)
          }
          ctx.globalAlpha = 1

          // Progress bar
          ctx.fillStyle = '#1a1a3e'
          ctx.fillRect(20, 138, 216, 12)
          ctx.fillStyle = pct >= 1 ? '#00ff88' : '#00d4ff'
          ctx.fillRect(20, 138, 216 * pct, 12)
          ctx.fillStyle = '#ffffff'
          ctx.font = '8px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(`CODING... ${Math.floor(pct * 100)}%`, 128, 148)
        } else {
          ctx.fillStyle = '#1a1a2e'
          ctx.font = '10px monospace'
          ctx.textAlign = 'center'
          ctx.fillText('CODE STATION', 128, 60)
          if (dist < INTERACT_RADIUS + 2) {
            ctx.fillStyle = '#00d4ff'
            ctx.font = '8px monospace'
            ctx.fillText(inRange ? 'HOLD E TO CODE' : 'APPROACH TO CODE', 128, 100)
          }
        }
        tex.needsUpdate = true
      }

      // Active glow
      const mat = screenRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = inRange && holdingE ? 0.9 : inRange ? 0.6 : 0.3
      const glow = new THREE.Color(inRange && holdingE ? '#00d4ff' : '#0a3a5a')
      mat.color.copy(glow)
    }

    // Progress bar (3D ring)
    if (barRef.current) {
      const req = SPRINT_REQUIREMENTS[phase] ?? 100
      const pct = progressRef.current / req
      barRef.current.scale.setScalar(0.8 + pct * 0.2)
      const barMat = barRef.current.material as THREE.MeshBasicMaterial
      barMat.opacity = heldRef.current ? 0.2 + pct * 0.4 : 0.05
    }
  })

  return (
    <group ref={groupRef} position={STATION_POS}>
      {/* Desk */}
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.85, 0.45]}>
        <planeGeometry args={[0.9, 0.6]} />
        <meshBasicMaterial color="#0a0a1a" transparent opacity={0.3} depthTest={false} />
      </mesh>
      {/* Screen frame */}
      <mesh position={[0, 0.85, 0.45]}>
        <boxGeometry args={[1.0, 0.65, 0.03]} />
        <meshStandardMaterial color="#0f0f2a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Desk light */}
      <mesh position={[0.5, 0.3, 0.3]}>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} />
      </mesh>
      {/* Progress ring */}
      <mesh ref={barRef} position={[0, 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.3, 24]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}
