'use client'

interface StatueProps {
  position: [number, number, number]
  scale?: number
}

export function Statue({ position, scale = 1 }: StatueProps) {
  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, 0.5 * scale, 0]} castShadow>
        <boxGeometry args={[1.5 * scale, 0.5 * scale, 1.5 * scale]} />
        <meshStandardMaterial color='#718096' roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Pedestal tier 2 */}
      <mesh position={[0, 0.9 * scale, 0]} castShadow>
        <boxGeometry args={[1.2 * scale, 0.3 * scale, 1.2 * scale]} />
        <meshStandardMaterial color='#a0aec0' roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 1.8 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.3 * scale, 0.5 * scale, 1.2 * scale, 8]} />
        <meshStandardMaterial color='#a0aec0' roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.5 * scale, 0]} castShadow>
        <sphereGeometry args={[0.3 * scale, 8, 8]} />
        <meshStandardMaterial color='#a0aec0' roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Arm left */}
      <mesh position={[-0.5 * scale, 1.8 * scale, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.08 * scale, 0.1 * scale, 0.8 * scale, 6]} />
        <meshStandardMaterial color='#a0aec0' roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Arm right (raised) */}
      <mesh position={[0.5 * scale, 2 * scale, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.08 * scale, 0.1 * scale, 0.8 * scale, 6]} />
        <meshStandardMaterial color='#a0aec0' roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}
