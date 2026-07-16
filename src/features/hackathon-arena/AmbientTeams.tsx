'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STATION_POSITIONS } from '@/data/hackathon-arena/ha-layout'

type AnimState = 'typing' | 'discussing' | 'celebrating' | 'frustrated' | 'pointing' | 'pacing' | 'highfive'

interface TeamMember {
  pos: [number, number, number]
  anim: AnimState
  phase: number
  speed: number
  color: string
}

const TEAM_COLORS = ['#e94560', '#00d4ff', '#a855f7', '#00ff88', '#f59e0b', '#ff6b6b']

function createTeam(basePos: [number, number, number], count: number, seed: number): TeamMember[] {
  const members: TeamMember[] = []
  const anims: AnimState[] = ['typing', 'discussing', 'frustrated', 'pointing', 'pacing', 'highfive']
  for (let i = 0; i < count; i++) {
    members.push({
      pos: [basePos[0] + (i - count / 2) * 0.8 + (seed % 5) * 0.1, basePos[1], basePos[2] + (i % 2) * 0.4],
      anim: anims[(seed + i * 3) % anims.length]!,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      color: TEAM_COLORS[(seed + i) % TEAM_COLORS.length]!,
    })
  }
  return members
}

function TeamGroup({ members, baseRot }: { members: TeamMember[]; baseRot: number }) {
  return (
    <group rotation={[0, baseRot, 0]}>
      {members.map((m, i) => (
        <TeamMemberMesh key={i} member={m} />
      ))}
    </group>
  )
}

function TeamMemberMesh({ member }: { member: TeamMember }) {
  const bodyRef = useRef<THREE.Group>(null)
  const armRef = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!bodyRef.current || !armRef.current || !headRef.current) return
    const t = state.clock.elapsedTime * member.speed + member.phase

    switch (member.anim) {
      case 'typing':
        bodyRef.current.position.y = Math.sin(t * 4) * 0.02
        armRef.current.rotation.x = Math.PI * 0.4 + Math.sin(t * 8) * 0.1
        headRef.current.rotation.y = Math.sin(t * 2) * 0.1
        break
      case 'discussing':
        headRef.current.rotation.y = Math.sin(t * 2.5) * 0.3
        armRef.current.rotation.x = Math.PI * 0.3 + Math.sin(t * 3) * 0.15
        break
      case 'celebrating':
        armRef.current.rotation.x = Math.PI * 0.8 + Math.sin(t * 6) * 0.2
        bodyRef.current.position.y = Math.abs(Math.sin(t * 3)) * 0.08
        headRef.current.rotation.z = Math.sin(t * 4) * 0.05
        break
      case 'frustrated':
        headRef.current.rotation.x = Math.sin(t * 5) * 0.2
        armRef.current.rotation.x = Math.PI * 0.6 + Math.sin(t) * 0.1
        bodyRef.current.position.y = Math.sin(t * 3) * 0.03
        break
      case 'pointing':
        armRef.current.rotation.x = Math.PI * 0.1
        armRef.current.rotation.z = Math.sin(t * 2) * 0.1
        headRef.current.rotation.y = 0.4 + Math.sin(t * 1.5) * 0.1
        break
      case 'pacing':
        bodyRef.current.position.x = Math.sin(t * 1.5) * 0.15
        headRef.current.rotation.y = Math.cos(t * 1.5) * 0.2
        break
      case 'highfive':
        armRef.current.rotation.x = Math.PI * 0.7 + Math.sin(t * 8) * Math.abs(Math.sin(t * 2)) * 0.3
        bodyRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.05
        break
    }
  })

  return (
    <group ref={bodyRef} position={member.pos}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.12, 0.25, 6, 8]} />
        <meshStandardMaterial color={member.color} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#f5d0b8" />
      </mesh>
      {/* Arm */}
      <mesh ref={armRef} position={[0.15, 0.6, 0]}>
        <boxGeometry args={[0.06, 0.15, 0.06]} />
        <meshStandardMaterial color={member.color} />
      </mesh>
      {/* Screen glow */}
      {(member.anim === 'typing' || member.anim === 'frustrated') && (
        <mesh position={[0, 0.3, -0.15]}>
          <planeGeometry args={[0.2, 0.15]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.15 + Math.sin(Date.now() * 0.005) * 0.05} depthTest={false} />
        </mesh>
      )}
    </group>
  )
}

export function AmbientTeams() {
  const teams = STATION_POSITIONS.teamPositions

  const teamData = teams.map((t, i) => ({
    members: createTeam(t.position, 3 + (i % 2), i * 7),
    rotation: t.rotation,
  }))

  return (
    <group>
      {teamData.map((team, i) => (
        <TeamGroup key={i} members={team.members} baseRot={team.rotation} />
      ))}
    </group>
  )
}
