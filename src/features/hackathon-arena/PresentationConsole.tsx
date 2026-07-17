'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { useHackathonStore } from './HackathonStore'
import { HA_QUEST_ID } from '@/data/hackathon-arena/ha-quest'
import { STATION_POSITIONS } from '@/data/hackathon-arena/ha-layout'

const STATION_POS = new THREE.Vector3(...STATION_POSITIONS.presentationConsole)

export function PresentationConsole() {
  const groupRef = useRef<THREE.Group>(null)
  const [phase, setPhase] = useState<'idle' | 'scoreboard' | 'champion' | 'done'>('idle')
  const triggeredRef = useRef(false)
  const notif = useNotificationStore()
  const timerRef = useRef(0)
  const [hovered, setHovered] = useState(false)
  const arenaPhase = useHackathonStore((s) => s.phase)

  useEffect(() => {
    const unsub = useHackathonStore.subscribe((state) => {
      if (state.phase === 'presentation') {
        setPhase('idle')
        triggeredRef.current = false
      }
    })
    return unsub
  }, [])

  useFrame((state, delta) => {
    const store = useHackathonStore.getState()
    if (store.phase !== 'presentation' || store.presentationDone) return

    if (phase === 'scoreboard') {
      timerRef.current += delta
      if (timerRef.current >= 3 && !triggeredRef.current) {
        triggeredRef.current = true
        setPhase('champion')
        store.setPhase('complete')
        store.setMusicState('victory')
        soundFX.playQuestComplete()
        notif.addNotification('quest', 'HACKATHON COMPLETE!', 'You are the Monad Blitz Champion!')
        QuestManager.completeObjective(HA_QUEST_ID, 'obj-presentation')
      }
    }
  })

  const handleActivate = () => {
    const store = useHackathonStore.getState()
    if (store.phase !== 'presentation' || store.presentationDone) return
    if (phase !== 'idle') return

    store.setPresentationDone(true)
    setPhase('scoreboard')
    timerRef.current = 0
    soundFX.playQuestAccept()
  }

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#a855f7'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('PRESENTATION CONSOLE', 128, 16)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group ref={groupRef} position={STATION_POS}>
      {/* Console base */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.4]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.55, 0.15]}>
        <planeGeometry args={[0.35, 0.25]} />
        <meshBasicMaterial color={phase === 'done' ? '#00ff88' : phase === 'scoreboard' ? '#a855f7' : arenaPhase === 'presentation' ? '#a855f7' : '#0a0a1a'} transparent opacity={arenaPhase === 'presentation' && phase === 'idle' ? 0.4 + Math.sin(Date.now() * 0.005) * 0.2 : 0.8} depthTest={false} />
      </mesh>
      {/* Activate button */}
      <mesh
        position={[0, 0.15, 0.2]}
        onClick={handleActivate}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
        <meshStandardMaterial color={hovered ? '#a855f7' : '#333344'} />
      </mesh>
      <sprite position={[0, 0.9, 0]} scale={[1.0, 0.1, 1]}>
        <spriteMaterial map={labelTexture} transparent depthTest={false} />
      </sprite>

      {/* Presentation prompt */}
      {arenaPhase === 'presentation' && phase === 'idle' && (
        <sprite position={[0, -0.2, 0.4]} scale={[0.8, 0.12, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 256; c.height = 32
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#a855f7'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillText('CLICK TO PRESENT', 128, 16)
            return new THREE.CanvasTexture(c)
          })()} transparent depthTest={false} opacity={0.7 + Math.sin(Date.now() * 0.004) * 0.3} />
        </sprite>
      )}
    </group>
  )
}
