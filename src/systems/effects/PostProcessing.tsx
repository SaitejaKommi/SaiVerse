'use client'

import { useEffect, useState, type ReactElement } from 'react'
import { EffectComposer, Bloom, ToneMapping, Vignette, DepthOfField } from '@react-three/postprocessing'

interface PostProcessingProps {
  bloomIntensity?: number
  bloomThreshold?: number
  bloomRadius?: number
  vignetteOffset?: number
  vignetteDarkness?: number
  depthOfField?: boolean
  dofFocusDistance?: number
  dofFocalLength?: number
  dofBokehScale?: number
}

export function PostProcessing({
  bloomIntensity = 0.8,
  bloomThreshold = 0.1,
  bloomRadius = 0.3,
  vignetteOffset = 0.3,
  vignetteDarkness = 0.5,
  depthOfField = false,
  dofFocusDistance = 0,
  dofFocalLength = 0.1,
  dofBokehScale = 1,
}: PostProcessingProps) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const handler = () => {
      setEnabled(!document.hidden)
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  if (!enabled) return null

  const effects: ReactElement[] = [
    <Bloom
      key="bloom"
      intensity={bloomIntensity}
      luminanceThreshold={bloomThreshold}
      luminanceSmoothing={bloomRadius}
      mipmapBlur
    />,
    <ToneMapping key="tone" mode={3} resolution={256} />,
  ]

  if (depthOfField) {
    effects.push(
      <DepthOfField
        key="dof"
        focusDistance={dofFocusDistance}
        focalLength={dofFocalLength}
        bokehScale={dofBokehScale}
      />
    )
  }

  effects.push(
    <Vignette key="vignette" offset={vignetteOffset} darkness={vignetteDarkness} />
  )

  return (
    <EffectComposer multisampling={4}>
      {effects}
    </EffectComposer>
  )
}
