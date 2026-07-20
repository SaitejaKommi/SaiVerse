import type { TerrainTile } from '@/systems/world/world.types'
import type { RoadSegment, SpawnPoint, FastTravelNode } from '@/systems/world/world.types'

export const SOFTWARE_CITY_CENTER: [number, number, number] = [0, 0, -250]

export const SOFTWARE_CITY_BOUNDS = {
  minX: -60,
  maxX: 60,
  minZ: -310,
  maxZ: -215,
}

export const SC_TERRAIN_TILES: TerrainTile[] = (() => {
  const tiles: TerrainTile[] = []
  const size = 50
  for (let i = -1; i <= 1; i++) {
    for (let j = -6; j <= 6; j++) {
      const cx = i * size + size / 2
      const cz = j * size + size / 2
      const dist = Math.sqrt(cx * cx + (cz + 250) * (cz + 250))
      let surface: 'plaza' | 'grass' | 'road' = 'grass'
      if (dist < 25) surface = 'plaza'
      else if (dist < 40) surface = 'road'
      tiles.push({ x: i, z: j, width: size, depth: size, surface, height: 0 })
    }
  }
  return tiles
})()

export interface SCBuildingData {
  position: [number, number, number]
  width: number
  depth: number
  height: number
  color: string
  roofColor?: string
  windowsColor?: string
  style?: 'classic' | 'flat' | 'modern'
}

const CYAN_WINDOWS = '#00d4ff'
const GREEN_WINDOWS = '#00ff88'
const PURPLE_WINDOWS = '#a855f7'

export const SC_BUILDINGS: SCBuildingData[] = [
  // Tech Hub (center)
  { position: [0, 0, -250], width: 14, depth: 10, height: 18, color: '#0f3460', roofColor: '#1a1a2e', windowsColor: CYAN_WINDOWS, style: 'modern' },

  // East office towers
  { position: [28, 0, -240], width: 8, depth: 8, height: 24, color: '#16213e', roofColor: '#1a1a2e', windowsColor: CYAN_WINDOWS, style: 'modern' },
  { position: [28, 0, -260], width: 8, depth: 8, height: 16, color: '#0f3460', roofColor: '#1a1a2e', windowsColor: GREEN_WINDOWS, style: 'flat' },
  { position: [42, 0, -250], width: 6, depth: 6, height: 12, color: '#1a1a2e', roofColor: '#16213e', windowsColor: PURPLE_WINDOWS, style: 'flat' },

  // West innovation hubs
  { position: [-28, 0, -240], width: 8, depth: 8, height: 20, color: '#16213e', roofColor: '#1a1a2e', windowsColor: GREEN_WINDOWS, style: 'modern' },
  { position: [-28, 0, -260], width: 8, depth: 8, height: 14, color: '#0f3460', roofColor: '#1a1a2e', windowsColor: CYAN_WINDOWS, style: 'flat' },
  { position: [-42, 0, -250], width: 6, depth: 6, height: 10, color: '#1a1a2e', roofColor: '#16213e', windowsColor: PURPLE_WINDOWS, style: 'flat' },

  // North data center
  { position: [0, 0, -275], width: 10, depth: 8, height: 8, color: '#0f3460', roofColor: '#1a1a2e', windowsColor: GREEN_WINDOWS, style: 'flat' },
  { position: [18, 0, -275], width: 6, depth: 6, height: 10, color: '#16213e', roofColor: '#1a1a2e', windowsColor: CYAN_WINDOWS, style: 'modern' },
  { position: [-18, 0, -275], width: 6, depth: 6, height: 10, color: '#16213e', roofColor: '#1a1a2e', windowsColor: CYAN_WINDOWS, style: 'modern' },

  // South gateway buildings
  { position: [-16, 0, -230], width: 6, depth: 6, height: 8, color: '#1a1a2e', roofColor: '#16213e', windowsColor: PURPLE_WINDOWS, style: 'flat' },
  { position: [16, 0, -230], width: 6, depth: 6, height: 8, color: '#1a1a2e', roofColor: '#16213e', windowsColor: PURPLE_WINDOWS, style: 'flat' },
]

export const SC_TREES: { position: [number, number, number]; variant?: number; scale?: number }[] = [
  { position: [-10, 0, -222], variant: 0, scale: 1.0 },
  { position: [10, 0, -222], variant: 1, scale: 1.0 },
  { position: [-8, 0, -278], variant: 2, scale: 0.8 },
  { position: [8, 0, -278], variant: 0, scale: 0.8 },
  { position: [-24, 0, -248], variant: 1, scale: 0.9 },
  { position: [24, 0, -248], variant: 2, scale: 0.9 },
  { position: [-35, 0, -255], variant: 0, scale: 0.7 },
  { position: [35, 0, -255], variant: 1, scale: 0.7 },
]

export const SC_LAMPS: { position: [number, number, number] }[] = [
  { position: [-8, 0, -222] },
  { position: [8, 0, -222] },
  { position: [-12, 0, -240] },
  { position: [12, 0, -240] },
  { position: [-12, 0, -260] },
  { position: [12, 0, -260] },
  { position: [-6, 0, -278] },
  { position: [6, 0, -278] },
]

export const SC_BENCHES: { position: [number, number, number]; rotation?: number }[] = [
  { position: [-14, 0, -222], rotation: 0 },
  { position: [14, 0, -222], rotation: Math.PI },
  { position: [-10, 0, -278], rotation: Math.PI / 2 },
  { position: [10, 0, -278], rotation: -Math.PI / 2 },
]

export const SC_PHONE_BOOTHS: { position: [number, number, number]; rotation?: number }[] = [
  { position: [-12, 0, -245], rotation: Math.PI / 2 },
  { position: [12, 0, -245], rotation: -Math.PI / 2 },
  { position: [-12, 0, -255], rotation: Math.PI / 2 },
  { position: [12, 0, -255], rotation: -Math.PI / 2 },
]

export const SC_BUS_STOPS: { position: [number, number, number]; rotation?: number }[] = [
  { position: [-20, 0, -225], rotation: Math.PI / 2 },
  { position: [20, 0, -225], rotation: -Math.PI / 2 },
]

export const SC_ROAD_SEGMENTS: RoadSegment[] = [
  // Main road from campus to Software City
  { id: 'sc-approach', start: [0, -210], end: [0, -222], width: 6, surface: 'road' },
  // Main boulevard
  { id: 'sc-main-ns', start: [0, -222], end: [0, -280], width: 6, surface: 'road' },
  // Cross streets
  { id: 'sc-cross-1', start: [-20, -240], end: [20, -240], width: 4, surface: 'road' },
  { id: 'sc-cross-2', start: [-20, -260], end: [20, -260], width: 4, surface: 'road' },
  // Side streets
  { id: 'sc-east-1', start: [20, -230], end: [45, -230], width: 3, surface: 'pavement' },
  { id: 'sc-west-1', start: [-20, -230], end: [-45, -230], width: 3, surface: 'pavement' },
  { id: 'sc-east-2', start: [20, -270], end: [45, -270], width: 3, surface: 'pavement' },
  { id: 'sc-west-2', start: [-20, -270], end: [-45, -270], width: 3, surface: 'pavement' },
]

export const SC_SPAWN_POINTS: SpawnPoint[] = [
  { id: 'sc-center', position: [0, 0, -250], rotation: [0, 0, 0], label: 'Software City Center', isActive: true },
  { id: 'sc-entrance', position: [0, 0, -215], rotation: [0, 0, 0], label: 'Software City Entrance', isActive: true },
]

export const SC_FAST_TRAVEL_NODES: FastTravelNode[] = [
  { id: 'ft-sc-center', name: 'Software City Center', position: [0, 0, -250], connections: ['ft-hub', 'ft-north'], isUnlocked: false, unlockCondition: 'chapter-2' },
]
