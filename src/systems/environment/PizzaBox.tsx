'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface PizzaBoxProps {
  position: [number, number, number]
  rotation?: number
}

export function PizzaBox({ position, rotation = 0 }: PizzaBoxProps) {
  const boxMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d4a373',
    roughness: 0.8,
    metalness: 0,
  }), [])

  const lidMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c4956a',
    roughness: 0.8,
    metalness: 0,
  }), [])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[0.3, 0.04, 0.3]} />
        <primitive object={boxMat} attach="material" />
      </mesh>
      {/* Lid (slightly open) */}
      <mesh position={[0, 0.06, -0.12]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.28, 0.02, 0.28]} />
        <primitive object={lidMat} attach="material" />
      </mesh>
    </group>
  )
}
