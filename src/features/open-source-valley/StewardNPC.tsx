'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDialogueStore } from '@/stores/dialogueStore'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import { STEWARD_DIALOGUE_ID, buildStewardDialogue } from '@/data/open-source-valley/osv-dialogue'
import { STATION_POSITIONS } from '@/data/open-source-valley/osv-layout'
import { useQuestStore } from '@/stores/questStore'
import { OSV_QUEST_ID } from '@/data/open-source-valley/osv-quest'

const POS = new THREE.Vector3(...STATION_POSITIONS.steward)

export function StewardNPC() {
  const groupRef = useRef<THREE.Group>(null)
  const finaleLineRef = useRef(false)
  const { registerObject, unregisterObject } = useInteractionSystem()
  const dialogueStore = useDialogueStore()

  useEffect(() => {
    const dialogue = buildStewardDialogue()
    dialogueStore.registerDialogue(dialogue)
  }, [dialogueStore])

  useEffect(() => {
    const id = 'npc-steward'
    registerObject({
      id,
      type: 'talk',
      label: 'Talk',
      position: [POS.x, POS.y, POS.z],
      radius: 3,
      isActive: true,
      isInteractable: true,
      data: { dialogueId: STEWARD_DIALOGUE_ID },
    })

    const handler = (payload: any) => {
      if (payload.objectId === id) {
        const quest = useQuestStore.getState().quests[OSV_QUEST_ID]
        if (quest?.status === 'completed' && !finaleLineRef.current) {
          finaleLineRef.current = true
          dialogueStore.registerDialogue({
            id: STEWARD_DIALOGUE_ID,
            title: 'The Steward',
            startNodeId: 'finale',
            nodes: {
              finale: {
                id: 'finale',
                speaker: 'The Steward',
                text: 'This is what we built together.',
                nextNodeId: undefined,
              },
            },
          })
        }
        dialogueStore.openDialogue(STEWARD_DIALOGUE_ID, [POS.x, POS.y, POS.z])
      }
    }
    EventBus.on(GameEvents.INTERACTION_START, handler)

    return () => {
      unregisterObject(id)
      EventBus.off(GameEvents.INTERACTION_START, handler)
    }
  }, [registerObject, unregisterObject, dialogueStore])

  useFrame((state) => {
    if (!groupRef.current) return
    const float = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    groupRef.current.position.y = float
  })

  return (
    <group ref={groupRef} position={POS}>
      <mesh position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 8, 12]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#5c4a32" />
      </mesh>
      <mesh position={[0, 0.35, -0.15]}>
        <boxGeometry args={[0.15, 0.2, 0.02]} />
        <meshBasicMaterial color="#fefae0" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
