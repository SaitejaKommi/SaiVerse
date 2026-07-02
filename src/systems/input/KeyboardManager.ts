import type { ActionName } from '@/constants/controls'
import { DEFAULT_KEY_BINDINGS } from '@/constants/controls'
import type { InputCallback } from './input.types'

export class KeyboardManager {
  #pressed: Set<string> = new Set()
  #justPressed: Set<string> = new Set()
  #justReleased: Set<string> = new Set()
  #keyBindings: Record<ActionName, string>
  #callback: InputCallback | null = null
  #handleKeyDown: (e: KeyboardEvent) => void
  #handleKeyUp: (e: KeyboardEvent) => void

  constructor() {
    this.#keyBindings = { ...DEFAULT_KEY_BINDINGS } as Record<ActionName, string>

    this.#handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      this.#pressed.add(e.code)
      this.#justPressed.add(e.code)

      this.#callback?.({
        type: 'action_down',
        action: this.#getActionForKey(e.code),
        timestamp: performance.now(),
      })
    }

    this.#handleKeyUp = (e: KeyboardEvent) => {
      this.#pressed.delete(e.code)
      this.#justReleased.add(e.code)

      this.#callback?.({
        type: 'action_up',
        action: this.#getActionForKey(e.code),
        timestamp: performance.now(),
      })
    }
  }

  attach(): void {
    window.addEventListener('keydown', this.#handleKeyDown)
    window.addEventListener('keyup', this.#handleKeyUp)
  }

  detach(): void {
    window.removeEventListener('keydown', this.#handleKeyDown)
    window.removeEventListener('keyup', this.#handleKeyUp)
    this.#pressed.clear()
    this.#justPressed.clear()
    this.#justReleased.clear()
  }

  setCallback(callback: InputCallback): void {
    this.#callback = callback
  }

  updateKeyBindings(bindings: Record<ActionName, string>): void {
    this.#keyBindings = { ...bindings }
  }

  isPressed(code: string): boolean {
    return this.#pressed.has(code)
  }

  isActionPressed(action: ActionName): boolean {
    const code = this.#keyBindings[action]
    if (!code) return false
    return this.#pressed.has(code)
  }

  wasJustPressed(code: string): boolean {
    return this.#justPressed.has(code)
  }

  wasJustReleased(code: string): boolean {
    return this.#justReleased.has(code)
  }

  endFrame(): void {
    this.#justPressed.clear()
    this.#justReleased.clear()
  }

  getPressedKeys(): string[] {
    return Array.from(this.#pressed)
  }

  #getActionForKey(code: string): ActionName | undefined {
    const entries = Object.entries(this.#keyBindings) as [ActionName, string][]
    for (const [action, boundCode] of entries) {
      if (boundCode === code) return action
    }
    return undefined
  }
}
