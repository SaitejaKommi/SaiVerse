# SaiVerse — Remaining Production Audit

> Generated: 2026-07-17
> Covers: CRITICAL, HIGH, MEDIUM, LOW issues found in the current codebase.
> Fixed issues are excluded (see git log for the 17 fixes already applied).

---

## CRITICAL

### C1. `ChapterMonument.tsx` — Side effects inside `setActivatedMap` updater `[FIXED]`

> Fixed in commit `5f3a844`. Replaced impure `setActivatedMap((prev) => { sideEffects; return newState })` with a ref-based guard (`activatedRef`) and separate setState + side effect calls.

| Field | Value |
|---|---|
| **File** | `src/features/final-summit/ChapterMonument.tsx:186-198` |
| **Root Cause** | `Monuments` component calls `soundFX.playQuestComplete()` and `QuestManager.completeObjective()` inside a `setActivatedMap((prev) => { ... })` state updater function. React's functional updater should be pure — it must only compute and return the next state. |
| **User Impact** | In development with StrictMode, side effects in updaters run twice, potentially awarding duplicate quest progress. |
| **Recommended Fix** | Compute the next state first, then apply side effects and setState separately — same pattern used to fix DebugStation in commit `13578c6`. |

---

## HIGH

### H1. `ProfessorNPC.tsx` / `TechMentorNPC.tsx` — Store objects as `useEffect` dependencies `[FIXED]`

> Fixed in commit `e2c8643`. Removed `dialogueStore` and `playerStore` from the dependency arrays — Zustand store references are stable and don't need to trigger re-subscription.

| Field | Value |
|---|---|
| **Files** | `src/features/npc/ProfessorNPC.tsx:374`, `src/features/npc/TechMentorNPC.tsx:365` |
| **Root Cause** | `dialogueStore` and `playerStore` are the full Zustand store objects returned by `useDialogueStore()` / `usePlayerStore()`. These create new references on every state change, so the entire event-bus effect (including all `EventBus.on()` subscriptions) is torn down and re-created whenever any field in either store changes. |
| **User Impact** | Unnecessary churn in event subscriptions; rare edge case where a dialogue event fires between unsubscribe and re-subscribe and is lost. |
| **Recommended Fix** | Remove `dialogueStore` and `playerStore` from the dependency array. Use `useRef` for stable references or individual selectors (`usePlayerStore((s) => s.traits)`). |

### H2. `CountdownTimer.tsx` — Timer display reads `getState()` at render time, not reactively `[FIXED]`

> Fixed in commit `a96af12`. Replaced `useHackathonStore.getState()` with reactive Zustand selectors so the component re-renders when timer/phase/setback change.

| Field | Value |
|---|---|
| **File** | `src/features/hackathon-arena/CountdownTimer.tsx:106-108` |
| **Root Cause** | `seconds` and `phase` are read via `useHackathonStore.getState()` at the top level of the render function. The CountdownTimer component doesn't subscribe to the HackathonStore — it only subscribes to QuestStore (line 37-43). So the projector screen shows stale values until an unrelated re-render occurs. |
| **User Impact** | Timer display on the projector screen may visually lag 1-2 frames behind the actual timer value. Noticeable during the final 10-second countdown. |
| **Recommended Fix** | Subscribe to the relevant store slices: `const seconds = useHackathonStore((s) => Math.max(0, Math.ceil(s.timeRemaining)))` and `const phase = useHackathonStore((s) => s.phase)`. |

### H3. `OfferStage.tsx` — `CHAPTER_QUEST_IDS` / `CHAPTER_TITLES` hardcoded and incomplete `[FIXED]`

> Fixed in commit `efc8f49`. Updated arrays to include all 8 main quests and titles, and made display counts dynamic.

### H4. `PresentationConsole.tsx` — No visual prompt telling the player to activate

| Field | Value |
|---|---|
| **File** | `src/features/hackathon-arena/PresentationConsole.tsx` |
| **Root Cause** | When phase transitions to `'presentation'`, the projector screen shows "TIME TO PRESENT" but the PresentationConsole itself has no interactivity hint. Its screen is dark (`color: '#0a0a1a'`) until clicked, and the clickable button is a tiny cylinder (radius 0.06) with no glow or label. |
| **User Impact** | Players may not know they need to click the console to start the presentation. They could be stuck waiting indefinitely. |
| **Recommended Fix** | Add a pulsating glow or label on the console when phase is `'presentation'`, and/or show a "PRESENT YOUR PROJECT" HUD prompt. |


## MEDIUM

### M1. QuestAutoAcceptor components — Quest registration in `useEffect` without cleanup

| Field | Value |
|---|---|
| **Files** | `QuestAutoAcceptorHA.tsx:14`, `QuestAutoAcceptorOSV.tsx:14`, `QuestAutoAcceptorCD.tsx:14`, `QuestAutoAcceptorFS.tsx:14` |
| **Root Cause** | Each component calls `QuestManager.registerQuest(buildQuest())` in a `useEffect([], [])`, but there is no cleanup to unregister the quest on unmount. If the component remounts (e.g., due to React StrictMode or a suspense boundary), the quest is registered twice — `registerQuest` in `questStore.ts` does a blind `{ ...state.quests, [quest.id]: quest }` overwrite without checking for duplicates. |
| **User Impact** | Only cosmetic — the last registration wins, but accumulated garbage data in the store could grow if mounts/unmounts happen frequently. |
| **Recommended Fix** | Either add a guard (`if (alreadyRegistered) return`) or clean up by removing the quest from the store on unmount. |

### M2. `ArenaLighting.tsx` — Strip refs array has arbitrary index gaps

| Field | Value |
|---|---|
| **File** | `src/features/hackathon-arena/ArenaLighting.tsx:88-105` |
| **Root Cause** | Horizontal strips register at indices 0-6. Vertical strips register at indices 7-10 and 11-14. If any strip fails to mount (e.g., React Suspense), a gap in the array causes subsequent strips to shift indices. The `registerStrip` callback overwrites refs at arbitrary indices. |
| **User Impact** | Some LED strip lights may not respond to phase-based color changes, breaking immersion in the hackathon arena. |
| **Recommended Fix** | Use a `Map<number, THREE.Mesh>` keyed by a stable ID, or use separate refs for each strip group. |

### M3. `TeamEnergyBar.tsx` — Subscribes to entire store, re-renders on any change

| Field | Value |
|---|---|
| **File** | `src/features/hackathon-arena/TeamEnergyBar.tsx:11` |
| **Root Cause** | `useHackathonStore.subscribe((state) => { ... })` fires on every state change, but the callback only reads `state.teamEnergy` and `state.phase`. The `setEnergy` / `setVisible` calls trigger React re-renders even when these two fields haven't changed. |
| **User Impact** | Minor performance cost — unnecessary re-renders on every frame that the BossEventSystem updates `sprintProgress` or `activeSetback`. |
| **Recommended Fix** | Use Zustand selectors: `const energy = useHackathonStore((s) => s.teamEnergy)`, `const phase = useHackathonStore((s) => s.phase)`. Derive `visible` from `phase` in the render body. |

### M4. `CountdownTimer.tsx` — Sprint transition checks `!sprintNDone` but timer keeps running if sprint isn't done

| Field | Value |
|---|---|
| **File** | `src/features/hackathon-arena/CountdownTimer.tsx:61-80` |
| **Root Cause** | When timer reaches `SPRINT_1_END` (90s) but `sprint1Done` is false, the phase stays on `sprint-1` and the timer keeps decrementing to 0. The player can be stuck on sprint-1 with no time left, unable to advance. Same for sprint-2 and sprint-3. |
| **User Impact** | If the player doesn't finish coding before the timer expires, they are stuck indefinitely with no feedback on what to do next. |
| **Recommended Fix** | Either auto-complete the sprint when timer reaches 0 and the sprint isn't done (graceful fallback), or add a HUD notification telling the player to use the CodeStation. |

---

## LOW

### L1. `ProfessorNPC.tsx` — `intro` node auto-accepts on `DIALOGUE_START` but quest may fail pre-reqs

| Field | Value |
|---|---|
| **File** | `src/features/npc/ProfessorNPC.tsx:337-343` |
| **Root Cause** | The DIALOGUE_START handler calls `QuestManager.acceptQuest(NPC_QUEST_ID)`, which internally checks pre-reqs. But the quest was already checked for pre-reqs before opening the dialogue (line 279-283). If the pre-req check passes but `acceptQuest` fails (e.g., max active quests reached), the dialogue shows the intro but no quest is started — confusing for the player. |
| **User Impact** | Rare: if 10 quests are already active (unlikely in normal play), the NPC greeting says "let's begin" but nothing happens. |
| **Recommended Fix** | Check the return value of `acceptQuest` and if it fails, route to a dialogue node explaining the issue. |

### L2. `DebugStation.tsx` — `switch` geometry uses `onClick` without pointer-events setup

| Field | Value |
|---|---|
| **File** | `src/features/hackathon-arena/DebugStation.tsx:198` |
| **Root Cause** | `SwitchMesh` passes `onClick={isActive ? onClick : undefined}`. Three.js requires `pointerEvents` to be enabled on the parent raycaster for events to fire. If the Canvas or a parent group has `events={...}` configured differently, clicks may not register. |
| **User Impact** | Toggle switches may not respond to clicks in some environments. |
| **Recommended Fix** | Verify that the R3F event system is properly configured. Add `pointerEvents` handlers for visual feedback. |

### L3. `FinalSummitCredits.tsx` — Hardcoded text lines don't reference real achievements

| Field | Value |
|---|---|
| **File** | `src/features/final-summit/FinalSummitCredits.tsx` |
| **Root Cause** | The credits text is hardcoded and doesn't pull from actual player state (quests completed, knowledge earned, badges unlocked). A player who skipped chapters would see the same credits as someone who completed everything. |
| **User Impact** | Credits feel generic and impersonal. |
| **Recommended Fix** | Late-game enhancement: read from `usePlayerStore` and `useQuestStore` to dynamically generate personalized credits. |

---

## Issue Count Summary

| Severity | Count |
|---|---|
| CRITICAL | 1 |
| HIGH | 5 |
| MEDIUM | 4 |
| LOW | 3 |
| **Total** | **13** |
