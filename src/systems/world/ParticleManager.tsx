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
const SNOW_COLOR = new THREE.Color('#ffffff')

export function ParticleManager({
  maxParticles = 2000,
  rainArea = 80,
}: ParticleManagerProps) {
  const weatherIntensity = useGameStore((s) => s.world.weatherIntensity)
  const windStrength = useGameStore((s) => s.world.windStrength)

  const rainRef = useRef<THREE.Points>(null)
  const dustRef = useRef<THREE.Points>(null)
  const snowRef = useRef<THREE.Points>(null)
  const playerPos = useRef(new THREE.Vector3(0, 10, 0))

  const weather = useGameStore((s) => s.world.weather)

  const splashRef = useRef<THREE.Points>(null)
  const rippleGroupRef = useRef<THREE.Group>(null)
  const MAX_SPLASHES = 100
  const MAX_RIPPLES = 20
  const splashData = useRef({
    positions: new Float32Array(MAX_SPLASHES * 3),
    velocities: new Float32Array(MAX_SPLASHES * 3),
    lifetimes: new Float32Array(MAX_SPLASHES),
    nextIdx: 0,
  })
  const rippleData = useRef<{ life: number; maxLife: number; scale: number; mesh: THREE.Mesh | null }[]>(
    Array.from({ length: MAX_RIPPLES }, () => ({ life: 0, maxLife: 0.5, scale: 0, mesh: null }))
  )

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

  const splashGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = splashData.current.positions
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  }, [])

  const splashMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: RAIN_COLOR,
      size: 0.08,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
  }, [])

  const snowData = useMemo(() => {
    const count = 500
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)
    const drifts = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * rainArea
      positions[i * 3 + 1] = Math.random() * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * rainArea
      velocities[i] = 3 + Math.random() * 3
      drifts[i] = Math.random() * Math.PI * 2
    }

    return { positions, velocities, drifts }
  }, [rainArea])

  const snowGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(snowData.positions, 3))
    geo.setAttribute('velocity', new THREE.BufferAttribute(snowData.velocities, 1))
    geo.setAttribute('drift', new THREE.BufferAttribute(snowData.drifts, 1))
    return geo
  }, [snowData])

  const snowMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: SNOW_COLOR,
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useMemo(() => {
    const rippleMat = new THREE.MeshBasicMaterial({
      color: '#aabbdd',
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const rd = rippleData.current
    for (let r = 0; r < MAX_RIPPLES; r++) {
      const geo = new THREE.RingGeometry(0.05, 0.25, 16)
      const mesh = new THREE.Mesh(geo, rippleMat.clone())
      mesh.rotation.x = -Math.PI / 2
      mesh.visible = false
      mesh.userData.rippleIndex = r
      if (rd[r]) rd[r]!.mesh = mesh
    }
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
            const hitX = positions[idx0] ?? 0
            const hitZ = positions[idx2] ?? 0

            const sdata = splashData.current
            for (let s = 0; s < 4; s++) {
              const si = sdata.nextIdx % MAX_SPLASHES
              sdata.nextIdx = (sdata.nextIdx + 1) % MAX_SPLASHES
              const si3 = si * 3
              sdata.positions[si3] = hitX + (Math.random() - 0.5) * 0.3
              sdata.positions[si3 + 1] = -2
              sdata.positions[si3 + 2] = hitZ + (Math.random() - 0.5) * 0.3
              sdata.velocities[si3] = (Math.random() - 0.5) * 2.5
              sdata.velocities[si3 + 1] = Math.random() * 2 + 0.5
              sdata.velocities[si3 + 2] = (Math.random() - 0.5) * 2.5
              sdata.lifetimes[si] = 0.3
            }

            let rippleActivated = false
            const rdArr = rippleData.current
            for (let r = 0; r < MAX_RIPPLES; r++) {
              const item = rdArr[r]
              if (!item) continue
              if (item.life <= 0 && !rippleActivated) {
                item.life = item.maxLife
                item.scale = 0
                if (item.mesh) {
                  item.mesh.position.set(hitX, -2, hitZ)
                  item.mesh.visible = true
                  item.mesh.scale.setScalar(0)
                  const mat = item.mesh.material as THREE.MeshBasicMaterial
                  mat.opacity = 0.6
                }
                rippleActivated = true
              }
            }

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

    const sd = splashData.current
    if (weatherIntensity > 0.01) {
      const lt = sd.lifetimes
      const pos = sd.positions
      const vel = sd.velocities
      for (let i = 0; i < MAX_SPLASHES; i++) {
        const life = lt[i]!
        if (life > 0) {
          lt[i] = life - dt
          const i3 = i * 3
          pos[i3] = pos[i3]! + vel[i3]! * dt
          pos[i3 + 1] = pos[i3 + 1]! + vel[i3 + 1]! * dt
          pos[i3 + 2] = pos[i3 + 2]! + vel[i3 + 2]! * dt
          vel[i3 + 1] = vel[i3 + 1]! - 9.8 * dt
          if (lt[i]! <= 0) {
            pos[i3] = 0
            pos[i3 + 1] = -100
            pos[i3 + 2] = 0
          }
        }
      }
      if (splashRef.current) {
        const posAttr = splashRef.current.geometry.getAttribute('position')
        if (posAttr) posAttr.needsUpdate = true
      }
    }

    let activeSplashCount = 0
    for (let i = 0; i < MAX_SPLASHES; i++) {
      if ((sd.lifetimes[i] ?? 0) > 0) activeSplashCount++
    }
    splashMaterial.opacity = clamp(weatherIntensity * 0.6 * (activeSplashCount / 10), 0, 0.6)

    const rdArr = rippleData.current
    for (let r = 0; r < MAX_RIPPLES; r++) {
      const item = rdArr[r]
      if (!item) continue
      if (item.life > 0 && item.mesh) {
        item.life = item.life - dt
        const progress = 1 - item.life / item.maxLife
        item.scale = progress * 3
        item.mesh.scale.setScalar(item.scale)
        const mat = item.mesh.material as THREE.MeshBasicMaterial
        mat.opacity = Math.max(0, 0.6 * (1 - progress))
        if (item.life <= 0) {
          item.mesh.visible = false
          mat.opacity = 0
        }
      }
    }

    const snowPoints = snowRef.current
    if (snowPoints && weather === 'snow') {
      const posAttr = snowPoints.geometry.getAttribute('position')
      const velAttr = snowPoints.geometry.getAttribute('velocity')
      const driftAttr = snowPoints.geometry.getAttribute('drift')
      if (posAttr && velAttr && driftAttr) {
        const positions = posAttr.array as Float32Array
        const velocities = velAttr.array as Float32Array
        const drifts = driftAttr.array as Float32Array

        for (let i = 0; i < 500; i++) {
          const idx0 = i * 3
          const idx1 = i * 3 + 1
          const idx2 = i * 3 + 2
          drifts[i] = (drifts[i] ?? 0) + dt * 0.5
          positions[idx0] = (positions[idx0] ?? 0) + Math.sin(drifts[i] ?? 0) * dt * 0.3 + windStrength * dt * 0.1
          positions[idx1] = (positions[idx1] ?? 0) - (velocities[i] ?? 0) * dt
          positions[idx2] = (positions[idx2] ?? 0) + Math.cos(drifts[i] ?? 0) * dt * 0.3

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

    rainMaterial.opacity = clamp(weatherIntensity * 0.6, 0, 0.6)
    dustMaterial.opacity = clamp(0.15 * (1 - weatherIntensity * 0.5), 0, 0.15)
    snowMaterial.opacity = weather === 'snow' ? 0.8 : 0
  })

  return (
    <group>
      <points ref={rainRef} geometry={rainGeometry} material={rainMaterial} frustumCulled={false} />
      <points ref={dustRef} geometry={dustGeometry} material={dustMaterial} frustumCulled={false} />
      <points ref={splashRef} geometry={splashGeometry} material={splashMaterial} frustumCulled={false} />
      <points ref={snowRef} geometry={snowGeometry} material={snowMaterial} frustumCulled={false} />
      <group ref={rippleGroupRef}>
        {rippleData.current.map((rd, i) =>
          rd.mesh ? <primitive key={`ripple-${i}`} object={rd.mesh} /> : null
        )}
      </group>
    </group>
  )
}
