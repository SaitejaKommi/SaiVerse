export function linear(t: number): number {
  return t
}

export function easeInQuad(t: number): number {
  return t * t
}

export function easeOutQuad(t: number): number {
  return t * (2 - t)
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export function easeInCubic(t: number): number {
  return t * t * t
}

export function easeOutCubic(t: number): number {
  return --t * t * t + 1
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function easeOutElastic(t: number): number {
  const p = 0.3
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1
}
