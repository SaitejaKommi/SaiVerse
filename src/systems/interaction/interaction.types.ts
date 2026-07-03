export type InteractionType =
  | 'talk'
  | 'examine'
  | 'collect'
  | 'activate'
  | 'read'
  | 'use'
  | 'enter'

export interface InteractableDef {
  id: string
  type: InteractionType
  label: string
  position: [number, number, number]
  radius: number
  isActive: boolean
  isInteractable: boolean
  data?: Record<string, unknown>
}

export interface InteractionState {
  nearestObject: InteractableDef | null
  isInteracting: boolean
  activeInteractionId: string | null
}
