'use client'

import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { QuestAutoAcceptorFS } from './QuestAutoAcceptorFS'
import { FinalSummitAmbient } from './FinalSummitAmbient'
import { Monuments } from './ChapterMonument'
import { CentralPedestal } from './CentralPedestal'
import { FinalSummitCinematic } from './FinalSummitCinematic'
import {
  FS_BUILDINGS,
  FS_TREES,
  FS_LAMPS,
  FS_ROADS,
} from '@/data/final-summit/fs-layout'

export function FinalSummitEnvironment() {
  return (
    <group>
      <QuestAutoAcceptorFS />
      <FinalSummitAmbient />

      {FS_BUILDINGS.map((b, i) => (
        <Building key={`fs-building-${i}`} position={b.position} width={b.width} depth={b.depth} height={b.height} color={b.color} roofColor={b.roofColor} windowsColor={b.windowsColor} style={b.style} />
      ))}

      {FS_TREES.map((t, i) => (
        <Tree key={`fs-tree-${i}`} position={t.position} variant={t.variant ?? (i % 3)} scale={t.scale ?? 1} />
      ))}

      {FS_LAMPS.map((l, i) => (
        <StreetLamp key={`fs-lamp-${i}`} position={l.position} />
      ))}

      <RoadSystem segments={FS_ROADS as any} />

      <Monuments />
      <CentralPedestal />
      <FinalSummitCinematic />
    </group>
  )
}
