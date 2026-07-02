import { AUDIO_CONFIG } from './audio.config'
import type { AudioChannel, AudioTrackType } from './audio.types'
import { useSettingsStore } from '@/stores/settingsStore'

interface TrackEntry {
  id: string
  type: AudioTrackType
  buffer: AudioBuffer
  source: AudioBufferSourceNode | null
  gainNode: GainNode
  channel: AudioChannel
  gain: number
  loop: boolean
  isPlaying: boolean
}

class AudioManagerSingleton {
  #context: AudioContext | null = null
  #masterGain: GainNode | null = null
  #channelGains: Map<AudioChannel, GainNode> = new Map()
  #tracks: Map<string, TrackEntry> = new Map()
  #isInitialized = false

  async init(): Promise<void> {
    if (this.#isInitialized) return

    try {
      this.#context = new AudioContext()
      this.#masterGain = this.#context.createGain()
      this.#masterGain.connect(this.#context.destination)

      const channels: AudioChannel[] = ['master', 'music', 'sfx', 'voice']
      for (const channel of channels) {
        const gainNode = this.#context.createGain()
        gainNode.connect(this.#masterGain!)
        this.#channelGains.set(channel, gainNode)
      }

      this.#syncVolumes()
      this.#subscribeToSettings()

      this.#isInitialized = true
    } catch (error) {
      console.error('[AudioManager] Failed to initialize:', error)
    }
  }

  async resume(): Promise<void> {
    if (this.#context?.state === 'suspended') {
      await this.#context.resume()
    }
  }

  async loadTrack(id: string, url: string, type: AudioTrackType, loop = false): Promise<void> {
    if (!this.#context) return

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.#context.decodeAudioData(arrayBuffer)

      const gainNode = this.#context.createGain()
      gainNode.gain.value = 1

      const entry: TrackEntry = {
        id,
        type,
        buffer: audioBuffer,
        source: null,
        gainNode,
        channel: type === 'music' ? 'music' : type === 'voice' ? 'voice' : 'sfx',
        gain: 1,
        loop,
        isPlaying: false,
      }

      this.#tracks.set(id, entry)
    } catch (error) {
      console.error(`[AudioManager] Failed to load track ${id}:`, error)
    }
  }

  play(id: string, fadeIn = false): void {
    const track = this.#tracks.get(id)
    if (!track || !this.#context) return

    if (track.isPlaying) return

    const source = this.#context.createBufferSource()
    source.buffer = track.buffer
    source.loop = track.loop

    const channelGain = this.#channelGains.get(track.channel)
    if (!channelGain) return

    source.connect(track.gainNode)
    track.gainNode.connect(channelGain)

    if (fadeIn) {
      track.gainNode.gain.setValueAtTime(0, this.#context.currentTime)
      track.gainNode.gain.linearRampToValueAtTime(
        track.gain,
        this.#context.currentTime + AUDIO_CONFIG.DEFAULT_FADE_DURATION,
      )
    } else {
      track.gainNode.gain.setValueAtTime(track.gain, this.#context.currentTime)
    }

    source.start(0)

    track.source = source
    track.isPlaying = true
  }

  stop(id: string): void {
    const track = this.#tracks.get(id)
    if (!track?.source || !track.isPlaying) return

    try {
      track.source.stop()
    } catch {
      // already stopped
    }

    track.source.disconnect()
    track.gainNode.disconnect()
    track.source = null
    track.isPlaying = false
  }

  stopAll(): void {
    for (const [id] of this.#tracks) {
      this.stop(id)
    }
  }

  setVolume(channel: AudioChannel, value: number): void {
    const gainNode = this.#channelGains.get(channel)
    if (!gainNode) return

    const clampedValue = Math.max(0, Math.min(1, value))
    gainNode.gain.value = clampedValue
  }

  setTrackVolume(id: string, value: number): void {
    const track = this.#tracks.get(id)
    if (!track) return

    track.gain = Math.max(0, Math.min(1, value))
    track.gainNode.gain.value = track.gain
  }

  isPlaying(id: string): boolean {
    return this.#tracks.get(id)?.isPlaying ?? false
  }

  hasTrack(id: string): boolean {
    return this.#tracks.has(id)
  }

  #syncVolumes(): void {
    const settings = useSettingsStore.getState().audio
    this.setVolume('master', settings.muted ? 0 : settings.master)
    this.setVolume('music', settings.music)
    this.setVolume('sfx', settings.sfx)
    this.setVolume('voice', settings.voice)
  }

  #subscribeToSettings(): void {
    useSettingsStore.subscribe((state) => {
      const audio = state.audio
      this.setVolume('master', audio.muted ? 0 : audio.master)
      this.setVolume('music', audio.music)
      this.setVolume('sfx', audio.sfx)
      this.setVolume('voice', audio.voice)
    })
  }

  dispose(): void {
    this.stopAll()
    this.#tracks.clear()

    if (this.#context) {
      this.#context.close()
      this.#context = null
    }

    this.#channelGains.clear()
    this.#masterGain = null
    this.#isInitialized = false
  }
}

export const audioManager = new AudioManagerSingleton()
