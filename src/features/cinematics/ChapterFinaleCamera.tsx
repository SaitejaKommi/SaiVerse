'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

const CAMPUS_QUEST_ID = 'quest-first-lesson'
const CAMERA_PULLBACK_DURATION = 3

const CINEMATIC_CAMERA_POS = new THREE.Vector3(5, 18, -85)
const CINEMATIC_LOOK_AT = new THREE.Vector3(0, 0, -180)

export function ChapterFinaleCamera() {
  const setCinematic = useGameStore((s) => s.setCinematic)
  const setFinalePhase = useGameStore((s) => s.setFinalePhase)
  const finalePhase = useGameStore((s) => s.finalePhase)
  const notif = useNotificationStore()
  const playerStore = usePlayerStore()
  const cameraStartPos = useRef(new THREE.Vector3())
  const cameraProgress = useRef(0)
  const rewardsApplied = useRef(false)

  const phaseRef = useRef(finalePhase)
  phaseRef.current = finalePhase

  useEffect(() => {
    const unsub = EventBus.on(GameEvents.CHAPTER_FINALE_TRIGGER, () => {
      if (useGameStore.getState().finalePhase !== 'idle') return
      setFinalePhase('pullback')
      setCinematic(true)
    })
    return () => { unsub() }
  }, [setFinalePhase, setCinematic])

  useEffect(() => {
    if (finalePhase === 'rewards' && !rewardsApplied.current) {
      rewardsApplied.current = true

      QuestManager.completeObjective(CAMPUS_QUEST_ID, 'obj-show-professor')

      const quest = QuestManager.getQuest(CAMPUS_QUEST_ID)
      const alreadyCompleted = quest?.status === 'completed'

      if (!alreadyCompleted) {
        playerStore.addTrait('java-basics')
        playerStore.addKnowledge(50, 'chapter:1')
        playerStore.addBadge('chapter-1-complete')

        soundFX.playQuestComplete()
        soundFX.playBadgeEarned()
        notif.addNotification('trait', 'Language Unlocked', 'Java')
        notif.addNotification('knowledge', 'Knowledge +50', 'Chapter 1 completed')
        notif.addNotification('badge', 'Badge Earned', 'Chapter 1 Complete')
      }

      EventBus.emit(GameEvents.CELEBRATION_TRIGGER, { type: 'java_unlock' })
      EventBus.emit(GameEvents.CHAPTER_COMPLETE, { chapter: 1 })

      setTimeout(() => {
        setFinalePhase('complete_show')
        soundFX.playQuestComplete()
      }, 1500)
    }
  }, [finalePhase, setFinalePhase, notif, playerStore])

  useFrame((state, delta) => {
    if (finalePhase === 'pullback') {
      if (cameraProgress.current === 0) {
        cameraStartPos.current.copy(state.camera.position)
        cameraProgress.current = 0
      }
      cameraProgress.current = Math.min(1, cameraProgress.current + delta / CAMERA_PULLBACK_DURATION)

      const eased = 1 - Math.pow(1 - cameraProgress.current, 3)
      const camPos = new THREE.Vector3().lerpVectors(cameraStartPos.current, CINEMATIC_CAMERA_POS, eased)
      state.camera.position.copy(camPos)
      state.camera.lookAt(CINEMATIC_LOOK_AT)

      if (cameraProgress.current >= 1) {
        EventBus.emit(GameEvents.AMBIENCE_FADE, { target: 0, duration: 1.5 })
        setFinalePhase('dialogue')
      }
    }
  })

  return null
}
