'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LockedDistrictProps {
  position: [number, number, number]
  label?: string
  requiredChapter?: string
}

export function LockedDistrict({ position, label = 'LOCKED', requiredChapter }: LockedDistrictProps) {
  const wallRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, 512, 256)
    ctx.font = 'bold 48px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ff4488'
    ctx.fillText('🔒 ' + label, 256, 80)
    if (requiredChapter) {
      ctx.font = '28px monospace'
      ctx.fillStyle = '#ff8888'
      ctx.fillText(requiredChapter, 256, 164)
    }
    return new THREE.CanvasTexture(canvas)
  }, [label, requiredChapter])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (wallRef.current) {
      const material = wallRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.25 + Math.sin(t * 1.5) * 0.1
    }
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.4 + Math.sin(t * 2) * 0.15
    }
  })

  return (
    <group position={position}>
      <mesh ref={wallRef} position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshBasicMaterial color="#0a0a2e" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glowRef} position={[0, 4, 0]}>
        <boxGeometry args={[20, 6, 0.5]} />
        <meshBasicMaterial color="#ff2244" transparent opacity={0.5} />
      </mesh>
      <sprite position={[0, 8, 0]} scale={[4, 2, 1]}>
        <spriteMaterial transparent map={texture} />
      </sprite>
    </group>
  )
}
