'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3, Raycaster } from 'three'
import type { PerspectiveCamera } from 'three'
import { CAMERA_CONFIG } from './camera.config'
import type { CameraMode } from './camera.types'
import { CameraShake } from './CameraShake'
import { dampAngle, dampVector3 } from '@/lib/math/vectors'
import { useSettingsStore } from '@/stores/settingsStore'

const UP = new Vector3(0, 1, 0)
const TEMP_VEC = new Vector3()

interface CameraSystemProps {
  target?: Vector3
  mode?: CameraMode
  onModeChange?: (mode: CameraMode) => void
}

export function CameraSystem({ target: externalTarget, mode: initialMode }: CameraSystemProps) {
  const { camera } = useThree()
  const settings = useSettingsStore((s) => s.controls)
  const shakeRef = useRef(new CameraShake())

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

  const internalTarget = useRef(new Vector3(0, 0, 0))
  const raycaster = useRef(new Raycaster())
  const collisionEnabled = useRef(true)

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
      const cameraOffset = TEMP_VEC.set(0, 0, idealDistance)
        .applyAxisAngle(UP, state.angle)
        .applyAxisAngle(new Vector3(1, 0, 0).applyAxisAngle(UP, state.angle), -state.elevation)

      const cameraPos = TEMP_VEC.copy(targetPos).add(cameraOffset)
      const direction = TEMP_VEC.copy(cameraPos).sub(targetPos).normalize()

      raycaster.current.set(targetPos, direction)
      raycaster.current.far = idealDistance + 0.5

      const intersects = raycaster.current.intersectObjects(
        camera.parent?.children ?? [],
        true,
      )

      if (intersects.length > 0) {
        const hit = intersects[0]
        if (hit && hit.distance < idealDistance) {
          finalDistance = Math.max(hit.distance - CAMERA_CONFIG.COLLISION_RADIUS, CAMERA_CONFIG.MIN_DISTANCE)
        }
      }
    }

    const cameraOffset = TEMP_VEC.set(0, 0, finalDistance)
      .applyAxisAngle(UP, state.angle)
      .applyAxisAngle(new Vector3(1, 0, 0).applyAxisAngle(UP, state.angle), -state.elevation)

    const targetPosition = new Vector3().copy(targetPos).add(cameraOffset)

    const smoothed = dampVector3(camera.position, targetPosition, CAMERA_CONFIG.POSITION_SMOOTHING, delta)
    camera.position.copy(smoothed)

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

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const targetPos = externalTarget ?? internalTarget.current
    updateCamera(dt, targetPos)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setTarget = useCallback((pos: Vector3) => {
    internalTarget.current.copy(pos)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setAngle = useCallback((angleDelta: number, elevationDelta: number) => {
    const state = stateRef.current
    state.targetAngle += angleDelta * settings.sensitivity
    state.targetElevation = Math.max(
      CAMERA_CONFIG.MIN_ELEVATION,
      Math.min(CAMERA_CONFIG.MAX_ELEVATION, state.targetElevation - elevationDelta * settings.sensitivity),
    )
  }, [settings.sensitivity])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const zoom = useCallback((amount: number) => {
    const state = stateRef.current
    state.targetDistance = Math.max(
      CAMERA_CONFIG.MIN_DISTANCE,
      Math.min(CAMERA_CONFIG.MAX_DISTANCE, state.targetDistance + amount * CAMERA_CONFIG.ZOOM_SPEED),
    )
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const triggerShake = useCallback((config?: Partial<{
    intensity: number
    frequency: number
    duration: number
    decay: number
  }>) => {
    shakeRef.current.trigger(config)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setCollisionEnabled = useCallback((enabled: boolean) => {
    collisionEnabled.current = enabled
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setTargetPosition = useCallback((x: number, y: number, z: number) => {
    internalTarget.current.set(x, y, z)
  }, [])

  return null
}
