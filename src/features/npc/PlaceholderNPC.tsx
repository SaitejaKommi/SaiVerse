'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { useDialogueStore } from '@/stores/dialogueStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import type { QuestDef } from '@/systems/quest/quest.types'
import type { DialogueDef, DialogueNode } from '@/systems/dialogue/dialogue.types'

const NPC_ID = 'npc-placeholder'
const NPC_DIALOGUE_ID = 'npc-placeholder-dialogue'
const NPC_QUEST_ID = 'quest-placeholder'
const NPC_POSITION: [number, number, number] = [5, 0.5, 8]

function buildQuest(): QuestDef {
  return {
    id: NPC_QUEST_ID,
    title: 'A Warm Welcome',
    description: 'Speak with the guide and explore the hub to learn the basics.',
    category: 'main',
    status: 'available',
    prerequisites: [],
    dialogueStartId: NPC_DIALOGUE_ID,
    dialogueCompleteId: NPC_DIALOGUE_ID,
    rewards: { knowledge: 25, badgeId: 'first-steps' },
    objectives: [
      { id: 'obj-explore', type: 'reach', description: 'Explore the Bengaluru Hub', targetId: 'hub-explore', count: 1, current: 0, isOptional: false },
    ],
  }
}

function buildDialogue(): DialogueDef {
  const nodes: Record<string, DialogueNode> = {
    start: {
      id: 'start',
      speaker: 'Guide',
      text: 'Welcome to Bengaluru Hub, explorer! This is the starting point of your journey through SaiVerse. Would you like a quest to get started?',
      choices: [
        { text: 'Yes, give me a quest!', nextNodeId: 'accept' },
        { text: 'Not right now.', nextNodeId: 'decline' },
      ],
    },
    accept: {
      id: 'accept',
      speaker: 'Guide',
      text: 'Excellent! Your first task is simple — explore the hub and get familiar with the surroundings. Come back when you are done.',
    },
    decline: {
      id: 'decline',
      speaker: 'Guide',
      text: 'No problem! Feel free to explore the city on your own. I am here if you change your mind.',
    },
    complete: {
      id: 'complete',
      speaker: 'Guide',
      text: 'You have explored the hub! Well done. You earned the "First Steps" badge and 25 knowledge points. Keep up the great work!',
    },
    done: {
      id: 'done',
      speaker: 'Guide',
      text: 'Welcome back! There are more adventures ahead when you are ready.',
    },
  }

  return { id: NPC_DIALOGUE_ID, title: 'Guide Dialogue', nodes, startNodeId: 'start' }
}

function NPCModel() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  return (
    <group>
      <mesh ref={meshRef} position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
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
    </group>
  )
}

function NPCGlow() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.01 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05)
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.25, 0.45, 32]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  )
}

export function PlaceholderNPC() {
  const { registerObject, unregisterObject } = useInteractionSystem()
  const dialogueStore = useDialogueStore()
  const notif = useNotificationStore()
  const acceptedRef = useRef(false)

  useEffect(() => {
    registerObject({
      id: NPC_ID,
      type: 'talk',
      label: 'Guide',
      position: NPC_POSITION,
      radius: 3,
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

      acceptedRef.current = false

      if (quest.status === 'completed') {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('done'), 50)
        return
      }

      if (quest.status === 'accepted') {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('complete'), 50)
        return
      }

      dialogueStore.openDialogue(NPC_DIALOGUE_ID)
    })

    const unsubAdvance = EventBus.on(GameEvents.DIALOGUE_ADVANCE, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return
      if (payload?.nodeId === 'accept') {
        acceptedRef.current = true
      }
    })

    const unsubEnd = EventBus.on(GameEvents.DIALOGUE_END, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return
      const quest = QuestManager.getQuest(NPC_QUEST_ID)
      if (!quest) return

      if (quest.status === 'available' && acceptedRef.current) {
        QuestManager.acceptQuest(NPC_QUEST_ID)
        notif.addNotification('quest', 'Quest Started', 'A Warm Welcome — Explore the Bengaluru Hub')
      } else if (quest.status === 'accepted') {
        QuestManager.completeObjective(NPC_QUEST_ID, 'obj-explore')
        const updated = QuestManager.getQuest(NPC_QUEST_ID)
        if (updated?.status === 'completed') {
          notif.addNotification('badge', 'Badge Earned', 'First Steps')
          notif.addNotification('knowledge', 'Knowledge +25', 'Hub exploration')
        }
      }
    })

    return () => {
      unsubStart()
      unsubAdvance()
      unsubEnd()
    }
  }, [dialogueStore, notif])

  return (
    <group position={NPC_POSITION}>
      <NPCGlow />
      <NPCModel />
    </group>
  )
}
