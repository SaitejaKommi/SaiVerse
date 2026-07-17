'use client'

import { useRef, useMemo, useCallback, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { OSV_QUEST_ID } from '@/data/open-source-valley/osv-quest'
import { STATION_POSITIONS } from '@/data/open-source-valley/osv-layout'
import { useCarryStore } from './CarrySystem'

const BOOK_POSITIONS = STATION_POSITIONS.archive.books

export function KnowledgeArchive() {
  const completedRef = useRef(false)
  const collectedRef = useRef<boolean[]>([false, false, false, false, false])
  const shelvedRef = useRef<boolean[]>([false, false, false, false, false])
  const prevShelvedRef = useRef(0)
  const [returned, setReturned] = useState(0)
  const notif = useNotificationStore()

  useFrame(() => {
    if (completedRef.current) return
    const s = shelvedRef.current.filter(Boolean).length
    if (s > prevShelvedRef.current) {
      prevShelvedRef.current = s
      setReturned(s)
      soundFX.playQuestComplete()
      if (s >= 5) {
        completedRef.current = true
        notif.addNotification('discovery', 'Archive Complete', 'All knowledge has been returned to the archive')
        QuestManager.completeObjective(OSV_QUEST_ID, 'obj-restock-archive')
      }
    }
  })

  const handleBook = useCallback((index: number) => {
    if (completedRef.current || collectedRef.current[index]) return
    const carrying = useCarryStore.getState().carrying
    if (carrying === null) {
      collectedRef.current[index] = true
      useCarryStore.getState().setCarrying('book')
      soundFX.playQuestAccept()
    }
  }, [])

  const handleShelf = useCallback(() => {
    if (completedRef.current) return
    const carrying = useCarryStore.getState().carrying
    if (carrying === 'book') {
      useCarryStore.getState().setCarrying(null)
      const nextSlot = shelvedRef.current.findIndex((v) => !v)
      if (nextSlot >= 0) {
        shelvedRef.current[nextSlot] = true
      }
    }
  }, [])

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#e9c46a'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('KNOWLEDGE ARCHIVE', 128, 16)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group position={STATION_POSITIONS.archive.center}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2.5, 2, 0.5]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>

      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={`shelf-${i}`}
          position={[-0.9 + i * 0.45, 0.3 + (i % 2) * 0.8, 0.3]}
          onClick={handleShelf}
        >
          <boxGeometry args={[0.35, 0.04, 0.3]} />
          <meshStandardMaterial color={i < returned ? '#e9c46a' : '#8a5e32'} transparent opacity={i < returned ? 1 : 0.3} />
        </mesh>
      ))}

      {BOOK_POSITIONS.map((pos, i) => (
        <BookMesh
          key={i}
          position={[pos[0] - STATION_POSITIONS.archive.center[0], pos[1], pos[2] - STATION_POSITIONS.archive.center[2]]}
            collected={collectedRef.current[i] ?? false}
          onClick={() => handleBook(i)}
        />
      ))}

      <sprite position={[0, 2.2, 0]} scale={[1.2, 0.12, 1]}>
        <spriteMaterial map={labelTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}

function BookMesh({ position, collected, onClick }: {
  position: [number, number, number]
  collected: boolean
  onClick: () => void
}) {
  return (
    <mesh position={position} onClick={collected ? undefined : onClick}>
      <boxGeometry args={[0.15, 0.18, 0.08]} />
      <meshStandardMaterial color={collected ? '#8a5e32' : '#e9c46a'} transparent opacity={collected ? 0.3 : 1} />
    </mesh>
  )
}
