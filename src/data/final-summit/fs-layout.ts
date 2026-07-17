import type { TerrainTile, RoadSegment } from '@/systems/world/world.types'

export const FS_CENTER: [number, number, number] = [0, 0, -350]

export const FS_BOUNDS = {
  minX: -60,
  maxX: 60,
  minZ: -410,
  maxZ: -290,
}

export const SUMMIT_HEIGHT = 0

export const FS_TERRAIN_TILES: TerrainTile[] = (() => {
  const tiles: TerrainTile[] = []
  const size = 50
  for (let i = -1; i <= 1; i++) {
    for (let j = -8; j <= -5; j++) {
      const cx = i * size + size / 2
      const cz = j * size + size / 2
      const dx = cx
      const dz = cz - -350
      const dist = Math.sqrt(dx * dx + dz * dz)
      let surface: 'plaza' | 'grass' | 'road' = 'grass'
      if (dist < 25) surface = 'plaza'
      else if (dist < 35) surface = 'road'
      tiles.push({ x: i, z: j, width: size, depth: size, surface, height: 0 })
    }
  }
  return tiles
})()

export const FS_BUILDINGS: {
  position: [number, number, number]
  width: number; depth: number; height: number
  color: string; roofColor?: string; windowsColor?: string; style?: 'classic' | 'flat' | 'modern'
}[] = [
  { position: [0, 0, -350], width: 18, depth: 18, height: 3, color: '#1a1a2e', roofColor: '#2a2a4a', windowsColor: '#00d4ff', style: 'modern' },
  { position: [-35, 0, -315], width: 12, depth: 8, height: 20, color: '#2d3748', roofColor: '#4a5568', windowsColor: '#a0aec0', style: 'flat' },
  { position: [35, 0, -315], width: 12, depth: 8, height: 20, color: '#2d3748', roofColor: '#4a5568', windowsColor: '#a0aec0', style: 'flat' },
  { position: [-35, 0, -385], width: 12, depth: 8, height: 20, color: '#2d3748', roofColor: '#4a5568', windowsColor: '#a0aec0', style: 'flat' },
  { position: [35, 0, -385], width: 12, depth: 8, height: 20, color: '#2d3748', roofColor: '#4a5568', windowsColor: '#a0aec0', style: 'flat' },
]

export const FS_TREES: { position: [number, number, number]; variant: number; scale: number }[] = [
  { position: [-25, 0, -330], variant: 0, scale: 0.6 },
  { position: [25, 0, -330], variant: 1, scale: 0.6 },
  { position: [-25, 0, -370], variant: 2, scale: 0.6 },
  { position: [25, 0, -370], variant: 0, scale: 0.6 },
  { position: [-40, 0, -345], variant: 1, scale: 0.5 },
  { position: [40, 0, -345], variant: 2, scale: 0.5 },
  { position: [-40, 0, -355], variant: 0, scale: 0.5 },
  { position: [40, 0, -355], variant: 1, scale: 0.5 },
]

export const FS_LAMPS: { position: [number, number, number] }[] = [
  { position: [-15, 0, -330] },
  { position: [15, 0, -330] },
  { position: [-15, 0, -370] },
  { position: [15, 0, -370] },
  { position: [-10, 0, -340] },
  { position: [10, 0, -340] },
  { position: [-10, 0, -360] },
  { position: [10, 0, -360] },
]

export const FS_ROADS: RoadSegment[] = [
  { id: 'fs-north', start: [-10, -330], end: [10, -330], width: 2, surface: 'plaza' },
  { id: 'fs-south', start: [-10, -370], end: [10, -370], width: 2, surface: 'plaza' },
  { id: 'fs-west', start: [-10, -335], end: [-10, -365], width: 2, surface: 'plaza' },
  { id: 'fs-east', start: [10, -335], end: [10, -365], width: 2, surface: 'plaza' },
]

export const MONUMENT_POSITIONS: [number, number, number][] = [
  [-16, 0, -334],
  [16, 0, -334],
  [-22, 0, -350],
  [22, 0, -350],
  [-16, 0, -366],
  [16, 0, -366],
  [-6, 0, -370],
  [6, 0, -330],
]

export const CENTRAL_PEDESTAL_POSITION: [number, number, number] = [0, 0, -350]
