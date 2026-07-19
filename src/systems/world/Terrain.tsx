'use client'

import { useMemo, useRef } from 'react'

import * as THREE from 'three'
import { WORLD_CONFIG } from './world.config'
import type { DistrictTerrainConfig, SurfaceMaterialConfig } from './world.config'
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
  config?: DistrictTerrainConfig
}

function makeTexture(style: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const base = new THREE.Color(color)
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)

  if (style === 'grid') {
    ctx.fillStyle = `hsl(240, 30%, ${Math.max(hsl.l * 100 - 5, 5)}%)`
    ctx.fillRect(0, 0, 256, 256)
    ctx.strokeStyle = `rgba(0, 180, 255, 0.06)`
    ctx.lineWidth = 1
    for (let i = 0; i <= 256; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke()
    }
    ctx.strokeStyle = `rgba(0, 180, 255, 0.03)`
    ctx.lineWidth = 1
    for (let i = 0; i <= 256; i += 8) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke()
    }
  } else {
    ctx.fillStyle = `#${base.getHexString()}`
    ctx.fillRect(0, 0, 256, 256)
    const imageData = ctx.getImageData(0, 0, 256, 256)
    const d = imageData.data
    for (let i = 0; i < d.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12
      d[i] = Math.max(0, Math.min(255, d[i]! + noise)) as unknown as number
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1]! + noise)) as unknown as number
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2]! + noise)) as unknown as number
    }
    ctx.putImageData(imageData, 0, 0)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  tex.anisotropy = 4
  return tex
}

function buildMaterial(surface: SurfaceMaterialConfig): THREE.MeshStandardMaterial {
  const tex = surface.texture && surface.texture !== 'none'
    ? makeTexture(surface.texture, surface.color)
    : undefined
  return new THREE.MeshStandardMaterial({
    color: surface.color,
    map: tex,
    roughness: surface.roughness,
    metalness: surface.metalness,
  })
}

function displaceVertices(geo: THREE.BufferGeometry, offsetX = 0, offsetZ = 0): void {
  const pos = geo.attributes.position!
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + offsetX
    const z = pos.getZ(i) + offsetZ
    const variation = Math.sin(x * 0.3) * Math.cos(z * 0.25) * 0.04 +
      Math.sin(x * 0.7 + z * 0.5) * 0.02
    pos.setY(i, variation)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}

function createTileGeometry(width: number, depth: number, segments: number, offsetX: number, offsetZ: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, depth, segments, segments)
  displaceVertices(geo, offsetX, offsetZ)
  geo.rotateX(-Math.PI / 2)
  return geo
}

const DEFAULT_CONFIG: DistrictTerrainConfig = {
  grass: { color: '#4a7c59', roughness: 0.9, metalness: 0, texture: 'noise' },
  road: { color: '#3a3a3a', roughness: 0.8, metalness: 0.1 },
  pavement: { color: '#5a5a5a', roughness: 0.7, metalness: 0.05 },
  plaza: { color: '#6a6a6a', roughness: 0.6, metalness: 0.1 },
  dirt: { color: '#6b4a3a', roughness: 1, metalness: 0 },
}

function DefaultTerrainGrid({ size, segments, config }: { size: number; segments: number; config: DistrictTerrainConfig }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    displaceVertices(geo)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [size, segments])

  const material = useMemo(() => buildMaterial(config.grass), [config.grass])

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, -0.05, 0]}
      receiveShadow
    />
  )
}

function TiledTerrain({ tiles, size, segments, config }: { tiles: TerrainTileData[]; size: number; segments: number; config: DistrictTerrainConfig }) {
  const groupRef = useRef<THREE.Group>(null)

  const materials = useMemo(() => ({
    grass: buildMaterial(config.grass),
    road: buildMaterial(config.road),
    pavement: buildMaterial(config.pavement),
    plaza: buildMaterial(config.plaza),
    dirt: buildMaterial(config.dirt),
  }), [config.grass, config.road, config.pavement, config.plaza, config.dirt])

  const tileSize = size
  const segs = segments

  return (
    <group ref={groupRef}>
      {tiles.map((tile) => {
        const mat = materials[tile.surface]
        const geo = createTileGeometry(tileSize, tileSize, segs, tile.x * tileSize, tile.z * tileSize)
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

export function Terrain({ tiles, size = WORLD_CONFIG.TERRAIN_SIZE, segments = WORLD_CONFIG.TERRAIN_SEGMENTS, config }: TerrainProps) {
  const resolved = config ?? DEFAULT_CONFIG

  if (tiles && tiles.length > 0) {
    return <TiledTerrain tiles={tiles} size={size} segments={segments} config={resolved} />
  }

  return <DefaultTerrainGrid size={size} segments={segments} config={resolved} />
}
