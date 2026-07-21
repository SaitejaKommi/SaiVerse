export type ChunkID = string
export type SurfaceType = 'grass' | 'road' | 'pavement' | 'plaza' | 'dirt'
export type WeatherType = 'clear' | 'cloudy' | 'rainy' | 'foggy' | 'stormy' | 'snow'
export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night'

export interface ChunkBounds {
  x: number
  z: number
  size: number
}

export interface WorldChunk {
  id: ChunkID
  bounds: ChunkBounds
  isLoaded: boolean
  isVisible: boolean
  priority: number
  lastActiveTime: number
}

export interface TerrainTile {
  x: number
  z: number
  width: number
  depth: number
  surface: SurfaceType
  height: number
}

export interface RoadSegment {
  id: string
  start: [number, number]
  end: [number, number]
  width: number
  surface: SurfaceType
}

export interface Waypoint {
  id: string
  name: string
  position: [number, number, number]
  isUnlocked: boolean
  district?: string
}

export interface SpawnPoint {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  label: string
  isActive: boolean
}

export interface WorldState {
  chunks: ChunkID[]
  activeWaypoints: string[]
  discoveredLocations: string[]
  worldTime: number
  worldWeather: WeatherType
}

export interface NavMeshCell {
  id: number
  center: [number, number]
  vertices: [number, number][]
  neighbors: number[]
  walkable: boolean
}

export interface InteractiveObjectData {
  id: string
  type: string
  position: [number, number, number]
  radius: number
  isActive: boolean
  isInteractable: boolean
  data?: Record<string, unknown>
}

export interface FastTravelNode {
  id: string
  name: string
  position: [number, number, number]
  connections: string[]
  isUnlocked: boolean
  unlockCondition?: string
}

export interface WeatherState {
  current: WeatherType
  target: WeatherType
  transitionProgress: number
  intensity: number
  windStrength: number
  visibility: number
}

export interface SkyState {
  sunPosition: [number, number, number]
  sunIntensity: number
  ambientColor: string
  horizonColor: string
  zenithColor: string
  cloudCoverage: number
  starIntensity: number
}
