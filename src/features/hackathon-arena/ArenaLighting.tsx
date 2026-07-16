'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHackathonStore, type ArenaPhase } from './HackathonStore'

export function ArenaLighting() {
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const fillRef = useRef<THREE.DirectionalLight>(null)
  const stageRef = useRef<THREE.SpotLight>(null)
  const stripRefs = useRef<THREE.Mesh[]>([])

  useFrame((state) => {
    const store = useHackathonStore.getState()
    const timer = store.timeRemaining
    const phase: ArenaPhase = store.phase

    let r = 0.1, g = 0.1, b = 0.25
    let intensity = 0.3
    const stripColor = new THREE.Color('#00d4ff')
    let stripIntensity = 0.3

    if (phase === 'complete') {
      r = 0.8; g = 0.6; b = 0.1
      intensity = 0.8
      stripColor.setHex(0xffd700)
      stripIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    } else if (phase === 'presentation') {
      r = 0.2; g = 0.15; b = 0.4
      intensity = 0.6
      stripColor.setHex(0xa855f7)
      stripIntensity = 0.6
    } else if (timer <= 10) {
      r = 0.4; g = 0.05; b = 0.05
      intensity = 0.2 + Math.sin(state.clock.elapsedTime * 8) * 0.1
      stripColor.setHex(0xff0000)
      stripIntensity = 0.9 + Math.sin(state.clock.elapsedTime * 10) * 0.1
    } else if (timer <= 30) {
      const t = (timer - 10) / 20
      r = 0.1 + t * 0.3
      g = 0.1 - t * 0.05
      b = 0.25 - t * 0.2
      intensity = 0.3 + t * 0.2
      stripColor.setHex(0xff6600)
      stripIntensity = 0.4 + t * 0.3
    } else if (timer <= 60) {
      const t = (timer - 30) / 30
      r = 0.1 + t * 0.1
      g = 0.1
      b = 0.25 - t * 0.1
      intensity = 0.3 + t * 0.1
      stripColor.setHex(0xffaa00)
      stripIntensity = 0.3 + t * 0.1
    }

    if (ambientRef.current) {
      ambientRef.current.color.setRGB(r, g, b)
      ambientRef.current.intensity = intensity
    }

    if (fillRef.current) {
      fillRef.current.color.setRGB(r * 0.5, g * 0.5, b * 0.5)
    }

    if (stageRef.current) {
      stageRef.current.intensity = phase === 'complete' ? 2 : phase === 'presentation' ? 1.5 : 0.8
    }

    stripRefs.current.forEach((mesh) => {
      if (!mesh) return
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.color.copy(stripColor)
      mat.opacity = stripIntensity
    })
  })

  const registerStrip = (mesh: THREE.Mesh | null, i: number) => {
    if (mesh) stripRefs.current[i] = mesh
  }

  return (
    <group>
      <ambientLight ref={ambientRef} intensity={0.3} color="#1a1a3e" />
      <directionalLight ref={fillRef} position={[0, 10, 0]} intensity={0.2} />
      <spotLight ref={stageRef} position={[0, 8, -638]} angle={0.5} penumbra={0.5} intensity={0.8} color="#ffffff" />

      {[-18, -12, -6, 0, 6, 12, 18].map((x, i) => (
        <mesh key={`strip-${i}`} ref={(m) => registerStrip(m, i)} position={[x, 4, -655]}>
          <boxGeometry args={[4, 0.04, 0.04]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
        </mesh>
      ))}
      {[7, 8, 9, 10].map((i) => (
        <mesh key={`strip-v-${i}`} ref={(m) => registerStrip(m, i + 7)} position={[-22, 2 + (i - 7) * 0.4, -640]}>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
        </mesh>
      ))}
      {[11, 12, 13, 14].map((i) => (
        <mesh key={`strip-v2-${i}`} ref={(m) => registerStrip(m, i + 11)} position={[22, 2 + (i - 11) * 0.4, -640]}>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}
