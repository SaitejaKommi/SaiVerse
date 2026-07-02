'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface BenchProps {
  position: [number, number, number]
  rotation?: number
  color?: string
}

export function Bench({ position, rotation = 0, color = '#4a3728' }: BenchProps) {
  const seatGeo = useMemo(() => new THREE.BoxGeometry(1.5, 0.08, 0.5), [])
  const legGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.35, 0.06), [])
  const backGeo = useMemo(() => new THREE.BoxGeometry(1.5, 0.3, 0.04), [])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.2,
  }), [color])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      <mesh geometry={seatGeo} material={mat} position={[0, 0.35, 0]} castShadow />
      <mesh geometry={legGeo} material={mat} position={[-0.6, 0.175, -0.2]} />
      <mesh geometry={legGeo} material={mat} position={[0.6, 0.175, -0.2]} />
      <mesh geometry={legGeo} material={mat} position={[-0.6, 0.175, 0.2]} />
      <mesh geometry={legGeo} material={mat} position={[0.6, 0.175, 0.2]} />
      <mesh geometry={backGeo} material={mat} position={[0, 0.55, -0.25]} />
    </group>
  )
}
