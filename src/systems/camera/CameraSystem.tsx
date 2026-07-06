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
const TEMP_VEC = new Vector3()
const AXIS = new Vector3()

interface CameraSystemProps {
  target?: Vector3
  mode?: CameraMode
  onModeChange?: (mode: CameraMode) => void
}

export function CameraSystem({ target: externalTarget, mode: initialMode }: CameraSystemProps) {
  const { camera } = useThree()
  const settings = useSettingsStore((s) => s.controls)
  const shakeRef = useRef(new CameraShake())

  const velRef = useRef(new Vector3())
  const posRef = useRef(new Vector3(camera.position.x, camera.position.y, camera.position.z))

  const stateRef = useRef({
    angle: 0,
    elevation: Math.PI / 8,
    distance: CAMERA_CONFIG.DEFAULT_DISTANCE,
    targetDistance: CAMERA_CONFIG.DEFAULT_DISTANCE,
    targetAngle: 0,
    targetElevation: Math.PI / 8,
    mode: (initialMode ?? 'third-person') as CameraMode,
    fov: CAMERA_CONFIG.DEFAULT_FOV,
  })

  const internalTarget = useRef(new Vector3(
    PLAYER_CONFIG.INITIAL_POSITION[0],
    PLAYER_CONFIG.INITIAL_POSITION[1],
    PLAYER_CONFIG.INITIAL_POSITION[2],
  ))
  const raycaster = useRef(new Raycaster())
  const collisionEnabled = useRef(true)
  const sceneRef = useRef<Object3D[]>([])

  const updateCamera = useCallback((delta: number, targetPos: Vector3) => {
    const state = stateRef.current
    const cam = camera as PerspectiveCamera

    state.angle = dampAngle(state.angle, state.targetAngle, CAMERA_CONFIG.LOOK_SMOOTHING, delta)
    state.elevation = dampAngle(
      state.elevation,
      state.targetElevation,
      CAMERA_CONFIG.LOOK_SMOOTHING,
      delta,
    )
    state.distance = state.distance + (state.targetDistance - state.distance) *
      (1 - Math.exp(-CAMERA_CONFIG.COLLISION_SMOOTHING * delta))

    const idealDistance = state.distance

    let finalDistance = idealDistance
    if (collisionEnabled.current) {
      AXIS.set(1, 0, 0).applyAxisAngle(UP, state.angle)
      const cameraOffset = TEMP_VEC.set(0, 0, idealDistance)
        .applyAxisAngle(UP, state.angle)
        .applyAxisAngle(AXIS, -state.elevation)

      const cameraPos = TEMP_VEC.copy(targetPos).add(cameraOffset)
      const direction = TEMP_VEC.copy(cameraPos).sub(targetPos).normalize()

      raycaster.current.set(targetPos, direction)
      raycaster.current.far = idealDistance + 0.5
      raycaster.current.camera = camera

      try {
        const intersects = raycaster.current.intersectObjects(sceneRef.current, true)
        if (intersects.length > 0) {
          const hit = intersects[0]
          if (hit && hit.distance < idealDistance) {
            finalDistance = Math.max(hit.distance - CAMERA_CONFIG.COLLISION_RADIUS, CAMERA_CONFIG.MIN_DISTANCE)
          }
        }
      } catch {
        /* collsion check best-effort */
      }
    }

    const rightDir = new Vector3(1, 0, 0).applyAxisAngle(UP, state.angle).multiplyScalar(CAMERA_CONFIG.SHOULDER_OFFSET)
    AXIS.set(1, 0, 0).applyAxisAngle(UP, state.angle)
    const cameraOffset = TEMP_VEC.set(0, 0, finalDistance)
      .applyAxisAngle(UP, state.angle)
      .applyAxisAngle(AXIS, -state.elevation)
      .add(rightDir)

    const targetPosition = new Vector3().copy(targetPos).add(cameraOffset)

    const vel = velRef.current
    const currentPos = posRef.current
    const springK = CAMERA_CONFIG.SPRING_STIFFNESS
    const springD = CAMERA_CONFIG.SPRING_DAMPING

    const acc = new Vector3()
      .copy(targetPosition)
      .sub(currentPos)
      .multiplyScalar(springK)
      .sub(vel.clone().multiplyScalar(springD))

    vel.add(acc.multiplyScalar(delta))
    currentPos.add(vel.clone().multiplyScalar(delta))
    camera.position.copy(currentPos)

    const lookTarget = new Vector3(
      targetPos.x,
      targetPos.y + CAMERA_CONFIG.DEFAULT_HEIGHT_OFFSET,
      targetPos.z,
    )
    camera.lookAt(lookTarget)

    if (state.fov !== cam.fov) {
      cam.fov += (state.fov - cam.fov) * (1 - Math.exp(-CAMERA_CONFIG.LOOK_SMOOTHING * delta))
      cam.updateProjectionMatrix()
    }

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

    const isCinematic = useGameStore.getState().isCinematic

    const input = InputManager.getInstance()
    const mouseDelta = input.getMouseManager().consumeFrame()
    const scrollDelta = input.getMouseManager().consumeScroll()

    if (!isCinematic) {
      stateRef.current.targetAngle += mouseDelta.x * settings.sensitivity
      stateRef.current.targetElevation = Math.max(
        CAMERA_CONFIG.MIN_ELEVATION,
        Math.min(
          CAMERA_CONFIG.MAX_ELEVATION,
          stateRef.current.targetElevation - mouseDelta.y * settings.sensitivity,
        ),
      )

      if (scrollDelta !== 0) {
        stateRef.current.targetDistance = Math.max(
          CAMERA_CONFIG.MIN_DISTANCE,
          Math.min(
            CAMERA_CONFIG.MAX_DISTANCE,
            stateRef.current.targetDistance + scrollDelta * CAMERA_CONFIG.ZOOM_SPEED,
          ),
        )
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
        state.fov = CAMERA_CONFIG.DEFAULT_FOV
        break
      }
      case 'first-person': {
        state.targetDistance = 0
        state.fov = CAMERA_CONFIG.DEFAULT_FOV
        break
      }
      case 'cinematic': {
        state.targetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE * 1.5
        state.fov = CAMERA_CONFIG.CINEMATIC_FOV
        break
      }
      case 'photo': {
        state.fov = CAMERA_CONFIG.PHOTO_FOV
        break
      }
      case 'dialogue': {
        state.targetDistance = CAMERA_CONFIG.DEFAULT_DISTANCE * 0.8
        state.fov = CAMERA_CONFIG.DEFAULT_FOV
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
