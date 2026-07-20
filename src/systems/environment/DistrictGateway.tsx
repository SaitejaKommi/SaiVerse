'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type GatewayStyle = 'neon' | 'wooden' | 'steel' | 'glass' | 'industrial' | 'golden'

interface GatewayConfig {
  style: GatewayStyle
  primaryColor: string
  accentColor: string
  archHeight: number
  archWidth: number
}

const STYLES: Record<GatewayStyle, Omit<GatewayConfig, 'style'>> = {
  neon: {
    primaryColor: '#1a1a3e',
    accentColor: '#00d4ff',
    archHeight: 8,
    archWidth: 6,
  },
  wooden: {
    primaryColor: '#5c4033',
    accentColor: '#3a7a33',
    archHeight: 7,
    archWidth: 5,
  },
  steel: {
    primaryColor: '#4a5568',
    accentColor: '#00ff88',
    archHeight: 9,
    archWidth: 6,
  },
  glass: {
    primaryColor: '#2d3748',
    accentColor: '#88ccff',
    archHeight: 8,
    archWidth: 6,
  },
  industrial: {
    primaryColor: '#4a4a4a',
    accentColor: '#ff6600',
    archHeight: 10,
    archWidth: 7,
  },
  golden: {
    primaryColor: '#2a2a3e',
    accentColor: '#ffd700',
    archHeight: 10,
    archWidth: 8,
  },
}

interface DistrictGatewayProps {
  position: [number, number, number]
  rotation?: number
  style?: GatewayStyle
  label?: string
}

export function DistrictGateway({
  position,
  rotation = 0,
  style = 'neon',
}: DistrictGatewayProps) {
  const config = STYLES[style]
  const glowRef = useRef<THREE.Mesh>(null)

  const pillarMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.primaryColor,
    roughness: 0.4,
    metalness: 0.6,
  }), [config.primaryColor])

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.accentColor,
    emissive: config.accentColor,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.7,
  }), [config.accentColor])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: config.accentColor,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  }), [config.accentColor])

  useFrame((state) => {
    if (!glowRef.current) return
    const t = state.clock.elapsedTime
    glowRef.current.scale.setScalar(1.2 + Math.sin(t * 0.8) * 0.15)
    const mat = glowRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.06 + Math.sin(t * 1.2) * 0.03
  })

  const hw = config.archWidth / 2
  const h = config.archHeight
  const pillarR = 0.25

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left pillar */}
      <mesh position={[-hw, h / 2, 0]} castShadow>
        <cylinderGeometry args={[pillarR, pillarR * 1.15, h, 8]} />
        <primitive object={pillarMat} attach="material" />
      </mesh>
      {/* Right pillar */}
      <mesh position={[hw, h / 2, 0]} castShadow>
        <cylinderGeometry args={[pillarR, pillarR * 1.15, h, 8]} />
        <primitive object={pillarMat} attach="material" />
      </mesh>
      {/* Arch top */}
      <mesh position={[0, h, 0]} castShadow>
        <boxGeometry args={[config.archWidth + 0.5, 0.3, 0.6]} />
        <primitive object={pillarMat} attach="material" />
      </mesh>
      {/* Accent stripe on arch */}
      <mesh position={[0, h - 0.05, 0.32]}>
        <boxGeometry args={[config.archWidth - 1, 0.1, 0.02]} />
        <primitive object={accentMat} attach="material" />
      </mesh>
      {/* Accent stripe on pillars */}
      {[-hw, hw].map((x) => (
        <mesh key={`accent-${x}`} position={[x, 0.3, 0.32]}>
          <boxGeometry args={[0.1, 0.15, 0.02]} />
          <primitive object={accentMat} attach="material" />
        </mesh>
      ))}
      {/* Portal glow */}
      <mesh ref={glowRef} position={[0, h * 0.6, -0.5]}>
        <planeGeometry args={[config.archWidth * 0.8, h * 0.7]} />
        <primitive object={glowMat} attach="material" />
      </mesh>
      {/* Point light */}
      <pointLight position={[0, h * 0.6, 0]} color={config.accentColor} intensity={0.8} distance={12} decay={1.5} />
    </group>
  )
}
