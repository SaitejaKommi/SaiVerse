import { ChapterManager } from '@/systems/chapter/ChapterManager'
import { CHAPTER_0 } from './chapter-0'
import { CHAPTER_1 } from './chapter-1'
import { CHAPTER_2 } from './chapter-2'
import { CHAPTER_3 } from './chapter-3'
import { CHAPTER_4 } from './chapter-4'

export function registerAllChapters(): void {
  ChapterManager.register(CHAPTER_0)
  ChapterManager.register(CHAPTER_1)
  ChapterManager.register(CHAPTER_2)
  ChapterManager.register(CHAPTER_3)
  ChapterManager.register(CHAPTER_4)
}

export { CHAPTER_0, CHAPTER_1, CHAPTER_2, CHAPTER_3, CHAPTER_4 }
