import { ChapterRegistry } from './ChapterRegistry'
import { useChapterStore } from './ChapterStore'
import { useQuestStore } from '@/stores/questStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'
import type { ChapterConfig, ChapterStatus } from './chapter.types'

let unsubQuestComplete: (() => void) | null = null

export class ChapterManager {
  static init(): void {
    useChapterStore.getState().restore()
    this.syncFromQuestData()

    if (unsubQuestComplete) unsubQuestComplete()
    unsubQuestComplete = EventBus.on(GameEvents.QUEST_COMPLETED, () => {
      ChapterManager.syncFromQuestData()
    })
  }

  static destroy(): void {
    if (unsubQuestComplete) {
      unsubQuestComplete()
      unsubQuestComplete = null
    }
  }

  static register(config: ChapterConfig): void {
    ChapterRegistry.register(config)
    const store = useChapterStore.getState()
    const existing = store.getEntry(config.id)
    if (!existing) {
      const canUnlock = this.checkPrerequisites(config)
      store.setStatus(config.id, canUnlock ? 'available' : 'locked')
    }
  }

  static getStatus(chapterId: string): ChapterStatus {
    return useChapterStore.getState().getStatus(chapterId)
  }

  static getConfig(chapterId: string): ChapterConfig | undefined {
    return ChapterRegistry.get(chapterId)
  }

  static getAllChapters(): ChapterConfig[] {
    return ChapterRegistry.getAll()
  }

  static getCurrentChapter(): ChapterConfig | undefined {
    const store = useChapterStore.getState()
    const all = ChapterRegistry.getAll()
    for (const chapter of all) {
      const status = store.getStatus(chapter.id)
      if (status === 'in_progress' || status === 'available') return chapter
    }
    for (const chapter of [...all].reverse()) {
      const status = store.getStatus(chapter.id)
      if (status === 'completed') return chapter
    }
    return all[0]
  }

  static isUnlocked(chapterId: string): boolean {
    const status = useChapterStore.getState().getStatus(chapterId)
    return status !== 'locked'
  }

  static isComplete(chapterId: string): boolean {
    return useChapterStore.getState().isComplete(chapterId)
  }

  static startChapter(chapterId: string): boolean {
    const store = useChapterStore.getState()
    const status = store.getStatus(chapterId)
    if (status !== 'available') return false
    store.setStatus(chapterId, 'in_progress')
    return true
  }

  static completeChapter(chapterId: string): boolean {
    const store = useChapterStore.getState()
    const status = store.getStatus(chapterId)
    if (status === 'completed') return false
    if (status === 'locked') return false

    const config = ChapterRegistry.get(chapterId)
    if (!config) return false

    store.completeChapter(chapterId)

    if (config.rewards.knowledge) {
      usePlayerStore.getState().addKnowledge(config.rewards.knowledge, `chapter:${chapterId}`)
    }
    if (config.rewards.badgeId) {
      usePlayerStore.getState().addBadge(config.rewards.badgeId)
    }
    if (config.rewards.traitIds) {
      for (const traitId of config.rewards.traitIds) {
        usePlayerStore.getState().addTrait(traitId)
      }
    }

    const notif = useNotificationStore.getState()
    notif.addNotification('quest', 'Chapter Complete', config.title)

    if (config.rewards.knowledge) {
      notif.addNotification('knowledge', `Knowledge +${config.rewards.knowledge}`, config.title)
    }
    if (config.rewards.badgeId) {
      notif.addNotification('badge', 'Badge Earned', config.rewards.badgeId)
    }
    if (config.rewards.traitIds) {
      for (const traitId of config.rewards.traitIds) {
        notif.addNotification('trait', 'Language Unlocked', traitId)
      }
    }

    this.unlockNextChapters()
    store.persist()
    EventBus.emit(GameEvents.CHAPTER_COMPLETE, { chapter: chapterId })

    return true
  }

  static checkPrerequisites(config: ChapterConfig): boolean {
    const questStore = useQuestStore.getState()
    const playerStore = usePlayerStore.getState()

    for (const prereq of config.prerequisites) {
      if (prereq.questId && !questStore.completedQuestIds.includes(prereq.questId)) return false
      if (prereq.traitId && !playerStore.hasTrait(prereq.traitId)) return false
      if (prereq.badgeId && !playerStore.hasBadge(prereq.badgeId)) return false
    }
    return true
  }

  static unlockNextChapters(): void {
    const store = useChapterStore.getState()
    const all = ChapterRegistry.getAll()
    for (const chapter of all) {
      if (store.getStatus(chapter.id) !== 'locked') continue
      if (this.checkPrerequisites(chapter)) {
        store.setStatus(chapter.id, 'available')
      }
    }
    store.persist()
  }

  static syncFromQuestData(): void {
    const questStore = useQuestStore.getState()
    const all = ChapterRegistry.getAll()
    const store = useChapterStore.getState()

    for (const chapter of all) {
      const allQuestsComplete = chapter.questIds.every(
        (qid) => questStore.completedQuestIds.includes(qid)
      )
      if (allQuestsComplete && store.getStatus(chapter.id) !== 'completed') {
        store.completeChapter(chapter.id)
      }
    }
    store.persist()
  }

  static getCompletedIds(): string[] {
    return useChapterStore.getState().getCompletedIds()
  }

  static reset(): void {
    this.destroy()
    useChapterStore.getState().reset()
    ChapterRegistry.clear()
  }
}
