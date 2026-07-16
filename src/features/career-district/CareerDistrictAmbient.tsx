'use client'

import { useEffect, useRef } from 'react'

export function CareerDistrictAmbient() {
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
        const hum = Math.sin(t * 60) * 0.04
        const ambientChatter = Math.sin(t * 3 + Math.sin(t * 0.5) * 5) * 0.02
        const softReverb = Math.sin(t * 0.8) * 0.06
        data[i] = (hum + ambientChatter + softReverb) * 0.3
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.01, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2)

      source.connect(gain)
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
