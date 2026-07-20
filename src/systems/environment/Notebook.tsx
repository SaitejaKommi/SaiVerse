'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface NotebookProps {
  position: [number, number, number]
  rotation?: number
  color?: string
}

export function Notebook({ position, rotation = 0, color = '#fefae0' }: NotebookProps) {
  const coverGeo = useMemo(() => new THREE.BoxGeometry(0.25, 0.012, 0.18), [])
  const pageGeo = useMemo(() => new THREE.BoxGeometry(0.23, 0.008, 0.16), [])

  const coverMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.1,
  }), [color])

  const pageMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.8,
    metalness: 0,
  }), [])

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      <mesh geometry={coverGeo} material={coverMat} position={[0, 0.006, 0]} receiveShadow />
      <mesh geometry={pageGeo} material={pageMat} position={[0, 0.016, 0]} />
      <mesh geometry={coverGeo} material={coverMat} position={[0, 0.024, 0]} />
    </group>
  )
}
