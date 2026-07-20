'use client'

import { useEffect, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Physics as RapierPhysics, CuboidCollider } from '@react-three/rapier'
import { useGameStore } from '@/stores/gameStore'
import { InputManager } from '@/systems/input/InputManager'
import { SceneProvider } from '@/systems/scene/SceneManager'
import { CameraSystem } from '@/systems/camera/CameraSystem'
import { PlayerController } from '@/systems/player/PlayerController'
import { DistrictLighting } from '@/systems/lighting/DistrictLighting'
import { DebugOverlay } from '@/systems/debug/DebugOverlay'
import { audioManager } from '@/systems/audio/AudioManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { InteractionProvider } from '@/systems/interaction/InteractionSystem'
import { BengaluruHub } from '@/features/bengaluru-hub/BengaluruHub'
import { registerAllChapters } from '@/data/chapters/index'
import { ChapterManager } from '@/systems/chapter/ChapterManager'

interface GameEngineProps {
  children?: ReactNode
  enableDebug?: boolean
  enablePhysics?: boolean
  enableLighting?: boolean
  enableAudio?: boolean
  enablePlayer?: boolean
  enableCamera?: boolean
  enableWorld?: boolean
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
}: GameEngineProps) {
  const setInitialized = useGameStore((s) => s.setInitialized)

  useEffect(() => {
    const input = InputManager.getInstance()
    input.attach()

    if (enableAudio) {
      audioManager.init()
      audioManager.resumeOnInteraction()
      soundFX.resumeOnInteraction()
      soundFX.startAmbient()
    }

    registerAllChapters()
    ChapterManager.init()

    return () => {
      ChapterManager.destroy()
      InputManager.reset()
      if (enableAudio) {
        audioManager.dispose()
        soundFX.dispose()
      }
      setInitialized(false)
    }
  }, [setInitialized, enableAudio])

  return (
    <>
      <SceneProvider>
        {enableLighting && <DistrictLighting />}
        {enablePhysics && (
          <Suspense fallback={null}>
            <RapierPhysics gravity={[0, -9.81, 0]} colliders={false}>
              <InteractionProvider>
                <CuboidCollider position={[0, -0.5, 0]} args={[200, 0.5, 200]} />
                {enablePlayer && <PlayerController />}
                {enableWorld && <BengaluruHub />}
                {children}
              </InteractionProvider>
            </RapierPhysics>
          </Suspense>
        )}
        {enableCamera && <CameraSystem />}
      </SceneProvider>
      {enableDebug && <DebugOverlay />}
    </>
  )
}
