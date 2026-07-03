'use client'

import { useCallback, Component, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameEngine } from '@/systems/bootstrap/GameEngine'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { HUDWrapper } from '@/components/game/hud/HUD'

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

export default function GameCanvas() {
  const handleLoadComplete = useCallback(() => {}, [])

  const handleCreated = useCallback((state: { gl: { domElement: HTMLCanvasElement; setClearColor: (color: string) => void } }) => {
    state.gl.setClearColor('#020617')
    const canvas = state.gl.domElement
    const handleLost = (e: Event) => e.preventDefault()
    canvas.addEventListener('webglcontextlost', handleLost)
  }, [])

  const handleError = useCallback(() => {}, [])

  return (
    <CanvasErrorBoundary onError={handleError}>
      <LoadingScreen minimumDuration={1500} onComplete={handleLoadComplete} />
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: 3,
          toneMappingExposure: 1.0,
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
        <GameEngine
          enableDebug={process.env.NODE_ENV === 'development'}
          enablePhysics={true}
          enableLighting={true}
          enableAudio={true}
          enablePlayer={true}
          enableCamera={true}
          environmentPreset="night"
        />
      </Canvas>
      <HUDWrapper />
    </CanvasErrorBoundary>
  )
}
