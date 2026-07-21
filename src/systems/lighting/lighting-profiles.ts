export type EnvironmentPreset = 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby'

export interface SupplementalPointLight {
  position: [number, number, number]
  color: string
  intensity: number
  distance: number
  decay?: number
}

export interface DistrictLightingProfile {
  id: string
  label: string

  environment: EnvironmentPreset
  environmentIntensity?: number

  ambient: { color: string; intensity: number }

  hemisphere: {
    skyColor: string
    groundColor: string
    intensity: number
  }

  sun: {
    position: [number, number, number]
    intensity: number
    color: string
    shadowBias?: number
    shadowNormalBias?: number
  }

  fog: {
    color: string
    near: number
    far: number
  }

  bloom?: {
    intensity: number
    threshold: number
  }

  reflectionIntensity?: number
  shadowSoftness?: number

  supplemental?: {
    pointLights?: SupplementalPointLight[]
  }
}

export type DistrictProfileId =
  | 'hub'
  | 'campus'
  | 'software-city'
  | 'ai-district'
  | 'open-source-valley'
  | 'hackathon-arena'
  | 'career-district'
  | 'final-summit'
