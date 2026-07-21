'use client'

import { Water } from './Water'
import { MATERIALS } from '@/systems/material'

interface FountainProps {
  position: [number, number, number]
  scale?: number
}

export function Fountain({ position, scale = 1 }: FountainProps) {
  return (
    <group position={position}>
      {/* Outer basin — polished stone */}
      <mesh position={[0, 0.3 * scale, 0]} castShadow>
        <cylinderGeometry args={[2.5 * scale, 3 * scale, 0.6 * scale, 24]} />
        <meshPhysicalMaterial
          color='#718096'
          roughness={MATERIALS.stone.polished.roughness}
          metalness={MATERIALS.stone.polished.metalness}
        />
      </mesh>
      {/* Inner basin — polished metal */}
      <mesh position={[0, 0.3 * scale, 0]}>
        <cylinderGeometry args={[2 * scale, 2.3 * scale, 0.4 * scale, 24]} />
        <meshPhysicalMaterial
          color='#2a4a6a'
          roughness={MATERIALS.metal.polished.roughness}
          metalness={MATERIALS.metal.polished.metalness}
        />
      </mesh>
      {/* Center pillar — carved stone */}
      <mesh position={[0, 1.2 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.3 * scale, 0.4 * scale, 1.5 * scale, 12]} />
        <meshPhysicalMaterial
          color='#a0aec0'
          roughness={MATERIALS.stone.carved.roughness}
          metalness={MATERIALS.stone.carved.metalness}
        />
      </mesh>
      {/* Top bowl — polished stone */}
      <mesh position={[0, 2 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.8 * scale, 1 * scale, 0.4 * scale, 16]} />
        <meshPhysicalMaterial
          color='#718096'
          roughness={MATERIALS.stone.polished.roughness}
          metalness={MATERIALS.stone.polished.metalness}
        />
      </mesh>
      {/* Animated water surface in basin */}
      <Water
        position={[0, 0.55 * scale, 0]}
        size={[2.8 * scale, 2.8 * scale]}
        color='#2a7a9a'
        opacity={0.6}
      />
      {/* Animated water in top bowl */}
      <Water
        position={[0, 2.2 * scale, 0]}
        size={[1.2 * scale, 1.2 * scale]}
        color='#3a8aaa'
        opacity={0.5}
      />
    </group>
  )
}
