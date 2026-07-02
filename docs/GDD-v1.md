# SaiVerse — Game Design Document v1

**Status:** Draft
**Version:** 1.0
**Author:** Staff Software Engineer / Game Designer
**Last Updated:** 2026-07-02

---

## Table of Contents

1. [Story](#1-story)
2. [World Hub](#2-world-hub)
3. [BITS & Scaler Campus](#3-bits--scaler-campus)
4. [Software City](#4-software-city)
5. [AI Research District](#5-ai-research-district)
6. [Open Source Valley](#6-open-source-valley)
7. [Hackathon Arena](#7-hackathon-arena)
8. [Sports Stadium](#8-sports-stadium)
9. [Creator District](#9-creator-district)
10. [Achievement Museum](#10-achievement-museum)
11. [Skyline Observation Deck](#11-skyline-observation-deck)
12. [Mission Control](#12-mission-control)
13. [NPC Encyclopedia](#13-npc-encyclopedia)
14. [Complete Quest Log](#14-complete-quest-log)
15. [Collectibles](#15-collectibles)
16. [Easter Eggs](#16-easter-eggs)
17. [Puzzles & Challenges](#17-puzzles--challenges)
18. [Interaction Design](#18-interaction-design)
19. [Boss Battle](#19-boss-battle)
20. [Player Progression](#20-player-progression)
21. [Dialogue System Design](#21-dialogue-system-design)
22. [Reward System](#22-reward-system)
23. [UI Flow](#23-ui-flow)
24. [Audio Design](#24-audio-design)
25. [Lighting Design Per District](#25-lighting-design-per-district)
26. [Weather System](#26-weather-system)
27. [Camera Moments](#27-camera-moments)
28. [Emotional Pacing](#28-emotional-pacing)
29. [Hidden Content](#29-hidden-content)

---

## 1. Story

### 1.1 Logline

A mysterious mentor arrives in a fictional Bengaluru to guide a complete beginner named Sai through his transformation from zero knowledge to accomplished software engineer, discovering that the mentor's purpose is tied to Sai's future self.

### 1.2 Opening Cinematic (2 minutes)

FADE IN: BLACK SCREEN. System boot sound. Text appears: "INITIALIZING HUMAN... NAME: SAI... KNOWLEDGE: 0%... EXPERIENCE: 0... DREAM: BECOME AN ENGINEER". Screen glitches. A deep voice: "Every expert once stood exactly where you are now. The question isn't whether you'll become an engineer. The question is: what kind will you become?"

A train horn. The camera rises over Bengaluru skyline at golden hour. A blue-and-white train arrives. SAI steps out. Age 18. Worn backpack. Wide eyes. Nervous.

A glowing holographic figure flickers nearby — THE MENTOR. "Welcome to Bengaluru. I'm going to need your help. He doesn't know it yet, but he's about to build something extraordinary. Let's begin."

TITLE CARD: SAIVERSE

### 1.3 Act Structure

**ACT I: THE AWAKENING (Knowledge 0% -> 30%)**
Arrival -> Campus -> Learn Java -> Complete Orientation -> Train to Software City

**ACT II: THE BUILDER (Knowledge 30% -> 60%)**
Software City -> Build Projects -> Internship -> AI District -> Train ML model -> Valley Bridge

**ACT III: THE CONTRIBUTOR (Knowledge 60% -> 80%)**
Open Source Valley -> First Contribution -> OFF HQ -> Multiple PRs -> Trees Bloom -> Arena Transport

**ACT IV: THE CHAMPION (Knowledge 80% -> 95%)**
Hackathon Arena -> Form Team -> Build -> Debug -> Present -> Victory -> All districts unlocked

**ACT V: THE LEGACY (Knowledge 95% -> 100%)**
Sports -> Creator District -> Museum -> Skyline -> Mission Control -> Mentor Reveal -> END

### 1.4 The Mentor Reveal (Plot Twist)

In Mission Control, after all districts are complete: The screen shows a timeline that glitches at 2040 — "Sai creates a time-loop simulation to mentor his past self." The Mentor reveals: "I am the engineer you will become. I built this world so you could relive the journey. But I needed someone to guide you. That someone was me. Which means... YOU are me too." The hologram merges with Sai. Knowledge reaches 100%. Final narration: "Every expert once stood exactly where you are now. The difference is... they kept going. So will you."

### 1.5 Emotional Beat Map

| Beat | Location | Emotion | Gameplay |
|---|---|---|---|
| Arrival | Train Station | Wonder, Curiosity | First movement |
| First Lesson | Campus Classroom | Nervous, Excited | First mini-game |
| First Success | Coding Lab | Pride | Language challenge |
| Exploration | Software City | Amazement | Exploring buildings |
| Internship | Internship Office | Accompanied | Guided tour |
| First PR Merge | Open Source Valley | Joy, Belonging | Tree blooms |
| Hackathon Pressure | Arena | Tension | Timed challenges |
| Victory | Arena Stage | Euphoria | Fireworks, crowd |
| Mentor Reveal | Mission Control | Shock, Understanding | Dialogue |
| Final Sunrise | Skyline Deck | Peace, Fulfillment | Photo moment |

---

## 2. World Hub

### 2.1 Description

The central hub is a reimagined Bengaluru railway station and plaza. Serves as main menu, fast travel hub, and first impression.

### 2.2 Interactive Elements

- **Information Kiosk** (E) — District map, fast travel
- **Train to Campus** — Fast travel
- **Metro to Software City** — Fast travel
- **Valley Bridge** — Walk to Open Source
- **Arena Shuttle** — Fast travel to Arena
- **Food Court** — Optional NPC dialogue
- **Street Musician** — Ambient, toss coin
- **Elevator to Skyline** — Fast travel (Act V)
- **Hologram Board** — Displays knowledge %
- **Auto-rickshaws** — Humorous dialogue
- **Pigeons** — Chase for GitHub stars

### 2.3 Hub NPCs

| NPC | Name | Role |
|---|---|---|
| Clerk | Ananya | Info provider |
| Chai Wallah | Raj | Life advice |
| Musician | Vikram | City gossip |
| Tourist | Priya | Tutorial |
| Driver | Gunda | Comic relief |

### 2.4 Hub Quests

**Main:** "Welcome to Bengaluru" (+5 Knowledge) — Navigate to kiosk, learn about districts, take train to Campus.

**Side:** "Lost and Found" (+3), "Chai Break" (+2), "Pigeon Patrol" (+3), "Street Performance" (+5), "City Secrets" (+3).

---

## 3. BITS & Scaler Campus

### 3.1 Atmosphere

Morning. Golden sunlight through banyan trees. Birds, chalk on blackboard, distant chatter. Traditional Indian campus with modern glass buildings. Central clock tower.

### 3.2 Buildings & Puzzles

**Programming Classroom (Building A):** Blackboard with broken Java code. Puzzle: Drag scrambled lines to form valid "Hello World". (+5 Knowledge, Java Unlocked)

**DSA Library (Building B):** Two-story. Floor 2 has hidden terminal. Puzzle: Algorithm Visualizer — sort [5,2,8,1,9,3] by selecting correct algorithm. (+8 Knowledge)

**Coding Lab (Building C):** 7 language challenges. Java (+10), Python (+10), JavaScript (+10), Go (+10), SQL (+8), Git (+5), Linux (+5). Each has unique visual theme and interactive puzzle.

**Language Arena (Outdoor):** Central pillar glows with learned languages. Hidden switch opens "Language Graveyard" — underground room with tombstones of COBOL, FORTRAN, PASCAL, ASSEMBLY. Hidden collectible: "Ancient Knowledge" rune stone.

### 3.3 Campus NPCs

| NPC | Name | Role | Dialogue Style |
|---|---|---|---|
| Professor | Dr. Meera Sharma | Java teacher | Warm, analogies |
| TA | Arjun | Coding assistant | Memes, enthusiastic |
| Librarian | Mrs. Lakshmi | Manager | Riddles |
| Student | Rohan | DSA struggler | Relatable |
| Student | Neha | Hackathon enthusiast | Motivational |
| Janitor | Bheem | Philosopher | Unexpected wisdom |
| Worker | Kamala | Canteen | Maternal |

### 3.4 Campus Quests

**Main: "First Steps"** (+30 Knowledge) — Lecture, Hello World, Library, Visualizer, Python, Arena checkpoint, TA review.

**Side: "Debugging Blues"** (+5) — Help Rohan with binary trees.

**Hidden: "Midnight Oil"** (+2-5) — Coding Lab at night. Student debugging for 6 hours. Choices matter.

**Hidden: "The Janitor's Secret"** (+10) — Talk Bheem 3 times, receive rusty key, open hidden cabinet in Library. "Digital Archaeologist" badge.

---

## 4. Software City

### 4.1 Atmosphere

Late afternoon. Modern glass skyscrapers, neon accents. People with laptops. Central park. Floating digital billboards. Keyboard clicks, coffee machines.

### 4.2 Buildings & Puzzles

**Project Tower (12 floors):** Each showcases a real project.
- Floor 3: Weather App (vanilla JS) — Live mock data
- Floor 5: E-Commerce (React, Node) — Browse, checkout. Puzzle: XSS vulnerability
- Floor 7: Chat App (Socket.io) — NPC chat. /easteregg hidden room
- Floor 9: DevOps Dashboard (Docker, K8s) — Pipeline simulation. Puzzle: Find build error in logs
- Floor 12: Full-Stack SaaS (Next.js, TS) — Interactive demo (+15 Knowledge)

**Internship Office:** Open Food Facts. Puzzle: First PR code review — extract validation to helper function (+10 Knowledge)

**Frontend Cafe:** Cozy cafe. CSS Art Challenge — transform square with CSS properties (+5-10 Knowledge)

**Backend Station:** Server room. Puzzle: Design REST API for blog — select correct endpoints (+8 Knowledge)

**Database Center:** Blue-lit servers. Puzzle: Query Optimizer — use JOIN + INDEX to fix slow query (+8 Knowledge)

**Cloud Building:** Cloud roof. Puzzle: Cloud Architect — select optimal AWS services (+10 Knowledge)

### 4.3 Software City Quests

**Main: "The Builder's Path"** (+40 Knowledge) — 3 project floors, internship, CSS art, API design, query optimization, cloud architecture.

**Side: "Coffee Break"** (+2) — Name 3 JS frameworks. "Golden Bean" collectible.

**Side: "The Startup Pitch"** (+3) — Listen to "Uber for pet rocks" pitch, give feedback.

**Hidden: "The Secret Floor"** (+2) — Hidden elevator button. Rooftop garden. "Peaceful Moment" origami crane.

---

## 5. AI Research District

### 5.1 Atmosphere

Night. Floating platforms over lake. Glowing bridges. Holographic neural networks. Purple/blue neon. Robots. Cool temperature.

### 5.2 Laboratories

**ML Training Platform (Lab 1):** Train digit recognition model. Choose architecture, tune hyperparameters, watch accuracy improve. Puzzle: Hyperparameter tuning — fix overfitting with dropout + data augmentation. (+12 Knowledge)

**Neural Network Visualization (Lab 2):** Walk through giant neural network. Neurons as glowing orbs. Data as particles. Puzzle: Follow the Data — trace digit "7", predict neuron activations. (+8 Knowledge)

**Gen AI Demo Lab (Lab 3):** Text-to-image, AI chatbot, code generation. Puzzle: Prompt Engineering — improve "draw a dog" with better descriptors. (+5 Knowledge)

### 5.3 AI District NPCs

| NPC | Name | Role |
|---|---|---|
| AI Assistant | AURA | Holographic guide |
| Robot | Unit-07 | Maintenance bot (beeps) |
| Researcher | Dr. Patel | ML researcher |
| Collector | Bot-Sam | Data collector |

### 5.4 AI District Quests

**Main: "The AI Awakening"** (+35 Knowledge) — Train model, walk neural network, hyperparameter tuning, Gen AI demo, translate Unit-07.

**Side: "Robot Whisperer"** (+5) — Fix Unit-07 navigation bug. Companion follows in district.

**Hidden: "The Singularity"** (+10) — Ask AURA 5 deep questions. "Fragment of Understanding" collectible.

---

## 6. Open Source Valley

### 6.1 Atmosphere

Golden hour. Forest of unique trees (banyans, bamboo, digital). Streams, wooden bridges. Birds, keyboard clicks, git commit sounds.

### 6.2 Areas

**Contribution Garden:** First area. Each contribution = tree. Water sapling, apply nutrients (code review), watch it grow. Puzzle: "The First Contribution" (+5 Knowledge)

**PR Meadow:** Blooming trees. Tree of Python (coil trunk), React Oak (climb for React projects), Merge Blossom (petal rain on merge). Hidden: "The Eternal Flame" — unmerged PR tree. "Ashes of Effort" collectible.

**Issue Forest:** Darker area. Issues as creatures: Glitch Gremlin (bugs), Question Sprout (questions), Feature Fox (features), Doc Deer (documentation). Fix bugs to transform them. (+8 Knowledge)

**OFF HQ:** Three floors. Commons (workspace), Data Center (food data visualizations), Leadership (manager's office). Puzzle: "Contribute to OFF" — Sai's real first issue (#3421: barcode scanner). Full workflow: read, implement, PR, review, merge. (+15 Knowledge)

**Stream of Wisdom:** 10 inscribed stones with open source lessons. Waterfall at end (+5 Knowledge).

### 6.3 Open Source Valley Quests

**Main: "The Contributor"** (+30 Knowledge) — Enter valley, water sapling, fix bug, visit meadow, OFF HQ, contribute, walk stream.

**Side: "Garden Keeper"** (+5) — Help gardener prune dead tree, plant new seed.

**Hidden: "The Phantom Contributor"** (+8) — Purple-glowing tree at night. Leave offering. Purple flowers bloom.

**Hidden: "The 10,000th PR"** (+5) — Golden tree behind OFF HQ. Ring bell. All trees glow gold.

---

## 7. Hackathon Arena

### 7.1 Atmosphere

Night. Floodlights. Stadium with neon screens. Rows of laptops. Energy drinks. Crowd chatter, countdown timers.

### 7.2 Boss Battle: The Hackathon (4 Phases)

**Phase 1: Ideation (2 min)** — Brainstorm sticky notes. Select best idea (feasibility, impact, innovation, relevance). Teammates: Rohan (frontend), Priya (backend), Vikram (designer). Theme: "Build for Social Good" (Sai's real hackathon).

**Phase 2: Building (8 min)** — Time management. Assign tasks. Team energy (starts 100). Coffee breaks restore. Crisis events (API outage, critical bug, conflict, scope creep). Puzzle: Debug Under Pressure — fix TypeError with optional chaining.

**Phase 3: Submission (3 min)** — Countdown. Git push, deploy, record demo, fill forms. Puzzle: Git Push Panic — correct order (status, pull, add, commit, push).

**Phase 4: Presentation (3 min)** — Pitch dialogue tree. Judge questions. Best answers focus on problem, data integration, open source future.

**Resolution:** Team BitBuilders wins. Confetti, fireworks, trophy. +25 Knowledge. "Hackathon Champion" badge.

### 7.3 Arena Quests

**Main: "The Champion"** (+25) — Register, ideate, build, submit, present, win.

**Side: "Rival Respect"** (+5) — ByteMe approaches after win. Digital handshake.

**Side: "Press Interview"** (+5) — Kavya interviews. Article on newsstand.

**Hidden: "The Lucky Coin"** (+3) — Coin taped under table. Keep for luck, return after win.

---

## 8. Sports Stadium

### 8.1 Atmosphere

Morning. Cricket ground, badminton courts, volleyball sand, table tennis. Crowd cheering.

### 8.2 Mini-Games

**Cricket Batting:** Timing-based. Perfect = boundary, Good = single, Miss = wicket. 10 balls. Goal: 30+. (+5 Knowledge)

**Badminton Rally:** Keep shuttlecock in play. Goal: 10 consecutive hits. (+5 Knowledge)

**Volleyball Serve:** Aim to zones. Goal: 5 different zones. (+5 Knowledge)

**Table Tennis Reflex:** Ball speeds up. Click landing zone. Goal: 15 consecutive. (+5 Knowledge, "Quick Reflexes" badge)

### 8.3 Trait Unlock

Complete all 4 sports. Coach Singh ceremony. "Fast Learner" trait unlocked — 1.5x Knowledge from all future challenges.

### 8.4 Stadium Quests

**Main: "The All-Rounder"** (+10 Knowledge) — Complete all sports. Trait unlock.

**Side: "The Streak"** (+5) — Beat Harmeet's record of 50 rallies.

**Hidden: "Midnight Practice"** (+5) — Visit at night. Dhoni training in dark. Blindfolded audio-cued batting. "Night Vision" secret trait.

---

## 9. Creator District

### 9.1 Atmosphere

Evening. Neon on wet streets. Keyboard clicks, notification pings. Platform buildings.

### 9.2 Buildings & Puzzles

**GitHub Tower:** Dark glass tower. Contribution landscape. Repo cubes. Puzzle: Git Merge Conflict (+5 Knowledge)

**LinkedIn Plaza:** Professional building. Experience timeline. Connection network. Puzzle: Network Effect (+5 Knowledge)

**LeetCode Dojo:** Pagoda style. Three puzzles: Two Sum (+3), Valid Parentheses (+5), LRU Cache (+10, tutorial)

**Kaggle Lab:** Data science. Puzzle: Titanic Survival Prediction (+5-10 Knowledge)

**Codeforces Arena:** Colosseum. Timed competition: 3 problems in 10 min (+5-8 Knowledge)

**Naukri Office:** Mock interview. Dialogue tree. "Strong Hire" verdict (+5-10 Knowledge)

### 9.3 Creator District Quests

**Main: "The Creator"** (+30 Knowledge) — All 6 buildings completed.

**Side: "Code Review"** (+5) — Review PR, leave 3 comments.

**Hidden: "The Perfect Streak"** (+10) — Solve LeetCode 7 days. "Consistency" trait.

---

## 10. Achievement Museum

### 10.1 Atmosphere

Indoors. Marble, high ceilings, warm spotlights. Soft ambient music.

### 10.2 Exhibits

1. **First Trophy** — Audio: "I came third. But that feeling... I wanted more."
2. **Certificate Wall** — Java, DSA, ML, AWS, K8s, OSS certificates. Touch to expand.
3. **Hackathon Trophy Case** — 4 trophies. Holographic victory replays.
4. **Open Source Tree** — Living display. Leaves = PRs. Green/yellow/brown.
5. **Internship Timeline** — 6 milestones. Voiceovers.
6. **Photo Gallery** — 8 holographic frames. Animated memories.
7. **Timeline Wall** — 2018-2026. Glows brighter as you walk.
8. **Guestbook** — Read/leave messages.

**Hidden:** "The Secret Exhibit" — Mirror behind Timeline Wall. "The most important achievement is the person you become."


# SaiVerse GDD — Part 2 (Sections 11-20)

---

## 11. Skyline Observation Deck

### 11.1 Atmosphere

Sunset to night. Cool, windy. 360-degree view of Bengaluru. All districts visible as glowing regions.

### 11.2 Interactions

**Binoculars (4 directions):** View Campus (N), Software City + AI (E), Open Source + Sports (S), Creator + Arena (W). District glow proportional to progress.

**Center Pedestal:** Holographic globe. Touch to zoom into any district.

**Photo Spots:** 4 marked optimal view spots.

**Hidden:** Look up. One pulsing star. Click it — satellite transmits "Keep looking up." (+3 Knowledge)

### 11.3 Skyline Quests

**"The View from Above"** (+10 Knowledge) — Walk 360 degrees, use all binoculars, find star, sit on bench for sunset (30s ambient peace).

---

## 12. Mission Control

### 12.1 Atmosphere

Futuristic command center. Curved wall screens. Central console. Cool, server-room temp. Blue/white accent lighting.

### 12.2 Layout

Command Deck (raised platform) with Main Console. Left Wall = District Status (green/yellow/gray cards). Right Wall = Achievement Timeline. Main Screen = "JOURNEY COMPLETE" display with stats. Exit Wall = "What's Next" section.

### 12.3 Story — The Mentor Reveal

The culmination (see Section 1.4). Mentor reveals identity. Merges with Sai. Screen displays Journey Complete.

### 12.4 Interactions

- **Main Console:** View district stats. "Complete Journey" button triggers ending.
- **Left Wall:** Click districts for completion details.
- **Right Wall:** Scroll achievements. Final entry: "SaiVerse Explorer — You did it."
- **Main Screen:** Knowledge 100%, Projects 12/12, Quests 24/24, Achievements 30/30, Collectibles 20/20, Traits 5/5.
- **Exit Wall:** Download Resume, View GitHub, Connect LinkedIn, Get in Touch, Schedule Interview, Share SaiVerse, Play Again.

### 12.5 Mission Control Quests

**Main: "The End (and the Beginning)"** (+15 Knowledge) — Enter, view status, press Complete Journey, watch reveal, see final screen, sign guestbook, access What's Next.

---

## 13. NPC Encyclopedia

### 13.1 Complete NPC Roster (45 NPCs)

| # | Name | District | Role | Personality | Knowledge |
|---|---|---|---|---|---|
| 1 | The Mentor | All | Guide | Wise, cryptic | 0 (story) |
| 2 | Ananya | Hub | Info Clerk | Friendly | +2 |
| 3 | Raj | Hub | Chai Wallah | Fatherly | +3 |
| 4 | Vikram | Hub | Musician | Artistic | +2 |
| 5 | Priya | Hub | Lost Tourist | Flustered | +2 |
| 6 | Gunda | Hub | Auto Driver | Loud, funny | +2 |
| 7 | Dr. Meera Sharma | Campus | Professor | Warm, brilliant | +15 |
| 8 | Arjun | Campus | TA | Enthusiastic | +5 |
| 9 | Mrs. Lakshmi | Campus | Librarian | Wise, enigmatic | +5 |
| 10 | Rohan | Campus/Arena | Student/Friend | Friendly, DSA struggle | +5 |
| 11 | Neha | Campus | Student | Competitive | +5 |
| 12 | Bheem | Campus | Janitor | Philosophical | +8 |
| 13 | Kamala | Campus | Canteen Worker | Maternal | +2 |
| 14 | Alex | Software City | Mentor (OFF) | Patient | +10 |
| 15 | Maria | Software City | PM | Energetic | +5 |
| 16 | David | Software City | Designer | Passionate | +5 |
| 17 | Raj (Intern) | Software City | Fellow Intern | Friendly | +5 |
| 18 | Barista | Frontend Cafe | Cafe Worker | Artistic | +3 |
| 19 | Entrepreneur | Software Square | Founder | Nervous | +3 |
| 20 | AURA | AI District | AI Assistant | Calm, precise | +5 |
| 21 | Unit-07 | AI District | Robot | Emotional beeps | +5 |
| 22 | Dr. Patel | AI District | Researcher | Absent-minded | +8 |
| 23 | Bot-Sam | AI District | Data Collector | Energetic | +3 |
| 24 | Stephanie | Open Source | OFF CEO | Passionate | +10 |
| 25 | Pierre | Open Source | OFF Dev | Sarcastic | +5 |
| 26 | Luca | Open Source | Data Scientist | Nerdy | +5 |
| 27 | Gardener | Open Source | Mystic | Calm, wise | +8 |
| 28 | Priya (Backend) | Arena | Teammate | Analytical | +8 |
| 29 | Vikram (Designer) | Arena | Teammate | Creative, neurotic | +5 |
| 30 | Judge Dr. Ananya | Arena | Judge | Strict, fair | +5 |
| 31 | Judge Mr. Sharma | Arena | Judge | Business-focused | +5 |
| 32 | Judge Sarah | Arena | Judge | Community-focused | +5 |
| 33 | "ByteMe" | Arena | Rival | Respectful | +5 |
| 34 | Mr. Nair | Arena | Organizer | Stressed | +3 |
| 35 | Kavya | Arena | Reporter | Professional | +5 |
| 36 | Coach Singh | Sports | Coach | Gruff, caring | +8 |
| 37 | Dhoni | Sports | Cricketer | Humble | +5 |
| 38 | Saina | Sports | Badminton | Intense | +5 |
| 39 | Amit | Sports | Volleyball | Leader | +5 |
| 40 | Harmeet | Sports | TT Player | Trash-talker | +5 |
| 41 | Bot-Octocat | Creator | GitHub Guide | Cute | +5 |
| 42 | Master Wei | Creator | LeetCode Sensei | Wise, calm | +10 |
| 43 | Priyanka | Creator | Recruiter | Professional | +5 |
| 44 | "CodeWarrior" | Creator | Codeforces Rival | Silent, intense | +5 |
| 45 | Dr. Data | Creator | Kaggle Expert | Analytical | +8 |

### 13.2 NPC Interaction Patterns

**Flow:** Press E -> NPC turns -> Dialogue panel appears -> Text reveals character-by-character -> Player clicks to advance or selects choice -> Conversation ends -> NPC returns to idle.

**States:** Idle -> Notice (within 5m, looks at player) -> Acknowledged (E pressed, greeting) -> Talking -> Goodbye -> Idle.

**Reputation:** NPCs remember previous conversations. Rohan is more confident in Arena if helped in Campus. Helpful choices = more helpful NPCs later.

---

## 14. Complete Quest Log

### 14.1 Main Quests (10)

| # | Name | District | Knowledge | Prerequisite |
|---|---|---|---|---|
| M1 | Welcome to Bengaluru | Hub | +5 | None |
| M2 | First Steps | Campus | +30 | M1 |
| M3 | The Builder's Path | Software City | +40 | M2 |
| M4 | The AI Awakening | AI District | +35 | M3 |
| M5 | The Contributor | Open Source Valley | +30 | M4 |
| M6 | The Champion | Hackathon Arena | +25 | M5 |
| M7 | The All-Rounder | Sports Stadium | +10 | M6 |
| M8 | The Creator | Creator District | +30 | M7 |
| M9 | The View from Above | Skyline Deck | +10 | M8 |
| M10 | The End (and the Beginning) | Mission Control | +15 | M9 |

**Total Main Quest Knowledge: +230**

### 14.2 Side Quests (26)

| # | Name | District | Knowledge | Giver |
|---|---|---|---|---|
| S1 | Lost and Found | Hub | +3 | Priya |
| S2 | Chai Break | Hub | +2 | Raj |
| S3 | Pigeon Patrol | Hub | +3 | Auto |
| S4 | Street Performance | Hub | +5 | Vikram |
| S5 | City Secrets | Hub | +3 | Ananya |
| S6 | Debugging Blues | Campus | +5 | Rohan |
| S7 | Midnight Oil | Campus | +2-5 | Hidden |
| S8 | The Janitor's Secret | Campus | +10 | Bheem |
| S9 | Coffee Break | Software City | +2 | Barista |
| S10 | The Startup Pitch | Software City | +3 | Entrepreneur |
| S11 | The Secret Floor | Software City | +2 | Hidden |
| S12 | Robot Whisperer | AI District | +5 | Unit-07 |
| S13 | The Singularity | AI District | +10 | AURA |
| S14 | Garden Keeper | Open Source | +5 | Gardener |
| S15 | The Phantom Contributor | Open Source | +8 | Hidden |
| S16 | The 10,000th PR | Open Source | +5 | Hidden |
| S17 | Rival Respect | Arena | +5 | ByteMe |
| S18 | Press Interview | Arena | +5 | Kavya |
| S19 | The Lucky Coin | Arena | +3 | Hidden |
| S20 | The Streak | Sports | +5 | Harmeet |
| S21 | Midnight Practice | Sports | +5 | Hidden |
| S22 | Code Review | Creator | +5 | Bot-Octocat |
| S23 | The Perfect Streak | Creator | +10 | Hidden |
| S24 | The Interview | Creator | +5 | Priyanka |
| S25 | The Secret Exhibit | Museum | +5 | Hidden |
| S26 | The Star | Skyline | +3 | Hidden |

**Total Side Quest Knowledge: +125-140**

### 14.3 Quest State Machine

AVAILABLE -> (accept) -> ACTIVE -> (conditions met) -> COMPLETING -> (reward) -> COMPLETED. Rare: FAILED (miss/wrong path).

---

## 15. Collectibles

### 15.1 Knowledge Orbs (15, +2 Knowledge each)

| # | Location | How to Get |
|---|---|---|
| 1 | Hub — Behind kiosk | Walk around |
| 2 | Hub — Food stall top | Jump |
| 3 | Campus — Clock tower | Climb hidden path |
| 4 | Campus — Language Graveyard | Secret puzzle |
| 5 | Software City — Rooftop garden | Secret elevator |
| 6 | Software City — Coffee machine | Press E repeatedly |
| 7 | AI District — Data stream | Walk through particles |
| 8 | AI District — Unit-07 compartment | After helping |
| 9 | Open Source — Hollow tree | Search |
| 10 | Open Source — Behind waterfall | Walk behind |
| 11 | Arena — Under stage | Search before hackathon |
| 12 | Sports — Scoreboard | Climb |
| 13 | Creator — Dojo roof | Climb pagoda |
| 14 | Museum — Behind Timeline Wall | Secret exhibit |
| 15 | Skyline — Outer railing | Precision walk |

### 15.2 Hidden Scrolls (10 lore items)

"The First Line" (Campus), "The Late Night" (Campus), "The Mentor's Note" (Campus), "API Blues" (Software City), "The Deployment" (Cloud), "The Gradient Descent" (AI), "The Review" (Open Source), "The 25th Hour" (Arena), "The Pebble" (Sports), "The Final Commit" (Mission Control).

### 15.3 Traits (5)

| Name | Unlock | Effect |
|---|---|---|
| Fast Learner | Sports Stadium | 1.5x Knowledge |
| Night Owl | Visit all at night | +5 at night |
| Consistency | 7-day LeetCode streak | +2 every 3rd quest |
| Explorer | All 15 Orbs | Secret district fast travel |
| Mentor's Wisdom | Mission Control | +10 on replay |

### 15.4 Easter Egg Items (10)

Golden Git Commit (GitHub Tower), Pixel Art Star (arcade machine), Rubber Duck (Campus desk), Infinite Loop Pendant (AI District), Coffee Bean Golden (Frontend Cafe), 0xdeadbeef Token (Open Source dead tree), 404 Stone (404 room), Blue Screen of Death (Skyline), Console.log scroll (Creator District), Sai's Original Backpack (Mission Control).

---

## 16. Easter Eggs

### 16.1 Developer Easter Eggs (7)

| Egg | Trigger | Result |
|---|---|---|
| Konami Code | ↑↑↓↓←→←→BA | Rainbow mode |
| Console.log | Ctrl+Shift+J | "Try: help()" |
| help() | Browser console | List commands |
| invincible | Browser console | Gold glow |
| devmode | Browser console | FPS, memory, draw calls |
| "show me what you got" | Console | Fun PNG |
| /easteregg | Chat App (Floor 7) | Secret room |

### 16.2 In-Game Easter Eggs (20)

Hidden 404 Room (Campus Library), Crow with Stars (Hub), Git Commit Wall (GitHub Tower), Console Commands (Open Source terminal), Hidden Drone (Skyline), Retro Arcade Machine (Creator), Chair of Infinite Wisdom (Campus), Mona Lisa in Code (Software City), Cat Picture (AI District — specific training params), The Button (Mission Control — confetti), Sai's Kitchen (behind OFF HQ), Frame-by-Frame Message (credits), The Looping NPC (Hub), and more.

### 16.3 Fourth Wall Easter Eggs (5)

"Talk to Mentor at 0% Knowledge" — "You're in a simulation.", "The Unreachable Object" — "Achievement: Dedication", "Loading Screen Tip 1/1000" — meta joke, "The Developer's Face" — winks at you, "Try to leave map" — "Not this way."

---

## 17. Puzzles & Challenges

### 17.1 Full Puzzle Catalog (35)

P1: Hello World (Campus, Beginner), P2: Algorithm Visualizer (Campus, Beginner), P3-P9: 7 Language Challenges (Campus, Easy), P10: Language Graveyard (Campus, Medium), P11: Security Vulnerability (Software City, Medium), P12: Build Pipeline Debug (Software City, Medium), P13: CSS Art (Software City, Easy), P14: Design the API (Software City, Medium), P15: Query Optimizer (Software City, Medium), P16: Cloud Architect (Software City, Medium), P17: First PR Review (Software City, Easy), P18: Train ML Model (AI, Medium), P19: Hyperparameter Tuning (AI, Medium), P20: Follow the Data (AI, Easy), P21: Prompt Engineering (AI, Easy), P22: First Contribution (Open Source, Easy), P23: Fix a Bug (Open Source, Easy), P24: Contribute to OFF (Open Source, Hard), P25: Git Merge Conflict (Creator, Medium), P26: Network Effect (Creator, Easy), P27: Two Sum (Creator, Easy), P28: Valid Parentheses (Creator, Medium), P29: LRU Cache (Creator, Hard), P30: Titanic Survival (Creator, Medium), P31: Speed Programming (Creator, Hard), P32: The Interview (Creator, Medium), P33: Resource Management (Arena, Medium), P34: Debug Under Pressure (Arena, Hard), P35: Git Push Panic (Arena, Hard), P36: The Pitch (Arena, Medium), P37: Cricket (Sports, Easy), P38: Badminton Rally (Sports, Easy), P39: Volleyball Serve (Sports, Easy), P40: Table Tennis Reflex (Sports, Medium), P41: Midnight Practice (Sports, Hard).

### 17.2 Design Principles

1. Every puzzle teaches something real.
2. Difficulty curve is intentional — easy builds confidence, hard teaches persistence.
3. No arbitrary failure — hard puzzles can be retried, correct answer shown.
4. Puzzles connect to Sai's real story.
5. Visual feedback is rich — code animates, algorithms visualize, data flows.

---

## 18. Interaction Design

### 18.1 Interaction Types

| Type | Input | Visual Feedback | Audio |
|---|---|---|---|
| Walk | WASD/Arrows | Smooth movement, footsteps | Surface-appropriate steps |
| Run | Shift+WASD | Faster, camera bob | Faster steps, breathing |
| Look | Mouse | Camera rotates | None |
| Interact | E | Glowing outline + prompt | Soft "ding" |
| Dialogue | Click or 1/2/3 | Option highlights | Click |
| Menu | Escape | Smooth pause overlay | Pause sound |
| Jump | Space | Jump animation | Jump sound |

### 18.2 Interaction Prompts

Glowing outline + "Press E to interact/talk/sit/read" (context-aware).

**Distances:** NPC dialogue 3m, Object 2m, Signs 5m, Puzzles 3m.

### 18.3 Camera During Interactions

Dialogue: zoom slightly closer. Puzzle: lock to screen. Reading: dolly zoom. Cutscene: full control. Photo mode: free orbit.

---

## 19. Boss Battle

### 19.1 Why a Boss Battle

Climax of main story. Distinct phases with escalating difficulty. Team energy as health bar. Winning pitch as final blow. Victory sequence with celebrations.

### 19.2 Mechanics

| Phase | Timer | Failure | Success |
|---|---|---|---|
| Ideation | 2 min | Bad idea | Good idea |
| Building | 8 min | Energy = 0 | MVP built |
| Submission | 3 min | Time runs out | Success |
| Presentation | 3 min | Bad pitch | Great pitch |

**Team Energy:** Starts 100. -10 bad assignments, -15 crises, -5/min no breaks. +10 coffee, +5 good decisions, +3/min idle.

### 19.3 Difficulty Scaling

Fast Learner trait (from Sports): +20% time, more energy recovery, easier puzzles. No trait: standard difficulty.

---

## 20. Player Progression

### 20.1 Knowledge Gates

- 0%: Hub + Campus only
- 10%: Languages, Train unlocked
- 20%: Software City
- 40%: AI District
- 60%: Open Source Valley
- 80%: Hackathon Arena
- 85%: Sports Stadium
- 90%: Creator District
- 95%: Skyline, Museum, Mission Control
- 100%: Journey Complete

### 20.2 Skills Unlocked

Languages: Java, Python, JavaScript, Go, SQL, Git, Linux. Frameworks: React, Node.js, Next.js, Express, Tailwind. AI/ML: ML, Neural Networks, Prompt Engineering, Data Science. DevOps: Docker, K8s, CI/CD, AWS.

### 20.3 Visual Progression

0%: Simple clothes, nervous posture. 10%: Notebook. 25%: Laptop bag, confident. 40%: Collared shirt. 60%: Smartwatch. 75%: Taller, open. 85%: Professional attire. 95%: Senior engineer look. 100%: Glowing, merged with Mentor.

### 20.4 World Progression

First language: Campus glows. 3 languages: brighter, more NPCs. First project: new tower floor. Internship: office decorates. First PR merged: first tree blooms. 5 PRs: multiple trees. Hackathon won: permanent confetti. Sports: "Fast Learner" graffiti. All complete: city festival lighting.


# SaiVerse GDD — Part 3 (Sections 21-29)

---

## 21. Dialogue System Design

### 21.1 Dialogue Structure

Each NPC has a dialogue tree with nodes containing: speaker ID, line text, animation cue, camera cue, next node ID, choices array, conditionals, and event triggers (onEnter/onExit).

Choices have: text, next node, type (normal/emotion/humor). Conditions check: quest status, knowledge level, inventory.

### 21.2 Dialogue UI

Bottom panel overlay. Speaker name + animated portrait. Text reveals character-by-character (speed varies by NPC personality). Choice options with keyboard shortcuts [1][2][3]. Hover to preview response. Skip (hold). History (scroll back). Auto-advance toggle.

### 21.3 Dialogue Features

- Typing speed varies (Professor = slow/deliberate, Arjun = fast/excited)
- Speaker portrait animates (talk, smile, think, surprise)
- Choice preview on hover
- Skip button (hold to fast-forward)
- History mode
- Auto-advance for cinematic flow
- Camera composition changes per node (close-up, wide, over-shoulder)
- NPC gestures and emotes during lines

### 21.4 Event Triggers

Dialogue nodes can start quests, unlock doors, grant knowledge, update progress. Conditional dialogue changes based on what the player has done.

---

## 22. Reward System

### 22.1 Reward Types

Knowledge (+5/+10/+15), Badges (30 total), Traits (5 total, gameplay effects), Collectibles (scrolls, orbs, items), World Changes (tree blooms, building glows), Unlocks (districts, fast travel, abilities).

### 22.2 Complete Badge List (30)

1. First Steps, 2. Java Master, 3. Python Pro, 4. JavaScript Jedi, 5. Go Getter, 6. Query Master, 7. Git Wizard, 8. Full Stack Dev, 9. API Designer, 10. Cloud Architect, 11. ML Apprentice, 12. AI Explorer, 13. Open Source Citizen, 14. Gardener, 15. Bug Squasher, 16. Hackathon Champion, 17. Friendly Rival, 18. In the Spotlight, 19. Cricketer, 20. Quick Reflexes, 21. Creator, 22. Consistency, 23. Senior Reviewer, 24. Explorer (10 Orbs), 25. Completionist (15 Orbs), 26. Digital Archaeologist, 27. The Singularity, 28. Night Owl, 29. SaiVerse Explorer, 30. 404 Survivor.

### 22.3 Reward Delivery

Chime plays -> Text appears ("+5 Knowledge" / "Badge Unlocked: Java Master") -> Badge spins and shines -> Knowledge bar animates -> Fades after 3 seconds.

---

## 23. UI Flow

### 23.1 Screen States

**TITLE SCREEN:** Press Start, New Game, Continue, Settings, Credits.

**LOADING SCREEN:** Title, loading bar, tips, concept art, "Did you know?" facts.

**GAMEPLAY:** 3D World, HUD (Knowledge bar top, Quest tracker right, Interaction prompt bottom, Minimap bottom-left).

**PAUSE MENU:** Resume, Save, Load, Settings (Audio, Graphics, Controls, Accessibility), Quest Log, Inventory, Quit.

**DIALOGUE:** Bottom panel. Speaker, text, choices, continue/skip.

**PUZZLE:** Full overlay. Content, timer, instructions, submit, back.

**CUTSCENE:** Full 3D. Subtitles, dialogue, skip option.

**MISSION CONTROL:** Command center. Interactive screens. "What's Next" buttons.

### 23.2 UI Transition Rules

World->Dialogue: 0.3s ease-out, camera zooms. World->Puzzle: 0.5s ease-out, slide overlay. World->Pause: 0.2s ease-in-out, quick. World->Cutscene: 1.0s ease-in, black bars. Dialogue->World: 0.3s ease-in. District load: 1.5s GSAP custom fade + camera fly-through.

---

## 24. Audio Design

### 24.1 Music by District

| District | Genre | Mood | Instruments |
|---|---|---|---|
| Title Screen | Ambient Cinematic | Mysterious, hopeful | Piano, pads, train sounds |
| Hub | World Fusion | Warm, inviting | Sitar, tabla, guitar |
| Campus | Orchestral Chamber | Hopeful, nostalgic | Strings, woodwinds |
| Software City | Electronic/Synthwave | Energetic, modern | Synths, drum machines |
| AI District | Ambient Sci-Fi | Futuristic, mysterious | Analog synths, modulated voices |
| Open Source Valley | Acoustic Folk | Peaceful, warm | Acoustic guitar, birds |
| Hackathon Arena | Drum & Bass | Intense, high-energy | Fast beats, crowd layers |
| Sports Stadium | Upbeat Pop | Fun, energetic | Brass, drums, cheers |
| Creator District | Chill Electronic | Cool, confident | Lo-fi beats, smooth synths |
| Museum | Ambient Piano | Reflective, emotional | Piano, soft strings |
| Skyline Deck | Cinematic | Peaceful, grand | Strings, swells |
| Mission Control | Electronic Ambient | Triumphant, emotional | Pads, emotional synth |

### 24.2 SFX Design

**UI:** Hover (soft click), Select (confirm chime), Back (descending tone), Notification (friendly ping), Error (soft buzz), Knowledge Gain (ascending chime), Badge Unlock (fanfare flourish).

**World:** Footsteps (surface-specific: stone, grass, metal, wood), Doors (creak old, hiss modern), Terminals (keyboard clicks, boot sounds), NPCs (greeting grunts, ambient chatter), Environment (birds, wind, water, crowd).

**Puzzle:** Correct answer (satisfying click + glow), Wrong answer (buzzer + red flash), Timer warning (ticking intensifies), Completion (success fanfare), Drag-and-drop (sticky click, snap sound).

**Cinematic:** Transitions (swoosh + low boom), Reveals (rising tone + shimmer), Emotional moments (piano chord + breath), Victory (explosion of sound + crowd).

### 24.3 Spatial Audio

NPC dialogue is spatial (position and distance affects volume/panning). Ambient sources placed in 3D space (birds in trees, servers in racks, crowd in stadium). Footsteps surface-dependent. Reverb zones per district.

---

## 25. Lighting Design Per District

| District | Primary Light | Secondary | Accent | Mood |
|---|---|---|---|---|
| Hub | Golden hour sun | Warm ambient | Auto-rickshaw headlights | Inviting |
| Campus | Morning sunlight | Filtered through trees | Clock tower glow | Hopeful |
| Software City | Late afternoon | Glass reflections | Neon signs | Modern |
| AI District | Night/moon | Purple ambient | Blue neon, holograms | Futuristic |
| Open Source Valley | Golden hour | Dappled forest | Tree glows, fireflies | Peaceful |
| Hackathon Arena | Night floodlights | Screen glow | Red countdown, neon | Intense |
| Sports Stadium | Morning bright | Clear sky | Sun reflection | Energetic |
| Creator District | Evening neon | Wet street reflections | Building signs | Cool |
| Museum | Warm spots | Controlled ambient | Glass case lighting | Reverent |
| Skyline Deck | Sunset-night | City lights below | Stars | Grand |
| Mission Control | Blue/white | Screen glow | Console LEDs | Serious |

Each district has a **lighting script** that transitions based on in-game time and events. Shadows cast by primary light only (performance). Holograms and neon are emissive (no shadow cost).

---

## 26. Weather System

### 26.1 Weather Types

| Type | Visual | Effect | Districts |
|---|---|---|---|
| Clear | Blue sky, sun | None | All |
| Partly Cloudy | Some clouds | Soft shadow movement | All |
| Overcast | Gray sky, flat light | Reduced shadow contrast | Campus, Software City |
| Light Rain | Drizzle, puddles | Wet surfaces reflect | Software City, Creator District |
| Heavy Rain | Downpour, fog | Reduced visibility | Open Source Valley |
| Fog | Low visibility | Mysterious atmosphere | AI District, Open Source |
| Evening | Golden/orange | Warm tones | All (time-based) |
| Night | Dark sky, stars | Neon and lights prominent | All (time-based) |

### 26.2 Day/Night Cycle

Full cycle lasts ~20 minutes of gameplay. Transitions smooth over 30 seconds. Lighting, skybox, and ambient audio lerp between states. NPC behavior unaffected (simplified for game flow). Some quests only available at certain times.

### 26.3 Weather Triggers

Random with bias: 60% clear, 20% cloudy, 10% rain, 10% fog. Some areas have forced weather (AI District always night, Campus always morning).

---

## 27. Camera Moments

### 27.1 Scripted Camera Shots

| Moment | Type | Description |
|---|---|---|
| Arrival at Bengaluru | Crane up | Reveal city skyline, slow rise |
| First Java lesson | Dolly in | Push into classroom, focus on blackboard |
| Campus completion | Orbit around | Clock tower rotates in view, knowledge bar fills |
| Enter Software City | Wide track | Follow Sai walking through glass towers |
| First AI model trains | Zoom + rotate | Camera orbits training platform as accuracy rises |
| Tree blooms in OSS | Slow push | Push into blooming tree, petals float past lens |
| Hackathon win | Pull out | From Sai on stage, pull back to reveal cheering crowd |
| Mentor reveal | Reverse dolly | Push into Sai's face as he realizes truth |
| Final sunrise | Static wide | Camera holds on sunrise over Bengaluru, peaceful |
| Credits | Horizontal track | Camera drifts through key moments as text rolls |

### 27.2 Camera System States

**Exploration:** Third-person over-shoulder. Follows player with smooth interpolation. Mouse controls look.

**Dialogue:** Moves to medium close-up of speaker. Angled slightly. Holds during conversation.

**Puzzle:** Locks to puzzle screen. Player can't move. Smooth 0.3s transition.

**Cutscene:** Full cinematic control. Pre-scripted keyframes. Motion blur, depth of field.

**Photo Mode:** Free orbit around Sai. FOV slider, filters, poses. No time limit.

---

## 28. Emotional Pacing

### 28.1 The Emotional Arc

```
Emotion
  ^
  |                    ACT IV (Euphoria)
  |                   /\
  |                  /  \
  |     ACT II      /    \      ACT V (Peace)
  |    (Wonder)    /      \     /
  |     /\        /        \   /
  |    /  \      /          \ /
  |   /    \    /            X
  |  /      \  /            / \
  | /        \/            /   \
  |/         ACT III      /     \
  |         (Anxiety)    /       \
  |                     /         \
  |                    /           \
  |                   /             \
  |  ACT I (Nervous) /               \
  |____________________________________________ Time
```

**ACT I:** Nervous anticipation -> Curiosity -> First success (pride).

**ACT II:** Wonder at scale -> Challenge of building -> Accompaniment (internship).

**ACT III:** Anxiety (first contribution) -> Joy (first merge) -> Belonging (community).

**ACT IV:** Pressure (hackathon) -> Peak tension (debugging) -> Euphoria (victory).

**ACT V:** Calm (sports, reflection) -> Reverence (museum) -> Shock (reveal) -> Peace (ending).

### 28.2 Pacing Techniques

- **Breathing room:** Stream of Wisdom, Skyline Deck, Museum = slow, reflective moments
- **Tension spikes:** Hackathon timed puzzles, Arena crises
- **Emotional beats:** PR merge, victory ceremony, mentor reveal
- **Exploration gaps:** Free exploration between quest objectives
- **Music shifts:** District transitions, phase changes in boss battle
- **Visual crescendos:** Knowledge milestone popups, world evolution

---

## 29. Hidden Content

### 29.1 Secret Areas

1. **404 Room** (Campus Library) — Behind false wall. Comfy chair. "But you found it" sign.
2. **Language Graveyard** (Campus Arena) — Underground. Tombstones of COBOL, FORTRAN, PASCAL, ASSEMBLY.
3. **Secret Floor** (Project Tower) — Non-existent elevator button. Rooftop garden with bench.
4. **The Eternal Flame** (Open Source) — Burned tree deep in meadow. Symbolizes unmerged PR.
5. **Secret Exhibit** (Museum) — Behind Timeline Wall. Mirror. "The most important achievement is the person you become."
6. **The Developer's Room** (Mission Control) — Hidden panel. Portrait of developer that winks.

### 29.2 Hidden Quests (13 total)

S7 (Midnight Oil), S8 (Janitor's Secret), S11 (Secret Floor), S13 (The Singularity), S15 (Phantom Contributor), S16 (10,000th PR), S19 (Lucky Coin), S21 (Midnight Practice), S23 (Perfect Streak), S25 (Secret Exhibit), S26 (The Star).

Hidden quests have no marker. Discovered by: talking to NPCs multiple times, specific object interactions, being in specific places at specific times, typing specific text, finding secret areas.

### 29.3 Hidden Mechanics

- **Konami Code:** Rainbow mode
- **Browser console commands:** help(), invincible, devmode
- **The Chair of Infinite Wisdom:** +1 Knowledge for sitting
- **Cat Picture:** Specific ML training parameters in AI District
- **The Looping NPC:** Walks perfect square, says "..."
- **Frame-perfect credits pause:** Hidden message

---

## Appendices

### A. Fast Travel Unlock Order

Train (always) -> Metro (Campus done) -> Valley Bridge (Software City done) -> Arena Shuttle (Open Source done) -> Sports Walkway (Arena done) -> Creator Walkway (Sports done) -> Museum Path (all districts) -> Skyline Elevator (all districts) -> Mission Portal (Skyline).

### B. Progression Checklist

- [ ] Complete Campus (M2)
- [ ] Complete Software City (M3)
- [ ] Complete AI District (M4)
- [ ] Complete Open Source Valley (M5)
- [ ] Complete Hackathon Arena (M6)
- [ ] Complete Sports Stadium (M7)
- [ ] Complete Creator District (M8)
- [ ] Visit Skyline Deck (M9)
- [ ] Complete Mission Control (M10)
- [ ] All 26 side quests
- [ ] All 15 Knowledge Orbs
- [ ] All 10 Hidden Scrolls
- [ ] All 30 Badges
- [ ] All 5 Traits
- [ ] All 10 Easter Egg Items
- [ ] All 25 Easter Eggs triggered
- [ ] All 35 puzzles completed

### C. Knowledge Budget

Main Quests: +230. Side Quests: +125-140. Knowledge Orbs: +30. Puzzles: +200+. Hidden discoveries: +50+. Total available: ~650+. Required for 100%: ~400. Player can miss ~250 points and still complete the game.

---

**End of SaiVerse Game Design Document v1**

*This document serves as the complete gameplay blueprint for SaiVerse. Every interaction, quest, collectible, puzzle, and story beat is defined here. All implementation must strictly follow this design document. Any deviations require documented approval.*
