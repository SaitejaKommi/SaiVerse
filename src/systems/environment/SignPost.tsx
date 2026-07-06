'use client'

interface SignPostProps {
  position: [number, number, number]
  rotation?: number
  color?: string
}

export function SignPost({ position, rotation = 0, color = '#744210' }: SignPostProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4, 6]} />
        <meshStandardMaterial color='#4a5568' roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Sign board */}
      <mesh position={[0, 2.8, 0.3]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Sign board back */}
      <mesh position={[0, 2.8, -0.3]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}
