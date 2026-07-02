import type { Object3D, Vector3, Euler } from 'three'

export type ThreeVector3 = [number, number, number]

export interface CameraState {
  position: Vector3
  rotation: Euler
  target: Vector3
}

export interface CollidableObject {
  object: Object3D
  radius: number
  offset: Vector3
}

export interface RaycastResult {
  hit: boolean
  distance: number
  point?: Vector3
  normal?: Vector3
  object?: Object3D
}

export type CameraMode = 'third-person' | 'first-person' | 'cinematic' | 'dialogue' | 'photo' | 'free'

export interface CameraTransition {
  from: CameraState
  to: CameraState
  duration: number
  easing?: (t: number) => number
}
