import { ChapterManager } from '@/systems/chapter/ChapterManager'
import { CHAPTER_0 } from './chapter-0'
import { CHAPTER_1 } from './chapter-1'

export function registerAllChapters(): void {
  ChapterManager.register(CHAPTER_0)
  ChapterManager.register(CHAPTER_1)
}

export { CHAPTER_0, CHAPTER_1 }
