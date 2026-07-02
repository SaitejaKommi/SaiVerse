import { AssetCache } from './AssetCache'

export type AssetType = 'model' | 'texture' | 'audio' | 'data'

export interface LoadProgress {
  loaded: number
  total: number
  percentage: number
  currentAsset: string
}

export type ProgressCallback = (progress: LoadProgress) => void

export interface LoadOptions {
  onProgress?: ProgressCallback
  signal?: AbortSignal
  priority?: 'high' | 'normal' | 'low'
}

class AssetLoaderSingleton {
  #modelCache = new AssetCache<unknown>(256)
  #textureCache = new AssetCache<unknown>(200)
  #audioCache = new AssetCache<unknown>(80)
  #activeLoads = new Map<string, Promise<unknown>>()
  #loadQueue: { key: string; loader: () => Promise<unknown>; priority: string; resolve: (value: unknown) => void; reject: (reason: unknown) => void }[] = []
  #isProcessing = false

  async loadModel(key: string, loader: () => Promise<unknown>, options?: LoadOptions): Promise<unknown> {
    return this.#loadWithCache(key, loader, this.#modelCache, options)
  }

  async loadTexture(key: string, loader: () => Promise<unknown>, options?: LoadOptions): Promise<unknown> {
    return this.#loadWithCache(key, loader, this.#textureCache, options)
  }

  async loadAudio(key: string, loader: () => Promise<unknown>, options?: LoadOptions): Promise<unknown> {
    return this.#loadWithCache(key, loader, this.#audioCache, options)
  }

  async #loadWithCache(
    key: string,
    loader: () => Promise<unknown>,
    cache: AssetCache<unknown>,
    options?: LoadOptions,
  ): Promise<unknown> {
    const cached = cache.get(key)
    if (cached) return cached

    const existing = this.#activeLoads.get(key)
    if (existing) return existing

    if (options?.priority === 'low') {
      return new Promise((resolve, reject) => {
        this.#loadQueue.push({ key, loader, priority: 'low', resolve, reject })
        this.#processQueue()
      })
    }

    const promise = this.#executeLoad(key, loader, cache, options)
    return promise
  }

  async #executeLoad(
    key: string,
    loader: () => Promise<unknown>,
    cache: AssetCache<unknown>,
    _options?: LoadOptions,
  ): Promise<unknown> {
    const loadPromise = loader()
    this.#activeLoads.set(key, loadPromise)

    try {
      const result = await loadPromise
      cache.set(key, result, 1024)
      return result
    } finally {
      this.#activeLoads.delete(key)
    }
  }

  async #processQueue(): Promise<void> {
    if (this.#isProcessing) return
    this.#isProcessing = true

    while (this.#loadQueue.length > 0) {
      const item = this.#loadQueue.shift()
      if (!item) continue

      try {
        const result = await item.loader()
        item.resolve(result)
      } catch (error) {
        item.reject(error)
      }
    }

    this.#isProcessing = false
  }

  getCacheStats(): {
    models: { size: number; memory: number; maxMemory: number }
    textures: { size: number; memory: number; maxMemory: number }
    audio: { size: number; memory: number; maxMemory: number }
  } {
    return {
      models: {
        size: this.#modelCache.size,
        memory: this.#modelCache.memoryUsage,
        maxMemory: this.#modelCache.maxMemory,
      },
      textures: {
        size: this.#textureCache.size,
        memory: this.#textureCache.memoryUsage,
        maxMemory: this.#textureCache.maxMemory,
      },
      audio: {
        size: this.#audioCache.size,
        memory: this.#audioCache.memoryUsage,
        maxMemory: this.#audioCache.maxMemory,
      },
    }
  }

  clearAll(): void {
    this.#modelCache.clear()
    this.#textureCache.clear()
    this.#audioCache.clear()
    this.#activeLoads.clear()
    this.#loadQueue = []
  }
}

export const assetLoader = new AssetLoaderSingleton()
