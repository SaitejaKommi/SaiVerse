export const CAMPUS_CENTER: [number, number, number] = [0, 0, -145]

export const CAMPUS_BOUNDS = {
  minX: -60,
  maxX: 60,
  minZ: -210,
  maxZ: -105,
}

export interface CampusBuildingData {
  position: [number, number, number]
  width: number
  depth: number
  height: number
  color: string
  roofColor?: string
  windowsColor?: string
  style?: 'classic' | 'flat' | 'modern'
  label?: string
}

const STONE_WALL = '#8b7355'
const STONE_DARK = '#6b5b3d'
const STONE_LIGHT = '#a0896a'
const ROOF_TILE = '#4a3728'
const WINDOW_GLOW = '#ffdd88'

export const CAMPUS_BUILDINGS: CampusBuildingData[] = [
  // Academic Block — centerpiece
  { position: [0, 0, -150], width: 22, depth: 14, height: 14, color: STONE_WALL, roofColor: ROOF_TILE, windowsColor: WINDOW_GLOW, style: 'modern', label: 'Academic Block' },
  // Classroom Wing — east
  { position: [23, 0, -150], width: 10, depth: 10, height: 10, color: STONE_LIGHT, roofColor: ROOF_TILE, windowsColor: WINDOW_GLOW, style: 'flat', label: 'Classroom Wing' },
  // Library Wing — west
  { position: [-23, 0, -150], width: 12, depth: 10, height: 10, color: STONE_DARK, roofColor: ROOF_TILE, windowsColor: WINDOW_GLOW, style: 'modern', label: 'Library' },
  // Lab Building — behind academic block
  { position: [0, 0, -175], width: 10, depth: 8, height: 8, color: STONE_LIGHT, roofColor: ROOF_TILE, windowsColor: WINDOW_GLOW, style: 'flat', label: 'Computer Lab' },
  // Campus Reception — near entrance
  { position: [0, 0, -115], width: 6, depth: 5, height: 4, color: STONE_WALL, roofColor: ROOF_TILE, windowsColor: WINDOW_GLOW, style: 'flat', label: 'Reception' },
]

export const CAMPUS_TREES: { position: [number, number, number]; variant?: number; scale?: number }[] = [
  // Entry path lining (z = -108 to -120)
  { position: [-6, 0, -108], variant: 0, scale: 1.3 },
  { position: [6, 0, -108], variant: 1, scale: 1.3 },
  { position: [-8, 0, -114], variant: 2, scale: 1.4 },
  { position: [8, 0, -114], variant: 0, scale: 1.4 },
  { position: [-10, 0, -120], variant: 1, scale: 1.5 },
  { position: [10, 0, -120], variant: 2, scale: 1.5 },
  // Courtyard ring
  { position: [-5, 0, -128], variant: 0, scale: 1.0 },
  { position: [5, 0, -128], variant: 1, scale: 1.0 },
  { position: [-7, 0, -135], variant: 2, scale: 1.2 },
  { position: [7, 0, -135], variant: 0, scale: 1.2 },
  // Academic block sides
  { position: [-14, 0, -150], variant: 1, scale: 1.4 },
  { position: [14, 0, -150], variant: 2, scale: 1.4 },
  // Library garden
  { position: [-28, 0, -145], variant: 0, scale: 1.3 },
  { position: [-30, 0, -155], variant: 2, scale: 1.5 },
  // Classroom side
  { position: [28, 0, -145], variant: 1, scale: 1.2 },
  { position: [30, 0, -155], variant: 0, scale: 1.4 },
  // Lab area
  { position: [-8, 0, -175], variant: 2, scale: 1.2 },
  { position: [8, 0, -175], variant: 1, scale: 1.2 },
  // Far campus boundary
  { position: [-15, 0, -195], variant: 0, scale: 1.6 },
  { position: [15, 0, -195], variant: 2, scale: 1.6 },
]

export const CAMPUS_BENCHES: { position: [number, number, number]; rotation?: number }[] = [
  // Courtyard
  { position: [-4, 0, -126], rotation: 0 },
  { position: [4, 0, -126], rotation: Math.PI },
  { position: [-6, 0, -132], rotation: Math.PI / 2 },
  { position: [6, 0, -132], rotation: -Math.PI / 2 },
  // Library entrance
  { position: [-26, 0, -146], rotation: Math.PI / 2 },
  // Classroom wing
  { position: [26, 0, -146], rotation: -Math.PI / 2 },
  // Lab area
  { position: [-5, 0, -172], rotation: 0 },
  { position: [5, 0, -172], rotation: Math.PI },
]

export const CAMPUS_LAMPS: { position: [number, number, number] }[] = [
  // Entry path
  { position: [-4, 0, -106] }, { position: [4, 0, -106] },
  { position: [-5, 0, -112] }, { position: [5, 0, -112] },
  { position: [-7, 0, -118] }, { position: [7, 0, -118] },
  // Courtyard
  { position: [-8, 0, -126] }, { position: [8, 0, -126] },
  { position: [-8, 0, -134] }, { position: [8, 0, -134] },
  // Academic block
  { position: [-14, 0, -145] }, { position: [14, 0, -145] },
  // Lab area
  { position: [-6, 0, -170] }, { position: [6, 0, -170] },
]

export const CAMPUS_ROADS: { id: string; start: [number, number]; end: [number, number]; width: number; surface: string }[] = [
  // Entry path (from campus entrance to courtyard)
  { id: 'campus-path-entry', start: [-3, -105], end: [-3, -122], width: 6, surface: 'road' },
  { id: 'campus-path-entry-r', start: [3, -105], end: [3, -122], width: 6, surface: 'road' },
  // Courtyard plaza
  { id: 'campus-plaza-n', start: [-8, -124], end: [8, -124], width: 6, surface: 'plaza' },
  { id: 'campus-plaza-s', start: [-8, -134], end: [8, -134], width: 6, surface: 'plaza' },
  { id: 'campus-plaza-w', start: [-8, -124], end: [-8, -134], width: 6, surface: 'plaza' },
  { id: 'campus-plaza-e', start: [8, -124], end: [8, -134], width: 6, surface: 'plaza' },
  // Path to academic block entrance
  { id: 'campus-path-academic', start: [-5, -136], end: [-5, -144], width: 10, surface: 'road' },
  // Side paths
  { id: 'campus-path-library', start: [-10, -136], end: [-22, -144], width: 4, surface: 'road' },
  { id: 'campus-path-classroom', start: [10, -136], end: [22, -144], width: 4, surface: 'road' },
  // Path to lab
  { id: 'campus-path-lab', start: [-4, -158], end: [-4, -172], width: 6, surface: 'road' },
]
