import type { ChapterConfig } from '@/systems/chapter/chapter.types'

export const CHAPTER_0: ChapterConfig = {
  id: 'chapter-0',
  title: 'The First Step',
  subtitle: 'Welcome to SaiVerse',
  order: 0,
  description: 'Meet the Guide, accept your first quest, and discover the Campus Entrance.',
  prerequisites: [],
  questIds: ['quest-first-step'],
  npcIds: ['npc-placeholder'],
  rewards: {
    knowledge: 25,
    badgeId: 'journey-begins',
  },
  nextChapterId: 'chapter-1',
  cutscenes: [
    { id: 'campus-reveal', triggerOn: 'quest_complete', questId: 'quest-first-step' },
  ],
}
