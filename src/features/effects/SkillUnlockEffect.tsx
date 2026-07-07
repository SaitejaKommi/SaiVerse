'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

const PARTICLE_COUNT = 80
const BURST_DURATION = 2

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  color: THREE.Color
}

export function SkillUnlockEffect() {
  const pointsRef = useRef<THREE.Points>(null)
  const particlesRef = useRef<Particle[]>([])
  const active = useRef(false)

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const col = new Float32Array(PARTICLE_COUNT * 3)
    const sz = new Float32Array(PARTICLE_COUNT)
    return { positions: pos, colors: col, sizes: sz }
  }, [])

  useEffect(() => {
    const unsub = EventBus.on(GameEvents.CELEBRATION_TRIGGER, () => {
      const p: Particle[] = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        const speed = 2 + Math.random() * 4
        p.push({
          position: new THREE.Vector3(0, 1.5, 0),
          velocity: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * speed,
            Math.abs(Math.sin(phi) * Math.sin(theta)) * speed + 1,
            Math.cos(phi) * speed,
          ),
          life: 0,
          maxLife: 0.5 + Math.random() * BURST_DURATION * 0.8,
          color: new THREE.Color().setHSL(0.12 + Math.random() * 0.15, 0.9, 0.5 + Math.random() * 0.3),
        })
      }
      particlesRef.current = p
      active.current = true
    })

    return () => { unsub() }
  }, [])

  useFrame((_, delta) => {
    if (!active.current) return

    const particles = particlesRef.current
    let alive = false

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i]
      if (!p) { 
        positions[i * 3] = 9999
        sizes[i] = 0
        continue 
      }
      p.life += delta
      if (p.life >= p.maxLife) {
        positions[i * 3] = 9999
        sizes[i] = 0
        continue
      }
      alive = true
      const progress = p.life / p.maxLife
      p.position.add(p.velocity.clone().multiplyScalar(delta))
      p.velocity.y -= delta * 3
      positions[i * 3] = p.position.x
      positions[i * 3 + 1] = p.position.y
      positions[i * 3 + 2] = p.position.z
      colors[i * 3] = p.color.r
      colors[i * 3 + 1] = p.color.g
      colors[i * 3 + 2] = p.color.b
      sizes[i] = 0.15 * (1 - progress)
    }

    const geo = pointsRef.current?.geometry
    if (geo) {
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
      const colAttr = geo.getAttribute('color') as THREE.BufferAttribute
      const szAttr = geo.getAttribute('size') as THREE.BufferAttribute
      if (posAttr) { posAttr.array.set(positions); posAttr.needsUpdate = true }
      if (colAttr) { colAttr.array.set(colors); colAttr.needsUpdate = true }
      if (szAttr) { szAttr.array.set(sizes); szAttr.needsUpdate = true }
    }

    if (!alive) active.current = false
  })

  if (!active.current) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" />
        <bufferAttribute args={[sizes, 1]} attach="attributes-size" />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
