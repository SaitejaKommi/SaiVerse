'use client'

import { useMemo, useRef } from 'react'

import * as THREE from 'three'
import { WORLD_CONFIG } from './world.config'
import type { DistrictTerrainColors } from './world.config'
import type { SurfaceType } from './world.types'

interface TerrainTileData {
  x: number
  z: number
  surface: SurfaceType
}

interface TerrainProps {
  tiles?: TerrainTileData[]
  size?: number
  segments?: number
  colors?: DistrictTerrainColors
}

function displaceVertices(geo: THREE.BufferGeometry): void {
  const pos = geo.attributes.position!
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const variation = Math.sin(x * 0.3) * Math.cos(z * 0.25) * 0.04 +
      Math.sin(x * 0.7 + z * 0.5) * 0.02
    pos.setY(i, variation)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}

function createTileGeometry(width: number, depth: number, segments: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, depth, segments, segments)
  displaceVertices(geo)
  geo.rotateX(-Math.PI / 2)
  return geo
}

const DEFAULT_COLORS: DistrictTerrainColors = {
  grass: '#4a7c59',
  road: '#3a3a3a',
  pavement: '#5a5a5a',
  plaza: '#6a6a6a',
  dirt: '#6b4a3a',
}

function DefaultTerrainGrid({ size, segments, colors }: { size: number; segments: number; colors: DistrictTerrainColors }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    displaceVertices(geo)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [size, segments])

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: colors.grass,
    roughness: 0.9,
    metalness: 0,
  }), [colors.grass])

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, -0.05, 0]}
      receiveShadow
    />
  )
}

function TiledTerrain({ tiles, size, segments, colors }: { tiles: TerrainTileData[]; size: number; segments: number; colors: DistrictTerrainColors }) {
  const groupRef = useRef<THREE.Group>(null)

  const tileSize = size
  const segs = segments

  const materials = useMemo(() => ({
    grass: new THREE.MeshStandardMaterial({ color: colors.grass, roughness: 0.9, metalness: 0 }),
    road: new THREE.MeshStandardMaterial({ color: colors.road, roughness: 0.8, metalness: 0.1 }),
    pavement: new THREE.MeshStandardMaterial({ color: colors.pavement, roughness: 0.7, metalness: 0.05 }),
    plaza: new THREE.MeshStandardMaterial({ color: colors.plaza, roughness: 0.6, metalness: 0.1 }),
    dirt: new THREE.MeshStandardMaterial({ color: colors.dirt, roughness: 1, metalness: 0 }),
  }), [colors.grass, colors.road, colors.pavement, colors.plaza, colors.dirt])

  return (
    <group ref={groupRef}>
      {tiles.map((tile) => {
        const mat = materials[tile.surface]
        const geo = createTileGeometry(tileSize, tileSize, segs)
        return (
          <mesh
            key={`${tile.x}-${tile.z}`}
            geometry={geo}
            material={mat}
            position={[tile.x * tileSize + tileSize / 2, -0.05, tile.z * tileSize + tileSize / 2]}
            receiveShadow
          />
        )
      })}
    </group>
  )
}

export function Terrain({ tiles, size = WORLD_CONFIG.TERRAIN_SIZE, segments = WORLD_CONFIG.TERRAIN_SEGMENTS, colors }: TerrainProps) {
  const resolvedColors = colors ?? DEFAULT_COLORS

  if (tiles && tiles.length > 0) {
    return <TiledTerrain tiles={tiles} size={size} segments={segments} colors={resolvedColors} />
  }

  return <DefaultTerrainGrid size={size} segments={segments} colors={resolvedColors} />
}
