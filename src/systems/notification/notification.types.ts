export type NotificationType = 'knowledge' | 'quest' | 'badge' | 'trait' | 'discovery' | 'item' | 'system'

export interface NotificationDef {
  id: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  duration: number
  createdAt: number
}

export interface NotificationState {
  queue: NotificationDef[]
  maxVisible: number
}
