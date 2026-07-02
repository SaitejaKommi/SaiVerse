import type { ActionName } from '@/constants/controls'

export interface MouseDelta {
  x: number
  y: number
}

export interface InputFrame {
  actions: Record<string, boolean>
  mouseDelta: MouseDelta
  mousePosition: { x: number; y: number }
  scrollDelta: number
  gamepadConnected: boolean
}

export type InputDevice = 'keyboard' | 'mouse' | 'gamepad'

export interface InputEvent {
  type: 'action_down' | 'action_up' | 'mouse_move' | 'scroll'
  action?: ActionName
  value?: number | boolean
  timestamp: number
}

export type InputCallback = (event: InputEvent) => void
