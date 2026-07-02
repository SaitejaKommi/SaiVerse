# SaiVerse Documentation

## Overview

SaiVerse is a browser-based 3D adventure game that transforms a traditional software engineering portfolio into an immersive interactive experience. Instead of scrolling through pages, visitors explore a fictional Bengaluru, interact with characters, solve challenges, and naturally discover projects, achievements, and skills.

## Architecture Documents

- **[TAD-v1.md](../TAD-v1.md)** — Technical Architecture Document
- **[GDD-v1.md](../todo-GDD.md)** — Game Design Document (generated separately)

## Project Structure

```
saiverse/
├── src/                    # Application source code
│   ├── app/                # Next.js App Router routes
│   ├── components/         # Shared React components
│   ├── features/           # Feature-first modules (per district)
│   ├── systems/            # Cross-cutting game systems
│   ├── hooks/              # Shared React hooks
│   ├── stores/             # Zustand stores
│   ├── lib/                # Pure utility functions
│   ├── types/              # Global TypeScript definitions
│   └── shaders/            # Custom GLSL shaders
├── assets/                 # Source asset files (blend, psd, etc.)
├── config/                 # Application configuration
├── constants/              # Game constants
├── providers/              # React context providers
├── public/                 # Static assets served by Next.js
│   ├── models/             # Compiled GLB models
│   ├── textures/           # KTX2 compressed textures
│   ├── audio/              # Game audio files
│   ├── fonts/              # Web fonts
│   └── icons/              # Site icons and metadata
└── docs/                   # Documentation
```

## Key Technologies

| Technology           | Purpose                        |
| -------------------- | ------------------------------ |
| Next.js (App Router) | Framework, routing, API routes |
| React Three Fiber    | 3D rendering in React          |
| Three.js / Drei      | 3D engine and helpers          |
| Rapier               | Physics engine                 |
| Zustand              | State management               |
| GSAP                 | 3D / camera animation          |
| Framer Motion        | UI animation                   |
| Tailwind CSS         | Styling                        |

## Development

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm lint     # Lint code
pnpm typecheck # TypeScript type check
```

See `../CONTRIBUTING.md` for contribution guidelines.
