import type { ChapterConfig } from '@/systems/chapter/chapter.types'

export const CHAPTER_2: ChapterConfig = {
  id: 'chapter-2',
  title: 'Software City',
  subtitle: 'Building Real Software',
  order: 2,
  description: 'Enter the tech district, set up your dev environment, fix real bugs, and deploy your first project.',
  prerequisites: [{ questId: 'quest-first-lesson' }],
  questIds: ['quest-software-project'],
  npcIds: ['npc-tech-mentor'],
  rewards: {
    knowledge: 75,
    badgeId: 'chapter-2-complete',
    traitIds: ['javascript-basics', 'react-basics'],
  },
  nextChapterId: 'chapter-3',
  cutscenes: [
    { id: 'sc-finale', triggerOn: 'chapter_complete' },
  ],
}
