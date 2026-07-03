'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'
import { NeonText } from '@/components/ui/NeonText'

type MenuTab = 'main' | 'settings' | 'controls' | 'audio' | 'graphics'

export function PauseMenu() {
  const [tab, setTab] = useState<MenuTab>('main')
  const setPaused = useGameStore((s) => s.setPaused)

  const resume = () => setPaused(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault()
        if (tab === 'main') resume()
        else setTab('main')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [tab, resume])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <GlassPanel padding="lg" rounded="xl" glow="blue" className="w-full max-w-[420px]">
        {tab === 'main' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <NeonText color="blue" size="2xl">Paused</NeonText>
              <div className="text-[11px] text-white/40 mt-1">SaiVerse</div>
            </div>

            <GlassButton size="lg" fullWidth variant="primary" onClick={resume}>
              Continue
            </GlassButton>
            <GlassButton size="md" fullWidth variant="default" onClick={() => setTab('settings')}>
              Settings
            </GlassButton>
            <GlassButton size="md" fullWidth variant="default" onClick={() => setTab('controls')}>
              Controls
            </GlassButton>
            <GlassButton size="md" fullWidth variant="default" onClick={() => setTab('audio')}>
              Audio
            </GlassButton>
            <GlassButton size="md" fullWidth variant="default" onClick={() => setTab('graphics')}>
              Graphics
            </GlassButton>
            <div className="pt-2 border-t border-white/10">
              <GlassButton size="md" fullWidth variant="danger" onClick={() => { window.location.href = '/' }}>
                Exit to Menu
              </GlassButton>
            </div>
          </div>
        )}

        {tab === 'settings' && <SettingsPanel onBack={() => setTab('main')} />}
        {tab === 'controls' && <ControlsPanel onBack={() => setTab('main')} />}
        {tab === 'audio' && <AudioPanel onBack={() => setTab('main')} />}
        {tab === 'graphics' && <GraphicsPanel onBack={() => setTab('main')} />}
      </GlassPanel>
    </div>
  )
}

function SettingsPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-3">
      <NeonText color="blue" size="lg">Settings</NeonText>
      <GlassButton size="sm" variant="default" onClick={onBack}>← Back</GlassButton>
    </div>
  )
}

function ControlsPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-3">
      <NeonText color="blue" size="lg">Controls</NeonText>
      <div className="space-y-1.5 text-xs text-white/60">
        <div className="flex justify-between"><span>Move</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">W A S D</kbd></div>
        <div className="flex justify-between"><span>Sprint</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Shift</kbd></div>
        <div className="flex justify-between"><span>Jump</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Space</kbd></div>
        <div className="flex justify-between"><span>Interact</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">E</kbd></div>
        <div className="flex justify-between"><span>Pause</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd></div>
      </div>
      <GlassButton size="sm" variant="default" onClick={onBack}>← Back</GlassButton>
    </div>
  )
}

function AudioPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-3">
      <NeonText color="blue" size="lg">Audio</NeonText>
      <GlassButton size="sm" variant="default" onClick={onBack}>← Back</GlassButton>
    </div>
  )
}

function GraphicsPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-3">
      <NeonText color="blue" size="lg">Graphics</NeonText>
      <GlassButton size="sm" variant="default" onClick={onBack}>← Back</GlassButton>
    </div>
  )
}
