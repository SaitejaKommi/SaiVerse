'use client'

import { useMemo } from 'react'
import { CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'

type RoofStyle = 'classic' | 'flat' | 'modern'

interface BuildingProps {
  position: [number, number, number]
  width?: number
  depth?: number
  height?: number
  color?: string
  roofColor?: string
  hasWindows?: boolean
  windowsColor?: string
  style?: RoofStyle
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
  style = 'classic',
}: BuildingProps) {
  const mainGeo = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth])
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

  const roof = useMemo(() => {
    if (style === 'flat') {
      const h = 0.4
      const geo = new THREE.BoxGeometry(width * 1.05, h, depth * 1.05)
      return <mesh geometry={geo} material={roofMat} position={[0, height + h / 2, 0]} castShadow />
    }
    if (style === 'modern') {
      const h = 0.3
      const overhang = 0.8
      const geo = new THREE.BoxGeometry(width + overhang, h, depth + overhang)
      return <mesh geometry={geo} material={roofMat} position={[0, height + h / 2, 0]} castShadow />
    }
    const geo = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, 1.5, 4)
    return <mesh geometry={geo} material={roofMat} position={[0, height + 0.75, 0]} castShadow />
  }, [style, width, depth, height, roofMat])

  const windowGeos = useMemo(() => {
    if (!hasWindows) return []
    const geos: { x: number; y: number }[] = []
    const rows = Math.floor(height / 2.5)
    const cols = Math.floor(width / 1.5)
    const spacingX = width / (cols + 1)
    const spacingY = height / (rows + 1)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = -width / 2 + spacingX * (c + 1)
        const wy = -height / 2 + spacingY * (r + 1)
        geos.push({ x: wx, y: wy })
      }
    }
    return geos
  }, [hasWindows, width, height])

  return (
    <group position={position}>
      <CuboidCollider
        position={[0, height / 2, 0]}
        args={[width / 2, height / 2, depth / 2]}
      />
      <mesh geometry={mainGeo} material={mainMat} position={[0, height / 2, 0]} castShadow receiveShadow>
        {hasWindows && windowGeos.map((pos, i) => (
          <mesh
            key={`window-${i}`}
            position={[pos.x, pos.y, depth / 2 + 0.03]}
          >
            <boxGeometry args={[0.4, 0.6, 0.05]} />
            <meshStandardMaterial
              color={windowsColor}
              emissive={windowsColor}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
              roughness={0.1}
              metalness={0.5}
            />
          </mesh>
        ))}
      </mesh>
      {roof}
    </group>
  )
}
