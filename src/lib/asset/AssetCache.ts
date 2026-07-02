interface CacheEntry<T> {
  key: string
  data: T
  size: number
  lastAccessed: number
  refCount: number
}

export class AssetCache<T> {
  #cache = new Map<string, CacheEntry<T>>()
  #maxMemory: number
  #currentMemory = 0

  constructor(maxMemoryMB = 512) {
    this.#maxMemory = maxMemoryMB * 1024 * 1024
  }

  get(key: string): T | null {
    const entry = this.#cache.get(key)
    if (!entry) return null

    entry.lastAccessed = performance.now()
    entry.refCount++
    return entry.data
  }

  set(key: string, data: T, size: number): void {
    while (this.#currentMemory + size > this.#maxMemory && this.#cache.size > 0) {
      this.#evictLRU()
    }

    const existing = this.#cache.get(key)
    if (existing) {
      this.#currentMemory -= existing.size
    }

    this.#cache.set(key, {
      key,
      data,
      size,
      lastAccessed: performance.now(),
      refCount: 0,
    })

    this.#currentMemory += size
  }

  release(key: string): void {
    const entry = this.#cache.get(key)
    if (!entry) return

    entry.refCount = Math.max(0, entry.refCount - 1)

    if (entry.refCount === 0) {
      this.#cache.delete(key)
      this.#currentMemory -= entry.size
    }
  }

  has(key: string): boolean {
    return this.#cache.has(key)
  }

  clear(): void {
    this.#cache.clear()
    this.#currentMemory = 0
  }

  get size(): number {
    return this.#cache.size
  }

  get memoryUsage(): number {
    return this.#currentMemory
  }

  get maxMemory(): number {
    return this.#maxMemory
  }

  get memoryUsagePercent(): number {
    return (this.#currentMemory / this.#maxMemory) * 100
  }

  #evictLRU(): void {
    let oldest: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.#cache) {
      if (entry.refCount === 0 && entry.lastAccessed < oldestTime) {
        oldest = key
        oldestTime = entry.lastAccessed
      }
    }

    if (oldest) {
      const entry = this.#cache.get(oldest)
      if (entry) {
        this.#currentMemory -= entry.size
      }
      this.#cache.delete(oldest)
    }
  }
}
