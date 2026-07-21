'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface NeonStripProps {
  position: [number, number, number]
  length: number
  color: string
  rotation?: [number, number, number]
  pulseSpeed?: number
}

export function NeonStrip({
  position,
  length,
  color,
  rotation = [0, 0, 0],
  pulseSpeed = 1,
}: NeonStripProps) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.3
    }
  })

  return (
    <mesh ref={ref} position={position} rotation={rotation as any}>
      <boxGeometry args={[length, 0.04, 0.04]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  )
}
