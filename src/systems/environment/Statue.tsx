'use client'

import { MATERIALS } from '@/systems/material'

interface StatueProps {
  position: [number, number, number]
  scale?: number
}

export function Statue({ position, scale = 1 }: StatueProps) {
  const sm = MATERIALS.stone.statue
  const cp = MATERIALS.stone.carved
  return (
    <group position={position}>
      {/* Pedestal — rough stone */}
      <mesh position={[0, 0.5 * scale, 0]} castShadow>
        <boxGeometry args={[1.5 * scale, 0.5 * scale, 1.5 * scale]} />
        <meshPhysicalMaterial color='#718096' roughness={sm.roughness} metalness={sm.metalness} />
      </mesh>
      {/* Pedestal tier 2 — carved stone */}
      <mesh position={[0, 0.9 * scale, 0]} castShadow>
        <boxGeometry args={[1.2 * scale, 0.3 * scale, 1.2 * scale]} />
        <meshPhysicalMaterial color='#a0aec0' roughness={cp.roughness} metalness={cp.metalness} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 1.8 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.3 * scale, 0.5 * scale, 1.2 * scale, 8]} />
        <meshPhysicalMaterial color='#a0aec0' roughness={sm.roughness} metalness={sm.metalness} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.5 * scale, 0]} castShadow>
        <sphereGeometry args={[0.3 * scale, 8, 8]} />
        <meshPhysicalMaterial color='#a0aec0' roughness={sm.roughness} metalness={sm.metalness} />
      </mesh>
      {/* Arm left */}
      <mesh position={[-0.5 * scale, 1.8 * scale, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.08 * scale, 0.1 * scale, 0.8 * scale, 6]} />
        <meshPhysicalMaterial color='#a0aec0' roughness={sm.roughness} metalness={sm.metalness} />
      </mesh>
      {/* Arm right (raised) */}
      <mesh position={[0.5 * scale, 2 * scale, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.08 * scale, 0.1 * scale, 0.8 * scale, 6]} />
        <meshPhysicalMaterial color='#a0aec0' roughness={sm.roughness} metalness={sm.metalness} />
      </mesh>
    </group>
  )
}
