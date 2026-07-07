import { create } from 'zustand'
import type { ChapterState, ChapterStateEntry, ChapterStatus } from './chapter.types'
import { STORAGE_KEY } from './chapter.types'

interface ChapterStoreActions {
  getEntry: (chapterId: string) => ChapterStateEntry | undefined
  getStatus: (chapterId: string) => ChapterStatus
  setStatus: (chapterId: string, status: ChapterStatus) => void
  completeChapter: (chapterId: string) => void
  getCompletedIds: () => string[]
  isComplete: (chapterId: string) => boolean
  persist: () => void
  restore: () => void
  reset: () => void
}

function loadFromStorage(): ChapterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { entries: {} }
    return JSON.parse(raw) as ChapterState
  } catch {
    return { entries: {} }
  }
}

const useChapterStore = create<ChapterState & ChapterStoreActions>()((set, get) => ({
  ...loadFromStorage(),

  getEntry: (chapterId) => get().entries[chapterId],

  getStatus: (chapterId) => get().entries[chapterId]?.status ?? 'locked',

  setStatus: (chapterId, status) =>
    set((state) => {
      const existing = state.entries[chapterId]
      const entry: ChapterStateEntry = existing
        ? { ...existing, status }
        : { id: chapterId, status }
      return { entries: { ...state.entries, [chapterId]: entry } }
    }),

  completeChapter: (chapterId) =>
    set((state) => {
      const existing = state.entries[chapterId]
      const entry: ChapterStateEntry = existing
        ? { ...existing, status: 'completed', completedAt: Date.now() }
        : { id: chapterId, status: 'completed', completedAt: Date.now() }
      return { entries: { ...state.entries, [chapterId]: entry } }
    }),

  getCompletedIds: () =>
    Object.values(get().entries)
      .filter((e) => e.status === 'completed')
      .map((e) => e.id),

  isComplete: (chapterId) => get().entries[chapterId]?.status === 'completed',

  persist: () => {
    try {
      const state = get()
      const data: ChapterState = { entries: state.entries }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch { /* storage unavailable */ }
  },

  restore: () => {
    const stored = loadFromStorage()
    if (stored.entries) {
      set({ entries: stored.entries })
    }
  },

  reset: () => set({ entries: {} }),
}))

export { useChapterStore }
