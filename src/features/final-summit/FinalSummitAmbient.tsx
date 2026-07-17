'use client'

import { useEffect, useRef } from 'react'

export function FinalSummitAmbient() {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let stopped = false
    const init = async () => {
      const ctx = new AudioContext()
      ctxRef.current = ctx
      if (ctx.state === 'suspended') await ctx.resume()

      const bufferSize = Math.floor(ctx.sampleRate * 6)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate
        const wind = Math.sin(t * 0.3 + Math.sin(t * 0.07) * 4) * 0.06
        const lowPad = Math.sin(t * 55) * 0.03
        const shimmer = Math.sin(t * 200 + Math.sin(t * 0.5) * 10) * 0.015
        data[i] = (wind + lowPad + shimmer) * 0.25
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.01, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 3)

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
