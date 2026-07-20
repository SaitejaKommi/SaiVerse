'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface PosterProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  textColor?: string
  width?: number
  height?: number
}

export function Poster({
  position,
  rotation = [0, 0, 0],
  color = '#fefae0',
  width = 0.8,
  height = 0.6,
}: PosterProps) {
  const geo = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.DoubleSide,
  }), [color])

  return (
    <mesh geometry={geo} material={mat} position={position} rotation={rotation as any} />
  )
}
