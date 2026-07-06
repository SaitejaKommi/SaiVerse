import type { TerrainTile } from '@/systems/world/world.types'
import type { RoadSegment, SpawnPoint, FastTravelNode } from '@/systems/world/world.types'

export const HUB_CENTER: [number, number, number] = [0, 0, 0]
export const CAMPUS_ENTRANCE_POSITION: [number, number, number] = [0, 0, -100]

export const HUB_BOUNDS = {
  minX: -120,
  maxX: 120,
  minZ: -130,
  maxZ: 120,
}

export const TERRAIN_TILES: TerrainTile[] = (() => {
  const tiles: TerrainTile[] = []
  const size = 50
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 11; j++) {
      const x = i - 5
      const z = j - 5
      const cx = x * size + size / 2
      const cz = z * size + size / 2
      const dist = Math.sqrt(cx * cx + cz * cz)
      let surface: 'plaza' | 'grass' | 'road' = 'grass'
      if (dist < 30) surface = 'plaza'
      else if (dist < 45) surface = 'road'
      tiles.push({ x, z, width: size, depth: size, surface, height: 0 })
    }
  }
  return tiles
})()

export interface BuildingData {
  position: [number, number, number]
  width: number
  depth: number
  height: number
  color: string
  roofColor?: string
  windowsColor?: string
  style?: 'classic' | 'flat' | 'modern'
}

const GLASS_WINDOWS = '#88ccff'
const WARM_WINDOWS = '#ffdd88'

export const BUILDINGS: BuildingData[] = [
  // === CENTER DISTRICT (around plaza) ===
  { position: [-22, 0, -22], width: 10, depth: 10, height: 8, color: '#4a5568', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [-22, 0, 0], width: 10, depth: 8, height: 10, color: '#5b6e8a', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [-22, 0, 22], width: 10, depth: 10, height: 6, color: '#4a5568', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [22, 0, -22], width: 10, depth: 10, height: 10, color: '#3182ce', roofColor: '#2b6cb0', windowsColor: GLASS_WINDOWS, style: 'flat' },
  { position: [22, 0, 0], width: 12, depth: 8, height: 14, color: '#4299e1', roofColor: '#2b6cb0', windowsColor: GLASS_WINDOWS, style: 'modern' },
  { position: [22, 0, 22], width: 10, depth: 10, height: 8, color: '#3182ce', roofColor: '#2b6cb0', windowsColor: GLASS_WINDOWS, style: 'flat' },
  { position: [0, 0, -22], width: 14, depth: 8, height: 12, color: '#3b5998', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [0, 0, 22], width: 12, depth: 8, height: 8, color: '#c05621', roofColor: '#8b4513', windowsColor: WARM_WINDOWS },

  // === NORTH DISTRICT: Academic Row (z = -35 to -55) ===
  { position: [-18, 0, -35], width: 8, depth: 8, height: 10, color: '#4a5568', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [18, 0, -35], width: 8, depth: 8, height: 10, color: '#3b5998', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [-16, 0, -48], width: 6, depth: 6, height: 8, color: '#5b6e8a', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [16, 0, -48], width: 6, depth: 6, height: 6, color: '#4a5568', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [-12, 0, -58], width: 5, depth: 5, height: 6, color: '#6b7280', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [12, 0, -58], width: 5, depth: 5, height: 5, color: '#4a5568', roofColor: '#2d3748', windowsColor: GLASS_WINDOWS },
  { position: [0, 0, -42], width: 6, depth: 6, height: 14, color: '#3b5998', roofColor: '#1a202c', windowsColor: GLASS_WINDOWS, style: 'modern' },

  // === SOUTH DISTRICT: Market Square (z = 35 to 55) ===
  { position: [-16, 0, 35], width: 8, depth: 6, height: 6, color: '#c05621', roofColor: '#8b4513', windowsColor: WARM_WINDOWS },
  { position: [16, 0, 35], width: 8, depth: 6, height: 7, color: '#d4813a', roofColor: '#8b4513', windowsColor: WARM_WINDOWS },
  { position: [-20, 0, 45], width: 6, depth: 6, height: 5, color: '#e8a84c', roofColor: '#8b4513', windowsColor: WARM_WINDOWS },
  { position: [20, 0, 45], width: 6, depth: 6, height: 6, color: '#b8452e', roofColor: '#8b4513', windowsColor: WARM_WINDOWS },
  { position: [-10, 0, 52], width: 5, depth: 5, height: 4, color: '#8b4513', roofColor: '#5c3a1e', windowsColor: WARM_WINDOWS },
  { position: [10, 0, 52], width: 5, depth: 5, height: 5, color: '#c05621', roofColor: '#8b4513', windowsColor: WARM_WINDOWS },
  { position: [0, 0, 42], width: 10, depth: 6, height: 8, color: '#d4813a', roofColor: '#8b4513', windowsColor: WARM_WINDOWS },

  // === EAST DISTRICT: Tech Park (x = 35 to 55) ===
  { position: [35, 0, -15], width: 8, depth: 8, height: 14, color: '#2b6cb0', roofColor: '#1a365d', windowsColor: GLASS_WINDOWS, style: 'modern' },
  { position: [45, 0, -15], width: 6, depth: 6, height: 10, color: '#4299e1', roofColor: '#2b6cb0', windowsColor: GLASS_WINDOWS, style: 'flat' },
  { position: [35, 0, 15], width: 8, depth: 8, height: 12, color: '#3182ce', roofColor: '#2b6cb0', windowsColor: GLASS_WINDOWS, style: 'modern' },
  { position: [45, 0, 15], width: 6, depth: 6, height: 8, color: '#553c9a', roofColor: '#44337a', windowsColor: GLASS_WINDOWS, style: 'flat' },
  { position: [40, 0, 0], width: 6, depth: 6, height: 18, color: '#6b46c1', roofColor: '#44337a', windowsColor: GLASS_WINDOWS, style: 'modern' },

  // === WEST DISTRICT: Innovation Quarter (x = -35 to -55) ===
  { position: [-35, 0, -15], width: 8, depth: 8, height: 12, color: '#553c9a', roofColor: '#44337a', windowsColor: GLASS_WINDOWS, style: 'modern' },
  { position: [-45, 0, -15], width: 6, depth: 6, height: 8, color: '#6b46c1', roofColor: '#44337a', windowsColor: GLASS_WINDOWS, style: 'flat' },
  { position: [-35, 0, 15], width: 8, depth: 8, height: 14, color: '#553c9a', roofColor: '#44337a', windowsColor: GLASS_WINDOWS, style: 'modern' },
  { position: [-45, 0, 15], width: 6, depth: 6, height: 10, color: '#6b46c1', roofColor: '#44337a', windowsColor: GLASS_WINDOWS, style: 'flat' },
  { position: [-40, 0, 0], width: 6, depth: 6, height: 16, color: '#805ad5', roofColor: '#553c9a', windowsColor: GLASS_WINDOWS, style: 'modern' },
]

export const TREES: { position: [number, number, number]; variant?: number; scale?: number }[] = [
  // Plaza ring
  ...Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2
    return { position: [Math.cos(angle) * 16, 0, Math.sin(angle) * 16] as [number, number, number], variant: i % 3 }
  }),
  // North boulevard
  { position: [-5, 0, -28], variant: 0, scale: 1.2 },
  { position: [5, 0, -28], variant: 1, scale: 1.2 },
  { position: [-7, 0, -38], variant: 2, scale: 1.5 },
  { position: [7, 0, -38], variant: 0, scale: 1.5 },
  { position: [-6, 0, -52], variant: 1, scale: 1.2 },
  { position: [6, 0, -52], variant: 2, scale: 1.2 },
  { position: [-5, 0, -62], variant: 0 },
  { position: [5, 0, -62], variant: 1 },
  { position: [-8, 0, -72], variant: 2, scale: 1.3 },
  { position: [8, 0, -72], variant: 0, scale: 1.3 },
  { position: [-6, 0, -82], variant: 1 },
  { position: [6, 0, -82], variant: 2 },
  { position: [-4, 0, -92], variant: 0, scale: 0.8 },
  { position: [4, 0, -92], variant: 1, scale: 0.8 },
  // South market
  { position: [-10, 0, 30], variant: 2, scale: 0.8 },
  { position: [10, 0, 30], variant: 0, scale: 0.8 },
  { position: [-14, 0, 42], variant: 1 },
  { position: [14, 0, 42], variant: 2 },
  { position: [-12, 0, 54], variant: 0, scale: 0.9 },
  { position: [12, 0, 54], variant: 1, scale: 0.9 },
  // East tech park
  { position: [28, 0, -8], variant: 1, scale: 1.2 },
  { position: [28, 0, 8], variant: 2, scale: 1.2 },
  { position: [50, 0, -22], variant: 0 },
  { position: [50, 0, 22], variant: 1 },
  { position: [52, 0, -8], variant: 2, scale: 0.8 },
  { position: [52, 0, 8], variant: 0, scale: 0.8 },
  // West innovation
  { position: [-28, 0, -8], variant: 2, scale: 1.3 },
  { position: [-28, 0, 8], variant: 0, scale: 1.3 },
  { position: [-50, 0, -22], variant: 1 },
  { position: [-50, 0, 22], variant: 2 },
  { position: [-52, 0, -8], variant: 0, scale: 0.8 },
  { position: [-52, 0, 8], variant: 1, scale: 0.8 },
  // Boundary tree lines
  ...Array.from({ length: 10 }, (_, i) => ({
    position: [-100, 0, -80 + i * 18] as [number, number, number], variant: i % 3
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    position: [100, 0, -80 + i * 18] as [number, number, number], variant: (i + 1) % 3
  })),
]

export const LAMPS: { position: [number, number, number] }[] = [
  // Plaza ring
  ...Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    return { position: [Math.cos(angle) * 20, 0, Math.sin(angle) * 20] as [number, number, number] }
  }),
  // North boulevard
  { position: [0, 0, -28] },
  { position: [0, 0, -38] },
  { position: [0, 0, -48] },
  { position: [0, 0, -58] },
  { position: [0, 0, -68] },
  { position: [0, 0, -78] },
  { position: [0, 0, -88] },
  // South street
  { position: [-6, 0, 32] },
  { position: [6, 0, 32] },
  { position: [-8, 0, 44] },
  { position: [8, 0, 44] },
  // East street
  { position: [28, 0, -5] },
  { position: [28, 0, 5] },
  { position: [42, 0, -6] },
  { position: [42, 0, 6] },
  // West street
  { position: [-28, 0, -5] },
  { position: [-28, 0, 5] },
  { position: [-42, 0, -6] },
  { position: [-42, 0, 6] },
]

export const BENCHES: { position: [number, number, number]; rotation?: number }[] = [
  // Plaza
  { position: [-8, 0, -8], rotation: 0 },
  { position: [8, 0, -8], rotation: 0 },
  { position: [-8, 0, 8], rotation: Math.PI },
  { position: [8, 0, 8], rotation: Math.PI },
  { position: [-14, 0, 0], rotation: Math.PI / 2 },
  { position: [14, 0, 0], rotation: -Math.PI / 2 },
  // North boulevard
  { position: [-10, 0, -30], rotation: Math.PI / 2 },
  { position: [10, 0, -30], rotation: -Math.PI / 2 },
  // South market
  { position: [-10, 0, 38], rotation: 0 },
  { position: [10, 0, 38], rotation: 0 },
  // East park
  { position: [30, 0, -10], rotation: 0 },
  { position: [30, 0, 10], rotation: Math.PI },
  // West quarter
  { position: [-30, 0, -10], rotation: Math.PI / 2 },
  { position: [-30, 0, 10], rotation: -Math.PI / 2 },
]

export const SPAWN_POINTS: SpawnPoint[] = [
  { id: 'hub-center', position: [0, 0, 0], rotation: [0, 0, 0], label: 'Bengaluru Hub Center', isActive: true },
  { id: 'hub-north', position: [0, 0, -40], rotation: [0, 0, 0], label: 'Academic Row', isActive: true },
  { id: 'hub-south', position: [0, 0, 45], rotation: [0, Math.PI, 0], label: 'Market Square', isActive: true },
  { id: 'hub-east', position: [42, 0, 0], rotation: [0, -Math.PI / 2, 0], label: 'Tech Park', isActive: true },
  { id: 'hub-west', position: [-42, 0, 0], rotation: [0, Math.PI / 2, 0], label: 'Innovation Quarter', isActive: true },
]

export const FAST_TRAVEL_NODES: FastTravelNode[] = [
  { id: 'ft-hub', name: 'Bengaluru Hub', position: [0, 0, 0], connections: ['ft-north', 'ft-south', 'ft-east', 'ft-west'], isUnlocked: true },
  { id: 'ft-north', name: 'Campus Approach', position: [0, 0, -90], connections: ['ft-hub'], isUnlocked: false },
  { id: 'ft-south', name: 'South Market', position: [0, 0, 80], connections: ['ft-hub'], isUnlocked: false },
  { id: 'ft-east', name: 'Tech Park', position: [80, 0, 0], connections: ['ft-hub'], isUnlocked: false },
  { id: 'ft-west', name: 'Innovation Quarter', position: [-80, 0, 0], connections: ['ft-hub'], isUnlocked: false },
]

export const INTERACTIVE_OBJECTS: {
  id: string
  type: string
  position: [number, number, number]
  radius?: number
  data?: Record<string, unknown>
}[] = [
  { id: 'hub-map', type: 'map', position: [0, 1, -15], radius: 4, data: { label: 'Hub Map' } },
  { id: 'plaza-info', type: 'info', position: [12, 1, -10], radius: 3, data: { message: 'Bengaluru Hub — Center of SaiVerse' } },
]

export const ROAD_SEGMENTS: RoadSegment[] = [
  // Main north-south road
  { id: 'road-ns', start: [0, -120], end: [0, 120], width: 10, surface: 'road' },
  // Main east-west road
  { id: 'road-ew', start: [-120, 0], end: [120, 0], width: 10, surface: 'road' },
  // Secondary north roads (boulevard sides)
  { id: 'road-nw', start: [-14, -120], end: [-14, -30], width: 4, surface: 'road' },
  { id: 'road-ne', start: [14, -120], end: [14, -30], width: 4, surface: 'road' },
  // Secondary south roads
  { id: 'road-sw', start: [-16, 30], end: [-16, 80], width: 4, surface: 'road' },
  { id: 'road-se', start: [16, 30], end: [16, 80], width: 4, surface: 'road' },
  // Cross streets
  { id: 'road-cross-n', start: [-20, -35], end: [20, -35], width: 4, surface: 'road' },
  { id: 'road-cross-s', start: [-20, 38], end: [20, 38], width: 4, surface: 'road' },
  { id: 'road-cross-e', start: [35, -15], end: [55, -15], width: 4, surface: 'road' },
  { id: 'road-cross-w', start: [-55, -15], end: [-35, -15], width: 4, surface: 'road' },
  // Plaza ring
  { id: 'plaza-ring', start: [-15, -15], end: [15, -15], width: 8, surface: 'plaza' },
  { id: 'plaza-ring-2', start: [-15, 15], end: [15, 15], width: 8, surface: 'plaza' },
  { id: 'plaza-ring-3', start: [-15, -15], end: [-15, 15], width: 8, surface: 'plaza' },
  { id: 'plaza-ring-4', start: [15, -15], end: [15, 15], width: 8, surface: 'plaza' },
]
