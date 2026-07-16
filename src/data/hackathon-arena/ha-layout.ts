import type { TerrainTile, RoadSegment } from '@/systems/world/world.types'

export const HA_CENTER: [number, number, number] = [0, 0, -640]

export const HA_BOUNDS = {
  minX: -60,
  maxX: 60,
  minZ: -690,
  maxZ: -600,
}

export const HA_TERRAIN_TILES: TerrainTile[] = (() => {
  const tiles: TerrainTile[] = []
  const size = 50
  for (let i = -1; i <= 1; i++) {
    for (let j = -13; j >= -13; j--) {
      const cx = i * size + size / 2
      const cz = j * size + size / 2
      const dist = Math.sqrt(cx * cx + (cz + 640) * (cz + 640))
      let surface: 'plaza' | 'grass' | 'road' = 'grass'
      if (dist < 40) surface = 'plaza'
      else if (dist < 55) surface = 'road'
      tiles.push({ x: i, z: j, width: size, depth: size, surface, height: 0 })
    }
  }
  return tiles
})()

export const HA_BUILDINGS: {
  position: [number, number, number]
  width: number
  depth: number
  height: number
  color: string
  roofColor?: string
  windowsColor?: string
  style?: 'classic' | 'flat' | 'modern'
}[] = [
  // Arena main hall (central structure)
  { position: [0, 0, -640], width: 30, depth: 20, height: 12, color: '#1a1a2e', roofColor: '#16213e', windowsColor: '#00d4ff', style: 'modern' },

  // Side wings
  { position: [-40, 0, -640], width: 15, depth: 12, height: 6, color: '#16213e', roofColor: '#0f3460', windowsColor: '#00d4ff', style: 'modern' },
  { position: [40, 0, -640], width: 15, depth: 12, height: 6, color: '#16213e', roofColor: '#0f3460', windowsColor: '#00d4ff', style: 'modern' },

  // Entrance pavilion
  { position: [0, 0, -605], width: 8, depth: 4, height: 5, color: '#1a1a2e', roofColor: '#16213e', windowsColor: '#e94560', style: 'flat' },
]

export const HA_TREES: { position: [number, number, number]; variant?: number; scale?: number }[] = [
  { position: [-20, 0, -600], variant: 0, scale: 0.6 },
  { position: [20, 0, -600], variant: 1, scale: 0.6 },
  { position: [-45, 0, -625], variant: 2, scale: 0.5 },
  { position: [45, 0, -625], variant: 0, scale: 0.5 },
  { position: [-30, 0, -660], variant: 1, scale: 0.5 },
  { position: [30, 0, -660], variant: 2, scale: 0.5 },
]

export const HA_LAMPS: { position: [number, number, number] }[] = [
  { position: [-10, 0, -608] },
  { position: [10, 0, -608] },
  { position: [-25, 0, -630] },
  { position: [25, 0, -630] },
  { position: [-25, 0, -650] },
  { position: [25, 0, -650] },
]

export const HA_ROADS: RoadSegment[] = [
  { id: 'ha-approach', start: [0, -590], end: [0, -610], width: 6, surface: 'road' },
  { id: 'ha-entrance', start: [0, -610], end: [0, -630], width: 8, surface: 'pavement' },
  { id: 'ha-main-hall', start: [0, -630], end: [0, -660], width: 10, surface: 'plaza' },
  { id: 'ha-cross', start: [-30, -640], end: [30, -640], width: 6, surface: 'pavement' },
]

export const STATION_POSITIONS = {
  entrance: [0, 0, -610] as [number, number, number],
  centerStage: [0, 0, -643] as [number, number, number],
  codeStation: [-15, 0, -635] as [number, number, number],
  debugStation: [15, 0, -635] as [number, number, number],
  presentationConsole: [0, 0, -638] as [number, number, number],
  announcer: [0, 0, -648] as [number, number, number],
  projectorScreen: [0, 6, -655] as [number, number, number],
  teamPositions: [
    { position: [-25, 0, -648] as [number, number, number], rotation: 0 },
    { position: [25, 0, -648] as [number, number, number], rotation: Math.PI },
    { position: [-30, 0, -632] as [number, number, number], rotation: 0.3 },
    { position: [30, 0, -632] as [number, number, number], rotation: -0.3 },
  ],
}
