'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuestStore } from '@/stores/questStore'
import { OSV_QUEST_ID } from '@/data/open-source-valley/osv-quest'

const TOTAL_CONTRIBUTIONS = 15

export function ContributorsWall() {
  const wallRef = useRef<THREE.Mesh>(null)
  const carvingsRef = useRef<THREE.Mesh[]>([])

  const carvings = useMemo(() => {
    const result: [number, number][] = []
    for (let i = 0; i < TOTAL_CONTRIBUTIONS; i++) {
      result.push([-0.5 + (i % 5) * 0.25, 0.2 + Math.floor(i / 5) * 0.25])
    }
    return result
  }, [])

  const registerCarv = (mesh: THREE.Mesh | null, i: number) => {
    if (mesh) carvingsRef.current[i] = mesh
  }

  useFrame(() => {
    const quest = useQuestStore.getState().quests[OSV_QUEST_ID]
    if (!quest) return
    const done = quest.objectives.reduce((sum, o) => sum + o.current, 0)

    carvingsRef.current.forEach((mesh, i) => {
      if (!mesh) return
      const active = i < done
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = active ? 1 : 0.05
    })

    if (wallRef.current) {
      const mat = wallRef.current.material as THREE.MeshStandardMaterial
      const progress = Math.min(1, done / TOTAL_CONTRIBUTIONS)
      const base = new THREE.Color('#6a4e2a')
      const lit = new THREE.Color('#d4a373')
      mat.color.lerpColors(base, lit, progress)
    }
  })

  return (
    <group position={[-6, 1.3, -520]}>
      <mesh ref={wallRef}>
        <boxGeometry args={[1.5, 1.2, 0.1]} />
        <meshStandardMaterial color="#6a4e2a" roughness={0.8} />
      </mesh>
      {carvings.map(([x, y], i) => (
        <mesh key={i} ref={(m) => registerCarv(m, i)} position={[x, y, 0.07]}>
          <boxGeometry args={[0.03, 0.03, 0.02]} />
          <meshBasicMaterial color="#fefae0" transparent opacity={0.05} />
        </mesh>
      ))}
    </group>
  )
}
