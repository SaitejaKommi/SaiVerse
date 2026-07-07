'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { ChapterManager } from '@/systems/chapter/ChapterManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

const CAMPUS_QUEST_ID = 'quest-first-lesson'
const CHAPTER_ID = 'chapter-1'
const CAMERA_PULLBACK_DURATION = 3

const CINEMATIC_CAMERA_POS = new THREE.Vector3(5, 18, -85)
const CINEMATIC_LOOK_AT = new THREE.Vector3(0, 0, -180)

export function ChapterFinaleCamera() {
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
      setFinalePhase('pullback')
      setCinematic(true)
    })
    return () => { unsub() }
  }, [setFinalePhase, setCinematic])

  useEffect(() => {
    if (finalePhase === 'rewards' && !rewardsApplied.current) {
      rewardsApplied.current = true

      QuestManager.completeObjective(CAMPUS_QUEST_ID, 'obj-show-professor')

      ChapterManager.completeChapter(CHAPTER_ID)

      soundFX.playBadgeEarned()
      EventBus.emit(GameEvents.CELEBRATION_TRIGGER, { type: 'java_unlock' })

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
