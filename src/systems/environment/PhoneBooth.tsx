'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface PhoneBoothProps {
  position: [number, number, number]
  rotation?: number
  color?: string
  accentColor?: string
}

export function PhoneBooth({
  position,
  rotation = 0,
  color = '#2d3748',
  accentColor = '#00d4ff',
}: PhoneBoothProps) {
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.5,
    metalness: 0.7,
  }), [color])

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#88ccff',
    transparent: true,
    opacity: 0.25,
    roughness: 0,
    metalness: 0,
    side: THREE.DoubleSide,
  }), [])

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.2,
    roughness: 0.3,
    metalness: 0.6,
  }), [accentColor])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[0.8, 0.08, 0.8]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Corner posts */}
      {[[-0.3, 1, -0.3], [-0.3, 1, 0.3], [0.3, 1, -0.3], [0.3, 1, 0.3]].map((p, i) => (
        <mesh key={`post-${i}`} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 2, 6]} />
          <primitive object={frameMat} attach="material" />
        </mesh>
      ))}
      {/* Glass panels */}
      {[[0, 1, 0], [0, 1, 0.4], [0, 1, -0.4], [0.4, 1, 0], [-0.4, 1, 0]].map((p, i) => (
        <mesh key={`glass-${i}`} position={p as [number, number, number]}>
          <boxGeometry args={[0.55, 1.4, 0.02]} />
          <primitive object={glassMat} attach="material" />
        </mesh>
      ))}
      {/* Accent light strip on top */}
      <mesh position={[0, 1.9, 0.35]}>
        <boxGeometry args={[0.6, 0.02, 0.02]} />
        <primitive object={accentMat} attach="material" />
      </mesh>
      <pointLight position={[0, 1.6, 0]} color={accentColor} intensity={0.3} distance={4} decay={2} />
    </group>
  )
}
