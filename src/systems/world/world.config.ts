interface WorldConfig {
  CHUNK_SIZE: number
  LOAD_RADIUS: number
  UNLOAD_RADIUS: number
  MAX_LOADED_CHUNKS: number
  CHUNK_UNLOAD_DELAY: number
  TERRAIN_SEGMENTS: number
  TERRAIN_SIZE: number
}

interface TerrainColors {
  grass: string
  road: string
  pavement: string
  plaza: string
  dirt: string
}

interface RoadConfig {
  DEFAULT_WIDTH: number
  MIN_SEGMENT_LENGTH: number
  MAX_SEGMENT_LENGTH: number
  INTERSECTION_SIZE: number
}

interface WeatherConfig {
  TRANSITION_DURATION: number
  RAIN_INTENSITY: number
  FOG_VISIBILITY: number
  WIND_STRENGTH: number
  STORM_WIND: number
}

interface SkyConfig {
  STAR_COUNT: number
  STAR_FIELD_SIZE: number
  CLOUD_LAYERS: number
  SUN_SPHERE_SIZE: number
  MOON_SPHERE_SIZE: number
}

interface SpawnConfig {
  DEFAULT_SPAWN: string
  MAX_SPAWNS: number
}

interface FastTravelConfig {
  MIN_NODE_DISTANCE: number
  MAX_CONNECTIONS: number
  TRANSITION_DURATION: number
}

interface InteractiveConfig {
  PROMPT_DISTANCE: number
  MAX_INTERACTABLES: number
  HIGHLIGHT_COLOR: string
}

export const WORLD_CONFIG: WorldConfig = {
  CHUNK_SIZE: 50,
  LOAD_RADIUS: 3,
  UNLOAD_RADIUS: 5,
  MAX_LOADED_CHUNKS: 25,
  CHUNK_UNLOAD_DELAY: 5000,
  TERRAIN_SEGMENTS: 1,
  TERRAIN_SIZE: 50,
}

export const TERRAIN_COLORS: TerrainColors = {
  grass: '#4a7c59',
  road: '#3a3a3a',
  pavement: '#5a5a5a',
  plaza: '#6a6a6a',
  dirt: '#6b4a3a',
}

export const ROAD_CONFIG: RoadConfig = {
  DEFAULT_WIDTH: 6,
  MIN_SEGMENT_LENGTH: 2,
  MAX_SEGMENT_LENGTH: 50,
  INTERSECTION_SIZE: 2,
}

export const WEATHER_CONFIG: WeatherConfig = {
  TRANSITION_DURATION: 3,
  RAIN_INTENSITY: 0.6,
  FOG_VISIBILITY: 30,
  WIND_STRENGTH: 2,
  STORM_WIND: 8,
}

export const SKY_CONFIG: SkyConfig = {
  STAR_COUNT: 2000,
  STAR_FIELD_SIZE: 500,
  CLOUD_LAYERS: 2,
  SUN_SPHERE_SIZE: 20,
  MOON_SPHERE_SIZE: 8,
}

export const SPAWN_CONFIG: SpawnConfig = {
  DEFAULT_SPAWN: 'hub-center',
  MAX_SPAWNS: 20,
}

export const FAST_TRAVEL_CONFIG: FastTravelConfig = {
  MIN_NODE_DISTANCE: 20,
  MAX_CONNECTIONS: 4,
  TRANSITION_DURATION: 1.5,
}

export const INTERACTIVE_CONFIG: InteractiveConfig = {
  PROMPT_DISTANCE: 3,
  MAX_INTERACTABLES: 50,
  HIGHLIGHT_COLOR: '#00d4ff',
}
