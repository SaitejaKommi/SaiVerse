'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SkylineBuilding {
  x: number
  z: number
  width: number
  depth: number
  height: number
  color: string
  glowColor: string
}

const BUILDINGS: SkylineBuilding[] = [
  { x: -35, z: -310, width: 6, depth: 5, height: 28, color: '#1a1a2e', glowColor: '#00d4ff' },
  { x: -25, z: -320, width: 4, depth: 4, height: 18, color: '#16213e', glowColor: '#00ff88' },
  { x: -18, z: -305, width: 5, depth: 5, height: 35, color: '#0f3460', glowColor: '#a855f7' },
  { x: -8, z: -315, width: 3, depth: 3, height: 14, color: '#1a1a2e', glowColor: '#00d4ff' },
  { x: 0, z: -300, width: 8, depth: 6, height: 45, color: '#0f3460', glowColor: '#00ff88' },
  { x: 10, z: -312, width: 4, depth: 4, height: 22, color: '#16213e', glowColor: '#a855f7' },
  { x: 20, z: -308, width: 5, depth: 5, height: 30, color: '#1a1a2e', glowColor: '#00d4ff' },
  { x: 30, z: -318, width: 3, depth: 3, height: 16, color: '#0f3460', glowColor: '#00ff88' },
  { x: 38, z: -305, width: 6, depth: 4, height: 25, color: '#16213e', glowColor: '#a855f7' },
  { x: -30, z: -335, width: 5, depth: 4, height: 20, color: '#1a1a2e', glowColor: '#00d4ff' },
  { x: -15, z: -340, width: 4, depth: 3, height: 15, color: '#0f3460', glowColor: '#00ff88' },
  { x: 15, z: -345, width: 4, depth: 4, height: 18, color: '#16213e', glowColor: '#a855f7' },
  { x: 28, z: -330, width: 5, depth: 5, height: 22, color: '#1a1a2e', glowColor: '#00d4ff' },
]

function SkylineBuilding({ data }: { data: SkylineBuilding }) {
  const windowPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let y = 0.5; y < data.height - 1; y += 1.8) {
      for (let nx = -1; nx <= 1; nx += 1) {
        if (Math.random() > 0.4) {
          positions.push([nx * (data.width * 0.25), y, data.depth / 2 + 0.01])
        }
        if (Math.random() > 0.4) {
          positions.push([nx * (data.width * 0.25), y, -data.depth / 2 - 0.01])
        }
      }
    }
    return positions
  }, [data])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: data.glowColor,
    transparent: true,
    opacity: 0.8,
  }), [data.glowColor])

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: data.color,
    roughness: 0.3,
    metalness: 0.5,
    fog: false,
  }), [data.color])

  return (
    <group position={[data.x, data.height / 2, data.z]}>
      <mesh castShadow>
        <boxGeometry args={[data.width, data.height, data.depth]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[0, data.height / 2 + 0.5, 0]}>
        <boxGeometry args={[data.width * 0.8, 0.3, data.depth * 0.8]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.3} fog={false} />
      </mesh>
      {windowPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <planeGeometry args={[0.2, 0.4]} />
          <primitive object={glowMat} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

function SkylineGlow() {
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.15) * 0.03
    }
  })

  return (
    <mesh ref={glowRef} position={[2, 20, -330]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 60]} />
      <meshBasicMaterial
        color="#2dd4bf"
        transparent
        opacity={0.06}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}

export function SoftwareCitySkyline() {
  return (
    <group>
      <SkylineGlow />
      {BUILDINGS.map((b, i) => (
        <SkylineBuilding key={i} data={b} />
      ))}
      {/* Anti-fog ambient in the distance */}
      <mesh position={[2, 0, -290]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 80]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.3} depthWrite={false} fog={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
