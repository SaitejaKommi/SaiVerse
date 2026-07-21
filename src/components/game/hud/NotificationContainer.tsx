import { useNotificationStore } from '@/stores/notificationStore'

const typeIcons: Record<string, string> = {
  knowledge: '🧠',
  quest: '📜',
  badge: '🏅',
  trait: '⚡',
  discovery: '🗺',
  item: '📦',
  system: '⚙',
}

const typeColors: Record<string, string> = {
  knowledge: 'border-neon-blue/30',
  quest: 'border-neon-purple/30',
  badge: 'border-neon-pink/30',
  trait: 'border-neon-green/30',
  discovery: 'border-neon-cyan/30',
  item: 'border-neon-green/30',
  system: 'border-white/20',
}

export function NotificationContainer() {
  const queue = useNotificationStore((s) => s.queue)

  if (queue.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 min-w-[260px] max-w-[320px] pointer-events-none">
      {queue.map((notif) => (
        <div
          key={notif.id}
          className={`glass rounded-xl px-4 py-3 border ${typeColors[notif.type] ?? 'border-white/10'} animate-slide-in-right`}
        >
          <div className="flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">{typeIcons[notif.type] ?? '•'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-white/90 truncate">{notif.title}</div>
              <div className="text-[10px] text-white/50 mt-0.5 line-clamp-2">{notif.message}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
