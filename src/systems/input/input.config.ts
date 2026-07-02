import { DEFAULT_KEY_BINDINGS, MOUSE } from '@/constants/controls'
import type { ActionName } from '@/constants/controls'

export interface InputConfig {
  keyBindings: Record<ActionName, string>
  mouseSensitivity: number
  invertY: boolean
  mouseSmoothing: number
  scrollZoomSpeed: number
}

export const DEFAULT_INPUT_CONFIG: InputConfig = {
  keyBindings: { ...DEFAULT_KEY_BINDINGS } as Record<ActionName, string>,
  mouseSensitivity: MOUSE.SENSITIVITY,
  invertY: MOUSE.INVERT_Y,
  mouseSmoothing: MOUSE.SMOOTHING,
  scrollZoomSpeed: 0.5,
}
