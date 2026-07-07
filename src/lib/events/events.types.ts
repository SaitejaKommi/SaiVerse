export const GameEvents = {
  INTERACTION_START: 'interaction:start',
  INTERACTION_COMPLETE: 'interaction:complete',
  DIALOGUE_START: 'dialogue:start',
  DIALOGUE_ADVANCE: 'dialogue:advance',
  DIALOGUE_END: 'dialogue:end',
  DIALOGUE_SKIP: 'dialogue:skip',
  QUEST_ACCEPTED: 'quest:accepted',
  QUEST_PROGRESS: 'quest:progress',
  QUEST_COMPLETED: 'quest:completed',
  QUEST_FAILED: 'quest:failed',
  QUEST_LOG_UPDATED: 'quest:log_updated',
  NOTIFICATION_ADDED: 'notification:added',
  NOTIFICATION_REMOVED: 'notification:removed',
  INVENTORY_UPDATED: 'inventory:updated',
  SAVE_COMPLETED: 'save:completed',
  LOAD_COMPLETED: 'load:completed',
  PLAYER_KNOWLEDGE_CHANGED: 'player:knowledge_changed',
  PLAYER_TRAIT_UNLOCKED: 'player:trait_unlocked',
  PLAYER_BADGE_EARNED: 'player:badge_earned',
  AREA_DISCOVERED: 'area:discovered',
  HUD_MODE_CHANGED: 'hud:mode_changed',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  CHAPTER_FINALE_TRIGGER: 'chapter:finale_trigger',
  CHAPTER_COMPLETE: 'chapter:complete',
  AMBIENCE_FADE: 'ambience:fade',
  CELEBRATION_TRIGGER: 'celebration:trigger',
} as const

export interface InteractionEvent {
  objectId: string
  objectType: string
  position: [number, number, number]
}

export interface DialogueEvent {
  dialogueId: string
  nodeId?: string
}

export interface QuestEvent {
  questId: string
  questTitle: string
}

export interface QuestProgressEvent extends QuestEvent {
  objectiveId: string
}

export interface NotificationEvent {
  id: string
  title: string
  message: string
  icon?: string
  duration?: number
}

export interface KnowledgeEvent {
  amount: number
  source: string
  total: number
}
