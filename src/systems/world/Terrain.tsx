'use client'

import { useMemo, useRef } from 'react'

import * as THREE from 'three'
import { WORLD_CONFIG } from './world.config'
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
}

function createTileGeometry(width: number, depth: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, depth, 1, 1)
  geo.rotateX(-Math.PI / 2)
  return geo
}

const GRASS_COLOR = new THREE.Color('#4a7c59')
const ROAD_COLOR = new THREE.Color('#3a3a3a')
const PLAZA_COLOR = new THREE.Color('#5a5a5a')
const DIRT_COLOR = new THREE.Color('#6b4a3a')

const TILE_MATERIALS: Record<SurfaceType, THREE.MeshStandardMaterial> = {
  grass: new THREE.MeshStandardMaterial({
    color: GRASS_COLOR,
    roughness: 0.9,
    metalness: 0,
    flatShading: false,
  }),
  road: new THREE.MeshStandardMaterial({
    color: ROAD_COLOR,
    roughness: 0.8,
    metalness: 0.1,
  }),
  pavement: new THREE.MeshStandardMaterial({
    color: PLAZA_COLOR,
    roughness: 0.7,
    metalness: 0.05,
  }),
  plaza: new THREE.MeshStandardMaterial({
    color: PLAZA_COLOR,
    roughness: 0.6,
    metalness: 0.1,
  }),
  dirt: new THREE.MeshStandardMaterial({
    color: DIRT_COLOR,
    roughness: 1,
    metalness: 0,
  }),
}

function DefaultTerrainGrid({ size, segments }: { size: number; segments: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [size, segments])

  return (
    <mesh
      geometry={geometry}
      material={TILE_MATERIALS.grass}
      position={[0, -0.05, 0]}
      receiveShadow
    />
  )
}

function TiledTerrain({ tiles, size }: { tiles: TerrainTileData[]; size: number }) {
  const groupRef = useRef<THREE.Group>(null)

  const tileSize = size

  return (
    <group ref={groupRef}>
      {tiles.map((tile) => {
        const mat = TILE_MATERIALS[tile.surface]
        const geo = createTileGeometry(tileSize, tileSize)
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

export function Terrain({ tiles, size = WORLD_CONFIG.TERRAIN_SIZE, segments = WORLD_CONFIG.TERRAIN_SEGMENTS }: TerrainProps) {
  if (tiles && tiles.length > 0) {
    return <TiledTerrain tiles={tiles} size={size} />
  }

  return <DefaultTerrainGrid size={size} segments={segments} />
}
