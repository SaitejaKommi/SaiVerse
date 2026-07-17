'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { ChapterManager } from '@/systems/chapter/ChapterManager'
import { useHackathonStore } from '@/features/hackathon-arena/HackathonStore'
import { HA_CENTER } from '@/data/hackathon-arena/ha-layout'

const PULLBACK_DURATION = 3
const HOLD_DURATION = 5

export function Chapter5FinaleCamera() {
  const activeRef = useRef(false)
  const progressRef = useRef(0)
  const startPosRef = useRef(new THREE.Vector3())
  const targetPosRef = useRef(new THREE.Vector3())
  const holdTimerRef = useRef(0)
  const doneRef = useRef(false)
  const lookAtRef = useRef(new THREE.Vector3(HA_CENTER[0], 2, HA_CENTER[2]))
  const initializedRef = useRef(false)

  useEffect(() => {
    const unsub = useHackathonStore.subscribe((state) => {
      if (state.phase === 'complete' && !doneRef.current) {
        doneRef.current = true
        activeRef.current = true
        progressRef.current = 0
        holdTimerRef.current = 0
        initializedRef.current = false
        useGameStore.getState().setCinematic(true)
        ChapterManager.completeChapter('chapter-5')
      }
    })
    return unsub
  }, [])

  useFrame((state, delta) => {
    if (!activeRef.current) return

    const cam = state.camera as THREE.PerspectiveCamera

    if (!initializedRef.current) {
      startPosRef.current.copy(cam.position)
      targetPosRef.current.set(HA_CENTER[0], 14, HA_CENTER[2] + 20)
      initializedRef.current = true
    }

    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta / PULLBACK_DURATION)
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
