import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
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
      sunIntensity = LIGHTING_CONFIG.SUN_INTENSITY * Math.min(sunriseFactor, sunsetFactor)
      ambientIntensity = LIGHTING_CONFIG.AMBIENT_INTENSITY * (0.5 + 0.5 * Math.min(sunriseFactor, sunsetFactor))
      hemisphereIntensity = LIGHTING_CONFIG.HEMISPHERE_INTENSITY * (0.5 + 0.5 * Math.min(sunriseFactor, sunsetFactor))
    } else {
      const nightT = (cycleProgress - LIGHTING_CONFIG.DAY_DURATION / totalCycle) / (LIGHTING_CONFIG.NIGHT_DURATION / totalCycle)
      const moonriseFactor = Math.min(nightT / 0.1, 1)
      const moonsetFactor = Math.min((1 - nightT) / 0.1, 1)
      sunIntensity = LIGHTING_CONFIG.NIGHT_SUN_INTENSITY * Math.min(moonriseFactor, moonsetFactor)
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

    scene.traverse((child) => {
      if ((child as THREE.Light).isLight) {
        const light = child as THREE.Light
        if (light.type === 'DirectionalLight') {
          light.intensity = stateRef.current.sunIntensity
        } else if (light.type === 'AmbientLight') {
          light.intensity = stateRef.current.ambientIntensity
        } else if (light.type === 'HemisphereLight') {
          light.intensity = stateRef.current.hemisphereIntensity
        }
      }
    })
  })

  return null
}
