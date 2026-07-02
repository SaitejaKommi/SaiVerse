import { KeyboardManager } from './KeyboardManager'
import { MouseManager } from './MouseManager'
import type { InputFrame } from './input.types'
import type { InputConfig } from './input.config'
import { DEFAULT_INPUT_CONFIG } from './input.config'
import type { ActionName } from '@/constants/controls'
import { useSettingsStore } from '@/stores/settingsStore'

export class InputManager {
  private static instance: InputManager | null = null
  #keyboard: KeyboardManager
  #mouse: MouseManager
  #config: InputConfig
  #gamepadIndex: number | null = null
  #previousGamepadState: readonly GamepadButton[] | null = null

  private constructor() {
    this.#keyboard = new KeyboardManager()
    this.#mouse = new MouseManager()
    this.#config = { ...DEFAULT_INPUT_CONFIG }
    this.#setupSettingsSync()
  }

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager()
    }
    return InputManager.instance
  }

  attach(element?: HTMLElement): void {
    this.#keyboard.attach()
    this.#mouse.attach(element)
    window.addEventListener('gamepadconnected', this.#handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', this.#handleGamepadDisconnected)
  }

  detach(): void {
    this.#keyboard.detach()
    this.#mouse.detach()
    window.removeEventListener('gamepadconnected', this.#handleGamepadConnected)
    window.removeEventListener('gamepaddisconnected', this.#handleGamepadDisconnected)
  }

  getFrameInput(): InputFrame {
    const mouseDelta = this.#mouse.consumeFrame()
    const scrollDelta = this.#mouse.consumeScroll()

    const actions: Record<string, boolean> = {}
    const actionNames = Object.keys(this.#config.keyBindings) as ActionName[]
    for (const action of actionNames) {
      actions[action] = this.isActionPressed(action)
    }

    return {
      actions,
      mouseDelta,
      mousePosition: this.#mouse.getPosition(),
      scrollDelta,
      gamepadConnected: this.#gamepadIndex !== null,
    }
  }

  endFrame(): void {
    this.#keyboard.endFrame()
  }

  isActionPressed(action: ActionName): boolean {
    return this.#keyboard.isActionPressed(action)
  }

  isKeyPressed(code: string): boolean {
    return this.#keyboard.isPressed(code)
  }

  wasJustPressed(code: string): boolean {
    return this.#keyboard.wasJustPressed(code)
  }

  getMouseManager(): MouseManager {
    return this.#mouse
  }

  getKeyboardManager(): KeyboardManager {
    return this.#keyboard
  }

  requestPointerLock(): void {
    this.#mouse.requestLock()
  }

  exitPointerLock(): void {
    this.#mouse.exitLock()
  }

  get isPointerLocked(): boolean {
    return this.#mouse.isLocked
  }

  #setupSettingsSync(): void {
    const settings = useSettingsStore.getState()
    this.#mouse.setSensitivity(settings.controls.sensitivity)
    this.#mouse.setInvertY(settings.controls.invertY)

    useSettingsStore.subscribe((state) => {
      this.#mouse.setSensitivity(state.controls.sensitivity)
      this.#mouse.setInvertY(state.controls.invertY)
    })
  }

  #handleGamepadConnected = (e: GamepadEvent): void => {
    this.#gamepadIndex = e.gamepad.index
  }

  #handleGamepadDisconnected = (): void => {
    this.#gamepadIndex = null
    this.#previousGamepadState = null
  }

  #readGamepad(): boolean {
    if (this.#gamepadIndex === null) return false
    const gamepad = navigator.getGamepads()[this.#gamepadIndex]
    if (!gamepad) return false
    return true
  }

  static reset(): void {
    if (InputManager.instance) {
      InputManager.instance.detach()
      InputManager.instance = null
    }
  }
}
