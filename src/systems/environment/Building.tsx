'use client'

import { useMemo } from 'react'
import { CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'

type RoofStyle = 'classic' | 'flat' | 'modern' | 'gable' | 'dome'

interface WindowFace {
  rows: number
  cols: number
  width: number
  depth: number
}

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
  accentColor?: string
}

function buildWindowGrid(face: WindowFace, offsetZ: number, color: string, emissiveIntensity: number) {
  const { rows, cols, width, depth } = face
  const spacingX = width / (cols + 1)
  const spacingY = depth / (rows + 1)
  const windows: React.ReactElement[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = -width / 2 + spacingX * (c + 1)
      const wy = -depth / 2 + spacingY * (r + 1)
      const darken = Math.random() > 0.7 ? 0.1 : emissiveIntensity
      windows.push(
        <mesh key={`w-${offsetZ}-${r}-${c}`} position={[wx, wy, offsetZ]}>
          <boxGeometry args={[0.4, 0.6, 0.05]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={darken}
            transparent
            opacity={0.8}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
      )
    }
  }
  return windows
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
  accentColor,
}: BuildingProps) {
  const halfH = height / 2
  const dim = Math.max(width, depth)

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

  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: accentColor ?? roofColor,
    roughness: 0.7,
    metalness: 0.2,
  }), [accentColor, roofColor])

  const roof = useMemo(() => {
    const parts: React.ReactElement[] = []
    if (style === 'flat') {
      const h = 0.4
      parts.push(
        <mesh key="roof" geometry={new THREE.BoxGeometry(width * 1.05, h, depth * 1.05)} material={roofMat} position={[0, height + h / 2, 0]} castShadow />
      )
      parts.push(
        <mesh key="cornice" geometry={new THREE.BoxGeometry(width * 1.1, 0.1, depth * 1.1)} material={trimMat} position={[0, height - 0.05, 0]} />
      )
    } else if (style === 'modern') {
      const h = 0.3
      const overhang = 0.8
      parts.push(
        <mesh key="roof" geometry={new THREE.BoxGeometry(width + overhang, h, depth + overhang)} material={roofMat} position={[0, height + h / 2, 0]} castShadow />
      )
      parts.push(
        <mesh key="cornice" geometry={new THREE.BoxGeometry(width + overhang + 0.1, 0.1, depth + overhang + 0.1)} material={trimMat} position={[0, height - 0.05, 0]} />
      )
    } else if (style === 'gable') {
      const h = 1.5
      const shape = new THREE.Shape()
      shape.moveTo(-width / 2, 0)
      shape.lineTo(0, h)
      shape.lineTo(width / 2, 0)
      shape.closePath()
      const extrudeSettings = { depth: depth, bevelEnabled: false }
      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      geo.translate(0, height, -depth / 2)
      geo.rotateX(0)
      parts.push(
        <mesh key="roof" geometry={geo} material={roofMat} position={[0, 0, 0]} castShadow />
      )
      parts.push(
        <mesh key="cornice" geometry={new THREE.BoxGeometry(width * 1.05, 0.1, depth * 1.05)} material={trimMat} position={[0, height - 0.05, 0]} />
      )
    } else if (style === 'dome') {
      parts.push(
        <mesh key="roof" geometry={new THREE.SphereGeometry(dim * 0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)} material={roofMat} position={[0, height, 0]} castShadow />
      )
      parts.push(
        <mesh key="cornice" geometry={new THREE.TorusGeometry(dim * 0.52, 0.08, 6, 24)} material={trimMat} position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} />
      )
    } else {
      parts.push(
        <mesh key="roof" geometry={new THREE.ConeGeometry(dim * 0.7, 1.5, 8)} material={roofMat} position={[0, height + 0.75, 0]} castShadow />
      )
    }
    return parts
  }, [style, width, depth, height, dim, roofMat, trimMat])

  const windows = useMemo(() => {
    if (!hasWindows) return null
    const wRows = Math.max(1, Math.floor(height / 2.5))
    const wCols = Math.max(1, Math.floor(width / 1.5))
    const dRows = Math.max(1, Math.floor(height / 2.5))
    const dCols = Math.max(1, Math.floor(depth / 1.5))
    const eIntensity = 0.2 + Math.random() * 0.3
    return (
      <group>
        {buildWindowGrid({ rows: wRows, cols: wCols, width, depth: height }, depth / 2 + 0.03, windowsColor, eIntensity)}
        {buildWindowGrid({ rows: wRows, cols: wCols, width, depth: height }, -depth / 2 - 0.03, windowsColor, eIntensity)}
        {buildWindowGrid({ rows: dRows, cols: dCols, width: depth, depth: height }, width / 2 + 0.03, windowsColor, eIntensity)}
        {buildWindowGrid({ rows: dRows, cols: dCols, width: depth, depth: height }, -width / 2 - 0.03, windowsColor, eIntensity)}
      </group>
    )
  }, [hasWindows, width, depth, height, windowsColor])

  return (
    <group position={position}>
      <CuboidCollider
        position={[0, halfH, 0]}
        args={[width / 2, halfH, depth / 2]}
      />
      {/* Base trim */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[width + 0.15, 0.3, depth + 0.15]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Main body */}
      <mesh geometry={new THREE.BoxGeometry(width, height, depth)} material={mainMat} position={[0, halfH, 0]} castShadow receiveShadow />
      {windows}
      {roof}
    </group>
  )
}
