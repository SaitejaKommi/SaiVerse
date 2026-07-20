import type { TerrainTile, RoadSegment } from '@/systems/world/world.types'

export const OSV_CENTER: [number, number, number] = [0, 0, -520]

export const OSV_BOUNDS = {
  minX: -70,
  maxX: 70,
  minZ: -580,
  maxZ: -460,
}

export interface OSVStationPos {
  position: [number, number, number]
}

export const OSV_TERRAIN_TILES: TerrainTile[] = (() => {
  const tiles: TerrainTile[] = []
  const size = 50
  for (let i = -1; i <= 1; i++) {
    for (let j = -10; j <= 10; j++) {
      const cx = i * size + size / 2
      const cz = j * size + size / 2
      const dist = Math.sqrt(cx * cx + (cz + 520) * (cz + 520))
      let surface: 'plaza' | 'grass' | 'road' = 'grass'
      if (dist < 35) surface = 'plaza'
      else if (dist < 50) surface = 'road'
      tiles.push({ x: i, z: j, width: size, depth: size, surface, height: 0 })
    }
  }
  return tiles
})()

export const OSV_BUILDINGS: {
  position: [number, number, number]
  width: number
  depth: number
  height: number
  color: string
  roofColor?: string
  windowsColor?: string
  style?: 'classic' | 'flat' | 'modern'
}[] = [
  // The Foundry hall (center)
  { position: [0, 0, -520], width: 10, depth: 8, height: 6, color: '#d4a373', roofColor: '#bc6c25', windowsColor: '#fefae0', style: 'classic' },

  // Workshop shed (east, near bridge)
  { position: [20, 0, -515], width: 6, depth: 5, height: 4, color: '#a68a64', roofColor: '#7a5c3a', windowsColor: '#fefae0', style: 'flat' },

  // Archive building (north)
  { position: [0, 0, -555], width: 8, depth: 6, height: 5, color: '#d4a373', roofColor: '#bc6c25', windowsColor: '#e9c46a', style: 'classic' },

  // Garden shed (west)
  { position: [-25, 0, -515], width: 4, depth: 4, height: 3, color: '#a68a64', roofColor: '#7a5c3a', windowsColor: '#e9c46a', style: 'flat' },

  // Small houses around the valley
  { position: [-20, 0, -545], width: 5, depth: 4, height: 3.5, color: '#d4a373', roofColor: '#bc6c25', windowsColor: '#fefae0', style: 'classic' },
  { position: [20, 0, -545], width: 5, depth: 4, height: 3.5, color: '#c99a6b', roofColor: '#a0683a', windowsColor: '#fefae0', style: 'classic' },
  { position: [-15, 0, -490], width: 4, depth: 4, height: 3, color: '#b88d5f', roofColor: '#8a5e32', windowsColor: '#e9c46a', style: 'flat' },
  { position: [15, 0, -490], width: 4, depth: 4, height: 3, color: '#b88d5f', roofColor: '#8a5e32', windowsColor: '#e9c46a', style: 'flat' },

  // Contributors Wall structure
  { position: [-6, 0, -520], width: 3, depth: 0.5, height: 2.5, color: '#8a5e32', roofColor: undefined, windowsColor: undefined, style: 'classic' },
]

export const OSV_TREES: { position: [number, number, number]; variant?: number; scale?: number }[] = [
  { position: [-10, 0, -475], variant: 0, scale: 0.8 },
  { position: [10, 0, -475], variant: 1, scale: 0.8 },
  { position: [-5, 0, -565], variant: 2, scale: 0.7 },
  { position: [5, 0, -565], variant: 0, scale: 0.7 },
  { position: [-35, 0, -530], variant: 1, scale: 0.6 },
  { position: [35, 0, -530], variant: 2, scale: 0.6 },
  { position: [-30, 0, -500], variant: 0, scale: 0.5 },
  { position: [30, 0, -500], variant: 1, scale: 0.5 },
  { position: [-40, 0, -555], variant: 2, scale: 0.5 },
  { position: [40, 0, -555], variant: 0, scale: 0.5 },
  { position: [0, 0, -460], variant: 1, scale: 0.9 },
]

export const OSV_LAMPS: { position: [number, number, number] }[] = [
  { position: [-8, 0, -480] },
  { position: [8, 0, -480] },
  { position: [-15, 0, -510] },
  { position: [15, 0, -510] },
  { position: [-5, 0, -545] },
  { position: [5, 0, -545] },
]

export const OSV_PHONE_BOOTHS: { position: [number, number, number]; rotation?: number }[] = [
  { position: [-15, 0, -512], rotation: 0 },
  { position: [15, 0, -512], rotation: Math.PI },
]

export const OSV_BUS_STOPS: { position: [number, number, number]; rotation?: number }[] = [
  { position: [-10, 0, -485], rotation: Math.PI / 2 },
  { position: [10, 0, -485], rotation: -Math.PI / 2 },
]

export const OSV_ROADS: RoadSegment[] = [
  { id: 'osv-approach', start: [0, -460], end: [0, -485], width: 5, surface: 'road' },
  { id: 'osv-main-ns', start: [0, -485], end: [0, -560], width: 5, surface: 'pavement' },
  { id: 'osv-cross', start: [-30, -520], end: [30, -520], width: 4, surface: 'pavement' },
  { id: 'osv-west-path', start: [-15, -515], end: [-25, -515], width: 3, surface: 'dirt' },
  { id: 'osv-east-path', start: [15, -515], end: [25, -515], width: 3, surface: 'dirt' },
]

export const STATION_POSITIONS = {
  entrance: [0, 0, -478] as [number, number, number],
  issueBoard: [3, 0, -482] as [number, number, number],
  heartstone: [0, 0, -520] as [number, number, number],
  garden: {
    center: [-25, 0, -515] as [number, number, number],
    seedBasket: [-28, 0, -518] as [number, number, number],
    well: [-22, 0, -518] as [number, number, number],
    bed1: [-27, 0, -513] as [number, number, number],
    bed2: [-25, 0, -513] as [number, number, number],
    bed3: [-23, 0, -513] as [number, number, number],
  },
  bridge: {
    center: [25, 0, -515] as [number, number, number],
    materialPile: [28, 0, -518] as [number, number, number],
    frame: [25, 0, -515] as [number, number, number],
  },
  archive: {
    center: [0, 0, -555] as [number, number, number],
    shelf: [0, 0, -552] as [number, number, number],
    books: [
      [-18, 0, -544] as [number, number, number],
      [18, 0, -544] as [number, number, number],
      [-10, 0, -490] as [number, number, number],
      [10, 0, -490] as [number, number, number],
      [-30, 0, -530] as [number, number, number],
    ] as [number, number, number][],
  },
  steward: [0, 0, -478] as [number, number, number],
  counterPillar: [6, 0, -520] as [number, number, number],
}
