'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface ServerRackProps {
  position: [number, number, number]
  rotation?: number
}

export function ServerRack({ position, rotation = 0 }: ServerRackProps) {
  const cabMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a2e',
    roughness: 0.4,
    metalness: 0.8,
  }), [])

  const ledMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00ff88',
    emissive: '#00ff88',
    emissiveIntensity: 0.5,
  }), [])

  const ledRedMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ff4444',
    emissive: '#ff4444',
    emissiveIntensity: 0.4,
  }), [])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      {/* Cabinet */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.5, 1.6, 0.5]} />
        <primitive object={cabMat} attach="material" />
      </mesh>
      {/* Vent lines */}
      {[0.3, 0.5, 0.7, 0.9, 1.1, 1.3].map((y, i) => (
        <mesh key={`vent-${i}`} position={[0, y, 0.26]}>
          <boxGeometry args={[0.35, 0.02, 0.01]} />
          <primitive object={cabMat} attach="material" />
        </mesh>
      ))}
      {/* LED indicators */}
      <mesh position={[0.15, 1.5, 0.26]}>
        <boxGeometry args={[0.03, 0.03, 0.01]} />
        <primitive object={ledMat} attach="material" />
      </mesh>
      <mesh position={[0.1, 1.5, 0.26]}>
        <boxGeometry args={[0.03, 0.03, 0.01]} />
        <primitive object={ledRedMat} attach="material" />
      </mesh>
      <pointLight position={[0, 0.8, 0.4]} color="#00ff88" intensity={0.15} distance={2} decay={2} />
    </group>
  )
}
