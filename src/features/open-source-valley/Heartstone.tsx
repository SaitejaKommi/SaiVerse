'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuestStore } from '@/stores/questStore'
import { OSV_QUEST_ID } from '@/data/open-source-valley/osv-quest'
import { STATION_POSITIONS } from '@/data/open-source-valley/osv-layout'

const TOTAL_CONTRIBUTIONS = 15

export function Heartstone() {
  const stoneRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const nameRef = useRef<THREE.Sprite>(null)

  const nameTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 96
    const ctx = c.getContext('2d')!
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((state) => {
    const quest = useQuestStore.getState().quests[OSV_QUEST_ID]
    if (!quest) return

    const done = quest.objectives.reduce((sum, o) => sum + o.current, 0)
    const progress = Math.min(1, done / TOTAL_CONTRIBUTIONS)

    if (stoneRef.current) {
      const scale = 0.8 + progress * 0.4
      stoneRef.current.scale.setScalar(scale)

      const mat = stoneRef.current.material as THREE.MeshStandardMaterial
      const baseColor = new THREE.Color('#4a4a4a')
      const restoredColor = new THREE.Color('#e9c46a')
      mat.color.lerpColors(baseColor, restoredColor, progress)
      mat.emissive = new THREE.Color('#e9c46a')
      mat.emissiveIntensity = progress * 0.3
    }

    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial
      const glowIntensity = progress * (0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2)
      glowMat.opacity = glowIntensity
      glowRef.current.scale.setScalar(1 + progress * 0.5)
    }

    if (nameRef.current && progress >= 1) {
      const canvas = nameTexture.image as HTMLCanvasElement
      if (!canvas.getContext) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = '#fefae0'
      ctx.font = 'bold 48px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = '#e9c46a'
      ctx.shadowBlur = 30
      ctx.fillText('Sai', 256, 48)
      nameTexture.needsUpdate = true
      ;(nameTexture as any).context = ctx

      const mat = nameRef.current.material as THREE.SpriteMaterial
      mat.opacity = 1
      const float = Math.sin(state.clock.elapsedTime * 1.5) * 0.05
      nameRef.current.position.y = 1.5 + float
    }
  })

  return (
    <group position={STATION_POSITIONS.heartstone}>
      <mesh ref={stoneRef} position={[0, 0.4, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.4, 0]}>
        <dodecahedronGeometry args={[0.65, 0]} />
        <meshBasicMaterial color="#e9c46a" transparent opacity={0} depthWrite={false} />
      </mesh>
      <sprite ref={nameRef} position={[0, 1.5, 0]} scale={[1.5, 0.3, 1]}>
        <spriteMaterial map={nameTexture} transparent opacity={0} depthTest={false} />
      </sprite>
    </group>
  )
}
