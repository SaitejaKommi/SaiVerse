import type { ChapterConfig } from '@/systems/chapter/chapter.types'

export const CHAPTER_7: ChapterConfig = {
  id: 'chapter-7',
  title: 'The Summit',
  subtitle: 'Reflection',
  order: 7,
  description: 'The final chapter. A quiet summit at sunset where every step of the journey comes full circle.',
  prerequisites: [{ questId: 'quest-career-district' }],
  questIds: ['quest-final-summit'],
  npcIds: [],
  rewards: {
    knowledge: 500,
    badgeId: 'journey-complete',
    traitIds: ['fullstack-builder'],
  },
  cutscenes: [],
}
