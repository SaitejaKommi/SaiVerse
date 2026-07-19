interface WorldConfig {
  CHUNK_SIZE: number
  LOAD_RADIUS: number
  UNLOAD_RADIUS: number
  MAX_LOADED_CHUNKS: number
  CHUNK_UNLOAD_DELAY: number
  TERRAIN_SEGMENTS: number
  TERRAIN_SIZE: number
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
  TERRAIN_SEGMENTS: 8,
  TERRAIN_SIZE: 50,
}

export type TextureStyle = 'none' | 'noise' | 'grid'

export interface SurfaceMaterialConfig {
  color: string
  roughness: number
  metalness: number
  texture?: TextureStyle
}

export type DistrictTerrainConfig = {
  grass: SurfaceMaterialConfig
  road: SurfaceMaterialConfig
  pavement: SurfaceMaterialConfig
  plaza: SurfaceMaterialConfig
  dirt: SurfaceMaterialConfig
}

const defaultSurface = (color: string, extra?: Partial<SurfaceMaterialConfig>): SurfaceMaterialConfig => ({
  color,
  roughness: 0.9,
  metalness: 0,
  texture: 'noise',
  ...extra,
})

const roadSurface = (color: string): SurfaceMaterialConfig => ({
  color,
  roughness: 0.8,
  metalness: 0.1,
  texture: 'none',
})

const pavementSurface = (color: string, extra?: Partial<SurfaceMaterialConfig>): SurfaceMaterialConfig => ({
  color,
  roughness: 0.7,
  metalness: 0.05,
  texture: 'none',
  ...extra,
})

const plazaSurface = (color: string, extra?: Partial<SurfaceMaterialConfig>): SurfaceMaterialConfig => ({
  color,
  roughness: 0.6,
  metalness: 0.1,
  texture: 'none',
  ...extra,
})

const dirtSurface = (color: string): SurfaceMaterialConfig => ({
  color,
  roughness: 1,
  metalness: 0,
  texture: 'none',
})

export const DISTRICT_TERRAIN_CONFIG: Record<string, DistrictTerrainConfig> = {
  default: {
    grass: defaultSurface('#4a7c59'),
    road: roadSurface('#3a3a3a'),
    pavement: pavementSurface('#5a5a5a'),
    plaza: plazaSurface('#6a6a6a'),
    dirt: dirtSurface('#6b4a3a'),
  },
  hub: {
    grass: defaultSurface('#4a7c59'),
    road: roadSurface('#3a3a3a'),
    pavement: pavementSurface('#5a5a5a'),
    plaza: plazaSurface('#7a7a6a'),
    dirt: dirtSurface('#6b4a3a'),
  },
  campus: {
    grass: defaultSurface('#3a7a33'),
    road: roadSurface('#3a3a3a'),
    pavement: pavementSurface('#5a5a5a'),
    plaza: plazaSurface('#6a7a5a', { roughness: 0.7, metalness: 0.05 }),
    dirt: dirtSurface('#6b4a3a'),
  },
  'software-city': {
    grass: defaultSurface('#3a6a5a', { roughness: 0.85 }),
    road: roadSurface('#2a2a3a'),
    pavement: pavementSurface('#4a4a5a'),
    plaza: plazaSurface('#5a5a7a', { roughness: 0.5, metalness: 0.2 }),
    dirt: dirtSurface('#4a3a3a'),
  },
  'ai-district': {
    grass: defaultSurface('#1a1a2e', { roughness: 0.7 }),
    road: roadSurface('#1a1a2a'),
    pavement: pavementSurface('#2a2a4a', { roughness: 0.5, metalness: 0.3 }),
    plaza: plazaSurface('#2a2a3e', { roughness: 0.4, metalness: 0.4, texture: 'grid' }),
    dirt: dirtSurface('#1a1a2e'),
  },
  'open-source-valley': {
    grass: defaultSurface('#4a8a5a'),
    road: roadSurface('#3a3a3a'),
    pavement: pavementSurface('#5a6a5a', { roughness: 0.75, metalness: 0.05 }),
    plaza: plazaSurface('#6a8a6a', { roughness: 0.65, metalness: 0.05 }),
    dirt: dirtSurface('#5a4a3a'),
  },
  'hackathon-arena': {
    grass: defaultSurface('#3a5a4a'),
    road: roadSurface('#2a3a3a'),
    pavement: pavementSurface('#4a5a5a'),
    plaza: plazaSurface('#5a6a6a', { roughness: 0.55, metalness: 0.15 }),
    dirt: dirtSurface('#3a4a3a'),
  },
  'career-district': {
    grass: defaultSurface('#4a6a5a'),
    road: roadSurface('#3a3a4a'),
    pavement: pavementSurface('#5a5a6a', { roughness: 0.5, metalness: 0.2 }),
    plaza: plazaSurface('#6a6a7a', { roughness: 0.4, metalness: 0.25 }),
    dirt: dirtSurface('#4a3a4a'),
  },
  'final-summit': {
    grass: defaultSurface('#2a4a3a'),
    road: roadSurface('#2a2a3a'),
    pavement: pavementSurface('#3a3a5a', { roughness: 0.5, metalness: 0.2 }),
    plaza: plazaSurface('#4a4a6a', { roughness: 0.4, metalness: 0.3 }),
    dirt: dirtSurface('#2a3a2a'),
  },
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
