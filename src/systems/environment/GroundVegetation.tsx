'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'

interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

interface GroundVegetationProps {
  bounds: Bounds
  grassCount?: number
  bushCount?: number
  grassColor?: string
  bushColor?: string
  excludeRadius?: number
  excludePosition?: [number, number, number]
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function distributePoints(
  count: number,
  bounds: Bounds,
  seed: number,
  excludePos?: [number, number, number],
  excludeRadius = 0,
): Float32Array {
  const rng = seededRandom(seed)
  const positions = new Float32Array(count * 3)
  let placed = 0
  let attempts = 0
  while (placed < count && attempts < count * 10) {
    attempts++
    const x = bounds.minX + rng() * (bounds.maxX - bounds.minX)
    const z = bounds.minZ + rng() * (bounds.maxZ - bounds.minZ)
    if (excludePos) {
      const dx = x - excludePos[0]
      const dz = z - excludePos[2]
      if (dx * dx + dz * dz < excludeRadius * excludeRadius) continue
    }
    const i = placed * 3
    positions[i] = x
    positions[i + 1] = 0
    positions[i + 2] = z
    placed++
  }
  return positions
}

function GrassPatch({ positions, color }: { positions: Float32Array; color: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const count = positions.length / 3

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const rng = seededRandom(42)
    const mesh = meshRef.current
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      dummy.position.set(positions[i3]!, positions[i3 + 1]!, positions[i3 + 2]!)
      dummy.scale.setScalar(0.3 + rng() * 0.4)
      dummy.rotation.set(0, rng() * Math.PI * 2, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [count, positions, dummy])

  useFrame((state) => {
    const mesh = meshRef.current
    const windStr = useGameStore.getState().world.windStrength
    const t = state.clock.elapsedTime
    const rng = seededRandom(42)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const sway = Math.sin(t * 0.8 + rng() * 10) * 0.01 * (1 + windStr * 0.3)
      dummy.position.set(positions[i3]!, positions[i3 + 1]! + sway * 0.2, positions[i3 + 2]!)
      dummy.scale.setScalar(0.3 + rng() * 0.4)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]} castShadow receiveShadow>
      <coneGeometry args={[0.15, 0.3, 4]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
    </instancedMesh>
  )
}

function BushPatch({ positions, color }: { positions: Float32Array; color: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const count = positions.length / 3

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const rng = seededRandom(137)
    const mesh = meshRef.current
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      dummy.position.set(positions[i3]!, positions[i3 + 1]!, positions[i3 + 2]!)
      const s = 0.3 + rng() * 0.5
      dummy.scale.set(s, s * (0.6 + rng() * 0.4), s)
      dummy.rotation.set(0, rng() * Math.PI * 2, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [count, positions, dummy])

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]} castShadow>
      <sphereGeometry args={[0.25, 5, 5]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
    </instancedMesh>
  )
}

export function GroundVegetation({
  bounds,
  grassCount = 200,
  bushCount = 30,
  grassColor = '#3a7a33',
  bushColor = '#2d5a27',
  excludeRadius = 15,
  excludePosition = [0, 0, 0],
}: GroundVegetationProps) {
  const grassPos = useMemo(
    () => distributePoints(grassCount, bounds, 42, excludePosition, excludeRadius),
    [grassCount, bounds, excludePosition, excludeRadius],
  )
  const bushPos = useMemo(
    () => distributePoints(bushCount, bounds, 137, excludePosition, excludeRadius),
    [bushCount, bounds, excludePosition, excludeRadius],
  )

  return (
    <group>
      <GrassPatch positions={grassPos} color={grassColor} />
      <BushPatch positions={bushPos} color={bushColor} />
    </group>
  )
}
