'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { WORLD_CONFIG } from './world.config'
import type { ChunkID, WorldChunk } from './world.types'

interface WorldStreamerProps {
  children?: React.ReactNode
  loadRadius?: number
  unloadRadius?: number
}

function getChunkKey(x: number, z: number): ChunkID {
  return `${x}:${z}`
}

function posToChunk(pos: number): number {
  return Math.floor(pos / WORLD_CONFIG.CHUNK_SIZE)
}

export function WorldStreamer({
  children,
  loadRadius = WORLD_CONFIG.LOAD_RADIUS,
}: WorldStreamerProps) {
  const loadedChunksRef = useRef<Map<ChunkID, WorldChunk>>(new Map())
  const currentChunkRef = useRef<ChunkID>('0:0')
  const prevChunkRef = useRef<ChunkID>('0:0')
  const addActiveScene = useGameStore((s) => s.addActiveScene)
  const removeActiveScene = useGameStore((s) => s.removeActiveScene)

  const loadChunk = useCallback((cx: number, cz: number) => {
    const key = getChunkKey(cx, cz)
    if (loadedChunksRef.current.has(key)) return

    const chunk: WorldChunk = {
      id: key,
      bounds: { x: cx, z: cz, size: WORLD_CONFIG.CHUNK_SIZE },
      isLoaded: true,
      isVisible: true,
      priority: 0,
      lastActiveTime: performance.now(),
    }

    loadedChunksRef.current.set(key, chunk)
    addActiveScene(key)
  }, [addActiveScene])

  const unloadChunk = useCallback((key: ChunkID) => {
    const chunk = loadedChunksRef.current.get(key)
    if (!chunk) return

    chunk.isLoaded = false
    chunk.isVisible = false
    loadedChunksRef.current.delete(key)
    removeActiveScene(key)
  }, [removeActiveScene])

  useEffect(() => {
    const loadedChunks = loadedChunksRef.current

    for (let dx = -loadRadius; dx <= loadRadius; dx++) {
      for (let dz = -loadRadius; dz <= loadRadius; dz++) {
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist <= loadRadius) {
          loadChunk(dx, dz)
        }
      }
    }

    return () => {
      for (const [key] of loadedChunks) {
        unloadChunk(key)
      }
      loadedChunks.clear()
    }
  }, [loadRadius, loadChunk, unloadChunk])

  useFrame((state) => {
    const cam = state.camera
    const cx = posToChunk(cam.position.x)
    const cz = posToChunk(cam.position.z)
    currentChunkRef.current = getChunkKey(cx, cz)

    if (currentChunkRef.current !== prevChunkRef.current) {
      prevChunkRef.current = currentChunkRef.current

      const toLoad: [number, number][] = []
      const toUnload: ChunkID[] = []

      for (let dx = -loadRadius; dx <= loadRadius; dx++) {
        for (let dz = -loadRadius; dz <= loadRadius; dz++) {
          const dist = Math.sqrt(dx * dx + dz * dz)
          if (dist <= loadRadius) {
            toLoad.push([cx + dx, cz + dz])
          }
        }
      }

      for (const [key] of loadedChunksRef.current) {
        const parts = key.split(':').map(Number)
        const lx = parts[0] ?? 0
        const lz = parts[1] ?? 0
        const dist = Math.sqrt((lx - cx) ** 2 + (lz - cz) ** 2)
        if (dist > loadRadius + 1) {
          toUnload.push(key)
        }
      }

      for (const entry of toLoad) {
        loadChunk(entry[0], entry[1])
      }
      for (const key of toUnload) {
        unloadChunk(key)
      }
    }
  })

  return <>{children}</>
}
