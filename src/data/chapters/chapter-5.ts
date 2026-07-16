import type { ChapterConfig } from '@/systems/chapter/chapter.types'

export const CHAPTER_5: ChapterConfig = {
  id: 'chapter-5',
  title: 'Hackathon Arena',
  subtitle: 'Monad Blitz',
  order: 5,
  description: 'Pressure. Chaos. Recovery. Triumph. The climax of SaiVerse.',
  prerequisites: [{ questId: 'quest-open-source-valley' }],
  questIds: ['quest-hackathon-arena'],
  npcIds: ['npc-announcer'],
  rewards: {
    knowledge: 200,
    badgeId: 'chapter-5-complete',
    traitIds: ['hackathon-champion', 'resilience'],
  },
  nextChapterId: undefined,
  cutscenes: [],
}
