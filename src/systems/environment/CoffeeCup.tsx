'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface CoffeeCupProps {
  position: [number, number, number]
  rotation?: number
  color?: string
}

export function CoffeeCup({ position, rotation = 0, color = '#ffffff' }: CoffeeCupProps) {
  const bodyGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.05, 0.12, 8), [])
  const lidGeo = useMemo(() => new THREE.CylinderGeometry(0.055, 0.06, 0.015, 8), [])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.1,
  }), [color])

  const lidMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d4a373',
    roughness: 0.6,
    metalness: 0.2,
  }), [])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      <mesh geometry={bodyGeo} material={mat} position={[0, 0.06, 0]} castShadow />
      <mesh geometry={lidGeo} material={lidMat} position={[0, 0.13, 0]} />
    </group>
  )
}
