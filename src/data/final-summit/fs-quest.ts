import type { QuestDef } from '@/systems/quest/quest.types'

export const FS_QUEST_ID = 'quest-final-summit'

export function buildFSQuest(): QuestDef {
  return {
    id: FS_QUEST_ID,
    title: 'The Summit',
    description: 'Visit each monument and reflect on Sai\'s journey. Then approach the central pedestal.',
    category: 'main',
    status: 'available',
    prerequisites: [{ questId: 'quest-career-district' }],
    dialogueStartId: '',
    dialogueCompleteId: '',
    rewards: { knowledge: 500, badgeId: 'journey-complete', traitId: 'fullstack-builder' },
    objectives: [
      { id: 'obj-monument-0', type: 'activate', description: 'Reflect on The Beginning', targetId: 'fs-monument-0', count: 1, current: 0, isOptional: false },
      { id: 'obj-monument-1', type: 'activate', description: 'Reflect on Software City', targetId: 'fs-monument-1', count: 1, current: 0, isOptional: false },
      { id: 'obj-monument-2', type: 'activate', description: 'Reflect on Bengaluru Hub', targetId: 'fs-monument-2', count: 1, current: 0, isOptional: false },
      { id: 'obj-monument-3', type: 'activate', description: 'Reflect on AI District', targetId: 'fs-monument-3', count: 1, current: 0, isOptional: false },
      { id: 'obj-monument-4', type: 'activate', description: 'Reflect on Open Source Valley', targetId: 'fs-monument-4', count: 1, current: 0, isOptional: false },
      { id: 'obj-monument-5', type: 'activate', description: 'Reflect on Hackathon Arena', targetId: 'fs-monument-5', count: 1, current: 0, isOptional: false },
      { id: 'obj-monument-6', type: 'activate', description: 'Reflect on Career District', targetId: 'fs-monument-6', count: 1, current: 0, isOptional: false },
      { id: 'obj-monument-7', type: 'activate', description: 'Reflect on The Journey', targetId: 'fs-monument-7', count: 1, current: 0, isOptional: false },
      { id: 'obj-pedestal', type: 'activate', description: 'Approach the central pedestal', targetId: 'fs-pedestal', count: 1, current: 0, isOptional: false },
    ],
  }
}
