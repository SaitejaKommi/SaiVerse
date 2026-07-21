'use client'

import { useRef } from 'react'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useLightingStore } from '@/stores/lightingStore'
import { DISTRICT_LIGHTING_PROFILES } from './lighting-profiles.config'
import { DayNightCycle } from './DayNightCycle'

export function DistrictLighting() {
  const profileId = useLightingStore((s) => s.activeProfile)
  const profile = DISTRICT_LIGHTING_PROFILES[profileId]!
  const sunRef = useRef<THREE.DirectionalLight>(null)

  return (
    <>
      <DayNightCycle />

      <fog attach="fog" args={[profile.fog.color, profile.fog.near, profile.fog.far]} />

      <ambientLight
        color={profile.ambient.color}
        intensity={profile.ambient.intensity}
      />

      <hemisphereLight
        args={[
          profile.hemisphere.skyColor,
          profile.hemisphere.groundColor,
          profile.hemisphere.intensity,
        ]}
      />

      <directionalLight
        ref={sunRef}
        position={profile.sun.position}
        intensity={profile.sun.intensity}
        color={profile.sun.color}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={profile.sun.shadowBias ?? -0.001}
        shadow-normalBias={profile.sun.shadowNormalBias ?? 0.02}
      />

      <group key={profileId + '-supplemental'}>
        {profile.supplemental?.pointLights?.map((pl, i) => (
          <pointLight
            key={i}
            position={pl.position}
            color={pl.color}
            intensity={pl.intensity}
            distance={pl.distance}
            decay={pl.decay ?? 2}
          />
        ))}
      </group>

      <Environment
        preset={profile.environment}
        environmentIntensity={profile.environmentIntensity ?? 1}
      />
    </>
  )
}
