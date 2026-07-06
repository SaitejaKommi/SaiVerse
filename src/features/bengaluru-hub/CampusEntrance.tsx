'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMPUS_ENTRANCE_POSITION } from '@/data/bengaluru/hub-layout'

const ENTRANCE_HEIGHT = 8
const PILLAR_SPACING = 4
const PILLAR_RADIUS = 0.3

export function CampusEntrance() {
  const beaconRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(60 * 3)
    for (let i = 0; i < 60; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 0.8 + Math.random() * 0.6
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r + ENTRANCE_HEIGHT + 1.5
      positions[i * 3 + 2] = Math.cos(phi) * r
    }
    return positions
  }, [])

  const pillarMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a5568',
    roughness: 0.5,
    metalness: 0.6,
  }), [])

  const archMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2d3748',
    roughness: 0.4,
    metalness: 0.7,
  }), [])

  const beaconMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00d4ff',
    emissive: '#00d4ff',
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.9,
  }), [])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00d4ff',
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide,
  }), [])

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00d4ff',
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  }), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (beaconRef.current) {
      beaconRef.current.position.y = ENTRANCE_HEIGHT + 1.5 + Math.sin(t * 1.2) * 0.2
      beaconRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05)
    }
    if (glowRef.current) {
      glowRef.current.position.y = ENTRANCE_HEIGHT + 1.5 + Math.sin(t * 1.2) * 0.2
      glowRef.current.scale.setScalar(1.5 + Math.sin(t * 1.5) * 0.1)
      ;(glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 1.2) * 0.04
    }
    if (ringRef.current) {
      ringRef.current.position.y = ENTRANCE_HEIGHT + 1.5 + Math.sin(t * 1.2) * 0.2
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.5) * 0.1
      ringRef.current.rotation.z = t * 0.5
    }
    if (particlesRef.current) {
      const attr = particlesRef.current.geometry.attributes.position
      if (attr) {
        const pos = attr.array as Float32Array
        for (let i = 0; i < 60; i++) {
          const theta = t * 0.5 + i * 0.1
          const r = 0.8 + Math.sin(t * 0.3 + i) * 0.3
          const baseY = ENTRANCE_HEIGHT + 1.5 + Math.sin(t * 1.2) * 0.2
          pos[i * 3] = Math.cos(theta) * r
          pos[i * 3 + 1] = baseY + Math.sin(t * 0.7 + i * 0.2) * 0.2
          pos[i * 3 + 2] = Math.sin(theta) * r
        }
        attr.needsUpdate = true
      }
    }
  })

  return (
    <group position={CAMPUS_ENTRANCE_POSITION}>
      <mesh position={[-PILLAR_SPACING / 2, ENTRANCE_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[PILLAR_RADIUS, PILLAR_RADIUS * 1.2, ENTRANCE_HEIGHT, 8]} />
        <primitive object={pillarMat} attach="material" />
      </mesh>
      <mesh position={[PILLAR_SPACING / 2, ENTRANCE_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[PILLAR_RADIUS, PILLAR_RADIUS * 1.2, ENTRANCE_HEIGHT, 8]} />
        <primitive object={pillarMat} attach="material" />
      </mesh>
      <mesh position={[0, ENTRANCE_HEIGHT, 0]} castShadow>
        <boxGeometry args={[PILLAR_SPACING + 1, 0.4, 0.8]} />
        <primitive object={archMat} attach="material" />
      </mesh>

      <mesh ref={beaconRef} position={[0, ENTRANCE_HEIGHT + 1.5, 0]}>
        <octahedronGeometry args={[0.3, 0]} />
        <primitive object={beaconMat} attach="material" />
      </mesh>
      <pointLight position={[0, ENTRANCE_HEIGHT + 1.5, 0]} color="#00d4ff" intensity={1.5} distance={10} decay={1} />

      <mesh ref={glowRef} position={[0, ENTRANCE_HEIGHT + 1.5, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <primitive object={glowMat} attach="material" />
      </mesh>

      <mesh ref={ringRef} position={[0, ENTRANCE_HEIGHT + 1.5, 0]}>
        <ringGeometry args={[0.5, 0.7, 24]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute args={[particlePositions, 3]} attach="attributes-position" />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#00d4ff" transparent opacity={0.6} depthWrite={false} />
      </points>
    </group>
  )
}
