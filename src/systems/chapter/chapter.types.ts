export type ChapterStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface ChapterReward {
  knowledge?: number
  badgeId?: string
  traitIds?: string[]
}

export interface ChapterPrereq {
  questId?: string
  traitId?: string
  badgeId?: string
}

export interface ChapterCutsceneRef {
  id: string
  triggerOn: 'chapter_start' | 'chapter_complete' | 'quest_complete'
  questId?: string
}

export interface ChapterConfig {
  id: string
  title: string
  subtitle?: string
  order: number
  description: string
  prerequisites: ChapterPrereq[]
  questIds: string[]
  npcIds: string[]
  rewards: ChapterReward
  nextChapterId?: string
  cutscenes?: ChapterCutsceneRef[]
}

export interface ChapterStateEntry {
  id: string
  status: ChapterStatus
  completedAt?: number
}

export interface ChapterState {
  entries: Record<string, ChapterStateEntry>
}

export const STORAGE_KEY = 'saiverse-chapters'
