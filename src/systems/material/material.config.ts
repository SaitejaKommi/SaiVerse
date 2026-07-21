export interface PBRConfig {
  roughness: number
  metalness: number
  envMapIntensity?: number
  clearcoat?: number
  clearcoatRoughness?: number
  transmission?: number
  thickness?: number
}

export const MATERIALS = {
  building: {
    wall: { roughness: 0.65, metalness: 0.05 },
    roof: { roughness: 0.85, metalness: 0.02 },
    trim: { roughness: 0.6, metalness: 0.15 },
    window: { roughness: 0.05, metalness: 0.6 },
  },

  terrain: {
    grass: { roughness: 0.95, metalness: 0 },
    road: { roughness: 0.8, metalness: 0.05 },
    pavement: { roughness: 0.75, metalness: 0.02 },
    plaza: { roughness: 0.55, metalness: 0.15 },
    dirt: { roughness: 1, metalness: 0 },
  },

  metal: {
    polished: { roughness: 0.12, metalness: 0.95 },
    brushed: { roughness: 0.35, metalness: 0.85 },
    painted: { roughness: 0.45, metalness: 0.3 },
    structural: { roughness: 0.65, metalness: 0.5 },
    lamp: { roughness: 0.4, metalness: 0.75 },
  },

  stone: {
    rough: { roughness: 0.9, metalness: 0 },
    carved: { roughness: 0.7, metalness: 0.05 },
    polished: { roughness: 0.25, metalness: 0.1 },
    statue: { roughness: 0.75, metalness: 0.08 },
  },

  wood: {
    rough: { roughness: 0.92, metalness: 0 },
    finished: { roughness: 0.55, metalness: 0 },
    bark: { roughness: 0.95, metalness: 0 },
  },

  glass: {
    architectural: { roughness: 0.05, metalness: 0.5 },
    clear: { roughness: 0, metalness: 0 },
    display: { roughness: 0.1, metalness: 0.05, transmission: 0.3, thickness: 0.5 },
  },

  plastic: {
    matte: { roughness: 0.85, metalness: 0 },
    glossy: { roughness: 0.25, metalness: 0 },
    screen: { roughness: 0.15, metalness: 0.05 },
  },

  organic: {
    foliage: { roughness: 0.92, metalness: 0 },
    canopy: { roughness: 0.88, metalness: 0 },
    trunk: { roughness: 0.95, metalness: 0 },
  },

  paper: {
    matte: { roughness: 0.85, metalness: 0 },
    glossy: { roughness: 0.35, metalness: 0 },
  },
}

export function physical(pbr: PBRConfig): PBRConfig {
  return pbr
}
