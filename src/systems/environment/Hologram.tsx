'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HologramProps {
  position: [number, number, number]
  color?: string
  shape?: 'sphere' | 'torus' | 'cube'
  scale?: number
}

export function Hologram({
  position,
  color = '#00d4ff',
  shape = 'sphere',
  scale = 1,
}: HologramProps) {
  const ref = useRef<THREE.Group>(null)

  const geo = useMemo(() => {
    switch (shape) {
      case 'torus': return new THREE.TorusGeometry(0.3 * scale, 0.08 * scale, 8, 16)
      case 'cube': return new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale)
      default: return new THREE.SphereGeometry(0.3 * scale, 12, 12)
    }
  }, [shape, scale])

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.8,
    wireframe: true,
  }), [color])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.04,
  }), [color])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = position[1] + 1.2 + Math.sin(state.clock.elapsedTime * 0.6) * 0.15
    ref.current.rotation.y = state.clock.elapsedTime * 0.3
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })

  return (
    <group ref={ref} position={position}>
      <mesh geometry={geo} material={mat} />
      <mesh position={[0, -0.5, 0]} scale={[1.2, 0.05, 1.2]}>
        <planeGeometry args={[0.8 * scale, 0.8 * scale]} />
        <primitive object={glowMat} attach="material" />
      </mesh>
    </group>
  )
}
