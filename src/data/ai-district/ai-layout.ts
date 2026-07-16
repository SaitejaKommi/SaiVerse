import type { TerrainTile } from '@/systems/world/world.types'
import type { RoadSegment } from '@/systems/world/world.types'

export const AI_CENTER: [number, number, number] = [0, 0, -370]

export const AI_BOUNDS = {
  minX: -80,
  maxX: 80,
  minZ: -430,
  maxZ: -330,
}

export const AI_TERRAIN_TILES: TerrainTile[] = (() => {
  const tiles: TerrainTile[] = []
  const size = 50
  for (let i = -1; i <= 1; i++) {
    for (let j = -8; j >= -8; j--) {
      const cx = i * size + size / 2
      const cz = j * size + size / 2
      const dist = Math.sqrt(cx * cx + (cz + 370) * (cz + 370))
      let surface: 'plaza' | 'grass' | 'road' = 'grass'
      if (dist < 30) surface = 'plaza'
      else if (dist < 45) surface = 'road'
      tiles.push({ x: i, z: j, width: size, depth: size, surface, height: 0 })
    }
  }
  return tiles
})()

export interface AIData {
  position: [number, number, number]
  width: number
  depth: number
  height: number
  color: string
  roofColor?: string
  windowsColor?: string
  style?: 'classic' | 'flat' | 'modern'
}

const HOLO_BLUE = '#00d4ff'
const HOLO_PURPLE = '#a855f7'
const HOLO_GREEN = '#00ff88'

export const AI_BUILDINGS: AIData[] = [
  // Data Core (center - main building)
  { position: [0, 0, -370], width: 16, depth: 12, height: 14, color: '#0a1628', roofColor: '#1a1a3e', windowsColor: HOLO_BLUE, style: 'modern' },

  // Data Terminal building (west)
  { position: [-30, 0, -360], width: 8, depth: 8, height: 6, color: '#0f1a2e', roofColor: '#1a1a3e', windowsColor: HOLO_BLUE, style: 'flat' },

  // Training Console building (east)
  { position: [30, 0, -360], width: 8, depth: 8, height: 6, color: '#0f1a2e', roofColor: '#1a1a3e', windowsColor: HOLO_GREEN, style: 'flat' },

  // Prompt Lab (north)
  { position: [0, 0, -395], width: 8, depth: 6, height: 5, color: '#0f1a2e', roofColor: '#1a1a3e', windowsColor: HOLO_PURPLE, style: 'flat' },

  // Server farm wings
  { position: [-20, 0, -370], width: 6, depth: 8, height: 10, color: '#0d1b2a', roofColor: '#1b2838', windowsColor: HOLO_BLUE, style: 'modern' },
  { position: [20, 0, -370], width: 6, depth: 8, height: 10, color: '#0d1b2a', roofColor: '#1b2838', windowsColor: HOLO_GREEN, style: 'modern' },

  // Research pods
  { position: [-45, 0, -385], width: 5, depth: 5, height: 4, color: '#1a1a3e', roofColor: '#2a2a5e', windowsColor: HOLO_PURPLE, style: 'flat' },
  { position: [45, 0, -385], width: 5, depth: 5, height: 4, color: '#1a1a3e', roofColor: '#2a2a5e', windowsColor: HOLO_PURPLE, style: 'flat' },
  { position: [-45, 0, -355], width: 5, depth: 5, height: 4, color: '#1a1a3e', roofColor: '#2a2a5e', windowsColor: HOLO_BLUE, style: 'flat' },
  { position: [45, 0, -355], width: 5, depth: 5, height: 4, color: '#1a1a3e', roofColor: '#2a2a5e', windowsColor: HOLO_GREEN, style: 'flat' },

  // Data garden pavilions
  { position: [-15, 0, -340], width: 4, depth: 4, height: 3, color: '#0a1628', roofColor: '#1a1a3e', windowsColor: HOLO_BLUE, style: 'flat' },
  { position: [15, 0, -340], width: 4, depth: 4, height: 3, color: '#0a1628', roofColor: '#1a1a3e', windowsColor: HOLO_PURPLE, style: 'flat' },
]

export const AI_TREES: { position: [number, number, number]; variant?: number; scale?: number }[] = [
  { position: [-8, 0, -335], variant: 0, scale: 0.7 },
  { position: [8, 0, -335], variant: 1, scale: 0.7 },
  { position: [-12, 0, -395], variant: 2, scale: 0.6 },
  { position: [12, 0, -395], variant: 0, scale: 0.6 },
  { position: [-35, 0, -350], variant: 1, scale: 0.5 },
  { position: [35, 0, -350], variant: 2, scale: 0.5 },
  { position: [-40, 0, -380], variant: 0, scale: 0.5 },
  { position: [40, 0, -380], variant: 1, scale: 0.5 },
]

export const AI_LAMPS: { position: [number, number, number] }[] = [
  { position: [-10, 0, -335] },
  { position: [10, 0, -335] },
  { position: [-15, 0, -350] },
  { position: [15, 0, -350] },
  { position: [-15, 0, -385] },
  { position: [15, 0, -385] },
  { position: [-6, 0, -398] },
  { position: [6, 0, -398] },
]

export const AI_ROADS: RoadSegment[] = [
  { id: 'ai-approach', start: [0, -310], end: [0, -335], width: 6, surface: 'road' },
  { id: 'ai-main-ns', start: [0, -335], end: [0, -400], width: 6, surface: 'road' },
  { id: 'ai-cross-1', start: [-25, -355], end: [25, -355], width: 4, surface: 'pavement' },
  { id: 'ai-cross-2', start: [-25, -385], end: [25, -385], width: 4, surface: 'pavement' },
]
