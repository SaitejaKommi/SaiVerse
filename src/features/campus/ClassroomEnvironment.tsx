'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CuboidCollider } from '@react-three/rapier'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { ProfessorNPC, NPC_DIALOGUE_ID, WHITEBOARD_ID, COMPUTER_ID } from '@/features/npc/ProfessorNPC'
import { StudentNPC } from '@/features/npc/StudentNPC'

const BUILDING_X = 23
const BUILDING_Z = -150
const BUILDING_WIDTH = 10
const BUILDING_DEPTH = 10
const FRONT_WALL_Z = BUILDING_Z + BUILDING_DEPTH / 2

function Desk({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.05, 0.5]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      <mesh position={[-0.35, 0.15, -0.2]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh position={[0.35, 0.15, -0.2]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh position={[-0.35, 0.15, 0.2]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh position={[0.35, 0.15, 0.2]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <CuboidCollider
        position={[0, 0.35, 0]}
        args={[0.5, 0.35, 0.25]}
        sensor
      />
    </group>
  )
}

function ComputerMonitor({ position }: { position: [number, number, number] }) {
  const screenRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial
      const glow = 0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.15
      material.emissiveIntensity = glow
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.38, -0.03]} castShadow>
        <boxGeometry args={[0.5, 0.02, 0.35]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0.38, 0.05]}>
        <planeGeometry args={[0.42, 0.3]} />
        <meshStandardMaterial
          color="#1a2332"
          emissive="#00ff88"
          emissiveIntensity={0.6}
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

function Whiteboard() {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 1024, 640)

    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 4
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, 1004, 620)
    ctx.shadowBlur = 0

    ctx.fillStyle = '#2d3748'
    ctx.font = 'bold 22px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const lines = [
      '// Java Program Anatomy',
      '',
      'public class HelloSaiVerse {',
      '    public static void main(String[] args) {',
      '        String greeting = "Hello, World!";',
      '        int year = 2024;',
      '        double version = 21.0;',
      '        System.out.println(greeting);',
      '    }',
      '}',
      '',
      'Key Concepts:',
      '  class    → blueprint for objects',
      '  String   → text data type',
      '  int      → integer data type',
      '  double   → decimal data type',
      '  println  → output to console',
    ]

    let y = 30
    for (const line of lines) {
      if (line.startsWith('//') || line.startsWith('Key') || line.startsWith('  ')) {
        ctx.fillStyle = line.startsWith('//') ? '#718096' : '#e53e3e'
      } else if (line.includes('class') || line.includes('void') || line.includes('String') || line.includes('int') || line.includes('double')) {
        ctx.fillStyle = '#805ad5'
      } else {
        ctx.fillStyle = '#2d3748'
      }
      if (line.startsWith('Key')) ctx.fillStyle = '#c05621'

      ctx.globalAlpha = line.trim() === '' ? 0.3 : 1
      ctx.fillText(line, 30, y)
      ctx.globalAlpha = 1
      y += 30
    }

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  return (
    <group position={[BUILDING_X, 1.6, FRONT_WALL_Z - 0.05]}>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[2.6, 1.6]} />
        <meshStandardMaterial
          map={textureRef.current}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.7, 1.7]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function Projector() {
  const beamRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (beamRef.current) {
      const material = beamRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.3) * 0.03
    }
  })

  return (
    <group position={[BUILDING_X, 4.8, FRONT_WALL_Z - 2]}>
      <mesh position={[0, -0.12, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.18, 0.15]}>
        <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh ref={beamRef} position={[0, -2.5, 1.2]} rotation={[0.35, 0, 0]}>
        <planeGeometry args={[1.2, 3]} />
        <meshBasicMaterial
          color="#aaccff"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function CodePoster({ position, rotation }: { position: [number, number, number]; rotation?: number }) {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 400
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 300, 400)

    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 2
    ctx.strokeRect(4, 4, 292, 392)

    ctx.fillStyle = '#00ff88'
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('{ CODE }', 150, 20)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = '13px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const code = [
      'public class Hello {',
      '  public static void',
      '  main(String[] a) {',
      '    System.out.println(',
      '      "Code is poetry"',
      '    );',
      '  }',
      '}',
    ]

    let y = 60
    for (const line of code) {
      ctx.fillStyle = ['public', 'class', 'static', 'void'].some((k) => line.includes(k))
        ? '#805ad5'
        : line.includes('println')
        ? '#48bb78'
        : line.includes('"')
        ? '#ed8936'
        : '#e2e8f0'
      ctx.fillText(line, 25, y)
      y += 22
    }

    ctx.fillStyle = '#00ff88'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Clean Code | Java Edition', 150, 365)

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

const STUDENT_LINES_GROUP_A = [
  'I heard Java runs on three billion devices...',
  'Professor Mehta really knows his stuff.',
  'This is way better than my high school coding class.',
  'I wonder if we\'ll build Android apps later.',
]

const STUDENT_LINES_GROUP_B = [
  'My first Hello World! This is exciting.',
  'Java syntax looks clean — I like it.',
  'I hope we do pair programming.',
  'Can\'t wait to build something real.',
]

const STUDENT_LINES_GROUP_C = [
  'I think I\'m starting to get the hang of this.',
  'The compiler is my new best friend.',
  'Debugging is just detective work, right?',
  'I heard Sai built his first game in Java.',
]

const STUDENT_LINES_GROUP_D = [
  'Java is everywhere — even in my smart TV!',
  'Static typing takes some getting used to.',
  'I like how explicit everything is in Java.',
  'Wonder what we\'ll learn next semester.',
]

function ClassroomAmbience() {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let stopped = false

    const init = async () => {
      const ctx = new AudioContext()
      ctxRef.current = ctx
      if (ctx.state === 'suspended') await ctx.resume()

      const bufferSize = Math.floor(ctx.sampleRate * 3)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      let last = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        const sample = (last + 0.015 * white) / 1.015
        last = sample
        data[i] = sample * 2.5
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 350

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.025, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 2)

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()

      const modulator = ctx.createOscillator()
      const modGain = ctx.createGain()
      modGain.gain.value = 0.01
      modulator.frequency.value = 0.15
      modulator.connect(modGain)
      modGain.connect(gain.gain)
      modulator.start()

      if (stopped) {
        source.stop()
        modulator.stop()
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

export function ClassroomEnvironment() {
  const { registerObject, unregisterObject } = useInteractionSystem()

  const whiteboardPos: [number, number, number] = useMemo(() => [BUILDING_X, 0.8, FRONT_WALL_Z - 0.3], [])
  const computerPos: [number, number, number] = useMemo(() => [21, 0.6, -141.5], [])

  useEffect(() => {
    registerObject({
      id: WHITEBOARD_ID,
      type: 'examine',
      label: 'Study Whiteboard',
      position: whiteboardPos,
      radius: 3,
      isActive: true,
      isInteractable: true,
      data: { dialogueId: NPC_DIALOGUE_ID },
    })
    registerObject({
      id: COMPUTER_ID,
      type: 'use',
      label: 'Use Terminal',
      position: computerPos,
      radius: 3,
      isActive: true,
      isInteractable: true,
      data: { dialogueId: NPC_DIALOGUE_ID },
    })

    return () => {
      unregisterObject(WHITEBOARD_ID)
      unregisterObject(COMPUTER_ID)
    }
  }, [registerObject, unregisterObject, whiteboardPos, computerPos])

  return (
    <group>
      <ProfessorNPC />

      {/* Background ambience */}
      <ClassroomAmbience />

      {/* Desks - Row 1 with computers */}
      <Desk position={[21, 0, -141.5]} />
      <ComputerMonitor position={[21, 0.72, -141.5]} />
      <Desk position={[25, 0, -141.5]} />
      <ComputerMonitor position={[25, 0.72, -141.5]} />

      {/* Desks - Row 2 (no computers) */}
      <Desk position={[21, 0, -138.5]} />
      <Desk position={[25, 0, -138.5]} />

      {/* Whiteboard */}
      <Whiteboard />

      {/* Projector */}
      <Projector />

      {/* Code posters on building walls */}
      <CodePoster position={[BUILDING_X - BUILDING_WIDTH / 2 - 0.01, 1.6, FRONT_WALL_Z - 1.5]} rotation={Math.PI / 2} />
      <CodePoster position={[BUILDING_X + BUILDING_WIDTH / 2 + 0.01, 1.6, FRONT_WALL_Z - 1.5]} rotation={-Math.PI / 2} />

      {/* Student NPCs */}
      <StudentNPC
        position={[21.5, 0, -141.0]}
        color="#4a7c59"
        lines={STUDENT_LINES_GROUP_A}
      />
      <StudentNPC
        position={[25.5, 0, -141.0]}
        color="#5b7fa0"
        lines={STUDENT_LINES_GROUP_B}
      />
      <StudentNPC
        position={[23, 0, -137.5]}
        color="#8b6b4a"
        lines={STUDENT_LINES_GROUP_C}
      />
      <StudentNPC
        position={[24, 0, -143.5]}
        color="#6b5b7a"
        lines={STUDENT_LINES_GROUP_D}
      />
    </group>
  )
}
