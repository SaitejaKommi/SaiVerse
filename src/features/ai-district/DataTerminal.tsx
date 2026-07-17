'use client'

import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { AI_QUEST_ID } from '@/data/ai-district/ai-quest'

const STATION_POS = new THREE.Vector3(-30, 0, -360)
const INTERACT_RADIUS = 6
const CLUSTER_COLORS = ['#00d4ff', '#a855f7', '#00ff88', '#f59e0b']
const POINTS_PER_CLUSTER = 20

function createDataPoint(color: string, clusterIdx: number): { pos: THREE.Vector3; target: THREE.Vector3; color: string; cluster: number; speed: number; offset: number } {
  const angle = Math.random() * Math.PI * 2
  const radius = 0.5 + Math.random() * 2.5
  const height = -1 + Math.random() * 3
  return {
    pos: new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius),
    target: new THREE.Vector3(
      (clusterIdx - 1.5) * 1.8 + (Math.random() - 0.5) * 0.5,
      -0.5 + Math.random() * 1.5,
      (Math.random() - 0.5) * 0.5 + 0.5,
    ),
    color,
    cluster: clusterIdx,
    speed: 0.3 + Math.random() * 0.4,
    offset: Math.random() * Math.PI * 2,
  }
}

export function DataTerminal() {
  const groupRef = useRef<THREE.Group>(null)
  const domeRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)
  const completedRef = useRef(false)
  const playerNearRef = useRef(false)
  const organizedRef = useRef(false)
  const notifyDone = useRef(false)
  const notif = useNotificationStore()
  const meshRefs = useRef<THREE.Mesh[]>([])

  const dataPoints = useMemo(() => {
    const points: ReturnType<typeof createDataPoint>[] = []
    for (let c = 0; c < CLUSTER_COLORS.length; c++) {
      for (let i = 0; i < POINTS_PER_CLUSTER; i++) {
        points.push(createDataPoint(CLUSTER_COLORS[c]!, c))
      }
    }
    return points
  }, [])

  const domeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00d4ff',
    transparent: true,
    opacity: 0.04,
    wireframe: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00d4ff',
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])



  useFrame((state, delta) => {
    const player = useGameStore.getState().player
    if (!player) return

    const px = player.position[0], pz = player.position[2]
    const dx = px - STATION_POS.x, dz = pz - STATION_POS.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    playerNearRef.current = dist < INTERACT_RADIUS

    if (completedRef.current) return

    if (playerNearRef.current && !notifyDone.current) {
      const quest = QuestManager.getQuest(AI_QUEST_ID)
      if (quest?.status === 'available' || quest?.status === 'accepted') {
        notifyDone.current = true
      }
    }

    if (playerNearRef.current && !organizedRef.current) {
      progressRef.current = Math.min(1, progressRef.current + delta * 0.4)
      if (progressRef.current >= 1) {
        organizedRef.current = true
        soundFX.playQuestComplete()
        notif.addNotification('discovery', 'Data Analyzed', 'Dataset classified successfully')
        QuestManager.completeObjective(AI_QUEST_ID, 'obj-analyze-data')
        completedRef.current = true
      }
    }

    if (playerNearRef.current && !organizedRef.current) {
      const t = state.clock.elapsedTime
      for (let i = 0; i < meshRefs.current.length; i++) {
        const mesh = meshRefs.current[i]
        if (!mesh) continue
        const dp = dataPoints[i]
        if (!dp) continue

        const ease = Math.min(1, progressRef.current * 2)
        const organized = dp.pos.clone().lerp(dp.target, ease)
        const idleOffset = Math.sin(t * dp.speed + dp.offset) * 0.1
        organized.y += idleOffset
        mesh.position.copy(organized)

        const mat = mesh.material as THREE.MeshBasicMaterial
        mat.opacity = 0.4 + ease * 0.6
        const s = 0.04 + ease * 0.04
        mesh.scale.setScalar(s)
      }
    } else {
      const t = state.clock.elapsedTime
      for (let i = 0; i < meshRefs.current.length; i++) {
        const mesh = meshRefs.current[i]
        if (!mesh) continue
        const dp = dataPoints[i]
        if (!dp) continue
        mesh.position.set(
          dp.pos.x + Math.sin(t * dp.speed + dp.offset) * 0.3,
          dp.pos.y + Math.sin(t * dp.speed * 0.7 + dp.offset) * 0.2,
          dp.pos.z + Math.cos(t * dp.speed * 0.8 + dp.offset) * 0.3,
        )
        const mat = mesh.material as THREE.MeshBasicMaterial
        mat.opacity = 0.3
        mesh.scale.setScalar(0.04)
      }
    }

    if (domeRef.current) {
      const mat = domeRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.03 + (playerNearRef.current ? 0.04 : 0)
    }
  })

  const registerMesh = useCallback((mesh: THREE.Mesh | null) => {
    if (mesh && meshRefs.current.length < dataPoints.length) {
      meshRefs.current.push(mesh)
    }
  }, [dataPoints.length])

  return (
    <group ref={groupRef} position={STATION_POS}>
      {/* Dome wireframe */}
      <mesh ref={domeRef}>
        <sphereGeometry args={[3.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={domeMat} attach="material" />
      </mesh>

      {/* Base ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.5, 32]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      {/* Data particles */}
      {Array.from({ length: CLUSTER_COLORS.length * POINTS_PER_CLUSTER }).map((_, i) => (
        <mesh key={i} ref={registerMesh}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Terminal console */}
      <mesh position={[0, 0.2, 3.2]}>
        <boxGeometry args={[1.2, 0.4, 0.4]} />
        <meshStandardMaterial color="#0a1628" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 3.2]}>
        <boxGeometry args={[0.9, 0.3, 0.05]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
      </mesh>

      {/* Progress ring */}
      <ProgressRing progressRef={progressRef} playerNearRef={playerNearRef} />
    </group>
  )
}

function ProgressRing({ progressRef, playerNearRef }: { progressRef: React.RefObject<number>; playerNearRef: React.RefObject<boolean> }) {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!ringRef.current) return
    const mat = ringRef.current.material as THREE.MeshBasicMaterial
    const p = progressRef.current
    ringRef.current.scale.setScalar(0.8 + p * 0.2)
    mat.opacity = playerNearRef.current ? 0.1 + p * 0.2 : 0.02
  })

  return (
    <mesh ref={ringRef} position={[0, 2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.4, 32]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}
