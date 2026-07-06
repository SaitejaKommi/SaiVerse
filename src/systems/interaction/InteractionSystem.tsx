'use client'

import { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { InteractableDef } from './interaction.types'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import { useGameStore } from '@/stores/gameStore'

interface InteractionContextValue {
  registerObject: (obj: InteractableDef) => void
  unregisterObject: (id: string) => void
  updateObject: (id: string, data: Partial<InteractableDef>) => void
  getNearestInRange: (pos: THREE.Vector3) => InteractableDef | null
  interact: (id: string) => boolean
  endInteraction: () => void
  nearestObject: InteractableDef | null
  isInteracting: boolean
  activeInteractionId: string | null
}

const InteractionContext = createContext<InteractionContextValue | null>(null)

export function useInteractionSystem(): InteractionContextValue {
  const ctx = useContext(InteractionContext)
  if (!ctx) throw new Error('useInteractionSystem must be used within InteractionProvider')
  return ctx
}

interface InteractionProviderProps {
  children: ReactNode
}

export function InteractionProvider({ children }: InteractionProviderProps) {
  const objectsRef = useRef<Map<string, InteractableDef>>(new Map())
  const [nearestObject, setNearestObject] = useState<InteractableDef | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null)
  const playerPos = useRef(new THREE.Vector3(0, 0, 0))

  const clearInteraction = useCallback(() => {
    setIsInteracting(false)
    setActiveInteractionId(null)
  }, [])

  const registerObject = useCallback((obj: InteractableDef) => {
    objectsRef.current.set(obj.id, obj)
  }, [])

  const unregisterObject = useCallback((id: string) => {
    objectsRef.current.delete(id)
  }, [])

  const updateObject = useCallback((id: string, data: Partial<InteractableDef>) => {
    const obj = objectsRef.current.get(id)
    if (obj) objectsRef.current.set(id, { ...obj, ...data })
  }, [])

  const getNearestInRange = useCallback((pos: THREE.Vector3): InteractableDef | null => {
    let nearest: InteractableDef | null = null
    let nearestDist = 3

    for (const [, obj] of objectsRef.current) {
      if (!obj.isActive || !obj.isInteractable) continue
      const dx = obj.position[0] - pos.x
      const dz = obj.position[2] - pos.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < nearestDist && dist <= obj.radius) {
        nearestDist = dist
        nearest = obj
      }
    }

    return nearest
  }, [])

  const interact = useCallback((id: string): boolean => {
    const obj = objectsRef.current.get(id)
    if (!obj?.isActive || !obj.isInteractable) return false

    setIsInteracting(true)
    setActiveInteractionId(id)

    EventBus.emit<{ objectId: string; objectType: string; position: [number, number, number] }>(
      GameEvents.INTERACTION_START,
      { objectId: id, objectType: obj.type, position: obj.position },
    )

    return true
  }, [])

  const endInteraction = useCallback(() => {
    const currentId = activeInteractionId
    clearInteraction()
    if (currentId) {
      EventBus.emit(GameEvents.INTERACTION_COMPLETE, {
        objectId: currentId,
        objectType: '',
        position: [0, 0, 0],
      })
    }
  }, [activeInteractionId, clearInteraction])

  useEffect(() => {
    const unsub = EventBus.on(GameEvents.INTERACTION_COMPLETE, () => {
      clearInteraction()
    })
    return () => { unsub() }
  }, [clearInteraction])

  useFrame(() => {
    const player = useGameStore.getState().player
    playerPos.current.set(player.position[0], player.position[1], player.position[2])
    const nearest = getNearestInRange(playerPos.current)
    setNearestObject(nearest)
  })

  return (
    <InteractionContext.Provider
      value={{
        registerObject,
        unregisterObject,
        updateObject,
        getNearestInRange,
        interact,
        endInteraction,
        nearestObject,
        isInteracting,
        activeInteractionId,
      }}
    >
      {children}
    </InteractionContext.Provider>
  )
}
