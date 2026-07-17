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
import { INTERVIEW_POD_POSITIONS } from '@/data/career-district/cd-layout'

interface RecruiterDef {
  id: string
  title: string
  role: string
  askTraits: string[]
  askBadges: string[]
  askQuests: string[]
  lines: {
    greeting: string
    positive: string
    neutral: string
    negative: string
    outro: string
  }
  position: [number, number, number]
}

const RECRUITERS: RecruiterDef[] = [
  {
    id: 'recruiter-frontend',
    title: 'Frontend Architect',
    role: 'UI & Experience',
    askTraits: ['code-artisan', 'community-builder'],
    askBadges: ['chapter-1-complete', 'chapter-2-complete'],
    askQuests: ['quest-software-project', 'quest-first-lesson'],
    lines: {
      greeting: 'Welcome. I see you have experience building interfaces. Tell me about your approach.',
      positive: 'Your portfolio shows real craftsmanship. The Software City work is impressive. I think you would be a great fit.',
      neutral: 'You have some relevant experience. I appreciate your growth mindset.',
      negative: 'I see you are still early in your journey. Keep building — we will be watching.',
      outro: 'Our team will be in touch. For now, consider this fragment of an offer.',
    },
    position: INTERVIEW_POD_POSITIONS[0]!,
  },
  {
    id: 'recruiter-fullstack',
    title: 'Fullstack Lead',
    role: 'Systems & Scale',
    askTraits: ['open-source-advocate', 'resilience'],
    askBadges: ['open-source-contributor', 'chapter-5-complete'],
    askQuests: ['quest-open-source-valley', 'quest-hackathon-arena'],
    lines: {
      greeting: 'Full systems thinking. That is what we value. Show me what you have built end-to-end.',
      neutral: 'I can see you understand the full stack conceptually. Practical experience will come with time.',
      positive: 'The Open Source Valley contributions and your hackathon performance demonstrate real engineering depth.',
      negative: 'You need more exposure to production systems. Contribute to more open source.',
      outro: 'We could use someone with your range. Here is an offer fragment to prove it.',
    },
    position: INTERVIEW_POD_POSITIONS[1]!,
  },
  {
    id: 'recruiter-ai',
    title: 'ML Engineering Lead',
    role: 'AI & Intelligence',
    askTraits: ['ai-innovator', 'first-steps'],
    askBadges: ['chapter-3-complete', 'chapter-0-complete'],
    askQuests: ['quest-ai-exploration', 'quest-first-step'],
    lines: {
      greeting: 'AI is transforming everything. What is your experience with intelligent systems?',
      neutral: 'I see the foundations are there. The AI field moves fast — keep experimenting.',
      positive: 'Your work in the AI District shows genuine curiosity and technical skill. That is exactly what we need.',
      negative: 'AI is a complex domain. Focus on fundamentals first before specializing.',
      outro: 'Your potential in this space is clear. Take this offer fragment as a sign of interest.',
    },
    position: INTERVIEW_POD_POSITIONS[2]!,
  },
]

export function InterviewPod() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const traits = usePlayerStore((s) => s.traits)
  const badges = usePlayerStore((s) => s.badges)
  const completedQuestIds = useQuestStore((s) => s.completedQuestIds)

  const recruiterStates = useMemo(() => RECRUITERS.map((r) => {
    const matchedTraits = r.askTraits.filter((t) => traits.includes(t))
    const matchedBadges = r.askBadges.filter((b) => badges.includes(b))
    const matchedQuests = r.askQuests.filter((q) => completedQuestIds.includes(q))

    const matchCount = matchedTraits.length + matchedBadges.length + matchedQuests.length
    const totalPossible = r.askTraits.length + r.askBadges.length + r.askQuests.length
    const ratio = totalPossible > 0 ? matchCount / totalPossible : 0

    let response = r.lines.neutral
    if (ratio >= 0.6) response = r.lines.positive
    else if (ratio <= 0.2) response = r.lines.negative

    return { ...r, matchCount, totalPossible, ratio, response, matchedTraits, matchedBadges, matchedQuests }
  }), [traits, badges, completedQuestIds])

  const handleInterview = useCallback((index: number) => {
    const key = `interview-${index}`
    if (completedIds.has(key)) return

    setCompletedIds((prev) => new Set(prev).add(key))
    soundFX.playQuestAccept()

    const notif = useNotificationStore.getState()
    const r = recruiterStates[index]!
    notif.addNotification('quest', `Interview: ${r.role}`, r.response)

    if (r.ratio >= 0.4) {
      QuestManager.completeObjective(CD_QUEST_ID, 'obj-interview')
      notif.addNotification('quest', 'Offer Fragment', `You impressed the ${r.role} recruiter!`)
    }

    setTimeout(() => soundFX.playQuestComplete(), 600)
  }, [recruiterStates, completedIds])

  return (
    <group>
      {recruiterStates.map((r, i) => (
        <PodSingle key={r.id} recruiter={r} index={i} onInterview={handleInterview} done={completedIds.has(`interview-${i}`)} />
      ))}
    </group>
  )
}

function PodSingle({ recruiter, index, onInterview, done }: {
  recruiter: RecruiterDef & { matchCount: number; response: string; ratio: number }
  index: number
  onInterview: (index: number) => void
  done: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const podColor = done ? '#00ff88' : recruiter.ratio >= 0.6 ? '#4444ff' : recruiter.ratio <= 0.2 ? '#ff4444' : '#4488ff'

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 48
    const ctx = c.getContext('2d')!
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.roundRect(0, 0, 256, 48, 6); ctx.fill()
    ctx.fillStyle = podColor; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(recruiter.title, 128, 16)
    ctx.fillStyle = '#888899'; ctx.font = '9px monospace'
    ctx.fillText(recruiter.role, 128, 36)
    return new THREE.CanvasTexture(c)
  }, [recruiter, podColor])

  return (
    <group ref={groupRef} position={recruiter.position}>
      {/* Glass pod walls */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot, i) => (
        <mesh key={`wall-${i}`} position={[0, 0.6, 0]} rotation={[0, rot, 0]}>
          <planeGeometry args={[0.8, 1.2]} />
          <meshBasicMaterial color={podColor} transparent opacity={done ? 0.1 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}

      {/* Pod base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Recruiter hologram */}
      <HologramBob color={podColor} active={!done} />

      {/* Clickable interact zone */}
      <mesh
        position={[0, 0.5, 0.5]}
        onClick={() => onInterview(index)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <planeGeometry args={[0.6, 0.3]} />
        <meshBasicMaterial color={podColor} transparent opacity={hovered ? 0.3 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Name label */}
      <sprite position={[0, 1.2, 0]} scale={[1.0, 0.18, 1]}>
        <spriteMaterial map={labelTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}

function HologramBob({ color, active }: { color: string; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 1.2) * 0.08
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
  })

  return (
    <mesh ref={ref} position={[0, 0.5, 0]}>
      <capsuleGeometry args={[0.08, 0.15, 4, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={active ? 0.7 : 0.2}
      />
    </mesh>
  )
}
