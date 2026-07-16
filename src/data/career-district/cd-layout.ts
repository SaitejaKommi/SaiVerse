import type { TerrainTile, RoadSegment } from '@/systems/world/world.types'

export const CD_CENTER: [number, number, number] = [90, 0, 0]

export const CD_BOUNDS = {
  minX: 30,
  maxX: 150,
  minZ: -50,
  maxZ: 50,
}

export interface CDStationPos {
  position: [number, number, number]
}

export const CD_TERRAIN_TILES: TerrainTile[] = (() => {
  const tiles: TerrainTile[] = []
  const size = 50
  for (let i = 0; i <= 2; i++) {
    for (let j = -1; j <= 1; j++) {
      const cx = i * size + size / 2
      const cz = j * size + size / 2
      const dx = cx - 90
      const dz = cz
      const dist = Math.sqrt(dx * dx + dz * dz)
      let surface: 'plaza' | 'grass' | 'road' = 'grass'
      if (dist < 40) surface = 'plaza'
      else if (dist < 55) surface = 'road'
      tiles.push({ x: i, z: j, width: size, depth: size, surface, height: 0 })
    }
  }
  return tiles
})()

export const CD_BUILDINGS: {
  position: [number, number, number]
  width: number; depth: number; height: number
  color: string; roofColor?: string; windowsColor?: string; style?: 'classic' | 'flat' | 'modern'
}[] = [
  { position: [90, 0, 0], width: 16, depth: 10, height: 8, color: '#2a2a4a', roofColor: '#4a4a8a', windowsColor: '#00d4ff', style: 'modern' },
  { position: [70, 0, -15], width: 6, depth: 5, height: 4, color: '#1e3a5f', roofColor: '#2a5280', windowsColor: '#88ccff', style: 'modern' },
  { position: [70, 0, 15], width: 6, depth: 5, height: 4, color: '#1e3a5f', roofColor: '#2a5280', windowsColor: '#88ccff', style: 'modern' },
  { position: [110, 0, -15], width: 6, depth: 5, height: 4, color: '#3a2a4a', roofColor: '#5a3a6a', windowsColor: '#cc88ff', style: 'modern' },
  { position: [110, 0, 15], width: 6, depth: 5, height: 4, color: '#3a2a4a', roofColor: '#5a3a6a', windowsColor: '#cc88ff', style: 'modern' },
  { position: [55, 0, 0], width: 8, depth: 6, height: 5, color: '#2d3748', roofColor: '#4a5568', windowsColor: '#a0aec0', style: 'flat' },
]

export const CD_TREES: { position: [number, number, number]; variant: number; scale: number }[] = [
  { position: [65, 0, -30], variant: 0, scale: 0.8 },
  { position: [115, 0, -30], variant: 1, scale: 0.9 },
  { position: [65, 0, 30], variant: 2, scale: 0.7 },
  { position: [115, 0, 30], variant: 0, scale: 0.8 },
  { position: [50, 0, -20], variant: 1, scale: 0.6 },
  { position: [50, 0, 20], variant: 2, scale: 0.6 },
]

export const CD_LAMPS: { position: [number, number, number] }[] = [
  { position: [78, 0, -22] },
  { position: [78, 0, 22] },
  { position: [102, 0, -22] },
  { position: [102, 0, 22] },
  { position: [60, 0, -8] },
  { position: [60, 0, 8] },
  { position: [120, 0, -8] },
  { position: [120, 0, 8] },
]

export const CD_ROADS: RoadSegment[] = [
  { id: 'cd-west', start: [60, -6], end: [60, 6], width: 2, surface: 'plaza' },
  { id: 'cd-east', start: [120, -6], end: [120, 6], width: 2, surface: 'plaza' },
  { id: 'cd-main', start: [65, 0], end: [115, 0], width: 3, surface: 'plaza' },
]

export const PORTFOLIO_PLINTH_POSITIONS: [number, number, number][] = [
  [80, 0, -8],
  [85, 0, -8],
  [90, 0, -8],
  [95, 0, -8],
  [100, 0, -8],
  [105, 0, -8],
]

export const INTERVIEW_POD_POSITIONS: [number, number, number][] = [
  [70, 0, -15],
  [70, 0, 15],
  [110, 0, 15],
]

export const MENTOR_POSITIONS: [number, number, number][] = [
  [55, 0, -12],
  [55, 0, 0],
  [55, 0, 12],
]

export const OFFER_STAGE_POSITION: [number, number, number] = [90, 0, 10]

export const COUNSELOR_POSITION: [number, number, number] = [90, 0, -12]
