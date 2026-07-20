'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface BicycleRackProps {
  position: [number, number, number]
  rotation?: number
}

export function BicycleRack({ position, rotation = 0 }: BicycleRackProps) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a5568',
    roughness: 0.5,
    metalness: 0.7,
  }), [])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      {/* Horizontal bar */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.04]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Vertical posts */}
      {[[-0.5, 0.15, 0], [0.5, 0.15, 0]].map((p, i) => (
        <mesh key={`post-${i}`} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.3, 6]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
      {/* Wheel slots */}
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={`slot-${i}`} position={[x, 0.02, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.12]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  )
}
