'use client'

import { useEffect } from 'react'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { AmbientTeams } from './AmbientTeams'
import { ArenaLighting } from './ArenaLighting'
import { buildHAQuest } from '@/data/hackathon-arena/ha-quest'
import { QuestManager } from '@/systems/quest/QuestManager'
import {
  HA_BUILDINGS,
  HA_TREES,
  HA_LAMPS,
  HA_ROADS,
} from '@/data/hackathon-arena/ha-layout'

function QuestRegistrar() {
  useEffect(() => {
    QuestManager.registerQuest(buildHAQuest())
  }, [])
  return null
}

export function HackathonArenaEnvironment() {
  return (
    <group>
      <QuestRegistrar />
      <ArenaLighting />
      <AmbientTeams />

      {HA_BUILDINGS.map((b, i) => (
        <Building key={`ha-building-${i}`} position={b.position} width={b.width} depth={b.depth} height={b.height} color={b.color} roofColor={b.roofColor} windowsColor={b.windowsColor} style={b.style} />
      ))}

      {HA_TREES.map((t, i) => (
        <Tree key={`ha-tree-${i}`} position={t.position} variant={t.variant ?? (i % 3)} scale={t.scale ?? 1} />
      ))}

      {HA_LAMPS.map((l, i) => (
        <StreetLamp key={`ha-lamp-${i}`} position={l.position} />
      ))}

      <RoadSystem segments={HA_ROADS as any} />

      {/* Milestone 2+: CountdownTimer, CodeStation, DebugStation, etc. */}
    </group>
  )
}
