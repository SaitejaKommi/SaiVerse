'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

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

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh geometry={trunkGeo} material={trunkMat} position={[0, 0.5, 0]} castShadow />
      <mesh geometry={canopyGeo} material={canopyMat} position={[0, 1.5 + (variant === 2 ? 0.5 : 0), 0]} castShadow />
    </group>
  )
}
