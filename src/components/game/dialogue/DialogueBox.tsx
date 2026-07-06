'use client'

import { useEffect } from 'react'
import { useDialogueEngine } from '@/systems/dialogue/DialogueEngine'
import { soundFX } from '@/systems/audio/SoundFX'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'

export function DialogueBox() {
  const {
    isOpen,
    currentNode,
    isTyping,
    displayedText,
    advance,
    selectChoice,
    skip,
    close,
  } = useDialogueEngine()

  useEffect(() => {
    if (!isOpen) return

    soundFX.playDialogueOpen()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        advance()
      }
      if (e.code === 'Escape') {
        e.preventDefault()
        close()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, advance, close])

  if (!isOpen || !currentNode) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center pb-8 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[700px] mx-4">
        <GlassPanel padding="lg" rounded="xl" glow="blue" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 border border-white/10 flex items-center justify-center text-sm">
              {currentNode.portrait ? (
                <img src={currentNode.portrait} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-neon-blue">◆</span>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-white/90">{currentNode.speaker}</div>
              <div className="text-[10px] text-white/40">{isTyping ? 'typing...' : ''}</div>
            </div>

            <div className="flex-1" />

            <button
              onClick={skip}
              className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
              title="Skip dialogue"
            >
              Skip »
            </button>
          </div>

          <div className="min-h-[60px]">
            <p className="text-sm text-white/80 leading-relaxed">
              {displayedText}
              {isTyping && <span className="animate-pulse text-neon-blue">▌</span>}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            {currentNode.choices && currentNode.choices.length > 0 ? (
              <div className="flex flex-wrap gap-2 flex-1">
                {currentNode.choices.map((choice, i) => (
                  <GlassButton
                    key={i}
                    size="sm"
                    variant="primary"
                    onClick={() => selectChoice(choice.nextNodeId)}
                  >
                    {choice.text}
                  </GlassButton>
                ))}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {(!currentNode.choices || currentNode.choices.length === 0) && (
              <GlassButton size="sm" variant="default" onClick={advance}>
                {isTyping ? 'Show All' : currentNode.nextNodeId ? 'Continue' : 'End'}
              </GlassButton>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
