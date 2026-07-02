export type CameraMode = 'third-person' | 'first-person' | 'cinematic' | 'dialogue' | 'photo' | 'free'

export interface CameraState {
  distance: number
  heightOffset: number
  lookAtHeight: number
  currentAngle: number
  currentElevation: number
  targetAngle: number
  targetElevation: number
  currentDistance: number
  targetDistance: number
  fov: number
  mode: CameraMode
}

export interface CameraCollisionResult {
  adjustedDistance: number
  hit: boolean
}

export interface CameraShakeConfig {
  intensity: number
  frequency: number
  duration: number
  decay: number
}

export type CameraTransitionEasing = (t: number) => number
