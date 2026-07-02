export const DEFAULT_KEY_BINDINGS = {
  forward: 'KeyW',
  backward: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  sprint: 'ShiftLeft',
  jump: 'Space',
  interact: 'KeyE',
  pause: 'Escape',
  debug: 'Backquote',
  photoMode: 'KeyP',
} as const

export const MOUSE = {
  SENSITIVITY: 0.002,
  INVERT_Y: false,
  SMOOTHING: 0.1,
} as const

export const CONTROLLER = {
  DEAD_ZONE: 0.15,
  SENSITIVITY: 0.5,
} as const

export type ActionName = keyof typeof DEFAULT_KEY_BINDINGS

export interface InputSnapshot {
  actions: Record<string, boolean>
  mouseDelta: { x: number; y: number }
  mousePosition: { x: number; y: number }
  scrollDelta: number
}

export const INPUT_POLL_RATE = 0
