'use client'

import { createContext, useContext, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { SpawnPoint } from './world.types'
import { SPAWN_CONFIG } from './world.config'

interface SpawnContextValue {
  spawns: Map<string, SpawnPoint>
  registerSpawn: (spawn: SpawnPoint) => void
  unregisterSpawn: (id: string) => void
  getSpawn: (id: string) => SpawnPoint | undefined
  setActiveSpawn: (id: string) => void
  getDefaultSpawn: () => SpawnPoint | undefined
}

const SpawnContext = createContext<SpawnContextValue | null>(null)

export function useSpawnSystem(): SpawnContextValue {
  const ctx = useContext(SpawnContext)
  if (!ctx) throw new Error('useSpawnSystem must be used within SpawnProvider')
  return ctx
}

interface SpawnProviderProps {
  children: ReactNode
  defaultSpawnId?: string
}

export function SpawnProvider({ children, defaultSpawnId = SPAWN_CONFIG.DEFAULT_SPAWN }: SpawnProviderProps) {
  const spawnsRef = useRef<Map<string, SpawnPoint>>(new Map())
  const activeSpawnRef = useRef<string>(defaultSpawnId)

  const registerSpawn = useCallback((spawn: SpawnPoint) => {
    spawnsRef.current.set(spawn.id, spawn)
  }, [])

  const unregisterSpawn = useCallback((id: string) => {
    spawnsRef.current.delete(id)
  }, [])

  const getSpawn = useCallback((id: string): SpawnPoint | undefined => {
    return spawnsRef.current.get(id)
  }, [])

  const setActiveSpawn = useCallback((id: string) => {
    if (spawnsRef.current.has(id)) {
      activeSpawnRef.current = id
    }
  }, [])

  const getDefaultSpawn = useCallback((): SpawnPoint | undefined => {
    return spawnsRef.current.get(defaultSpawnId) ?? spawnsRef.current.values().next().value
  }, [defaultSpawnId])

  return (
    <SpawnContext.Provider value={{
      spawns: spawnsRef.current,
      registerSpawn,
      unregisterSpawn,
      getSpawn,
      setActiveSpawn,
      getDefaultSpawn,
    }}>
      {children}
    </SpawnContext.Provider>
  )
}
