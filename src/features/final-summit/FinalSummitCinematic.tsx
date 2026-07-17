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
import { FS_QUEST_ID } from '@/data/final-summit/fs-quest'

const CHAPTER_ID = 'chapter-7'
const CAMERA_PULLBACK_DURATION = 6

const CINEMATIC_START = new THREE.Vector3(0, 2, -348)
const CINEMATIC_END = new THREE.Vector3(0, 80, -250)
const LOOK_AT = new THREE.Vector3(0, 0, -350)

export function FinalSummitCinematic() {
  const setCinematic = useGameStore((s) => s.setCinematic)
  const setFinalePhase = useGameStore((s) => s.setFinalePhase)
  const finalePhase = useGameStore((s) => s.finalePhase)
  const cameraStartPos = useRef(new THREE.Vector3())
  const cameraProgress = useRef(0)
  const rewardsApplied = useRef(false)

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

      QuestManager.completeObjective(FS_QUEST_ID, 'obj-pedestal')

      ChapterManager.completeChapter(CHAPTER_ID)

      soundFX.playBadgeEarned()

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
      }
      cameraProgress.current = Math.min(1, cameraProgress.current + delta / CAMERA_PULLBACK_DURATION)

      const eased = 1 - Math.pow(1 - cameraProgress.current, 2)
      const camPos = new THREE.Vector3().lerpVectors(CINEMATIC_START, CINEMATIC_END, eased)
      state.camera.position.copy(camPos)
      state.camera.lookAt(LOOK_AT)

      if (cameraProgress.current >= 1) {
        EventBus.emit(GameEvents.AMBIENCE_FADE, { target: 0, duration: 2 })
        setFinalePhase('dialogue')
        setTimeout(() => setFinalePhase('rewards'), 500)
      }
    }
  })

  return null
}
