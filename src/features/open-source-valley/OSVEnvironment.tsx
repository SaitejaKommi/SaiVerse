'use client'

import { useEffect, useRef } from 'react'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { PhoneBooth } from '@/systems/environment/PhoneBooth'
import { BusStop } from '@/systems/environment/BusStop'
import { Poster } from '@/systems/environment/Poster'
import { Campfire } from '@/systems/environment/Campfire'
import { PaperAirplane } from '@/systems/environment/PaperAirplane'
import { Notebook } from '@/systems/environment/Notebook'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { GroundVegetation } from '@/systems/environment/GroundVegetation'
import { useLightingStore } from '@/stores/lightingStore'
import { GardenPlot } from './GardenPlot'
import { PullRequestBridge } from './PullRequestBridge'
import { KnowledgeArchive } from './KnowledgeArchive'
import { Heartstone } from './Heartstone'
import { IssueBoard } from './IssueBoard'
import { ContributionCounter } from './ContributionCounter'
import { ContributorsWall } from './ContributorsWall'
import { StewardNPC } from './StewardNPC'
import { CarriedItem } from './CarriedItem'
import { QuestAutoAcceptorOSV } from './QuestAutoAcceptor'
import { Chapter4FinaleCamera } from '@/features/cinematics/Chapter4FinaleCamera'
import {
  OSV_BUILDINGS,
  OSV_TREES,
  OSV_LAMPS,
  OSV_PHONE_BOOTHS,
  OSV_BUS_STOPS,
  OSV_ROADS,
} from '@/data/open-source-valley/osv-layout'

function ValleyAmbientAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let stopped = false
    const init = async () => {
      const ctx = new AudioContext()
      ctxRef.current = ctx
      if (ctx.state === 'suspended') await ctx.resume()

      const bufferSize = Math.floor(ctx.sampleRate * 4)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate
        const birds = Math.sin(t * 12) * 0.06
        const wind = Math.sin(t * 0.3) * 0.1
        const rustle = Math.sin(t * 8 + Math.sin(t * 2) * 3) * 0.03
        data[i] = (birds + wind + rustle) * 0.4
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.015, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 2)

      source.connect(gain)
      gain.connect(ctx.destination)
      source.start()

      if (stopped) { source.stop(); await ctx.close() }
    }

    init()
    return () => {
      stopped = true
      if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null }
    }
  }, [])

  return null
}

export function OSVEnvironment() {
  useEffect(() => {
    useLightingStore.getState().setProfile('open-source-valley')
  }, [])

  return (
    <group>
      <QuestAutoAcceptorOSV />
      <ValleyAmbientAudio />
      <CarriedItem />

      {/* Buildings */}
      {OSV_BUILDINGS.map((b, i) => (
        <Building key={`osv-building-${i}`} position={b.position} width={b.width} depth={b.depth} height={b.height} color={b.color} roofColor={b.roofColor} windowsColor={b.windowsColor} style={b.style} />
      ))}

      {/* Trees */}
      {OSV_TREES.map((t, i) => (
        <Tree key={`osv-tree-${i}`} position={t.position} variant={t.variant ?? (i % 3)} scale={t.scale ?? 1} />
      ))}

      {/* Lamps */}
      {OSV_LAMPS.map((l, i) => (
        <StreetLamp key={`osv-lamp-${i}`} position={l.position} />
      ))}

      {/* Phone booths */}
      {OSV_PHONE_BOOTHS.map((p, i) => (
        <PhoneBooth key={`osv-phone-${i}`} position={p.position} rotation={p.rotation ?? 0} color="#5c4033" accentColor="#3a7a33" />
      ))}

      {/* Bus stops */}
      {OSV_BUS_STOPS.map((s, i) => (
        <BusStop key={`osv-bus-${i}`} position={s.position} rotation={s.rotation ?? 0} color="#5c4033" accentColor="#e9c46a" />
      ))}

      {/* Valley vegetation */}
      <GroundVegetation
        bounds={{ minX: -65, maxX: 65, minZ: -575, maxZ: -465 }}
        grassCount={300}
        bushCount={50}
        grassColor="#4a8a5a"
        bushColor="#3a7a4a"
        excludePosition={[0, 0, -520]}
        excludeRadius={25}
      />

      {/* Roads */}
      <RoadSystem segments={OSV_ROADS as any} />

      {/* Interactive stations */}
      <GardenPlot />
      <PullRequestBridge />
      <KnowledgeArchive />

      {/* Environmental storytelling */}
      <Heartstone />
      <IssueBoard />
      <ContributionCounter />
      <ContributorsWall />

      {/* Community campfire discussion area */}
      <Campfire position={[-35, 0, -530]} />

      {/* Community notice board */}
      <Poster position={[-4, 1.2, -520]} rotation={[0, 0, 0]} color="#d4a373" width={0.6} height={0.8} />
      <Poster position={[4, 1.2, -520]} rotation={[0, 0, 0]} color="#e9c46a" width={0.6} height={0.8} />

      {/* Paper airplanes scattered near workspace */}
      <PaperAirplane position={[18, 0.05, -516]} rotation={[0.2, 0.5, 0.1]} />
      <PaperAirplane position={[-18, 0.05, -514]} rotation={[0.1, 2.8, 0.3]} />

      {/* Open laptops / notebooks at workstations */}
      <Notebook position={[22, 0, -515]} rotation={0.5} color="#5c4033" />
      <Notebook position={[-22, 0, -515]} rotation={-0.3} color="#5c4033" />
      <Notebook position={[0, 0, -490]} rotation={0.8} color="#8b7355" />

      {/* NPC */}
      <StewardNPC />

      {/* Finale camera */}
      <Chapter4FinaleCamera />
    </group>
  )
}
