'use client'

import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { soundFX } from '@/systems/audio/SoundFX'
import { useHackathonStore } from './HackathonStore'
import { STATION_POSITIONS } from '@/data/hackathon-arena/ha-layout'

const STATION_POS = new THREE.Vector3(...STATION_POSITIONS.debugStation)
const INTERACT_RADIUS = 4

const SWITCH_COUNT = 3

function randomSolution(): boolean[] {
  return Array.from({ length: SWITCH_COUNT }, () => Math.random() > 0.5)
}

export function DebugStation() {
  const groupRef = useRef<THREE.Group>(null)
  const panelRef = useRef<THREE.Mesh>(null)
  const [switches, setSwitches] = useState<boolean[]>([false, false, false])
  const [solution, setSolution] = useState<boolean[]>([true, false, true])
  const [solved, setSolved] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [inRange, setInRange] = useState(false)

  useFrame((state) => {
    const store = useHackathonStore.getState()
    const setback = store.activeSetback
    const activeNow = setback !== null && setback.station === 'debug'
    setIsActive(activeNow)

    const player = useGameStore.getState().player
    if (!player) return
    const dx = player.position[0] - STATION_POS.x
    const dz = player.position[2] - STATION_POS.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    setInRange(dist < INTERACT_RADIUS)

    // Screen glow
    if (panelRef.current) {
      const mat = panelRef.current.material as THREE.MeshBasicMaterial
      if (activeNow) {
        mat.color.setHex(0xff3333)
        mat.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.2
      } else if (solved) {
        mat.color.setHex(0x00ff88)
        mat.opacity = 0.4
      } else {
        mat.color.setHex(0x1a1a3e)
        mat.opacity = 0.2
      }
    }
  })

  // Reset when a new setback appears
  useEffect(() => {
    if (isActive && !solved) {
      const sol = randomSolution()
      setSolution(sol)
      setSwitches([false, false, false])
    }
  }, [isActive])

  const handleToggle = useCallback((index: number) => {
    if (!isActive || solved) return
    setSwitches((prev) => {
      const next = [...prev]
      next[index] = !next[index]

      // Check if solved
      const allMatch = next.every((v, i) => v === solution[i])
      if (allMatch) {
        setSolved(true)
        soundFX.playQuestComplete()
        const store = useHackathonStore.getState()
        store.setActiveSetback(null)
        store.modifyTeamEnergy(10)
        store.incrementSetbacksResolved()

        setTimeout(() => {
          setSolved(false)
          setSwitches([false, false, false])
        }, 1500)
      } else {
        soundFX.playQuestAccept()
      }

      return next
    })
  }, [isActive, solved, solution])

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#ff4444'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('DEBUG CONSOLE', 128, 16)
    return new THREE.CanvasTexture(c)
  }, [])

  const patchTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 48
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#00ff88'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('PATCH APPLIED', 128, 24)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group ref={groupRef} position={STATION_POS}>
      {/* Console desk */}
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Panel screen */}
      <mesh ref={panelRef} position={[0, 0.75, 0.35]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshBasicMaterial color="#1a1a3e" transparent opacity={0.2} depthTest={false} />
      </mesh>

      {/* Error message display */}
      {isActive && !solved && (
        <ErrorDisplay solution={solution} switches={switches} />
      )}

      {solved && (
        <sprite position={[0, 0.8, 0.4]} scale={[0.8, 0.15, 1]}>
          <spriteMaterial map={patchTexture} transparent depthTest={false} />
        </sprite>
      )}

      {/* Toggle switches */}
      {Array.from({ length: SWITCH_COUNT }).map((_, i) => (
        <SwitchMesh
          key={i}
          position={[-0.4 + i * 0.4, 0.3, 0.35]}
          toggled={switches[i] ?? false}
          onClick={() => handleToggle(i)}
          isActive={isActive && !solved}
        />
      ))}

      {/* Status lights */}
      {Array.from({ length: SWITCH_COUNT }).map((_, i) => (
        <mesh key={`light-${i}`} position={[-0.4 + i * 0.4, 0.55, 0.35]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color={(switches[i] ?? false) === (solution[i] ?? false) ? '#00ff88' : '#ff3333'} transparent opacity={isActive ? 0.9 : 0.1} />
        </mesh>
      ))}

      <sprite position={[0, 2.0, 0]} scale={[1.2, 0.12, 1]}>
        <spriteMaterial map={labelTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}

function ErrorDisplay({ solution: sol, switches: sw }: { solution: boolean[]; switches: boolean[] }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; ctx.fillRect(0, 0, 256, 64)
    ctx.fillStyle = '#ff3333'; ctx.font = '9px monospace'; ctx.textAlign = 'left'
    ctx.fillText('! CRITICAL ERROR', 10, 18)
    ctx.fillStyle = '#ff8888'; ctx.font = '8px monospace'
    ctx.fillText('Set switches to match target', 10, 35)
    ctx.fillText(`Target: ${(sol ?? []).map((v: boolean) => v ? '1' : '0').join(' | ')}`, 10, 52)
    return new THREE.CanvasTexture(c)
  }, [sol])

  return (
    <sprite position={[0, -0.2, 0.4]} scale={[0.9, 0.22, 1]}>
      <spriteMaterial map={tex} transparent depthTest={false} />
    </sprite>
  )
}

function SwitchMesh({ position, toggled, onClick, isActive }: {
  position: [number, number, number]
  toggled: boolean
  onClick: () => void
  isActive: boolean
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!ref.current) return
    ref.current.position.y = toggled ? 0.05 : -0.05
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.color.setHex(isActive ? (toggled ? 0x00ff88 : 0xff4444) : 0x333344)
  })

  return (
    <mesh ref={ref} position={position} onClick={isActive ? onClick : undefined}>
      <boxGeometry args={[0.08, 0.12, 0.04]} />
      <meshStandardMaterial color="#333344" metalness={0.5} roughness={0.4} />
    </mesh>
  )
}
