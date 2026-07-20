import { create } from 'zustand'
import type { DistrictProfileId } from '@/systems/lighting/lighting-profiles'
import { DEFAULT_PROFILE } from '@/systems/lighting/lighting-profiles.config'

interface LightingStore {
  activeProfile: DistrictProfileId
  setProfile: (profile: DistrictProfileId) => void
}

export const useLightingStore = create<LightingStore>((set) => ({
  activeProfile: DEFAULT_PROFILE,
  setProfile: (profile) => set({ activeProfile: profile }),
}))
