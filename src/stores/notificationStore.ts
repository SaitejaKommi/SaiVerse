import { create } from 'zustand'
import type { NotificationDef, NotificationType, NotificationState } from '@/systems/notification/notification.types'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

const MAX_VISIBLE = 5
const DEFAULT_DURATION = 4000

interface NotificationActions {
  addNotification: (type: NotificationType, title: string, message: string, icon?: string, duration?: number) => void
  removeNotification: (id: string) => void
  clearAll: () => void
  reset: () => void
}

let _counter = 0
function uid() {
  return `notif-${++_counter}`
}

const initialState: NotificationState = {
  queue: [],
  maxVisible: MAX_VISIBLE,
}

const useNotificationStore = create<NotificationState & NotificationActions>()((set) => ({
  ...initialState,

  addNotification: (type, title, message, icon, duration = DEFAULT_DURATION) => {
    const id = uid()
    const notif: NotificationDef = { id, type, title, message, icon, duration, createdAt: Date.now() }

    set((state) => {
      const queue = [...state.queue, notif]
      if (queue.length > MAX_VISIBLE) queue.shift()
      return { queue: [...queue] }
    })

    EventBus.emit(GameEvents.NOTIFICATION_ADDED, { id, title, message, icon, duration })

    if (duration > 0) {
      setTimeout(() => {
        const state = useNotificationStore.getState()
        state.removeNotification(id)
      }, duration)
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      queue: state.queue.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ queue: [] }),

  reset: () => set(initialState),
}))

export { useNotificationStore }
export type { NotificationActions }
