import { useInteractionSystem } from '@/systems/interaction/InteractionSystem'
import { useDialogueStore } from '@/stores/dialogueStore'
import { GlassPanel } from '@/components/ui/GlassPanel'

export function InteractionPrompt() {
  let nearest: ReturnType<typeof useInteractionSystem>['nearestObject'] = null
  let isInteracting = false
  let isDialogueOpen = false

  try {
    const ctx = useInteractionSystem()
    nearest = ctx.nearestObject
    isInteracting = ctx.isInteracting
    isDialogueOpen = useDialogueStore.getState().isOpen
  } catch {
    return null
  }

  if (!nearest || isInteracting || isDialogueOpen) return null

  const labels: Record<string, string> = {
    talk: 'Talk',
    examine: 'Examine',
    collect: 'Collect',
    activate: 'Activate',
    read: 'Read',
    use: 'Use',
    enter: 'Enter',
  }

  const action = labels[nearest.type] ?? 'Interact'

  return (
    <div className="fixed bottom-3 left-3 z-[60] animate-float">
      <GlassPanel padding="md" rounded="xl" glow="blue" className="flex items-center gap-3">
        <kbd className="px-2 py-1 text-xs font-mono bg-white/10 rounded border border-white/20 text-white/80">
          E
        </kbd>
        <span className="text-sm text-white/90">{action} {nearest.label}</span>
      </GlassPanel>
    </div>
  )
}
