'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface BusStopProps {
  position: [number, number, number]
  rotation?: number
  color?: string
  accentColor?: string
}

export function BusStop({
  position,
  rotation = 0,
  color = '#4a5568',
  accentColor = '#00ff88',
}: BusStopProps) {
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.5,
  }), [color])

  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.3,
  }), [color])

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.15,
    roughness: 0.4,
    metalness: 0.6,
  }), [accentColor])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      {/* Roof canopy */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[2, 0.08, 1.2]} />
        <primitive object={roofMat} attach="material" />
      </mesh>
      {/* Roof trim accent */}
      <mesh position={[0, 2.16, 0]}>
        <boxGeometry args={[1.8, 0.02, 1]} />
        <primitive object={accentMat} attach="material" />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 1.1, -0.55]} receiveShadow>
        <boxGeometry args={[1.8, 2.2, 0.05]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Side panels */}
      <mesh position={[0.9, 1.1, 0]}>
        <boxGeometry args={[0.05, 2.2, 1.1]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Pole left */}
      <mesh position={[-0.9, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2.2, 6]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Bench seat */}
      <mesh position={[0, 0.35, 0.2]} receiveShadow>
        <boxGeometry args={[1.4, 0.06, 0.4]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Bench legs */}
      {[[-0.5, 0.15, 0.2], [0.5, 0.15, 0.2]].map((p, i) => (
        <mesh key={`leg-${i}`} position={p as [number, number, number]}>
          <boxGeometry args={[0.04, 0.25, 0.04]} />
          <primitive object={frameMat} attach="material" />
        </mesh>
      ))}
      {/* Accent stripe back */}
      <mesh position={[0, 1.8, -0.52]}>
        <boxGeometry args={[1.6, 0.06, 0.02]} />
        <primitive object={accentMat} attach="material" />
      </mesh>
    </group>
  )
}
