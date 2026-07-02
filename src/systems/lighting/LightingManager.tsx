'use client'

import { useRef } from 'react'
import { Environment } from '@react-three/drei'
import { DirectionalLight } from 'three'
import { LIGHTING_CONFIG } from './lighting.config'
import { DayNightCycle } from './DayNightCycle'
import type { EnvironmentPreset } from './lighting.config'

interface LightingManagerProps {
  preset?: EnvironmentPreset
  enableShadows?: boolean
  enableDayNight?: boolean
}

export function LightingManager({
  preset = 'night',
  enableShadows = true,
  enableDayNight = true,
}: LightingManagerProps) {
  const directionalRef = useRef<DirectionalLight>(null)

  return (
    <>
      {enableDayNight && <DayNightCycle />}

      <ambientLight
        intensity={LIGHTING_CONFIG.AMBIENT_INTENSITY}
        color="#404060"
      />

      <hemisphereLight
        args={[
          LIGHTING_CONFIG.HEMISPHERE_SKY_COLOR,
          LIGHTING_CONFIG.HEMISPHERE_GROUND_COLOR,
          LIGHTING_CONFIG.HEMISPHERE_INTENSITY,
        ]}
      />

      <directionalLight
        ref={directionalRef}
        position={LIGHTING_CONFIG.SUN_POSITION}
        intensity={LIGHTING_CONFIG.SUN_INTENSITY}
        castShadow={enableShadows}
        shadow-mapSize-width={LIGHTING_CONFIG.SHADOW_MAP_SIZE}
        shadow-mapSize-height={LIGHTING_CONFIG.SHADOW_MAP_SIZE}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={LIGHTING_CONFIG.SHADOW_BIAS}
        shadow-normalBias={LIGHTING_CONFIG.SHADOW_NORMAL_BIAS}
      />

      <Environment preset={preset} />
    </>
  )
}
