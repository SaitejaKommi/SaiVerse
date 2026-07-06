'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'

interface TreeProps {
  position: [number, number, number]
  scale?: number
  variant?: number
}

function createTrunkGeometry(): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(0.1, 0.15, 1, 6)
}

function createCanopyGeometry(variant: number): THREE.SphereGeometry | THREE.ConeGeometry {
  if (variant === 1) {
    return new THREE.SphereGeometry(0.6, 6, 6)
  }
  if (variant === 2) {
    return new THREE.SphereGeometry(0.5, 5, 5)
  }
  return new THREE.ConeGeometry(0.7, 0.8, 6)
}

export function Tree({ position, scale = 1, variant = 0 }: TreeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const baseRotation = useMemo(() => Math.random() * Math.PI * 2, [])
  const swaySpeed = useMemo(() => 0.5 + Math.random() * 0.5, [])
  const swayAmount = useMemo(() => 0.008 + Math.random() * 0.005, [])

  const trunkGeo = useMemo(() => createTrunkGeometry(), [])
  const canopyGeo = useMemo(() => createCanopyGeometry(variant), [variant])

  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5c4033',
    roughness: 0.9,
  }), [])

  const canopyMat = useMemo(() => {
    const colors = ['#2d5a27', '#3a7a33', '#1e4a18', '#4a8a43']
    return new THREE.MeshStandardMaterial({
      color: colors[variant % colors.length] ?? colors[0],
      roughness: 0.8,
    })
  }, [variant])

  useFrame((state) => {
    if (!groupRef.current) return
    const windStr = useGameStore.getState().world.windStrength
    const t = state.clock.elapsedTime * swaySpeed + baseRotation
    const sway = Math.sin(t) * swayAmount * (1 + windStr * 0.5)
    groupRef.current.rotation.z = sway
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <CuboidCollider position={[0, 0.5, 0]} args={[0.15, 0.5, 0.15]} />
      <mesh geometry={trunkGeo} material={trunkMat} position={[0, 0.5, 0]} castShadow />
      <mesh geometry={canopyGeo} material={canopyMat} position={[0, 1.5 + (variant === 2 ? 0.5 : 0), 0]} castShadow />
    </group>
  )
}
