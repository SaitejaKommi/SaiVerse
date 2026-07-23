'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh } from 'three'
import type { PerspectiveCamera, Object3D } from 'three'
import { CAMERA_CONFIG } from './camera.config'
import type { CameraMode } from './camera.types'
import { CameraShake } from './CameraShake'
import { useGameStore } from '@/stores/gameStore'
import { useDialogueStore } from '@/stores/dialogueStore'
import { InputManager } from '@/systems/input/InputManager'

const UP = new Vector3(0, 1, 0)
const AXIS = new Vector3()
const _idealPosition = new Vector3()
const _lookTarget = new Vector3()
const _collisionOffset = new Vector3()
const _direction = new Vector3()
const _playerPos = new Vector3()
const _collisionOrigin = new Vector3()

interface CameraSystemProps {
  target?: Vector3
  mode?: CameraMode
}

export function CameraSystem({ target: externalTarget, mode: initialMode }: CameraSystemProps) {
  const { camera } = useThree()
  const shakeRef = useRef(new CameraShake())

  const stateRef = useRef({
    angle: 0,
    elevation: Math.PI / 5,
    distance: CAMERA_CONFIG.DEFAULT_DISTANCE,
    targetDistance: CAMERA_CONFIG.DEFAULT_DISTANCE,
    targetAngle: 0,
    targetElevation: Math.PI / 5,
    mode: (initialMode ?? 'third-person') as CameraMode,
  })

  const currentPos = useRef(new Vector3())
  const firstFrame = useRef(true)
  const raycaster = useRef(new Raycaster())
  const collisionEnabled = useRef(true)
  const sceneRef = useRef<Object3D[]>([])
  const sprintDistance = useRef(0)
  const frameCount = useRef(0)
  const collisionDistance = useRef(CAMERA_CONFIG.DEFAULT_DISTANCE)
  const modeTransition = useRef({ from: 0, to: 0, progress: 0, active: false })

  const eased = useCallback((t: number) => 1 - Math.pow(1 - t, 3), [])

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
    sprintDistance.current = isSprinting ? CAMERA_CONFIG.SPRINT_DISTANCE_BOOST : 0

    const mouse = InputManager.getInstance().getMouseManager()
    const mouseDelta = mouse.consumeFrame()
    const scrollDelta = mouse.consumeScroll()
    const isOrbiting = mouse.isOrbiting()

    if (!isCinematic && !isPaused) {
      const s = stateRef.current

      if (isOrbiting) {
        s.targetAngle += mouseDelta.x * CAMERA_CONFIG.ORBIT_SENSITIVITY
        s.targetElevation = Math.max(
          CAMERA_CONFIG.MIN_ELEVATION,
          Math.min(CAMERA_CONFIG.MAX_ELEVATION, s.targetElevation - mouseDelta.y * CAMERA_CONFIG.ORBIT_SENSITIVITY),
        )
      }

      if (scrollDelta !== 0) {
        s.targetDistance = Math.max(
          CAMERA_CONFIG.MIN_DISTANCE,
          Math.min(CAMERA_CONFIG.MAX_DISTANCE, s.targetDistance - scrollDelta * CAMERA_CONFIG.ZOOM_SPEED * 0.05),
        )
      }

      const targetFov = CAMERA_CONFIG.DEFAULT_FOV + (isSprinting ? CAMERA_CONFIG.SPRINT_FOV_BOOST : 0)
      if (cam.fov !== targetFov) {
        cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-CAMERA_CONFIG.COLLISION_SMOOTHING * dt))
        cam.updateProjectionMatrix()
      }
    }

    if (modeTransition.current.active) {
      modeTransition.current.progress += dt / 0.4
      const p = Math.min(modeTransition.current.progress, 1)
      stateRef.current.targetDistance = modeTransition.current.from + (modeTransition.current.to - modeTransition.current.from) * eased(p)
      if (p >= 1) {
        modeTransition.current.active = false
        stateRef.current.targetDistance = modeTransition.current.to
      }
    }

    const s = stateRef.current

    s.angle += (s.targetAngle - s.angle) * (1 - Math.exp(-CAMERA_CONFIG.ORBIT_SMOOTHING * dt))
    s.elevation += (s.targetElevation - s.elevation) * (1 - Math.exp(-CAMERA_CONFIG.ORBIT_SMOOTHING * dt))

    const distDt = 1 - Math.exp(-CAMERA_CONFIG.ZOOM_SMOOTHING * dt)
    s.distance += (s.targetDistance + sprintDistance.current - s.distance) * distDt

    let finalDistance = s.distance

    if (collisionEnabled.current) {
      AXIS.set(1, 0, 0).applyAxisAngle(UP, s.angle)
      _collisionOffset.set(0, 0, finalDistance)
        .applyAxisAngle(UP, s.angle)
        .applyAxisAngle(AXIS, -s.elevation)
      _direction.copy(_collisionOffset).normalize()

      frameCount.current = (frameCount.current + 1) % 3
      if (frameCount.current === 0) {
        let rayOrigin = targetPos
        const collisionFar = finalDistance + 0.5
        if (s.mode === 'dialogue') {
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

    AXIS.set(1, 0, 0).applyAxisAngle(UP, s.angle)
    _idealPosition.set(0, 0, finalDistance)
      .applyAxisAngle(UP, s.angle)
      .applyAxisAngle(AXIS, -s.elevation)
      .add(targetPos)
    _idealPosition.y = Math.max(_idealPosition.y, targetPos.y + CAMERA_CONFIG.CAMERA_MIN_Y_OFFSET)

    if (firstFrame.current) {
      currentPos.current.copy(_idealPosition)
      firstFrame.current = false
    } else {
      const posDt = 1 - Math.exp(-CAMERA_CONFIG.POSITION_SMOOTHING * dt)
      currentPos.current.lerp(_idealPosition, posDt)
    }

    camera.position.copy(currentPos.current)

    _lookTarget.set(targetPos.x, targetPos.y + CAMERA_CONFIG.DEFAULT_HEIGHT_OFFSET, targetPos.z)
    camera.lookAt(_lookTarget)

    const shakeOffset = shakeRef.current.update(delta)
    if (shakeOffset.lengthSq() > 0) {
      camera.position.add(shakeOffset)
    }
  })

  return null
}
