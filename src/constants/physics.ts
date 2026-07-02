export const GRAVITY: [number, number, number] = [0, -9.81, 0]

export const PLAYER = {
  WALK_SPEED: 4,
  RUN_SPEED: 7,
  JUMP_FORCE: 5,
  ACCELERATION: 12,
  DECELERATION: 10,
  AIR_CONTROL: 3,
  HEIGHT: 1.8,
  RADIUS: 0.4,
  MASS: 75,
} as const

export const PHYSICS_STEP: number = 1 / 60
export const MAX_DELTA: number = 1 / 30
export const VELOCITY_THRESHOLD: number = 0.01
