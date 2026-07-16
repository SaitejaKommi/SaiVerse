import type { ChapterConfig } from '@/systems/chapter/chapter.types'

export const CHAPTER_4: ChapterConfig = {
  id: 'chapter-4',
  title: 'Open Source Valley',
  subtitle: 'The Foundry',
  order: 4,
  description: 'Collaboration. Community. Contribution. Ownership.',
  prerequisites: [{ questId: 'quest-ai-exploration' }],
  questIds: ['quest-open-source-valley'],
  npcIds: ['npc-steward'],
  rewards: {
    knowledge: 150,
    badgeId: 'chapter-4-complete',
    traitIds: ['collaboration', 'open-source'],
  },
  nextChapterId: undefined,
  cutscenes: [],
}
