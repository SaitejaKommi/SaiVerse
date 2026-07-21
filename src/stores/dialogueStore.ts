import { create } from 'zustand'
import type { DialogueDef, DialogueState } from '@/systems/dialogue/dialogue.types'
import { EventBus } from '@/lib/events/EventBus'
import { GameEvents } from '@/lib/events/events.types'

interface DialogueActions {
  openDialogue: (dialogueId: string, position?: [number, number, number]) => void
  closeDialogue: () => void
  goToNode: (nodeId: string) => void
  setDisplayedText: (text: string) => void
  setIsTyping: (typing: boolean) => void
  registerDialogue: (dialogue: DialogueDef) => void
  getDialogue: (id: string) => DialogueDef | undefined
  setSpeakerPosition: (pos: [number, number, number] | null) => void
  reset: () => void
}

const initialState: DialogueState = {
  isOpen: false,
  currentDialogueId: null,
  currentNodeId: null,
  displayedText: '',
  isTyping: false,
  currentNode: null,
  speakerPosition: null,
}

const registeredDialogues = new Map<string, DialogueDef>()

const useDialogueStore = create<DialogueState & DialogueActions>()((set, get) => ({
  ...initialState,

  registerDialogue: (dialogue) => {
    registeredDialogues.set(dialogue.id, dialogue)
  },

  getDialogue: (id) => registeredDialogues.get(id),

  openDialogue: (dialogueId, position) => {
    const dialogue = registeredDialogues.get(dialogueId)
    if (!dialogue) {
      console.warn(`[Dialogue] Unknown dialogue: ${dialogueId}`)
      return
    }
    const startNode = dialogue.nodes[dialogue.startNodeId]
    set({
      isOpen: true,
      currentDialogueId: dialogueId,
      currentNodeId: dialogue.startNodeId,
      currentNode: startNode,
      displayedText: '',
      isTyping: true,
      speakerPosition: position ?? null,
    })
    EventBus.emit(GameEvents.DIALOGUE_START, { dialogueId, nodeId: dialogue.startNodeId })
  },

  closeDialogue: () => {
    const state = get()
    const lastNodeId = state.currentNodeId
    set({ ...initialState, speakerPosition: null })
    if (state.currentDialogueId) {
      EventBus.emit(GameEvents.DIALOGUE_END, { dialogueId: state.currentDialogueId, lastNodeId })
    }
  },

  goToNode: (nodeId) => {
    const state = get()
    const dialogue = state.currentDialogueId ? registeredDialogues.get(state.currentDialogueId) : undefined
    if (!dialogue) return
    const node = dialogue.nodes[nodeId]
    if (!node) return

    if (node.onEnter) {
      try {
        const fn = new Function(`return (${node.onEnter})`)()
        fn()
      } catch { /* ignore dynamic eval errors */ }
    }

    set({
      currentNodeId: nodeId,
      currentNode: node,
      displayedText: '',
      isTyping: true,
    })
    EventBus.emit(GameEvents.DIALOGUE_ADVANCE, { dialogueId: state.currentDialogueId, nodeId })
  },

  setDisplayedText: (displayedText) => set({ displayedText }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setSpeakerPosition: (pos) => set({ speakerPosition: pos }),

  reset: () => {
    registeredDialogues.clear()
    set(initialState)
  },
}))

export { useDialogueStore }
export type { DialogueActions }
