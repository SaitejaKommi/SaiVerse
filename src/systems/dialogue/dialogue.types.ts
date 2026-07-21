export interface DialogueNode {
  id: string
  speaker: string
  text: string
  portrait?: string
  nextNodeId?: string
  choices?: DialogueChoice[]
  onEnter?: string
  onExit?: string
}

export interface DialogueChoice {
  text: string
  nextNodeId: string
  condition?: string
  action?: string
}

export interface DialogueDef {
  id: string
  title: string
  nodes: Record<string, DialogueNode>
  startNodeId: string
}

export interface DialogueState {
  isOpen: boolean
  currentDialogueId: string | null
  currentNodeId: string | null
  displayedText: string
  isTyping: boolean
  currentNode: DialogueNode | null
  speakerPosition: [number, number, number] | null
}

export const TYPING_SPEED_MS = 30
export const TYPING_SPEED_FAST_MS = 5
