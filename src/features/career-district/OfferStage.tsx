'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlayerStore } from '@/stores/playerStore'
import { useQuestStore } from '@/stores/questStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { CD_QUEST_ID } from '@/data/career-district/cd-quest'
import { OFFER_STAGE_POSITION } from '@/data/career-district/cd-layout'

type AnalysisPhase = 'idle' | 'scanning' | 'analyzing' | 'complete'

const CHAPTER_QUEST_IDS = ['quest-first-step', 'quest-first-lesson', 'quest-software-project', 'quest-ai-exploration', 'quest-open-source-valley', 'quest-hackathon-arena']
const CHAPTER_TITLES = ['Campus', 'Software City', 'Bengaluru Hub', 'AI District', 'Open Source Valley', 'Hackathon Arena']

export function OfferStage() {
  const [phase, setPhase] = useState<AnalysisPhase>('idle')
  const [hovered, setHovered] = useState(false)
  const [done, setDone] = useState(false)
  const analysisRef = useRef(0)
  const scanLineRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null)
  const notif = useNotificationStore()

  const completedQuestIds = useQuestStore((s) => s.completedQuestIds)
  const knowledge = usePlayerStore((s) => s.knowledge)
  const badges = usePlayerStore((s) => s.badges)
  const traits = usePlayerStore((s) => s.traits)

  const stats = useMemo(() => {
    const completedChapters = CHAPTER_QUEST_IDS.filter((qid) => completedQuestIds.includes(qid)).length
    const totalKnowledge = knowledge
    const totalBadges = badges.length
    const totalTraits = traits.length
    return { completedChapters, totalKnowledge, totalBadges, totalTraits }
  }, [completedQuestIds, knowledge, badges, traits])

  const cdQuest = useQuestStore((s) => s.quests[CD_QUEST_ID])

  const needsInterview = useMemo(() => {
    const obj = cdQuest?.objectives.find((o) => o.id === 'obj-interview')
    return obj && obj.current < obj.count
  }, [cdQuest])

  const handleActivate = useCallback(() => {
    if (phase !== 'idle' || done) return
    if (needsInterview) {
      notif.addNotification('system', 'Interview Required', 'Complete at least one recruiter interview first.')
      return
    }
    soundFX.playQuestAccept()
    setPhase('scanning')
    analysisRef.current = 0
    scanLineRef.current = 0
  }, [phase, done, needsInterview, notif])

  useFrame((state, delta) => {
    if (phase === 'scanning') {
      scanLineRef.current += delta * 0.4
      if (scanLineRef.current >= 1) {
        scanLineRef.current = 0
        analysisRef.current++
        const chapterIdx = analysisRef.current - 1
        if (chapterIdx < 6) {
          notif.addNotification('quest', 'Portfolio Analysis', `Scanning: ${CHAPTER_TITLES[chapterIdx]}...`)
          soundFX.playUIBeep(600 + chapterIdx * 80, 0.1, 0.08)
        }
      }
      if (analysisRef.current >= 7) {
        setPhase('analyzing')
        setTimeout(() => {
          setPhase('complete')
          setDone(true)
          QuestManager.completeObjective(CD_QUEST_ID, 'obj-offer')
          soundFX.playBadgeEarned()
          setTimeout(() => soundFX.playBadgeEarned(), 400)
          notif.addNotification('quest', 'Offer Letter', 'The portfolio analysis is complete. Your offer has been extended.')
        }, 2000)
      }
    }
  })

  const offerTexture = useMemo(() => {
    if (phase !== 'complete') return null
    const c = document.createElement('canvas'); c.width = 512; c.height = 256
    const ctx = c.getContext('2d')!
    
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 512, 256)
    
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2
    ctx.roundRect(10, 10, 492, 236, 12); ctx.stroke()
    
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('OFFER OF ENGAGEMENT', 256, 35)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px monospace'
    ctx.fillText(`To: Sai — Builder, Developer, Creator`, 256, 65)
    ctx.fillText(`Chapters Completed: ${stats.completedChapters} / 6`, 256, 90)
    ctx.fillText(`Knowledge Score: ${stats.totalKnowledge} XP`, 256, 110)
    ctx.fillText(`Badges Earned: ${stats.totalBadges}`, 256, 130)
    ctx.fillText(`Traits Recognized: ${stats.totalTraits}`, 256, 150)
    
    ctx.fillStyle = '#888899'
    ctx.font = '10px monospace'
    ctx.fillText('Based on your demonstrated mastery of software engineering,', 256, 180)
    ctx.fillText('community contribution, and ability to perform under pressure,', 256, 195)
    ctx.fillText('we are thrilled to extend this offer.', 256, 210)
    
    ctx.fillStyle = '#00ff88'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('POSITION: FULLSTACK SOFTWARE ENGINEER', 256, 240)
    
    return new THREE.CanvasTexture(c)
  }, [phase, stats])

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 24
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#a855f7'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('OFFER STAGE', 128, 12)
    return new THREE.CanvasTexture(c)
  }, [])

  const scanTexture = useMemo(() => {
    if (phase !== 'scanning' && phase !== 'analyzing') return null
    const c = document.createElement('canvas'); c.width = 256; c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(0, 0, 256, 128)
    ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const label = phase === 'scanning' ? 'SCANNING PORTFOLIO...' : 'ANALYZING TRAJECTORY...'
    ctx.fillText(label, 128, 64)
    return new THREE.CanvasTexture(c)
  }, [phase])

  return (
    <group ref={groupRef} position={OFFER_STAGE_POSITION}>
      {/* Stage platform */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Stage ring glow */}
      <mesh position={[0, 0.01, 0]}>
        <ringGeometry args={[1.1, 1.3, 24]} />
        <meshBasicMaterial color={phase === 'complete' ? '#ffd700' : '#a855f7'} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Central pedestal */}
      <mesh
        position={[0, 0.3, 0]}
        onClick={handleActivate}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.25, 0.3, 0.5, 8]} />
        <meshStandardMaterial
          color={phase === 'complete' ? '#ffd700' : '#2a2a4a'}
          metalness={0.7}
          roughness={0.2}
          emissive={phase === 'complete' ? '#ffd700' : '#a855f7'}
          emissiveIntensity={phase === 'complete' ? 0.3 : hovered ? 0.2 : 0.05}
        />
      </mesh>

      {/* Holographic display */}
      {offerTexture && (
        <sprite position={[0, 1.0, 0]} scale={[2.5, 1.3, 1]}>
          <spriteMaterial map={offerTexture} transparent depthTest={false} />
        </sprite>
      )}
      {scanTexture && (
        <sprite position={[0, 0.8, 0]} scale={[2.0, 0.8, 1]} renderOrder={1}>
          <spriteMaterial map={scanTexture} transparent depthTest={false} />
        </sprite>
      )}

      <sprite position={[0, -0.3, 1.2]} scale={[1.0, 0.1, 1]}>
        <spriteMaterial map={labelTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}
