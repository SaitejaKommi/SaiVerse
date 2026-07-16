'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useQuestStore } from '@/stores/questStore'
import { OSV_QUEST_ID } from '@/data/open-source-valley/osv-quest'
import { OSV_CENTER } from '@/data/open-source-valley/osv-layout'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

const DURATION = 4
const HOLD_DURATION = 3

export function Chapter4FinaleCamera() {
  const activeRef = useRef(false)
  const progressRef = useRef(0)
  const startPosRef = useRef(new THREE.Vector3())
  const targetPosRef = useRef(new THREE.Vector3())
  const holdTimerRef = useRef(0)
  const doneRef = useRef(false)
  const lookAtRef = useRef(new THREE.Vector3(OSV_CENTER[0], 0, OSV_CENTER[2]))
  const initializedRef = useRef(false)

  useEffect(() => {
    const check = () => {
      const completed = useQuestStore.getState().completedQuestIds.includes(OSV_QUEST_ID)
      if (completed && !doneRef.current) {
        doneRef.current = true
        activeRef.current = true
        progressRef.current = 0
        holdTimerRef.current = 0
        useGameStore.getState().setCinematic(true)
        EventBus.emit(GameEvents.CELEBRATION_TRIGGER, { type: 'chapter-complete' })
      }
    }

    const interval = setInterval(check, 500)
    return () => clearInterval(interval)
  }, [])

  useFrame((state, delta) => {
    if (!activeRef.current) return

    const cam = state.camera as THREE.PerspectiveCamera

    if (!initializedRef.current) {
      startPosRef.current.copy(cam.position)
      targetPosRef.current.set(OSV_CENTER[0], 18, OSV_CENTER[2] + 25)
      initializedRef.current = true
    }

    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta / DURATION)
      const eased = 1 - Math.pow(1 - progressRef.current, 3)

      cam.position.lerpVectors(startPosRef.current, targetPosRef.current, eased)
      cam.lookAt(lookAtRef.current)
    } else {
      holdTimerRef.current += delta
      cam.lookAt(lookAtRef.current)

      if (holdTimerRef.current >= HOLD_DURATION) {
        activeRef.current = false
        useGameStore.getState().setCinematic(false)
      }
    }
  })

  return null
}
