'use client'

import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { OSV_QUEST_ID } from '@/data/open-source-valley/osv-quest'
import { STATION_POSITIONS } from '@/data/open-source-valley/osv-layout'
import { useCarryStore } from './CarrySystem'

const PLANK_POSITIONS = [
  { x: 24.4, z: -514, rot: 0 },
  { x: 24.8, z: -514.5, rot: 0.1 },
  { x: 25.2, z: -514, rot: -0.05 },
  { x: 25.6, z: -514.5, rot: 0.08 },
  { x: 26, z: -514, rot: -0.1 },
] as const

export function PullRequestBridge() {
  const completedRef = useRef(false)
  const placedRef = useRef<boolean[]>([false, false, false, false, false])
  const countRef = useRef(0)
  const notif = useNotificationStore()

  useFrame(() => {
    if (completedRef.current) return
    const c = placedRef.current.filter(Boolean).length
    if (c > countRef.current) {
      countRef.current = c
      soundFX.playQuestComplete()
      if (c >= 5) {
        completedRef.current = true
        notif.addNotification('discovery', 'Bridge Complete', 'The Pull Request Bridge spans the valley')
        QuestManager.completeObjective(OSV_QUEST_ID, 'obj-build-bridge')
      }
    }
  })

  const handlePile = useCallback(() => {
    if (useCarryStore.getState().carrying === null && !completedRef.current) {
      useCarryStore.getState().setCarrying('plank')
      soundFX.playQuestAccept()
    }
  }, [])

  const handleFrame = useCallback((index: number) => {
    if (completedRef.current) return
    const carrying = useCarryStore.getState().carrying
    if (carrying === 'plank' && !placedRef.current[index]) {
      placedRef.current[index] = true
      useCarryStore.getState().setCarrying(null)
    }
  }, [])

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#a68a64'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('PULL REQUEST BRIDGE', 128, 16)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group position={STATION_POSITIONS.bridge.center}>
      <mesh position={[3, 0.3, -3]} onClick={handlePile}>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color="#a68a64" />
      </mesh>

      {[0, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 2 - 1, 0.1, -2]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.5, 2]} />
            <meshStandardMaterial color="#8a5e32" />
          </mesh>
          <mesh position={[side * 2 - 1, 0.35, 2]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.5, 2]} />
            <meshStandardMaterial color="#8a5e32" />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.5, -2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2.5, 0.05, 0.1]} />
        <meshStandardMaterial color="#8a5e32" />
      </mesh>
      <mesh position={[0, 0.5, 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2.5, 0.05, 0.1]} />
        <meshStandardMaterial color="#8a5e32" />
      </mesh>

      {PLANK_POSITIONS.map((pos, i) => (
        <PlankMesh
          key={i}
          position={[pos.x - 25, 0.3, pos.z + 515]}
          rotation={pos.rot}
          placed={placedRef.current[i] ?? false}
          onClick={() => handleFrame(i)}
        />
      ))}

      <sprite position={[0, 2.2, 0]} scale={[1.2, 0.12, 1]}>
        <spriteMaterial map={labelTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}

function PlankMesh({ position, rotation, placed, onClick }: {
  position: [number, number, number]
  rotation: number
  placed: boolean
  onClick: () => void
}) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]} onClick={placed ? undefined : onClick}>
      <boxGeometry args={[0.3, 0.04, 0.08]} />
      <meshStandardMaterial color={placed ? '#bc6c25' : '#d4a373'} transparent opacity={placed ? 1 : 0.7} />
    </mesh>
  )
}
