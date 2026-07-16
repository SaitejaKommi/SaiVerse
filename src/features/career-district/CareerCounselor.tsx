'use client'

import { useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { COUNSELOR_POSITION } from '@/data/career-district/cd-layout'

const DIALOGUE_LINES = [
  'Welcome to the Career District, Sai. This is your exhibition.',
  'Every chapter of your journey is displayed on those plinths.',
  'Visit each one. Let the recruiters see what you have built.',
  'When you are ready, the stage awaits to formalize your offer.',
  'Take your time. This moment is yours.',
]

export function CareerCounselor() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const notif = useNotificationStore()

  const handleClick = () => {
    if (done) return
    soundFX.playDialogueOpen()
    if (step < DIALOGUE_LINES.length - 1) {
      const next = step + 1
      setStep(next)
      notif.addNotification('quest', 'Career Counselor', DIALOGUE_LINES[next]!)
    } else {
      setDone(true)
      notif.addNotification('quest', 'Career Counselor', DIALOGUE_LINES[DIALOGUE_LINES.length - 1]!)
    }
  }

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('CAREER COUNSELOR', 128, 16)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group ref={groupRef} position={COUNSELOR_POSITION}>
      {/* NPC body */}
      <mesh position={[0, 0.5, 0]} onClick={handleClick}>
        <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.95, 0]} onClick={handleClick}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#88ddff" emissive="#00d4ff" emissiveIntensity={0.15} />
      </mesh>

      {/* Counselors desk */}
      <mesh position={[0.2, 0.15, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#2a2a4a" metalness={0.6} roughness={0.3} />
      </mesh>

      <sprite position={[0, 1.4, 0]} scale={[1.0, 0.12, 1]}>
        <spriteMaterial map={labelTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}
