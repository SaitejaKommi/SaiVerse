'use client'

import { useEffect } from 'react'
import { SpawnProvider, useSpawnSystem } from '@/systems/world/SpawnPoint'
import { FastTravelProvider, useFastTravel } from '@/systems/world/FastTravel'
import { InteractiveProvider, useInteractiveSystem } from '@/systems/interaction/InteractiveObject'
import { Terrain } from '@/systems/world/Terrain'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { WorldStreamer } from '@/systems/world/WorldStreamer'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { Bench } from '@/systems/environment/Bench'
import { Skybox } from '@/systems/world/Skybox'
import { WeatherManager } from '@/systems/world/WeatherManager'
import { ParticleManager } from '@/systems/world/ParticleManager'
import { NavigationMesh } from '@/systems/world/NavigationMesh'

import {
  TERRAIN_TILES,
  ROAD_SEGMENTS,
  BUILDINGS,
  TREES,
  LAMPS,
  BENCHES,
  SPAWN_POINTS,
  FAST_TRAVEL_NODES,
  INTERACTIVE_OBJECTS,
  HUB_BOUNDS,
} from '@/data/bengaluru/hub-layout'

function HubAssets() {
  const { registerSpawn } = useSpawnSystem()
  const { registerNode } = useFastTravel()
  const { registerObject } = useInteractiveSystem()

  useEffect(() => {
    for (const spawn of SPAWN_POINTS) {
      registerSpawn(spawn)
    }
    for (const node of FAST_TRAVEL_NODES) {
      registerNode(node)
    }
    for (const obj of INTERACTIVE_OBJECTS) {
      registerObject({
        ...obj,
        radius: obj.radius ?? 3,
        isActive: true,
        isInteractable: true,
      })
    }
  }, [registerSpawn, registerNode, registerObject])

  return null
}

function HubEnvironment() {
  return (
    <group>
      {BUILDINGS.map((b, i) => (
        <Building
          key={`building-${i}`}
          position={b.position}
          width={b.width}
          depth={b.depth}
          height={b.height}
          color={b.color}
        />
      ))}

      {TREES.map((t, i) => (
        <Tree
          key={`tree-${i}`}
          position={t.position}
          variant={t.variant ?? (i % 3)}
          scale={t.scale ?? 1}
        />
      ))}

      {LAMPS.map((l, i) => (
        <StreetLamp
          key={`lamp-${i}`}
          position={l.position}
        />
      ))}

      {BENCHES.map((b, i) => (
        <Bench
          key={`bench-${i}`}
          position={b.position}
          rotation={b.rotation ?? 0}
        />
      ))}
    </group>
  )
}

export function BengaluruHub() {
  const navMesh = new NavigationMesh(2)
  const isWalkable = (x: number, z: number) => {
    const inBounds = x >= HUB_BOUNDS.minX && x <= HUB_BOUNDS.maxX &&
      z >= HUB_BOUNDS.minZ && z <= HUB_BOUNDS.maxZ
    if (!inBounds) return false
    const centerDist = Math.sqrt(x * x + z * z)
    return centerDist < 70
  }
  navMesh.buildFromWalkableArea(isWalkable, 150)

  return (
    <SpawnProvider defaultSpawnId="hub-center">
      <FastTravelProvider>
        <InteractiveProvider>
          <HubAssets />

          <WorldStreamer loadRadius={3}>
            <Skybox />
            <WeatherManager enableCycle={true} initialWeather="clear" />
            <ParticleManager maxParticles={2000} rainArea={80} />

            <Terrain tiles={TERRAIN_TILES} size={50} />
            <RoadSystem segments={ROAD_SEGMENTS} />

            <HubEnvironment />
          </WorldStreamer>
        </InteractiveProvider>
      </FastTravelProvider>
    </SpawnProvider>
  )
}
