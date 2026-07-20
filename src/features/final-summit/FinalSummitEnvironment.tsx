'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useLightingStore } from '@/stores/lightingStore'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { Poster } from '@/systems/environment/Poster'
import { Lantern } from '@/systems/environment/Lantern'
import { Water } from '@/systems/environment/Water'
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

function Flowers({ position }: { position: [number, number, number] }) {
  const stemMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3a7a33', roughness: 0.8 }), [])
  const petalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff6b9d', roughness: 0.6 }), [])
  const petalMat2 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffd700', roughness: 0.6 }), [])

  return (
    <group position={position}>
      {[[0, 0.1, 0], [0.06, 0.12, 0.05], [-0.05, 0.11, -0.04], [0.04, 0.13, -0.05], [-0.06, 0.1, 0.06]].map((p, i) => (
        <group key={`flower-${i}`} position={p as [number, number, number]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.008, 0.1, 4]} />
            <primitive object={stemMat} attach="material" />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.025, 4, 4]} />
            <primitive object={i % 2 === 0 ? petalMat : petalMat2} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function FinalSummitEnvironment() {
  useEffect(() => {
    useLightingStore.getState().setProfile('final-summit')
  }, [])

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

      {/* Lanterns lining the path */}
      <Lantern position={[-8, 0, -720]} color="#ffd700" />
      <Lantern position={[8, 0, -720]} color="#ffd700" />
      <Lantern position={[-5, 0, -740]} color="#ff8844" />
      <Lantern position={[5, 0, -740]} color="#ff8844" />
      <Lantern position={[-3, 0, -760]} color="#ffd700" />
      <Lantern position={[3, 0, -760]} color="#ffd700" />

      {/* Stone inscriptions / mentor quotes */}
      <Poster position={[-6, 1, -725]} rotation={[0, Math.PI / 2, 0]} color="#6b5b3d" width={0.8} height={0.4} />
      <Poster position={[6, 1, -725]} rotation={[0, -Math.PI / 2, 0]} color="#6b5b3d" width={0.8} height={0.4} />
      <Poster position={[-4, 1, -745]} rotation={[0, Math.PI / 2, 0]} color="#5c4a33" width={0.8} height={0.4} />
      <Poster position={[4, 1, -745]} rotation={[0, -Math.PI / 2, 0]} color="#5c4a33" width={0.8} height={0.4} />

      {/* Flowers along the path */}
      <Flowers position={[-10, 0, -715]} />
      <Flowers position={[10, 0, -715]} />
      <Flowers position={[-7, 0, -735]} />
      <Flowers position={[7, 0, -735]} />
      <Flowers position={[-12, 0, -750]} />
      <Flowers position={[12, 0, -750]} />

      {/* Reflection pool */}
      <Water
        position={[0, -0.05, -750]}
        size={[8, 4]}
        color="#1a2a4a"
        opacity={0.35}
      />

      <Monuments />
      <CentralPedestal />
      <FinalSummitCinematic />
    </group>
  )
}
