'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Vector3 } from 'three'
import { PLAYER_CONFIG } from './player.config'
import { processPlayerInput } from './PlayerInput'
import { InputManager } from '@/systems/input/InputManager'
import { useGameStore } from '@/stores/gameStore'
import { clamp } from '@/lib/utils'

const MOVE_DIR = new Vector3()
const VELOCITY = new Vector3()

const GROUND_Y = 0
const HALF_HEIGHT = PLAYER_CONFIG.HEIGHT / 2
const GROUND_THRESHOLD = 0.2

interface PlayerControllerProps {
  onPositionChange?: (pos: Vector3) => void
}

export function PlayerController({ onPositionChange }: PlayerControllerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const currentSpeed = useRef(0)

  useEffect(() => {
    const body = rigidBodyRef.current
    if (!body) return
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const body = rigidBodyRef.current
    if (!body) return

    const camera = state.camera

    const cameraForward = new Vector3()
    camera.getWorldDirection(cameraForward)
    cameraForward.y = 0
    if (cameraForward.lengthSq() > 0) cameraForward.normalize()

    const cameraRight = new Vector3()
    cameraRight.crossVectors(cameraForward, new Vector3(0, 1, 0)).normalize()

    const input = InputManager.getInstance()
    const frame = input.getFrameInput()
    const playerInput = processPlayerInput(frame)

    MOVE_DIR.set(0, 0, 0)
    if (playerInput.moveZ !== 0) {
      MOVE_DIR.addScaledVector(cameraForward, playerInput.moveZ)
    }
    if (playerInput.moveX !== 0) {
      MOVE_DIR.addScaledVector(cameraRight, playerInput.moveX)
    }
    if (MOVE_DIR.lengthSq() > 0) MOVE_DIR.normalize()

    const pos = body.translation()
    const isGrounded = pos.y <= GROUND_Y + HALF_HEIGHT + GROUND_THRESHOLD

    const targetSpeed = playerInput.sprint && isGrounded
      ? PLAYER_CONFIG.RUN_SPEED
      : playerInput.moveX !== 0 || playerInput.moveZ !== 0
        ? PLAYER_CONFIG.WALK_SPEED
        : 0

    if (isGrounded) {
      const accel = playerInput.moveX !== 0 || playerInput.moveZ !== 0
        ? PLAYER_CONFIG.ACCELERATION
        : PLAYER_CONFIG.DECELERATION
      currentSpeed.current += (targetSpeed - currentSpeed.current) * clamp(accel * dt, 0, 1)
    } else {
      currentSpeed.current += (targetSpeed - currentSpeed.current) * clamp(PLAYER_CONFIG.AIR_CONTROL * dt, 0, 1)
    }

    VELOCITY.copy(MOVE_DIR).multiplyScalar(currentSpeed.current)

    const linvel = body.linvel()
    const moveVel = new Vector3(VELOCITY.x, isGrounded ? 0 : linvel.y, VELOCITY.z)

    if (playerInput.jump && isGrounded) {
      moveVel.y = PLAYER_CONFIG.JUMP_FORCE
    }

    body.setLinvel(moveVel, true)

    const rot = body.rotation()

    setPlayer({
      position: [pos.x, pos.y, pos.z],
      velocity: [moveVel.x, moveVel.y, moveVel.z],
      rotation: [rot.x, rot.y, rot.z, rot.w].slice(0, 3) as [number, number, number],
      state: !isGrounded ? 'jumping' : currentSpeed.current > PLAYER_CONFIG.WALK_SPEED * 0.5 ? 'running' : currentSpeed.current > 0.1 ? 'walking' : 'idle',
      isGrounded,
    })

    onPositionChange?.(
      new Vector3(pos.x, pos.y, pos.z),
    )

    input.endFrame()
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={PLAYER_CONFIG.INITIAL_POSITION}
      mass={PLAYER_CONFIG.MASS}
      type="dynamic"
      colliders="cuboid"
      enabledRotations={[false, false, false]}
      linearDamping={0}
      angularDamping={0}
      friction={0}
      restitution={0}
    >
      <mesh position={[0, -PLAYER_CONFIG.HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[PLAYER_CONFIG.RADIUS * 2, PLAYER_CONFIG.HEIGHT, PLAYER_CONFIG.RADIUS * 2]} />
        <meshStandardMaterial color="#6366f1" visible={false} />
      </mesh>
    </RigidBody>
  )
}
