import type { ChapterConfig } from './chapter.types'

const registry = new Map<string, ChapterConfig>()

export class ChapterRegistry {
  static register(config: ChapterConfig): void {
    if (registry.has(config.id)) {
      console.warn(`[ChapterRegistry] Chapter '${config.id}' already registered — overwriting`)
    }
    registry.set(config.id, config)
  }

  static get(chapterId: string): ChapterConfig | undefined {
    return registry.get(chapterId)
  }

  static getAll(): ChapterConfig[] {
    return Array.from(registry.values()).sort((a, b) => a.order - b.order)
  }

  static getByOrder(order: number): ChapterConfig | undefined {
    return Array.from(registry.values()).find((c) => c.order === order)
  }

  static getQuestsForChapter(chapterId: string): string[] {
    return registry.get(chapterId)?.questIds ?? []
  }

  static getNPCsForChapter(chapterId: string): string[] {
    return registry.get(chapterId)?.npcIds ?? []
  }

  static getNextChapter(chapterId: string): ChapterConfig | undefined {
    const current = registry.get(chapterId)
    if (!current?.nextChapterId) return undefined
    return registry.get(current.nextChapterId)
  }

  static getSize(): number {
    return registry.size
  }

  static clear(): void {
    registry.clear()
  }
}
