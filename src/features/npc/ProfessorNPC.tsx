'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { useDialogueStore } from '@/stores/dialogueStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import type { QuestDef } from '@/systems/quest/quest.types'
import type { DialogueDef, DialogueNode } from '@/systems/dialogue/dialogue.types'

const NPC_ID = 'npc-professor'
const NPC_DIALOGUE_ID = 'professor-dialogue'
const NPC_QUEST_ID = 'quest-first-lesson'
const NPC_POSITION: [number, number, number] = [22.5, 0.5, -145.2]

const WHITEBOARD_ID = 'classroom-whiteboard'
const COMPUTER_ID = 'classroom-computer'

const PREREQUISITE_QUEST = 'quest-first-step'

function buildQuest(): QuestDef {
  return {
    id: NPC_QUEST_ID,
    title: 'The First Lesson',
    description: 'Study the whiteboard, write your first Java program, and show Professor Mehta.',
    category: 'main',
    status: 'available',
    prerequisites: [{ questId: PREREQUISITE_QUEST }],
    dialogueStartId: NPC_DIALOGUE_ID,
    dialogueCompleteId: NPC_DIALOGUE_ID,
    rewards: { knowledge: 50, badgeId: 'first-lesson' },
    objectives: [
      { id: 'obj-study-whiteboard', type: 'talk', description: 'Study the whiteboard', targetId: 'whiteboard', count: 1, current: 0, isOptional: false },
      { id: 'obj-use-computer', type: 'talk', description: 'Write your first Java program on the computer', targetId: 'computer', count: 1, current: 0, isOptional: false },
      { id: 'obj-show-professor', type: 'talk', description: 'Show your code to Professor Mehta', targetId: 'professor', count: 1, current: 0, isOptional: false },
    ],
  }
}

function buildDialogue(): DialogueDef {
  const nodes: Record<string, DialogueNode> = {
    prereq_not_met: {
      id: 'prereq_not_met',
      speaker: 'Prof. Mehta',
      text: 'You\'re early! The first lesson hasn\'t opened yet. Speak with the Guide in the hub — they\'ll prepare you for what\'s ahead.',
    },
    intro: {
      id: 'intro',
      speaker: 'Prof. Mehta',
      text: 'Welcome to the Classroom Wing. I\'m Professor Mehta — and this is where Sai wrote his very first Java program. Today, you\'ll follow the same path. I\'ve set up three stations: study the whiteboard, write code on the terminal, then show me what you\'ve created. Let\'s begin.',
    },
    intro_accepted: {
      id: 'intro_accepted',
      speaker: 'Prof. Mehta',
      text: 'Back for more? The stations are waiting. Whiteboard to your left, terminal beside the desks. Take your time — every great programmer started exactly where you\'re standing.',
    },
    explore: {
      id: 'explore',
      speaker: 'Prof. Mehta',
      text: 'Still finding your footing? That\'s fine. Start with the whiteboard — it\'ll give you the foundation. Then try your hand at the computer terminal. I\'ll be right here when you\'re ready.',
    },
    whiteboard: {
      id: 'whiteboard',
      speaker: 'Prof. Mehta',
      text: 'The whiteboard shows the anatomy of a Java program. At its heart: a class, a main method, and statements that run top to bottom. Java is statically typed — every variable declares its kind before it holds a value. Like blueprint for memory. This discipline is what makes Java programs robust enough to run for years without crashing. Study it well — you\'ll need it for the terminal.',
    },
    computer: {
      id: 'computer',
      speaker: 'Prof. Mehta',
      text: 'The terminal is open to a blank Java file. One line is missing. Fill in the blank to complete Sai\'s very first program:',
      choices: [
        { text: 'System.out.println("Hello, World!");', nextNodeId: 'computer_correct' },
        { text: 'System.print("Hello World")', nextNodeId: 'computer_wrong' },
        { text: 'console.log("Hello, World!");', nextNodeId: 'computer_wrong' },
      ],
    },
    computer_correct: {
      id: 'computer_correct',
      speaker: 'Prof. Mehta',
      text: 'That\'s it. \"Hello, World!\" — the same words Sai printed on his first day. You\'ve just written your first valid Java statement. The compiler accepts it, the terminal will show it. Well done. Come show me when you\'re ready to move forward.',
    },
    computer_wrong: {
      id: 'computer_wrong',
      speaker: 'Prof. Mehta',
      text: 'Almost — but the Java compiler expects a precise incantation. In Java, we use System.out.println with a capital S, and every statement ends with a semicolon. Try again.',
      nextNodeId: 'computer',
    },
    need_whiteboard: {
      id: 'need_whiteboard',
      speaker: 'Prof. Mehta',
      text: 'Before touching the terminal, study the whiteboard first. Java\'s syntax is precise — one wrong character and the compiler won\'t budge. The whiteboard will show you the shape of a valid program.',
    },
    no_quest: {
      id: 'no_quest',
      speaker: 'Prof. Mehta',
      text: 'This terminal isn\'t active yet. Speak with me first and I\'ll open the lesson for you.',
    },
    already_done: {
      id: 'already_done',
      speaker: 'Prof. Mehta',
      text: 'You\'ve already completed this station. Strong work. Move on to the next one.',
    },
    completion: {
      id: 'completion',
      speaker: 'Prof. Mehta',
      text: 'You studied the fundamentals. You wrote working code. You showed me the result. That\'s the entire engineering cycle in one lesson. Java demands precision, patience, and clarity — and you just demonstrated all three. From this day forward, Java is part of your toolkit. Use it well.',
    },
    done: {
      id: 'done',
      speaker: 'Prof. Mehta',
      text: 'Welcome back, programmer. Remember Sai\'s first lesson: Java is not just a language — it\'s a discipline. Every semicolon, every type declaration, every class is a commitment to clarity. Keep writing.',
    },
  }

  return { id: NPC_DIALOGUE_ID, title: 'Professor Mehta', nodes, startNodeId: 'intro' }
}

function ProfessorModel() {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const lookTarget = useRef(new THREE.Vector3())

  useFrame((state) => {
    const t = state.clock.elapsedTime

    const player = useGameStore.getState().player
    if (player) {
      lookTarget.current.set(player.position[0], 1.8, player.position[2])
    }

    if (groupRef.current) {
      const pos = groupRef.current.position
      const dx = lookTarget.current.x - pos.x
      const dz = lookTarget.current.z - pos.z
      const targetAngle = Math.atan2(dx, dz)
      const currentAngle = groupRef.current.rotation.y
      let diff = targetAngle - currentAngle
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      groupRef.current.rotation.y += diff * 0.05
    }

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.04
    }
    if (headRef.current) {
      headRef.current.position.y = 1.8 + Math.sin(t * 0.7) * 0.04
    }
    if (glowRef.current) {
      glowRef.current.position.y = 0.01 + Math.sin(t * 1.1) * 0.02
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.05)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#d4813a" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh ref={headRef} position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#e8a84c" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.78, 0.22]}>
        <torusGeometry args={[0.1, 0.02, 8, 16]} />
        <meshStandardMaterial color="#a0aec0" metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.78, 0.22]}>
        <planeGeometry args={[0.2, 0.01]} />
        <meshStandardMaterial color="#a0aec0" metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.45, 32]} />
        <meshBasicMaterial color="#ffbb33" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function FloatingName() {
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 512, 64)

    ctx.shadowColor = 'rgba(255,187,51,0.5)'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#ffbb33'
    ctx.font = 'bold 28px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('◆ Prof. Mehta ◆', 256, 32)

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  return (
    <sprite position={[0, 2.5, 0]} scale={[2.2, 0.35, 1]}>
      <spriteMaterial
        map={textureRef.current}
        transparent
        opacity={0.9}
        depthTest={false}
      />
    </sprite>
  )
}

function isQuestObjectiveDone(questId: string, objectiveId: string): boolean {
  const q = QuestManager.getQuest(questId)
  if (!q) return false
  const obj = q.objectives.find((o) => o.id === objectiveId)
  return obj ? obj.current >= obj.count : false
}

export function ProfessorNPC() {
  const { registerObject, unregisterObject, endInteraction } = useInteractionSystem()
  const dialogueStore = useDialogueStore()
  const notif = useNotificationStore()
  const playerStore = usePlayerStore()
  const dialogueRegistered = useRef(false)

  useEffect(() => {
    registerObject({
      id: NPC_ID,
      type: 'talk',
      label: 'Prof. Mehta',
      position: NPC_POSITION,
      radius: 4,
      isActive: true,
      isInteractable: true,
      data: { dialogueId: NPC_DIALOGUE_ID },
    })

    return () => unregisterObject(NPC_ID)
  }, [registerObject, unregisterObject])

  useEffect(() => {
    if (dialogueRegistered.current) return
    dialogueStore.registerDialogue(buildDialogue())
    QuestManager.registerQuest(buildQuest())
    dialogueRegistered.current = true
  }, [dialogueStore])

  useEffect(() => {
    const unsubStart = EventBus.on(GameEvents.INTERACTION_START, (payload: any) => {
      if (!payload?.objectId) return
      if (![NPC_ID, WHITEBOARD_ID, COMPUTER_ID].includes(payload.objectId)) return

      soundFX.playDialogueOpen()

      const quest = QuestManager.getQuest(NPC_QUEST_ID)
      const prereqQuest = QuestManager.getQuest(PREREQUISITE_QUEST)

      if (payload.objectId === NPC_ID) {
        if (quest?.status === 'completed') {
          dialogueStore.openDialogue(NPC_DIALOGUE_ID)
          setTimeout(() => dialogueStore.goToNode('done'), 50)
          return
        }
        if (!prereqQuest || prereqQuest.status !== 'completed') {
          dialogueStore.openDialogue(NPC_DIALOGUE_ID)
          setTimeout(() => dialogueStore.goToNode('prereq_not_met'), 50)
          return
        }
        if (!quest || quest.status === 'available') {
          dialogueStore.openDialogue(NPC_DIALOGUE_ID)
          return
        }
        if (quest.status === 'accepted') {
          if (
            isQuestObjectiveDone(NPC_QUEST_ID, 'obj-study-whiteboard') &&
            isQuestObjectiveDone(NPC_QUEST_ID, 'obj-use-computer')
          ) {
            dialogueStore.openDialogue(NPC_DIALOGUE_ID)
            setTimeout(() => dialogueStore.goToNode('completion'), 50)
            return
          }
          dialogueStore.openDialogue(NPC_DIALOGUE_ID)
          setTimeout(() => dialogueStore.goToNode('explore'), 50)
          return
        }
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        return
      }

      if (!quest || quest.status === 'available' || quest.status === 'completed') {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('no_quest'), 50)
        return
      }

      if (payload.objectId === WHITEBOARD_ID) {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('whiteboard'), 50)
        return
      }

      if (payload.objectId === COMPUTER_ID) {
        if (!isQuestObjectiveDone(NPC_QUEST_ID, 'obj-study-whiteboard')) {
          dialogueStore.openDialogue(NPC_DIALOGUE_ID)
          setTimeout(() => dialogueStore.goToNode('need_whiteboard'), 50)
          return
        }
        if (isQuestObjectiveDone(NPC_QUEST_ID, 'obj-use-computer')) {
          dialogueStore.openDialogue(NPC_DIALOGUE_ID)
          setTimeout(() => dialogueStore.goToNode('already_done'), 50)
          return
        }
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('computer'), 50)
        return
      }
    })

    const unsubDialogueStart = EventBus.on(GameEvents.DIALOGUE_START, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return

      if (payload?.nodeId === 'intro') {
        const accepted = QuestManager.acceptQuest(NPC_QUEST_ID)
        if (accepted) {
          soundFX.playQuestAccept()
          notif.addNotification('quest', 'Quest Started', 'The First Lesson — Study, write, and show your work')
        }
      }
    })

    const unsubAdvance = EventBus.on(GameEvents.DIALOGUE_ADVANCE, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return



      if (payload?.nodeId === 'whiteboard') {
        QuestManager.completeObjective(NPC_QUEST_ID, 'obj-study-whiteboard')
      }

      if (payload?.nodeId === 'computer_correct') {
        QuestManager.completeObjective(NPC_QUEST_ID, 'obj-use-computer')
      }

      if (payload?.nodeId === 'completion') {
        EventBus.emit(GameEvents.CHAPTER_FINALE_TRIGGER, {})
      }
    })

    const unsubEnd = EventBus.on(GameEvents.DIALOGUE_END, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return
      endInteraction()
    })

    return () => {
      unsubDialogueStart()
      unsubAdvance()
      unsubEnd()
    }
  }, [dialogueStore, notif, endInteraction, playerStore])

  return (
    <group position={NPC_POSITION}>
      <ProfessorModel />
      <FloatingName />
    </group>
  )
}

export { NPC_DIALOGUE_ID, WHITEBOARD_ID, COMPUTER_ID, NPC_ID }
