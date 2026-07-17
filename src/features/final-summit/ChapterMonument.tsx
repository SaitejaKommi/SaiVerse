'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { FS_QUEST_ID } from '@/data/final-summit/fs-quest'
import { MONUMENT_POSITIONS } from '@/data/final-summit/fs-layout'

interface MonumentDef {
  id: string
  chapterIndex: number
  title: string
  subtitle: string
  questId: string
  badgeId: string
  emotionalLine: string
  color: string
  position: [number, number, number]
}

const MONUMENT_DATA: MonumentDef[] = [
  { id: 'fs-monument-0', chapterIndex: 0, title: 'The Beginning', subtitle: 'Where it all started', questId: 'quest-first-step', badgeId: 'chapter-0-complete', emotionalLine: '"Every expert was once a beginner."', color: '#00d4ff', position: MONUMENT_POSITIONS[0]! },
  { id: 'fs-monument-1', chapterIndex: 1, title: 'The First Lesson', subtitle: 'Campus foundations', questId: 'quest-first-lesson', badgeId: 'chapter-1-complete', emotionalLine: '"Every expert was once a beginner."', color: '#ff6600', position: MONUMENT_POSITIONS[1]! },
  { id: 'fs-monument-2', chapterIndex: 2, title: 'Software City', subtitle: 'Foundations of code', questId: 'quest-software-project', badgeId: 'chapter-2-complete', emotionalLine: '"Code is poetry in motion."', color: '#ffd700', position: MONUMENT_POSITIONS[2]! },
  { id: 'fs-monument-3', chapterIndex: 3, title: 'AI District', subtitle: 'Into the future', questId: 'quest-ai-exploration', badgeId: 'chapter-3-complete', emotionalLine: '"Intelligence is the art of learning."', color: '#ff00ff', position: MONUMENT_POSITIONS[3]! },
  { id: 'fs-monument-4', chapterIndex: 4, title: 'Open Source Valley', subtitle: 'Building together', questId: 'quest-open-source-valley', badgeId: 'open-source-contributor', emotionalLine: '"Alone we code, together we build."', color: '#00ff88', position: MONUMENT_POSITIONS[4]! },
  { id: 'fs-monument-5', chapterIndex: 5, title: 'Hackathon Arena', subtitle: 'Under pressure', questId: 'quest-hackathon-arena', badgeId: 'monad-blitz-champion', emotionalLine: '"Pressure breeds diamonds."', color: '#a855f7', position: MONUMENT_POSITIONS[5]! },
  { id: 'fs-monument-6', chapterIndex: 6, title: 'Career District', subtitle: 'The offering', questId: 'quest-career-district', badgeId: 'career-ready', emotionalLine: '"Every skill earned, every challenge faced."', color: '#e8845a', position: MONUMENT_POSITIONS[6]! },
  { id: 'fs-monument-7', chapterIndex: 7, title: 'Full Circle', subtitle: 'The journey continues', questId: '', badgeId: '', emotionalLine: '"This was my journey. Now go build yours."', color: '#ffd700', position: MONUMENT_POSITIONS[7]! },
]

function MonumentCrystal({ color, activated }: { color: string; activated: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    meshRef.current.position.y = 1.3 + Math.sin(state.clock.elapsedTime * 0.6 + Math.PI) * 0.08
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = (activated ? 0.6 : 0.1) + Math.sin(state.clock.elapsedTime * 1.2) * 0.15
  })

  return (
    <mesh ref={meshRef} position={[0, 1.1, 0]}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={activated ? 0.6 : 0.1}
        transparent
        opacity={activated ? 1 : 0.5}
        metalness={0.9}
        roughness={0.05}
      />
    </mesh>
  )
}

function MonumentRing({ color, activated }: { color: string; activated: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = Math.PI / 3
    ref.current.rotation.z += 0.008
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = (activated ? 0.5 : 0.1) + Math.sin(state.clock.elapsedTime * 1.5) * 0.08
  })

  return (
    <mesh ref={ref} position={[0, 0.6, 0]}>
      <ringGeometry args={[0.45, 0.55, 32]} />
      <meshBasicMaterial color={color} transparent opacity={activated ? 0.5 : 0.1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

export function ChapterMonument({ monument, onActivate, activated }: {
  monument: MonumentDef
  onActivate: (id: string) => void
  activated: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const hologramTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 160
    const ctx = c.getContext('2d')!

    ctx.fillStyle = 'rgba(10, 10, 26, 0.85)'
    ctx.roundRect(8, 8, 496, 144, 8); ctx.fill()

    ctx.strokeStyle = monument.color; ctx.lineWidth = 2
    ctx.roundRect(8, 8, 496, 144, 8); ctx.stroke()

    ctx.fillStyle = monument.color
    ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'
    ctx.fillText(monument.title, 256, 35)

    ctx.fillStyle = '#888899'
    ctx.font = '13px monospace'; ctx.textAlign = 'center'
    ctx.fillText(monument.subtitle, 256, 58)

    ctx.fillStyle = '#ccccdd'
    ctx.font = 'italic 12px monospace'; ctx.textAlign = 'center'
    ctx.fillText(monument.emotionalLine, 256, 88)

    ctx.fillStyle = monument.color
    ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'
    ctx.fillText(activated ? 'REFLECTED' : 'REFLECT', 256, 120)

    return new THREE.CanvasTexture(c)
  }, [monument, activated])

  useFrame((state) => {
    if (!groupRef.current) return
    if (activated) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.04
    }
  })

  const handleClick = () => onActivate(monument.id)

  return (
    <group ref={groupRef} position={monument.position}>
      {/* Base platform */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.2, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Pillar */}
      <mesh
        position={[0, 0.5, 0]}
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.2, 0.3, 1.0, 8]} />
        <meshStandardMaterial
          color={activated ? monument.color : '#2a2a3e'}
          metalness={0.6}
          roughness={0.3}
          emissive={activated ? monument.color : '#000000'}
          emissiveIntensity={activated ? 0.3 : 0}
        />
      </mesh>

      <MonumentRing color={monument.color} activated={activated} />
      <MonumentCrystal color={monument.color} activated={activated} />

      {/* Hover glow */}
      {hovered && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial color={monument.color} transparent opacity={0.08} depthWrite={false} />
        </mesh>
      )}

      {/* Holographic info */}
      <sprite position={[0, 1.8, 0]} scale={[1.4, 0.45, 1]}>
        <spriteMaterial map={hologramTexture} transparent depthTest={false} />
      </sprite>

      {/* Title label */}
      <sprite position={[0, 2.4, 0]} scale={[0.8, 0.05, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 20
          const ctx = c.getContext('2d')!
          ctx.fillStyle = monument.color; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(monument.title, 128, 10)
          return new THREE.CanvasTexture(c)
        })()} transparent depthTest={false} />
      </sprite>
    </group>
  )
}

export function Monuments() {
  const [activatedMap, setActivatedMap] = useState<Record<string, boolean>>({})
  const groupRef = useRef<THREE.Group>(null)
  const activatedRef = useRef<Set<string>>(new Set())

  const handleActivate = useCallback((id: string) => {
    if (activatedRef.current.has(id)) return
    activatedRef.current.add(id)

    const index = MONUMENT_DATA.findIndex((m) => m.id === id)
    if (index === -1) return

    setActivatedMap((prev) => ({ ...prev, [id]: true }))

    const qKey = `obj-monument-${index}` as const
    QuestManager.completeObjective(FS_QUEST_ID, qKey)
    soundFX.playQuestComplete()
    soundFX.playUIBeep(800, 0.15, 0.1)
  }, [])

  return (
    <group ref={groupRef}>
      {MONUMENT_DATA.map((m) => (
        <ChapterMonument
          key={m.id}
          monument={m}
          onActivate={handleActivate}
          activated={!!activatedMap[m.id]}
        />
      ))}
    </group>
  )
}
