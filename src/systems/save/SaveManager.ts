import { useSaveStore } from '@/stores/saveStore'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useQuestStore } from '@/stores/questStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

export interface SaveDataV1 {
  version: 1
  player: {
    position: [number, number, number]
    rotation: [number, number, number]
    state: string
    knowledge: number
    traits: string[]
    badges: string[]
    discoveredAreas: string[]
    playTime: number
  }
  world: {
    timeOfDay: number
    weather: string
    currentDistrict: string | null
    unlockedDistricts: string[]
  }
  quests: {
    accepted: string[]
    completed: string[]
    failed: string[]
  }
  inventory: Array<{
    id: string
    category: string
    quantity: number
  }>
  settings: Record<string, unknown>
  timestamp: number
}

export type SaveData = SaveDataV1

const SAVE_VERSION = 1
const STORAGE_KEY = 'saiverse-save'

function generateId(): string {
  return `save-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const SaveManager = {
  save(slotId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const id = slotId ?? generateId()
        const gameState = useGameStore.getState()
        const playerMeta = usePlayerStore.getState()
        const questState = useQuestStore.getState()
        const invState = useInventoryStore.getState()
        const settingsState = useSettingsStore.getState()

        const payload: SaveDataV1 = {
          version: SAVE_VERSION,
          player: {
            position: gameState.player.position,
            rotation: gameState.player.rotation,
            state: gameState.player.state,
            knowledge: playerMeta.knowledge,
            traits: playerMeta.traits,
            badges: playerMeta.badges,
            discoveredAreas: playerMeta.discoveredAreas,
            playTime: playerMeta.playTime,
          },
          world: {
            timeOfDay: gameState.world.timeOfDay,
            weather: gameState.world.weather,
            currentDistrict: gameState.world.currentDistrict,
            unlockedDistricts: [],
          },
          quests: {
            accepted: questState.activeQuestIds,
            completed: questState.completedQuestIds,
            failed: questState.failedQuestIds,
          },
          inventory: Object.values(invState.items).map((item) => ({
            id: item.id,
            category: item.category,
            quantity: item.quantity,
          })),
          settings: settingsState as unknown as Record<string, unknown>,
          timestamp: Date.now(),
        }

        localStorage.setItem(`${STORAGE_KEY}-${id}`, JSON.stringify(payload))

        const saveStore = useSaveStore.getState()
        const existing = saveStore.slots.find((s) => s.id === id)
        const meta = {
          id,
          timestamp: Date.now(),
          playTime: playerMeta.playTime,
          districtName: gameState.world.currentDistrict ?? undefined,
          version: SAVE_VERSION,
        }

        if (existing) {
          saveStore.updateSlot(id, meta)
        } else {
          saveStore.addSlot(meta)
        }

        saveStore.setActiveSlot(id)
        usePlayerStore.getState().setLastSaveTimestamp(Date.now())

        EventBus.emit(GameEvents.SAVE_COMPLETED, { slotId: id })
        resolve(id)
      } catch (err) {
        reject(err)
      }
    })
  },

  load(slotId: string): Promise<SaveDataV1> {
    return new Promise((resolve, reject) => {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEY}-${slotId}`)
        if (!raw) throw new Error(`Save slot ${slotId} not found`)

        const data: SaveDataV1 = JSON.parse(raw)

        useGameStore.getState().setPlayer({ position: data.player.position, state: data.player.state as any })
        usePlayerStore.getState().setKnowledge(data.player.knowledge)

        for (const area of data.player.discoveredAreas) {
          usePlayerStore.getState().discoverArea(area)
        }
        for (const badge of data.player.badges) {
          usePlayerStore.getState().addBadge(badge)
        }
        for (const trait of data.player.traits) {
          usePlayerStore.getState().addTrait(trait)
        }

        useSaveStore.getState().setActiveSlot(slotId)
        EventBus.emit(GameEvents.LOAD_COMPLETED, { slotId })
        resolve(data)
      } catch (err) {
        reject(err)
      }
    })
  },

  delete(slotId: string): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem(`${STORAGE_KEY}-${slotId}`)
      useSaveStore.getState().removeSlot(slotId)
      resolve()
    })
  },

  listSlots() {
    return useSaveStore.getState().slots
  },

  getSlotCount() {
    return useSaveStore.getState().slots.length
  },

  migrateIfNeeded(): void {
    for (const slot of useSaveStore.getState().slots) {
      if (slot.version < SAVE_VERSION) {
        console.warn(`[SaveManager] Slot ${slot.id} v${slot.version} needs migration to v${SAVE_VERSION}`)
      }
    }
  },
}
