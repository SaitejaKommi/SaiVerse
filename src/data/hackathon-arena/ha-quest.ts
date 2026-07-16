import type { QuestDef } from '@/systems/quest/quest.types'

export const HA_QUEST_ID = 'quest-hackathon-arena'

export function buildHAQuest(): QuestDef {
  return {
    id: HA_QUEST_ID,
    title: 'Hackathon Arena',
    description: 'Compete in the arena. Build through three sprints. Present your work.',
    category: 'main',
    status: 'available',
    prerequisites: [{ questId: 'quest-open-source-valley' }],
    dialogueStartId: '',
    dialogueCompleteId: '',
    rewards: { knowledge: 200, badgeId: 'monad-blitz-champion' },
    objectives: [
      { id: 'obj-sprint-1', type: 'activate', description: 'Complete Sprint 1: Foundation', targetId: 'code-station', count: 1, current: 0, isOptional: false },
      { id: 'obj-sprint-2', type: 'activate', description: 'Complete Sprint 2: Features', targetId: 'code-station', count: 1, current: 0, isOptional: false },
      { id: 'obj-sprint-3', type: 'activate', description: 'Complete Sprint 3: Ship It', targetId: 'code-station', count: 1, current: 0, isOptional: false },
      { id: 'obj-presentation', type: 'activate', description: 'Present your project on stage', targetId: 'presentation-stage', count: 1, current: 0, isOptional: false },
    ],
  }
}
