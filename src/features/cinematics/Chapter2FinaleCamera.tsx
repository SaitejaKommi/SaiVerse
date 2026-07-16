'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useQuestStore } from '@/stores/questStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { ChapterManager } from '@/systems/chapter/ChapterManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

const SC_QUEST_ID = 'quest-software-project'
const CHAPTER_ID = 'chapter-2'
const CAMERA_PULLBACK_DURATION = 3.5

const CINEMATIC_CAMERA_POS = new THREE.Vector3(15, 14, -290)
const CINEMATIC_LOOK_AT = new THREE.Vector3(0, 0, -250)

export function Chapter2FinaleCamera() {
  const setCinematic = useGameStore((s) => s.setCinematic)
  const setFinalePhase = useGameStore((s) => s.setFinalePhase)
  const finalePhase = useGameStore((s) => s.finalePhase)
  const cameraStartPos = useRef(new THREE.Vector3())
  const cameraProgress = useRef(0)
  const rewardsApplied = useRef(false)

  const phaseRef = useRef(finalePhase)
  phaseRef.current = finalePhase

  useEffect(() => {
    const unsub = EventBus.on(GameEvents.CHAPTER_FINALE_TRIGGER, () => {
      if (useGameStore.getState().finalePhase !== 'idle') return
      const questStore = useQuestStore.getState()
      if (!questStore.activeQuestIds.includes(SC_QUEST_ID)) return
      setFinalePhase('pullback')
      setCinematic(true)
    })
    return () => { unsub() }
  }, [setFinalePhase, setCinematic])

  useEffect(() => {
    if (finalePhase === 'rewards' && !rewardsApplied.current) {
      rewardsApplied.current = true

      QuestManager.completeObjective(SC_QUEST_ID, 'obj-show-tech-lead')

      ChapterManager.completeChapter(CHAPTER_ID)

      soundFX.playBadgeEarned()
      EventBus.emit(GameEvents.CELEBRATION_TRIGGER, { type: 'js_unlock' })

      setTimeout(() => {
        setFinalePhase('complete_show')
        soundFX.playQuestComplete()
      }, 1500)
    }
  }, [finalePhase, setFinalePhase])

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
