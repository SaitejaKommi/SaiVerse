'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDialogueStore } from '@/stores/dialogueStore'
import { TYPING_SPEED_MS, TYPING_SPEED_FAST_MS } from './dialogue.types'

export function useDialogueEngine() {
  const {
    isOpen,
    currentNode,
    isTyping,
    displayedText,
    openDialogue,
    closeDialogue,
    goToNode,
    setDisplayedText,
    setIsTyping,
  } = useDialogueStore()

  const timerRef = useRef<ReturnType<typeof setInterval>>(null)
  const charIndexRef = useRef(0)

  const stopTyping = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsTyping(false)
  }, [setIsTyping])

  const startTyping = useCallback((text: string, fast = false) => {
    stopTyping()
    charIndexRef.current = 0
    setDisplayedText('')
    setIsTyping(true)

    const speed = fast ? TYPING_SPEED_FAST_MS : TYPING_SPEED_MS

    timerRef.current = setInterval(() => {
      charIndexRef.current++
      if (charIndexRef.current >= text.length) {
        setDisplayedText(text)
        stopTyping()
        return
      }
      setDisplayedText(text.slice(0, charIndexRef.current))
    }, speed)
  }, [stopTyping, setDisplayedText, setIsTyping])

  const advance = useCallback(() => {
    if (isTyping) {
      stopTyping()
      setDisplayedText(currentNode?.text ?? '')
      return
    }

    if (currentNode?.choices && currentNode.choices.length > 0) {
      return
    }

    if (currentNode?.nextNodeId) {
      goToNode(currentNode.nextNodeId)
    } else {
      closeDialogue()
    }
  }, [isTyping, currentNode, stopTyping, setDisplayedText, goToNode, closeDialogue])

  const selectChoice = useCallback((nextNodeId: string) => {
    goToNode(nextNodeId)
  }, [goToNode])

  const skip = useCallback(() => {
    stopTyping()
    setDisplayedText(currentNode?.text ?? '')
  }, [currentNode, stopTyping, setDisplayedText])

  const open = useCallback((dialogueId: string) => {
    openDialogue(dialogueId)
  }, [openDialogue])

  const close = useCallback(() => {
    stopTyping()
    closeDialogue()
  }, [stopTyping, closeDialogue])

  useEffect(() => {
    if (isOpen && currentNode) {
      startTyping(currentNode.text)
    }
    return () => stopTyping()
  }, [isOpen, currentNode?.id])

  useEffect(() => {
    return () => stopTyping()
  }, [stopTyping])

  return {
    isOpen,
    currentNode,
    isTyping,
    displayedText,
    advance,
    selectChoice,
    skip,
    open,
    close,
  }
}
