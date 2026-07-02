# SaiVerse

**An interactive 3D adventure game that tells my engineering journey.**

This is not a portfolio website. It's a browser-based 3D adventure game where visitors experience the complete journey of Sai — from a beginner with zero programming knowledge to a software engineer, open-source contributor, hackathon winner, and lifelong learner.

Instead of scrolling through pages, visitors explore an immersive fictional Bengaluru, interact with characters, solve challenges, unlock skills, and naturally discover every project, internship, open source contribution, hackathon, achievement, and personality trait.

---

## Philosophy

Every engineer starts at Level 0. Skills are not given — they are earned. This project celebrates curiosity, persistence, experimentation, and continuous learning. The experience never feels like self-promotion. Instead, the visitor uncovers the story naturally through exploration.

---

## Stack

| Concern   | Technology                   |
| --------- | ---------------------------- |
| Framework | Next.js 15 (App Router)      |
| 3D Engine | React Three Fiber + Three.js |
| Physics   | Rapier                       |
| Animation | GSAP + Framer Motion         |
| State     | Zustand                      |
| Styling   | Tailwind CSS                 |
| Language  | TypeScript (strict)          |
| Assets    | Blender → GLTF/GLB + KTX2    |

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
saiverse/
├── src/                  # Source code
│   ├── app/              # Next.js App Router
│   ├── components/       # Shared components
│   ├── features/         # Feature modules (districts)
│   ├── systems/          # Game systems
│   ├── stores/           # Zustand stores
│   └── lib/              # Utilities
├── assets/               # Source assets
├── public/               # Served assets
├── docs/                 # Documentation
├── config/               # Configuration
└── constants/            # Game constants
```

---

## Development Roadmap

1. **Phase 1** — Repository initialization, project scaffold, CI/CD
2. **Phase 2** — Core engine (R3F canvas, player controller, physics, camera)
3. **Phase 3** — Game framework (dialogue, quests, knowledge system, save)
4. **Phase 4** — Hub world (Bengaluru Central)
5. **Phase 5+** — Individual districts (Campus, Software City, AI District, etc.)

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Author

**Saiteja Kommi** — [GitHub](https://github.com/SaitejaKommi) · [LinkedIn](https://linkedin.com/in/saitejakommi)

> _Every expert once stood exactly where you are now._
