'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CampfireProps {
  position: [number, number, number]
}

export function Campfire({ position }: CampfireProps) {
  const fireRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const logMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5c4033',
    roughness: 0.9,
    metalness: 0,
  }), [])

  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6b7280',
    roughness: 0.9,
    metalness: 0.1,
  }), [])

  const fireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ff6600',
    transparent: true,
    opacity: 0.6,
  }), [])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ff8844',
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  }), [])

  useFrame((state) => {
    if (!fireRef.current) return
    const t = state.clock.elapsedTime
    const scale = 0.8 + Math.sin(t * 3) * 0.15 + Math.sin(t * 7) * 0.05
    fireRef.current.scale.setScalar(scale)
    const fMat = fireRef.current.material as THREE.MeshBasicMaterial
    fMat.opacity = 0.4 + Math.sin(t * 4) * 0.15

    if (glowRef.current) {
      const gScale = 1.1 + Math.sin(t * 2) * 0.1
      glowRef.current.scale.setScalar(gScale)
      const gMat = glowRef.current.material as THREE.MeshBasicMaterial
      gMat.opacity = 0.06 + Math.sin(t * 2.5) * 0.02
    }
  })

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Logs */}
      {([[0, 0.05, 0.1, 0], [0, 0.05, -0.1, Math.PI], [0.08, 0.05, 0, Math.PI / 2], [-0.08, 0.05, 0, -Math.PI / 2]] as const).map((p, i) => (
        <mesh key={`log-${i}`} position={[p[0], p[1], p[2]]} rotation={[0, 0, p[3]]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.2, 6]} />
          <primitive object={logMat} attach="material" />
        </mesh>
      ))}
      {/* Stones */}
      {[[0.15, 0.01, 0.15], [-0.15, 0.01, 0.15], [0.15, 0.01, -0.15], [-0.15, 0.01, -0.15], [0.2, 0.01, 0], [-0.2, 0.01, 0]].map((p, i) => (
        <mesh key={`stone-${i}`} position={p as [number, number, number]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <primitive object={stoneMat} attach="material" />
        </mesh>
      ))}
      {/* Fire glow */}
      <mesh ref={fireRef} position={[0, 0.15, 0]}>
        <coneGeometry args={[0.08, 0.2, 6]} />
        <primitive object={fireMat} attach="material" />
      </mesh>
      {/* Ground glow */}
      <mesh ref={glowRef} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <primitive object={glowMat} attach="material" />
      </mesh>
      <pointLight position={[0, 0.2, 0]} color="#ff8844" intensity={0.6} distance={5} decay={1.5} />
    </group>
  )
}
