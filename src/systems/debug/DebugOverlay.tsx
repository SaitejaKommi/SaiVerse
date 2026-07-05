'use client'

import { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { FPSMonitor } from '@/lib/perf/FPSMonitor'
import { MemoryMonitor } from '@/lib/perf/MemoryMonitor'
import { useGameStore } from '@/stores/gameStore'


export function DebugOverlay() {
  const [visible, setVisible] = useState(false)

  const fpsRef = useRef(new FPSMonitor())
  const memRef = useRef(new MemoryMonitor())

  const [fps, setFps] = useState(0)
  const [minFps, setMinFps] = useState(0)
  const [maxFps, setMaxFps] = useState(0)
  const [frameTime, setFrameTime] = useState(0)
  const [memoryMB, setMemoryMB] = useState(0)
  const [drawCalls, setDrawCalls] = useState(0)
  const [triangles, setTriangles] = useState(0)
  const [playerState, setPlayerState] = useState('')
  const [position, setPosition] = useState('')
  const [isGrounded, setIsGrounded] = useState(false)
  const sampleCounter = useRef(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') {
        setVisible((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    ;(window as any).__toggleDebug = () => setVisible((v) => !v)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      delete (window as any).__toggleDebug
    }
  }, [])

  useFrame((state, delta) => {
    if (!visible) return

    const dt = Math.min(delta, 1 / 30)
    fpsRef.current.tick(dt)
    sampleCounter.current++

    if (sampleCounter.current % 10 === 0) {
      memRef.current.sample()
      setMemoryMB(memRef.current.currentMB)
    }

    if (sampleCounter.current % 5 === 0) {
      setFps(fpsRef.current.fps)
      setMinFps(fpsRef.current.minFps)
      setMaxFps(fpsRef.current.maxFps)
      setFrameTime(fpsRef.current.frameTime)

      const info = state.gl.info
      setDrawCalls(info.render?.calls ?? 0)
      setTriangles(info.render?.triangles ?? 0)

      const player = useGameStore.getState().player
      setPlayerState(player.state)
      setPosition(`${player.position[0].toFixed(1)}, ${player.position[1].toFixed(1)}, ${player.position[2].toFixed(1)}`)
      setIsGrounded(player.isGrounded)
    }
  })

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed left-2 top-2 z-50 font-mono text-xs text-green-400">
      <div className="rounded bg-black/80 p-2">
        <div className="mb-1 font-bold text-yellow-400">SaiVerse Debug</div>
        <div>FPS: {fps} (min: {minFps}, max: {maxFps})</div>
        <div>Frame: {frameTime.toFixed(1)}ms</div>
        <div>Draw: {drawCalls} | Tris: {triangles.toLocaleString()}</div>
        <div>Memory: {memoryMB}MB</div>
        <div>State: {playerState} | Grounded: {isGrounded ? 'Y' : 'N'}</div>
        <div>Pos: ({position})</div>
      </div>
    </div>
  )
}
