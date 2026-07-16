import type { DialogueDef } from '@/systems/dialogue/dialogue.types'

export const STEWARD_DIALOGUE_ID = 'steward-welcome'

export function buildStewardDialogue(): DialogueDef {
  return {
    id: STEWARD_DIALOGUE_ID,
    title: 'The Steward',
    startNodeId: 'welcome',
    nodes: {
      welcome: {
        id: 'welcome',
        speaker: 'The Steward',
        text: 'Welcome home. There is work to be done.',
        nextNodeId: 'farewell',
      },
      farewell: {
        id: 'farewell',
        speaker: 'The Steward',
        text: 'The valley remembers those who build it.',
        nextNodeId: undefined,
      },
    },
  }
}
