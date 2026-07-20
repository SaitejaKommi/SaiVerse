'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LanternProps {
  position: [number, number, number]
  color?: string
}

export function Lantern({ position, color = '#ffd700' }: LanternProps) {
  const glowRef = useRef<THREE.Mesh>(null)

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2a2a3e',
    roughness: 0.5,
    metalness: 0.6,
  }), [])

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0,
  }), [color])

  useFrame((state) => {
    if (!glowRef.current) return
    const t = state.clock.elapsedTime
    const flicker = 0.5 + Math.sin(t * 2.3) * 0.15 + Math.sin(t * 5.1) * 0.05
    const mat = glowRef.current.material as THREE.MeshPhysicalMaterial
    mat.emissiveIntensity = flicker
    mat.opacity = 0.2 + flicker * 0.15
  })

  return (
    <group position={position}>
      {/* Top cap */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <coneGeometry args={[0.08, 0.05, 6]} />
        <primitive object={bodyMat} attach="material" />
      </mesh>
      {/* Glass body */}
      <mesh ref={glowRef} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.07, 0.04, 8]} />
        <primitive object={bodyMat} attach="material" />
      </mesh>
      {/* Ring */}
      <mesh position={[0, 0.38, 0]}>
        <torusGeometry args={[0.05, 0.01, 6, 8]} />
        <primitive object={bodyMat} attach="material" />
      </mesh>
      <pointLight position={[0, 0.2, 0]} color={color} intensity={0.25} distance={3} decay={1.5} />
    </group>
  )
}
