import type { InputFrame } from '@/systems/input/input.types'

export interface PlayerInputState {
  moveX: number
  moveZ: number
  sprint: boolean
  jump: boolean
  interact: boolean
}

export function processPlayerInput(frame: InputFrame): PlayerInputState {
  let moveX = 0
  let moveZ = 0

  if (frame.actions['left']) moveX -= 1
  if (frame.actions['right']) moveX += 1
  if (frame.actions['forward']) moveZ -= 1
  if (frame.actions['backward']) moveZ += 1

  const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
  if (length > 1) {
    moveX /= length
    moveZ /= length
  }

  return {
    moveX,
    moveZ,
    sprint: frame.actions['sprint'] ?? false,
    jump: frame.actions['jump'] ?? false,
    interact: frame.actions['interact'] ?? false,
  }
}
