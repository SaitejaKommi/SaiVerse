import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  SettingsData,
  AudioSettings,
  GraphicsSettings,
  ControlSettings,
} from '@/types/game'

interface SettingsActions {
  setAudio: (data: Partial<AudioSettings>) => void
  setGraphics: (data: Partial<GraphicsSettings>) => void
  setControls: (data: Partial<ControlSettings>) => void
  setSubtitles: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  setReducedMotion: (enabled: boolean) => void
  reset: () => void
}

const defaultSettings: SettingsData = {
  audio: {
    master: 0.8,
    music: 0.7,
    sfx: 0.8,
    voice: 0.8,
    muted: false,
  },
  graphics: {
    quality: 'high',
    shadows: true,
    postProcessing: true,
    pixelRatio: 0,
    shadowResolution: 2048,
  },
  controls: {
    sensitivity: 1,
    invertY: false,
    keyBindings: {},
  },
  accessibility: {
    subtitles: true,
    highContrast: false,
    reducedMotion: false,
  },
}

const useSettingsStore = create<SettingsData & SettingsActions>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setAudio: (data) =>
        set((state) => ({
          audio: { ...state.audio, ...data },
        })),

      setGraphics: (data) =>
        set((state) => ({
          graphics: { ...state.graphics, ...data },
        })),

      setControls: (data) =>
        set((state) => ({
          controls: { ...state.controls, ...data },
        })),

      setSubtitles: (subtitles) =>
        set((state) => ({
          accessibility: { ...state.accessibility, subtitles },
        })),

      setHighContrast: (highContrast) =>
        set((state) => ({
          accessibility: { ...state.accessibility, highContrast },
        })),

      setReducedMotion: (reducedMotion) =>
        set((state) => ({
          accessibility: { ...state.accessibility, reducedMotion },
        })),

      reset: () => set(defaultSettings),
    }),
    {
      name: 'saiverse-settings',
      partialize: (state) => ({
        audio: state.audio,
        graphics: state.graphics,
        controls: state.controls,
        accessibility: state.accessibility,
      }),
    },
  ),
)

export { useSettingsStore }
export type { SettingsActions }
