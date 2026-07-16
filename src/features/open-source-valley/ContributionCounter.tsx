'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuestStore } from '@/stores/questStore'
import { OSV_QUEST_ID } from '@/data/open-source-valley/osv-quest'
import { STATION_POSITIONS } from '@/data/open-source-valley/osv-layout'

const TOTAL_CONTRIBUTIONS = 15

export function ContributionCounter() {
  const pillarRef = useRef<THREE.Mesh>(null)
  const runeRefs = useRef<THREE.Mesh[]>([])

  const runePositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < TOTAL_CONTRIBUTIONS; i++) {
      const angle = (i / TOTAL_CONTRIBUTIONS) * Math.PI * 2
      const height = (i / TOTAL_CONTRIBUTIONS) * 1.5
      positions.push([Math.cos(angle) * 0.25, 0.1 + height, Math.sin(angle) * 0.25])
    }
    return positions
  }, [])

  useFrame((state) => {
    const quest = useQuestStore.getState().quests[OSV_QUEST_ID]
    if (!quest) return

    const done = quest.objectives.reduce((sum, o) => sum + o.current, 0)
    const progress = Math.min(1, done / TOTAL_CONTRIBUTIONS)

    if (pillarRef.current) {
      const mat = pillarRef.current.material as THREE.MeshStandardMaterial
      const base = new THREE.Color('#8a5e32')
      const lit = new THREE.Color('#e9c46a')
      mat.color.lerpColors(base, lit, progress)
      mat.emissive = new THREE.Color('#e9c46a')
      mat.emissiveIntensity = progress * 0.2
    }

    runeRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const active = i < done
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = active ? 0.6 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2 : 0.05
      const s = active ? 1 : 0.3
      mesh.scale.setScalar(s)
    })
  })

  const registerRune = (mesh: THREE.Mesh | null, i: number) => {
    if (mesh) runeRefs.current[i] = mesh
  }

  return (
    <group position={STATION_POSITIONS.counterPillar}>
      <mesh ref={pillarRef} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.6, 8]} />
        <meshStandardMaterial color="#8a5e32" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#e9c46a" transparent opacity={0.5} />
      </mesh>
      {runePositions.map((pos, i) => (
        <mesh key={i} ref={(m) => registerRune(m, i)} position={pos}>
          <boxGeometry args={[0.04, 0.06, 0.04]} />
          <meshBasicMaterial color="#e9c46a" transparent opacity={0.05} />
        </mesh>
      ))}
    </group>
  )
}
