'use client'

interface FountainProps {
  position: [number, number, number]
  scale?: number
}

export function Fountain({ position, scale = 1 }: FountainProps) {
  return (
    <group position={position}>
      {/* Outer basin */}
      <mesh position={[0, 0.3 * scale, 0]} castShadow>
        <cylinderGeometry args={[2.5 * scale, 3 * scale, 0.6 * scale, 24]} />
        <meshStandardMaterial color='#718096' roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Inner basin */}
      <mesh position={[0, 0.3 * scale, 0]}>
        <cylinderGeometry args={[2 * scale, 2.3 * scale, 0.4 * scale, 24]} />
        <meshStandardMaterial color='#4299e1' transparent opacity={0.6} roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Center pillar */}
      <mesh position={[0, 1.2 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.3 * scale, 0.4 * scale, 1.5 * scale, 12]} />
        <meshStandardMaterial color='#a0aec0' roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Top bowl */}
      <mesh position={[0, 2 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.8 * scale, 1 * scale, 0.4 * scale, 16]} />
        <meshStandardMaterial color='#718096' roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Water in top bowl */}
      <mesh position={[0, 2 * scale, 0]}>
        <cylinderGeometry args={[0.6 * scale, 0.7 * scale, 0.2 * scale, 16]} />
        <meshStandardMaterial color='#4299e1' transparent opacity={0.6} roughness={0.1} metalness={0.8} />
      </mesh>
    </group>
  )
}
