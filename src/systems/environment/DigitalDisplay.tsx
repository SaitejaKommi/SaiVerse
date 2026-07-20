'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DigitalDisplayProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  width?: number
  height?: number
  intensity?: number
  flicker?: boolean
}

export function DigitalDisplay({
  position,
  rotation = [0, 0, 0],
  color = '#00d4ff',
  width = 1.2,
  height = 0.8,
  intensity = 0.3,
  flicker = false,
}: DigitalDisplayProps) {
  const glowRef = useRef<THREE.Mesh>(null)

  const screenMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.9,
  }), [color, intensity])

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a2e',
    roughness: 0.5,
    metalness: 0.7,
  }), [])

  useFrame((state) => {
    if (!flicker || !glowRef.current) return
    const t = state.clock.elapsedTime
    const flick = Math.sin(t * 7) > 0.92 ? 0.2 : 1
    const mat = glowRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = intensity * flick
  })

  return (
    <group position={position} rotation={rotation as any}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.04]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh ref={glowRef} position={[0, 0, 0.03]}>
        <planeGeometry args={[width * 0.85, height * 0.85]} />
        <primitive object={screenMat} attach="material" />
      </mesh>
    </group>
  )
}
