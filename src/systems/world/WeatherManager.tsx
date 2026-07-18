'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { WEATHER_CONFIG } from './world.config'
import type { WeatherType } from './world.types'

const WEATHER_CYCLES: { weather: WeatherType; minDuration: number; maxDuration: number }[] = [
  { weather: 'clear', minDuration: 30, maxDuration: 120 },
  { weather: 'cloudy', minDuration: 20, maxDuration: 60 },
  { weather: 'rainy', minDuration: 15, maxDuration: 45 },
  { weather: 'foggy', minDuration: 10, maxDuration: 30 },
]

interface WeatherManagerProps {
  enableCycle?: boolean
  initialWeather?: WeatherType
  cycleInterval?: [number, number]
}

const FOG_DENSITY_MAP: Record<WeatherType, number> = {
  clear: 0,
  cloudy: 0.002,
  foggy: 0.014,
  rainy: 0.005,
  stormy: 0.008,
}

export function WeatherManager({
  enableCycle = true,
  initialWeather,
  cycleInterval: _cycleInterval,
}: WeatherManagerProps) {
  const setWeather = useGameStore((s) => s.setWeather)
  const setWeatherIntensity = useGameStore((s) => s.setWeatherIntensity)
  const setWindStrength = useGameStore((s) => s.setWindStrength)
  const currentWeatherRef = useRef<WeatherType>(initialWeather ?? 'clear')
  const targetWeatherRef = useRef<WeatherType>('clear')
  const transitionRef = useRef(0)
  const isTransitioning = useRef(false)
  const timeInWeather = useRef(0)
  const nextChangeTime = useRef(60)
  const { scene } = useThree()
  const currentFogDensity = useRef(0)
  const fogRef = useRef<THREE.FogExp2 | null>(null)

  useEffect(() => {
    if (initialWeather) {
      currentWeatherRef.current = initialWeather
      setWeather(initialWeather)
    }
    nextChangeTime.current = 30 + Math.random() * 60
  }, [initialWeather, setWeather])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)

    if (enableCycle) {
      timeInWeather.current += dt

      if (timeInWeather.current >= nextChangeTime.current) {
        const available = WEATHER_CYCLES.filter((w) => w.weather !== currentWeatherRef.current)
        const next = available[Math.floor(Math.random() * available.length)]
        if (next) {
          targetWeatherRef.current = next.weather
          isTransitioning.current = true
          transitionRef.current = 0
        }

        timeInWeather.current = 0
        nextChangeTime.current = 30 + Math.random() * 60
      }
    }

    let targetFogDensity: number
    if (isTransitioning.current) {
      transitionRef.current += dt / WEATHER_CONFIG.TRANSITION_DURATION

      if (transitionRef.current >= 1) {
        transitionRef.current = 1
        currentWeatherRef.current = targetWeatherRef.current
        setWeather(targetWeatherRef.current)
        isTransitioning.current = false
      }

      const t = transitionRef.current
      const currentIntensity = getWeatherIntensity(currentWeatherRef.current)
      const targetIntensity = getWeatherIntensity(targetWeatherRef.current)
      const intensity = currentIntensity + (targetIntensity - currentIntensity) * t

      const currentFog = FOG_DENSITY_MAP[currentWeatherRef.current]
      const nextFog = FOG_DENSITY_MAP[targetWeatherRef.current]
      targetFogDensity = currentFog + (nextFog - currentFog) * t

      setWeatherIntensity(intensity)
      setWindStrength(getWindStrength(currentWeatherRef.current, targetWeatherRef.current, t))
    } else {
      const steadyIntensity = getWeatherIntensity(currentWeatherRef.current)
      targetFogDensity = FOG_DENSITY_MAP[currentWeatherRef.current]
      setWeatherIntensity(steadyIntensity)
      setWindStrength(getWindStrength(currentWeatherRef.current, currentWeatherRef.current, 0))
    }

    currentFogDensity.current += (targetFogDensity - currentFogDensity.current) * Math.min(dt * 2, 1)
    if (currentFogDensity.current > 0.001) {
      if (!fogRef.current) {
        fogRef.current = new THREE.FogExp2(0x0a0a1e, currentFogDensity.current)
        scene.fog = fogRef.current
      } else {
        fogRef.current.density = currentFogDensity.current
      }
    } else if (fogRef.current) {
      scene.fog = null
      fogRef.current = null
    }
  })

  return null
}

function getWeatherIntensity(weather: WeatherType): number {
  switch (weather) {
    case 'clear': return 0
    case 'cloudy': return 0.3
    case 'foggy': return 0.5
    case 'rainy': return 0.7
    case 'stormy': return 1
    default: return 0
  }
}

function getWindStrength(
  current: WeatherType,
  target: WeatherType,
  t: number,
): number {
  const currentWind = WIND_MAP[current] ?? 0
  const targetWind = WIND_MAP[target] ?? 0
  return currentWind + (targetWind - currentWind) * t
}

const WIND_MAP: Record<WeatherType, number> = {
  clear: 0.5,
  cloudy: 2,
  foggy: 1,
  rainy: 4,
  stormy: 8,
}
