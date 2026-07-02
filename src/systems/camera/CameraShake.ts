import { Vector3 } from 'three'
import type { CameraShakeConfig } from './camera.types'

export class CameraShake {
  #intensity = 0
  #frequency = 5
  #duration = 0
  #decay = 2
  #elapsed = 0
  #offset = new Vector3()
  #isActive = false

  trigger(config: Partial<CameraShakeConfig> = {}): void {
    this.#intensity = config.intensity ?? 0.5
    this.#frequency = config.frequency ?? 5
    this.#duration = config.duration ?? 0.5
    this.#decay = config.decay ?? 2
    this.#elapsed = 0
    this.#isActive = true
  }

  stop(): void {
    this.#isActive = false
    this.#offset.set(0, 0, 0)
  }

  update(delta: number): Vector3 {
    if (!this.#isActive) return this.#offset

    this.#elapsed += delta

    if (this.#elapsed >= this.#duration) {
      this.stop()
      return this.#offset
    }

    const decay = Math.exp(-this.#decay * this.#elapsed)
    const intensity = this.#intensity * decay

    this.#offset.set(
      (Math.random() - 0.5) * 2 * intensity,
      (Math.random() - 0.5) * 2 * intensity,
      (Math.random() - 0.5) * 2 * intensity,
    )

    return this.#offset
  }

  get isActive(): boolean {
    return this.#isActive
  }

  reset(): void {
    this.#intensity = 0
    this.#duration = 0
    this.#elapsed = 0
    this.#isActive = false
    this.#offset.set(0, 0, 0)
  }
}
