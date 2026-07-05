'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

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

  const skyRef = useRef<THREE.Mesh>(null)
  const sunRef = useRef<THREE.Mesh>(null)
  const skyMatRef = useRef<THREE.ShaderMaterial>(null)
  const sunMatRef = useRef<THREE.MeshBasicMaterial>(null)

  const sunAngle = ((timeOfDay - 6) / 12) * Math.PI
  const sunX = Math.cos(sunAngle) * 80
  const sunY = Math.sin(sunAngle) * 80

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

  const sunMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: sunY > 0 ? 1 : 0,
    })
    sunMatRef.current = mat
    return mat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(() => {
    const mat = skyMatRef.current
    if (mat) {
      const c = getSkyColors(useGameStore.getState().world.timeOfDay)
      const topUniform = mat.uniforms['uTopColor']
      const bottomUniform = mat.uniforms['uBottomColor']
      if (topUniform) topUniform.value.set(c.zenith)
      if (bottomUniform) bottomUniform.value.set(c.horizon)
    }
    if (sunMatRef.current) {
      const angle = ((useGameStore.getState().world.timeOfDay - 6) / 12) * Math.PI
      const y = Math.sin(angle) * 80
      sunMatRef.current.opacity = y > 0 ? 1 : 0
    }
  })

  return (
    <group>
      <mesh ref={skyRef} geometry={skyGeometry} material={skyMaterial} />
      <mesh
        ref={sunRef}
        geometry={sunGeometry}
        material={sunMaterial}
        position={[sunX, Math.max(sunY, -10), -30]}
      />
    </group>
  )
}
