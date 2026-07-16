'use client'

import { create } from 'zustand'

export type CarryItemType = 'seed' | 'watering-can' | 'plank' | 'book' | null

interface CarryState {
  carrying: CarryItemType
  setCarrying: (item: CarryItemType) => void
}

export const useCarryStore = create<CarryState>((set) => ({
  carrying: null,
  setCarrying: (item) => set({ carrying: item }),
}))
