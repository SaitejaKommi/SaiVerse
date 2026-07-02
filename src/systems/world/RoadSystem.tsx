'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { RoadSegment, SurfaceType } from './world.types'

interface RoadSystemProps {
  segments: RoadSegment[]
}

function createRoadGeometry(
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  width: number,
): THREE.BufferGeometry {
  const dx = endX - startX
  const dz = endZ - startZ
  const length = Math.sqrt(dx * dx + dz * dz)

  if (length < 0.01) {
    return new THREE.BoxGeometry(width, 0.1, 0.1)
  }

  const nx = -dz / length
  const nz = dx / length

  const halfWidth = width / 2
  const vertices = new Float32Array([
    startX + nx * halfWidth, 0.02, startZ + nz * halfWidth,
    startX - nx * halfWidth, 0.02, startZ - nz * halfWidth,
    endX + nx * halfWidth, 0.02, endZ + nz * halfWidth,
    endX - nx * halfWidth, 0.02, endZ - nz * halfWidth,
  ])

  const indices = [0, 1, 2, 2, 1, 3]

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()

  return geo
}

const ROAD_MATERIALS: Record<SurfaceType, THREE.MeshStandardMaterial> = {
  grass: new THREE.MeshStandardMaterial({ color: '#4a7c59', roughness: 0.9 }),
  road: new THREE.MeshStandardMaterial({ color: '#3a3a3a', roughness: 0.8, metalness: 0.1 }),
  pavement: new THREE.MeshStandardMaterial({ color: '#5a5a5a', roughness: 0.7 }),
  plaza: new THREE.MeshStandardMaterial({ color: '#6a6a6a', roughness: 0.6, metalness: 0.1 }),
  dirt: new THREE.MeshStandardMaterial({ color: '#6b4a3a', roughness: 1 }),
}

export function RoadSystem({ segments }: RoadSystemProps) {
  const roadMeshes = useMemo(() => {
    return segments.map((seg) => {
      const mat = ROAD_MATERIALS[seg.surface] ?? ROAD_MATERIALS.road
      const geo = createRoadGeometry(seg.start[0], seg.start[1], seg.end[0], seg.end[1], seg.width)
      return { geometry: geo, material: mat, id: seg.id }
    })
  }, [segments])

  return (
    <group>
      {roadMeshes.map((mesh) => (
        <mesh
          key={mesh.id}
          geometry={mesh.geometry}
          material={mesh.material}
          receiveShadow
        />
      ))}
    </group>
  )
}
