'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useQuestStore } from '@/stores/questStore'
import { OSV_QUEST_ID } from '@/data/open-source-valley/osv-quest'
import { STATION_POSITIONS } from '@/data/open-source-valley/osv-layout'

const ISSUES = [
  { label: 'Cultivate Community Garden', id: 'obj-cultivate-garden' },
  { label: 'Build Pull Request Bridge', id: 'obj-build-bridge' },
  { label: 'Restock Knowledge Archive', id: 'obj-restock-archive' },
]

export function IssueBoard() {
  const quest = useQuestStore((s) => s.quests[OSV_QUEST_ID])

  const texture = useMemo(() => {
    const objectives = quest?.objectives ?? []
    const c = document.createElement('canvas')
    c.width = 512; c.height = 350
    const ctx = c.getContext('2d')!

    ctx.fillStyle = '#2a1f14'
    ctx.roundRect(4, 4, 504, 342, 8)
    ctx.fill()

    ctx.strokeStyle = '#8a5e32'
    ctx.lineWidth = 2
    ctx.roundRect(4, 4, 504, 342, 8)
    ctx.stroke()

    ctx.fillStyle = '#d4a373'
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('COMMUNITY ISSUE BOARD', 256, 30)

    ISSUES.forEach((issue, i) => {
      const obj = objectives.find((o) => o.id === issue.id)
      const done = obj ? obj.current : 0
      const total = obj ? obj.count : 1
      const completed = done >= total

      const y = 75 + i * 90

      ctx.fillStyle = completed ? '#283618' : '#3a2a1a'
      ctx.roundRect(30, y - 25, 452, 60, 6)
      ctx.fill()

      if (completed) {
        ctx.fillStyle = '#00ff88'
      } else {
        ctx.strokeStyle = '#d4a373'
        ctx.lineWidth = 1
        ctx.roundRect(30, y - 25, 452, 60, 6)
        ctx.stroke()
      }

      ctx.font = '12px monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = completed ? '#606c38' : '#fefae0'
      ctx.fillText(`${completed ? '[DONE] ' : '[OPEN] '}${issue.label}`, 45, y - 5)

      ctx.fillStyle = completed ? '#606c38' : '#e9c46a'
      ctx.font = '11px monospace'
      ctx.fillText(`Progress: ${Math.min(done, total)} / ${total}`, 45, y + 18)
    })

    ctx.fillStyle = '#5c4a32'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('— pick an issue and lend a hand —', 256, 332)

    return new THREE.CanvasTexture(c)
  }, [quest])

  return (
    <mesh position={[STATION_POSITIONS.issueBoard[0], 1.2, STATION_POSITIONS.issueBoard[2]]}>
      <planeGeometry args={[2.2, 1.5]} />
      <meshStandardMaterial map={texture} transparent depthTest={false} />
    </mesh>
  )
}
