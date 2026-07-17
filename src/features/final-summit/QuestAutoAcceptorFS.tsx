'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { FS_QUEST_ID, buildFSQuest } from '@/data/final-summit/fs-quest'

export function QuestAutoAcceptorFS() {
  const acceptedRef = useRef(false)

  useEffect(() => {
    QuestManager.registerQuest(buildFSQuest())
  }, [])

  useFrame(() => {
    if (acceptedRef.current) return
    const player = useGameStore.getState().player
    if (!player) return
    const z = player.position[2]
    if (z < -290) {
      const quest = QuestManager.getQuest(FS_QUEST_ID)
      if (quest && quest.status === 'available') {
        const accepted = QuestManager.acceptQuest(FS_QUEST_ID)
        if (accepted) {
          acceptedRef.current = true
          soundFX.playQuestAccept()
          const notif = useNotificationStore.getState()
          notif.addNotification('quest', 'The Summit', 'Reflect on each monument. Then approach the pedestal.')
        }
      }
    }
  })

  return null
}
