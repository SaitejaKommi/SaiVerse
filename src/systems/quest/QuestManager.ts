import type { QuestDef, QuestObjective } from './quest.types'
import { useQuestStore } from '@/stores/questStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useNotificationStore } from '@/stores/notificationStore'

export class QuestManager {
  static acceptQuest(questId: string): boolean {
    const store = useQuestStore.getState()
    const quest = store.getQuest(questId)
    if (!quest) return false

    const playerStore = usePlayerStore.getState()
    if (quest.prerequisites.length > 0) {
      for (const prereq of quest.prerequisites) {
        if (prereq.questId && !store.completedQuestIds.includes(prereq.questId)) return false
        if (prereq.minKnowledge !== undefined && playerStore.knowledge < prereq.minKnowledge) return false
        if (prereq.traitId && !playerStore.hasTrait(prereq.traitId)) return false
      }
    }

    if (quest.status !== 'available') return false
    if (store.activeQuestIds.length >= 10) return false

    useQuestStore.getState().acceptQuest(questId)
    const notif = useNotificationStore.getState()
    notif.addNotification('quest', 'Quest Accepted', quest.title)

    return true
  }

  static completeObjective(questId: string, objectiveId: string): boolean {
    const store = useQuestStore.getState()
    const quest = store.getQuest(questId)
    if (!quest || quest.status !== 'accepted') return false

    const objective = quest.objectives.find((o) => o.id === objectiveId)
    if (!objective) return false

    store.completeObjective(questId, objectiveId)

    const updated = store.getQuest(questId)
    if (updated?.status === 'completed') {
      const notif = useNotificationStore.getState()
      notif.addNotification('quest', 'Quest Completed', updated.title)

      if (updated.rewards.knowledge) {
        usePlayerStore.getState().addKnowledge(updated.rewards.knowledge, `quest:${questId}`)
      }
      if (updated.rewards.badgeId) {
        usePlayerStore.getState().addBadge(updated.rewards.badgeId)
      }
      if (updated.rewards.traitId) {
        usePlayerStore.getState().addTrait(updated.rewards.traitId)
      }
    }

    return true
  }

  static getCurrentObjective(questId: string): QuestObjective | null {
    const quest = useQuestStore.getState().getQuest(questId)
    if (!quest || quest.status !== 'accepted') return null

    const incomplete = quest.objectives.find((o) => o.current < o.count)
    return incomplete ?? null
  }

  static registerQuest(quest: QuestDef): void {
    useQuestStore.getState().registerQuest(quest)
  }

  static getActiveQuests(): QuestDef[] {
    return useQuestStore.getState().getActiveQuests()
  }

  static getQuest(questId: string): QuestDef | undefined {
    return useQuestStore.getState().getQuest(questId)
  }

  static canAccept(questId: string): boolean {
    const store = useQuestStore.getState()
    const quest = store.getQuest(questId)
    if (!quest || quest.status !== 'available') return false
    if (store.activeQuestIds.length >= 10) return false

    const playerStore = usePlayerStore.getState()
    for (const prereq of quest.prerequisites) {
      if (prereq.questId && !store.completedQuestIds.includes(prereq.questId)) return false
      if (prereq.minKnowledge !== undefined && playerStore.knowledge < prereq.minKnowledge) return false
      if (prereq.traitId && !playerStore.hasTrait(prereq.traitId)) return false
    }

    return true
  }
}
