'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useHackathonStore } from './HackathonStore'
import { useQuestStore } from '@/stores/questStore'
import { HA_QUEST_ID } from '@/data/hackathon-arena/ha-quest'
import { pickBossEvents, type BossEventDef } from '@/data/hackathon-arena/ha-boss-events'

export function BossEventSystem() {
  const eventsRef = useRef<BossEventDef[]>([])
  const assignedRef = useRef<Record<string, string[]>>({})
  const triggeredRef = useRef<Set<string>>(new Set())
  const sprintEventIdxRef = useRef<Record<string, number>>({})

  useEffect(() => {
    eventsRef.current = pickBossEvents()
    const events = eventsRef.current
    const sprints = ['sprint-1', 'sprint-2', 'sprint-3']
    const assigned: Record<string, string[]> = {}

    // Distribute events across sprints (at most 2 per sprint, at least 1)
    let eventIdx = 0
    for (const sprint of sprints) {
      const count = sprint === 'sprint-1' ? 1 : events.length > 2 ? 2 : 1
      assigned[sprint] = []
      for (let i = 0; i < Math.min(count, events.length - eventIdx); i++) {
        assigned[sprint].push(events[eventIdx]!.id)
        eventIdx++
      }
    }
    assignedRef.current = assigned
  }, [])

  useFrame(() => {
    const store = useHackathonStore.getState()
    const phase = store.phase
    const currentProgress = store.sprintProgress
    const activeSetback = store.activeSetback

    if (phase !== 'sprint-1' && phase !== 'sprint-2' && phase !== 'sprint-3') return

    // Check if quest is completed (all objectives done)
    const quest = useQuestStore.getState().quests[HA_QUEST_ID]
    if (quest?.status === 'completed') {
      if (activeSetback) {
        store.setActiveSetback(null)
      }
      return
    }

    const sprintEvents = assignedRef.current[phase] ?? []

    // Track which event index we're on for this sprint
    if (sprintEventIdxRef.current[phase] === undefined) {
      sprintEventIdxRef.current[phase] = 0
    }

    const currentIdx = sprintEventIdxRef.current[phase]!

    // All events for this sprint have been resolved
    if (currentIdx >= sprintEvents.length) return

    // Don't trigger if already handling a setback
    if (activeSetback) return

    // Trigger event when progress crosses 40% and we have events left
    const eventId = sprintEvents[currentIdx]
    if (eventId && currentProgress >= 0.4 && !triggeredRef.current.has(eventId)) {
      triggeredRef.current.add(eventId)
      const eventDef = eventsRef.current.find((e) => e.id === eventId)
      if (eventDef) {
        store.setActiveSetback({
          eventId: eventId,
          name: eventDef.name,
          description: eventDef.description,
          station: eventDef.station,
          severity: eventDef.severity,
        })
        store.modifyTeamEnergy(-eventDef.severity * 10)
      }
    }

    // Detect resolution (setback cleared by DebugStation)
    if (!store.activeSetback && eventId && triggeredRef.current.has(eventId)) {
      sprintEventIdxRef.current[phase] = currentIdx + 1
    }
  })

  return null
}
