import type { SceneID } from '@/types/game'

export interface SceneObject {
  id: SceneID
  name: string
  priority: number
  isActive: boolean
}

export type SceneTransitionState = 'none' | 'entering' | 'active' | 'exiting'

export interface SceneTransition {
  from: SceneID | null
  to: SceneID | null
  state: SceneTransitionState
  progress: number
  duration: number
}

export interface SceneEvents {
  onSceneActivated?: (id: SceneID) => void
  onSceneDeactivated?: (id: SceneID) => void
  onTransitionStart?: (from: SceneID | null, to: SceneID | null) => void
  onTransitionEnd?: (from: SceneID | null, to: SceneID | null) => void
}

export const DEFAULT_TRANSITION_DURATION = 1
