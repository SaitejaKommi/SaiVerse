import { create } from 'zustand'
import type { PlayerData, WorldData, GameState, SceneID, FinalePhase } from '@/types/game'

interface GameActions {
  setPlayer: (data: Partial<PlayerData>) => void
  setWorld: (data: Partial<WorldData>) => void
  setPaused: (paused: boolean) => void
  setInitialized: (initialized: boolean) => void
  setCinematic: (cinematic: boolean) => void
  setFinalePhase: (phase: FinalePhase) => void
  addActiveScene: (sceneId: SceneID) => void
  removeActiveScene: (sceneId: SceneID) => void
  setCurrentDistrict: (district: string | null) => void
  setWeather: (weather: WorldData['weather']) => void
  setTimeOfDay: (time: number) => void
  discoverLocation: (location: string) => void
  unlockWaypoint: (waypoint: string) => void
  setWeatherIntensity: (intensity: number) => void
  setWindStrength: (strength: number) => void
  reset: () => void
}

const initialPlayer: PlayerData = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  velocity: [0, 0, 0],
  state: 'idle',
  isGrounded: false,
}

const initialWorld: WorldData = {
  timeOfDay: 12,
  dayProgress: 0.5,
  weather: 'clear',
  currentDistrict: null,
  activeScenes: [],
  discoveredLocations: [],
  activeWaypoints: [],
  weatherIntensity: 0,
  windStrength: 0,
}

const initialGame: GameState = {
  player: initialPlayer,
  world: initialWorld,
  isPaused: false,
  isInitialized: false,
  isCinematic: false,
  finalePhase: 'idle',
}

const useGameStore = create<GameState & GameActions>()((set) => ({
  ...initialGame,

  setPlayer: (data) =>
    set((state) => ({
      player: { ...state.player, ...data },
    })),

  setWorld: (data) =>
    set((state) => ({
      world: { ...state.world, ...data },
    })),

  setPaused: (paused) => set({ isPaused: paused }),

  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setCinematic: (cinematic) => set({ isCinematic: cinematic }),
  setFinalePhase: (finalePhase) => set({ finalePhase }),

  addActiveScene: (sceneId) =>
    set((state) => {
      if (state.world.activeScenes.includes(sceneId)) return state
      return {
        world: {
          ...state.world,
          activeScenes: [...state.world.activeScenes, sceneId],
        },
      }
    }),

  removeActiveScene: (sceneId) =>
    set((state) => ({
      world: {
        ...state.world,
        activeScenes: state.world.activeScenes.filter((id) => id !== sceneId),
      },
    })),

  setCurrentDistrict: (district) =>
    set((state) => ({
      world: { ...state.world, currentDistrict: district },
    })),

  setWeather: (weather) =>
    set((state) => ({
      world: { ...state.world, weather },
    })),

  setTimeOfDay: (timeOfDay) =>
    set((state) => ({
      world: { ...state.world, timeOfDay, dayProgress: timeOfDay / 24 },
    })),

  discoverLocation: (location) =>
    set((state) => {
      if (state.world.discoveredLocations.includes(location)) return state
      return {
        world: {
          ...state.world,
          discoveredLocations: [...state.world.discoveredLocations, location],
        },
      }
    }),

  unlockWaypoint: (waypoint) =>
    set((state) => {
      if (state.world.activeWaypoints.includes(waypoint)) return state
      return {
        world: {
          ...state.world,
          activeWaypoints: [...state.world.activeWaypoints, waypoint],
        },
      }
    }),

  setWeatherIntensity: (weatherIntensity) =>
    set((state) => ({
      world: { ...state.world, weatherIntensity },
    })),

  setWindStrength: (windStrength) =>
    set((state) => ({
      world: { ...state.world, windStrength },
    })),

  reset: () => set(initialGame),
}))

export { useGameStore }
export type { GameActions }
