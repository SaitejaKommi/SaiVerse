'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'

const TREE_VARIANTS = {
  0: { trunkH: 1, trunkT: 0.08, trunkB: 0.12, segments: 6, canopy: 'cone' as const, canopyH: 0.8, canopyR: 0.7, canopySeg: 6, color: '#2d5a27', trunkColor: '#5c4033' },
  1: { trunkH: 1, trunkT: 0.1, trunkB: 0.15, segments: 6, canopy: 'sphere' as const, canopyH: 0.6, canopyR: 0.6, canopySeg: 6, color: '#3a7a33', trunkColor: '#5c4033' },
  2: { trunkH: 0.8, trunkT: 0.08, trunkB: 0.12, segments: 5, canopy: 'sphere' as const, canopyH: 0.5, canopyR: 0.5, canopySeg: 5, color: '#4a8a43', trunkColor: '#5c4033' },
  3: { trunkH: 2.5, trunkT: 0.06, trunkB: 0.15, segments: 8, canopy: 'palm' as const, canopyH: 0.3, canopyR: 0.8, canopySeg: 6, color: '#2d7a2d', trunkColor: '#6b5a4a' },
  4: { trunkH: 1.8, trunkT: 0.08, trunkB: 0.2, segments: 8, canopy: 'pine' as const, canopyH: 0.3, canopyR: 0.7, canopySeg: 8, color: '#1e4a18', trunkColor: '#4a3a2a' },
  5: { trunkH: 1, trunkT: 0.1, trunkB: 0.14, segments: 6, canopy: 'sphere' as const, canopyH: 0.7, canopyR: 0.7, canopySeg: 7, color: '#e8a0b0', trunkColor: '#5c4033' },
  6: { trunkH: 1.2, trunkT: 0.08, trunkB: 0.12, segments: 6, canopy: 'geo' as const, canopyH: 0.6, canopyR: 0.6, canopySeg: 6, color: '#3a7a7a', trunkColor: '#4a5a6a' },
}

type TreeVariantKey = keyof typeof TREE_VARIANTS

interface TreeProps {
  position: [number, number, number]
  scale?: number
  variant?: number
}

function buildTrunk(v: typeof TREE_VARIANTS[TreeVariantKey]) {
  return new THREE.CylinderGeometry(v.trunkT, v.trunkB, v.trunkH, v.segments)
}

function buildCanopy(v: typeof TREE_VARIANTS[TreeVariantKey]) {
  if (v.canopy === 'palm') {
    const group = new THREE.Group()
    const frondCount = 8
    for (let i = 0; i < frondCount; i++) {
      const angle = (i / frondCount) * Math.PI * 2
      const frond = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.8),
        new THREE.MeshStandardMaterial({ color: v.color, roughness: 0.8, side: THREE.DoubleSide }),
      )
      frond.position.set(Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3)
      frond.rotation.set(0.4, angle, 0.2)
      group.add(frond)
    }
    return group
  }
  if (v.canopy === 'pine') {
    const group = new THREE.Group()
    const tiers = 3
    for (let i = 0; i < tiers; i++) {
      const r = v.canopyR * (1 - i * 0.25)
      const h = v.canopyH * (0.6 - i * 0.15)
      const y = i * 0.5
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, v.canopySeg),
        new THREE.MeshStandardMaterial({ color: v.color, roughness: 0.8 }),
      )
      cone.position.set(0, y, 0)
      group.add(cone)
    }
    return group
  }
  if (v.canopy === 'geo') {
    const group = new THREE.Group()
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(v.canopyR * 0.8, 0),
      new THREE.MeshStandardMaterial({ color: v.color, roughness: 0.5, metalness: 0.4, wireframe: false }),
    )
    core.position.set(0, 0, 0)
    group.add(core)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(v.canopyR * 0.6, 0.04, 8, 12),
      new THREE.MeshStandardMaterial({ color: '#00d4ff', emissive: '#00d4ff', emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.6 }),
    )
    ring.position.set(0, 0.1, 0)
    ring.rotation.x = Math.PI / 2
    group.add(ring)
    return group
  }
  const geo = v.canopy === 'cone'
    ? new THREE.ConeGeometry(v.canopyR, v.canopyH, v.canopySeg)
    : new THREE.SphereGeometry(v.canopyR, v.canopySeg, v.canopySeg)
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: v.color, roughness: 0.8 }))
  const g = new THREE.Group()
  g.add(mesh)
  return g
}

export function Tree({ position, scale = 1, variant = 0 }: TreeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const canopyRef = useRef<THREE.Group>(null)
  const seed = useMemo(() => Math.random() * 100, [])
  const swaySpeed = useMemo(() => 0.4 + (seed % 0.6), [seed])
  const swayAmount = useMemo(() => 0.006 + (seed % 0.004), [seed])
  const canopySpeed = useMemo(() => 0.8 + (seed % 0.6), [seed])
  const canopySway = useMemo(() => 0.015 + (seed % 0.01), [seed])

  const v = TREE_VARIANTS[(variant % 7) as TreeVariantKey] ?? TREE_VARIANTS[0]
  const trunkGeo = useMemo(() => buildTrunk(v), [v])
  const canopyGroup = useMemo(() => buildCanopy(v), [v])
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: v.trunkColor, roughness: 0.9 }), [v.trunkColor])

  const canopyY = v.canopy === 'cone' || v.canopy === 'sphere' || v.canopy === 'geo'
    ? v.trunkH + v.canopyH * 0.4
    : v.trunkH + 0.2

  useFrame((state) => {
    const group = groupRef.current
    const canopy = canopyRef.current
    if (!group || !canopy) return
    const windStr = useGameStore.getState().world.windStrength
    const wf = 1 + windStr * 0.5
    const t = state.clock.elapsedTime
    const baseSway = Math.sin(t * swaySpeed + seed) * swayAmount * wf
    group.rotation.z = baseSway
    canopy.rotation.z = Math.sin(t * canopySpeed + seed + 1) * canopySway * wf
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <CuboidCollider position={[0, v.trunkH * 0.5, 0]} args={[0.15, v.trunkH * 0.5, 0.15]} />
      <mesh geometry={trunkGeo} material={trunkMat} position={[0, v.trunkH * 0.5, 0]} castShadow />
      <group ref={canopyRef} position={[0, canopyY, 0]}>
        <primitive object={canopyGroup} />
      </group>
    </group>
  )
}
