'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { QuestManager } from '@/systems/quest/QuestManager'
import { soundFX } from '@/systems/audio/SoundFX'
import { useNotificationStore } from '@/stores/notificationStore'
import { CD_QUEST_ID, buildCDQuest } from '@/data/career-district/cd-quest'

export function QuestAutoAcceptorCD() {
  const acceptedRef = useRef(false)
  const registeredRef = useRef(false)

  useEffect(() => {
    if (registeredRef.current) return
    registeredRef.current = true
    QuestManager.registerQuest(buildCDQuest())
  }, [])

  useFrame(() => {
    if (acceptedRef.current) return
    const player = useGameStore.getState().player
    if (!player) return
    const x = player.position[0]
    if (x > 55) {
      const quest = QuestManager.getQuest(CD_QUEST_ID)
      if (quest && quest.status === 'available') {
        const accepted = QuestManager.acceptQuest(CD_QUEST_ID)
        if (accepted) {
          acceptedRef.current = true
          soundFX.playQuestAccept()
          const notif = useNotificationStore.getState()
          notif.addNotification('quest', 'Career Fair', 'Showcase your journey and claim your offer.')
        }
      }
    }
  })

  return null
}
