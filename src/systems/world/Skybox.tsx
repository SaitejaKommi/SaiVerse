'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cloud, Stars } from '@react-three/drei'

import * as THREE from 'three'
import { SKY_CONFIG } from './world.config'
import { useGameStore } from '@/stores/gameStore'

const DAWN_COLORS = {
  zenith: '#1a1a3e',
  horizon: '#e8845a',
  ambient: '#2a1a1e',
}

const DAY_COLORS = {
  zenith: '#0a0a2e',
  horizon: '#4a7a9a',
  ambient: '#1a1a2e',
}

const DUSK_COLORS = {
  zenith: '#1a0a2e',
  horizon: '#c86a3a',
  ambient: '#2a1a1e',
}

const NIGHT_COLORS = {
  zenith: '#000011',
  horizon: '#0a0a1a',
  ambient: '#050510',
}

function lerpColor(c1: string, c2: string, t: number): string {
  const a = new THREE.Color(c1)
  const b = new THREE.Color(c2)
  a.lerp(b, t)
  return `#${a.getHexString()}`
}

function getSkyColors(dayProgress: number) {
  if (dayProgress < 6) {
    const t = dayProgress / 6
    return {
      zenith: lerpColor(NIGHT_COLORS.zenith, DAWN_COLORS.zenith, t),
      horizon: lerpColor(NIGHT_COLORS.horizon, DAWN_COLORS.horizon, t),
      ambient: lerpColor(NIGHT_COLORS.ambient, DAWN_COLORS.ambient, t),
    }
  }
  if (dayProgress < 10) {
    const t = (dayProgress - 6) / 4
    return {
      zenith: lerpColor(DAWN_COLORS.zenith, DAY_COLORS.zenith, t),
      horizon: lerpColor(DAWN_COLORS.horizon, DAY_COLORS.horizon, t),
      ambient: lerpColor(DAWN_COLORS.ambient, DAY_COLORS.ambient, t),
    }
  }
  if (dayProgress < 18) {
    return { ...DAY_COLORS }
  }
  if (dayProgress < 20) {
    const t = (dayProgress - 18) / 2
    return {
      zenith: lerpColor(DAY_COLORS.zenith, DUSK_COLORS.zenith, t),
      horizon: lerpColor(DAY_COLORS.horizon, DUSK_COLORS.horizon, t),
      ambient: lerpColor(DAY_COLORS.ambient, DUSK_COLORS.ambient, t),
    }
  }
  if (dayProgress < 22) {
    const t = (dayProgress - 20) / 2
    return {
      zenith: lerpColor(DUSK_COLORS.zenith, NIGHT_COLORS.zenith, t),
      horizon: lerpColor(DUSK_COLORS.horizon, NIGHT_COLORS.horizon, t),
      ambient: lerpColor(DUSK_COLORS.ambient, NIGHT_COLORS.ambient, t),
    }
  }
  return { ...NIGHT_COLORS }
}

export function Skybox() {
  const timeOfDay = useGameStore((s) => s.world.timeOfDay)
  const weather = useGameStore((s) => s.world.weather)

  const skyRef = useRef<THREE.Mesh>(null)
  const sunRef = useRef<THREE.Mesh>(null)
  const sunGlowRef = useRef<THREE.Mesh>(null)
  const moonRef = useRef<THREE.Mesh>(null)
  const starsRef = useRef<THREE.Points>(null)
  const skyMatRef = useRef<THREE.ShaderMaterial>(null)
  const sunMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const sunGlowMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const moonMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const sunAngle = ((timeOfDay - 6) / 12) * Math.PI
  const sunX = Math.cos(sunAngle) * 80
  const sunY = Math.sin(sunAngle) * 80

  const moonAngle = ((timeOfDay - 18) / 12) * Math.PI
  const moonX = Math.cos(moonAngle) * 80
  const moonY = Math.sin(moonAngle) * 80

  const isNight = timeOfDay < 6 || timeOfDay >= 20
  const isDay = timeOfDay >= 6 && timeOfDay < 20

  const cloudOpacity = useMemo(() => {
    switch (weather) {
      case 'clear': return 0.12
      case 'cloudy': return 0.75
      case 'rainy': return 0.55
      case 'stormy': return 0.85
      case 'foggy': return 0.35
      default: return 0.12
    }
  }, [weather])

  const colors = getSkyColors(timeOfDay)

  const skyGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(450, 32, 32)
    return geo
  }, [])

  const skyMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uTopColor: { value: new THREE.Color(colors.zenith) },
        uBottomColor: { value: new THREE.Color(colors.horizon) },
        uOffset: { value: 20 },
        uExponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uBottomColor;
        uniform float uOffset;
        uniform float uExponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + uOffset).y;
          gl_FragColor = vec4(mix(uBottomColor, uTopColor, max(pow(max(h, 0.0), uExponent), 0.0)), 1.0);
        }
      `,
    })
    skyMatRef.current = mat
    return mat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sunGeometry = useMemo(() => new THREE.SphereGeometry(SKY_CONFIG.SUN_SPHERE_SIZE, 16, 16), [])
  const sunGlowGeometry = useMemo(() => new THREE.SphereGeometry(SKY_CONFIG.SUN_SPHERE_SIZE * 4, 16, 16), [])
  const moonGeometry = useMemo(() => new THREE.SphereGeometry(SKY_CONFIG.MOON_SPHERE_SIZE, 16, 16), [])

  const sunMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: sunY > 0 ? 1 : 0,
      depthWrite: false,
    })
    sunMatRef.current = mat
    return mat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sunGlowMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: '#ffdd88',
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    sunGlowMatRef.current = mat
    return mat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const moonMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#c8d0e0',
      emissive: '#8899bb',
      emissiveIntensity: 0.15,
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
    })
    moonMatRef.current = mat
    return mat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(() => {
    const mat = skyMatRef.current
    const now = useGameStore.getState().world.timeOfDay
    if (mat) {
      const c = getSkyColors(now)
      const topUniform = mat.uniforms['uTopColor']
      const bottomUniform = mat.uniforms['uBottomColor']
      if (topUniform) topUniform.value.set(c.zenith)
      if (bottomUniform) bottomUniform.value.set(c.horizon)
    }

    const angle = ((now - 6) / 12) * Math.PI
    const y = Math.sin(angle) * 80
    if (sunMatRef.current) {
      sunMatRef.current.opacity = y > 0 ? 1 : 0
    }
    if (sunGlowMatRef.current) {
      const dayGlow = isDay ? 0.06 + Math.sin(performance.now() * 0.001) * 0.02 : 0
      const glowOpacity = y > 0 ? dayGlow : 0
      sunGlowMatRef.current.opacity = glowOpacity
    }
    if (moonMatRef.current) {
      moonMatRef.current.opacity = isNight ? 0.6 : 0
    }
  })

  const starCount = isNight ? SKY_CONFIG.STAR_COUNT : 0

  return (
    <group>
      <mesh ref={skyRef} geometry={skyGeometry} material={skyMaterial} />

      {starCount > 0 && (
        <Stars
          ref={starsRef}
          radius={SKY_CONFIG.STAR_FIELD_SIZE}
          depth={50}
          count={SKY_CONFIG.STAR_COUNT}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
      )}

      {cloudOpacity > 0.02 && (
        <Cloud
          position={[0, 150, -100]}
          speed={0.3 + (weather === 'stormy' ? 0.4 : 0)}
          opacity={cloudOpacity}
          segments={24}
        />
      )}

      <mesh
        ref={sunRef}
        geometry={sunGeometry}
        material={sunMaterial}
        position={[sunX, Math.max(sunY, -10), -30]}
      />

      <mesh
        ref={sunGlowRef}
        geometry={sunGlowGeometry}
        material={sunGlowMaterial}
        position={[sunX, Math.max(sunY, -10), -30]}
      />

      <mesh
        ref={moonRef}
        geometry={moonGeometry}
        material={moonMaterial}
        position={[moonX, Math.max(moonY, -10), -30]}
      />
    </group>
  )
}
