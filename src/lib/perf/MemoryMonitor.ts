export class MemoryMonitor {
  #samples: number[] = []
  #maxSamples = 60
  #currentMemory = 0
  #peakMemory = 0

  constructor() {
    this.#samples = new Array(this.#maxSamples).fill(0)
  }

  sample(): void {
    const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
    if (mem) {
      this.#currentMemory = mem.usedJSHeapSize
      if (this.#currentMemory > this.#peakMemory) {
        this.#peakMemory = this.#currentMemory
      }
      this.#samples.push(this.#currentMemory)
      if (this.#samples.length > this.#maxSamples) {
        this.#samples.shift()
      }
    }
  }

  get currentMB(): number {
    return Math.round(this.#currentMemory / (1024 * 1024))
  }

  get peakMB(): number {
    return Math.round(this.#peakMemory / (1024 * 1024))
  }

  get averageMB(): number {
    if (this.#samples.length === 0) return 0
    const sum = this.#samples.reduce((a, b) => a + b, 0)
    return Math.round(sum / this.#samples.length / (1024 * 1024))
  }

  reset(): void {
    this.#samples = []
    this.#currentMemory = 0
    this.#peakMemory = 0
  }
}
