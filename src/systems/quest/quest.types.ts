export type QuestCategory = 'main' | 'side' | 'hidden'

export type QuestStatus = 'locked' | 'available' | 'accepted' | 'completed' | 'failed'

export type ObjectiveType = 'talk' | 'collect' | 'reach' | 'activate' | 'defeat' | 'use' | 'craft' | 'discover'

export interface QuestObjective {
  id: string
  type: ObjectiveType
  description: string
  targetId: string
  count: number
  current: number
  isOptional: boolean
}

export interface QuestReward {
  knowledge?: number
  badgeId?: string
  traitId?: string
  itemId?: string
}

export interface QuestPrerequisite {
  questId?: string
  minKnowledge?: number
  traitId?: string
}

export interface QuestDef {
  id: string
  title: string
  description: string
  category: QuestCategory
  status: QuestStatus
  objectives: QuestObjective[]
  rewards: QuestReward
  prerequisites: QuestPrerequisite[]
  dialogueStartId: string
  dialogueCompleteId: string
}

export interface QuestState {
  quests: Record<string, QuestDef>
  activeQuestIds: string[]
  completedQuestIds: string[]
  failedQuestIds: string[]
}

export const QUEST_STATUS_ORDER: QuestStatus[] = ['locked', 'available', 'accepted', 'completed', 'failed']
