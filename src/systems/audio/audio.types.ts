export type AudioChannel = 'master' | 'music' | 'sfx' | 'voice'

export type AudioTrackType = 'music' | 'sfx' | 'voice' | 'ambient'

export interface AudioTrack {
  id: string
  type: AudioTrackType
  buffer?: AudioBuffer
  source?: AudioBufferSourceNode
  gain: number
  loop: boolean
  isPlaying: boolean
  channel: AudioChannel
}

export interface AudioConfig {
  poolSize: number
  maxConcurrent: number
  defaultFadeDuration: number
  spatialModel: 'HRTF' | 'equalpower' | 'inverse'
}

export type SpatialAudioConfig = {
  position: [number, number, number]
  maxDistance: number
  refDistance: number
  rolloffFactor: number
  coneInnerAngle?: number
  coneOuterAngle?: number
  coneOuterGain?: number
}
