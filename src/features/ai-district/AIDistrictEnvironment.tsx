'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useLightingStore } from '@/stores/lightingStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { Building } from '@/systems/environment/Building'
import { Tree } from '@/systems/environment/Tree'
import { StreetLamp } from '@/systems/environment/StreetLamp'
import { PhoneBooth } from '@/systems/environment/PhoneBooth'
import { BusStop } from '@/systems/environment/BusStop'
import { Hologram } from '@/systems/environment/Hologram'
import { ServerRack } from '@/systems/environment/ServerRack'
import { DigitalDisplay } from '@/systems/environment/DigitalDisplay'
import { Water } from '@/systems/environment/Water'
import { NeonStrip } from '@/systems/environment/NeonStrip'
import { RoadSystem } from '@/systems/world/RoadSystem'
import { DataTerminal } from '@/features/ai-district/DataTerminal'
import { TrainingConsole } from '@/features/ai-district/TrainingConsole'
import { PromptLab } from '@/features/ai-district/PromptLab'
import { NeuralCore } from '@/features/ai-district/NeuralCore'
import { AI_QUEST_ID, buildAIQuest } from '@/data/ai-district/ai-quest'
import {
  AI_BUILDINGS,
  AI_TREES,
  AI_LAMPS,
  AI_PHONE_BOOTHS,
  AI_BUS_STOPS,
  AI_ROADS,
} from '@/data/ai-district/ai-layout'

function DistrictAmbientAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let stopped = false
    const init = async () => {
      const ctx = new AudioContext()
      ctxRef.current = ctx
      if (ctx.state === 'suspended') await ctx.resume()

      const bufferSize = Math.floor(ctx.sampleRate * 4)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate
        const low = Math.sin(t * 40) * 0.2
        const med = Math.sin(t * 180) * 0.15
        const pulse = Math.sin(t * 0.5) * 0.5 + 0.5
        const high = Math.sin(t * 600 + pulse * 200) * 0.04
        data[i] = (low + med + high) * 0.3
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 300
      filter.Q.value = 0.3

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.012, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2)

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()

      if (stopped) { source.stop(); await ctx.close() }
    }

    init()
    return () => {
      stopped = true
      if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null }
    }
  }, [])

  return null
}

function DistrictNeonSign({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  const texture = new THREE.CanvasTexture((() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 96
    const ctx = c.getContext('2d')!
    ctx.shadowColor = color
    ctx.shadowBlur = 20
    ctx.fillStyle = color
    ctx.font = 'bold 36px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 256, 48)
    return c
  })())

  return (
    <mesh position={position}>
      <planeGeometry args={[3, 0.6]} />
      <meshBasicMaterial map={texture} transparent opacity={0.8} depthTest={false} />
    </mesh>
  )
}

// Auto-accept quest when player enters the district
function QuestAutoAcceptor() {
  const acceptedRef = useRef(false)

  useEffect(() => {
    QuestManager.registerQuest(buildAIQuest())
  }, [])

  useFrame(() => {
    if (acceptedRef.current) return
    const player = useGameStore.getState().player
    if (!player) return
    const z = player.position[2]
    if (z < -330) {
      const quest = QuestManager.getQuest(AI_QUEST_ID)
      if (quest && quest.status === 'available') {
        const accepted = QuestManager.acceptQuest(AI_QUEST_ID)
        if (accepted) {
          acceptedRef.current = true
          soundFX.playQuestAccept()
          const notif = useNotificationStore.getState()
          notif.addNotification('quest', 'Quest Started', 'The AI Exploration — Discover, experiment, witness')
        }
      }
    }
  })

  return null
}

export function AIDistrictEnvironment() {
  useEffect(() => {
    useLightingStore.getState().setProfile('ai-district')
  }, [])

  return (
    <group>
      <QuestAutoAcceptor />
      <DistrictAmbientAudio />

      {/* Buildings */}
      {AI_BUILDINGS.map((b, i) => (
        <Building key={`ai-building-${i}`} position={b.position} width={b.width} depth={b.depth} height={b.height} color={b.color} roofColor={b.roofColor} windowsColor={b.windowsColor} style={b.style} />
      ))}

      {/* Trees */}
      {AI_TREES.map((t, i) => (
        <Tree key={`ai-tree-${i}`} position={t.position} variant={t.variant ?? (i % 3)} scale={t.scale ?? 1} />
      ))}

      {/* Lamps */}
      {AI_LAMPS.map((l, i) => (
        <StreetLamp key={`ai-lamp-${i}`} position={l.position} />
      ))}

      {/* Phone booths */}
      {AI_PHONE_BOOTHS.map((p, i) => (
        <PhoneBooth key={`ai-phone-${i}`} position={p.position} rotation={p.rotation ?? 0} color="#0a1628" accentColor="#a855f7" />
      ))}

      {/* Bus stops */}
      {AI_BUS_STOPS.map((s, i) => (
        <BusStop key={`ai-bus-${i}`} position={s.position} rotation={s.rotation ?? 0} color="#0a1628" accentColor="#00d4ff" />
      ))}

      {/* Holographic data visualizations */}
      <Hologram position={[-12, 0, -370]} color="#00d4ff" shape="sphere" scale={0.8} />
      <Hologram position={[12, 0, -370]} color="#a855f7" shape="torus" scale={0.9} />
      <Hologram position={[0, 0, -350]} color="#00ff88" shape="cube" scale={0.7} />

      {/* Server racks */}
      <ServerRack position={[-25, 0, -370]} rotation={Math.PI / 2} />
      <ServerRack position={[-26.5, 0, -370]} rotation={Math.PI / 2} />
      <ServerRack position={[25, 0, -370]} rotation={-Math.PI / 2} />
      <ServerRack position={[26.5, 0, -370]} rotation={-Math.PI / 2} />

      {/* Diagnostic displays */}
      <DigitalDisplay position={[-30, 1.8, -358]} rotation={[0, 0, 0]} color="#00d4ff" width={0.6} height={0.4} intensity={0.5} />
      <DigitalDisplay position={[30, 1.8, -358]} rotation={[0, 0, 0]} color="#00ff88" width={0.6} height={0.4} intensity={0.5} flicker />
      <DigitalDisplay position={[0, 2, -393]} rotation={[0, 0, 0]} color="#a855f7" width={0.8} height={0.5} intensity={0.4} />

      {/* Roads */}
      <RoadSystem segments={AI_ROADS as any} />

      {/* Reflective water surface around AI district */}
      <Water
        position={[0, -0.08, -370]}
        size={[100, 120]}
        color='#0a2a4a'
        opacity={0.55}
      />

      {/* Neon strips along building edges and roads */}
      <NeonStrip position={[-18, 0.5, -360]} length={12} color="#a855f7" rotation={[0, 0, 0]} pulseSpeed={1.2} />
      <NeonStrip position={[18, 0.5, -360]} length={12} color="#00d4ff" rotation={[0, 0, 0]} pulseSpeed={0.8} />
      <NeonStrip position={[0, 0.5, -385]} length={20} color="#a855f7" rotation={[Math.PI / 2, 0, 0]} pulseSpeed={1.5} />
      <NeonStrip position={[-35, 0.5, -370]} length={16} color="#00d4ff" rotation={[0, 0, Math.PI / 2]} pulseSpeed={0.6} />

      {/* Neon signs */}
      <DistrictNeonSign position={[0, 8, -370]} text="AI RESEARCH DISTRICT" color="#a855f7" />
      <DistrictNeonSign position={[-30, 3.8, -358]} text="DATA LAB" color="#00d4ff" />
      <DistrictNeonSign position={[30, 3.8, -358]} text="TRAINING" color="#00ff88" />
      <DistrictNeonSign position={[0, 3.2, -393]} text="PROMPT LAB" color="#a855f7" />

      {/* Interactive stations */}
      <DataTerminal />
      <TrainingConsole />
      <PromptLab />
      <NeuralCore />
    </group>
  )
}
