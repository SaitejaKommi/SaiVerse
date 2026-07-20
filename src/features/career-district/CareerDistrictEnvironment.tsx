'use client'

import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { PhoneBooth } from '@/systems/environment/PhoneBooth'
import { BusStop } from '@/systems/environment/BusStop'
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

      <RoadSystem segments={CD_ROADS as any} />

      <PortfolioPlinth />
      <InterviewPod />
      <CareerCounselor />
      <OfferStage />
    </group>
  )
}
