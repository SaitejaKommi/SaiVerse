'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, Stats } from '@react-three/drei'

export default function GameCanvas() {
  return (
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <Environment preset="night" />
      {process.env.NODE_ENV === 'development' && <Stats />}
    </Canvas>
  )
}
