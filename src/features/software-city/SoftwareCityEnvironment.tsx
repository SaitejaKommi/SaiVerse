'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CuboidCollider } from '@react-three/rapier'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { useLightingStore } from '@/stores/lightingStore'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { Bench } from '@/systems/environment/Bench'
import { PhoneBooth } from '@/systems/environment/PhoneBooth'
import { BusStop } from '@/systems/environment/BusStop'
import { DigitalDisplay } from '@/systems/environment/DigitalDisplay'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { TechMentorNPC, NPC_DIALOGUE_ID, TERMINAL_ID, CODE_EDITOR_ID } from '@/features/npc/TechMentorNPC'
import { SoftwareCityPortal } from '@/features/software-city/SoftwareCityPortal'
import {
  SC_BUILDINGS,
  SC_TREES,
  SC_LAMPS,
  SC_BENCHES,
  SC_PHONE_BOOTHS,
  SC_BUS_STOPS,
  SC_ROAD_SEGMENTS,
} from '@/data/software-city/sc-layout'

const TECH_HUB_X = 0
const TECH_HUB_Z = -250
const TECH_HUB_WIDTH = 14
const TECH_HUB_DEPTH = 10
const FRONT_WALL_Z = TECH_HUB_Z + TECH_HUB_DEPTH / 2

function DevMonitor({ position, screenRef }: { position: [number, number, number]; screenRef?: React.RefObject<THREE.Mesh | null> }) {
  const internalRef = useRef<THREE.Mesh>(null)
  const ref = screenRef ?? internalRef

  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 0.7) * 0.15
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.38, -0.03]} castShadow>
        <boxGeometry args={[0.6, 0.02, 0.4]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, 0.38, 0.05]}>
        <planeGeometry args={[0.52, 0.35]} />
        <meshStandardMaterial
          color="#0a192f"
          emissive="#00d4ff"
          emissiveIntensity={0.5}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.2, -0.03]} castShadow>
        <boxGeometry args={[0.15, 0.02, 0.1]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.1, -0.03]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.08, 8]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.3} />
      </mesh>
    </group>
  )
}

function TerminalScreen() {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#0a192f'
    ctx.fillRect(0, 0, 1024, 640)

    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 18px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const lines = [
      '$ npx create-next-app@latest software-city --typescript',
      '',
      'Creating a new Next.js app in /projects/software-city',
      '',
      'Installing dependencies:',
      '  \u2713 react 19.0.0',
      '  \u2713 react-dom 19.0.0',
      '  \u2713 next 15.5.20',
      '  \u2713 typescript 5.7.0',
      '  \u2713 tailwindcss 4.0.0',
      '  \u2713 eslint 9.0.0',
      '',
      'Project initialized successfully.',
      'Run `npm run dev` to start.',
      '',
      '> ready - started server on http://localhost:3000',
    ]

    let y = 20
    for (const line of lines) {
      if (line.startsWith('$')) {
        ctx.fillStyle = '#00ff88'
      } else if (line.startsWith('\u2713')) {
        ctx.fillStyle = '#48bb78'
      } else if (line.startsWith('> ready')) {
        ctx.fillStyle = '#00d4ff'
      } else {
        ctx.fillStyle = '#e2e8f0'
      }
      ctx.fillText(line, 25, y)
      y += 28
    }

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  return (
    <mesh position={[0.5, 1.2, -0.1]}>
      <planeGeometry args={[2.0, 1.2]} />
      <meshStandardMaterial map={textureRef.current} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

function CodeEditorScreen() {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#1e1e2e'
    ctx.fillRect(0, 0, 1024, 640)

    ctx.fillStyle = '#6272a4'
    ctx.font = '13px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const code = [
      '// Counter.sx — Bug: title does not update',
      '',
      'import { useState, useEffect } from "react";',
      '',
      'export default function Counter() {',
      '  const [count, setCount] = useState(0);',
      '',
      '  useEffect(() => {',
      '    document.title = `Count: ${count}`;',
      '  }, []); // BUG: missing dependency',
      '',
      '  return (',
      '    <div>',
      '      <p>You clicked {count} times</p>',
      '      <button onClick={() => setCount(c => c + 1)}>',
      '        Increment',
      '      </button>',
      '    </div>',
      '  );',
      '}',
    ]

    let y = 20
    for (const line of code) {
      if (line.startsWith('//')) {
        ctx.fillStyle = '#6272a4'
      } else if (line.includes('import') || line.includes('export')) {
        ctx.fillStyle = '#ff79c6'
      } else if (line.includes('useState') || line.includes('useEffect')) {
        ctx.fillStyle = '#bd93f9'
      } else if (line.includes('function') || line.includes('return')) {
        ctx.fillStyle = '#50fa7b'
      } else if (line.includes('count')) {
        ctx.fillStyle = '#f1fa8c'
      } else if (line.includes('setCount')) {
        ctx.fillStyle = '#8be9fd'
      } else if (line.includes('BUG')) {
        ctx.fillStyle = '#ff5555'
      } else {
        ctx.fillStyle = '#f8f8f2'
      }
      ctx.fillText(line, 25, y)
      y += 22
    }

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  return (
    <mesh position={[-0.5, 1.2, -0.1]}>
      <planeGeometry args={[2.0, 1.2]} />
      <meshStandardMaterial map={textureRef.current} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

function CodingFountain() {
  const beamRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04
    }
  })

  return (
    <group position={[0, 0, -255]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.3, 16]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.2} transparent opacity={0.6} />
      </mesh>
      <mesh ref={beamRef} position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.4, 2.0]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function CodeBillboard({ position, rotation }: { position: [number, number, number]; rotation?: number }) {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 400
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#0a192f'
    ctx.fillRect(0, 0, 300, 400)

    ctx.strokeStyle = '#2dd4bf'
    ctx.lineWidth = 2
    ctx.strokeRect(4, 4, 292, 392)

    ctx.fillStyle = '#2dd4bf'
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('</> CODE', 150, 20)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = '13px monospace'
    ctx.textAlign = 'left'

    const code = [
      'function Ship() {',
      '  const [deployed, setDeployed]',
      '    = useState(false);',
      '  useEffect(() => {',
      '    deploy();',
      '    setDeployed(true);',
      '  }, []);',
      '  return deployed ?',
      '    <LiveSite /> : <Loader />;',
      '}',
    ]

    let y = 60
    for (const line of code) {
      ctx.fillStyle = line.includes('function') ? '#50fa7b'
        : line.includes('useState') || line.includes('useEffect') ? '#bd93f9'
        : line.includes('deploy') ? '#8be9fd'
        : line.includes('LiveSite') || line.includes('Loader') ? '#ff79c6'
        : '#f8f8f2'
      ctx.fillText(line, 25, y)
      y += 22
    }

    ctx.fillStyle = '#2dd4bf'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('React | TypeScript | Next.js', 150, 365)

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  return (
    <mesh position={position} rotation={[0, rotation ?? 0, 0]}>
      <planeGeometry args={[0.8, 1.1]} />
      <meshStandardMaterial map={textureRef.current} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

function ScAmbientAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let stopped = false

    const init = async () => {
      const ctx = new AudioContext()
      ctxRef.current = ctx
      if (ctx.state === 'suspended') await ctx.resume()

      const bufferSize = Math.floor(ctx.sampleRate * 4)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate
        const low = Math.sin(t * 60) * 0.3
        const med = Math.sin(t * 220) * 0.2
        const high = Math.sin(t * 880) * 0.05
        data[i] = (low + med + high) * 0.4
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 400
      filter.Q.value = 0.5

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.015, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 2)

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()

      if (stopped) {
        source.stop()
        await ctx.close()
      }
    }

    init()

    return () => {
      stopped = true
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
      }
    }
  }, [])

  return null
}

function ScLights() {
  const techRef = useRef<THREE.SpotLight>(null)

  useFrame((state) => {
    if (techRef.current) {
      techRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 0.15) * 0.1
    }
  })

  return (
    <>
      <spotLight
        ref={techRef}
        position={[TECH_HUB_X, 6, FRONT_WALL_Z - 2]}
        angle={0.7}
        penumbra={0.8}
        decay={1}
        distance={18}
        color="#2dd4bf"
        intensity={0.5}
      />
      <pointLight position={[TECH_HUB_X, 0.5, FRONT_WALL_Z - 1.5]} color="#00d4ff" intensity={0.15} distance={8} />
    </>
  )
}

function ScNeonSign({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 512, 128)

    ctx.shadowColor = color
    ctx.shadowBlur = 20
    ctx.fillStyle = color
    ctx.font = 'bold 48px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 256, 64)

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  return (
    <mesh position={position}>
      <planeGeometry args={[3, 0.8]} />
      <meshBasicMaterial map={textureRef.current} transparent opacity={0.9} depthTest={false} />
    </mesh>
  )
}

export function SoftwareCityEnvironment() {
  useEffect(() => {
    useLightingStore.getState().setProfile('software-city')
  }, [])

  const { registerObject, unregisterObject } = useInteractionSystem()

  const terminalPos: [number, number, number] = useMemo(() => [4, 0.6, -244], [])
  const editorPos: [number, number, number] = useMemo(() => [-4, 0.6, -244], [])

  useEffect(() => {
    registerObject({
      id: TERMINAL_ID,
      type: 'activate',
      label: 'Configure Terminal',
      position: terminalPos,
      radius: 3,
      isActive: true,
      isInteractable: true,
      data: { dialogueId: NPC_DIALOGUE_ID },
    })
    registerObject({
      id: CODE_EDITOR_ID,
      type: 'use',
      label: 'Open Code Editor',
      position: editorPos,
      radius: 3,
      isActive: true,
      isInteractable: true,
      data: { dialogueId: NPC_DIALOGUE_ID },
    })

    return () => {
      unregisterObject(TERMINAL_ID)
      unregisterObject(CODE_EDITOR_ID)
    }
  }, [registerObject, unregisterObject, terminalPos, editorPos])

  return (
    <group>
      {/* Buildings */}
      {SC_BUILDINGS.map((b, i) => (
        <Building
          key={`sc-building-${i}`}
          position={b.position}
          width={b.width}
          depth={b.depth}
          height={b.height}
          color={b.color}
          roofColor={b.roofColor}
          windowsColor={b.windowsColor}
          style={b.style}
        />
      ))}

      {/* Trees */}
      {SC_TREES.map((t, i) => (
        <Tree
          key={`sc-tree-${i}`}
          position={t.position}
          variant={t.variant ?? (i % 3)}
          scale={t.scale ?? 1}
        />
      ))}

      {/* Street lamps */}
      {SC_LAMPS.map((l, i) => (
        <StreetLamp key={`sc-lamp-${i}`} position={l.position} />
      ))}

      {/* Benches */}
      {SC_BENCHES.map((b, i) => (
        <Bench key={`sc-bench-${i}`} position={b.position} rotation={b.rotation ?? 0} />
      ))}

      {/* Phone booths */}
      {SC_PHONE_BOOTHS.map((p, i) => (
        <PhoneBooth key={`sc-phone-${i}`} position={p.position} rotation={p.rotation ?? 0} color="#16213e" accentColor="#00d4ff" />
      ))}

      {/* Bus stops */}
      {SC_BUS_STOPS.map((s, i) => (
        <BusStop key={`sc-bus-${i}`} position={s.position} rotation={s.rotation ?? 0} color="#16213e" accentColor="#00ff88" />
      ))}

      {/* Digital billboards */}
      <DigitalDisplay position={[-20, 3, -240]} rotation={[0, Math.PI / 2, 0]} color="#00d4ff" width={1.5} height={1} intensity={0.4} />
      <DigitalDisplay position={[20, 3, -240]} rotation={[0, -Math.PI / 2, 0]} color="#00ff88" width={1.5} height={1} intensity={0.4} />
      <DigitalDisplay position={[-20, 3, -260]} rotation={[0, Math.PI / 2, 0]} color="#a855f7" width={1.5} height={1} intensity={0.3} />
      <DigitalDisplay position={[20, 3, -260]} rotation={[0, -Math.PI / 2, 0]} color="#00d4ff" width={1.5} height={1} intensity={0.4} flicker />
      {/* Billboard above boulevard */}
      <DigitalDisplay position={[0, 5, -250]} rotation={[0, 0, 0]} color="#00ff88" width={2.5} height={1.2} intensity={0.5} />
      <DigitalDisplay position={[0, 5, -250]} rotation={[0, Math.PI, 0]} color="#a855f7" width={2.5} height={1.2} intensity={0.5} />

      {/* Roads */}
      <RoadSystem segments={SC_ROAD_SEGMENTS as any} />

      {/* Central coding fountain */}
      <CodingFountain />

      {/* Tech Hub interior */}
      <TechMentorNPC />
      <ScLights />
      <ScAmbientAudio />

      {/* Dev workstation */}
      <mesh position={[4, 0.35, -244]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.5} />
      </mesh>
      <DevMonitor position={[4, 0.76, -244]} />

      {/* Code editor workstation */}
      <mesh position={[-4, 0.35, -244]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.5} />
      </mesh>
      <DevMonitor position={[-4, 0.76, -244]} />

      {/* Terminal screens in Tech Hub */}
      <TerminalScreen />
      <CodeEditorScreen />

      {/* Code posters on Tech Hub walls */}
      <CodeBillboard position={[TECH_HUB_X - 6.5, 1.6, FRONT_WALL_Z - 0.5]} rotation={Math.PI / 2} />
      <CodeBillboard position={[TECH_HUB_X + 6.5, 1.6, FRONT_WALL_Z - 0.5]} rotation={-Math.PI / 2} />

      {/* Neon signs */}
      <ScNeonSign position={[0, 5.5, -258]} text="SOFTWARE CITY" color="#2dd4bf" />
      <ScNeonSign position={[28, 14, -240]} text="INNOVATE" color="#00d4ff" />
      <ScNeonSign position={[-28, 12, -240]} text="BUILD" color="#00ff88" />

      {/* Collision walls for Tech Hub */}
      <CuboidCollider position={[TECH_HUB_X, 9, TECH_HUB_Z]} args={[TECH_HUB_WIDTH / 2, 9, TECH_HUB_DEPTH / 2]} sensor />

      {/* Portal to Software City */}
      <SoftwareCityPortal />
    </group>
  )
}
