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

const NPC_ID = 'npc-tech-mentor'
const NPC_DIALOGUE_ID = 'tech-mentor-dialogue'
const NPC_QUEST_ID = 'quest-software-project'
const NPC_POSITION: [number, number, number] = [0, 0.5, -248]

const TERMINAL_ID = 'dev-terminal'
const CODE_EDITOR_ID = 'code-editor'

const PREREQUISITE_QUEST = 'quest-first-lesson'

function buildQuest(): QuestDef {
  return {
    id: NPC_QUEST_ID,
    title: 'The Software Project',
    description: 'Set up your dev environment, fix the code bug, and ship your first software project.',
    category: 'main',
    status: 'available',
    prerequisites: [{ questId: PREREQUISITE_QUEST }],
    dialogueStartId: NPC_DIALOGUE_ID,
    dialogueCompleteId: NPC_DIALOGUE_ID,
    rewards: { knowledge: 75, badgeId: 'project-shipped' },
    objectives: [
      { id: 'obj-setup-env', type: 'activate', description: 'Configure the development environment', targetId: 'dev-terminal', count: 1, current: 0, isOptional: false },
      { id: 'obj-fix-bug', type: 'use', description: 'Fix the bug in the React component', targetId: 'code-editor', count: 1, current: 0, isOptional: false },
      { id: 'obj-show-tech-lead', type: 'talk', description: 'Show your completed project to the Tech Lead', targetId: 'tech-mentor', count: 1, current: 0, isOptional: false },
    ],
  }
}

function buildDialogue(): DialogueDef {
  const nodes: Record<string, DialogueNode> = {
    prereq_not_met: {
      id: 'prereq_not_met',
      speaker: 'Tech Lead',
      text: 'You\'ve arrived early! The Software City district opens once you\'ve completed Professor Mehta\'s lesson. Head back to the campus and finish the Java fundamentals first.',
    },
    intro: {
      id: 'intro',
      speaker: 'Tech Lead',
      text: 'Welcome to Software City — Sai\'s frontier of modern engineering. Here we build with JavaScript, React, and Next.js. Before you ship anything, you need the right tools and the right mindset. I\'ve set up a terminal for environment setup and a code editor with a real bug to fix. Complete both and show me your work.',
    },
    intro_accepted: {
      id: 'intro_accepted',
      speaker: 'Tech Lead',
      text: 'The terminal is waiting — configure your environment first. Then move to the code editor and fix the bug. I\'ll be right here when you\'re ready to ship.',
    },
    explore: {
      id: 'explore',
      speaker: 'Tech Lead',
      text: 'Still setting up? Start with the dev terminal — it installs your toolchain. Then tackle the code editor. One step at a time.',
    },
    terminal: {
      id: 'terminal',
      speaker: 'Tech Lead',
      text: 'The dev terminal shows the project scaffold. Dependencies are listed, the config files are in place. Everything you need to start coding. In the real world, this is where every project begins: with a clean workspace and the right tools installed. Initializing environment... done.',
    },
    code_editor: {
      id: 'code_editor',
      speaker: 'Tech Lead',
      text: 'Here\'s the challenge. A React component has a subtle bug. A counter should update the document title on every change, but it only runs once. Which fix is correct?',
      choices: [
        { text: 'Add count to the dependency array: [count]', nextNodeId: 'editor_correct' },
        { text: 'Change useState(0) to useState(10)', nextNodeId: 'editor_wrong' },
        { text: 'Remove the useEffect entirely', nextNodeId: 'editor_wrong' },
        { text: 'Replace useEffect with useLayoutEffect', nextNodeId: 'editor_wrong' },
      ],
    },
    editor_correct: {
      id: 'editor_correct',
      speaker: 'Tech Lead',
      text: 'Exactly right. In React, the dependency array tells the effect when to re-run. Without count in the array, the effect captures the initial value and never updates. This is one of the most common bugs in React — and you just fixed it like a pro.',
    },
    editor_wrong: {
      id: 'editor_wrong',
      speaker: 'Tech Lead',
      text: 'Not quite. Think about why the effect isn\'t re-running. The dependency array controls when the effect fires. What\'s missing from it? Try again.',
      nextNodeId: 'code_editor',
    },
    need_terminal: {
      id: 'need_terminal',
      speaker: 'Tech Lead',
      text: 'Configure the dev environment first — the terminal is to your left. You can\'t fix code without the right toolchain.',
    },
    no_quest: {
      id: 'no_quest',
      speaker: 'Tech Lead',
      text: 'This station isn\'t active. Speak with me first to start the project.',
    },
    already_done: {
      id: 'already_done',
      speaker: 'Tech Lead',
      text: 'Already completed. Solid work. Move on to the next station.',
    },
    completion: {
      id: 'completion',
      speaker: 'Tech Lead',
      text: 'You configured your environment. You diagnosed a real React bug. You shipped the fix. That\'s the full development cycle — from setup to deployment. JavaScript and React are now part of your stack. Software City was built on code like this. Take a moment — you\'ve earned the view.',
    },
    done: {
      id: 'done',
      speaker: 'Tech Lead',
      text: 'Welcome back, engineer. The city is always building. New projects, new bugs, new deployments. Keep shipping.',
    },
  }

  return { id: NPC_DIALOGUE_ID, title: 'Tech Lead', nodes, startNodeId: 'intro' }
}

function TechMentorModel() {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const lookTarget = useRef(new THREE.Vector3())
  const visorRef = useRef<THREE.Mesh>(null)

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
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.04
    }

    if (headRef.current) {
      headRef.current.position.y = 1.8 + Math.sin(t * 0.6) * 0.04
    }

    if (glowRef.current) {
      glowRef.current.position.y = 0.01 + Math.sin(t * 1.2) * 0.02
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.05)
    }

    if (visorRef.current) {
      const mat = visorRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(t * 0.8) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2dd4bf" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh ref={headRef} position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#5eead4" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh ref={visorRef} position={[0, 1.82, 0.2]}>
        <planeGeometry args={[0.18, 0.04]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.45, 32]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.25} side={THREE.DoubleSide} />
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

    ctx.shadowColor = 'rgba(45,212,191,0.5)'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#2dd4bf'
    ctx.font = 'bold 28px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('◆ Tech Lead ◆', 256, 32)

    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.needsUpdate = true
  }

  return (
    <sprite position={[0, 2.5, 0]} scale={[2.2, 0.35, 1]}>
      <spriteMaterial map={textureRef.current} transparent opacity={0.9} depthTest={false} />
    </sprite>
  )
}

function isQuestObjectiveDone(questId: string, objectiveId: string): boolean {
  const q = QuestManager.getQuest(questId)
  if (!q) return false
  const obj = q.objectives.find((o) => o.id === objectiveId)
  return obj ? obj.current >= obj.count : false
}

export function TechMentorNPC() {
  const { registerObject, unregisterObject, endInteraction } = useInteractionSystem()
  const dialogueStore = useDialogueStore()
  const notif = useNotificationStore()
  const playerStore = usePlayerStore()
  const dialogueRegistered = useRef(false)

  useEffect(() => {
    registerObject({
      id: NPC_ID,
      type: 'talk',
      label: 'Tech Lead',
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
      if (![NPC_ID, TERMINAL_ID, CODE_EDITOR_ID].includes(payload.objectId)) return

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
            isQuestObjectiveDone(NPC_QUEST_ID, 'obj-setup-env') &&
            isQuestObjectiveDone(NPC_QUEST_ID, 'obj-fix-bug')
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

      if (payload.objectId === TERMINAL_ID) {
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('terminal'), 50)
        return
      }

      if (payload.objectId === CODE_EDITOR_ID) {
        if (!isQuestObjectiveDone(NPC_QUEST_ID, 'obj-setup-env')) {
          dialogueStore.openDialogue(NPC_DIALOGUE_ID)
          setTimeout(() => dialogueStore.goToNode('need_terminal'), 50)
          return
        }
        if (isQuestObjectiveDone(NPC_QUEST_ID, 'obj-fix-bug')) {
          dialogueStore.openDialogue(NPC_DIALOGUE_ID)
          setTimeout(() => dialogueStore.goToNode('already_done'), 50)
          return
        }
        dialogueStore.openDialogue(NPC_DIALOGUE_ID)
        setTimeout(() => dialogueStore.goToNode('code_editor'), 50)
        return
      }
    })

    const unsubAdvance = EventBus.on(GameEvents.DIALOGUE_ADVANCE, (payload: any) => {
      if (payload?.dialogueId !== NPC_DIALOGUE_ID) return

      if (payload?.nodeId === 'intro') {
        const accepted = QuestManager.acceptQuest(NPC_QUEST_ID)
        if (accepted) {
          soundFX.playQuestAccept()
          notif.addNotification('quest', 'Quest Started', 'The Software Project — Setup, fix, and ship')
        }
      }

      if (payload?.nodeId === 'terminal') {
        QuestManager.completeObjective(NPC_QUEST_ID, 'obj-setup-env')
      }

      if (payload?.nodeId === 'editor_correct') {
        QuestManager.completeObjective(NPC_QUEST_ID, 'obj-fix-bug')
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
      unsubStart()
      unsubAdvance()
      unsubEnd()
    }
  }, [dialogueStore, notif, endInteraction, playerStore])

  return (
    <group position={NPC_POSITION}>
      <TechMentorModel />
      <FloatingName />
    </group>
  )
}

export { NPC_DIALOGUE_ID, TERMINAL_ID, CODE_EDITOR_ID, NPC_ID }
