'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface PaperAirplaneProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

export function PaperAirplane({ position, rotation = [0, 0, 0] }: PaperAirplaneProps) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.08, 0.03)
    shape.lineTo(0, 0.06)
    shape.lineTo(-0.02, 0.03)
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fefae0',
    roughness: 0.7,
    metalness: 0,
    side: THREE.DoubleSide,
  }), [])

  return (
    <mesh geometry={geo} material={mat} position={position} rotation={rotation as any} />
  )
}
