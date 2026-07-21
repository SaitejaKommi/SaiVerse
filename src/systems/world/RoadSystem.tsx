'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { RoadSegment, SurfaceType } from './world.types'
import { MATERIALS } from '@/systems/material'

interface RoadSystemProps {
  segments: RoadSegment[]
  showMarkings?: boolean
  showCurbs?: boolean
}

function buildRoadVerts(
  startX: number, startZ: number,
  endX: number, endZ: number,
  width: number, y: number,
): { positions: Float32Array; index: Uint16Array; nx: number; nz: number; length: number } {
  const dx = endX - startX
  const dz = endZ - startZ
  const length = Math.sqrt(dx * dx + dz * dz)

  const nx = length > 0.01 ? -dz / length : 0
  const nz = length > 0.01 ? dx / length : 1

  const hw = width / 2
  const positions = new Float32Array([
    startX + nx * hw, y, startZ + nz * hw,
    startX - nx * hw, y, startZ - nz * hw,
    endX + nx * hw, y, endZ + nz * hw,
    endX - nx * hw, y, endZ - nz * hw,
  ])
  const index = new Uint16Array([0, 1, 2, 2, 1, 3])

  return { positions, index, nx, nz, length }
}

function createRoadGeometry(
  startX: number, startZ: number,
  endX: number, endZ: number,
  width: number,
): THREE.BufferGeometry {
  const { positions, index } = buildRoadVerts(startX, startZ, endX, endZ, width, 0.02)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(new THREE.BufferAttribute(index, 1))
  geo.computeVertexNormals()
  return geo
}

function createCurbGeometry(
  startX: number, startZ: number,
  endX: number, endZ: number,
  width: number, side: number,
): THREE.BufferGeometry {
  const { nx, nz, length } = buildRoadVerts(startX, startZ, endX, endZ, width, 0)
  if (length < 0.01) return new THREE.BoxGeometry(0.1, 0.15, 0.1)

  const hw = width / 2
  const inset = hw - side * 0.1
  const offsetX = nx * (inset + side * 0.15)
  const offsetZ = nz * (inset + side * 0.15)
  const curbH = 0.08

  const verts = new Float32Array([
    startX + offsetX, 0, startZ + offsetZ,
    endX + offsetX, 0, endZ + offsetZ,
    startX + offsetX, curbH, startZ + offsetZ,
    endX + offsetX, curbH, endZ + offsetZ,
  ])

  const idx = new Uint16Array([
    0, 1, 2, 2, 1, 3,
    2, 1, 0, 3, 1, 2,
  ])

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  geo.setIndex(new THREE.BufferAttribute(idx, 1))
  geo.computeVertexNormals()
  return geo
}

function createCenterLineGeometry(
  startX: number, startZ: number,
  endX: number, endZ: number,
  length: number, nx: number, nz: number,
): THREE.BufferGeometry {
  if (length < 0.5) return new THREE.BoxGeometry(0.05, 0.01, 0.05)
  const dashLen = 1.5
  const gapLen = 1
  const numDashes = Math.floor(length / (dashLen + gapLen))
  const dashGroup = new THREE.BufferGeometry()
  const positions: number[] = []

  for (let i = 0; i < numDashes; i++) {
    const t0 = i * (dashLen + gapLen) / length
    const t1 = (i * (dashLen + gapLen) + dashLen) / length
    if (t1 > 1) break
    const s0x = startX + (endX - startX) * t0
    const s0z = startZ + (endZ - startZ) * t0
    const s1x = startX + (endX - startX) * t1
    const s1z = startZ + (endZ - startZ) * t1
    const w = 0.04
    positions.push(
      s0x + nx * w, 0.025, s0z + nz * w,
      s0x - nx * w, 0.025, s0z - nz * w,
      s1x + nx * w, 0.025, s1z + nz * w,
      s1x - nx * w, 0.025, s1z - nz * w,
    )
  }

  const indices: number[] = []
  for (let i = 0; i < positions.length / 3; i += 4) {
    const base = i
    indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3)
  }

  dashGroup.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  dashGroup.setIndex(indices)
  dashGroup.computeVertexNormals()
  return dashGroup
}

const ROAD_MATERIALS: Record<SurfaceType, THREE.MeshStandardMaterial> = {
  grass: new THREE.MeshStandardMaterial({ color: '#4a7c59', roughness: MATERIALS.terrain.grass.roughness, metalness: MATERIALS.terrain.grass.metalness }),
  road: new THREE.MeshStandardMaterial({ color: '#3a3a3a', roughness: MATERIALS.terrain.road.roughness, metalness: MATERIALS.terrain.road.metalness }),
  pavement: new THREE.MeshStandardMaterial({ color: '#5a5a5a', roughness: MATERIALS.terrain.pavement.roughness, metalness: MATERIALS.terrain.pavement.metalness }),
  plaza: new THREE.MeshStandardMaterial({ color: '#6a6a6a', roughness: MATERIALS.terrain.plaza.roughness, metalness: MATERIALS.terrain.plaza.metalness }),
  dirt: new THREE.MeshStandardMaterial({ color: '#6b4a3a', roughness: MATERIALS.terrain.dirt.roughness, metalness: MATERIALS.terrain.dirt.metalness }),
}

const CURB_MATERIAL = new THREE.MeshStandardMaterial({ color: '#7a7a7a', roughness: MATERIALS.stone.rough.roughness, metalness: MATERIALS.stone.rough.metalness })
const LINE_MATERIAL = new THREE.MeshStandardMaterial({ color: '#cccccc', roughness: MATERIALS.plastic.glossy.roughness, metalness: MATERIALS.plastic.glossy.metalness })

export function RoadSystem({ segments, showMarkings = true, showCurbs = true }: RoadSystemProps) {
  const roadMeshes = useMemo(() => {
    return segments.map((seg) => {
      const mat = ROAD_MATERIALS[seg.surface] ?? ROAD_MATERIALS.road
      const geo = createRoadGeometry(seg.start[0], seg.start[1], seg.end[0], seg.end[1], seg.width)
      return { geo, mat, id: seg.id, start: seg.start, end: seg.end, width: seg.width, surface: seg.surface }
    })
  }, [segments])

  return (
    <group>
      {roadMeshes.map((r) => (
        <mesh key={r.id} geometry={r.geo} material={r.mat} receiveShadow />
      ))}
      {showCurbs && roadMeshes.filter((r) => r.surface === 'road').map((r) => (
        <group key={`curb-${r.id}`}>
          <mesh geometry={createCurbGeometry(r.start[0], r.start[1], r.end[0], r.end[1], r.width, -1)} material={CURB_MATERIAL} />
          <mesh geometry={createCurbGeometry(r.start[0], r.start[1], r.end[0], r.end[1], r.width, 1)} material={CURB_MATERIAL} />
        </group>
      ))}
      {showMarkings && roadMeshes.filter((r) => r.surface === 'road' && r.width >= 4).map((r) => {
        const dx = r.end[0] - r.start[0]
        const dz = r.end[1] - r.start[1]
        const len = Math.sqrt(dx * dx + dz * dz)
        const nx = len > 0.01 ? -dz / len : 0
        const nz = len > 0.01 ? dx / len : 1
        return (
          <mesh
            key={`line-${r.id}`}
            geometry={createCenterLineGeometry(r.start[0], r.start[1], r.end[0], r.end[1], len, nx, nz)}
            material={LINE_MATERIAL}
          />
        )
      })}
    </group>
  )
}
