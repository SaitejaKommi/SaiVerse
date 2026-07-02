export class FPSMonitor {
  #frames: number[] = []
  #frameIndex = 0
  #frameCount = 0
  #lastSecond = 0
  #fps = 0
  #minFps = Infinity
  #maxFps = 0
  #accumulator = 0

  constructor(private sampleSize = 120) {
    this.#frames = new Array(sampleSize).fill(0)
  }

  tick(delta: number): void {
    const fps = delta > 0 ? 1 / delta : 0

    this.#frames[this.#frameIndex] = fps
    this.#frameIndex = (this.#frameIndex + 1) % this.sampleSize
    this.#frameCount++

    const sum = this.#frames.reduce((a, b) => a + b, 0)
    this.#fps = sum / this.sampleSize

    if (fps < this.#minFps) this.#minFps = fps
    if (fps > this.#maxFps) this.#maxFps = fps
  }

  get fps(): number {
    return Math.round(this.#fps)
  }

  get minFps(): number {
    return Math.round(this.#minFps)
  }

  get maxFps(): number {
    return Math.round(this.#maxFps)
  }

  get avgFps(): number {
    return Math.round(this.#fps)
  }

  get frameCount(): number {
    return this.#frameCount
  }

  get frameTime(): number {
    return this.#fps > 0 ? 1000 / this.#fps : 0
  }

  reset(): void {
    this.#frames.fill(0)
    this.#frameIndex = 0
    this.#frameCount = 0
    this.#minFps = Infinity
    this.#maxFps = 0
  }
}
