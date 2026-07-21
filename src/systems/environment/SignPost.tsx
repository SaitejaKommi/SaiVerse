'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface SignPostProps {
  position: [number, number, number]
  rotation?: number
  color?: string
  label?: string
}

export function SignPost({ position, rotation = 0, color = '#744210', label = '' }: SignPostProps) {
  const texture = useMemo(() => {
    if (!label) return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.clearRect(0, 0, 512, 128)

    ctx.font = 'bold 48px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.shadowColor = '#00d4ff'
    ctx.shadowBlur = 16
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, 256, 64)

    ctx.shadowBlur = 0
    ctx.fillText(label, 256, 64)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [label])

  if (!label || !texture) {
    return (
      <group position={position} rotation={[0, rotation, 0]}>
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 4, 6]} />
          <meshStandardMaterial color='#4a5568' roughness={0.8} metalness={0.2} />
        </mesh>
        <mesh position={[0, 2.8, 0.3]} castShadow>
          <boxGeometry args={[1.2, 0.6, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, 2.8, -0.3]} castShadow>
          <boxGeometry args={[1.2, 0.6, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4, 6]} />
        <meshStandardMaterial color='#4a5568' roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.8, 0.3]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 2.8, -0.3]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>
      <sprite position={[0, 2.8, 0.45]} scale={[1.0, 0.3, 1]}>
        <spriteMaterial map={texture} transparent depthWrite={false} />
      </sprite>
    </group>
  )
}
