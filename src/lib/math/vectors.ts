import { Vector3, Euler, Quaternion } from 'three'

export function createVector3(x = 0, y = 0, z = 0): Vector3 {
  return new Vector3(x, y, z)
}

export function lerpVector3(a: Vector3, b: Vector3, t: number): Vector3 {
  return new Vector3().lerpVectors(a, b, t)
}

export function clampVector3(v: Vector3, min: Vector3, max: Vector3): Vector3 {
  return new Vector3(
    Math.max(min.x, Math.min(max.x, v.x)),
    Math.max(min.y, Math.min(max.y, v.y)),
    Math.max(min.z, Math.min(max.z, v.z)),
  )
}

export function lerpAngle(current: number, target: number, alpha: number): number {
  const diff = target - current
  const shortest = ((diff % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI
  return current + shortest * alpha
}

export function eulerToQuaternion(euler: Euler): Quaternion {
  return new Quaternion().setFromEuler(euler)
}

export function quaternionToEuler(q: Quaternion): Euler {
  return new Euler().setFromQuaternion(q)
}

export function dampVector3(current: Vector3, target: Vector3, smoothing: number, dt: number): Vector3 {
  return new Vector3(
    current.x + (target.x - current.x) * (1 - Math.exp(-smoothing * dt)),
    current.y + (target.y - current.y) * (1 - Math.exp(-smoothing * dt)),
    current.z + (target.z - current.z) * (1 - Math.exp(-smoothing * dt)),
  )
}

export function dampAngle(current: number, target: number, smoothing: number, dt: number): number {
  const diff = target - current
  const shortest = ((diff % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI
  return current + shortest * (1 - Math.exp(-smoothing * dt))
}

export function toThreeArray(v: Vector3): [number, number, number] {
  return [v.x, v.y, v.z]
}

export function fromThreeArray(arr: [number, number, number]): Vector3 {
  return new Vector3(arr[0], arr[1], arr[2])
}
