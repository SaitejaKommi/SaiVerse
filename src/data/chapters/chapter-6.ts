import type { ChapterConfig } from '@/systems/chapter/chapter.types'

export const CHAPTER_6: ChapterConfig = {
  id: 'chapter-6',
  title: 'Career District',
  subtitle: 'Achievement',
  order: 6,
  description: 'The exhibition of everything Sai has built. A celebration of skill, perseverance, and growth.',
  prerequisites: [{ questId: 'quest-hackathon-arena' }],
  questIds: ['quest-career-district'],
  npcIds: ['npc-career-counselor', 'npc-frontend-recruiter', 'npc-fullstack-recruiter', 'npc-ai-recruiter'],
  rewards: {
    knowledge: 250,
    badgeId: 'career-ready',
    traitIds: ['career-ready'],
  },
  nextChapterId: 'chapter-7',
  cutscenes: [],
}
