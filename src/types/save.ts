export interface SaveSlotMeta {
  id: string
  timestamp: number
  playTime: number
  screenshot?: string
  districtName?: string
  version: number
}

export interface SavePayload {
  player: {
    position: [number, number, number]
    rotation: [number, number, number]
    state: string
  }
  world: {
    timeOfDay: number
    weather: string
    currentDistrict: string | null
  }
  settings?: Record<string, unknown>
  version: number
}

export interface SaveManagerInterface {
  save(slotId: string): Promise<void>
  load(slotId: string): Promise<SavePayload>
  delete(slotId: string): Promise<void>
  listSlots(): Promise<SaveSlotMeta[]>
  getSlotCount(): number
}
