class SoundFXSingleton {
  #context: AudioContext | null = null
  #ambientNodes: AudioNode[] = []
  #isAmbientPlaying = false
  #pendingCalls: Array<() => void> = []

  private getContext(): AudioContext | null {
    if (!this.#context) {
      try {
        this.#context = new AudioContext()
      } catch {
        return null
      }
    }
    if (this.#context.state === 'suspended') {
      this.#context.resume().catch(() => {/* autoplay blocked */})
    }
    if (this.#context.state === 'suspended') return null
    return this.#context
  }

  resumeOnInteraction(): void {
    if (this.#context?.state === 'suspended') {
      const handler = async () => {
        try {
          await this.#context?.resume()
          const pending = this.#pendingCalls.splice(0)
          pending.forEach((fn) => fn())
        } catch {
          /* still blocked */
        }
        document.removeEventListener('click', handler)
        document.removeEventListener('keydown', handler)
        document.removeEventListener('touchstart', handler)
      }
      document.addEventListener('click', handler, { once: true })
      document.addEventListener('keydown', handler, { once: true })
      document.addEventListener('touchstart', handler, { once: true })
    }
  }

  private safePlay(fn: (ctx: AudioContext) => void): void {
    const ctx = this.getContext()
    if (ctx) {
      fn(ctx)
    } else if (this.#context) {
      this.#pendingCalls.push(() => fn(this.#context!))
    }
  }

  playUIBeep(freq = 600, duration = 0.08, volume = 0.15): void {
    this.safePlay((ctx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    })
  }

  playDialogueOpen(): void {
    this.playUIBeep(400, 0.15, 0.12)
    setTimeout(() => this.playUIBeep(600, 0.1, 0.1), 100)
  }

  playQuestAccept(): void {
    this.safePlay((ctx) => {
      const notes = [523, 659, 784]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.25)
      })
    })
  }

  playQuestComplete(): void {
    this.safePlay((ctx) => {
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 0.4)
      })
    })
  }

  playBadgeEarned(): void {
    this.safePlay((ctx) => {
      const notes = [784, 988, 1175, 1319]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + 0.3)
      })
    })
  }

  playKnowledgeGain(): void {
    this.safePlay((ctx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    })
  }

  playFootstep(): void {
    this.safePlay((ctx) => {
      const bufferSize = Math.floor(ctx.sampleRate * 0.05)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(300, ctx.currentTime)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start(ctx.currentTime)
    })
  }

  startAmbient(): void {
    if (this.#isAmbientPlaying) return
    this.#isAmbientPlaying = true
    this.#playWindLoop()
  }

  stopAmbient(): void {
    this.#isAmbientPlaying = false
    this.#ambientNodes.forEach((n) => {
      try { n.disconnect() } catch { /* ignore */ }
    })
    this.#ambientNodes = []
  }

  #playWindLoop(): void {
    if (!this.#isAmbientPlaying) return
    const ctx = this.getContext()
    if (!ctx) return

    const bufferSize = Math.floor(ctx.sampleRate * 4)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(200, ctx.currentTime)
    filter.Q.setValueAtTime(0.5, ctx.currentTime)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.04, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    this.#ambientNodes = [source, filter, gain]
    source.start(ctx.currentTime)
    source.onended = () => {
      if (this.#isAmbientPlaying) this.#playWindLoop()
    }
  }

  dispose(): void {
    this.stopAmbient()
    if (this.#context) {
      this.#context.close()
      this.#context = null
    }
  }
}

export const soundFX = new SoundFXSingleton()
