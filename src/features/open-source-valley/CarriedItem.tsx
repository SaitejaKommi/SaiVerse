'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useCarryStore } from './CarrySystem'

export function CarriedItem() {
  const groupRef = useRef<THREE.Group>(null)
  const carrying = useCarryStore((s) => s.carrying)

  useFrame(() => {
    if (!groupRef.current) return
    const player = useGameStore.getState().player
    if (!player) { groupRef.current.visible = false; return }
    const px = player.position[0]
    const py = player.position[1]
    const pz = player.position[2]
    groupRef.current.position.set(px, py + 1.8, pz - 2)
    groupRef.current.visible = carrying !== null
  })

  if (!carrying) return null

  const geo = carrying === 'seed'
    ? <sphereGeometry args={[0.12, 8, 8]} />
    : carrying === 'watering-can'
    ? <boxGeometry args={[0.15, 0.25, 0.12]} />
    : carrying === 'plank'
    ? <boxGeometry args={[0.35, 0.04, 0.1]} />
    : <boxGeometry args={[0.2, 0.22, 0.1]} />

  const color = carrying === 'seed'
    ? '#d4a373'
    : carrying === 'watering-can'
    ? '#00d4ff'
    : carrying === 'plank'
    ? '#a68a64'
    : '#e9c46a'

  return (
    <group ref={groupRef}>
      <mesh>
        {geo}
        <meshBasicMaterial color={color} transparent opacity={0.9} depthTest={false} />
      </mesh>
    </group>
  )
}
