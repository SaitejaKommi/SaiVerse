'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh } from 'three'
import type { PerspectiveCamera, Object3D } from 'three'
import { CAMERA_CONFIG } from './camera.config'
import type { CameraMode } from './camera.types'
import { CameraShake } from './CameraShake'
import { dampAngle } from '@/lib/math/vectors'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGameStore } from '@/stores/gameStore'
import { InputManager } from '@/systems/input/InputManager'
import { PLAYER_CONFIG } from '@/systems/player/player.config'

const UP = new Vector3(0, 1, 0)
const AXIS = new Vector3()
const _cameraOffset = new Vector3()
const _targetPosition = new Vector3()
const _acc = new Vector3()
const _lookTarget = new Vector3()
const _velClone = new Vector3()
const _posClone = new Vector3()
const _rightDir = new Vector3()
const _direction = new Vector3()

interface CameraSystemProps {
  target?: Vector3
  mode?: CameraMode
}

export function CameraSystem({ target: externalTarget, mode: initialMode }: CameraSystemProps) {
  const { camera } = useThree()
  const settings = useSettingsStore((s) => s.controls)
  const shakeRef = useRef(new CameraShake())

  const velRef = useRef(new Vector3())
  const posRef = useRef(new Vector3(camera.position.x, camera.position.y, camera.position.z))

  const stateRef = useRef({
    angle: 0,
    elevation: Math.PI / 10,
    distance: CAMERA_CONFIG.DEFAULT_DISTANCE,
    targetDistance: CAMERA_CONFIG.DEFAULT_DISTANCE,
    targetAngle: 0,
    targetElevation: Math.PI / 10,
    mode: (initialMode ?? 'third-person') as CameraMode,
    lastMouseTime: 0,
  })

  const internalTarget = useRef(new Vector3(
    PLAYER_CONFIG.INITIAL_POSITION[0],
    PLAYER_CONFIG.INITIAL_POSITION[1],
    PLAYER_CONFIG.INITIAL_POSITION[2],
  ))
  const raycaster = useRef(new Raycaster())
  const collisionEnabled = useRef(true)
  const sceneRef = useRef<Object3D[]>([])
  const sprintDistance = useRef(0)
  const frameCount = useRef(0)
  const collisionDistance = useRef(CAMERA_CONFIG.DEFAULT_DISTANCE)

  const updateCamera = useCallback((delta: number, targetPos: Vector3) => {
    const state = stateRef.current

    state.angle = dampAngle(state.angle, state.targetAngle, CAMERA_CONFIG.LOOK_SMOOTHING, delta)
    state.elevation = dampAngle(state.elevation, state.targetElevation, CAMERA_CONFIG.LOOK_SMOOTHING, delta)

    const springDt = 1 - Math.exp(-CAMERA_CONFIG.COLLISION_SMOOTHING * delta)
    state.distance += (state.targetDistance + sprintDistance.current - state.distance) * springDt

    let finalDistance = Math.min(state.distance, collisionDistance.current)
    if (collisionEnabled.current) {
      AXIS.set(1, 0, 0).applyAxisAngle(UP, state.angle)
      _cameraOffset.set(0, 0, finalDistance)
        .applyAxisAngle(UP, state.angle)
        .applyAxisAngle(AXIS, -state.elevation)

      _direction.copy(_cameraOffset).normalize()

      frameCount.current = (frameCount.current + 1) % 3
      if (frameCount.current === 0) {
        raycaster.current.set(targetPos, _direction)
        raycaster.current.far = finalDistance + 0.5
        raycaster.current.camera = camera

        try {
          const intersects = raycaster.current.intersectObjects(sceneRef.current, true)
          if (intersects.length > 0) {
            const hit = intersects[0]
            if (hit && hit.distance < finalDistance) {
              const newDist = Math.max(hit.distance - CAMERA_CONFIG.COLLISION_RADIUS, CAMERA_CONFIG.MIN_DISTANCE)
              collisionDistance.current = newDist
              finalDistance = newDist
            } else {
              collisionDistance.current = finalDistance
            }
          } else {
            collisionDistance.current = finalDistance
          }
        } catch { /* collsion check best-effort */ }
      }
    }

    _rightDir.set(1, 0, 0).applyAxisAngle(UP, state.angle).multiplyScalar(CAMERA_CONFIG.SHOULDER_OFFSET)
    AXIS.set(1, 0, 0).applyAxisAngle(UP, state.angle)
    _cameraOffset.set(0, 0, finalDistance)
      .applyAxisAngle(UP, state.angle)
      .applyAxisAngle(AXIS, -state.elevation)
      .add(_rightDir)

    _targetPosition.copy(targetPos).add(_cameraOffset)

    _targetPosition.y = Math.max(_targetPosition.y, targetPos.y + CAMERA_CONFIG.CAMERA_MIN_Y_OFFSET)

    const vel = velRef.current
    const currentPos = posRef.current

    _acc.copy(_targetPosition).sub(currentPos).multiplyScalar(CAMERA_CONFIG.SPRING_STIFFNESS)
    _velClone.copy(vel).multiplyScalar(CAMERA_CONFIG.SPRING_DAMPING)
    _acc.sub(_velClone)
    _acc.multiplyScalar(delta)
    vel.add(_acc)

    _posClone.copy(vel).multiplyScalar(delta)
    currentPos.add(_posClone)

    currentPos.y = Math.max(currentPos.y, targetPos.y + CAMERA_CONFIG.CAMERA_MIN_Y_OFFSET)

    camera.position.copy(currentPos)

    _lookTarget.set(targetPos.x, targetPos.y + CAMERA_CONFIG.DEFAULT_HEIGHT_OFFSET, targetPos.z)
    camera.lookAt(_lookTarget)

    const shakeOffset = shakeRef.current.update(delta)
    if (shakeOffset.lengthSq() > 0) {
      camera.position.add(shakeOffset)
    }
  }, [camera])

  useEffect(() => {
    const cam = camera as PerspectiveCamera
    cam.fov = CAMERA_CONFIG.DEFAULT_FOV
    cam.updateProjectionMatrix()
  }, [camera])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const targetPos = externalTarget ?? internalTarget.current

    if (sceneRef.current.length === 0 && state.scene) {
      const result: Object3D[] = []
      state.scene.traverse((child) => {
        if (child instanceof Mesh && (child as Mesh).geometry) {
          result.push(child)
        }
      })
      sceneRef.current = result
    }

    const { isCinematic, isPaused, player } = useGameStore.getState()
    const cam = camera as PerspectiveCamera

    const isSprinting = player.state === 'running'
    sprintDistance.current = isSprinting
      ? CAMERA_CONFIG.SPRINT_DISTANCE_BOOST
      : 0

    const input = InputManager.getInstance()
    const mouseDelta = input.getMouseManager().consumeFrame()
    const scrollDelta = input.getMouseManager().consumeScroll()

    if (!isCinematic && !isPaused) {
      const hasMouseInput = Math.abs(mouseDelta.x) > 0.001 || Math.abs(mouseDelta.y) > 0.001
      if (hasMouseInput) {
        stateRef.current.lastMouseTime = performance.now()
        stateRef.current.targetAngle += mouseDelta.x * settings.sensitivity
      }

      stateRef.current.targetElevation = Math.max(
        CAMERA_CONFIG.MIN_ELEVATION,
        Math.min(
          CAMERA_CONFIG.MAX_ELEVATION,
          stateRef.current.targetElevation - mouseDelta.y * settings.sensitivity,
        ),
      )

      const targetFov = CAMERA_CONFIG.DEFAULT_FOV
        + (isSprinting ? CAMERA_CONFIG.SPRINT_FOV_BOOST : 0)
      if (cam.fov !== targetFov) {
        cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-CAMERA_CONFIG.COLLISION_SMOOTHING * dt))
        cam.updateProjectionMatrix()
      }

      if (scrollDelta !== 0) {
        stateRef.current.targetDistance = Math.max(
          CAMERA_CONFIG.MIN_DISTANCE,
          Math.min(
            CAMERA_CONFIG.MAX_DISTANCE,
            stateRef.current.targetDistance + scrollDelta * CAMERA_CONFIG.ZOOM_SPEED,
          ),
        )
      }

      const isForwardPressed = input.isActionPressed('forward')
      const timeSinceMouse = (performance.now() - stateRef.current.lastMouseTime) / 1000

      if (isForwardPressed && timeSinceMouse > CAMERA_CONFIG.AUTO_REALIGN_DELAY) {
        const shortest = -stateRef.current.targetAngle
        const wrapped = ((shortest % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI
        stateRef.current.targetAngle += wrapped * CAMERA_CONFIG.AUTO_REALIGN_SPEED * dt
      }
    }

    updateCamera(dt, targetPos)
  })

  const setTarget = useCallback((pos: Vector3) => {
    internalTarget.current.copy(pos)
  }, [])

  const setMode = useCallback((mode: CameraMode) => {
    const state = stateRef.current
    state.mode = mode

    switch (mode) {
      case 'third-person': {
        state.targetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE
        break
      }
      case 'first-person': {
        state.targetDistance = 0
        break
      }
      case 'cinematic': {
        state.targetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE * 1.5
        break
      }
      case 'dialogue': {
        state.targetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE * 0.8
        break
      }
    }
  }, [])

  const triggerShake = useCallback((config?: Partial<{
    intensity: number
    frequency: number
    duration: number
    decay: number
  }>) => {
    shakeRef.current.trigger(config)
  }, [])

  const setCollisionEnabled = useCallback((enabled: boolean) => {
    collisionEnabled.current = enabled
  }, [])

  const setTargetPosition = useCallback((x: number, y: number, z: number) => {
    internalTarget.current.set(x, y, z)
  }, [])

  return null
}
