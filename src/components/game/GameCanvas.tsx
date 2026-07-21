'use client'

import { useCallback, useEffect, useRef, Component, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameEngine } from '@/systems/bootstrap/GameEngine'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { HUDWrapper } from '@/components/game/hud/HUD'
import { CinematicOverlay } from '@/components/game/hud/CinematicOverlay'
import { LoadingOverlay } from '@/components/game/hud/LoadingOverlay'
import { IntroOverlay } from '@/features/intro/IntroOverlay'
import { ChapterFinale } from '@/features/cinematics/ChapterFinale'
import { Chapter2Finale } from '@/features/cinematics/Chapter2Finale'
import { Chapter3Finale } from '@/features/cinematics/Chapter3Finale'
import { ControlsOverlay } from '@/features/ui/ControlsOverlay'
import { FinalSummitCredits } from '@/features/final-summit/FinalSummitCredits'
import { PostProcessing } from '@/systems/effects/PostProcessing'

class CanvasErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[Canvas] Error:', error.message)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

interface GameCanvasProps {
  showInventory?: boolean
  onToggleInventory?: () => void
}

export default function GameCanvas({ showInventory, onToggleInventory }: GameCanvasProps = {}) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleLoadComplete = useCallback(() => {}, [])

  const handleCreated = useCallback((state: { gl: { domElement: HTMLCanvasElement; setClearColor: (color: string) => void } }) => {
    state.gl.setClearColor('#020617')
    const canvas = state.gl.domElement
    const handleLost = (e: Event) => e.preventDefault()
    canvas.addEventListener('webglcontextlost', handleLost)
  }, [])

  const handleError = useCallback(() => {}, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return

    const handleClick = () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock()
      }
    }
    el.addEventListener('click', handleClick)
    return () => el.removeEventListener('click', handleClick)
  }, [])

  return (
    <CanvasErrorBoundary onError={handleError}>
      <LoadingScreen minimumDuration={1500} onComplete={handleLoadComplete} />
      <IntroOverlay />
      <div ref={canvasRef} className="fixed inset-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{
            fov: 60,
            near: 0.1,
            far: 1000,
            position: [0, 2, 5],
          }}
          onCreated={handleCreated}
        >
          <PostProcessing />
          <GameEngine
            enableDebug={process.env.NODE_ENV === 'development'}
            enablePhysics={true}
            enableLighting={true}
            enableAudio={true}
            enablePlayer={true}
            enableCamera={true}
          />
        </Canvas>
      </div>
      <HUDWrapper showInventory={showInventory} onToggleInventory={onToggleInventory} />
      <CinematicOverlay />
      <LoadingOverlay />
      <ChapterFinale />
      <Chapter2Finale />
      <Chapter3Finale />
      <ControlsOverlay />
      <FinalSummitCredits />
    </CanvasErrorBoundary>
  )
}
