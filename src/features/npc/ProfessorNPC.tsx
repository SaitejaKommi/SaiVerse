'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { useDialogueStore } from '@/stores/dialogueStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { usePlayerStore } from '@/stores/playerStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import type { QuestDef } from '@/systems/quest/quest.types'
import type { DialogueDef, DialogueNode } from '@/systems/dialogue/dialogue.types'

const NPC_ID = 'npc-professor'
const NPC_DIALOGUE_ID = 'professor-dialogue'
const NPC_QUEST_ID = 'quest-first-lesson'
const NPC_POSITION: [number, number, number] = [23, 0.5, -146]

const PREREQUISITE_QUEST = 'quest-first-step'

function buildQuest(): QuestDef {
  return {
    id: NPC_QUEST_ID,
    title: 'The First Lesson',
    description: 'Complete Professor Mehta\'s programming puzzle.',
    category: 'main',
    status: 'available',
    prerequisites: [{ questId: PREREQUISITE_QUEST }],
    dialogueStartId: NPC_DIALOGUE_ID,
    dialogueCompleteId: NPC_DIALOGUE_ID,
    rewards: { knowledge: 50, badgeId: 'first-lesson' },
    objectives: [
      { id: 'obj-complete-puzzle', type: 'talk', description: 'Complete the programming puzzle', targetId: 'professor', count: 1, current: 0, isOptional: false },
    ],
  }
}

function buildDialogue(): DialogueDef {
  const nodes: Record<string, DialogueNode> = {
    prereq_not_met: {
      id: 'prereq_not_met',
      speaker: 'Prof. Mehta',
      text: 'You\'re not quite ready for this lesson. Speak with the Guide in the hub first — they\'ll show you where your journey begins.',
    },
    start: {
      id: 'start',
      speaker: 'Prof. Mehta',
      text: 'Ah, a new face. Sai stood where you\'re standing three years ago — curious, maybe a little uncertain. I\'m Professor Mehta. Welcome to the Campus.',
      choices: [
        { text: 'I\'m ready to learn.', nextNodeId: 'lesson_intro' },
        { text: 'Tell me about Sai.', nextNodeId: 'about_sai' },
      ],
    },
    about_sai: {
      id: 'about_sai',
      speaker: 'Prof. Mehta',
      text: 'Sai walked through that same entrance not knowing a single line of code. Today he builds worlds. The secret? He never stopped asking "why." That\'s the only prerequisite for this journey.',
      choices: [
        { text: 'Let me begin.', nextNodeId: 'lesson_intro' },
      ],
    },
    lesson_intro: {
      id: 'lesson_intro',
      speaker: 'Prof. Mehta',
      text: 'Every programmer\'s journey begins with a single program. Sai\'s was a calculator. I want to see if you can think the way Sai did when he wrote his first lines. I\'ll ask three questions. Ready?',
      choices: [
        { text: 'Let\'s do it.', nextNodeId: 'q1' },
      ],
    },
    q1: {
      id: 'q1',
      speaker: 'Prof. Mehta',
      text: 'Before Sai wrote a single line of code, what was the very first thing he did?',
      choices: [
        { text: 'Installed a compiler', nextNodeId: 'q1_wrong' },
        { text: 'Planned the logic', nextNodeId: 'q1_correct' },
        { text: 'Wrote the output first', nextNodeId: 'q1_wrong' },
      ],
    },
    q1_correct: {
      id: 'q1_correct',
      speaker: 'Prof. Mehta',
      text: 'Exactly. Planning comes first. Sai\'s rule: think three times, code once. The computer will wait. A clear plan is worth a hundred debugging sessions.',
      nextNodeId: 'q2',
    },
    q1_wrong: {
      id: 'q1_wrong',
      speaker: 'Prof. Mehta',
      text: 'Not quite. Would you build a house without a blueprint? Code is no different. Sai learned this lesson early: the thinking happens before the typing.',
      nextNodeId: 'q1',
    },
    q2: {
      id: 'q2',
      speaker: 'Prof. Mehta',
      text: 'When Sai writes code, what does he focus on first?',
      choices: [
        { text: 'Making it look elegant', nextNodeId: 'q2_wrong' },
        { text: 'Making it work correctly', nextNodeId: 'q2_correct' },
        { text: 'Following every rule', nextNodeId: 'q2_wrong' },
      ],
    },
    q2_correct: {
      id: 'q2_correct',
      speaker: 'Prof. Mehta',
      text: 'Correct. Sai\'s motto: make it work, make it right, make it fast — in that order. Never skip the first step. Working code beats perfect code every time.',
      nextNodeId: 'q3',
    },
    q2_wrong: {
      id: 'q2_wrong',
      speaker: 'Prof. Mehta',
      text: 'Close, but think about the goal. Code isn\'t art — it\'s a tool that solves problems. The first question should always be: does it solve the problem correctly?',
      nextNodeId: 'q2',
    },
    q3: {
      id: 'q3',
      speaker: 'Prof. Mehta',
      text: 'Last one. Sai learned four languages in his first year. What was the most important thing each language taught him?',
      choices: [
        { text: 'A new way of thinking', nextNodeId: 'q3_correct' },
        { text: 'Different syntax rules', nextNodeId: 'q3_wrong' },
        { text: 'How to type faster', nextNodeId: 'q3_wrong' },
      ],
    },
    q3_correct: {
      id: 'q3_correct',
      speaker: 'Prof. Mehta',
      text: 'Precisely. Java taught him discipline. Python taught him clarity. JavaScript taught him the web. Go taught him simplicity. Each language is a new lens for seeing problems. Code is not about computers — it\'s about how you think.',
      nextNodeId: 'completion',
    },
    q3_wrong: {
      id: 'q3_wrong',
      speaker: 'Prof. Mehta',
      text: 'Languages are more than vocabulary. Each one has a philosophy. Sai learned that switching languages meant switching how he approached problems entirely.',
      nextNodeId: 'q3',
    },
    completion: {
      id: 'completion',
      speaker: 'Prof. Mehta',
      text: 'You\'ve completed your first lesson. You have the mindset. Java, Python, JavaScript, Go — these were Sai\'s first companions. They\'re yours now too. The path ahead is long, but every master was once a beginner who refused to stop.',
    },
    done: {
      id: 'done',
      speaker: 'Prof. Mehta',
      text: 'Welcome back. Remember: the computer doesn\'t care about your doubts. It only cares about your code. Keep writing.',
    },
  }

  return { id: NPC_DIALOGUE_ID, title: 'Professor Mehta', nodes, startNodeId: 'start' }
}

function ProfessorModel() {
  const bodyRef = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (bodyRef.current) {
      bodyRef.current.position.y = 1.2 + Math.sin(t * 0.7) * 0.04
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
    <group>
      <mesh ref={bodyRef} position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#d4813a" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh ref={headRef} position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#e8a84c" metalness={0.2} roughness={0.3} />
      </mesh>
      {/* Glasses */}
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

export function ProfessorNPC() {
  const { registerObject, unregisterObject, endInteraction } = useInteractionSystem()
  const dialogueStore = useDialogueStore()
  const notif = useNotificationStore()
  const playerStore = usePlayerStore()
  const acceptedRef = useRef(false)

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
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('done'), 50)
        return
      }

      const prereqQuest = QuestManager.getQuest(PREREQUISITE_QUEST)
      if (!prereqQuest || prereqQuest.status !== 'completed') {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('prereq_not_met'), 50)
        return
      }

      if (quest.status === 'accepted') {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('lesson_intro'), 50)
        return
      }

      dialogueStore.openDialogue(NPC_DIALOGUE_ID)
    })

    const unsubAdvance = EventBus.on(GameEvents.DIALOGUE_ADVANCE, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return

      if (payload?.nodeId === 'lesson_intro') {
        acceptedRef.current = true
        const accepted = QuestManager.acceptQuest(NPC_QUEST_ID)
        if (accepted) {
          soundFX.playQuestAccept()
          notif.addNotification('quest', 'Quest Started', 'The First Lesson — Complete the programming puzzle')
        }
      }

      if (payload?.nodeId === 'completion') {
        QuestManager.completeObjective(NPC_QUEST_ID, 'obj-complete-puzzle')
        const updated = QuestManager.getQuest(NPC_QUEST_ID)
        if (updated?.status === 'completed') {
          soundFX.playQuestComplete()
          soundFX.playBadgeEarned()
          notif.addNotification('badge', 'Badge Earned', 'First Lesson')
          notif.addNotification('knowledge', 'Knowledge +50', 'Programming puzzle completed')

          playerStore.addTrait('java-basics')
          playerStore.addTrait('python-basics')
          playerStore.addTrait('javascript-basics')
          playerStore.addTrait('go-basics')
          notif.addNotification('trait', 'Languages Unlocked', 'Java · Python · JavaScript · Go')
        }
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
  }, [dialogueStore, notif, endInteraction, playerStore])

  return (
    <group position={NPC_POSITION}>
      <ProfessorModel />
      <FloatingName />
    </group>
  )
}
