'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { ChapterManager } from '@/systems/chapter/ChapterManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import { AI_QUEST_ID } from '@/data/ai-district/ai-quest'

const CORE_POS = new THREE.Vector3(0, 0, -370)
const LAYERS = 4
const NODES_PER_LAYER = 4

interface NodeData {
  layer: number
  index: number
  pos: THREE.Vector3
  phase: number
}

function buildNetwork(): NodeData[] {
  const nodes: NodeData[] = []
  for (let l = 0; l < LAYERS; l++) {
    for (let n = 0; n < NODES_PER_LAYER; n++) {
      const angle = (n / NODES_PER_LAYER) * Math.PI * 2 + l * 0.3
      const radius = 0.5 + l * 0.8
      nodes.push({
        layer: l,
        index: n,
        pos: new THREE.Vector3(
          Math.cos(angle) * radius,
          1 + l * 0.6,
          Math.sin(angle) * radius,
        ),
        phase: Math.random() * Math.PI * 2,
      })
    }
  }
  return nodes
}

const networkNodes = buildNetwork()

function NetworkNode({ node, active, progress }: { node: NodeData; active: boolean; progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef(0)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const mat = meshRef.current.material as THREE.MeshBasicMaterial

    if (active) {
      pulseRef.current = Math.min(1, pulseRef.current + 0.02)
      const intensity = 0.3 + Math.sin(t * 1.5 + node.phase) * 0.2
      mat.opacity = pulseRef.current * intensity * (0.5 + progress * 0.5)
      const scale = 0.04 + pulseRef.current * 0.03
      meshRef.current.scale.setScalar(scale)
      meshRef.current.position.y = node.pos.y + Math.sin(t * 0.8 + node.phase) * 0.05
    } else {
      pulseRef.current = Math.max(0, pulseRef.current - 0.01)
      mat.opacity = 0.03
      meshRef.current.scale.setScalar(0.03)
    }
  })

  const color = [
    '#00d4ff', '#a855f7', '#00ff88', '#f59e0b',
  ][node.layer % 4]

  return (
    <mesh ref={meshRef} position={node.pos}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.03} depthWrite={false} />
    </mesh>
  )
}

function NetworkConnection({ from, to, active, progress }: { from: NodeData; to: NodeData; active: boolean; progress: number }) {
  const lineRef = useRef<THREE.Mesh>(null)

  const mid = new THREE.Vector3().addVectors(from.pos, to.pos).multiplyScalar(0.5)
  const dir = new THREE.Vector3().subVectors(to.pos, from.pos)
  const length = dir.length()
  dir.normalize()

  const rot = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir,
  )

  useFrame(() => {
    if (!lineRef.current) return
    const mat = lineRef.current.material as THREE.MeshBasicMaterial
    if (active) {
      mat.opacity = 0.02 + progress * 0.08
    } else {
      mat.opacity = 0.005
    }
  })

  const color = ['#00d4ff', '#a855f7', '#00ff88', '#f59e0b'][from.layer % 4]

  return (
    <mesh ref={lineRef} position={mid} quaternion={rot}>
      <cylinderGeometry args={[0.005, 0.005, length, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.005} depthWrite={false} />
    </mesh>
  )
}

function CoreGlow({ active, progress }: { active: boolean; progress: number }) {
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!glowRef.current) return
    const t = state.clock.elapsedTime
    const mat = glowRef.current.material as THREE.MeshBasicMaterial
    if (active) {
      const intensity = 0.05 + progress * 0.2
      mat.opacity = intensity + Math.sin(t * 0.5) * 0.02
      glowRef.current.scale.setScalar(1 + progress * 0.5)
    } else {
      mat.opacity = 0.02
    }
  })

  return (
    <mesh ref={glowRef} position={[0, 2, 0]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#a855f7" transparent opacity={0.02} depthWrite={false} />
    </mesh>
  )
}

function DataStreams({ active, progress }: { active: boolean; progress: number }) {
  const particleCount = 30
  const particlesRef = useRef<THREE.Points>(null)
  const positionsRef = useRef(new Float32Array(particleCount * 3))
  const speedsRef = useRef(new Float32Array(particleCount))

  useEffect(() => {
    const pos = positionsRef.current
    const speeds = speedsRef.current
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 4
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = Math.random() * 4
      pos[i * 3 + 2] = Math.sin(angle) * radius
      speeds[i] = 0.3 + Math.random() * 0.5
    }
  }, [])

  useFrame((state, delta) => {
    if (!particlesRef.current) return
    const pos = positionsRef.current!
    const speeds = speedsRef.current!
    const geo = particlesRef.current.geometry
    if (!geo) return
    const attr = geo.attributes.position
    if (!attr) return

    const speedMult = active ? 1 + progress * 3 : 0.2
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3 + 1
      const s = speeds[i]
      if (s === undefined) continue
      pos[idx] = (pos[idx] ?? 0) + delta * s * speedMult
      if ((pos[idx] ?? 0) > 4) {
        pos[i * 3 + 1] = 0
        const angle = Math.random() * Math.PI * 2
        const radius = 2 + Math.random() * 4
        pos[i * 3] = Math.cos(angle) * radius
        pos[i * 3 + 2] = Math.sin(angle) * radius
      }
    }
    attr.needsUpdate = true
  })

  const posArray = positionsRef.current!

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posArray, 3]}
          count={particleCount}
          array={posArray}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00d4ff"
        size={0.04}
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export function NeuralCore() {
  const coreActiveRef = useRef(false)
  const activationProgress = useRef(0)
  const finaleTriggered = useRef(false)
  const cameraRising = useRef(false)
  const riseProgress = useRef(0)
  const cameraStartPos = useRef(new THREE.Vector3())
  const setCinematic = useGameStore((s) => s.setCinematic)
  const notif = useNotificationStore()

  useEffect(() => {
    const unsub = EventBus.on(GameEvents.NOTIFICATION_ADDED, () => {
      // used to detect quest completion without polling
    })
    return () => unsub()
  }, [])

  useFrame((state, delta) => {
    const quest = QuestManager.getQuest(AI_QUEST_ID)
    if (!quest) return

    const dataDone = quest.objectives.find(o => o.id === 'obj-analyze-data')?.current ?? 0
    const trainDone = quest.objectives.find(o => o.id === 'obj-train-model')?.current ?? 0
    const promptDone = quest.objectives.find(o => o.id === 'obj-prompt-ai')?.current ?? 0

    const allStationsDone = dataDone >= 1 && trainDone >= 1 && promptDone >= 1
    const isFinalePhase = useGameStore.getState().finalePhase !== 'idle'
    const isCinematic = useGameStore.getState().isCinematic

    if (allStationsDone && !coreActiveRef.current && !isFinalePhase && !isCinematic) {
      coreActiveRef.current = true
      setCinematic(true)
      cameraStartPos.current.copy(state.camera.position)
      soundFX.playBadgeEarned()
    }

    if (coreActiveRef.current && !finaleTriggered.current) {
      activationProgress.current = Math.min(1, activationProgress.current + delta * 0.08)
      state.camera.lookAt(CORE_POS)

      if (activationProgress.current >= 0.6 && !cameraRising.current) {
        cameraRising.current = true
      }

      if (cameraRising.current) {
        riseProgress.current = Math.min(1, riseProgress.current + delta * 0.04)
        const eased = 1 - Math.pow(1 - riseProgress.current, 2)
        const startY = cameraStartPos.current.y
        state.camera.position.y = startY + eased * 6
        state.camera.position.x += Math.sin(riseProgress.current * Math.PI) * 2
      }

      if (activationProgress.current >= 1 && !finaleTriggered.current) {
        finaleTriggered.current = true
        soundFX.playQuestComplete()
        QuestManager.completeObjective(AI_QUEST_ID, 'obj-witness-core')
        ChapterManager.completeChapter('chapter-3')
        notif.addNotification('discovery', 'Neural Core', 'AI research complete')
        EventBus.emit(GameEvents.CELEBRATION_TRIGGER, { type: 'ai_unlock' })

        // The quest will auto-complete via ChapterManager.syncFromQuestData() when all objectives done
        setTimeout(() => {
          setCinematic(false)
        }, 3000)
      }
    }
  })

  return (
    <group position={CORE_POS}>
      {/* Core base */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 3, 0.3, 24]} />
        <meshStandardMaterial color="#0a1628" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Central pedestal */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.8, 1.0, 0.8, 16]} />
        <meshStandardMaterial color="#1a1a3e" emissive="#a855f7" emissiveIntensity={0.1} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Neural network visualization */}
      <CoreGlow active={coreActiveRef.current} progress={activationProgress.current} />
      <DataStreams active={coreActiveRef.current} progress={activationProgress.current} />

      {networkNodes.map((node, i) => (
        <NetworkNode
          key={`node-${i}`}
          node={node}
          active={coreActiveRef.current}
          progress={activationProgress.current}
        />
      ))}

      {/* Connections between adjacent layers */}
      {networkNodes.map((from, i) =>
        networkNodes
          .filter(to => to.layer === from.layer + 1)
          .map((to, j) => (
            <NetworkConnection
              key={`conn-${i}-${j}`}
              from={from}
              to={to}
              active={coreActiveRef.current}
              progress={activationProgress.current}
            />
          ))
      )}

      {/* Core label */}
      <sprite position={[0, 3.5, 0]} scale={[1.8, 0.15, 1]}>
        <spriteMaterial
          map={(() => {
            const c = document.createElement('canvas')
            c.width = 256; c.height = 32
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#a855f7'
            ctx.font = 'bold 14px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('NEURAL CORE', 128, 16)
            return new THREE.CanvasTexture(c)
          })()}
          transparent
          depthTest={false}
        />
      </sprite>
    </group>
  )
}
