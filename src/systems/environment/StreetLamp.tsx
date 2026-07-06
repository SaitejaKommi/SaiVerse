'use client'

import { useMemo, useRef } from 'react'
import { CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { ENV_CONFIG } from './environment.config'

interface StreetLampProps {
  position: [number, number, number]
  color?: string
  lightRadius?: number
  lightIntensity?: number
}

export function StreetLamp({
  position,
  color = '#ffdd88',
  lightRadius = ENV_CONFIG.LAMP_REACH,
  lightIntensity = 0.5,
}: StreetLampProps) {
  const lightRef = useRef<THREE.PointLight>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const poleGeo = useMemo(() => new THREE.CylinderGeometry(0.05, 0.08, ENV_CONFIG.LAMP_HEIGHT, 6), [])
  const armGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4), [])
  const lampGeo = useMemo(() => new THREE.SphereGeometry(0.12, 6, 6), [])

  const poleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.5,
    metalness: 0.8,
  }), [])

  const lampMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1,
    roughness: 0.3,
  }), [color])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.08,
  }), [color])

  return (
    <group position={[position[0], 0, position[2]]}>
      <CuboidCollider position={[0, ENV_CONFIG.LAMP_HEIGHT / 2, 0]} args={[0.05, ENV_CONFIG.LAMP_HEIGHT / 2, 0.05]} />
      <mesh geometry={poleGeo} material={poleMat} position={[0, ENV_CONFIG.LAMP_HEIGHT / 2, 0]} castShadow />
      <mesh geometry={armGeo} material={poleMat} position={[0.25, ENV_CONFIG.LAMP_HEIGHT, 0]} rotation={[0, 0, Math.PI / 2]} />
      <mesh geometry={lampGeo} material={lampMat} position={[0.5, ENV_CONFIG.LAMP_HEIGHT, 0]} />

      <pointLight
        ref={lightRef}
        position={[0.5, ENV_CONFIG.LAMP_HEIGHT, 0]}
        color={color}
        intensity={lightIntensity}
        distance={lightRadius}
        decay={2}
      />

      <mesh
        ref={glowRef}
        geometry={new THREE.SphereGeometry(lightRadius, 8, 8)}
        material={glowMat}
        position={[0.5, ENV_CONFIG.LAMP_HEIGHT, 0]}
      />
    </group>
  )
}
