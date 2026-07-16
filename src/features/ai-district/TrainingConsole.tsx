'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { AI_QUEST_ID } from '@/data/ai-district/ai-quest'

const STATION_POS = new THREE.Vector3(30, 0, -360)
const ZONE_RADIUS = 1.2

const PARAM_ZONES = [
  { id: 'lr', label: 'LR', x: -1.5, color: '#00d4ff', desc: 'Learning Rate' },
  { id: 'epochs', label: 'EP', x: 0, color: '#a855f7', desc: 'Epochs' },
  { id: 'batch', label: 'BS', x: 1.5, color: '#00ff88', desc: 'Batch Size' },
]

function ParamZone({ zone, playerInZone, value }: { zone: typeof PARAM_ZONES[0]; playerInZone: boolean; value: number }) {
  const barRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (barRef.current) {
      const h = 0.1 + value * 0.8
      barRef.current.scale.y = h
      barRef.current.position.y = h / 2 + 0.05
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = playerInZone ? 0.1 + Math.sin(t * 2) * 0.05 : 0.02
    }
  })

  return (
    <group position={[zone.x, 0, 0]}>
      {/* Zone floor glow */}
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ZONE_RADIUS, 16]} />
        <meshBasicMaterial color={zone.color} transparent opacity={0.02} depthWrite={false} />
      </mesh>

      {/* Value bar */}
      <mesh ref={barRef} position={[0, 0.05, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.2} transparent opacity={0.7} />
      </mesh>

      {/* Label */}
      <sprite position={[0, 1.2, 0]} scale={[0.5, 0.15, 1]}>
        <spriteMaterial
          map={useMemo(() => {
            const c = document.createElement('canvas')
            c.width = 128; c.height = 32
            const ctx = c.getContext('2d')!
            ctx.fillStyle = zone.color
            ctx.font = 'bold 16px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(zone.label, 64, 16)
            return new THREE.CanvasTexture(c)
          }, [zone.label, zone.color])}
          transparent
          depthTest={false}
        />
      </sprite>
    </group>
  )
}

function AccuracyGraph({ progress }: { progress: number }) {
  const lineRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!lineRef.current) return
    const mat = lineRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.3 + progress * 0.5
    lineRef.current.scale.x = 0.1 + progress * 0.9
  })

  return (
    <group position={[0, 1.8, -0.5]}>
      {/* Graph background */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.6, 0.4]} />
        <meshBasicMaterial color="#0a1628" transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* Accuracy line */}
      <mesh ref={lineRef} position={[-0.75, -0.15 + progress * 0.3, 0.01]}>
        <planeGeometry args={[1.5, 0.03]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Accuracy label */}
      <sprite position={[0, -0.35, 0]} scale={[0.8, 0.12, 1]}>
        <spriteMaterial
          map={useMemo(() => {
            const c = document.createElement('canvas')
            c.width = 256; c.height = 32
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#00ff88'
            ctx.font = 'bold 14px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`ACC: ${Math.round(progress * 92 + 5)}%`, 128, 16)
            return new THREE.CanvasTexture(c)
          }, [progress])}
          transparent
          depthTest={false}
        />
      </sprite>
    </group>
  )
}

export function TrainingConsole() {
  const completedRef = useRef(false)
  const playerNearRef = useRef(false)
  const visitedZones = useRef(new Set<string>())
  const paramValues = useRef({ lr: 0.3, epochs: 0.5, batch: 0.4 })
  const trainingProgress = useRef(0)
  const trainingActive = useRef(false)
  const notif = useNotificationStore()

  useFrame((state, delta) => {
    const player = useGameStore.getState().player
    if (!player || completedRef.current) return

    const px = player.position[0], pz = player.position[2]
    const dx = px - STATION_POS.x, dz = pz - STATION_POS.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    playerNearRef.current = dist < 6

    if (!playerNearRef.current) return

    // Check which parameter zone the player is in
    for (const zone of PARAM_ZONES) {
      const zx = STATION_POS.x + zone.x
      const zz = STATION_POS.z
      const zd = Math.sqrt((px - zx) ** 2 + (pz - zz) ** 2)
      if (zd < ZONE_RADIUS) {
        visitedZones.current.add(zone.id)
        const val = paramValues.current[zone.id as keyof typeof paramValues.current]
        paramValues.current[zone.id as keyof typeof paramValues.current] =
          Math.min(1, Math.max(0, val + Math.sin(state.clock.elapsedTime * 2) * delta * 0.5))
      }
    }

    // Start training when all zones explored
    if (visitedZones.current.size >= 3 && !trainingActive.current) {
      trainingActive.current = true
      soundFX.playQuestAccept()
    }

    if (trainingActive.current) {
      trainingProgress.current = Math.min(1, trainingProgress.current + delta * 0.15)
      if (trainingProgress.current >= 1 && !completedRef.current) {
        completedRef.current = true
        soundFX.playQuestComplete()
        notif.addNotification('discovery', 'Model Trained', `Accuracy: ${Math.round(92 * paramValues.current.lr + 5)}%`)
        QuestManager.completeObjective(AI_QUEST_ID, 'obj-train-model')
      }
    }
  })

  return (
    <group position={STATION_POS}>
      {/* Console base */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[4, 0.3, 1.5]} />
        <meshStandardMaterial color="#0a1628" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Holographic display */}
      <mesh position={[0, 0.6, -0.4]}>
        <planeGeometry args={[3.2, 1.2]} />
        <meshBasicMaterial color="#0a1628" transparent opacity={0.8} depthWrite={false} />
      </mesh>

      {/* Training graph */}
      <AccuracyGraph progress={trainingProgress.current} />

      {/* Parameter zones */}
      {PARAM_ZONES.map((zone) => (
        <ParamZone
          key={zone.id}
          zone={zone}
          playerInZone={false}
          value={paramValues.current[zone.id as keyof typeof paramValues.current]}
        />
      ))}

      {/* Labels */}
      <sprite position={[0, 1.5, 0]} scale={[1.5, 0.15, 1]}>
        <spriteMaterial
          map={useMemo(() => {
            const c = document.createElement('canvas')
            c.width = 256; c.height = 32
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#a855f7'
            ctx.font = 'bold 14px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('TRAINING CONSOLE', 128, 16)
            return new THREE.CanvasTexture(c)
          }, [])}
          transparent
          depthTest={false}
        />
      </sprite>

      {/* Status indicator */}
      <StatusIndicator active={trainingActive.current} progress={trainingProgress.current} />
    </group>
  )
}

function StatusIndicator({ active, progress }: { active: boolean; progress: number }) {
  const lightRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!lightRef.current) return
    const mat = lightRef.current.material as THREE.MeshBasicMaterial
    if (active) {
      mat.color.setHex(progress >= 1 ? 0x00ff88 : 0xa855f7)
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    } else {
      mat.color.setHex(0x00d4ff)
      mat.opacity = 0.15
    }
  })

  return (
    <mesh ref={lightRef} position={[1.8, 0.4, 0]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
    </mesh>
  )
}
