'use client'

import { useEffect } from 'react'
import { useLightingStore } from '@/stores/lightingStore'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { Poster } from '@/systems/environment/Poster'
import { CoffeeCup } from '@/systems/environment/CoffeeCup'
import { PizzaBox } from '@/systems/environment/PizzaBox'
import { Whiteboard } from '@/systems/environment/Whiteboard'
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
  useEffect(() => {
    useLightingStore.getState().setProfile('hackathon-arena')
  }, [])

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

      {/* Whiteboards with notes */}
      <Whiteboard position={[-10, 0, 580]} rotation={0} />
      <Whiteboard position={[10, 0, 580]} rotation={Math.PI} />
      <Whiteboard position={[0, 0, 610]} rotation={-Math.PI / 2} />

      {/* Debug warning posters */}
      <Poster position={[-8, 2, 580]} rotation={[0, 0, 0]} color="#ff4444" width={0.5} height={0.4} />
      <Poster position={[8, 2, 580]} rotation={[0, 0, 0]} color="#ffaa00" width={0.5} height={0.4} />
      <Poster position={[0, 2, 610]} rotation={[0, Math.PI / 2, 0]} color="#ff4444" width={0.6} height={0.5} />
      <Poster position={[0, 2, 610]} rotation={[0, -Math.PI / 2, 0]} color="#00ff88" width={0.6} height={0.5} />

      {/* Pizza boxes and coffee cups */}
      <PizzaBox position={[-12, 0, 585]} rotation={0.5} />
      <PizzaBox position={[12, 0, 585]} rotation={-0.3} />
      <CoffeeCup position={[-11, 0, 585]} rotation={0.8} color="#ff4444" />
      <CoffeeCup position={[11, 0, 585]} rotation={-0.5} color="#ffaa00" />
      <CoffeeCup position={[0, 0, 605]} rotation={0.2} color="#ffffff" />

      {/* Sponsor banners */}
      <Poster position={[-15, 3, 600]} rotation={[0, Math.PI / 2, 0]} color="#2d3748" width={2} height={1.2} />
      <Poster position={[15, 3, 600]} rotation={[0, -Math.PI / 2, 0]} color="#2d3748" width={2} height={1.2} />

      <CodeStation />
      <DebugStation />
      <PresentationConsole />
      <Chapter5FinaleCamera />
    </group>
  )
}
