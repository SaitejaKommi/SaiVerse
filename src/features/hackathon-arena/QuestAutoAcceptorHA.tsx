'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { HA_QUEST_ID, buildHAQuest } from '@/data/hackathon-arena/ha-quest'

export function QuestAutoAcceptorHA() {
  const acceptedRef = useRef(false)

  useEffect(() => {
    QuestManager.registerQuest(buildHAQuest())
  }, [])

  useFrame(() => {
    if (acceptedRef.current) return
    const player = useGameStore.getState().player
    if (!player) return
    const z = player.position[2]
    if (z < -615) {
      const quest = QuestManager.getQuest(HA_QUEST_ID)
      if (quest && quest.status === 'available') {
        const accepted = QuestManager.acceptQuest(HA_QUEST_ID)
        if (accepted) {
          acceptedRef.current = true
          soundFX.playQuestAccept()
          const notif = useNotificationStore.getState()
          notif.addNotification('quest', 'ARENA CHALLENGE', 'Hackathon begins in 3... 2... 1...')
        }
      }
    }
  })

  return null
}
