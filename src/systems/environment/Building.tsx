'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface BuildingProps {
  position: [number, number, number]
  width?: number
  depth?: number
  height?: number
  color?: string
  roofColor?: string
  hasWindows?: boolean
  windowsColor?: string
}

export function Building({
  position,
  width = 4,
  depth = 4,
  height = 6,
  color = '#4a5568',
  roofColor = '#2d3748',
  hasWindows = true,
  windowsColor = '#88ccff',
}: BuildingProps) {
  const mainGeo = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth])
  const roofGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, 1.5, 4)
    return geo
  }, [width, depth])

  const mainMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.3,
  }), [color])

  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: roofColor,
    roughness: 0.8,
    metalness: 0.1,
  }), [roofColor])

  const windowsMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: windowsColor,
    emissive: windowsColor,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.8,
    roughness: 0.1,
    metalness: 0.5,
  }), [windowsColor])

  const windowGeos = useMemo(() => {
    if (!hasWindows) return []
    const geos: THREE.BoxGeometry[] = []
    const rows = Math.floor(height / 2.5)
    const cols = Math.floor(width / 1.5)
    const windowSize = 0.4

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        geos.push(new THREE.BoxGeometry(windowSize, windowSize * 1.5, 0.05))
      }
    }
    return geos
  }, [hasWindows, width, height])

  return (
    <group position={position}>
      <mesh geometry={mainGeo} material={mainMat} position={[0, height / 2, 0]} castShadow receiveShadow>
        {hasWindows && windowGeos.map((geo, i) => {
          const rows = Math.floor(height / 2.5)
          const spacingX = width / (Math.floor(width / 1.5) + 1)
          const spacingY = height / (rows + 1)
          const col = i % Math.floor(width / 1.5)
          const row = Math.floor(i / Math.floor(width / 1.5))
          const wx = -width / 2 + spacingX * (col + 1)
          const wy = -height / 2 + spacingY * (row + 1)
          return (
            <mesh
              key={`window-${i}`}
              geometry={geo}
              material={windowsMat}
              position={[wx, wy, depth / 2 + 0.03]}
            />
          )
        })}
      </mesh>
      <mesh geometry={roofGeo} material={roofMat} position={[0, height + 0.75, 0]} castShadow />
    </group>
  )
}
