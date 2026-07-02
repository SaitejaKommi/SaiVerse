'use client'

import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameEngine } from '@/systems/bootstrap/GameEngine'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

export default function GameCanvas() {
  const [loading, setLoading] = useState(true)

  const handleLoadComplete = useCallback(() => {
    setLoading(false)
  }, [])

  return (
    <>
      {loading && <LoadingScreen onComplete={handleLoadComplete} />}

      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: 3,
          toneMappingExposure: 1.0,
        }}
        camera={{
          fov: 60,
          near: 0.1,
          far: 1000,
          position: [0, 2, 5],
        }}
        onCreated={(state) => {
          state.gl.setClearColor('#020617')
        }}
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

        {loading && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        )}
      </Canvas>
    </>
  )
}
