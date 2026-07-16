import type { QuestDef } from '@/systems/quest/quest.types'

export const OSV_QUEST_ID = 'quest-open-source-valley'

export function buildOSVQuest(): QuestDef {
  return {
    id: OSV_QUEST_ID,
    title: 'The Open Source Valley',
    description: 'Contribute to the Foundry — plant the garden, build the bridge, stock the archive.',
    category: 'main',
    status: 'available',
    prerequisites: [{ questId: 'quest-ai-exploration' }],
    dialogueStartId: '',
    dialogueCompleteId: '',
    rewards: { knowledge: 150, badgeId: 'open-source-contributor' },
    objectives: [
      { id: 'obj-cultivate-garden', type: 'activate', description: 'Plant and water the community garden', targetId: 'garden-plot', count: 5, current: 0, isOptional: false },
      { id: 'obj-build-bridge', type: 'activate', description: 'Build the Pull Request Bridge', targetId: 'pr-bridge', count: 5, current: 0, isOptional: false },
      { id: 'obj-restock-archive', type: 'collect', description: 'Collect and return books to the archive', targetId: 'knowledge-archive', count: 5, current: 0, isOptional: false },
    ],
  }
}
