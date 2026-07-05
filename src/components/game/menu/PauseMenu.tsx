'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'
import { NeonText } from '@/components/ui/NeonText'
import { clsx } from 'clsx'

type MenuTab = 'main' | 'settings' | 'controls' | 'audio' | 'graphics'

function Slider({ label, value, min, max, step, onChange }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/60">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 appearance-none bg-white/10 rounded-full cursor-pointer accent-cyan-400
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,212,255,0.5)]"
      />
    </div>
  )
}

function Toggle({ label, enabled, onChange }: {
  label: string
  enabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={clsx(
          'relative w-9 h-5 rounded-full transition-colors duration-200',
          enabled ? 'bg-cyan-500' : 'bg-white/20',
        )}
      >
        <span className={clsx(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200',
          enabled && 'translate-x-4',
        )} />
      </button>
    </div>
  )
}

export function PauseMenu() {
  const [tab, setTab] = useState<MenuTab>('main')
  const setPaused = useGameStore((s) => s.setPaused)

  const resume = useCallback(() => setPaused(false), [setPaused])

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
  const subtitles = useSettingsStore((s) => s.accessibility.subtitles)
  const highContrast = useSettingsStore((s) => s.accessibility.highContrast)
  const reducedMotion = useSettingsStore((s) => s.accessibility.reducedMotion)
  const setSubtitles = useSettingsStore((s) => s.setSubtitles)
  const setHighContrast = useSettingsStore((s) => s.setHighContrast)
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <NeonText color="blue" size="lg">Settings</NeonText>
        <GlassButton size="sm" variant="default" onClick={onBack}>← Back</GlassButton>
      </div>
      <div className="space-y-3 pt-2 border-t border-white/10">
        <NeonText color="cyan" size="sm">Accessibility</NeonText>
        <Toggle label="Subtitles" enabled={subtitles} onChange={setSubtitles} />
        <Toggle label="High Contrast" enabled={highContrast} onChange={setHighContrast} />
        <Toggle label="Reduced Motion" enabled={reducedMotion} onChange={setReducedMotion} />
      </div>
    </div>
  )
}

function ControlsPanel({ onBack }: { onBack: () => void }) {
  const sensitivity = useSettingsStore((s) => s.controls.sensitivity)
  const invertY = useSettingsStore((s) => s.controls.invertY)
  const setControls = useSettingsStore((s) => s.setControls)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <NeonText color="blue" size="lg">Controls</NeonText>
        <GlassButton size="sm" variant="default" onClick={onBack}>← Back</GlassButton>
      </div>
      <div className="space-y-3 pt-2 border-t border-white/10">
        <Slider
          label="Mouse Sensitivity"
          value={sensitivity}
          min={0.1}
          max={2}
          step={0.05}
          onChange={(v) => setControls({ sensitivity: v })}
        />
        <Toggle label="Invert Y-Axis" enabled={invertY} onChange={(v) => setControls({ invertY: v })} />
      </div>
      <div className="space-y-1.5 text-xs text-white/60 pt-2 border-t border-white/10">
        <div className="flex justify-between"><span>Move</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">W A S D</kbd></div>
        <div className="flex justify-between"><span>Sprint</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Shift</kbd></div>
        <div className="flex justify-between"><span>Jump</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Space</kbd></div>
        <div className="flex justify-between"><span>Interact</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">E</kbd></div>
        <div className="flex justify-between"><span>Pause</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd></div>
      </div>
    </div>
  )
}

function AudioPanel({ onBack }: { onBack: () => void }) {
  const audio = useSettingsStore((s) => s.audio)
  const setAudio = useSettingsStore((s) => s.setAudio)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <NeonText color="blue" size="lg">Audio</NeonText>
        <GlassButton size="sm" variant="default" onClick={onBack}>← Back</GlassButton>
      </div>
      <div className="space-y-3 pt-2 border-t border-white/10">
        <Slider label="Master Volume" value={audio.master} min={0} max={1} step={0.05} onChange={(v) => setAudio({ master: v })} />
        <Slider label="Music" value={audio.music} min={0} max={1} step={0.05} onChange={(v) => setAudio({ music: v })} />
        <Slider label="SFX" value={audio.sfx} min={0} max={1} step={0.05} onChange={(v) => setAudio({ sfx: v })} />
        <Slider label="Voice" value={audio.voice} min={0} max={1} step={0.05} onChange={(v) => setAudio({ voice: v })} />
        <Toggle label="Mute All" enabled={audio.muted} onChange={(v) => setAudio({ muted: v })} />
      </div>
    </div>
  )
}

function GraphicsPanel({ onBack }: { onBack: () => void }) {
  const graphics = useSettingsStore((s) => s.graphics)
  const setGraphics = useSettingsStore((s) => s.setGraphics)

  const qualities = ['low', 'medium', 'high', 'ultra'] as const

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <NeonText color="blue" size="lg">Graphics</NeonText>
        <GlassButton size="sm" variant="default" onClick={onBack}>← Back</GlassButton>
      </div>
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="space-y-1">
          <span className="text-xs text-white/60">Quality Preset</span>
          <div className="grid grid-cols-4 gap-1">
            {qualities.map((q) => (
              <button
                key={q}
                onClick={() => setGraphics({ quality: q })}
                className={clsx(
                  'px-2 py-1 text-[11px] rounded capitalize transition-all',
                  graphics.quality === q
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10',
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <Toggle label="Shadows" enabled={graphics.shadows} onChange={(v) => setGraphics({ shadows: v })} />
        <Toggle label="Post-Processing" enabled={graphics.postProcessing} onChange={(v) => setGraphics({ postProcessing: v })} />
      </div>
    </div>
  )
}
