'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { useDialogueStore } from '@/stores/dialogueStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { MATERIALS } from '@/systems/material'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import type { QuestDef } from '@/systems/quest/quest.types'
import type { DialogueDef, DialogueNode } from '@/systems/dialogue/dialogue.types'

const NPC_ID = 'npc-placeholder'
const NPC_DIALOGUE_ID = 'npc-placeholder-dialogue'
const NPC_QUEST_ID = 'quest-first-step'
const NPC_POSITION: [number, number, number] = [5, 0.5, 8]

function buildQuest(): QuestDef {
  return {
    id: NPC_QUEST_ID,
    title: 'The First Step',
    description: 'Reach the Campus Entrance to begin your journey.',
    category: 'main',
    status: 'available',
    prerequisites: [],
    dialogueStartId: NPC_DIALOGUE_ID,
    dialogueCompleteId: NPC_DIALOGUE_ID,
    rewards: { knowledge: 25, badgeId: 'journey-begins' },
    objectives: [
      { id: 'obj-reach-campus', type: 'reach', description: 'Reach the Campus Entrance', targetId: 'campus-entrance', count: 1, current: 0, isOptional: false },
    ],
  }
}

function buildDialogue(): DialogueDef {
  const nodes: Record<string, DialogueNode> = {
    start: {
      id: 'start',
      speaker: 'Guide',
      text: 'Welcome to SaiVerse, explorer. You are about to experience Sai\'s engineering journey — from his first line of code to building worlds like this one.',
      choices: [
        { text: 'Where do I start?', nextNodeId: 'quest_intro' },
        { text: 'Tell me more about Sai.', nextNodeId: 'about_sai' },
      ],
    },
    about_sai: {
      id: 'about_sai',
      speaker: 'Guide',
      text: 'Sai started as a curious student who loved building things. The Campus was where he wrote his first program. Every district in SaiVerse represents a chapter of his story.',
      choices: [
        { text: 'Give me the quest!', nextNodeId: 'quest_intro' },
      ],
    },
    quest_intro: {
      id: 'quest_intro',
      speaker: 'Guide',
      text: 'Your first task: Reach the Campus Entrance. It\'s just beyond the northern edge of the hub. A glowing beacon will guide you there. Take your first step.',
      nextNodeId: 'quest_accepted',
    },
    quest_accepted: {
      id: 'quest_accepted',
      speaker: 'Guide',
      text: 'I can see the determination in your eyes. Follow the beacon north. I will meet you there with more information once you arrive. Safe travels.',
      nextNodeId: 'done',
    },
    campus_reveal: {
      id: 'campus_reveal',
      speaker: 'Guide',
      text: 'There it is. The Campus — where Sai wrote his first "Hello, World!" and discovered his passion for engineering. Every great journey begins with a single step, and you just took yours. The campus gate is now open for you.',
    },
    done: {
      id: 'done',
      speaker: 'Guide',
      text: 'Welcome back! The campus is open whenever you are ready to continue Sai\'s journey.',
    },
  }

  return { id: NPC_DIALOGUE_ID, title: 'Guide Dialogue', nodes, startNodeId: 'start' }
}

function NPCModel() {
  const bodyRef = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const mouthRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (bodyRef.current) {
      bodyRef.current.position.y = 1.2 + Math.sin(t * 0.8) * 0.05
    }
    if (headRef.current) {
      headRef.current.position.y = 1.8 + Math.sin(t * 0.8) * 0.05
    }
    if (glowRef.current) {
      glowRef.current.position.y = 0.01 + Math.sin(t * 1.2) * 0.02
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.05)
    }
    const swing = Math.sin(t * 2) * 0.15
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = swing
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -swing
    }
    if (mouthRef.current) {
      const isOpen = useDialogueStore.getState().isOpen
      const scale = isOpen ? Math.sin(t * 4) * 0.4 + 0.6 : 0.2
      mouthRef.current.scale.y = scale
    }
  })

  return (
    <group>
      <mesh ref={bodyRef} position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh ref={headRef} position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#a5b4fc" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.55, 0.22]}>
        <planeGeometry args={[0.08, 0.03]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
      <mesh position={[0, 1.48, 0.22]}>
        <planeGeometry args={[0.08, 0.03]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
      <mesh ref={leftArmRef} position={[-0.36, 1.4, 0]} castShadow>
        <boxGeometry args={[0.06, 0.3, 0.06]} />
        <meshStandardMaterial color="#6366f1" roughness={MATERIALS.metal.painted.roughness} metalness={MATERIALS.metal.painted.metalness} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.36, 1.4, 0]} castShadow>
        <boxGeometry args={[0.06, 0.3, 0.06]} />
        <meshStandardMaterial color="#6366f1" roughness={MATERIALS.metal.painted.roughness} metalness={MATERIALS.metal.painted.metalness} />
      </mesh>
      <mesh ref={mouthRef} position={[0, 1.55, 0.25]}>
        <sphereGeometry args={[0.05, 0.03, 0.02]} />
        <meshBasicMaterial color="#ff6b6b" />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.45, 32]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function FloatingName() {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 512, 128)
    ctx.textRendering = 'geometricPrecision'

    ctx.shadowColor = 'rgba(0,212,255,0.5)'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 36px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('◆ Guide ◆', 256, 64)

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  return (
    <sprite position={[0, 2.4, 0]} scale={[3.2, 0.8, 1]}>
      <spriteMaterial
        map={textureRef.current}
        transparent
        opacity={0.9}
        depthTest={false}
      />
    </sprite>
  )
}

export function PlaceholderNPC() {
  const { registerObject, unregisterObject, endInteraction } = useInteractionSystem()
  const dialogueStore = useDialogueStore()
  const notif = useNotificationStore()
  const acceptedRef = useRef(false)

  useEffect(() => {
    registerObject({
      id: NPC_ID,
      type: 'talk',
      label: 'Guide',
      position: NPC_POSITION,
      radius: 4,
      isActive: true,
      isInteractable: true,
      data: { dialogueId: NPC_DIALOGUE_ID },
    })

    dialogueStore.registerDialogue(buildDialogue())
    QuestManager.registerQuest(buildQuest())

    return () => unregisterObject(NPC_ID)
  }, [registerObject, unregisterObject, dialogueStore])

  useEffect(() => {
    const unsubStart = EventBus.on(GameEvents.INTERACTION_START, (payload: any) => {
      if (payload?.objectId !== NPC_ID) return
      const quest = QuestManager.getQuest(NPC_QUEST_ID)
      if (!quest) return

      soundFX.playDialogueOpen()
      acceptedRef.current = false

      if (quest.status === 'completed') {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID, NPC_POSITION)
        setTimeout(() => dialogueStore.goToNode('done'), 50)
        return
      }

      if (quest.status === 'accepted') {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID, NPC_POSITION)
        setTimeout(() => dialogueStore.goToNode('quest_intro'), 50)
        return
      }

      dialogueStore.openDialogue(NPC_DIALOGUE_ID, NPC_POSITION)
    })

    const unsubAdvance = EventBus.on(GameEvents.DIALOGUE_ADVANCE, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return
      if (payload?.nodeId === 'quest_intro') {
        acceptedRef.current = true
        QuestManager.acceptQuest(NPC_QUEST_ID)
        soundFX.playQuestAccept()
        notif.addNotification('quest', 'Quest Started', 'The First Step — Reach the Campus Entrance')
      }
    })

    const unsubEnd = EventBus.on(GameEvents.DIALOGUE_END, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return
      endInteraction()
    })

    return () => {
      unsubStart()
      unsubAdvance()
      unsubEnd()
    }
  }, [dialogueStore, notif, endInteraction])

  return (
    <group position={NPC_POSITION}>
      <NPCModel />
      <FloatingName />
    </group>
  )
}
