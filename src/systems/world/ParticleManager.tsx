'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { clamp } from '@/lib/utils'

interface ParticleManagerProps {
  maxParticles?: number
  rainArea?: number
}

const RAIN_COLOR = new THREE.Color('#aabbdd')
const DUST_COLOR = new THREE.Color('#bbaa88')

export function ParticleManager({
  maxParticles = 2000,
  rainArea = 80,
}: ParticleManagerProps) {
  const weatherIntensity = useGameStore((s) => s.world.weatherIntensity)
  const windStrength = useGameStore((s) => s.world.windStrength)

  const rainRef = useRef<THREE.Points>(null)
  const dustRef = useRef<THREE.Points>(null)
  const playerPos = useRef(new THREE.Vector3(0, 10, 0))

  const rainData = useMemo(() => {
    const count = maxParticles
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * rainArea
      positions[i * 3 + 1] = Math.random() * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * rainArea
      velocities[i] = 15 + Math.random() * 10
    }

    return { positions, velocities }
  }, [maxParticles, rainArea])

  const rainGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(rainData.positions, 3))
    geo.setAttribute('velocity', new THREE.BufferAttribute(rainData.velocities, 1))
    return geo
  }, [rainData])

  const rainMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: RAIN_COLOR,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  const dustGeometry = useMemo(() => {
    const count = 100
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * rainArea
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * rainArea
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [rainArea])

  const dustMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: DUST_COLOR,
      size: 0.3,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const cam = state.camera
    playerPos.current.set(cam.position.x, 0, cam.position.z)

    const rainPoints = rainRef.current
    if (rainPoints && weatherIntensity > 0.01) {
      const posAttr = rainPoints.geometry.getAttribute('position')
      const velAttr = rainPoints.geometry.getAttribute('velocity')
      if (posAttr && velAttr) {
        const positions = posAttr.array as Float32Array
        const velocities = velAttr.array as Float32Array

        for (let i = 0; i < maxParticles; i++) {
          const idx0 = i * 3
          const idx1 = i * 3 + 1
          const idx2 = i * 3 + 2
          positions[idx0] = (positions[idx0] ?? 0) + (windStrength * dt * 0.5 + (Math.random() - 0.5) * 0.1)
          positions[idx1] = (positions[idx1] ?? 0) - (velocities[i] ?? 0) * dt * weatherIntensity
          positions[idx2] = (positions[idx2] ?? 0) + (Math.random() - 0.5) * 0.1

          if ((positions[idx1] ?? 0) < -2) {
            positions[idx0] = playerPos.current.x + (Math.random() - 0.5) * rainArea
            positions[idx1] = 20 + Math.random() * 10
            positions[idx2] = playerPos.current.z + (Math.random() - 0.5) * rainArea
          }

          if (Math.abs((positions[idx0] ?? 0) - playerPos.current.x) > rainArea / 2) {
            positions[idx0] = playerPos.current.x + (Math.random() - 0.5) * rainArea
          }
          if (Math.abs((positions[idx2] ?? 0) - playerPos.current.z) > rainArea / 2) {
            positions[idx2] = playerPos.current.z + (Math.random() - 0.5) * rainArea
          }
        }

        posAttr.needsUpdate = true
      }
    }

    const dustPoints = dustRef.current
    if (dustPoints) {
      const posAttr = dustPoints.geometry.getAttribute('position')
      if (posAttr) {
        const positions = posAttr.array as Float32Array
        const count = positions.length / 3

        for (let i = 0; i < count; i++) {
          const idx0 = i * 3
          const idx1 = i * 3 + 1
          const idx2 = i * 3 + 2
          positions[idx0] = (positions[idx0] ?? 0) + windStrength * dt * 0.2 + (Math.random() - 0.5) * 0.05
          positions[idx1] = (positions[idx1] ?? 0) + (Math.random() - 0.5) * 0.05
          positions[idx2] = (positions[idx2] ?? 0) + (Math.random() - 0.5) * 0.05

          if (Math.abs((positions[idx0] ?? 0) - playerPos.current.x) > rainArea / 2) {
            positions[idx0] = playerPos.current.x + (Math.random() - 0.5) * rainArea
          }
          const p1 = positions[idx1] ?? 0
          if (p1 < 0 || p1 > 5) {
            positions[idx1] = Math.random() * 5
          }
          if (Math.abs((positions[idx2] ?? 0) - playerPos.current.z) > rainArea / 2) {
            positions[idx2] = playerPos.current.z + (Math.random() - 0.5) * rainArea
          }
        }

        posAttr.needsUpdate = true
      }
    }

    rainMaterial.opacity = clamp(weatherIntensity * 0.6, 0, 0.6)
    dustMaterial.opacity = clamp(0.15 * (1 - weatherIntensity * 0.5), 0, 0.15)
  })

  return (
    <group>
      <points ref={rainRef} geometry={rainGeometry} material={rainMaterial} frustumCulled={false} />
      <points ref={dustRef} geometry={dustGeometry} material={dustMaterial} frustumCulled={false} />
    </group>
  )
}
