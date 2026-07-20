'use client'

import { useEffect } from 'react'
import { useLightingStore } from '@/stores/lightingStore'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { PhoneBooth } from '@/systems/environment/PhoneBooth'
import { BusStop } from '@/systems/environment/BusStop'
import { Poster } from '@/systems/environment/Poster'
import { DigitalDisplay } from '@/systems/environment/DigitalDisplay'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { QuestAutoAcceptorCD } from './QuestAutoAcceptorCD'
import { PortfolioPlinth } from './PortfolioPlinth'
import { InterviewPod } from './InterviewPod'
import { CareerCounselor } from './CareerCounselor'
import { OfferStage } from './OfferStage'
import { CareerDistrictAmbient } from './CareerDistrictAmbient'
import {
  CD_BUILDINGS,
  CD_TREES,
  CD_LAMPS,
  CD_PHONE_BOOTHS,
  CD_BUS_STOPS,
  CD_ROADS,
} from '@/data/career-district/cd-layout'

export function CareerDistrictEnvironment() {
  useEffect(() => {
    useLightingStore.getState().setProfile('career-district')
  }, [])

  return (
    <group>
      <QuestAutoAcceptorCD />
      <CareerDistrictAmbient />

      {CD_BUILDINGS.map((b, i) => (
        <Building key={`cd-building-${i}`} position={b.position} width={b.width} depth={b.depth} height={b.height} color={b.color} roofColor={b.roofColor} windowsColor={b.windowsColor} style={b.style} />
      ))}

      {CD_TREES.map((t, i) => (
        <Tree key={`cd-tree-${i}`} position={t.position} variant={t.variant ?? (i % 3)} scale={t.scale ?? 1} />
      ))}

      {CD_LAMPS.map((l, i) => (
        <StreetLamp key={`cd-lamp-${i}`} position={l.position} />
      ))}

      {/* Phone booths */}
      {CD_PHONE_BOOTHS.map((p, i) => (
        <PhoneBooth key={`cd-phone-${i}`} position={p.position} rotation={p.rotation ?? 0} color="#2d3748" accentColor="#88ccff" />
      ))}

      {/* Bus stops */}
      {CD_BUS_STOPS.map((s, i) => (
        <BusStop key={`cd-bus-${i}`} position={s.position} rotation={s.rotation ?? 0} color="#2d3748" accentColor="#00ff88" />
      ))}

      {/* Career posters on buildings */}
      <Poster position={[55, 2.5, -4]} rotation={[0, 0, 0]} color="#2d3748" width={0.8} height={0.6} />
      <Poster position={[55, 2.5, 4]} rotation={[0, 0, 0]} color="#2d3748" width={0.8} height={0.6} />
      <Poster position={[85, 3, -10]} rotation={[0, 0, 0]} color="#1a1a3e" width={1} height={0.8} />
      <Poster position={[85, 3, 10]} rotation={[0, Math.PI, 0]} color="#1a1a3e" width={1} height={0.8} />
      <Poster position={[95, 3, -10]} rotation={[0, 0, 0]} color="#2d3748" width={0.8} height={0.6} />
      <Poster position={[95, 3, 10]} rotation={[0, Math.PI, 0]} color="#2d3748" width={0.8} height={0.6} />

      {/* Portfolio digital screens */}
      <DigitalDisplay position={[70, 1.6, -22]} rotation={[0, 0, 0]} color="#00d4ff" width={0.6} height={0.4} intensity={0.3} />
      <DigitalDisplay position={[110, 1.6, -22]} rotation={[0, 0, 0]} color="#00ff88" width={0.6} height={0.4} intensity={0.3} />
      <DigitalDisplay position={[70, 1.6, 22]} rotation={[0, 0, 0]} color="#88ccff" width={0.6} height={0.4} intensity={0.3} />
      <DigitalDisplay position={[110, 1.6, 22]} rotation={[0, 0, 0]} color="#a855f7" width={0.6} height={0.4} intensity={0.3} />

      {/* Welcome signage */}
      <Poster position={[55, 3.5, 0]} rotation={[0, Math.PI / 2, 0]} color="#00ff88" width={1.2} height={0.6} />
      <Poster position={[90, 4, -10]} rotation={[0, 0, 0]} color="#2d3748" width={1.5} height={0.8} />

      <RoadSystem segments={CD_ROADS as any} />

      <PortfolioPlinth />
      <InterviewPod />
      <CareerCounselor />
      <OfferStage />
    </group>
  )
}
