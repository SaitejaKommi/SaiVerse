'use client'

import { createContext, useContext, useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { SceneID } from '@/types/game'
import type { SceneObject, SceneTransition } from './scene.types'
import { DEFAULT_TRANSITION_DURATION } from './scene.types'
import { SCENE_CONFIG } from './scene.config'
import { useGameStore } from '@/stores/gameStore'

interface SceneContextValue {
  activeScenes: SceneID[]
  registerScene: (scene: SceneObject) => void
  unregisterScene: (id: SceneID) => void
  activateScene: (id: SceneID) => void
  deactivateScene: (id: SceneID) => void
  transition: SceneTransition
}

const SceneContext = createContext<SceneContextValue | null>(null)

export function useSceneManager(): SceneContextValue {
  const ctx = useContext(SceneContext)
  if (!ctx) {
    throw new Error('useSceneManager must be used within a SceneProvider')
  }
  return ctx
}

interface SceneProviderProps {
  children: ReactNode
}

export function SceneProvider({ children }: SceneProviderProps) {
  const [transition, setTransition] = useState<SceneTransition>({
    from: null,
    to: null,
    state: 'none',
    progress: 0,
    duration: DEFAULT_TRANSITION_DURATION,
  })

  const scenesRef = useRef<Map<SceneID, SceneObject>>(new Map())
  const addActiveScene = useGameStore((s) => s.addActiveScene)
  const removeActiveScene = useGameStore((s) => s.removeActiveScene)

  const activeScenes = useGameStore((s) => s.world.activeScenes)

  const registerScene = useCallback((scene: SceneObject) => {
    scenesRef.current.set(scene.id, scene)
  }, [])

  const unregisterScene = useCallback((id: SceneID) => {
    scenesRef.current.delete(id)
    removeActiveScene(id)
  }, [removeActiveScene])

  const deactivateScene = useCallback((id: SceneID) => {
    removeActiveScene(id)
    const scene = scenesRef.current.get(id)
    if (scene) {
      scene.isActive = false
    }
  }, [removeActiveScene])

  const activateScene = useCallback((id: SceneID) => {
    if (activeScenes.length >= SCENE_CONFIG.MAX_ACTIVE_SCENES) return
    if (activeScenes.includes(id)) return

    const scene = scenesRef.current.get(id)
    if (!scene) return

    const lastActive = activeScenes[activeScenes.length - 1] ?? null

    setTransition({
      from: lastActive,
      to: id,
      state: 'entering',
      progress: 0,
      duration: SCENE_CONFIG.TRANSITION_DURATION,
    })

    scene.isActive = true
    addActiveScene(id)

    setTimeout(() => {
      setTransition((prev) => ({
        ...prev,
        state: 'active',
        progress: 1,
      }))
    }, SCENE_CONFIG.TRANSITION_DURATION * 1000)
  }, [activeScenes, addActiveScene])

  return (
    <SceneContext.Provider
      value={{
        activeScenes,
        registerScene,
        unregisterScene,
        activateScene,
        deactivateScene,
        transition,
      }}
    >
      {children}
    </SceneContext.Provider>
  )
}
