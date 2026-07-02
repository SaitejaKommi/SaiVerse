import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function noop(): void {
  // intentional no-op
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
