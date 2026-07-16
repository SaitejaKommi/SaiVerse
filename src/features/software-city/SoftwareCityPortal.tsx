'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CuboidCollider } from '@react-three/rapier'
import { useGameStore } from '@/stores/gameStore'
import { useChapterStore } from '@/systems/chapter/ChapterStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { soundFX } from '@/systems/audio/SoundFX'

const PORTAL_POSITION: [number, number, number] = [0, 0, -214]

export function SoftwareCityPortal() {
  const ringRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const playerNotified = useRef(false)

  const finalePhase = useGameStore((s) => s.finalePhase)

  const isChapter2Available = () => {
    const status = useChapterStore.getState().getStatus('chapter-2')
    return status === 'available' || status === 'in_progress'
  }

  useEffect(() => {
    if (finalePhase === 'teaser') {
      playerNotified.current = false
    }
  }, [finalePhase])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.3
      ringRef.current.position.y = 1 + Math.sin(t * 0.8) * 0.1
    }

    if (coreRef.current) {
      coreRef.current.position.y = 1 + Math.sin(t * 0.8) * 0.1
      const mat = coreRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.5 + Math.sin(t * 1.5) * 0.2
    }

    if (glowRef.current) {
      glowRef.current.position.y = 1 + Math.sin(t * 0.8) * 0.1
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.05 + Math.sin(t * 1.2) * 0.03
    }

    const player = useGameStore.getState().player
    if (player && isChapter2Available() && !playerNotified.current) {
      const dx = player.position[0] - PORTAL_POSITION[0]
      const dz = player.position[2] - PORTAL_POSITION[2]
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < 10) {
        playerNotified.current = true
        const notif = useNotificationStore.getState()
        notif.addNotification('discovery', 'Software City', 'The tech district lies ahead — speak with the Tech Lead')
        soundFX.playQuestAccept()
      }
    }
  })

  if (finalePhase !== 'idle' && finalePhase !== 'done') return null

  return (
    <group position={PORTAL_POSITION}>
      <CuboidCollider position={[0, 1, 0]} args={[2, 1, 0.5]} sensor />
      <mesh ref={ringRef} position={[0, 1, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.2, 0.08, 16, 24]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.7} />
      </mesh>
      <mesh ref={coreRef} position={[0, 1, 0]}>
        <planeGeometry args={[1.6, 3.0]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={glowRef} position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.8, 32]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}
