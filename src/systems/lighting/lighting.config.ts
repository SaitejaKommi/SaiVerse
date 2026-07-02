export const LIGHTING_CONFIG = {
  HEMISPHERE_SKY_COLOR: '#87ceeb',
  HEMISPHERE_GROUND_COLOR: '#1a1a2e',
  HEMISPHERE_INTENSITY: 0.6,
  AMBIENT_INTENSITY: 0.3,
  SUN_INTENSITY: 1.5,
  SUN_POSITION: [50, 30, 20] as [number, number, number],
  SHADOW_MAP_SIZE: 2048,
  SHADOW_BIAS: -0.001,
  SHADOW_NORMAL_BIAS: 0.02,
  NIGHT_SUN_INTENSITY: 0.1,
  NIGHT_AMBIENT_INTENSITY: 0.05,
  NIGHT_HEMISPHERE_INTENSITY: 0.1,
  DAY_DURATION: 120,
  NIGHT_DURATION: 60,
  TRANSITION_DURATION: 10,
} as const

export const ENVIRONMENT_PRESETS = [
  'sunset',
  'dawn',
  'night',
  'warehouse',
  'forest',
  'apartment',
  'studio',
  'city',
  'park',
  'lobby',
] as const

export type EnvironmentPreset = typeof ENVIRONMENT_PRESETS[number]
