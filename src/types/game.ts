export type PlayerState = 'idle' | 'walking' | 'running' | 'jumping' | 'falling'

export interface PlayerData {
  position: [number, number, number]
  rotation: [number, number, number]
  velocity: [number, number, number]
  state: PlayerState
  isGrounded: boolean
}

export interface WorldData {
  timeOfDay: number
  dayProgress: number
  weather: WeatherType
  currentDistrict: string | null
  activeScenes: string[]
  discoveredLocations: string[]
  activeWaypoints: string[]
  weatherIntensity: number
  windStrength: number
}

export type WeatherType = 'clear' | 'cloudy' | 'rainy' | 'foggy' | 'stormy'

export type FinalePhase = 'idle' | 'pullback' | 'dialogue' | 'rewards' | 'complete_show' | 'teaser' | 'done'

export interface GameState {
  player: PlayerData
  world: WorldData
  isPaused: boolean
  isInitialized: boolean
  isCinematic: boolean
  finalePhase: FinalePhase
}

export interface CameraSettings {
  sensitivity: number
  invertY: boolean
  fov: number
  zoomLevel: number
  distance: number
  heightOffset: number
  lookSmoothing: number
  positionSmoothing: number
  collisionEnabled: boolean
}

export interface AudioSettings {
  master: number
  music: number
  sfx: number
  voice: number
  muted: boolean
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra'
  shadows: boolean
  postProcessing: boolean
  pixelRatio: number
  shadowResolution: number
}

export interface ControlSettings {
  sensitivity: number
  invertY: boolean
  keyBindings: Record<string, string>
}

export interface SettingsData {
  audio: AudioSettings
  graphics: GraphicsSettings
  controls: ControlSettings
  accessibility: {
    subtitles: boolean
    highContrast: boolean
    reducedMotion: boolean
  }
}

export interface SaveSlot {
  id: string
  timestamp: number
  playTime: number
  screenshot?: string
  data: SaveData
}

export interface SaveData {
  player: PlayerData
  version: number
  timestamp: number
}

export interface GameEvent {
  type: string
  payload?: unknown
}

export type SceneID = string

export interface SceneDefinition {
  id: SceneID
  name: string
  priority: number
}
