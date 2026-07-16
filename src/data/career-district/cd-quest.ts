import type { QuestDef } from '@/systems/quest/quest.types'

export const CD_QUEST_ID = 'quest-career-district'

export function buildCDQuest(): QuestDef {
  return {
    id: CD_QUEST_ID,
    title: 'The Career Fair',
    description: 'Showcase your journey across all six chapters. Visit every portfolio plinth, speak with a recruiter, and claim your offer.',
    category: 'main',
    status: 'available',
    prerequisites: [{ questId: 'quest-hackathon-arena' }],
    dialogueStartId: '',
    dialogueCompleteId: '',
    rewards: { knowledge: 250, badgeId: 'career-ready', traitId: 'career-ready' },
    objectives: [
      { id: 'obj-plinth-0', type: 'activate', description: 'Visit Prologue Memorial', targetId: 'plinth-0', count: 1, current: 0, isOptional: false },
      { id: 'obj-plinth-1', type: 'activate', description: 'Visit Software City Showcase', targetId: 'plinth-1', count: 1, current: 0, isOptional: false },
      { id: 'obj-plinth-2', type: 'activate', description: 'Visit Bengaluru Hub Showcase', targetId: 'plinth-2', count: 1, current: 0, isOptional: false },
      { id: 'obj-plinth-3', type: 'activate', description: 'Visit AI District Showcase', targetId: 'plinth-3', count: 1, current: 0, isOptional: false },
      { id: 'obj-plinth-4', type: 'activate', description: 'Visit Open Source Valley Showcase', targetId: 'plinth-4', count: 1, current: 0, isOptional: false },
      { id: 'obj-plinth-5', type: 'activate', description: 'Visit Hackathon Arena Showcase', targetId: 'plinth-5', count: 1, current: 0, isOptional: false },
      { id: 'obj-interview', type: 'activate', description: 'Complete a recruiter interview', targetId: 'interview-pod', count: 1, current: 0, isOptional: true },
      { id: 'obj-offer', type: 'activate', description: 'Receive your offer letter', targetId: 'offer-stage', count: 1, current: 0, isOptional: false },
    ],
  }
}
