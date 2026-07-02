import { create } from 'zustand'
import type { SaveSlotMeta, SavePayload } from '@/types/save'

interface SaveState {
  slots: SaveSlotMeta[]
  activeSlotId: string | null
  isSaving: boolean
  isLoading: boolean
  lastSaveTime: number | null
}

interface SaveActions {
  addSlot: (meta: SaveSlotMeta) => void
  removeSlot: (id: string) => void
  setActiveSlot: (id: string | null) => void
  setSaving: (saving: boolean) => void
  setLoading: (loading: boolean) => void
  updateSlot: (id: string, data: Partial<SaveSlotMeta>) => void
  getPayload: () => SavePayload
  reset: () => void
}

const initialState: SaveState = {
  slots: [],
  activeSlotId: null,
  isSaving: false,
  isLoading: false,
  lastSaveTime: null,
}

const useSaveStore = create<SaveState & SaveActions>()((set, _get) => ({
  ...initialState,

  addSlot: (meta) =>
    set((state) => ({
      slots: [...state.slots, meta],
    })),

  removeSlot: (id) =>
    set((state) => ({
      slots: state.slots.filter((s) => s.id !== id),
      activeSlotId: state.activeSlotId === id ? null : state.activeSlotId,
    })),

  setActiveSlot: (id) => set({ activeSlotId: id }),

  setSaving: (isSaving) => set({ isSaving }),

  setLoading: (isLoading) => set({ isLoading }),

  updateSlot: (id, data) =>
    set((state) => ({
      slots: state.slots.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),

  getPayload: () => {
    return {
      player: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        state: 'idle',
      },
      world: {
        timeOfDay: 12,
        weather: 'clear',
        currentDistrict: null,
      },
      version: 1,
    }
  },

  reset: () => set(initialState),
}))

export { useSaveStore }
export type { SaveState, SaveActions }
