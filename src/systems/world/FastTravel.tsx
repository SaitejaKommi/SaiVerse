'use client'

import { createContext, useContext, useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { FastTravelNode } from './world.types'
import { FAST_TRAVEL_CONFIG } from './world.config'
import { useGameStore } from '@/stores/gameStore'

interface FastTravelContextValue {
  nodes: Map<string, FastTravelNode>
  registerNode: (node: FastTravelNode) => void
  unregisterNode: (id: string) => void
  travel: (fromId: string, toId: string) => boolean
  getConnections: (nodeId: string) => FastTravelNode[]
  unlockNode: (id: string) => void
  isNodeUnlocked: (id: string) => boolean
  isTraveling: boolean
}

const FastTravelContext = createContext<FastTravelContextValue | null>(null)

export function useFastTravel(): FastTravelContextValue {
  const ctx = useContext(FastTravelContext)
  if (!ctx) throw new Error('useFastTravel must be used within FastTravelProvider')
  return ctx
}

interface FastTravelProviderProps {
  children: ReactNode
}

export function FastTravelProvider({ children }: FastTravelProviderProps) {
  const nodesRef = useRef<Map<string, FastTravelNode>>(new Map())
  const [isTraveling, setIsTraveling] = useState(false)
  const unlockWaypoint = useGameStore((s) => s.unlockWaypoint)
  const activeWaypoints = useGameStore((s) => s.world.activeWaypoints)

  const registerNode = useCallback((node: FastTravelNode) => {
    nodesRef.current.set(node.id, node)
  }, [])

  const unregisterNode = useCallback((id: string) => {
    nodesRef.current.delete(id)
  }, [])

  const unlockNode = useCallback((id: string) => {
    const node = nodesRef.current.get(id)
    if (!node) return
    node.isUnlocked = true
    unlockWaypoint(id)
  }, [unlockWaypoint])

  const isNodeUnlocked = useCallback((id: string): boolean => {
    const node = nodesRef.current.get(id)
    if (!node) return false
    return node.isUnlocked || activeWaypoints.includes(id)
  }, [activeWaypoints])

  const getConnections = useCallback((nodeId: string): FastTravelNode[] => {
    const node = nodesRef.current.get(nodeId)
    if (!node) return []
    return node.connections
      .map((id) => nodesRef.current.get(id))
      .filter((n): n is FastTravelNode => n !== undefined && (n.isUnlocked || activeWaypoints.includes(n.id)))
  }, [activeWaypoints])

  const travel = useCallback((fromId: string, toId: string): boolean => {
    const from = nodesRef.current.get(fromId)
    const to = nodesRef.current.get(toId)

    if (!from || !to) return false
    if (!to.isUnlocked && !activeWaypoints.includes(to.id)) return false

    const isConnected = from.connections.includes(toId)
    if (!isConnected) return false

    setIsTraveling(true)

    setTimeout(() => {
      setIsTraveling(false)
    }, FAST_TRAVEL_CONFIG.TRANSITION_DURATION * 1000)

    return true
  }, [activeWaypoints])

  return (
    <FastTravelContext.Provider value={{
      nodes: nodesRef.current,
      registerNode,
      unregisterNode,
      travel,
      getConnections,
      unlockNode,
      isNodeUnlocked,
      isTraveling,
    }}>
      {children}
    </FastTravelContext.Provider>
  )
}
