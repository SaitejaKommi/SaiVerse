'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StudentNPCProps {
  position: [number, number, number]
  color?: string
  lines: string[]
}

const STUDENT_COLORS = ['#4a7c59', '#5b7fa0', '#8b6b4a', '#6b5b7a', '#3d7a6a']

const bodyOffsetY = 0.8

function SpeechBubble({ text, height }: { text: string; height: number }) {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 80
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 512, 80)

    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur = 8
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.beginPath()
    ctx.roundRect(10, 5, 492, 70, 12)
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.fillStyle = '#1a202c'
    ctx.font = '22px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const words = text.split(' ')
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const test = current ? current + ' ' + word : word
      if (ctx.measureText(test).width > 440) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)

    lines.forEach((line, i) => {
      ctx.fillText(line, 256, 40 + (i - (lines.length - 1) / 2) * 26)
    })

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  const bubbleHeight = 0.3 + (text.length > 40 ? 0.15 : 0)
  return (
    <sprite position={[0, height + 0.75, 0]} scale={[1.6, bubbleHeight, 1]}>
      <spriteMaterial map={textureRef.current} transparent depthTest={false} />
    </sprite>
  )
}

function StudentModel({ color }: { color: string }) {
  const bodyRef = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (bodyRef.current) {
      bodyRef.current.position.y = bodyOffsetY + Math.sin(t * 0.8 + Math.random()) * 0.02
    }
    if (headRef.current) {
      headRef.current.position.y = bodyOffsetY + 0.35 + Math.sin(t * 0.8 + Math.random()) * 0.02
    }
  })

  return (
    <group>
      <mesh ref={bodyRef} position={[0, bodyOffsetY, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.3, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh ref={headRef} position={[0, bodyOffsetY + 0.35, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function StudentNPC({ position, color: colorProp, lines }: StudentNPCProps) {
  const [visibleLine, setVisibleLine] = useState<string | null>(null)
  const color = colorProp ?? STUDENT_COLORS[Math.floor(Math.random() * STUDENT_COLORS.length)] ?? '#4a7c59'

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 7000
      timeout = setTimeout(() => {
        const line = lines[Math.floor(Math.random() * lines.length)] ?? ''
        setVisibleLine(line)
        setTimeout(() => {
          setVisibleLine(null)
          scheduleNext()
        }, 3500)
      }, delay)
    }

    scheduleNext()
    return () => clearTimeout(timeout)
  }, [lines])

  return (
    <group position={position}>
      <StudentModel color={color} />
      {visibleLine && <SpeechBubble text={visibleLine} height={bodyOffsetY + 0.35} />}
    </group>
  )
}
