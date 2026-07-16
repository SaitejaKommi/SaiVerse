import type { ChapterConfig } from '@/systems/chapter/chapter.types'

export const CHAPTER_3: ChapterConfig = {
  id: 'chapter-3',
  title: 'AI District',
  subtitle: 'Artificial Intelligence',
  order: 3,
  description: 'Explore the AI research lab, interact with data, train models, and witness the Neural Core.',
  prerequisites: [{ questId: 'quest-software-project' }],
  questIds: ['quest-ai-exploration'],
  npcIds: [],
  rewards: {
    knowledge: 100,
    badgeId: 'chapter-3-complete',
    traitIds: ['python-basics', 'ml-basics'],
  },
  nextChapterId: 'chapter-4',
  cutscenes: [],
}
