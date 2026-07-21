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
import { useDialogueStore } from '@/stores/dialogueStore'
import { InputManager } from '@/systems/input/InputManager'
import { PLAYER_CONFIG } from '@/systems/player/player.config'

const UP = new Vector3(0, 1, 0)
const AXIS = new Vector3()
const _cameraOffset = new Vector3()
const _lookTarget = new Vector3()
const _collisionOffset = new Vector3()
const _rightDir = new Vector3()
const _direction = new Vector3()
const _playerPos = new Vector3()
const _collisionOrigin = new Vector3()

interface CameraSystemProps {
  target?: Vector3
  mode?: CameraMode
}

export function CameraSystem({ target: externalTarget, mode: initialMode }: CameraSystemProps) {
  const { camera } = useThree()
  const settings = useSettingsStore((s) => s.controls)
  const shakeRef = useRef(new CameraShake())

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
  const modeTransition = useRef({ from: 0, to: 0, progress: 0, active: false })

  const eased = useCallback((t: number) => 1 - Math.pow(1 - t, 3), [])

  const updateCamera = useCallback((delta: number, targetPos: Vector3) => {
    const state = stateRef.current

    if (modeTransition.current.active) {
      modeTransition.current.progress += delta / 0.4
      const p = Math.min(modeTransition.current.progress, 1)
      state.targetDistance = modeTransition.current.from + (modeTransition.current.to - modeTransition.current.from) * eased(p)
      if (p >= 1) {
        modeTransition.current.active = false
        state.targetDistance = modeTransition.current.to
      }
    }

    state.angle = dampAngle(state.angle, state.targetAngle, CAMERA_CONFIG.LOOK_SMOOTHING, delta)
    state.elevation = dampAngle(state.elevation, state.targetElevation, CAMERA_CONFIG.LOOK_SMOOTHING, delta)
    state.elevation = Math.max(CAMERA_CONFIG.MIN_ELEVATION, Math.min(CAMERA_CONFIG.MAX_ELEVATION, state.elevation))

    const smoothDt = 1 - Math.exp(-CAMERA_CONFIG.COLLISION_SMOOTHING * delta)
    state.distance += (state.targetDistance + sprintDistance.current - state.distance) * smoothDt

    let finalDistance = state.distance

    if (collisionEnabled.current) {
      AXIS.set(1, 0, 0).applyAxisAngle(UP, state.angle)
      _collisionOffset.set(0, 0, finalDistance)
        .applyAxisAngle(UP, state.angle)
        .applyAxisAngle(AXIS, -state.elevation)
      _direction.copy(_collisionOffset).normalize()

      frameCount.current = (frameCount.current + 1) % 3
      if (frameCount.current === 0) {
        let rayOrigin = targetPos
        let collisionFar = finalDistance + 0.5
        if (state.mode === 'dialogue') {
          const dialogueState = useDialogueStore.getState()
          if (dialogueState.speakerPosition) {
            const sp = dialogueState.speakerPosition
            rayOrigin = _collisionOrigin.set(sp[0], sp[1], sp[2])
          }
        }
        raycaster.current.set(rayOrigin, _direction)
        raycaster.current.far = collisionFar
        raycaster.current.camera = camera

        try {
          const intersects = raycaster.current.intersectObjects(sceneRef.current, true)
          if (intersects.length > 0) {
            const hit = intersects[0]
            if (hit && hit.distance < finalDistance) {
              const newDist = Math.max(hit.distance - CAMERA_CONFIG.COLLISION_RADIUS, CAMERA_CONFIG.MIN_DISTANCE)
              const collideDt = 1 - Math.exp(-CAMERA_CONFIG.COLLISION_SMOOTHING * delta * 7)
              collisionDistance.current += (newDist - collisionDistance.current) * collideDt
            } else {
              const recoverDt = 1 - Math.exp(-CAMERA_CONFIG.COLLISION_SMOOTHING * delta * 3)
              collisionDistance.current += (finalDistance - collisionDistance.current) * recoverDt
            }
          } else {
            const recoverDt = 1 - Math.exp(-CAMERA_CONFIG.COLLISION_SMOOTHING * delta * 3)
            collisionDistance.current += (finalDistance - collisionDistance.current) * recoverDt
          }
        } catch { /* collision check best-effort */ }
      }
      finalDistance = Math.min(finalDistance, collisionDistance.current)
    }

    _rightDir.set(1, 0, 0).applyAxisAngle(UP, state.angle).multiplyScalar(CAMERA_CONFIG.SHOULDER_OFFSET)
    AXIS.set(1, 0, 0).applyAxisAngle(UP, state.angle)
    _cameraOffset.set(0, 0, finalDistance)
      .applyAxisAngle(UP, state.angle)
      .applyAxisAngle(AXIS, -state.elevation)
      .add(_rightDir)

    camera.position.copy(targetPos).add(_cameraOffset)
    camera.position.y = Math.max(camera.position.y, targetPos.y + CAMERA_CONFIG.CAMERA_MIN_Y_OFFSET)

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
    const { isCinematic, isPaused, player } = useGameStore.getState()
    const targetPos = externalTarget ?? _playerPos.set(player.position[0], player.position[1], player.position[2])

    if (sceneRef.current.length === 0 && state.scene) {
      const result: Object3D[] = []
      state.scene.traverse((child) => {
        if (child instanceof Mesh && (child as Mesh).geometry) {
          result.push(child)
        }
      })
      sceneRef.current = result
    }
    const cam = camera as PerspectiveCamera

    const isSprinting = player.state === 'running'
    sprintDistance.current = isSprinting
      ? CAMERA_CONFIG.SPRINT_DISTANCE_BOOST
      : 0

    const input = InputManager.getInstance()
    const mouseDelta = input.getMouseManager().consumeFrame()
    const scrollDelta = input.getMouseManager().consumeScroll()

    if (!isCinematic && !isPaused) {
      const hasInput = Math.abs(mouseDelta.x) > 1e-6 || Math.abs(mouseDelta.y) > 1e-6
      if (hasInput) {
        stateRef.current.lastMouseTime = performance.now()
      }

      stateRef.current.targetAngle += mouseDelta.x * settings.sensitivity

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

    let newTargetDistance: number
    switch (mode) {
      case 'third-person': {
        newTargetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE
        break
      }
      case 'first-person': {
        newTargetDistance = 0
        break
      }
      case 'cinematic': {
        newTargetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE * 1.5
        break
      }
      case 'dialogue': {
        newTargetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE * 0.8
        break
      }
      default: {
        newTargetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE
      }
    }

    modeTransition.current = {
      from: state.targetDistance,
      to: newTargetDistance,
      progress: 0,
      active: true,
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
