# SaiVerse — Technical Architecture Document v1

**Status:** Draft  
**Version:** 1.0  
**Author:** Staff Software Engineer / Game Architect  
**Last Updated:** 2026-07-02  

---

## Table of Contents

1. [Overall System Architecture](#1-overall-system-architecture)
2. [High-Level Engineering Decisions](#2-high-level-engineering-decisions)
3. [Rendering Architecture](#3-rendering-architecture)
4. [Next.js Architecture](#4-nextjs-architecture)
5. [React Three Fiber Architecture](#5-react-three-fiber-architecture)
6. [Scene Management](#6-scene-management)
7. [State Management](#7-state-management)
8. [Folder Philosophy](#8-folder-philosophy)
9. [Coding Standards](#9-coding-standards)
10. [Performance Philosophy](#10-performance-philosophy)
11. [Scalability Philosophy](#11-scalability-philosophy)
12. [Asset Pipeline](#12-asset-pipeline)
13. [Build Pipeline](#13-build-pipeline)
14. [Data Flow](#14-data-flow)
15. [Error Handling](#15-error-handling)
16. [Design Principles](#16-design-principles)
17. [Future Expansion Strategy](#17-future-expansion-strategy)

---

## 1. Overall System Architecture

### 1.1 Conceptual Architecture

SaiVerse is a **hybrid application** — equal parts game engine, web application, and interactive narrative platform. The architecture is layered to separate concerns between the 3D game world, the application shell, the data layer, and the backend services.

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Shell                         │
│  (Next.js App Router — Routing, Layout, SEO, Meta, Shell)    │
├─────────────────────────────────────────────────────────────┤
│                    Game Engine Layer                          │
│  (R3F Canvas, Scene Graph, Physics, Camera, Controls)        │
├─────────────────────────────────────────────────────────────┤
│                    Game Systems Layer                         │
│  (Quests, Dialogue, Knowledge, NPCs, Audio, Save)            │
├─────────────────────────────────────────────────────────────┤
│                    State Layer                                │
│  (Zustand Stores — Game, Knowledge, Quests, Settings, Save)  │
├─────────────────────────────────────────────────────────────┤
│                    Data / Service Layer                       │
│  (API Routes, Asset Loading, Analytics, Persistence)         │
├─────────────────────────────────────────────────────────────┤
│                    Asset Layer                                │
│  (3D Models, Textures, Audio, Shaders, Data Files)           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Architectural Principles

| Principle | Application |
|---|---|
| **Separation of Concerns** | Game logic is never mixed with UI logic. Rendering is separate from state. Systems are decoupled via events. |
| **Dependency Inversion** | High-level systems (quests, dialogue) depend on abstractions, not concrete stores. |
| **Composition over Inheritance** | Game entities are composed of components (Position, Renderable, Interactable, DialogueTrigger). No deep class hierarchies. |
| **Data-Driven Design** | Game content (dialogue, quests, NPC data, district configs) lives in JSON/data files, not in code. Code interprets data. |
| **Unidirectional Data Flow** | State flows down through React context and Zustand stores. Actions flow up through dispatched events and store actions. |
| **Fail Gracefully** | Missing assets, failed loads, and errors never crash the experience. Every system has a fallback state. |

### 1.3 System Boundaries

```
┌──────────────────────────────────────┐
│            Browser                    │
│  ┌────────────────────────────────┐   │
│  │       Next.js App Shell        │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │   R3F Canvas (WebGL)     │  │   │
│  │  │  ┌────────────────────┐  │  │   │
│  │  │  │  3D Scene Graph    │  │  │   │
│  │  │  │  (Districts, NPCs, │  │  │   │
│  │  │  │   Player, Objects) │  │  │   │
│  │  │  └────────────────────┘  │  │   │
│  │  └──────────────────────────┘  │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │   Overlay UI (HTML/CSS)  │  │   │
│  │  │   (Dialogue, HUD, Menus) │  │   │
│  │  └──────────────────────────┘  │   │
│  └────────────────────────────────┘   │
│  ┌────────────────────────────────┐   │
│  │   Web APIs                     │   │
│  │   (Audio, IndexedDB, FS, etc) │   │
│  └────────────────────────────────┘   │
└──────────────────────────────────────┘
         ↕       ↕       ↕
    API Routes  CDN     External
    (Next.js)  (Assets) (GitHub, etc)
```

---

## 2. High-Level Engineering Decisions

### 2.1 Why Not Unity / Unreal / Traditional Game Engine?

| Factor | Unity/Unreal | R3F + Next.js |
|---|---|---|
| **Delivery** | Executable download | URL link — zero friction |
| **SEO** | None | Full Next.js SEO for landing |
| **Portfolio Value** | Game dev skill | Full-stack + 3D engineering |
| **Iteration Speed** | Slow builds | Fast HMR |
| **WebGL Quality** | Limited via WebGL export | Native WebGL — no middleware |
| **Learning Curve** | Steep (C#, C++) | React developers already fluent |
| **Integration** | Isolated | Full web ecosystem |

**Decision:** React Three Fiber + Next.js is the correct choice for a browser-based 3D portfolio game. It maximizes portfolio impact while being genuinely impressive as a web engineering achievement.

### 2.2 Why Zustand over Redux / Jotai / Context

| Feature | Zustand | Redux | Jotai | React Context |
|---|---|---|---|---|
| **Bundle Size** | ~1KB | ~12KB | ~4KB | 0KB (built-in) |
| **Performance** | Excellent — selective subscriptions | Good — but boilerplate overhead | Excellent — atomic updates | Poor — re-renders entire tree |
| **R3F Integration** | First-class — `useStore` hook works in R3F callbacks | Requires middleware | Works but extra abstraction | Causes R3F re-renders |
| **Persistence** | Built-in `persist` middleware | Requires extra lib | Requires extra lib | Manual |
| **Immer Integration** | Built-in `immer` middleware | Manual | Requires extra lib | N/A |
| **Devtools** | Built-in | Built-in | Manual | N/A |
| **TypeScript** | Excellent | Verbose | Good | Good |

**Decision:** Zustand. It is the de facto standard for React Three Fiber applications. Its tiny bundle, excellent performance with selective subscriptions, built-in persistence + immer middleware, and first-class R3F integration make it strictly superior for this use case.

### 2.3 Why Rapier over Cannon / Ammo / Custom Physics

| Factor | Rapier (Rapier) | Cannon-es | Ammo.js | Custom |
|---|---|---|---|---|
| **Performance** | WASM-optimized, excellent | Good but dated | WASM, heavy | Not viable for complex scenes |
| **Maintenance** | Active (2024+) | Low activity | Low activity | Infinite |
| **R3F Integration** | `@react-three/rapier` — excellent | `use-cannon` — good | Manual | N/A |
| **Features** | CCD, joints, sensors, async | Basic | Full feature set | Whatever we build |
| **Web Worker** | Built-in | Manual | Manual | N/A |

**Decision:** Rapier via `@react-three/rapier`. It is the modern standard, actively maintained, has the best R3F integration, and supports Web Workers for physics simulation off the main thread.

### 2.4 Why GSAP + Framer Motion (Dual Library)

| Concern | GSAP | Framer Motion |
|---|---|---|
| **3D Object Animation** | Excellent — timeline, easing, transform | Poor — designed for DOM |
| **UI Animation** | Good | Excellent — layout animations, gesture |
| **Scroll / Camera** | ScrollTrigger, MotionPath | Limited |
| **Timeline Sequencing** | Industry standard `Timeline` | Limited |
| **Reactivity** | Manual | Declarative, React-native |
| **Bundle Size** | ~25KB (gzip) | ~35KB (gzip) |

**Decision:** Both. GSAP for all 3D object animation, camera movement, cinematic sequences, and timeline-driven events. Framer Motion for all HTML/CSS overlay UI animation (dialogue panels, HUD transitions, menu animations). This avoids GSAP touching DOM (which would fight React's rendering) while leveraging GSAP for what it does best.

### 2.5 Why Feature-First Architecture

Traditional folder structures group by technical concern:

```
src/
  components/
  hooks/
  stores/
  utils/
```

This scales poorly. When adding a district, you touch 5+ folders.

**Feature-first** groups by business domain:

```
src/
  features/
    campus/
      components/
      hooks/
      stores/
      data/
```

**Benefits:**
- Each district is self-contained
- Teams can work in parallel
- Deleting a feature = delete one folder
- Clear ownership boundaries
- Lazy-loading boundaries align naturally

**Decision:** Feature-first is the architecture.

### 2.6 TypeScript Strategy

**Configuration:**
- `strict: true` — mandatory
- `noUncheckedIndexedAccess: true` — prevents array bounds issues
- `exactOptionalPropertyTypes: true` — prevents subtle bugs
- Path aliases: `@/` → `src/`, `@features/` → `src/features/`, `@systems/` → `src/systems/`

**Patterns:**
- Discriminated unions for all state machines (NPC states, quest states, dialogue states)
- Branded types for IDs (QuestID, NPCID, DistrictID) — prevents passing wrong IDs
- `satisfies` operator for data-driven configs
- Generic repository pattern for data access

---

## 3. Rendering Architecture

### 3.1 Render Pipeline

```
Frame Start
  │
  ├─ Input Processing (Keyboard, Mouse, Gamepad)
  │
  ├─ Physics Step (Rapier, fixed timestep 1/60s)
  │
  ├─ Game Logic Update (systems tick)
  │
  ├─ Camera Update (follow target, smoothing, collision)
  │
  ├─ Culling / LOD (frustum, distance, occlusion)
  │
  ├─ Render
  │   ├─ Opaque Geometry (instanced meshes, merged geometry)
  │   ├─ Transparent Geometry
  │   ├─ Post-Processing (bloom, tone-mapping, SSR)
  │   │
  │   └─ Overlay UI (HTML Canvas — Framer Motion)
  │
  └─ Frame End
```

### 3.2 Rendering Budgets

| Metric | Target | Hard Limit |
|---|---|---|
| Draw Calls | < 200 | 300 |
| Triangles | < 500K | 1M |
| Shadow Casters | 3 | 5 |
| Post-Processing Passes | 4 | 6 |
| Texture Memory | < 256MB | 512MB |
| Unique Materials | < 100 | 150 |

### 3.3 Post-Processing Stack

Order matters for performance and visual quality:

1. **Depth of Field** — Cinematic feel, hides distant LOD transitions
2. **Bloom** — Neon accents, holograms, achievements
3. **Tone Mapping** — ACES filmic (industry standard)
4. **Antialiasing** — SMAA or FXAA (cheaper than MSAA in WebGL)

All post-processing is implemented via `@react-three/postprocessing`.

### 3.4 Lighting Strategy

| Light Type | Count | Usage |
|---|---|---|
| Directional (sun) | 1 | Main global light, day/night cycle |
| Ambient | 1 | Base illumination, color changes with weather |
| Hemisphere | 1 | Sky/ground color separation |
| Point Lights | 10-20 | Districts, buildings, interactive objects |
| Spot Lights | 2-3 | Cinematic focus, NPC conversations |
| Decals | 5-10 | Projected textures (signs, markings) |

**Performance:** Point/spot lights are expensive. All light counts are strict budgets. Baked lightmaps are used for static geometry where possible, computed via Blender's Cycles renderer.

### 3.5 Shadows

- Only 1-2 directional shadow maps active at any time
- Shadow map resolution: 2048x2048 (directional), 1024x1024 (spot)
- PCF soft shadows (not VSM — too many artifacts in WebGL)
- Cascaded shadow maps for large outdoor areas

---

## 4. Next.js Architecture

### 4.1 Route Design

```
/                       → Landing / Title Screen
/game                   → Main Game (full-screen R3F canvas)
/game?district=campus   → Direct spawn in specific district

/api/contact            → Contact form handler
/api/save               → Save game persistence
/api/analytics          → Telemetry (opt-in)
/api/resume             → Resume download counter

/fallback               → Non-WebGL fallback (basic portfolio)
/404                    → 404 Easter egg page
```

### 4.2 App Shell

The root layout wraps all routes with minimal chrome. The game route (`/game`) is full-screen with zero browser chrome.

```tsx
// src/app/layout.tsx
// - Font loading (inter, plus game-specific font)
// - Metadata
// - No nav bars (game is full-screen)
// - Theme provider (light/dark — game has its own lighting)
```

```tsx
// src/app/game/layout.tsx
// - Full viewport
// - No margins, no scrollbars
// - Prevents body scroll
// - Hides browser chrome on mobile (fullscreen API)
```

### 4.3 Component Tree

```
<RootLayout>
  ├─ <GameLayout> (full viewport)
  │   ├─ <GameCanvas> (R3F Canvas + providers)
  │   │   ├─ <SceneManager>
  │   │   │   ├─ <DistrictLoader current={currentDistrict} />
  │   │   │   └─ <TransitionManager />
  │   │   ├─ <PlayerController />
  │   │   ├─ <CameraSystem />
  │   │   ├─ <LightingManager>
  │   │   │   ├─ <SunLight />
  │   │   │   ├─ <AmbientLight />
  │   │   │   └─ <WeatherSystem />
  │   │   ├─ <NPCSpawner />
  │   │   ├─ <InteractiveObjectManager />
  │   │   └─ <PostProcessing />
  │   ├─ <OverlayUI> (HTML Canvas, pointer-events: none)
  │   │   ├─ <HUD />
  │   │   │   ├─ <KnowledgeBar />
  │   │   │   ├─ <QuestTracker />
  │   │   │   └─ <Minimap /> (optional)
  │   │   ├─ <DialogueUI />
  │   │   │   ├─ <DialogueBubble />
  │   │   │   └─ <ChoicePanel />
  │   │   ├─ <MenuSystem />
  │   │   │   ├─ <PauseMenu />
  │   │   │   ├─ <InventoryScreen />
  │   │   │   └─ <SettingsPanel />
  │   │   └─ <CinematicBlackBars />
  │   └─ <LoadingScreen /> (Suspense fallback)
  └─ </GameLayout>
  ├─ AudioProvider
  └─ SaveProvider
```

### 4.4 Loading Strategy

| Route | Loading Strategy |
|---|---|
| `/` | Static — instant load, no JS needed |
| `/game` | Dynamic import — `next/dynamic` with `ssr: false` |
| Districts | Lazy-loaded components via `React.lazy` + Suspense |
| 3D Assets | `useProgress` from Drei, Suspense boundaries per district |

**Critical path:** HTML → CSS → Font → 3D Boot (loader scene) → Game

### 4.5 SEO & Meta Strategy

Despite being a game, SEO matters for discoverability:

- `/` route serves meta tags for LinkedIn/Twitter cards
- Rich embed with preview image of SaiVerse
- Open Graph tags with game title, description, preview
- JSON-LD structured data for "VideoGame" schema type
- Sitemap with `/game` as primary URL
- `robots.txt` allowing indexing of `/`, blocking deep game state

---

## 5. React Three Fiber Architecture

### 5.1 Canvas Configuration

```tsx
<Canvas
  shadows
  dpr={[1, 2]} // Responsive pixel ratio
  gl={{
    antialias: true,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    outputColorSpace: sRGBEncoding,
  }}
  camera={{
    fov: 60,
    near: 0.1,
    far: 1000,
  }}
  onCreated={(state) => {
    // Setup renderer defaults
    state.gl.setClearColor('#1a1a2e')
  }}
>
```

### 5.2 R3F Provider Stack

```
<Canvas>
  <PhysicsProvider>        ← @react-three/rapier
    <GameStateProvider>    ← Zustand context bridge
      <SceneManager>
        <PlayerController />
        <CameraSystem />
        <LightingManager />
        <DistrictLoader />
        <NPCSpawner />
        <InteractiveManager />
        <AudioListener />
        <PostProcessing />
      </SceneManager>
    </GameStateProvider>
  </PhysicsProvider>
</Canvas>
```

### 5.3 R3F Performance Patterns

**Never put reactive state in R3F components that causes re-renders of the 3D tree.**

```tsx
// ❌ Bad — every store change re-renders the mesh
function Player() {
  const health = useGameStore(state => state.health)
  return <mesh /> // re-renders on every health change
}

// ✅ Good — use refs for R3F objects, read store imperatively
function Player() {
  const ref = useRef<Mesh>(null!)
  useFrame(() => {
    const health = useGameStore.getState().health
    // mutate ref directly — no re-render
  })
  return <mesh ref={ref} />
}
```

**Key patterns:**
- `useFrame` for per-frame logic (never React state)
- `useRef` for all Three.js object references
- `useMemo` for geometries, materials, textures
- `useLoader` for asset loading inside Suspense
- `instance` meshes for repeated geometry (trees, buildings)
- `mergeVertices` for static geometry

---

## 6. Scene Management

### 6.1 Scene Graph Design

```
SceneGraph
├── World (root group)
│   ├── Terrain (chunked, streamed)
│   ├── Districts
│   │   ├── Campus (Group)
│   │   │   ├── Buildings
│   │   │   ├── NPCs
│   │   │   ├── InteractiveObjects
│   │   │   ├── Triggers
│   │   │   └── AmbientEffects
│   │   ├── SoftwareCity
│   │   ├── AIDistrict
│   │   ├── OpenSourceValley
│   │   ├── HackathonArena
│   │   ├── SportsStadium
│   │   ├── CreatorDistrict
│   │   ├── AchievementMuseum
│   │   └── MissionControl
│   ├── Sky (dynamic skybox)
│   ├── Environment (fog, particles, ambient effects)
│   └── GlobalLighting
├── Player
│   ├── Avatar (rigged character)
│   ├── CameraTarget (empty, camera follows)
│   └── ProximityDetector (sphere trigger)
└── Systems (invisible)
    ├── NavigationMesh
    ├── AudioEmitters
    └── EventTriggers
```

### 6.2 District Lifecycle

```
              ┌─────────────┐
              │  UNLOADED   │
              └──────┬──────┘
                     │ enter proximity
              ┌──────▼──────┐
              │  LOADING    │ ← Suspense boundary
              └──────┬──────┘
                     │ assets loaded
              ┌──────▼──────┐
              │  ACTIVE     │ ← rendering, physics, logic
              └──────┬──────┘
                     │ exit proximity (threshold)
              ┌──────▼──────┐
              │  UNLOADING  │ ← fade out, dispose
              └──────┬──────┘
                     │ disposed
              ┌──────▼──────┐
              │  UNLOADED   │
              └─────────────┘
```

**Distance-based activation:**
- **Loading zone:** ~200m from district center → begin loading assets
- **Active zone:** ~150m → district is fully rendered and interactive
- **Unloading zone:** ~250m → begin fade-out and disposal
- **Unload complete:** ~300m → dispose all GPU resources

### 6.3 Asset Streaming

```
District Load Request
  ├─ Load GLTF model (compressed via Draco)
  ├─ Load textures (basis universal format)
  ├─ Load audio (OGG/MP3)
  ├─ Load district config JSON
  ├─ Load dialogue data JSON
  └─ Signal "ready" → district transitions to ACTIVE
```

**Streaming orchestration:**
- `@react-three/drei`'s `useProgress` for global loading state
- Custom `AssetCache` singleton with LRU eviction
- Texture compression via Basis Universal (transcoded to KTX2)
- Model compression via Draco (decoded on worker thread)
- Audio streaming via Web Audio API buffer loading

### 6.4 Memory Management

```typescript
interface AssetRecord {
  key: string
  asset: GLTF | Texture | AudioBuffer
  size: number // estimated bytes
  lastAccessed: number
  refCount: number
}

class AssetCache {
  private cache: Map<string, AssetRecord> = new Map()
  private maxMemory: number = 512 * 1024 * 1024 // 512MB

  acquire(key: string): AssetRecord | null
  release(key: string): void
  private evictLRU(): void
  dispose(): void // full clear
}
```

**Disposal discipline:**
- Every `.dispose()` call is mandatory
- `useFrame` cleanup in `useEffect` return
- Geometry.dispose() + Material.dispose() + Texture.dispose()
- Raycaster cleanup
- Audio buffer cleanup

---

## 7. State Management

### 7.1 Store Architecture

```
Zustand Root
├── useGameStore
│   ├── player: { position, rotation, state, velocity }
│   ├── world: { timeOfDay, weather, currentDistrict }
│   ├── knowledge: { percentage, skills: Map<SkillID, Skill> }
│   ├── quests: { active, completed, available }
│   ├── inventory: { items: Map<ItemID, Item> }
│   └── achievements: { unlocked: Set<AchievementID> }
│
├── useDialogueStore
│   ├── active: boolean
│   ├── npcId: NPCID | null
│   ├── currentNode: DialogueNodeID
│   ├── history: DialogueNodeID[]
│   └── choices: DialogueChoice[]
│
├── useSettingsStore (persisted)
│   ├── audio: { master, music, sfx, voice }
│   ├── graphics: { quality, shadows, postProcessing }
│   ├── controls: { sensitivity, invertY }
│   └── accessibility: { subtitles, highContrast }
│
├── useSaveStore (persisted)
│   ├── saveSlots: SaveSlot[]
│   ├── autoSave: SaveSlot
│   ├── save(): void
│   └── load(slotId): void
│
└── useUIStore
    ├── activeMenu: MenuType | null
    ├── hudVisible: boolean
    ├── dialogueVisible: boolean
    ├── notification: Notification | null
    └── tooltip: TooltipData | null
```

### 7.2 Store Design Principles

1. **Stores are independent** — no circular dependencies between stores
2. **Stores are shallow by default** — use selectors to access deep state
3. **Immer middleware** for immutable updates with mutable syntax
4. **Persistence middleware** for settings and saves (localStorage/IndexedDB)
5. **devtools middleware** in development
6. **Actions colocated** — each store exposes its own actions
7. **Stores are pure** — no side effects in reducers (use subscriptions for side effects)

### 7.3 State Serialization (Save System)

```typescript
interface SaveSlot {
  id: string
  timestamp: number
  playTime: number
  screenshot?: string // data URL for save preview
  data: SaveData
}

interface SaveData {
  player: {
    position: [number, number, number]
    rotation: [number, number, number]
    state: PlayerState
  }
  knowledge: {
    percentage: number
    skills: Record<string, SkillProgress>
  }
  quests: {
    completed: string[]
    active: string[]
    questStates: Record<string, QuestState>
  }
  achievements: string[]
  inventory: string[]
  unlockedDistricts: string[]
  dialogueHistory: string[]
  world: {
    timeOfDay: number
    weather: WeatherType
  }
  version: number // for migration
}
```

**Save triggers:**
- Auto-save on district transition
- Auto-save on major quest completion
- Auto-save every 5 minutes
- Manual save via pause menu
- Save on visibility change (tab switch)

**Persistence layer:**
- Primary: IndexedDB (via `idb-keyval` wrapper) — supports >50MB
- Fallback: localStorage — ~5MB limit
- Compression: lz-string for payloads >100KB

### 7.4 Serialization Strategy

The Zustand `persist` middleware handles serialization automatically for settings. For full game saves, a custom save/load system handles the complex nested state:

```typescript
class SaveManager {
  async save(slotId: string): Promise<void>
  async load(slotId: string): Promise<SaveData>
  async delete(slotId: string): Promise<void>
  async listSlots(): Promise<SaveSlot[]>
  async exportSave(slotId: string): Blob // downloadable
  async importSave(file: File): Promise<void>
  private migrate(data: SaveData): SaveData // version migration
}
```

---

## 8. Folder Philosophy

### 8.1 Complete File Tree

```
sainet/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, typecheck, test on PR
│   │   ├── cd.yml                    # Deploy to Vercel
│   │   └── codeql.yml               # Security analysis
│   └── ISSUE_TEMPLATE/
│       └── bug_report.yml
│
├── public/
│   ├── assets/
│   │   ├── models/                   # Compiled GLB files
│   │   │   ├── characters/
│   │   │   ├── buildings/
│   │   │   ├── props/
│   │   │   ├── vehicles/
│   │   │   └── environment/
│   │   ├── textures/                 # KTX2 compressed textures
│   │   ├── audio/
│   │   │   ├── music/
│   │   │   ├── sfx/
│   │   │   └── voice/
│   │   └── fonts/                    # Custom game fonts
│   ├── preview.jpg                   # Open Graph preview
│   └── robots.txt
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing / Title Screen
│   │   ├── game/
│   │   │   ├── layout.tsx            # Full-screen game layout
│   │   │   └── page.tsx              # Game bootstrap
│   │   ├── api/
│   │   │   ├── contact/
│   │   │   │   └── route.ts
│   │   │   ├── save/
│   │   │   │   └── route.ts
│   │   │   ├── analytics/
│   │   │   │   └── route.ts
│   │   │   └── resume/
│   │   │       └── route.ts
│   │   ├── fallback/
│   │   │   └── page.tsx              # Non-WebGL fallback
│   │   └── not-found.tsx             # 404 Easter egg
│   │
│   ├── features/                     # Feature-first modules
│   │   ├── campus/
│   │   │   ├── components/
│   │   │   │   ├── CampusDistrict.tsx
│   │   │   │   ├── Classroom.tsx
│   │   │   │   ├── DSALibrary.tsx
│   │   │   │   └── CodingLab.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCampusQuests.ts
│   │   │   │   └── useLanguageChallenge.ts
│   │   │   ├── stores/
│   │   │   │   └── campusStore.ts
│   │   │   ├── data/
│   │   │   │   ├── campus.config.json
│   │   │   │   ├── languageChallenges.json
│   │   │   │   └── npcs.json
│   │   │   └── index.ts
│   │   │
│   │   ├── software-city/
│   │   │   ├── components/
│   │   │   │   ├── SoftwareCityDistrict.tsx
│   │   │   │   ├── ProjectTower.tsx
│   │   │   │   ├── InternshipOffice.tsx
│   │   │   │   └── TechShowcase.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── data/
│   │   │   └── index.ts
│   │   │
│   │   ├── ai-research/
│   │   │   ├── components/
│   │   │   │   ├── AIDistrict.tsx
│   │   │   │   ├── FloatingLab.tsx
│   │   │   │   ├── MLVisualization.tsx
│   │   │   │   └── HologramDisplay.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── data/
│   │   │   └── index.ts
│   │   │
│   │   ├── open-source-valley/
│   │   │   ├── components/
│   │   │   │   ├── OpenSourceValley.tsx
│   │   │   │   ├── RepoTree.tsx
│   │   │   │   ├── PRFlower.tsx
│   │   │   │   └── OFFHQ.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── data/
│   │   │   └── index.ts
│   │   │
│   │   ├── hackathon-arena/
│   │   │   ├── components/
│   │   │   │   ├── Arena.tsx
│   │   │   │   ├── BossBattle.tsx
│   │   │   │   ├── CountdownTimer.tsx
│   │   │   │   └── VictoryCeremony.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── data/
│   │   │   └── index.ts
│   │   │
│   │   ├── sports-stadium/
│   │   │   ├── components/
│   │   │   │   ├── Stadium.tsx
│   │   │   │   ├── CricketMinigame.tsx
│   │   │   │   ├── BadmintonMinigame.tsx
│   │   │   │   └── TraitUnlock.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── data/
│   │   │   └── index.ts
│   │   │
│   │   ├── creator-district/
│   │   │   ├── components/
│   │   │   │   ├── CreatorDistrict.tsx
│   │   │   │   ├── GitHubTower.tsx
│   │   │   │   ├── LinkedInPlaza.tsx
│   │   │   │   └── LeetCodeDojo.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── data/
│   │   │   └── index.ts
│   │   │
│   │   ├── achievement-museum/
│   │   │   ├── components/
│   │   │   │   ├── Museum.tsx
│   │   │   │   ├── Exhibit.tsx
│   │   │   │   ├── TimelineWall.tsx
│   │   │   │   └── MedalDisplay.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── data/
│   │   │   └── index.ts
│   │   │
│   │   └── mission-control/
│   │       ├── components/
│   │       │   ├── MissionControl.tsx
│   │       │   ├── OverviewScreen.tsx
│   │       │   └── EndCredits.tsx
│   │       ├── hooks/
│   │       ├── stores/
│   │       ├── data/
│   │       └── index.ts
│   │
│   ├── systems/                      # Cross-cutting game systems
│   │   ├── player/
│   │   │   ├── PlayerController.tsx
│   │   │   ├── PlayerInput.ts
│   │   │   ├── PlayerAnimator.ts
│   │   │   └── player.config.ts
│   │   │
│   │   ├── camera/
│   │   │   ├── CameraSystem.tsx
│   │   │   ├── CameraShake.ts
│   │   │   ├── CinematicCamera.ts
│   │   │   └── camera.config.ts
│   │   │
│   │   ├── dialogue/
│   │   │   ├── DialogueSystem.tsx
│   │   │   ├── DialogueBubble.tsx
│   │   │   ├── ChoicePanel.tsx
│   │   │   ├── dialogue.types.ts
│   │   │   └── dialogue.config.ts
│   │   │
│   │   ├── quest/
│   │   │   ├── QuestManager.ts
│   │   │   ├── QuestTracker.tsx
│   │   │   ├── quest.types.ts
│   │   │   └── quests.config.ts
│   │   │
│   │   ├── knowledge/
│   │   │   ├── KnowledgeSystem.ts
│   │   │   ├── KnowledgeBar.tsx
│   │   │   ├── SkillUnlock.tsx
│   │   │   └── knowledge.config.ts
│   │   │
│   │   ├── save/
│   │   │   ├── SaveManager.ts
│   │   │   ├── SaveSlotUI.tsx
│   │   │   └── save.types.ts
│   │   │
│   │   ├── audio/
│   │   │   ├── AudioManager.ts
│   │   │   ├── MusicSystem.ts
│   │   │   ├── SFXSystem.ts
│   │   │   ├── SpatialAudio.ts
│   │   │   └── audio.config.ts
│   │   │
│   │   ├── npc/
│   │   │   ├── NPCSpawner.tsx
│   │   │   ├── NPCBehavior.ts
│   │   │   ├── NPCAnimator.ts
│   │   │   └── npc.types.ts
│   │   │
│   │   ├── lighting/
│   │   │   ├── LightingManager.tsx
│   │   │   ├── DayNightCycle.ts
│   │   │   ├── WeatherSystem.ts
│   │   │   └── lighting.config.ts
│   │   │
│   │   └── interaction/
│   │       ├── InteractionSystem.tsx
│   │       ├── InteractionPrompt.tsx
│   │       ├── TriggerVolume.ts
│   │       └── interaction.types.ts
│   │
│   ├── components/                   # Shared UI components
│   │   ├── ui/                       # Atomic UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── GlassPanel.tsx
│   │   │   ├── HologramText.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Notification.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── three/                    # Shared 3D components
│   │   │   ├── FloatingObject.tsx
│   │   │   ├── RotatingObject.tsx
│   │   │   ├── HologramEffect.tsx
│   │   │   ├── NeonGlow.tsx
│   │   │   ├── PortalEffect.tsx
│   │   │   ├── ParticleEffect.tsx
│   │   │   └── TransitionScreen.tsx
│   │   │
│   │   └── layout/
│   │       ├── LoadingScreen.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── SuspenseWrapper.tsx
│   │
│   ├── hooks/                        # Shared hooks
│   │   ├── useKeyboard.ts
│   │   ├── useGamepad.ts
│   │   ├── useAssetPreloader.ts
│   │   ├── useDeviceCapabilities.ts
│   │   ├── useIdleTimer.ts
│   │   └── useReducedMotion.ts
│   │
│   ├── stores/                       # Root stores
│   │   ├── gameStore.ts
│   │   ├── dialogueStore.ts
│   │   ├── settingsStore.ts
│   │   ├── saveStore.ts
│   │   └── uiStore.ts
│   │
│   ├── lib/                          # Utilities
│   │   ├── math/
│   │   │   ├── vectors.ts
│   │   │   ├── easing.ts
│   │   │   └── interpolation.ts
│   │   ├── asset/
│   │   │   ├── AssetCache.ts
│   │   │   ├── AssetLoader.ts
│   │   │   └── AssetOptimizer.ts
│   │   ├── webgl/
│   │   │   ├── detectWebGL.ts
│   │   │   ├── getGPUInfo.ts
│   │   │   └── getRenderCapabilities.ts
│   │   ├── perf/
│   │   │   ├── FPSMonitor.ts
│   │   │   ├── MemoryMonitor.ts
│   │   │   └── AdaptiveQuality.ts
│   │   ├── storage/
│   │   │   ├── indexedDB.ts
│   │   │   └── localStorage.ts
│   │   └── utils/
│   │       ├── clamp.ts
│   │       ├── lerp.ts
│   │       ├── noop.ts
│   │       └── debounce.ts
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── game.ts
│   │   ├── district.ts
│   │   ├── npc.ts
│   │   ├── quest.ts
│   │   ├── dialogue.ts
│   │   ├── knowledge.ts
│   │   ├── achievement.ts
│   │   ├── save.ts
│   │   └── three.ts                  # Three.js type extensions
│   │
│   ├── constants/                    # Game constants
│   │   ├── districts.ts
│   │   ├── controls.ts
│   │   ├── physics.ts
│   │   ├── rendering.ts
│   │   └── story.ts
│   │
│   ├── data/                         # Global data files
│   │   ├── npcs/
│   │   │   └── npcs.json
│   │   ├── quests/
│   │   │   └── quests.json
│   │   ├── dialogue/
│   │   │   └── dialogue.json
│   │   ├── achievements/
│   │   │   └── achievements.json
│   │   └── skills/
│   │       └── skills.json
│   │
│   └── shaders/                      # Custom GLSL shaders
│       ├── hologram.vert.glsl
│       ├── hologram.frag.glsl
│       ├── portal.vert.glsl
│       ├── portal.frag.glsl
│       ├── neon.vert.glsl
│       └── neon.frag.glsl
│
├── scripts/                          # Build and dev scripts
│   ├── optimize-models.ts            # Draco compress all GLBs
│   ├── compress-textures.ts          # Convert to KTX2/Basis
│   ├── generate-types.ts             # Generate TS types from data
│   └── validate-data.ts              # Validate JSON data files
│
├── .vscode/
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
│
├── .editorconfig
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── .lintstagedrc.js
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
├── LICENSE
├── README.md
└── TAD-v1.md
```

### 8.2 Folder Rationale

| Folder | Purpose | Why |
|---|---|---|
| `features/` | Feature-first modules | Each district is a self-contained feature with its own components, hooks, stores, and data. Deleting a district = deleting one folder. |
| `systems/` | Cross-cutting game systems | Player, camera, dialogue, quests — these exist across all features. They are not owned by any single district. |
| `components/ui/` | Atomic UI primitives | Reusable, themable UI components. No game logic. Any district can use them. |
| `components/three/` | Shared 3D composables | Reusable Three.js object wrappers. Hologram, particle effects, portals — used everywhere. |
| `lib/` | Utilities | Pure functions with zero React dependency. Testable in isolation. |
| `types/` | Global TypeScript types | Shared type definitions used across features and systems. |
| `data/` | Global data | JSON data files for NPCs, quests, dialogue, achievements. District-specific data lives in the feature folder. |
| `shaders/` | GLSL shaders | Custom shaders as raw `.glsl` files. Imported as strings via Webpack/Vite loader. |

### 8.3 File Naming Conventions

| Pattern | Example | Rule |
|---|---|---|
| Component | `PlayerController.tsx` | PascalCase, default export |
| Hook | `useKeyboard.ts` | camelCase, named export |
| Store | `gameStore.ts` | camelCase, named export |
| Type | `npc.types.ts` | kebab-case type files |
| Config | `district.config.ts` | camelCase, named export |
| Data | `npcs.json` | kebab-case JSON files |
| Utility | `vectors.ts` | camelCase, named export |
| System | `SaveManager.ts` | PascalCase class export |
| Shader | `hologram.frag.glsl` | kebab-case, extension indicates type |

---

## 9. Coding Standards

### 9.1 TypeScript Strictness

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  }
}
```

### 9.2 Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Interfaces | PascalCase, `I` prefix optional | `interface PlayerState` |
| Types | PascalCase | `type DistrictID = string` |
| Enums | PascalCase | `enum PlayerState { Idle, Walking, Running }` |
| Functions | camelCase | `function calculateDistance()` |
| Variables | camelCase | `const currentDistrict = ...` |
| Constants | UPPER_SNAKE | `const MAX_PLAYER_SPEED = 10` |
| Private fields | `#` prefix | `class SaveManager { #cache }` |
| Branded types | PascalCase + Brand | `type NPCID = string & { __brand: 'NPC' }` |

### 9.3 Composition Patterns

**Prefer composition over inheritance everywhere.**

```typescript
// ✅ Composition — game entity behavior
interface EntityBehavior {
  onInteract(player: Player): void
  onProximityEnter(player: Player): void
  onProximityExit(player: Player): void
  onUpdate(delta: number): void
}

// Compose behaviors onto entities
type NPC = {
  id: NPCID
  position: Vector3
  model: GLTF
  behaviors: EntityBehavior[]
}
```

### 9.4 Error Boundaries

Every district and every system gets its own error boundary:

```typescript
// Error boundaries at three levels:
// 1. Top-level (app crash → show "reload" screen)
// 2. Game level (district crash → return to hub, show notification)
// 3. Component level (NPC fail to load → hide NPC, continue)
```

Error boundaries never catch:
- Event handler errors (handled separately)
- Async errors (caught in promises)
- R3F canvas errors (caught by R3F's built-in error handling)

### 9.5 Testing Strategy

| Layer | Tool | What to Test |
|---|---|---|
| Pure functions (lib/) | Vitest | Math, utils, data transforms |
| Zustand stores | Vitest | State transitions, actions, persistence |
| Data files | Vitest + script | Schema validation, referential integrity |
| Components (UI) | Vitest + Testing Library | Rendering, interaction, accessibility |
| 3D Components | Vitest + custom mocks | Lifecycle, prop changes |
| Systems | Vitest | Quest logic, dialogue flow, save/load |
| E2E | Playwright | Full game flow, loading, navigation |

---

## 10. Performance Philosophy

### 10.1 Core Principles

1. **60 FPS is non-negotiable on target hardware.** Every feature must prove it can run at 60 FPS before being accepted.

2. **Performance budgets are a hard contract.** Exceeding a budget requires a formal engineering review.

3. **Profile before optimizing, then profile again.** Intuition about performance bottlenecks is frequently wrong.

4. **Lower-end hardware is a first-class concern, not an afterthought.** Adaptive quality system handles degradation gracefully.

5. **Memory is a finite resource.** Every allocation must be justified. GC pressure is the enemy of frame time stability.

### 10.2 Adaptive Quality System

```typescript
interface QualityProfile {
  label: 'low' | 'medium' | 'high' | 'ultra'
  pixelRatio: number
  shadowResolution: number
  shadowCascades: number
  postProcessing: boolean
  particleCount: number
  drawDistance: number
  lodBias: number
  textureQuality: number // 0-1 multiplier
  ambientOcclusion: boolean
  bloom: boolean
  ssr: boolean
}
```

**Detection on boot:**
1. Detect GPU via WebGL renderer info
2. Measure frame time over 120 frames
3. Assign initial quality profile
4. Monitor frame time continuously
5. Auto-adjust down if frame budget exceeded for 2+ seconds
6. Auto-adjust up if headroom > 20ms for 10+ seconds

### 10.3 WebGL Optimization Techniques

| Technique | Impact | Implementation |
|---|---|---|
| Instanced Meshes | Massive | `THREE.InstancedMesh` for trees, props, buildings |
| Geometry Merging | Massive | `BufferGeometryUtils.mergeGeometries` for static district geometry |
| LOD | High | `THREE.LOD` with 3 levels per model |
| Frustum Culling | High | Built-in Three.js, plus manual distance culling |
| Texture Atlases | High | Combine small textures into atlas |
| Draco Compression | High | All GLB assets compressed |
| KTX2 Textures | High | GPU-native texture compression (BC7, ASTC) |
| Object Pooling | Medium | Reuse vectors, matrices, raycaster |
| Render-on-Demand | Medium | Pause render loop when no input for 5s |
| Offscreen Canvas | Medium | Procedural textures generated off main thread |
| Web Workers | Medium | Physics simulation on worker, asset decoding on worker |

### 10.4 Memory Management Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Memory Budget: 512MB                      │
├─────────────────────────────────────────────────────────────┤
│  Textures (KTX2)        200MB  ████████████████░░░░░░░░░░░   │
│  Geometry (merged)      100MB  ████████░░░░░░░░░░░░░░░░░░░   │
│  Audio (streamed)        80MB  ██████░░░░░░░░░░░░░░░░░░░░░   │
│  Animations              40MB  ███░░░░░░░░░░░░░░░░░░░░░░░░   │
│  UI Assets               20MB  █░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  Framebuffers            40MB  ███░░░░░░░░░░░░░░░░░░░░░░░░   │
│  Misc                    32MB  ██░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  Headroom                10%   ░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────────────────────────┘
```

### 10.5 Bundle Size Budget

| Bundle | Budget | Mechanism |
|---|---|---|
| Main JS (game entry) | < 150KB | code splitting, dynamic imports |
| R3F + Three.js | < 200KB (gzip) | tree-shaken imports |
| Drei | < 30KB (gzip) | import only what's used |
| Rapier WASM | < 300KB | lazy-loaded on interaction |
| GSAP | < 25KB (gzip) | single import |
| Framer Motion | < 35KB (gzip) | `m` import for reduced size |
| Zustand | < 2KB (gzip) | negligible |
| Tailwind | < 10KB (gzip) | purged unused styles |

---

## 11. Scalability Philosophy

### 11.1 Adding New Districts

Adding a new district follows a strict pattern:

1. Create `src/features/new-district/`
2. Add files: `components/`, `hooks/`, `stores/`, `data/`
3. Export from `index.ts`
4. Register district in `src/constants/districts.ts`
5. Add district geometry to asset pipeline
6. Add fast travel point to hub
7. Done — no other files touched

This is only possible because of the **feature-first architecture** enforced from day one.

### 11.2 Adding New NPC Types

1. Add type to `src/types/npc.ts`
2. Add behavior class to `src/systems/npc/NPCBehavior.ts`
3. Register in NPC spawner
4. Add dialogue data to `src/data/dialogue/` or feature-specific `data/`

### 11.3 Adding New Quest Types

1. Define quest type in `src/types/quest.ts`
2. Implement quest logic in `src/systems/quest/QuestManager.ts`
3. Add quest data to `src/data/quests/`
4. Quest appears in quest log automatically

### 11.4 Asset Pipeline Scalability

The asset pipeline is designed for **100+ GLB models, 500+ textures, and 50+ audio files**:

- All assets are referenced by ID, not file path
- Asset manifest (`assets.json`) auto-generated by pipeline script
- Texture atlas packing is automated
- LOD generation is automated (Blender Python script)
- GLTF transform pipeline (Draco compress, optimize, validate)

---

## 12. Asset Pipeline

### 12.1 Source Asset Workflow

```
Blender (.blend)
    │
    ├─ GLTF Export (with Draco compression)
    │   ├─ model.glb
    │   ├─ textures/ (PNG source)
    │   └─ model-draco.glb (compressed)
    │
    ├─ Texture Export
    │   ├─ Base Color → PNG → KTX2 (Basis Universal)
    │   ├─ Normal Map → PNG → KTX2
    │   ├─ Roughness → PNG → KTX2 (single channel)
    │   ├─ Metallic → PNG → KTX2 (single channel)
    │   ├─ AO → PNG → KTX2 (single channel)
    │   └─ Emissive → PNG → KTX2
    │
    └─ LOD Generation (automated script)
        ├─ LOD0 (full detail)
        ├─ LOD1 (50% decimation)
        └─ LOD2 (20% decimation, baked normal)
```

### 12.2 Pipeline Scripts

```typescript
// scripts/optimize-models.ts
// - Takes all .glb in /raw-models/
// - Runs through glTF Transform pipeline
// - Draco compression (level 5)
// - Mesh deduplication
// - Texture channel packing
// - Outputs to public/assets/models/

// scripts/compress-textures.ts
// - Takes all source textures
// - Converts to KTX2 via toktx CLI
// - Basis Universal compression
// - Generates mipmaps
// - Outputs to public/assets/textures/

// scripts/validate-data.ts
// - Validates all JSON data files
// - Checks referential integrity (NPC IDs match, quest IDs exist)
// - Ensures no orphaned references
// - Generates TypeScript types from data
```

### 12.3 Runtime Asset Loading

```typescript
// Centralized asset loading with LRU cache
async function loadDistrictAssets(districtID: DistrictID): Promise<void> {
  const manifest = await loadManifest(districtID)
  
  const loads = manifest.assets.map(async (entry) => {
    switch (entry.type) {
      case 'model':
        return loadModel(entry.path, {
          draco: true,
          onProgress: entry.onProgress,
        })
      case 'texture':
        return loadTexture(entry.path, {
          format: 'ktx2',
        })
      case 'audio':
        return loadAudio(entry.path, {
          stream: entry.stream ?? false,
        })
    }
  })
  
  await Promise.all(loads)
}
```

### 12.4 Asset Naming Convention

```
Assets follow a strict naming convention:

{type}-{district}-{category}-{name}-{variant}.{ext}

Example:
model-campus-building-classroom-a.glb
texture-campus-building-classroom-wall-albedo.ktx2
audio-softwarecity-ambient-street.ogg
```

This ensures:
- No name collisions across districts
- Auto-completion in IDE
- Self-documenting file names
- Easy glob patterns for batch operations

---

## 13. Build Pipeline

### 13.1 Development Workflow

```bash
# Start development
pnpm dev

# What happens:
# 1. Next.js dev server starts (HMR)
# 2. TypeScript watch mode
# 3. Tailwind JIT compiler
# 4. All on file save
```

### 13.2 Production Build

```bash
# Build for production
pnpm build

# What happens:
# 1. TypeScript type check (strict)
# 2. ESLint (all rules)
# 3. Unit tests pass
# 4. Data validation passes
# 5. Next.js build (static + server)
# 6. Bundle analysis report generated
# 7. Build output validated
```

### 13.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm validate-data

  build:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v2

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v2
```

### 13.4 Bundle Analysis

Every production build generates a bundle analysis report:

```bash
# Manual trigger
pnpm analyze
```

This uses `@next/bundle-analyzer` to visualize:
- Module sizes by chunk
- Duplicate dependencies
- Tree-shaking effectiveness
- Code-splitting boundaries

### 13.5 Environment Configuration

```bash
# .env.example
NEXT_PUBLIC_SITE_URL=https://saiverse.dev
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# API keys (server-side only)
CONTACT_EMAIL_TO=hello@saiteja.dev
RESEND_API_KEY=
GITHUB_TOKEN=
```

All environment variables:
- `NEXT_PUBLIC_*` — exposed to client (bundle-included). Used only for non-sensitive config.
- Non-prefixed — server-only. Used in API routes.

---

## 14. Data Flow

### 14.1 High-Level Data Flow

```
User Input
    │
    ▼
PlayerController (captures input)
    │
    ▼
Game Systems (process per frame)
    ├─ Movement System → updates player position in store
    ├─ Physics System → resolves collisions via Rapier
    ├─ Interaction System → checks proximity to interactables
    ├─ Quest System → checks quest conditions
    ├─ NPC System → updates NPC behaviors
    ├─ Dialogue System → manages active dialogue
    └─ Knowledge System → tracks skill progress
    │
    ▼
Zustand Stores (reactive state)
    ├─ gameStore → triggers UI updates
    ├─ dialogueStore → triggers DialogueUI
    ├─ uiStore → triggers HUD, notifications
    └─ saveStore → triggers auto-save
    │
    ▼
React Component Tree (re-renders affected branches)
    ├─ R3F Canvas → updates 3D scene via refs
    └─ Overlay UI → updates HTML UI via React reconciliation
    │
    ▼
GPU / DOM (final output)
```

### 14.2 Event Bus Architecture

For decoupled communication between systems:

```typescript
// Event types
type GameEvent =
  | { type: 'DISTRICT_ENTERED'; district: DistrictID }
  | { type: 'DISTRICT_EXITED'; district: DistrictID }
  | { type: 'QUEST_STARTED'; quest: QuestID }
  | { type: 'QUEST_COMPLETED'; quest: QuestID }
  | { type: 'KNOWLEDGE_UPDATED'; skill: SkillID; value: number }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievement: AchievementID }
  | { type: 'NPC_INTERACTED'; npc: NPCID }
  | { type: 'DIALOGUE_STARTED'; npc: NPCID; node: DialogueNodeID }
  | { type: 'DIALOGUE_ENDED'; npc: NPCID }
  | { type: 'ITEM_COLLECTED'; item: ItemID }
  | { type: 'SAVE_TRIGGERED'; slot: string }
  | { type: 'LOAD_COMPLETE' }
  | { type: 'ERROR'; source: string; error: Error }

// Event bus (simple pub/sub)
class EventBus {
  private listeners: Map<GameEvent['type'], Set<Function>>
  
  emit(event: GameEvent): void
  on(type: GameEvent['type'], handler: Function): () => void // returns unsubscribe
  off(type: GameEvent['type'], handler: Function): void
  clear(): void
}

// Singleton
export const eventBus = new EventBus()
```

**Why not use Zustand subscriptions for everything?**

Events decouple systems. A quest system should not import a dialogue store. It should emit a `QUEST_COMPLETED` event, and any interested system can react. This keeps the dependency graph acyclic.

### 14.3 Frame Update Loop

```typescript
// Inside GameCanvas.tsx
function GameLoop() {
  useFrame((state, delta) => {
    // Clamp delta to prevent spiral of death
    const dt = Math.min(delta, 1 / 30)
    
    // 1. Input
    const input = InputManager.getFrameInput()
    
    // 2. Physics (fixed timestep)
    physicsWorld.step(1 / 60)
    
    // 3. Game systems
    playerSystem.update(dt, input)
    cameraSystem.update(dt)
    npcSystem.update(dt)
    interactionSystem.update()
    questSystem.update(dt)
    audioSystem.update(dt)
    
    // 4. Adaptive quality check (every 60 frames)
    performanceMonitor.tick(dt)
  })
}
```

---

## 15. Error Handling

### 15.1 Error Classification

| Class | Severity | Examples | Response |
|---|---|---|---|
| **Fatal** | Game cannot continue | WebGL not supported, critical asset missing | Show error screen with reload + fallback link |
| **Severe** | Feature broken, game continues | District failed to load, NPC missing | Show notification, log to analytics, disable feature |
| **Warning** | Non-critical failure | Animation failed to play, sound failed | Log to console, continue silently |
| **Info** | Expected edge case | Save not found, achievement already unlocked | Handle gracefully, no user-facing error |

### 15.2 Error Boundaries (Three Levels)

```typescript
// Level 1: App Shell
class AppErrorBoundary extends React.Component {
  // Catches: Entire app crash
  // Shows: "Something went wrong" screen + reload button
}

// Level 2: Game Canvas
class GameErrorBoundary extends React.Component {
  // Catches: R3F canvas crash, critical game system failure
  // Shows: "SaiVerse encountered an issue" + return to title + resume option
}

// Level 3: District / Feature
class DistrictErrorBoundary extends React.Component {
  // Catches: District component crash, asset load failure
  // Shows: Notification + teleport back to hub
}
```

### 15.3 Asset Loading Errors

```typescript
async function loadWithFallback<T>(
  loader: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> {
  try {
    return await loader()
  } catch (error) {
    console.error(`[Asset] Failed to load ${context}:`, error)
    eventBus.emit({ type: 'ERROR', source: context, error: error as Error })
    return fallback
  }
}

// Usage:
const model = await loadWithFallback(
  () => loadGLTF('/models/campus.glb'),
  createPlaceholderMesh(), // simple box with label
  'campus district model'
)
```

### 15.4 Analytics / Telemetry

```typescript
// Opt-in, GDPR-compliant
interface TelemetryEvent {
  type: 'error' | 'performance' | 'progress' | 'interaction'
  category: string
  action: string
  label?: string
  value?: number
  metadata?: Record<string, unknown>
  timestamp: number
  sessionId: string
}
```

- Only collected if user opts in (GDPR banner on first load)
- No PII collected
- Errors are grouped and de-duplicated
- Performance data collected anonymously (used to tune adaptive quality)
- Stored in Vercel Analytics + custom API route

---

## 16. Design Principles

### 16.1 The Immersion Principle

> **The player should never be reminded they are in a browser.**

This means:
- No browser UI visible during gameplay (automatic fullscreen on game route)
- No scrollbars, no address bar, no navigation
- No loading spinners that break immersion (loading is diegetic — the train arrival scene IS the loading screen)
- UI elements fade in/out contextually, never persistent
- Error messages are in-universe ("The signal is weak in this district")

### 16.2 The Show Don't Tell Principle

> **Every piece of information is communicated through gameplay, not text.**

- Sai learns Java? A mini-game where you write your first Java program.
- Sai completed an internship? The building appears in Software City.
- Sai contributed to open source? Trees bloom in Open Source Valley.
- Sai won a hackathon? The crowd cheers, fireworks explode.

**If it can be shown, never write it.**

### 16.3 The Reward Curiosity Principle

> **The most interesting content is hidden, not handed.**

- Visible path: follow the main road, complete main quests
- Hidden path: explore alleyways, find secret rooms
- The best story moments are rewards for off-path exploration
- NPCs with unique dialogue are tucked around corners
- Easter eggs are abundant

### 16.4 The Diegetic UI Principle

> **Every UI element exists in the world, not on a screen.**

- Knowledge is displayed as a holographic projection from Sai's watch
- Quest log appears as a physical journal
- Inventory is Sai's backpack
- Health/status is shown through Sai's posture and movement speed
- Notifications appear as floating holograms in the world space

### 16.5 The Zero Friction Principle

> **Playing the game should require zero instructions.**

- WASD/arrow keys to move — universal
- E to interact — standard
- Tab for quest log — convention
- Escape for pause — universal
- Mouse to look around — standard FPS/TPS control
- No tutorial text popups. The first NPC (at the train station) gives contextual guidance through dialogue.

### 16.6 The Cinematic Timing Principle

> **Every transition, every animation, every sound has intentional timing.**

- District transitions: 1.5s fade + camera fly-through
- Dialogue typing: character-by-character, speed varies by NPC personality
- Knowledge increase: animated holographic bars that fill smoothly
- Quest completion: 0.5s pause, then notification slides in, then sound effect
- Nothing happens instantly. Everything has weight and rhythm.

---

## 17. Future Expansion Strategy

### 17.1 Phase-Based Expansion

```
Phase 1 (Foundation)    → Project setup, hub, basic movement, camera
Phase 2 (Campus)        → Complete district, quests, dialogue, knowledge system
Phase 3 (Software City) → Project buildings, internship office
Phase 4 (AI District)   → Interactive ML demos
Phase 5 (Open Source)   → Tree system, contribution timeline
Phase 6 (Hackathon)     → Boss battle mechanics
Phase 7 (Sports)        → Mini games
Phase 8 (Finale)        → Creator district, museum, mission control
Phase 9 (Polish)        → Optimization, audio, easter eggs, mobile fallback
```

Each phase is:
- Independent (can be demoed in isolation)
- Deployable (can be deployed without later phases)
- Testable (has specific test criteria)

### 17.2 Future Features (Post-Launch)

| Feature | Complexity | Impact |
|---|---|---|
| **Multiplayer** — see other visitors in the world | Very High | Viral potential |
| **Photo Mode** — cinematic filters, pose Sai, share screenshots | Medium | Social sharing |
| **Leaderboard** — fastest 100% completion | Low | Replayability |
| **Speedrun Mode** — timers, splits, timer | Low | Community |
| **Seasonal Events** — Diwali lights, New Years fireworks | Medium | Returning visitors |
| **Soundtrack Release** — embed Spotify player in museum | Low | Extra touch |
| **AR Mode** — view achievements in AR via phone | High | Novelty |
| **Analytics Dashboard** — see visitor paths through the world | Medium | Value to me |

### 17.3 Technical Debt Prevention

| Practice | Frequency | Owner |
|---|---|---|
| Bundle size regression check | Every PR | CI |
| Performance regression benchmark | Every PR | CI |
| Memory leak audit | Every milestone | Dev |
| Dependency audit (`pnpm audit`) | Weekly | CI |
| TypeScript strictness check | Every commit | Pre-commit |
| Unused code detection | Every milestone | Script |
| Accessibility audit | Every milestone | Manual |

### 17.4 Exit Strategy

If the project grows beyond maintainable scope:

1. **Standalone micro-frontends** — each district becomes a separate Next.js app, composed via module federation
2. **Dedicated asset server** — offload GLB/ texture serving to CDN with smarter caching
3. **WebGL → WebGPU migration** — future-proof rendering pipeline (WebGPU lands 2025-2026 in stable Chrome)
4. **Native wrapper** — Tauri or Electron wrapper for desktop performance boost

---

## Appendix A: Technology Versions

| Technology | Version | Notes |
|---|---|---|
| Node.js | 20 LTS | Required for build |
| Next.js | 14+ | App Router |
| React | 18+ | Server Components + Client |
| Three.js | 0.160+ | Latest stable |
| @react-three/fiber | 8+ | Latest stable |
| @react-three/drei | 9+ | Latest stable |
| @react-three/rapier | 1+ | Latest stable |
| @react-three/postprocessing | 2+ | Latest stable |
| Zustand | 4+ | With persist + immer |
| GSAP | 3.12+ | With ScrollTrigger |
| Framer Motion | 10+ | Latest stable |
| Tailwind CSS | 3+ | With v3.4 features |
| TypeScript | 5+ | strict mode |
| pnpm | 8+ | Package manager |
| Blender | 4.0+ | For asset creation |

## Appendix B: Data Schema Types

```typescript
// District
interface DistrictConfig {
  id: DistrictID
  name: string
  description: string
  position: [number, number, number] // world position
  requiredKnowledge: number
  loadingRadius: number
  activeRadius: number
  assets: AssetManifest
  spawnPoint: [number, number, number]
  npcs: NPCID[]
  quests: QuestID[]
  ambientMusic: string
  weather: WeatherConfig
}

// NPC
interface NPCConfig {
  id: NPCID
  name: string
  type: NPCTrait // 'professor' | 'mentor' | 'friend' | ...
  model: string
  position: [number, number, number]
  rotation: number
  dialogueTree: DialogueNodeID
  behaviors: BehaviorConfig[]
  schedule: ScheduleEntry[]
  knowledgeReward: number
}

// Quest
interface QuestConfig {
  id: QuestID
  title: string
  description: string
  district: DistrictID
  type: QuestType // 'main' | 'side' | 'hidden'
  prerequisites: QuestID[]
  conditions: QuestCondition[]
  steps: QuestStep[]
  rewards: QuestReward
  dialogueTrigger?: DialogueNodeID
}

// Dialogue
interface DialogueNode {
  id: DialogueNodeID
  speaker: string
  text: string
  animation?: string
  camera?: CameraAction
  choices?: DialogueChoice[]
  next?: DialogueNodeID
  condition?: () => boolean
  onEnter?: () => void
  onExit?: () => void
}

// Knowledge / Skill
interface SkillConfig {
  id: SkillID
  name: string
  category: SkillCategory
  icon: string
  maxLevel: number
  knowledgeValue: number
  unlockCriteria: Condition[]
  visualEffects: VisualEffect[]
}
```

## Appendix C: Performance Budget Checklist

- [ ] All GLB models Draco-compressed
- [ ] All textures KTX2 compressed
- [ ] All textures have mipmaps
- [ ] All static geometry uses merged geometry or instancing
- [ ] LOD models exist for all main assets
- [ ] Distant objects use impostors (billboard textures)
- [ ] Post-processing disabled on low-quality profile
- [ ] Shadows disabled on low-quality profile
- [ ] Asset cache LRU eviction active
- [ ] No memory leaks from dispose patterns
- [ ] Bundle size within budgets
- [ ] Code splitting at district boundaries
- [ ] Dynamic imports for all heavy dependencies
- [ ] Web Worker for physics
- [ ] Frame time monitoring active
- [ ] Adaptive quality system operational

---

**End of Technical Architecture Document v1**

*Next steps after approval:*
1. Repository initialization (README, license, configs)
2. Scaffold complete folder structure
3. `package.json` with all dependencies
4. Basic Next.js app with R3F canvas
5. Title screen / landing page
6. Player controller with movement
