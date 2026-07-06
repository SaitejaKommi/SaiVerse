'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useDialogueStore } from '@/stores/dialogueStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import { CAMPUS_ENTRANCE_POSITION } from '@/data/bengaluru/hub-layout'

const TRIGGER_DISTANCE = 8
const CAMPUS_QUEST_ID = 'quest-first-step'
const CAMPUS_DIALOGUE_ID = 'npc-placeholder-dialogue'
const CAMERA_PAN_DURATION = 2

const CINEMATIC_CAMERA_POS = new THREE.Vector3(15, 6, -55)
const CINEMATIC_LOOK_AT = new THREE.Vector3(0, 4, -65)

export function CampusRevealCinematic() {
  const setCinematic = useGameStore((s) => s.setCinematic)
  const playerPos = useRef(new THREE.Vector3(0, 0, 0))
  const cinematicRef = useRef(false)
  const cameraStartPos = useRef(new THREE.Vector3())
  const cameraProgress = useRef(0)
  const dialogueEndedRef = useRef(false)
  const notif = useNotificationStore()

  useEffect(() => {
    const unsub = EventBus.on(GameEvents.DIALOGUE_END, () => {
      dialogueEndedRef.current = true
    })
    return () => { unsub() }
  }, [])

  useFrame((state, delta) => {
    const player = useGameStore.getState().player
    playerPos.current.set(player.position[0], player.position[1], player.position[2])

    const dx = playerPos.current.x - CAMPUS_ENTRANCE_POSITION[0]
    const dz = playerPos.current.z - CAMPUS_ENTRANCE_POSITION[2]
    const distToEntrance = Math.sqrt(dx * dx + dz * dz)

    const quest = QuestManager.getQuest(CAMPUS_QUEST_ID)

    if (
      !cinematicRef.current &&
      distToEntrance < TRIGGER_DISTANCE &&
      quest?.status === 'accepted'
    ) {
      cinematicRef.current = true
      dialogueEndedRef.current = false
      setCinematic(true)
      cameraStartPos.current.copy(state.camera.position)
      cameraProgress.current = 0
    }

    if (cinematicRef.current) {
      cameraProgress.current = Math.min(1, cameraProgress.current + delta / CAMERA_PAN_DURATION)

      const eased = 1 - Math.pow(1 - cameraProgress.current, 3)

      const camPos = new THREE.Vector3().lerpVectors(
        cameraStartPos.current,
        CINEMATIC_CAMERA_POS,
        eased,
      )
      state.camera.position.copy(camPos)
      state.camera.lookAt(CINEMATIC_LOOK_AT)

      if (cameraProgress.current >= 1 && !dialogueEndedRef.current) {
        const dialogueStore = useDialogueStore.getState()
        if (!dialogueStore.isOpen) {
          dialogueStore.openDialogue(CAMPUS_DIALOGUE_ID)
          setTimeout(() => dialogueStore.goToNode('campus_reveal'), 50)
        }
      }

      if (dialogueEndedRef.current) {
        QuestManager.completeObjective(CAMPUS_QUEST_ID, 'obj-reach-campus')
        const updated = QuestManager.getQuest(CAMPUS_QUEST_ID)
        if (updated?.status === 'completed') {
          soundFX.playQuestComplete()
          soundFX.playBadgeEarned()
          notif.addNotification('badge', 'Badge Earned', 'Journey Begins')
          notif.addNotification('knowledge', 'Knowledge +25', 'First step completed')
          notif.addNotification('quest', 'Quest Complete', 'The First Step')
        }
        setCinematic(false)
        cinematicRef.current = false
      }
    }
  })

  return null
}
