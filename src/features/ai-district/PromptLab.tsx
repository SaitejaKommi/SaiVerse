'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { AI_QUEST_ID } from '@/data/ai-district/ai-quest'

const STATION_POS = new THREE.Vector3(0, 0, -395)
const CARD_RADIUS = 2.5

const PROMPT_FRAGMENTS = [
  { id: 'write', text: 'write', color: '#00d4ff' },
  { id: 'code', text: 'code', color: '#00ff88' },
  { id: 'analyze', text: 'analyze', color: '#a855f7' },
  { id: 'explain', text: 'explain', color: '#f59e0b' },
  { id: 'create', text: 'create', color: '#ff6b6b' },
]

const AI_RESPONSES: Record<string, string> = {
  write: '"Write a story about an AI that learned to dream."',
  code: '"Generate a Python function for data normalization."',
  analyze: '"Analyze this dataset and find patterns in user behavior."',
  explain: '"Explain how neural networks learn from data."',
  create: '"Create a poem about the relationship between humans and machines."',
  write_code: '"A Python script combining creative writing with algorithmic structure."',
  write_analyze: '"A narrative incorporating data-driven insights and storytelling."',
  code_analyze: '"A self-referential Python script that analyzes its own structure."',
  code_explain: '"Annotated code that teaches machine learning concepts as it runs."',
  analyze_explain: '"Data reveals hidden patterns. Let me explain what they mean."',
  code_create: '"Generative code that produces unique visual art from mathematical rules."',
}

function FragmentCard({ fragment, index, collected, onCollect }: { fragment: typeof PROMPT_FRAGMENTS[0]; index: number; collected: boolean; onCollect: () => void }) {
  const cardRef = useRef<THREE.Mesh>(null)
  const homeAngle = (index / PROMPT_FRAGMENTS.length) * Math.PI * 2
  const homePos = useMemo(() => new THREE.Vector3(
    Math.cos(homeAngle) * CARD_RADIUS, 0.5 + Math.sin(homeAngle * 2) * 0.3, Math.sin(homeAngle) * CARD_RADIUS,
  ), [homeAngle])

  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 192; c.height = 72
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#0a1628'
    ctx.roundRect(4, 4, 184, 64, 8)
    ctx.fill()
    ctx.strokeStyle = fragment.color
    ctx.lineWidth = 2
    ctx.roundRect(4, 4, 184, 64, 8)
    ctx.stroke()
    ctx.fillStyle = fragment.color
    ctx.font = 'bold 18px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`[${fragment.text}]`, 96, 36)
    return new THREE.CanvasTexture(c)
  }, [fragment])

  const currentPos = useRef(homePos.clone())

  useFrame((state) => {
    if (!cardRef.current) return
    const t = state.clock.elapsedTime
    if (collected) {
      currentPos.current.lerp(new THREE.Vector3(0, 2.5, 0), 0.04)
      cardRef.current.position.copy(currentPos.current)
      cardRef.current.scale.setScalar(0.5)
      const mat = cardRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.4
    } else {
      currentPos.current.lerp(homePos, 0.05)
      const float = Math.sin(t * 0.8 + index) * 0.15
      cardRef.current.position.set(currentPos.current.x, currentPos.current.y + float, currentPos.current.z)
      cardRef.current.rotation.y = t * 0.15 + index
      const mat = cardRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.85
    }
  })

  return (
    <mesh ref={cardRef} position={homePos} onClick={onCollect}>
      <planeGeometry args={[0.7, 0.25]} />
      <meshStandardMaterial map={texture} transparent opacity={0.85} depthTest={false} />
    </mesh>
  )
}

function AIHologram({ collectedCount, totalCount, response }: { collectedCount: number; totalCount: number; response: string }) {
  const coreRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const responseTexture = useMemo(() => {
    if (!response) return null
    const c = document.createElement('canvas')
    c.width = 512; c.height = 96
    const ctx = c.getContext('2d')!
    ctx.fillStyle = 'rgba(10, 22, 40, 0.7)'
    ctx.roundRect(8, 8, 496, 80, 12)
    ctx.fill()
    ctx.fillStyle = '#a855f7'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(response, 256, 48)
    return new THREE.CanvasTexture(c)
  }, [response])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (coreRef.current) {
      const active = collectedCount >= totalCount
      const mat = coreRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = active ? 0.3 + Math.sin(t * 2) * 0.15 : 0.05
      coreRef.current.scale.setScalar(active ? 1 + Math.sin(t) * 0.1 : 0.5)
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3
    }
  })

  return (
    <group position={[0, 1.0, 0]}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.05} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.6, 0.02, 8, 24]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {response && responseTexture && (
        <sprite position={[0, -1.2, 0]} scale={[2.5, 0.6, 1]}>
          <spriteMaterial map={responseTexture} transparent depthTest={false} opacity={0.9} />
        </sprite>
      )}
    </group>
  )
}

export function PromptLab() {
  const collectedRef = useRef(new Set<string>())
  const completedRef = useRef(false)
  const [collectedCount, setCollectedCount] = useState(0)
  const [responseText, setResponseText] = useState('')
  const notif = useNotificationStore()

  const handleCollect = useCallback((fragmentId: string) => {
    if (collectedRef.current.has(fragmentId) || completedRef.current) return
    collectedRef.current.add(fragmentId)
    const count = collectedRef.current.size
    setCollectedCount(count)
    soundFX.playQuestAccept()

    const collected = Array.from(collectedRef.current).sort()
    const key = collected.join('_')
    const firstKey = collected[0] ?? ''
    const response = AI_RESPONSES[key] ?? AI_RESPONSES[firstKey] ?? ''
    setResponseText(response)

    if (count >= PROMPT_FRAGMENTS.length && !completedRef.current) {
      completedRef.current = true
      soundFX.playQuestComplete()
      notif.addNotification('discovery', 'AI Interaction', 'Prompt engineering complete')
      QuestManager.completeObjective(AI_QUEST_ID, 'obj-prompt-ai')
    }
  }, [notif])

  const progressTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = collectedCount >= PROMPT_FRAGMENTS.length ? '#00ff88' : '#00d4ff'
    ctx.font = '11px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      collectedCount >= PROMPT_FRAGMENTS.length ? 'all fragments combined' : `collected: ${collectedCount}/${PROMPT_FRAGMENTS.length}`,
      128, 16,
    )
    return new THREE.CanvasTexture(c)
  }, [collectedCount])

  return (
    <group position={STATION_POS}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3.2, 0.1, 24]} />
        <meshStandardMaterial color="#0a1628" metalness={0.4} roughness={0.5} />
      </mesh>

      <AIHologram collectedCount={collectedCount} totalCount={PROMPT_FRAGMENTS.length} response={responseText} />

      {PROMPT_FRAGMENTS.map((fragment, i) => (
        <FragmentCard
          key={fragment.id}
          fragment={fragment}
          index={i}
          collected={collectedRef.current.has(fragment.id)}
          onCollect={() => handleCollect(fragment.id)}
        />
      ))}

      <sprite position={[0, 1.8, 0]} scale={[1.0, 0.12, 1]}>
        <spriteMaterial
          map={useMemo(() => {
            const c = document.createElement('canvas')
            c.width = 128; c.height = 32
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#a855f7'
            ctx.font = 'bold 12px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('PROMPT LAB', 64, 16)
            return new THREE.CanvasTexture(c)
          }, [])}
          transparent
          depthTest={false}
        />
      </sprite>

      <sprite position={[0, -1.8, 0]} scale={[1.2, 0.1, 1]}>
        <spriteMaterial map={progressTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}
