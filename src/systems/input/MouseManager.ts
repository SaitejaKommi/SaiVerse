import type { InputCallback } from './input.types'
import { MOUSE } from '@/constants/controls'

export class MouseManager {
  #deltaX = 0
  #deltaY = 0
  #prevX = 0
  #prevY = 0
  #clientX = 0
  #clientY = 0
  #scrollDelta = 0
  #sensitivity: number
  #invertY: boolean
  #leftDown = false
  #rightDown = false
  #middleDown = false
  #callback: InputCallback | null = null
  #handleMouseMove: (e: MouseEvent) => void
  #handleMouseDown: (e: MouseEvent) => void
  #handleMouseUp: (e: MouseEvent) => void
  #handleScroll: (e: WheelEvent) => void

  constructor() {
    this.#sensitivity = MOUSE.SENSITIVITY
    this.#invertY = MOUSE.INVERT_Y

    this.#handleMouseMove = (e: MouseEvent) => {
      this.#clientX = e.clientX
      this.#clientY = e.clientY
      this.#deltaX += e.clientX - this.#prevX
      this.#deltaY += e.clientY - this.#prevY
      this.#prevX = e.clientX
      this.#prevY = e.clientY
    }

    this.#handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) this.#leftDown = true
      if (e.button === 1) this.#middleDown = true
      if (e.button === 2) this.#rightDown = true
      this.#prevX = e.clientX
      this.#prevY = e.clientY
    }

    this.#handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) this.#leftDown = false
      if (e.button === 1) this.#middleDown = false
      if (e.button === 2) this.#rightDown = false
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
    document.addEventListener('mousedown', this.#handleMouseDown)
    document.addEventListener('mouseup', this.#handleMouseUp)
    element.addEventListener('wheel', this.#handleScroll, { passive: true })
    document.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  detach(): void {
    document.removeEventListener('mousemove', this.#handleMouseMove)
    document.removeEventListener('mousedown', this.#handleMouseDown)
    document.removeEventListener('mouseup', this.#handleMouseUp)
    document.removeEventListener('wheel', this.#handleScroll)
    this.#deltaX = 0
    this.#deltaY = 0
    this.#scrollDelta = 0
    this.#leftDown = false
    this.#rightDown = false
    this.#middleDown = false
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

  isLeftDown(): boolean {
    return this.#leftDown
  }

  isRightDown(): boolean {
    return this.#rightDown
  }

  isOrbiting(): boolean {
    return this.#leftDown || this.#rightDown
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
