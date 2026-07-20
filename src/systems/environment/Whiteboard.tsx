'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface WhiteboardProps {
  position: [number, number, number]
  rotation?: number
}

export function Whiteboard({ position, rotation = 0 }: WhiteboardProps) {
  const boardMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.6,
    metalness: 0.1,
  }), [])

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a5568',
    roughness: 0.5,
    metalness: 0.5,
  }), [])

  const markerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ff4444',
    roughness: 0.5,
    metalness: 0.3,
  }), [])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      {/* Board */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.2, 0.9, 0.03]} />
        <primitive object={boardMat} attach="material" />
      </mesh>
      {/* Frame */}
      {[[0, 0.8, 0.02], [0, 0.8, -0.02]].map((p, i) => (
        <mesh key={`frame-${i}`} position={p as [number, number, number]}>
          <boxGeometry args={[1.24, 0.94, 0.02]} />
          <primitive object={frameMat} attach="material" />
        </mesh>
      ))}
      {/* Marker tray */}
      <mesh position={[0.4, 0.35, 0.02]}>
        <boxGeometry args={[0.15, 0.02, 0.03]} />
        <primitive object={markerMat} attach="material" />
      </mesh>
      {/* Legs */}
      {[[-0.5, 0.2, 0], [0.5, 0.2, 0]].map((p, i) => (
        <mesh key={`leg-${i}`} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.02, 0.025, 0.4, 6]} />
          <primitive object={frameMat} attach="material" />
        </mesh>
      ))}
    </group>
  )
}
