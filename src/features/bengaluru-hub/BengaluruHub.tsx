'use client'

import { useEffect } from 'react'
import { SpawnProvider, useSpawnSystem } from '@/systems/world/SpawnPoint'
import { FastTravelProvider, useFastTravel } from '@/systems/world/FastTravel'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { Terrain } from '@/systems/world/Terrain'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { WorldStreamer } from '@/systems/world/WorldStreamer'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { Bench } from '@/systems/environment/Bench'
import { Fountain } from '@/systems/environment/Fountain'
import { SignPost } from '@/systems/environment/SignPost'
import { Statue } from '@/systems/environment/Statue'
import { MetroTrack } from '@/systems/environment/MetroTrack'
import { Skybox } from '@/systems/world/Skybox'
import { WeatherManager } from '@/systems/world/WeatherManager'
import { ParticleManager } from '@/systems/world/ParticleManager'
import { NavigationMesh } from '@/systems/world/NavigationMesh'
import { PlaceholderNPC } from '@/features/npc/PlaceholderNPC'
import { CampusEntrance } from '@/features/bengaluru-hub/CampusEntrance'
import { CampusRevealCinematic } from '@/features/cinematics/CampusRevealCinematic'
import { ChapterFinaleCamera } from '@/features/cinematics/ChapterFinaleCamera'
import { CampusEnvironment } from '@/features/campus/CampusEnvironment'
import { SoftwareCitySkyline } from '@/features/world/SoftwareCitySkyline'
import { SkillUnlockEffect } from '@/features/effects/SkillUnlockEffect'
import { CAMPUS_BOUNDS } from '@/data/bengaluru/campus-layout'

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
  const { registerObject } = useInteractionSystem()

  useEffect(() => {
    for (const spawn of SPAWN_POINTS) {
      registerSpawn(spawn)
    }
    for (const node of FAST_TRAVEL_NODES) {
      registerNode(node)
    }
    for (const obj of INTERACTIVE_OBJECTS) {
      registerObject({
        id: obj.id,
        type: obj.type as any,
        label: 'Interact',
        position: obj.position,
        radius: obj.radius ?? 3,
        isActive: true,
        isInteractable: true,
        data: obj.data,
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
          roofColor={b.roofColor}
          windowsColor={b.windowsColor}
          style={b.style}
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

      {/* Center plaza */}
      <Fountain position={[0, 0, 0]} scale={1.2} />
      <Statue position={[0, 0, -14]} scale={1.0} />

      {/* District signposts */}
      <SignPost position={[0, 0, -26]} rotation={0} color='#3b5998' />
      <SignPost position={[0, 0, 28]} rotation={Math.PI} color='#c05621' />
      <SignPost position={[28, 0, 0]} rotation={-Math.PI / 2} color='#2b6cb0' />
      <SignPost position={[-28, 0, 0]} rotation={Math.PI / 2} color='#553c9a' />

      {/* Elevated metro track */}
      <MetroTrack position={[0, 0, -70]} length={80} rotation={0} />

      <PlaceholderNPC />
      <CampusEntrance />
      <CampusRevealCinematic />
      <ChapterFinaleCamera />
      <CampusEnvironment />
      <SoftwareCitySkyline />
      <SkillUnlockEffect />
    </group>
  )
}

export function BengaluruHub() {
  const navMesh = new NavigationMesh(2)
  const isWalkable = (x: number, z: number) => {
    const inHub = x >= HUB_BOUNDS.minX && x <= HUB_BOUNDS.maxX &&
      z >= HUB_BOUNDS.minZ && z <= HUB_BOUNDS.maxZ
    const inCampus = x >= CAMPUS_BOUNDS.minX && x <= CAMPUS_BOUNDS.maxX &&
      z >= CAMPUS_BOUNDS.minZ && z <= CAMPUS_BOUNDS.maxZ
    if (!inHub && !inCampus) return false
    if (inCampus) return true
    const centerDist = Math.sqrt(x * x + z * z)
    return centerDist < 70
  }
  navMesh.buildFromWalkableArea(isWalkable, 150)

  return (
    <SpawnProvider defaultSpawnId="hub-center">
      <FastTravelProvider>
        <HubAssets />

        <WorldStreamer loadRadius={3}>
          <Skybox />
          <WeatherManager enableCycle={true} initialWeather="clear" />
          <ParticleManager maxParticles={2000} rainArea={80} />

          <Terrain tiles={TERRAIN_TILES} size={50} />
          <RoadSystem segments={ROAD_SEGMENTS} />

          <HubEnvironment />
        </WorldStreamer>
      </FastTravelProvider>
    </SpawnProvider>
  )
}
