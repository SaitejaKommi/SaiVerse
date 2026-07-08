'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Vector3 } from 'three'
import { PLAYER_CONFIG } from './player.config'
import { processPlayerInput } from './PlayerInput'
import { InputManager } from '@/systems/input/InputManager'
import { useGameStore } from '@/stores/gameStore'
import { useDialogueStore } from '@/stores/dialogueStore'
import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { soundFX } from '@/systems/audio/SoundFX'
import type { PlayerState } from '@/types/game'
import { clamp } from '@/lib/utils'

const MOVE_DIR = new Vector3()
const VELOCITY = new Vector3()
const CAM_FWD = new Vector3()
const CAM_RIGHT = new Vector3()
const UP = new Vector3(0, 1, 0)
const _moveVel = new Vector3()
const _posVec = new Vector3()
const HALF_HEIGHT = PLAYER_CONFIG.HEIGHT / 2
const GROUND_RAY_LENGTH = 0.6

interface PlayerControllerProps {
  onPositionChange?: (pos: Vector3) => void
}

export function PlayerController({ onPositionChange }: PlayerControllerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const currentSpeed = useRef(0)
  const footstepTimer = useRef(0)
  const { world, rapier } = useRapier()
  const { interact, nearestObject } = useInteractionSystem()
  const wasInteractingRef = useRef(false)
  const lastInteractTime = useRef(0)
  const rayOriginRef = useRef({ x: 0, y: 0, z: 0 })
  const rayDirRef = useRef({ x: 0, y: -1, z: 0 })

  const handleInteractKey = useCallback(() => {
    const input = InputManager.getInstance()
    const kbm = input.getKeyboardManager()
    return kbm.wasJustPressed('KeyE')
  }, [])

  useEffect(() => {
    const body = rigidBodyRef.current
    if (!body) return
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const body = rigidBodyRef.current
    if (!body) return

    const gameState = useGameStore.getState()

    if (gameState.isCinematic || gameState.isPaused) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      const pos = body.translation()
      setPlayer({ position: [pos.x, pos.y, pos.z], velocity: [0, 0, 0], rotation: [0, 0, 0], state: 'idle', isGrounded: true })
      if (onPositionChange) {
        _posVec.set(pos.x, pos.y, pos.z)
        onPositionChange(_posVec)
      }
      const input = InputManager.getInstance()
      input.getFrameInput()
      input.endFrame()
      return
    }

    const camera = state.camera
    camera.getWorldDirection(CAM_FWD)
    CAM_FWD.y = 0
    if (CAM_FWD.lengthSq() > 0) CAM_FWD.normalize()
    CAM_RIGHT.crossVectors(CAM_FWD, UP).normalize()

    const input = InputManager.getInstance()
    const frame = input.getFrameInput()
    const playerInput = processPlayerInput(frame)

    MOVE_DIR.set(0, 0, 0)
    if (playerInput.moveZ !== 0) MOVE_DIR.addScaledVector(CAM_FWD, playerInput.moveZ)
    if (playerInput.moveX !== 0) MOVE_DIR.addScaledVector(CAM_RIGHT, playerInput.moveX)
    if (MOVE_DIR.lengthSq() > 0) MOVE_DIR.normalize()

    const pos = body.translation()

    rayOriginRef.current.x = pos.x
    rayOriginRef.current.y = pos.y - HALF_HEIGHT + 0.05
    rayOriginRef.current.z = pos.z
    const ray = new rapier.Ray(rayOriginRef.current, rayDirRef.current)
    const hit = world.castRay(ray, GROUND_RAY_LENGTH, true)
    const isGrounded = hit !== null

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

    _moveVel.set(VELOCITY.x, isGrounded ? 0 : linvel.y, VELOCITY.z)

    if (playerInput.jump && isGrounded) {
      _moveVel.y = PLAYER_CONFIG.JUMP_FORCE
    }

    body.setLinvel(_moveVel, true)

    let playerState: PlayerState = 'idle'
    if (!isGrounded) playerState = 'jumping'
    else if (currentSpeed.current > PLAYER_CONFIG.WALK_SPEED * 0.5) playerState = 'running'
    else if (currentSpeed.current > 0.1) playerState = 'walking'

    setPlayer({
      position: [pos.x, pos.y, pos.z],
      velocity: [_moveVel.x, _moveVel.y, _moveVel.z],
      rotation: [0, 0, 0],
      state: playerState,
      isGrounded,
    })

    if (onPositionChange) {
      _posVec.set(pos.x, pos.y, pos.z)
      onPositionChange(_posVec)
    }

    if (isGrounded && (playerState === 'walking' || playerState === 'running')) {
      footstepTimer.current += dt
      const interval = playerState === 'running' ? 0.3 : 0.5
      if (footstepTimer.current >= interval) {
        footstepTimer.current = 0
        soundFX.playFootstep()
      }
    } else {
      footstepTimer.current = 0
    }

    const eJustPressed = handleInteractKey()
    const isDialogueOpen = useDialogueStore.getState().isOpen

    if (eJustPressed && nearestObject && !isDialogueOpen) {
      const now = performance.now()
      if (now - lastInteractTime.current > 500) {
        if (interact(nearestObject.id)) {
          lastInteractTime.current = now
        }
      }
    }
    wasInteractingRef.current = playerInput.interact

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
      <group position={[0, -HALF_HEIGHT, 0]}>
        <mesh position={[0, HALF_HEIGHT * 0.6, 0]} castShadow>
          <capsuleGeometry args={[PLAYER_CONFIG.RADIUS, HALF_HEIGHT * 0.7, 8, 16]} />
          <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, HALF_HEIGHT * 1.4, 0]} castShadow>
          <sphereGeometry args={[PLAYER_CONFIG.RADIUS * 0.7, 16, 16]} />
          <meshStandardMaterial color="#a5b4fc" metalness={0.2} roughness={0.3} />
        </mesh>
        <mesh position={[0, HALF_HEIGHT * 0.6 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[PLAYER_CONFIG.RADIUS * 0.5, PLAYER_CONFIG.RADIUS * 0.9, 32]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.15} side={2} />
        </mesh>
      </group>
    </RigidBody>
  )
}
