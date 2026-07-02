'use client'

import { useEffect, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { Physics } from '@react-three/rapier'
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
      audioManager.resume()
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
          <Physics gravity={[0, -9.81, 0]} debug={false}>
            {enablePlayer && <PlayerController onPositionChange={handlePlayerPosition} />}
          </Physics>
        )}
        {enableCamera && <CameraSystem target={playerTarget} />}
        {enableWorld && <BengaluruHub />}
        {children}
      </SceneProvider>
      {enableDebug && <DebugOverlay />}
    </>
  )
}
