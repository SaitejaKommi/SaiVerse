import type { InputCallback } from './input.types'
import { MOUSE } from '@/constants/controls'

export class MouseManager {
  #isLocked = false
  #deltaX = 0
  #deltaY = 0
  #prevX = 0
  #prevY = 0
  #clientX = 0
  #clientY = 0
  #scrollDelta = 0
  #sensitivity: number
  #invertY: boolean
  #callback: InputCallback | null = null
  #handleMouseMove: (e: MouseEvent) => void
  #handlePointerLockChange: () => void
  #handleScroll: (e: WheelEvent) => void

  constructor() {
    this.#sensitivity = MOUSE.SENSITIVITY
    this.#invertY = MOUSE.INVERT_Y

    this.#handleMouseMove = (e: MouseEvent) => {
      this.#clientX = e.clientX
      this.#clientY = e.clientY

      if (this.#isLocked) {
        this.#deltaX += e.movementX
        this.#deltaY += e.movementY
      } else {
        this.#deltaX += e.clientX - this.#prevX
        this.#deltaY += e.clientY - this.#prevY
      }
      this.#prevX = e.clientX
      this.#prevY = e.clientY
    }

    this.#handlePointerLockChange = () => {
      this.#isLocked = document.pointerLockElement !== null
    }

    this.#handleScroll = (e: WheelEvent) => {
      this.#scrollDelta += e.deltaY
      this.#callback?.({
        type: 'scroll',
        value: e.deltaY,
        timestamp: performance.now(),
      })
    }
  }

  attach(element: HTMLElement = document.body): void {
    document.addEventListener('mousemove', this.#handleMouseMove)
    document.addEventListener('pointerlockchange', this.#handlePointerLockChange)
    element.addEventListener('wheel', this.#handleScroll, { passive: true })
  }

  detach(): void {
    document.removeEventListener('mousemove', this.#handleMouseMove)
    document.removeEventListener('pointerlockchange', this.#handlePointerLockChange)
    document.removeEventListener('wheel', this.#handleScroll)
    this.exitLock()
    this.#deltaX = 0
    this.#deltaY = 0
    this.#scrollDelta = 0
  }

  setCallback(callback: InputCallback): void {
    this.#callback = callback
  }

  setSensitivity(value: number): void {
    this.#sensitivity = value
  }

  setInvertY(value: boolean): void {
    this.#invertY = value
  }

  requestLock(): void {
    document.body.requestPointerLock()
  }

  exitLock(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  get isLocked(): boolean {
    return this.#isLocked
  }

  getPosition(): { x: number; y: number } {
    return { x: this.#clientX, y: this.#clientY }
  }

  consumeFrame(): { x: number; y: number } {
    const dx = this.#deltaX * this.#sensitivity
    const dy = this.#deltaY * this.#sensitivity * (this.#invertY ? -1 : 1)
    this.#deltaX = 0
    this.#deltaY = 0
    return { x: dx, y: dy }
  }

  consumeScroll(): number {
    const value = this.#scrollDelta
    this.#scrollDelta = 0
    return value
  }
}
