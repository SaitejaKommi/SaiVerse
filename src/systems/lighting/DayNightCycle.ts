import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { LIGHTING_CONFIG } from './lighting.config'
import type { DirectionalLight } from 'three'

export interface DayNightState {
  timeOfDay: number
  dayProgress: number
  isDay: boolean
  sunIntensity: number
  ambientIntensity: number
  hemisphereIntensity: number
}

interface DayNightCycleProps {
  sunRef?: React.RefObject<DirectionalLight | null>
  moonRef?: React.RefObject<DirectionalLight | null>
}

export function DayNightCycle({ sunRef, moonRef }: DayNightCycleProps) {
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
    let moonIntensity: number

    if (isDay) {
      const dayT = cycleProgress / (LIGHTING_CONFIG.DAY_DURATION / totalCycle)
      const sunriseFactor = Math.min(dayT / 0.1, 1)
      const sunsetFactor = Math.min((1 - dayT) / 0.1, 1)
      sunIntensity = LIGHTING_CONFIG.SUN_INTENSITY * Math.min(sunriseFactor, sunsetFactor)
      ambientIntensity = LIGHTING_CONFIG.AMBIENT_INTENSITY * (0.5 + 0.5 * Math.min(sunriseFactor, sunsetFactor))
      hemisphereIntensity = LIGHTING_CONFIG.HEMISPHERE_INTENSITY * (0.5 + 0.5 * Math.min(sunriseFactor, sunsetFactor))
      moonIntensity = 0
    } else {
      const nightT = (cycleProgress - LIGHTING_CONFIG.DAY_DURATION / totalCycle) / (LIGHTING_CONFIG.NIGHT_DURATION / totalCycle)
      const moonriseFactor = Math.min(nightT / 0.1, 1)
      const moonsetFactor = Math.min((1 - nightT) / 0.1, 1)
      const nightFactor = Math.min(moonriseFactor, moonsetFactor)
      sunIntensity = LIGHTING_CONFIG.NIGHT_SUN_INTENSITY * nightFactor
      ambientIntensity = LIGHTING_CONFIG.NIGHT_AMBIENT_INTENSITY
      hemisphereIntensity = LIGHTING_CONFIG.NIGHT_HEMISPHERE_INTENSITY
      moonIntensity = LIGHTING_CONFIG.MOON_INTENSITY * nightFactor
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

    // Update sun directional light position and intensity
    if (sunRef?.current) {
      const sunAngle = ((dayProgress - 6) / 12) * Math.PI
      const radius = LIGHTING_CONFIG.SUN_ORBIT_RADIUS
      sunRef.current.position.set(
        Math.cos(sunAngle) * radius,
        Math.max(Math.sin(sunAngle) * radius * 0.6 + LIGHTING_CONFIG.SUN_HEIGHT_OFFSET, -10),
        -30,
      )
      sunRef.current.intensity = sunIntensity
    }

    // Update moon directional light position and intensity
    if (moonRef?.current) {
      const moonAngle = ((dayProgress - 18) / 12) * Math.PI
      const radius = LIGHTING_CONFIG.SUN_ORBIT_RADIUS
      moonRef.current.position.set(
        Math.cos(moonAngle) * radius,
        Math.max(Math.sin(moonAngle) * radius * 0.6 + LIGHTING_CONFIG.SUN_HEIGHT_OFFSET, -10),
        -30,
      )
      moonRef.current.intensity = moonIntensity
    }

    // Update ambient and hemisphere lights via scene traversal
    scene.traverse((child) => {
      if ((child as THREE.Light).isLight) {
        const light = child as THREE.Light
        if (light.type === 'AmbientLight') {
          light.intensity = stateRef.current.ambientIntensity
        } else if (light.type === 'HemisphereLight') {
          light.intensity = stateRef.current.hemisphereIntensity
        }
      }
    })
  })

  return null
}
