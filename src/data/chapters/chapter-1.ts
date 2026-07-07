import type { ChapterConfig } from '@/systems/chapter/chapter.types'

export const CHAPTER_1: ChapterConfig = {
  id: 'chapter-1',
  title: 'The First Lesson',
  subtitle: 'Java Fundamentals',
  order: 1,
  description: 'Study the whiteboard, write your first Java program, and complete Professor Mehta\'s lesson.',
  prerequisites: [{ questId: 'quest-first-step' }],
  questIds: ['quest-first-lesson'],
  npcIds: ['npc-professor'],
  rewards: {
    badgeId: 'chapter-1-complete',
    traitIds: ['java-basics'],
  },
  nextChapterId: undefined,
  cutscenes: [
    { id: 'chapter-finale', triggerOn: 'chapter_complete' },
  ],
}
