'use client'

import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { AmbientTeams } from './AmbientTeams'
import { ArenaLighting } from './ArenaLighting'
import { CountdownTimer } from './CountdownTimer'
import { BossEventSystem } from './BossEventSystem'
import { CodeStation } from './CodeStation'
import { DebugStation } from './DebugStation'
import { PresentationConsole } from './PresentationConsole'
import { HackathonAudio } from './HackathonAudio'
import { QuestAutoAcceptorHA } from './QuestAutoAcceptorHA'
import { Chapter5FinaleCamera } from '@/features/cinematics/Chapter5FinaleCamera'
import {
  HA_BUILDINGS,
  HA_TREES,
  HA_LAMPS,
  HA_ROADS,
} from '@/data/hackathon-arena/ha-layout'

export function HackathonArenaEnvironment() {
  return (
    <group>
      <QuestAutoAcceptorHA />
      <ArenaLighting />
      <AmbientTeams />
      <CountdownTimer />
      <BossEventSystem />
      <HackathonAudio />

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

      <CodeStation />
      <DebugStation />
      <PresentationConsole />
      <Chapter5FinaleCamera />
    </group>
  )
}
