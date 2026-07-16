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

const BED_POSITIONS = [
  { x: -27, z: -513 },
  { x: -25, z: -513 },
  { x: -23, z: -513 },
  { x: -27, z: -511 },
  { x: -23, z: -511 },
] as const

export function GardenPlot() {
  const completedRef = useRef(false)
  const stepRef = useRef(0)
  const plantedRef = useRef<boolean[]>([false, false, false, false, false])
  const wateredRef = useRef<boolean[]>([false, false, false, false, false])
  const animPhaseRef = useRef<number[]>([0, 0, 0, 0, 0])
  const notif = useNotificationStore()

  useFrame((_, delta) => {
    if (completedRef.current) return
    const wateredCount = wateredRef.current.filter(Boolean).length
    if (wateredCount > stepRef.current) {
      stepRef.current = wateredCount
      soundFX.playQuestComplete()
      if (wateredCount >= 5) {
        completedRef.current = true
        notif.addNotification('discovery', 'Garden Complete', 'The community garden is in full bloom')
        QuestManager.completeObjective(OSV_QUEST_ID, 'obj-cultivate-garden')
      }
    }
    for (let i = 0; i < 5; i++) {
      if ((plantedRef.current[i] ?? false) && !(wateredRef.current[i] ?? false) && (animPhaseRef.current[i] ?? 0) < 1) {
        animPhaseRef.current[i] = Math.min(1, (animPhaseRef.current[i] ?? 0) + delta * 0.5)
      }
    }
  })

  const handleBed = useCallback((index: number) => {
    if (completedRef.current) return
    const carrying = useCarryStore.getState().carrying
    if (carrying === 'seed' && !plantedRef.current[index]) {
      plantedRef.current[index] = true
      useCarryStore.getState().setCarrying(null)
    } else if (carrying === 'watering-can' && plantedRef.current[index] && !wateredRef.current[index]) {
      wateredRef.current[index] = true
      useCarryStore.getState().setCarrying(null)
    }
  }, [])

  const handleSeedBasket = useCallback(() => {
    if (useCarryStore.getState().carrying === null) {
      useCarryStore.getState().setCarrying('seed')
      soundFX.playQuestAccept()
    }
  }, [])

  const handleWell = useCallback(() => {
    if (useCarryStore.getState().carrying === null) {
      useCarryStore.getState().setCarrying('watering-can')
      soundFX.playQuestAccept()
    }
  }, [])

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#606c38'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('COMMUNITY GARDEN', 128, 16)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group position={STATION_POSITIONS.garden.center}>
      <mesh position={[-28, 0.3, -518]} onClick={handleSeedBasket}>
        <cylinderGeometry args={[0.25, 0.3, 0.25, 12]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>

      <group position={[-22, 0, -518]}>
        <mesh position={[0, 0.3, 0]} onClick={handleWell}>
          <cylinderGeometry args={[0.3, 0.35, 0.4, 12]} />
          <meshStandardMaterial color="#5c8a9a" />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.4, 0.05, 0.05]} />
          <meshStandardMaterial color="#8a5e32" />
        </mesh>
      </group>

      {BED_POSITIONS.map((pos, i) => (
        <BedMesh
          key={i}
          position={[pos.x, 0.05, pos.z]}
          onClick={() => handleBed(i)}
          planted={plantedRef.current[i] ?? false}
          watered={wateredRef.current[i] ?? false}
          animPhase={animPhaseRef.current[i] ?? 0}
        />
      ))}

      <sprite position={[0, 1.8, 1.5]} scale={[1.2, 0.12, 1]}>
        <spriteMaterial map={labelTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}

function BedMesh({ position, onClick, planted, watered, animPhase }: {
  position: [number, number, number]
  onClick: () => void
  planted: boolean
  watered: boolean
  animPhase: number
}) {
  const scale = watered ? 1 : planted ? 0.1 + animPhase * 0.4 : 0
  const color = watered ? '#283618' : planted ? '#606c38' : '#8a5e32'

  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[0.4, 0.05, 0.3]} />
      <meshStandardMaterial color="#606c38" />
      {scale > 0 && (
        <mesh position={[0, 0.08 + scale * 0.05, 0]}>
          <sphereGeometry args={[scale * 0.15, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}
    </mesh>
  )
}
