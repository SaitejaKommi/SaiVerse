import type { QuestDef } from '@/systems/quest/quest.types'

export const AI_QUEST_ID = 'quest-ai-exploration'

export function buildAIQuest(): QuestDef {
  return {
    id: AI_QUEST_ID,
    title: 'The AI Exploration',
    description: 'Explore the AI Research District. Analyze data, train a model, interact with AI, and witness the Neural Core.',
    category: 'main',
    status: 'available',
    prerequisites: [{ questId: 'quest-software-project' }],
    dialogueStartId: '',
    dialogueCompleteId: '',
    rewards: { knowledge: 100, badgeId: 'ai-explorer' },
    objectives: [
      { id: 'obj-analyze-data', type: 'discover', description: 'Analyze the dataset at the Data Terminal', targetId: 'data-terminal', count: 1, current: 0, isOptional: false },
      { id: 'obj-train-model', type: 'activate', description: 'Train a model at the Training Console', targetId: 'training-console', count: 1, current: 0, isOptional: false },
      { id: 'obj-prompt-ai', type: 'use', description: 'Interact with AI at the Prompt Lab', targetId: 'prompt-lab', count: 1, current: 0, isOptional: false },
      { id: 'obj-witness-core', type: 'reach', description: 'Witness the Neural Core activation', targetId: 'neural-core', count: 1, current: 0, isOptional: false },
    ],
  }
}
