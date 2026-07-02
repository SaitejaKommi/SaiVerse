export type DistrictID = string & { __brand: 'District' }

export function createDistrictID(id: string): DistrictID {
  return id as DistrictID
}

export interface DistrictConfig {
  id: DistrictID
  name: string
  description: string
  position: [number, number, number]
  requiredKnowledge: number
  loadingRadius: number
  activeRadius: number
  spawnPoint: [number, number, number]
  ambientMusic: string
  weather: WeatherConfig
}

export interface WeatherConfig {
  type: 'clear' | 'cloudy' | 'rainy' | 'foggy'
  intensity: number
  transitionDuration: number
}

export type DistrictLifecycle = 'unloaded' | 'loading' | 'active' | 'unloading'

export interface DistrictState {
  id: DistrictID
  lifecycle: DistrictLifecycle
  loadProgress: number
  error?: string
}
