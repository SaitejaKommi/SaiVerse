'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { OSV_QUEST_ID, buildOSVQuest } from '@/data/open-source-valley/osv-quest'

export function QuestAutoAcceptorOSV() {
  const acceptedRef = useRef(false)

  useEffect(() => {
    QuestManager.registerQuest(buildOSVQuest())
  }, [])

  useFrame(() => {
    if (acceptedRef.current) return
    const player = useGameStore.getState().player
    if (!player) return
    const z = player.position[2]
    if (z < -465) {
      const quest = QuestManager.getQuest(OSV_QUEST_ID)
      if (quest && quest.status === 'available') {
        const accepted = QuestManager.acceptQuest(OSV_QUEST_ID)
        if (accepted) {
          acceptedRef.current = true
          soundFX.playQuestAccept()
          const notif = useNotificationStore.getState()
          notif.addNotification('quest', 'Quest Started', 'Open Source Valley — Contribute to the community')
        }
      }
    }
  })

  return null
}
