import { create } from 'zustand'
import type { QuestDef, QuestStatus, QuestObjective, QuestState } from '@/systems/quest/quest.types'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

interface QuestActions {
  registerQuest: (quest: QuestDef) => void
  acceptQuest: (questId: string) => void
  completeObjective: (questId: string, objectiveId: string) => void
  completeQuest: (questId: string) => void
  failQuest: (questId: string) => void
  setQuestStatus: (questId: string, status: QuestStatus) => void
  getQuest: (questId: string) => QuestDef | undefined
  getActiveQuests: () => QuestDef[]
  reset: () => void
}

const initialState: QuestState = {
  quests: {},
  activeQuestIds: [],
  completedQuestIds: [],
  failedQuestIds: [],
}

const useQuestStore = create<QuestState & QuestActions>()((set, get) => ({
  ...initialState,

  registerQuest: (quest) =>
    set((state) => ({
      quests: { ...state.quests, [quest.id]: quest },
    })),

  acceptQuest: (questId) =>
    set((state) => {
      const quest = state.quests[questId]
      if (!quest || quest.status !== 'available') return state
      const updated: QuestDef = { ...quest, status: 'accepted' }
      EventBus.emit(GameEvents.QUEST_ACCEPTED, { questId, questTitle: quest.title })
      return {
        quests: { ...state.quests, [questId]: updated },
        activeQuestIds: [...state.activeQuestIds, questId],
      }
    }),

  completeObjective: (questId, objectiveId) =>
    set((state) => {
      const quest = state.quests[questId]
      if (!quest || quest.status !== 'accepted') return state

      const objectives = quest.objectives.map((obj) => {
        if (obj.id !== objectiveId) return obj
        const updated: QuestObjective = { ...obj, current: Math.min(obj.count, obj.current + 1) }
        return updated
      })

      const allDone = objectives.every((obj) => obj.current >= obj.count)
      const updated: QuestDef = { ...quest, objectives }

      EventBus.emit(GameEvents.QUEST_PROGRESS, { questId, questTitle: quest.title, objectiveId })

      if (allDone) {
        updated.status = 'completed'
        EventBus.emit(GameEvents.QUEST_COMPLETED, { questId, questTitle: quest.title })
        return {
          quests: { ...state.quests, [questId]: updated },
          activeQuestIds: state.activeQuestIds.filter((id) => id !== questId),
          completedQuestIds: [...state.completedQuestIds, questId],
        }
      }

      return { quests: { ...state.quests, [questId]: updated } }
    }),

  completeQuest: (questId) =>
    set((state) => {
      const quest = state.quests[questId]
      if (!quest) return state
      const updated: QuestDef = { ...quest, status: 'completed' }
      EventBus.emit(GameEvents.QUEST_COMPLETED, { questId, questTitle: quest.title })
      return {
        quests: { ...state.quests, [questId]: updated },
        activeQuestIds: state.activeQuestIds.filter((id) => id !== questId),
        completedQuestIds: [...state.completedQuestIds, questId],
      }
    }),

  failQuest: (questId) =>
    set((state) => {
      const quest = state.quests[questId]
      if (!quest) return state
      const updated: QuestDef = { ...quest, status: 'failed' }
      EventBus.emit(GameEvents.QUEST_FAILED, { questId, questTitle: quest.title })
      return {
        quests: { ...state.quests, [questId]: updated },
        activeQuestIds: state.activeQuestIds.filter((id) => id !== questId),
        failedQuestIds: [...state.failedQuestIds, questId],
      }
    }),

  setQuestStatus: (questId, status) =>
    set((state) => {
      const quest = state.quests[questId]
      if (!quest) return state
      return { quests: { ...state.quests, [questId]: { ...quest, status } } }
    }),

  getQuest: (questId) => get().quests[questId],

  getActiveQuests: () => {
    const { quests, activeQuestIds } = get()
    return activeQuestIds.map((id) => quests[id]).filter((q): q is QuestDef => q !== undefined)
  },

  reset: () => set(initialState),
}))

export { useQuestStore }
export type { QuestActions }
