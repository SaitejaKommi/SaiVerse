'use client'

import { create } from 'zustand'

export type ArenaPhase = 'waiting' | 'sprint-1' | 'sprint-2' | 'sprint-3' | 'presentation' | 'complete'
export type SetbackStation = 'code' | 'debug' | null

export interface ActiveSetback {
  eventId: string
  name: string
  description: string
  station: 'code' | 'debug'
  severity: 1 | 2
}

interface HackathonState {
  phase: ArenaPhase
  timeRemaining: number
  teamEnergy: number
  sprintProgress: number
  activeSetback: ActiveSetback | null
  sprint1Done: boolean
  sprint2Done: boolean
  sprint3Done: boolean
  presentationDone: boolean
  totalSetbacksResolved: number
  musicState: 'normal' | 'pressure' | 'panic' | 'silence' | 'victory'
}

interface HackathonActions {
  setPhase: (phase: ArenaPhase) => void
  setTimeRemaining: (t: number) => void
  setTeamEnergy: (e: number) => void
  modifyTeamEnergy: (delta: number) => void
  setSprintProgress: (p: number) => void
  setActiveSetback: (s: ActiveSetback | null) => void
  setSprint1Done: (d: boolean) => void
  setSprint2Done: (d: boolean) => void
  setSprint3Done: (d: boolean) => void
  setPresentationDone: (d: boolean) => void
  incrementSetbacksResolved: () => void
  setMusicState: (s: HackathonState['musicState']) => void
  reset: () => void
}

const INITIAL: HackathonState = {
  phase: 'waiting',
  timeRemaining: 120,
  teamEnergy: 100,
  sprintProgress: 0,
  activeSetback: null,
  sprint1Done: false,
  sprint2Done: false,
  sprint3Done: false,
  presentationDone: false,
  totalSetbacksResolved: 0,
  musicState: 'normal',
}

export const useHackathonStore = create<HackathonState & HackathonActions>((set) => ({
  ...INITIAL,
  setPhase: (phase) => set({ phase }),
  setTimeRemaining: (t) => set({ timeRemaining: t }),
  setTeamEnergy: (e) => set({ teamEnergy: Math.max(0, Math.min(100, e)) }),
  modifyTeamEnergy: (delta) => set((s) => ({ teamEnergy: Math.max(0, Math.min(100, s.teamEnergy + delta)) })),
  setSprintProgress: (p) => set({ sprintProgress: p }),
  setActiveSetback: (s) => set({ activeSetback: s }),
  setSprint1Done: (d) => set({ sprint1Done: d }),
  setSprint2Done: (d) => set({ sprint2Done: d }),
  setSprint3Done: (d) => set({ sprint3Done: d }),
  setPresentationDone: (d) => set({ presentationDone: d }),
  incrementSetbacksResolved: () => set((s) => ({ totalSetbacksResolved: s.totalSetbacksResolved + 1 })),
  setMusicState: (m) => set({ musicState: m }),
  reset: () => set(INITIAL),
}))
