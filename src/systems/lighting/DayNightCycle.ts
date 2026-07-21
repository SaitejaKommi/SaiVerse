import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useLightingStore } from '@/stores/lightingStore'
import { DISTRICT_LIGHTING_PROFILES } from './lighting-profiles.config'
import { LIGHTING_CONFIG } from './lighting.config'

export interface DayNightState {
  timeOfDay: number
  dayProgress: number
  isDay: boolean
  sunIntensity: number
  ambientIntensity: number
  hemisphereIntensity: number
}

export function DayNightCycle() {
  const timeRef = useRef(LIGHTING_CONFIG.NIGHT_DURATION)
  const stateRef = useRef<DayNightState>({
    timeOfDay: 12,
    dayProgress: 0.5,
    isDay: true,
    sunIntensity: LIGHTING_CONFIG.SUN_INTENSITY,
    ambientIntensity: LIGHTING_CONFIG.AMBIENT_INTENSITY,
    hemisphereIntensity: LIGHTING_CONFIG.HEMISPHERE_INTENSITY,
  })

  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay)
  const profileId = useLightingStore((s) => s.activeProfile)
  const { scene } = useThree()

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    timeRef.current += dt

    const totalCycle = LIGHTING_CONFIG.DAY_DURATION + LIGHTING_CONFIG.NIGHT_DURATION
    const cycleProgress = (timeRef.current % totalCycle) / totalCycle

    const dayProgress = cycleProgress * 24
    const isDay = cycleProgress < LIGHTING_CONFIG.DAY_DURATION / totalCycle

    let sunIntensity: number
    let ambientIntensity: number
    let hemisphereIntensity: number

    if (isDay) {
      const dayT = cycleProgress / (LIGHTING_CONFIG.DAY_DURATION / totalCycle)
      const sunriseFactor = Math.min(dayT / 0.1, 1)
      const sunsetFactor = Math.min((1 - dayT) / 0.1, 1)
      const dayCurve = Math.min(sunriseFactor, sunsetFactor)
      sunIntensity = LIGHTING_CONFIG.SUN_INTENSITY * dayCurve
      ambientIntensity = LIGHTING_CONFIG.AMBIENT_INTENSITY * (0.5 + 0.5 * dayCurve)
      hemisphereIntensity = LIGHTING_CONFIG.HEMISPHERE_INTENSITY * (0.5 + 0.5 * dayCurve)
    } else {
      const nightT = (cycleProgress - LIGHTING_CONFIG.DAY_DURATION / totalCycle) / (LIGHTING_CONFIG.NIGHT_DURATION / totalCycle)
      const moonriseFactor = Math.min(nightT / 0.1, 1)
      const moonsetFactor = Math.min((1 - nightT) / 0.1, 1)
      const nightFactor = Math.min(moonriseFactor, moonsetFactor)
      sunIntensity = LIGHTING_CONFIG.NIGHT_SUN_INTENSITY * nightFactor
      ambientIntensity = LIGHTING_CONFIG.NIGHT_AMBIENT_INTENSITY
      hemisphereIntensity = LIGHTING_CONFIG.NIGHT_HEMISPHERE_INTENSITY
    }

    stateRef.current = {
      timeOfDay: dayProgress,
      dayProgress: cycleProgress,
      isDay,
      sunIntensity,
      ambientIntensity,
      hemisphereIntensity,
    }

    setTimeOfDay(dayProgress)

    const profile = DISTRICT_LIGHTING_PROFILES[profileId]
    if (!profile) return

    const sunAngle = ((dayProgress - 6) / 12) * Math.PI
    const radius = LIGHTING_CONFIG.SUN_ORBIT_RADIUS

    scene.traverse((child) => {
      if (!(child as THREE.Light).isLight) return
      const light = child as THREE.Light

      if (light.type === 'DirectionalLight' && (child as THREE.DirectionalLight).castShadow) {
        const dirLight = child as THREE.DirectionalLight
        dirLight.position.set(
          Math.cos(sunAngle) * radius,
          Math.max(Math.sin(sunAngle) * radius * 0.6 + (profile.sun.position[1] * 0.3), -10),
          profile.sun.position[2],
        )
        dirLight.intensity = sunIntensity
      } else if (light.type === 'AmbientLight') {
        light.intensity = ambientIntensity
      } else if (light.type === 'HemisphereLight') {
        light.intensity = hemisphereIntensity
      }
    })
  })

  return null
}
