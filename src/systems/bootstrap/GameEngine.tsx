'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { Physics as RapierPhysics } from '@react-three/rapier'
import type { Vector3 } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { InputManager } from '@/systems/input/InputManager'
import { SceneProvider } from '@/systems/scene/SceneManager'
import { CameraSystem } from '@/systems/camera/CameraSystem'
import { PlayerController } from '@/systems/player/PlayerController'
import { LightingManager } from '@/systems/lighting/LightingManager'
import { DebugOverlay } from '@/systems/debug/DebugOverlay'
import { audioManager } from '@/systems/audio/AudioManager'
import { BengaluruHub } from '@/features/bengaluru-hub/BengaluruHub'

function PhysicsWrapper({ children, ...props }: { children: ReactNode; gravity: [number, number, number]; debug: boolean }) {
  const [ready, setReady] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    let cancelled = false
    ;(async () => {
      try {
        // @ts-expect-error - no @dimforge/rapier3d-compat types
        const RAPIER = await import('@dimforge/rapier3d-compat')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await (RAPIER as { default: () => Promise<void> }).default()
      } catch (e) {
        console.error('[Rapier]', e)
      }
      if (!cancelled) setReady(true)
    })()
    return () => { cancelled = true }
  }, [])

  if (!ready) return null
  return <RapierPhysics {...props}>{children}</RapierPhysics>
}

interface GameEngineProps {
  children?: ReactNode
  enableDebug?: boolean
  enablePhysics?: boolean
  enableLighting?: boolean
  enableAudio?: boolean
  enablePlayer?: boolean
  enableCamera?: boolean
  enableWorld?: boolean
  environmentPreset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby'
}

export function GameEngine({
  children,
  enableDebug = process.env.NODE_ENV === 'development',
  enablePhysics = true,
  enableLighting = true,
  enableAudio = true,
  enablePlayer = true,
  enableCamera = true,
  enableWorld = true,
  environmentPreset = 'night',
}: GameEngineProps) {
  const setInitialized = useGameStore((s) => s.setInitialized)
  const [playerTarget, setPlayerTarget] = useState<Vector3 | undefined>(undefined)

  useEffect(() => {
    const input = InputManager.getInstance()
    input.attach()

    if (enableAudio) {
      audioManager.init()
      audioManager.resumeOnInteraction()
    }

    setInitialized(true)

    return () => {
      InputManager.reset()
      if (enableAudio) {
        audioManager.dispose()
      }
      setInitialized(false)
    }
  }, [setInitialized, enableAudio])

  const handlePlayerPosition = useCallback((pos: Vector3) => {
    setPlayerTarget(pos)
  }, [])

  return (
    <>
      <SceneProvider>
        {enableLighting && <LightingManager preset={environmentPreset} />}
        {enablePhysics && (
          <PhysicsWrapper gravity={[0, -9.81, 0]} debug={false}>
            {enablePlayer && <PlayerController onPositionChange={handlePlayerPosition} />}
          </PhysicsWrapper>
        )}
        {enableCamera && <CameraSystem target={playerTarget} />}
        {enableWorld && <BengaluruHub />}
        {children}
      </SceneProvider>
      {enableDebug && <DebugOverlay />}
    </>
  )
}
