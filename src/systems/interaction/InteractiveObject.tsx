'use client'

import { createContext, useContext, useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { InteractiveObjectData } from '@/systems/world/world.types'
import { INTERACTIVE_CONFIG } from '@/systems/world/world.config'
import { useGameStore } from '@/stores/gameStore'
import { InputManager } from '@/systems/input/InputManager'

interface InteractiveContextValue {
  registerObject: (obj: InteractiveObjectData) => void
  unregisterObject: (id: string) => void
  getNearestInRange: (pos: [number, number, number]) => InteractiveObjectData | null
  interact: (id: string) => boolean
  nearestObject: InteractiveObjectData | null
}

const InteractiveContext = createContext<InteractiveContextValue | null>(null)

export function useInteractiveSystem(): InteractiveContextValue {
  const ctx = useContext(InteractiveContext)
  if (!ctx) throw new Error('useInteractiveSystem must be used within InteractiveProvider')
  return ctx
}

interface InteractiveProviderProps {
  children: ReactNode
}

export function InteractiveProvider({ children }: InteractiveProviderProps) {
  const objectsRef = useRef<Map<string, InteractiveObjectData>>(new Map())
  const [nearestObject, setNearestObject] = useState<InteractiveObjectData | null>(null)
  const playerPos = useRef(new THREE.Vector3(0, 0, 0))

  const registerObject = useCallback((obj: InteractiveObjectData) => {
    objectsRef.current.set(obj.id, obj)
  }, [])

  const unregisterObject = useCallback((id: string) => {
    objectsRef.current.delete(id)
  }, [])

  const getNearestInRange = useCallback((pos: [number, number, number]): InteractiveObjectData | null => {
    let nearest: InteractiveObjectData | null = null
    let nearestDist = INTERACTIVE_CONFIG.PROMPT_DISTANCE

    for (const [, obj] of objectsRef.current) {
      if (!obj.isActive || !obj.isInteractable) continue
      const dx = obj.position[0] - pos[0]
      const dz = obj.position[2] - pos[2]
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < nearestDist) {
        nearestDist = dist
        nearest = obj
      }
    }

    return nearest
  }, [])

  const interact = useCallback((id: string): boolean => {
    const obj = objectsRef.current.get(id)
    if (!obj?.isActive || !obj.isInteractable) return false
    return true
  }, [])

  useFrame(() => {
    const player = useGameStore.getState().player
    playerPos.current.set(player.position[0], player.position[1], player.position[2])

    const nearest = getNearestInRange([playerPos.current.x, playerPos.current.y, playerPos.current.z])
    setNearestObject(nearest)

    const input = InputManager.getInstance()
    if (input.isActionPressed('interact') && nearest) {
      interact(nearest.id)
    }
  })

  return (
    <InteractiveContext.Provider value={{
      registerObject,
      unregisterObject,
      getNearestInRange,
      interact,
      nearestObject,
    }}>
      {children}
    </InteractiveContext.Provider>
  )
}
