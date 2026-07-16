'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlayerStore } from '@/stores/playerStore'
import { useQuestStore } from '@/stores/questStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { CD_QUEST_ID } from '@/data/career-district/cd-quest'

interface PlinthData {
  id: string
  chapterTitle: string
  chapterSubtitle: string
  questId: string
  badgeId: string
  traitIds: string[]
  color: string
  dioramaColor: string
  position: [number, number, number]
}

const PLINTH_DATA: PlinthData[] = [
  { id: 'plinth-0', chapterTitle: 'The Beginning', chapterSubtitle: 'Campus', questId: 'quest-campus', badgeId: 'chapter-0-complete', traitIds: ['first-steps'], color: '#00d4ff', dioramaColor: '#0088cc', position: [80, 0, -8] },
  { id: 'plinth-1', chapterTitle: 'Software City', chapterSubtitle: 'Foundations', questId: 'quest-software-city', badgeId: 'chapter-1-complete', traitIds: ['code-artisan'], color: '#ff6600', dioramaColor: '#cc4400', position: [85, 0, -8] },
  { id: 'plinth-2', chapterTitle: 'Bengaluru Hub', chapterSubtitle: 'Heritage', questId: 'quest-bengaluru-hub', badgeId: 'chapter-2-complete', traitIds: ['community-builder'], color: '#ffd700', dioramaColor: '#ccaa00', position: [90, 0, -8] },
  { id: 'plinth-3', chapterTitle: 'AI District', chapterSubtitle: 'Innovation', questId: 'quest-ai-exploration', badgeId: 'chapter-3-complete', traitIds: ['ai-innovator'], color: '#ff00ff', dioramaColor: '#cc00cc', position: [95, 0, -8] },
  { id: 'plinth-4', chapterTitle: 'Open Source Valley', chapterSubtitle: 'Community', questId: 'quest-open-source-valley', badgeId: 'open-source-contributor', traitIds: ['open-source-advocate'], color: '#00ff88', dioramaColor: '#00cc66', position: [100, 0, -8] },
  { id: 'plinth-5', chapterTitle: 'Hackathon Arena', chapterSubtitle: 'Pressure', questId: 'quest-hackathon-arena', badgeId: 'monad-blitz-champion', traitIds: ['hackathon-champion', 'resilience'], color: '#a855f7', dioramaColor: '#8833cc', position: [105, 0, -8] },
]

const CHAPTER_LABELS: Record<string, string> = {
  'plinth-0': 'PROLOGUE',
  'plinth-1': 'CHAPTER I',
  'plinth-2': 'CHAPTER II',
  'plinth-3': 'CHAPTER III',
  'plinth-4': 'CHAPTER IV',
  'plinth-5': 'CHAPTER V',
}

function PlinthDiorama({ color, activated }: { color: string; activated: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    meshRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
  })

  return (
    <mesh ref={meshRef} position={[0, 0.4, 0]}>
      <octahedronGeometry args={[0.25, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={activated ? 0.5 : 0.15}
        transparent
        opacity={activated ? 1 : 0.4}
        metalness={0.8}
        roughness={0.1}
      />
    </mesh>
  )
}

function HolographicRing({ color, activated }: { color: string; activated: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = Math.PI / 3
    ref.current.rotation.z += 0.01
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = (activated ? 0.6 : 0.15) + Math.sin(state.clock.elapsedTime * 2) * 0.1
  })

  return (
    <mesh ref={ref} position={[0, -0.15, 0]}>
      <ringGeometry args={[0.35, 0.45, 32]} />
      <meshBasicMaterial color={color} transparent opacity={activated ? 0.6 : 0.15} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

export function PortfolioPlinth() {
  const [activatedMap, setActivatedMap] = useState<Record<string, boolean>>({})
  const playerStore = usePlayerStore
  const questStore = useQuestStore

  const plinths = useMemo(() => PLINTH_DATA.map((pd) => {
    const qStore = questStore.getState()
    const quest = qStore.quests[pd.questId]
    const isCompleted = quest?.status === 'completed' || qStore.completedQuestIds.includes(pd.questId)
    const hasBadge = playerStore.getState().badges.includes(pd.badgeId)
    const hasTraits = pd.traitIds.some((t) => playerStore.getState().traits.includes(t))

    const label = CHAPTER_LABELS[pd.id] ?? ''

    let statusText = 'NOT REACHED'
    if (isCompleted || hasBadge) statusText = 'COMPLETED'
    else if (quest?.status === 'accepted') statusText = 'IN PROGRESS'

    return { ...pd, isCompleted, hasBadge, hasTraits, label, statusText }
  }), [])

  const handleActivate = useCallback((index: number) => {
    const pd = plinths[index]
    if (!pd || (!pd.isCompleted && !pd.hasBadge)) return
    const key = pd.id
    setActivatedMap((prev) => {
      if (prev[key]) return prev
      soundFX.playQuestComplete()
      const qKey = `obj-plinth-${index}` as const
      QuestManager.completeObjective(CD_QUEST_ID, qKey)
      return { ...prev, [key]: true }
    })
  }, [plinths])

  return (
    <group>
      {plinths.map((pd, i) => (
        <PlinthSingle
          key={pd.id}
          pd={pd}
          index={i}
          activated={!!activatedMap[pd.id]}
          onActivate={handleActivate}
        />
      ))}
    </group>
  )
}

function PlinthSingle({ pd, index, activated, onActivate }: {
  pd: PlinthData & { isCompleted: boolean; hasBadge: boolean; hasTraits: boolean; label: string; statusText: string }
  index: number
  activated: boolean
  onActivate: (index: number) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const hologramTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128
    const ctx = c.getContext('2d')!
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.roundRect(8, 8, 496, 112, 8); ctx.fill()

    ctx.strokeStyle = pd.color; ctx.lineWidth = 2
    ctx.roundRect(8, 8, 496, 112, 8); ctx.stroke()

    ctx.fillStyle = pd.color
    ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'
    ctx.fillText(pd.label, 256, 32)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'
    ctx.fillText(pd.chapterTitle, 256, 58)

    ctx.fillStyle = '#888899'
    ctx.font = '12px monospace'; ctx.textAlign = 'center'
    ctx.fillText(pd.chapterSubtitle, 256, 78)

    ctx.fillStyle = pd.isCompleted || pd.hasBadge ? '#00ff88' : '#ff4444'
    ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'
    ctx.fillText(pd.statusText, 256, 102)

    return new THREE.CanvasTexture(c)
  }, [pd, activated])

  useFrame((state) => {
    if (!groupRef.current) return
    if (activated) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.04
    }
  })

  const displayName = `${pd.label}: ${pd.chapterTitle}`

  return (
    <group ref={groupRef} position={pd.position}>
      {/* Pedestal base */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.15, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Pedestal column */}
      <mesh position={[0, 0.15, 0]} onClick={() => onActivate(index)} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
        <cylinderGeometry args={[0.2, 0.3, 0.5, 8]} />
        <meshStandardMaterial color={activated ? pd.color : '#2a2a3e'} metalness={0.6} roughness={0.3} emissive={activated ? pd.color : '#000000'} emissiveIntensity={activated ? 0.2 : 0} />
      </mesh>

      {/* Holographic ring */}
      <HolographicRing color={pd.color} activated={activated} />

      {/* Diorama crystal */}
      <PlinthDiorama color={pd.dioramaColor} activated={activated} />

      {/* Hover glow */}
      {hovered && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial color={pd.color} transparent opacity={0.1} depthWrite={false} />
        </mesh>
      )}

      {/* Holographic info display */}
      <sprite position={[0, 0.9, 0]} scale={[1.2, 0.3, 1]}>
        <spriteMaterial map={hologramTexture} transparent depthTest={false} />
      </sprite>

      {/* Name label */}
      <sprite position={[0, 1.3, 0]} scale={[0.8, 0.06, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 20
          const ctx = c.getContext('2d')!
          ctx.fillStyle = pd.color; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(displayName, 128, 10)
          return new THREE.CanvasTexture(c)
        })()} transparent depthTest={false} />
      </sprite>
    </group>
  )
}
