'use client'

import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { Bench } from '@/systems/environment/Bench'
import { Fountain } from '@/systems/environment/Fountain'
import { GroundVegetation } from '@/systems/environment/GroundVegetation'
import { SignPost } from '@/systems/environment/SignPost'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { ClassroomEnvironment } from '@/features/campus/ClassroomEnvironment'

import {
  CAMPUS_BUILDINGS,
  CAMPUS_TREES,
  CAMPUS_BENCHES,
  CAMPUS_LAMPS,
  CAMPUS_ROADS,
} from '@/data/bengaluru/campus-layout'

export function CampusEnvironment() {
  return (
    <group>
      {CAMPUS_BUILDINGS.map((b, i) => (
        <Building
          key={`campus-building-${i}`}
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

      {CAMPUS_TREES.map((t, i) => (
        <Tree
          key={`campus-tree-${i}`}
          position={t.position}
          variant={t.variant ?? (i % 3)}
          scale={t.scale ?? 1}
        />
      ))}

      {CAMPUS_BENCHES.map((b, i) => (
        <Bench
          key={`campus-bench-${i}`}
          position={b.position}
          rotation={b.rotation ?? 0}
        />
      ))}

      {CAMPUS_LAMPS.map((l, i) => (
        <StreetLamp
          key={`campus-lamp-${i}`}
          position={l.position}
        />
      ))}

      {/* Courtyard fountain */}
      <Fountain position={[0, 0, -130]} scale={1.0} />

      {/* Direction signs */}
      <SignPost position={[-4, 0, -104]} rotation={0} color='#8b7355' />
      <SignPost position={[4, 0, -104]} rotation={Math.PI} color='#8b7355' />

      {/* Campus vegetation */}
      <GroundVegetation
        bounds={{ minX: -55, maxX: 55, minZ: -205, maxZ: -110 }}
        grassCount={250}
        bushCount={40}
        grassColor="#3a7a33"
        bushColor="#2d6a2e"
        excludePosition={[0, 0, -130]}
        excludeRadius={20}
      />

      {/* Campus roads */}
      <RoadSystem segments={CAMPUS_ROADS as any} />

      {/* Classroom Wing */}
      <ClassroomEnvironment />
    </group>
  )
}
