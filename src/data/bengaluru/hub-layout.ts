import type { TerrainTile } from '@/systems/world/world.types'
import type { RoadSegment, SpawnPoint, FastTravelNode } from '@/systems/world/world.types'

export const HUB_CENTER: [number, number, number] = [0, 0, 0]

export const TERRAIN_TILES: TerrainTile[] = [
  ...Array.from({ length: 7 }, (_, i) =>
    Array.from({ length: 7 }, (_, j) => ({
      x: i - 3,
      z: j - 3,
      width: 50,
      depth: 50,
      surface: (i >= 2 && i <= 4 && j >= 2 && j <= 4 ? 'plaza' : 'grass') as 'plaza' | 'grass',
      height: 0,
    })),
  ).flat(),
]

export const ROAD_SEGMENTS: RoadSegment[] = [
  { id: 'road-ns-1', start: [0, -75], end: [0, -10], width: 6, surface: 'road' },
  { id: 'road-ns-2', start: [0, 10], end: [0, 75], width: 6, surface: 'road' },
  { id: 'road-ew-1', start: [-75, 0], end: [-10, 0], width: 6, surface: 'road' },
  { id: 'road-ew-2', start: [10, 0], end: [75, 0], width: 6, surface: 'road' },

  { id: 'road-n-1', start: [-30, -45], end: [30, -45], width: 4, surface: 'road' },
  { id: 'road-s-1', start: [-30, 45], end: [30, 45], width: 4, surface: 'road' },
  { id: 'road-e-1', start: [45, -30], end: [45, 30], width: 4, surface: 'road' },
  { id: 'road-w-1', start: [-45, -30], end: [-45, 30], width: 4, surface: 'road' },

  { id: 'plaza-n', start: [-15, -10], end: [15, -10], width: 8, surface: 'plaza' },
  { id: 'plaza-s', start: [-15, 10], end: [15, 10], width: 8, surface: 'plaza' },
  { id: 'plaza-e', start: [10, -15], end: [10, 15], width: 8, surface: 'plaza' },
  { id: 'plaza-w', start: [-10, -15], end: [-10, 15], width: 8, surface: 'plaza' },
]

export const BUILDINGS: {
  position: [number, number, number]
  width: number
  depth: number
  height: number
  color?: string
}[] = [
  { position: [-30, 0, -10], width: 8, depth: 5, height: 12, color: '#4a5568' },
  { position: [-30, 0, 10], width: 8, depth: 5, height: 10, color: '#2d3748' },
  { position: [30, 0, -10], width: 8, depth: 5, height: 14, color: '#2b6cb0' },
  { position: [30, 0, 10], width: 8, depth: 5, height: 10, color: '#6b46c1' },
  { position: [0, 0, -30], width: 6, depth: 6, height: 8, color: '#2f855a' },
  { position: [0, 0, 30], width: 6, depth: 6, height: 6, color: '#c05621' },
  { position: [-20, 0, -25], width: 5, depth: 5, height: 6, color: '#6b7280' },
  { position: [20, 0, -25], width: 5, depth: 5, height: 5, color: '#4a5568' },
  { position: [-20, 0, 25], width: 5, depth: 5, height: 7, color: '#2d3748' },
  { position: [20, 0, 25], width: 5, depth: 5, height: 8, color: '#2b6cb0' },
  { position: [-55, 0, -10], width: 6, depth: 4, height: 10, color: '#6b46c1' },
  { position: [-55, 0, 10], width: 6, depth: 4, height: 8, color: '#4a5568' },
  { position: [55, 0, -10], width: 6, depth: 4, height: 12, color: '#2f855a' },
  { position: [55, 0, 10], width: 6, depth: 4, height: 10, color: '#c05621' },
]

export const TREES: { position: [number, number, number]; variant?: number; scale?: number }[] = [
  { position: [-8, 0, -8], variant: 0 },
  { position: [8, 0, -8], variant: 1 },
  { position: [-8, 0, 8], variant: 2 },
  { position: [8, 0, 8], variant: 0 },
  { position: [-12, 0, -5], variant: 1, scale: 1.2 },
  { position: [12, 0, -5], variant: 2, scale: 0.8 },
  { position: [-12, 0, 5], variant: 0, scale: 1.5 },
  { position: [12, 0, 5], variant: 1, scale: 1.2 },
  { position: [-5, 0, -12], variant: 2 },
  { position: [5, 0, -12], variant: 0 },
  { position: [-5, 0, 12], variant: 1, scale: 0.8 },
  { position: [5, 0, 12], variant: 2 },
  { position: [-40, 0, -25], variant: 0, scale: 1.2 },
  { position: [40, 0, -25], variant: 1, scale: 1.5 },
  { position: [-40, 0, 25], variant: 2 },
  { position: [40, 0, 25], variant: 0, scale: 0.8 },
]

export const LAMPS: { position: [number, number, number] }[] = [
  { position: [-5, 0, -15] },
  { position: [-5, 0, 15] },
  { position: [5, 0, -15] },
  { position: [5, 0, 15] },
  { position: [-15, 0, -5] },
  { position: [-15, 0, 5] },
  { position: [15, 0, -5] },
  { position: [15, 0, 5] },
  { position: [-25, 0, -30] },
  { position: [-25, 0, 30] },
  { position: [25, 0, -30] },
  { position: [25, 0, 30] },
]

export const BENCHES: { position: [number, number, number]; rotation?: number }[] = [
  { position: [-10, 0, -10], rotation: 0 },
  { position: [10, 0, -10], rotation: 0 },
  { position: [-10, 0, 10], rotation: Math.PI },
  { position: [10, 0, 10], rotation: Math.PI },
  { position: [-35, 0, -20], rotation: Math.PI / 2 },
  { position: [35, 0, 20], rotation: -Math.PI / 2 },
]

export const SPAWN_POINTS: SpawnPoint[] = [
  {
    id: 'hub-center',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: 'Bengaluru Hub Center',
    isActive: true,
  },
  {
    id: 'hub-north',
    position: [0, 0, -40],
    rotation: [0, 0, 0],
    label: 'North Gate',
    isActive: true,
  },
  {
    id: 'hub-south',
    position: [0, 0, 40],
    rotation: [0, Math.PI, 0],
    label: 'South Gate',
    isActive: true,
  },
  {
    id: 'hub-east',
    position: [40, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    label: 'East Gate',
    isActive: true,
  },
  {
    id: 'hub-west',
    position: [-40, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    label: 'West Gate',
    isActive: true,
  },
]

export const FAST_TRAVEL_NODES: FastTravelNode[] = [
  {
    id: 'ft-hub',
    name: 'Bengaluru Hub',
    position: [0, 0, 0],
    connections: ['ft-north', 'ft-south', 'ft-east', 'ft-west'],
    isUnlocked: true,
  },
  {
    id: 'ft-north',
    name: 'North District',
    position: [0, 0, -60],
    connections: ['ft-hub'],
    isUnlocked: false,
  },
  {
    id: 'ft-south',
    name: 'South District',
    position: [0, 0, 60],
    connections: ['ft-hub'],
    isUnlocked: false,
  },
  {
    id: 'ft-east',
    name: 'East District',
    position: [60, 0, 0],
    connections: ['ft-hub'],
    isUnlocked: false,
  },
  {
    id: 'ft-west',
    name: 'West District',
    position: [-60, 0, 0],
    connections: ['ft-hub'],
    isUnlocked: false,
  },
]

export const INTERACTIVE_OBJECTS: {
  id: string
  type: string
  position: [number, number, number]
  radius?: number
  data?: Record<string, unknown>
}[] = [
  { id: 'hub-info-board', type: 'info', position: [5, 1, 0], radius: 3, data: { message: 'Welcome to Bengaluru Hub' } },
  { id: 'hub-map', type: 'map', position: [-5, 1, 0], radius: 3, data: { label: 'Hub Map' } },
]

export const HUB_BOUNDS = {
  minX: -75,
  maxX: 75,
  minZ: -75,
  maxZ: 75,
}
