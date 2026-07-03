import { create } from 'zustand'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

interface PlayerMetaState {
  knowledge: number
  traits: string[]
  badges: string[]
  discoveredAreas: string[]
  playTime: number
  lastSaveTimestamp: number | null
}

interface PlayerMetaActions {
  addKnowledge: (amount: number, source: string) => void
  setKnowledge: (amount: number) => void
  addTrait: (traitId: string) => void
  addBadge: (badgeId: string) => void
  discoverArea: (areaId: string) => void
  hasTrait: (traitId: string) => boolean
  hasBadge: (badgeId: string) => boolean
  hasDiscoveredArea: (areaId: string) => boolean
  incrementPlayTime: (delta: number) => void
  setLastSaveTimestamp: (ts: number) => void
  reset: () => void
}

const initialState: PlayerMetaState = {
  knowledge: 0,
  traits: [],
  badges: [],
  discoveredAreas: [],
  playTime: 0,
  lastSaveTimestamp: null,
}

const usePlayerStore = create<PlayerMetaState & PlayerMetaActions>()((set, get) => ({
  ...initialState,

  addKnowledge: (amount, source) =>
    set((state) => {
      const total = state.knowledge + amount
      EventBus.emit(GameEvents.PLAYER_KNOWLEDGE_CHANGED, { amount, source, total })
      return { knowledge: Math.max(0, total) }
    }),

  setKnowledge: (knowledge) => set({ knowledge }),

  addTrait: (traitId) =>
    set((state) => {
      if (state.traits.includes(traitId)) return state
      EventBus.emit(GameEvents.PLAYER_TRAIT_UNLOCKED, { traitId })
      return { traits: [...state.traits, traitId] }
    }),

  addBadge: (badgeId) =>
    set((state) => {
      if (state.badges.includes(badgeId)) return state
      EventBus.emit(GameEvents.PLAYER_BADGE_EARNED, { badgeId })
      return { badges: [...state.badges, badgeId] }
    }),

  discoverArea: (areaId) =>
    set((state) => {
      if (state.discoveredAreas.includes(areaId)) return state
      EventBus.emit(GameEvents.AREA_DISCOVERED, { areaId })
      return { discoveredAreas: [...state.discoveredAreas, areaId] }
    }),

  hasTrait: (traitId) => get().traits.includes(traitId),
  hasBadge: (badgeId) => get().badges.includes(badgeId),
  hasDiscoveredArea: (areaId) => get().discoveredAreas.includes(areaId),

  incrementPlayTime: (delta) =>
    set((state) => ({ playTime: state.playTime + delta })),

  setLastSaveTimestamp: (timestamp) => set({ lastSaveTimestamp: timestamp }),

  reset: () => set(initialState),
}))

export { usePlayerStore }
export type { PlayerMetaState, PlayerMetaActions }
