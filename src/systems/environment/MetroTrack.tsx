'use client'

interface MetroTrackProps {
  position: [number, number, number]
  length?: number
  rotation?: number
}

export function MetroTrack({ position, length = 40, rotation = 0 }: MetroTrackProps) {
  const pillarCount = Math.floor(length / 10) + 1

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Track beam */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[4, 0.5, length]} />
        <meshStandardMaterial color='#2d3748' roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Pillars */}
      {Array.from({ length: pillarCount }, (_, i) => {
        const z = -length / 2 + (length / (pillarCount - 1)) * i
        return (
          <mesh key={`pillar-${i}`} position={[0, 2, z]} castShadow>
            <boxGeometry args={[1, 4, 1]} />
            <meshStandardMaterial color='#4a5568' roughness={0.7} metalness={0.3} />
          </mesh>
        )
      })}
      {/* Rail lines */}
      <mesh position={[-1.2, 4.8, 0]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshStandardMaterial color='#a0aec0' metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.2, 4.8, 0]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshStandardMaterial color='#a0aec0' metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
