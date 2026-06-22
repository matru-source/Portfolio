# Software Requirements Specification (SRS)
## MATRU OS — *Data. Intelligence. Leadership.*
### A Futuristic AI Command-Center Portfolio for Matru Prasad Panda

| Field | Value |
|---|---|
| **Document** | Software Requirements Specification (SRS) |
| **Product** | MATRU OS — Personal Command-Center Portfolio |
| **Owner** | Matru Prasad Panda |
| **Version** | 1.0 (Draft for approval) |
| **Date** | 2026-06-10 |
| **Status** | Awaiting sign-off before development |
| **Standard** | Adapted from IEEE 830 |

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Design System](#3-design-system)
4. [Technical Architecture](#4-technical-architecture)
5. [Functional Requirements (Page by Page)](#5-functional-requirements-page-by-page)
6. [Animation & Motion Plan](#6-animation--motion-plan)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Content & Data Model](#8-content--data-model)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Delivery Plan & Phases](#10-delivery-plan--phases)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Open Questions (Need Your Decision)](#12-open-questions-need-your-decision)
13. [Appendix](#13-appendix)

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete requirements for **MATRU OS**, a premium, multi-page, immersive web portfolio that presents Matru Prasad Panda not as a "student with a portfolio," but as a **digital command center** — an AI-operated interface that narrates his capabilities across Data Analytics, Business Intelligence, Cybersecurity, Research, and Leadership.

The goal is a recruiter-facing experience that is **memorable after viewing hundreds of portfolios**, communicating: Intelligence, Leadership, Innovation, Ambition, Professionalism, and Creativity.

### 1.2 Product Vision
> **MATRU OS** — *"A Digital Command Center, not a portfolio."*
> Inspired by Iron Man's JARVIS, Apple product launches, Tesla product pages, and cyberpunk analytics control rooms.

### 1.3 Scope
**In scope**
- A single-page-application (SPA) with 14 distinct immersive "modules" (pages/sections).
- A boot/login "OS startup" sequence that frames the experience.
- A persistent JARVIS-style AI HUD (heads-up display) shell: top status bar, side navigation dock, ambient background.
- Rich motion design (GSAP + Framer Motion), 3D scenes (Three.js / React Three Fiber), particles, parallax, and mouse tracking.
- Live-feeling dashboards (FMCG command center, cybersecurity lab) driven by static/mock JSON data.
- Fully responsive (desktop, tablet, mobile) with a graceful "lite mode" for low-power devices.
- Resume PDF download and contact actions.

**Out of scope (v1)**
- Real backend, database, or authentication (the "login" is cinematic only).
- A working chatbot/LLM integration (the AI is scripted narration; optional future upgrade).
- CMS/admin panel (content lives in versioned config files).
- Real-time data ingestion (dashboards use curated mock data).

### 1.4 Definitions, Acronyms, Abbreviations
| Term | Meaning |
|---|---|
| **HUD** | Heads-Up Display — persistent on-screen UI frame |
| **Module** | One full-screen page/section of the experience |
| **Boot sequence** | Cinematic OS-startup intro before the hero |
| **R3F** | React Three Fiber (React renderer for Three.js) |
| **DOH** | Days On Hand (inventory KPI) |
| **Fill Rate** | % of demand fulfilled (FMCG KPI) |
| **STT** | Stock Transfer / inventory tracking |
| **Lite mode** | Reduced-animation fallback for performance/accessibility |
| **a11y** | Accessibility |
| **LCP/CLS/INP** | Core Web Vitals metrics |

### 1.5 References
- Resume: *RESUME DATA ANALYTICS.pdf* (Matru Prasad Panda) — source of all content.
- IEEE 830-1998 (SRS structure, adapted).
- WCAG 2.1 AA (accessibility target).
- Core Web Vitals (Google performance standard).

---

## 2. Overall Description

### 2.1 Product Perspective
MATRU OS is a **standalone static web app** (no server runtime required) deployable to Netlify/Vercel/GitHub Pages. It is framed as a fictional operating system ("MATRU OS v1.0") that boots, authenticates the visitor as "RECRUITER," and then lets them explore subsystems.

### 2.2 User Classes & Characteristics
| User Class | Goal | Priority | Design Implication |
|---|---|---|---|
| **Recruiter / Hiring Manager** | Quickly judge fit; skim achievements; get contact/resume | **Primary** | Fast "Skip Intro," clear CTAs, recruiter-impact page, 60-sec value path |
| **Technical Interviewer** | Inspect depth (projects, cyber, research) | High | Expandable detail, real KPIs, GitHub links |
| **Peer / Networker** | Be impressed, share | Medium | Shareable, memorable, smooth |
| **Matru (owner)** | Easy content updates, pride | High | Config-driven content, single source of truth |
| **Low-power / Mobile user** | View without lag | High | Lite mode, responsive, reduced motion |

### 2.3 Operating Environment
- **Browsers:** Latest 2 versions of Chrome, Edge, Firefox, Safari (desktop + mobile).
- **Devices:** Desktop (1280–1920+), tablet (768–1024), mobile (360–430).
- **Render:** Client-side React; WebGL for 3D (with non-WebGL fallback).
- **Hosting:** Static CDN (Netlify primary, given resume mentions Netlify).

### 2.4 Design Constraints
- Must run smoothly at **60 fps target** on mid-range hardware; degrade gracefully below.
- WebGL 3D scenes must lazy-load and never block first paint.
- All content sourced from resume — **no fabricated facts**; phrasing may be elevated but claims stay truthful.
- Single-developer maintainability — content in typed config, not hard-coded JSX.

### 2.5 Assumptions & Dependencies
- A high-quality headshot is available (resume contains one).
- LinkedIn URL to be provided (not on resume — see Open Questions).
- Resume PDF will be bundled for download.
- Fonts loaded from self-hosted/Google Fonts (Orbitron/Sora/Inter family — see §3.2).

---

## 3. Design System

### 3.1 Color System — "Obsidian / Arc-Reactor"
Dark, premium, with **electric blue** primary and **gold** accent.

| Token | Hex | Use |
|---|---|---|
| `--bg-void` | `#05070D` | Deepest background |
| `--bg-panel` | `#0B1020` | Cards / panels base |
| `--bg-glass` | `rgba(16,24,44,0.55)` | Glassmorphism surfaces |
| `--stroke` | `rgba(120,170,255,0.18)` | Hairline borders / grid |
| `--primary-500` | `#2D9CFF` | Primary electric blue |
| `--primary-400` | `#5BB8FF` | Hover / highlights |
| `--primary-glow` | `#00E5FF` | Cyan glow, HUD lines |
| `--gold-500` | `#FFC857` | Gold accent (awards, CTAs) |
| `--gold-glow` | `#FFD98A` | Gold glow |
| `--success` | `#37E0A8` | KPI up / safe |
| `--danger` | `#FF5C73` | Threat / KPI down |
| `--warning` | `#FFB347` | Alerts |
| `--text-hi` | `#EAF2FF` | Primary text |
| `--text-mid` | `#9DB2D6` | Secondary text |
| `--text-low` | `#5C708F` | Tertiary / labels |

**Gradients**
- *Reactor:* `radial-gradient(circle, #00E5FF 0%, #2D9CFF 40%, transparent 70%)`
- *Aurora sweep:* `linear-gradient(120deg,#2D9CFF,#7A5CFF,#00E5FF)`
- *Gold seam:* `linear-gradient(90deg,#FFC857,#FFE7A8)`

### 3.2 Typography
| Role | Font | Notes |
|---|---|---|
| Display / Hero | **Orbitron** or **Sora** | Futuristic, geometric, big headings |
| UI / Body | **Inter** or **Sora** | Clean, legible |
| Mono / Data / HUD | **JetBrains Mono** / **Space Mono** | Terminal, KPIs, code, telemetry |

Type scale (rem): 0.75 / 0.875 / 1 / 1.25 / 1.5 / 2 / 3 / 4.5 / 6. Fluid via `clamp()`.

### 3.3 Iconography & Texture
- Line icons (Lucide / custom) with cyan glow on active.
- Subtle film grain + scanline overlay (toggleable) for "screen" feel.
- Animated grid / dot-matrix backgrounds, depth via blur layers.

### 3.4 Core UI Components (Design Library)
- `GlassPanel` — frosted card with animated border seam.
- `HUDFrame` — corner brackets + telemetry ticks around content.
- `StatChip` / `KPIGauge` — live-style metric display.
- `NeonButton` (primary blue / gold variants) with ripple + glow.
- `TerminalText` — typewriter / decrypt text effect.
- `RadarChart`, `BarMeter`, `Sparkline`, `Gauge` — data viz.
- `HoloCard` — 3D tilt card reacting to mouse.
- `NavDock` — side rail OS navigation.
- `StatusBar` — top bar (clock, "system status," visitor = RECRUITER).
- `SectionTransition` — wipe/scan transition between modules.
- `Cursor` — custom reticle cursor with magnetic hover.

### 3.5 Layout & Grid
- 12-column responsive grid, max content width 1320px.
- Generous negative space (Apple-style breathing room).
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Radius: 8 / 16 / 24; glass blur 18–28px.

---

## 4. Technical Architecture

### 4.1 Tech Stack
| Layer | Technology |
|---|---|
| Framework | **React 18** |
| Build tool | **Vite** |
| Styling | **TailwindCSS** + CSS variables (design tokens) |
| Motion | **Framer Motion** (UI/state animation) + **GSAP + ScrollTrigger** (scroll choreography) |
| 3D | **Three.js** via **@react-three/fiber** + **@react-three/drei** |
| Particles | tsParticles or custom GPU points in R3F |
| Charts | Custom SVG/Canvas + lightweight lib (Recharts/visx) as needed |
| Routing | React Router (per-module routes) **or** scroll-snap sections — see §4.3 |
| Icons | Lucide React |
| State | Zustand (tiny global store: boot state, lite-mode, audio, active module) |
| Lint/Format | ESLint + Prettier |
| Deploy | Netlify / Vercel |

### 4.2 Folder Structure
```
matru-os/
├─ public/
│  ├─ resume/Matru_Prasad_Panda_Resume.pdf
│  ├─ models/            # .glb 3D assets (optional)
│  ├─ textures/
│  └─ favicon, og-image
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ routes.jsx
│  ├─ data/                      # SINGLE SOURCE OF TRUTH (content)
│  │  ├─ profile.js              # name, taglines, contact, links
│  │  ├─ timeline.js             # journey events
│  │  ├─ skills.js               # categories + power levels
│  │  ├─ projects.js             # FMCG, Pizza, Airline
│  │  ├─ experience.js           # Nexus, CTTC, IIT, Lecturer
│  │  ├─ certifications.js
│  │  ├─ achievements.js
│  │  ├─ leadership.js
│  │  ├─ research.js
│  │  └─ fmcgMock.js / cyberMock.js   # dashboard mock telemetry
│  ├─ system/                    # OS shell
│  │  ├─ BootSequence.jsx
│  │  ├─ StatusBar.jsx
│  │  ├─ NavDock.jsx
│  │  ├─ AmbientBackground.jsx   # global 3D/particles canvas
│  │  ├─ CustomCursor.jsx
│  │  └─ store.js                # Zustand (boot, liteMode, audio, active)
│  ├─ components/                # reusable design library (§3.4)
│  │  ├─ GlassPanel.jsx
│  │  ├─ HUDFrame.jsx
│  │  ├─ NeonButton.jsx
│  │  ├─ TerminalText.jsx
│  │  ├─ HoloCard.jsx
│  │  ├─ charts/ (Radar, Gauge, BarMeter, Sparkline)
│  │  └─ ...
│  ├─ modules/                   # the 14 pages/sections
│  │  ├─ 01-Hero/
│  │  ├─ 02-AIIntro/
│  │  ├─ 03-Timeline/
│  │  ├─ 04-Identity/
│  │  ├─ 05-Skills/
│  │  ├─ 06-FMCG/
│  │  ├─ 07-CyberLab/
│  │  ├─ 08-Research/
│  │  ├─ 09-Leadership/
│  │  ├─ 10-Achievements/
│  │  ├─ 11-Experience/
│  │  ├─ 12-Certifications/
│  │  ├─ 13-RecruiterImpact/
│  │  └─ 14-Contact/
│  ├─ hooks/                     # useMouse, useScrollProgress, useReducedMotion, useLiteMode
│  ├─ three/                     # shared 3D scenes (particles, neural net, grid)
│  ├─ styles/                    # tailwind.css, tokens.css, globals
│  └─ utils/
├─ tailwind.config.js
├─ vite.config.js
├─ index.html
└─ package.json
```

### 4.3 Navigation Model
**Recommended hybrid:**
- Each module is a route (`/`, `/intro`, `/timeline`, … `/contact`) so recruiters can deep-link/share.
- A persistent **NavDock** (left rail) + **StatusBar** stay mounted across routes; only the module content transitions (scan-wipe).
- A "**continuous scroll**" alternative is available behind a toggle for users who prefer one long cinematic scroll.
- Keyboard nav: `←/→` or number keys jump modules; `Esc` opens module map.

### 4.4 Performance Architecture
- One **shared WebGL canvas** for ambient background (not one per module) to save GPU.
- Modules **code-split / lazy-loaded**; heavy 3D loads on enter, disposes on exit.
- `prefers-reduced-motion` and a manual **Lite Mode** disable particles/3D, swap to static gradients.
- Asset budget: hero interactive < 1.5s on broadband; images as AVIF/WebP; fonts `font-display: swap`.

---

## 5. Functional Requirements (Page by Page)

> Each module lists: **Purpose**, **Content (from resume)**, **Interaction**, **Animation**, **Acceptance**.
> Requirement IDs: `FR-<module>.<n>`.

### Module 0 — Boot / OS Startup (cinematic intro)
- **FR-0.1** On first load, show a boot sequence: "Initializing MATRU OS…", system checks, "Authenticating visitor… ACCESS GRANTED: RECRUITER."
- **FR-0.2** A **Skip / Enter Command Center** button is visible from second 1 (recruiter-friendly).
- **FR-0.3** Boot runs once per session (remembered in store); returning navigation skips it.
- **Animation:** terminal decrypt text, progress bar, reactor power-up flare → cross-fade to Hero.

### Module 1 — Hero Landing
- **Purpose:** Instant wow + identity.
- **Content:** `MATRU PRASAD PANDA`; rotating roles: *Data Analyst · BI Engineer · Cybersecurity Enthusiast · Researcher · Problem Solver*; tagline *"Data. Intelligence. Leadership."*; CTA **Launch Command Center**.
- **FR-1.1** Full-screen 3D ambient: starfield + data particles + neural-network lines + cyber grid.
- **FR-1.2** Animated name reveal (mask/decrypt); subtitle role-rotator with smooth swap every 2.5s.
- **FR-1.3** Primary CTA scrolls/routes into the experience; secondary "Download Resume."
- **FR-1.4** Floating mini analytics charts drift in parallax behind the name.
- **Acceptance:** 60fps on desktop; readable on mobile; LCP < 2.5s.

### Module 2 — AI Introduction (MATRU OS speaks)
- **Purpose:** Narrative hook.
- **Content:** AI line: *"Hello, Recruiter. I am MATRU OS."* Then a guided intro summarizing: years of learning, projects, certifications, achievements.
- **FR-2.1** Holographic AI avatar/orb (animated) with typewriter narration + optional subtitle captions.
- **FR-2.2** Holographic summary cards animate in: *Projects · Certifications · Experience · Research*.
- **FR-2.3** Optional mute/skip; respects reduced motion (no audio autoplay).
- **Animation:** holo orb pulse, glitch-in cards, particle reveal.

### Module 3 — Journey Timeline (interactive 3D)
- **Content (from resume):** 2020 CHSE (Dhenkanal) → 2022 PMEC (B.Tech CSE) → 2023 CTTC Intern → 2025 Nexus Infotech → 2025 IIT Jammu (Cybersecurity) → **Future: Data Scientist**.
- **FR-3.1** Scroll-driven 3D/parallax timeline; each node expands with detail on focus.
- **FR-3.2** Active node highlights with reactor glow; connecting "data stream" line animates as you scroll.
- **FR-3.3** "Future" node is aspirational, styled distinctly (gold, dashed/hologram).
- **Animation:** GSAP ScrollTrigger pinned section; node pop + line draw.

### Module 4 — Digital Identity
- **Content:** Location: Dhenkanal, Odisha, India · Education: B.Tech CSE, PMEC · CGPA 7.95 · Email: 2201109054_cse@pmec.ac.in (and personal) · GitHub: github.com/matru-source · Phone: +91 9348201604.
- **FR-4.1** Floating glass ID cards in a 3D field; **cards tilt/parallax to mouse**.
- **FR-4.2** Each card copy-to-clipboard on click (email, phone, GitHub) with toast.
- **FR-4.3** "ID badge" hero card with photo, name, role, QR (links to live site).
- **Animation:** magnetic hover, 3D tilt, glow trails.

### Module 5 — Skills Matrix (command center)
- **Content (categories):** Data Analytics · Business Intelligence · Databases · Programming · Cybersecurity.
  - *BI & Viz:* Zoho Analytics, Power BI, Tableau, Google Analytics, Excel (Pivot/Dashboard/VLOOKUP), PowerPoint.
  - *Databases:* MS SQL Server, SSMS, MongoDB, PostgreSQL.
  - *Programming:* Python (Pandas, NumPy, Matplotlib, SciPy, Seaborn, Scikit-learn), Java, C.
  - *Data Handling:* SQL Queries, Data Cleaning, ETL Concepts, Report Documentation.
  - *Other:* GitHub, Netlify, Google Sheets, Jupyter.
  - *Cybersecurity:* ARP-spoof detection, secure protocols, ethical hacking (IIT Jammu).
- **FR-5.1** Category selector; selecting a category animates a **radar chart** + **animated skill bars** with "Power Level / Experience" labels.
- **FR-5.2** Hover a skill → tooltip with context (where used: project/intern).
- **FR-5.3** Numbers are presented as self-assessed proficiency (labeled as such, not fake metrics).
- **Animation:** radar draw-on, bars fill with count-up, category morph.

### Module 6 — FMCG Command Center (flagship dashboard)
- **Purpose:** Prove real BI capability; feel like a live corporate dashboard.
- **Content:** *"Designed an end-to-end FMCG analytics platform"* — Primary Sales, Secondary Sales, Inventory (STT), **DOH**, **Fill Rate**, salesman performance, hierarchy (CEO/region/territory), geo insights, retailer selection.
- **FR-6.1** KPI tiles with live-style animated counters and sparklines (mock data).
- **FR-6.2** Charts: primary vs secondary sales trend, inventory/DOH gauge, fill-rate gauge, region drill-down, top-salesman leaderboard.
- **FR-6.3** A "data refresh" pulse animates periodically to feel live; clearly mock (no false real-time claim).
- **FR-6.4** Narrative callout describing the real impact (accuracy, pipeline security, hierarchy-based insights).
- **Animation:** counters count-up, charts draw-on, subtle telemetry flicker.

### Module 7 — Cyber Security Lab
- **Purpose:** Showcase IIT Jammu cybersecurity work.
- **Content:** ARP Spoofing Detection Tool (Python), secure protocols, network mitigation; Ethical Hacking certification.
- **FR-7.1** Dark "hacker room" theme; animated **attack simulation**: packets travel a network graph, a spoofed packet is detected, **alert fires**, firewall blocks it.
- **FR-7.2** Live "threat console" terminal logging detection events (scripted, looping).
- **FR-7.3** Toggle: *Attack* vs *Defense* view; explanation of ARP spoofing in plain language.
- **Animation:** packet flow, red alert pulse, firewall shield, terminal stream.

### Module 8 — Research Zone
- **Purpose:** Feature the published paper.
- **Content:** *Research Paper Published (ICEVB 2025): AI + Astrology Integration* — fusing ancient astrology with modern AI / predictive analytics for personalized career guidance.
- **FR-8.1** Interactive research portal: animated neural network + planetary/orbital motion + "AI prediction" visualization.
- **FR-8.2** Publication card: title, venue (ICEVB 2025), abstract summary, "key contributions," link/DOI if available.
- **FR-8.3** "How it works" mini-diagram (inputs → model → guidance).
- **Animation:** orbiting planets, neural pulse, prediction beam.

### Module 9 — Leadership Hub
- **Content:** NCC Senior Under Officer (SUO), Best NCC Cadet (2024), Startup Club Coordinator, Yoga Club, Dramatic Society Coordinator, Youth Parliament (2022), NCC A/B/C certificates, Contract Lecturer (Retail Management).
- **FR-9.1** Achievement/role cards in a grid; **glow on hover**; flip/expand for detail.
- **FR-9.2** Leadership "stat line" (e.g., roles held, years of mentoring) as HUD chips.
- **Animation:** hover glow, card lift, stagger reveal.

### Module 10 — Achievement Vault (3D trophy room)
- **Content:** 2nd Prize Startup Exposure Bhubaneswar (2024), Mr. Fresher PMEC (2022), Research Publication (ICEVB 2025), Best NCC Cadet (2024), NCC A/B/C.
- **FR-10.1** 3D "vault/trophy room" scene; trophies/medals float; click to inspect (3D rotate + info panel).
- **FR-10.2** Gold accent lighting; spotlight on hovered trophy.
- **Animation:** 3D orbit controls (constrained), shimmer, unlock-vault intro.

### Module 11 — Experience Command Room
- **Content:** Nexus Infotech — Data Analytics Trainee (2025–Present); CTTC — Data Analytics Intern (2023); IIT Jammu — Cybersecurity Intern (2025); Dhenkanal Autonomous College — Contract Lecturer (2022–2024). Include each bullet from resume.
- **FR-11.1** Experience entries as "case files" that **expand like a futuristic dossier** on click (role, org, period, achievements, tools).
- **FR-11.2** Filter/sort by domain (Analytics / Cyber / Teaching).
- **Animation:** file-open expand, scanline reveal, tool-chip stagger.

### Module 12 — Certification Wall
- **Content:** Data Analytics (Cisco), Data Analytics (CTTC), Ethical Hacking (IIT Jammu), ML with Python (Udemy), Advanced Java (Udemy), NCC A/B/C.
- **FR-12.1** Floating certificate cards in a 3D/parallax space gallery.
- **FR-12.2** Click → enlarged certificate view (image/placeholder) + issuer + year + verify link if available.
- **Animation:** float drift, depth parallax, zoom-in modal.

### Module 13 — Recruiter Impact ("Why Hire Matru?")
- **Purpose:** The closer — recruiter-focused storytelling.
- **Content:** Five pillars — **Leadership · Analytics · Cybersecurity · Research · Communication** — each with a one-line proof from the resume.
- **FR-13.1** Big animated headline "Why Hire Matru?"; five pillars reveal with icon + proof stat.
- **FR-13.2** A concise "value statement" paragraph + dual CTA (Hire Me / Download Resume).
- **FR-13.3** Optional "60-second summary" mode that auto-scrolls the key highlights.
- **Animation:** headline kinetic type, pillar stagger, CTA pulse.

### Module 14 — Contact Command Center
- **Content:** GitHub (matru-source), Email (resume + personal), LinkedIn (TBD), Phone, Resume Download, **Hire Me** button.
- **FR-14.1** Futuristic comms dashboard: channel tiles (GitHub/Email/LinkedIn/Phone) with live "ONLINE" status.
- **FR-14.2** Contact form (name/email/message) → opens mail client (`mailto`) or Formspree/Netlify Forms (no backend) — see Open Questions.
- **FR-14.3** Resume download button; social links open in new tab.
- **FR-14.4** Footer: "MATRU OS v1.0 — Built with React, Three.js, GSAP," current year, back-to-top.
- **Animation:** transmit pulse on send, channel glow, success confirmation.

### Cross-Cutting (Persistent Shell)
- **FR-S.1 StatusBar:** clock, "SYSTEM: ONLINE," visitor = RECRUITER, lite-mode + mute toggles.
- **FR-S.2 NavDock:** icons for all modules with active-state glow; collapses on mobile to a menu.
- **FR-S.3 Custom cursor:** reticle with magnetic hover (disabled on touch).
- **FR-S.4 Sound design (optional, off by default):** subtle UI ticks/hover; global mute; never autoplay.
- **FR-S.5 Module map:** `Esc` / button opens a grid overview to jump anywhere.

---

## 6. Animation & Motion Plan

| Technique | Library | Where |
|---|---|---|
| Scroll choreography, pinned sections, draw-on lines | **GSAP + ScrollTrigger** | Timeline, FMCG, Research |
| Component state, page transitions, stagger | **Framer Motion** | All modules, nav, cards |
| 3D scenes, particles, neural net, trophies | **R3F / Three.js + drei** | Hero, Identity, Cyber, Research, Vault |
| Parallax + mouse tracking | custom hooks (`useMouse`, `useParallax`) | Hero, Identity, Certs |
| Typewriter / decrypt | custom `TerminalText` | Boot, AI Intro, Cyber |
| Count-up / data anim | Framer Motion / custom | FMCG, Skills |

**Motion principles**
- Ease: prefer `power3.out` / spring; durations 0.4–0.9s for UI, longer for cinematic beats.
- Always honor `prefers-reduced-motion` → cut to fades/instant.
- Stagger reveals (40–80ms) for lists/cards.
- No motion should block interaction or content access.

---

## 7. Non-Functional Requirements

### 7.1 Performance (`NFR-P`)
- **NFR-P.1** Hero interactive < **1.5s** on broadband; LCP < **2.5s**; CLS < **0.1**; INP < **200ms**.
- **NFR-P.2** Maintain **~60fps** desktop, **≥30fps** mid mobile; auto-drop to Lite Mode if frame rate sustained low.
- **NFR-P.3** Initial JS payload minimized via per-module code-splitting; 3D assets lazy-loaded.
- **NFR-P.4** Single shared WebGL context; dispose 3D on module exit.

### 7.2 Responsiveness (`NFR-R`)
- **NFR-R.1** Fully usable from **360px → 1920px+**; no horizontal scroll.
- **NFR-R.2** 3D scenes simplify or swap to static art on small/low-power devices.
- **NFR-R.3** Touch-friendly targets ≥ 44px; nav collapses to mobile menu.

### 7.3 Accessibility (`NFR-A`) — WCAG 2.1 AA target
- **NFR-A.1** Keyboard navigable; visible focus states; skip-to-content.
- **NFR-A.2** Text contrast ≥ 4.5:1 (non-decorative); important content not conveyed by color alone.
- **NFR-A.3** Respect `prefers-reduced-motion`; provide manual Lite Mode + mute.
- **NFR-A.4** Semantic landmarks, alt text, ARIA for interactive widgets; captions for AI narration.

### 7.4 SEO & Sharing (`NFR-S`)
- **NFR-S.1** Per-module meta (title/description); Open Graph + Twitter cards with branded OG image.
- **NFR-S.2** JSON-LD `Person` schema (name, role, links).
- **NFR-S.3** Pre-rendered/SSG meta for crawlers (vite plugin or static prerender of key routes).
- **NFR-S.4** Sitemap, robots, canonical URLs.

### 7.5 Maintainability (`NFR-M`)
- **NFR-M.1** All content in `src/data/*` config — update without touching components.
- **NFR-M.2** Reusable component library; design tokens centralized.
- **NFR-M.3** ESLint/Prettier; clear README with run/build/deploy steps.

### 7.6 Compatibility & Resilience (`NFR-C`)
- **NFR-C.1** Graceful fallback when WebGL unavailable (static hero art).
- **NFR-C.2** Works offline-ish after load (static assets cached); no runtime backend dependency.
- **NFR-C.3** Cross-browser tested (Chrome/Edge/Firefox/Safari, desktop + mobile).

### 7.7 Security & Privacy (`NFR-X`)
- **NFR-X.1** No secrets in client; contact form uses third-party (Formspree/Netlify) or `mailto`.
- **NFR-X.2** External links `rel="noopener noreferrer"`.
- **NFR-X.3** Optional privacy-friendly analytics (Plausible) — opt-in only.

---

## 8. Content & Data Model

All content lives in typed config objects. Example shapes:

```js
// profile.js
export const profile = {
  name: "Matru Prasad Panda",
  brand: "MATRU OS",
  tagline: "Data. Intelligence. Leadership.",
  roles: ["Data Analyst","BI Engineer","Cybersecurity Enthusiast","Researcher","Problem Solver"],
  location: "Dhenkanal, Odisha, India",
  email: "itsmatruprasad@gmail.com",       // public contact (LOCKED)
  phone: "+91 9348201604",
  github: "https://github.com/matru-source",
  linkedin: "",                            // TBD — paste linkedin.com/in/... URL
  cgpa: "7.95",
  degree: "B.Tech in Computer Science & Engineering, PMEC",
  resumeUrl: "/resume/Matru_Prasad_Panda_Resume.pdf",
};

// timeline.js — [{year, title, org, place, type, blurb, future?}]
// skills.js   — [{category, items:[{name, level/* 0-100 self-rated */, note}]}]
// projects.js — [{name, tools:[], summary, highlights:[], links:[]}]
// experience.js, certifications.js, achievements.js, leadership.js, research.js
// fmcgMock.js — KPI series for the dashboard (clearly mock)
```

**Skill levels** are self-assessed proficiency, labeled as such — never presented as fabricated employer metrics.

---

## 9. Acceptance Criteria

The build is **accepted** when:
1. All **14 modules + boot + persistent shell** are implemented per §5.
2. Recruiter can reach **contact + resume in ≤ 2 clicks / ≤ 60s** (Skip Intro works).
3. **Responsive** verified at 360 / 768 / 1280 / 1920.
4. **Lite Mode** and `prefers-reduced-motion` fully disable heavy effects; site remains complete.
5. Core Web Vitals targets (§7.1) met on a mid-range device.
6. **Keyboard + screen-reader** basic pass (focus, landmarks, alt text).
7. No console errors; graceful **WebGL fallback**.
8. All content matches the resume (no fabricated facts).
9. Deployed to a live URL (Netlify) with working resume download + links.
10. README documents run/build/deploy and how to edit content.

---

## 10. Delivery Plan & Phases

| Phase | Deliverable | Modules |
|---|---|---|
| **P0 — Foundation** | Vite+React+Tailwind, tokens, shell (StatusBar, NavDock, AmbientBackground, store), data configs, routing | Shell + data |
| **P1 — Core Identity** | Boot, Hero, AI Intro, Identity, Contact | 0,1,2,4,14 |
| **P2 — Proof of Skill** | Skills Matrix, FMCG Dashboard, Experience | 5,6,11 |
| **P3 — Differentiators** | Cyber Lab, Research Zone, Timeline | 3,7,8 |
| **P4 — Story & Polish** | Leadership, Achievement Vault, Certifications, Recruiter Impact | 9,10,12,13 |
| **P5 — Hardening** | Performance, a11y, SEO, responsive QA, deploy | all |

Each phase is independently demoable. Recommended order prioritizes recruiter value early.

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Heavy 3D hurts mobile/low-end perf | High | Shared canvas, lazy-load, Lite Mode, fps auto-degrade |
| "Too flashy" slows recruiters | Med | Always-visible Skip; 60-sec path; Recruiter Impact page |
| Fabricated-looking metrics erode trust | High | Label self-assessments; mock data marked; truthful claims only |
| Scope creep (14 immersive pages) | High | Phased delivery; reusable components; config-driven content |
| Missing assets (LinkedIn, certs images) | Med | Placeholders + Open Questions; easy config swap later |
| Accessibility regressions from motion | Med | Reduced-motion + Lite Mode enforced from P0 |

---

## 12. Decisions & Open Questions

### ✅ Locked (confirmed 2026-06-11)
1. **Public email:** `itsmatruprasad@gmail.com` (single public address; college/personal not shown).
2. **Contact form:** **Real submissions** via Formspree or Netlify Forms (no backend; messages reach inbox).
3. **Navigation:** **Both** — deep-linkable routed modules **and** a continuous cinematic-scroll mode, switchable via a toggle in the StatusBar.
4. **LinkedIn:** Will be provided — user pastes the `linkedin.com/in/...` URL; config slot (`profile.linkedin`) reserved.

### ⏳ Still open (sensible defaults applied; swap anytime via config)
5. **LinkedIn URL** — awaiting the actual link to populate `profile.linkedin`.
6. **Research paper link/DOI** for ICEVB 2025 — link if available, else publication card shows venue + abstract only.
7. **Certificate images** — styled placeholders by default; drop in scans later.
8. **Headshot** — default to resume photo unless an alternate is provided.
9. **Sound design** — default: subtle UI audio **off by default** with a mute toggle (no autoplay).
10. **Domain** — default: Netlify subdomain; custom domain can be attached later.
11. **AI narration tone** — default: **balanced** (professional with light JARVIS personality).

---

## 13. Appendix

### 13.1 Module ↔ Resume Source Map
| Module | Resume source |
|---|---|
| Hero, Identity | Header (name, contact, GitHub, location) |
| AI Intro, Recruiter Impact | Professional Summary |
| Timeline, Experience | Education + Experience |
| Skills Matrix | Technical Skills |
| FMCG Command Center | FMCG Sales & Distribution Analytics project |
| Cyber Lab | IIT Jammu Cybersecurity internship |
| Research Zone | ICEVB 2025 paper |
| Leadership, Achievement Vault | Certifications & Achievements (Leadership/Awards) |
| Certification Wall | Certifications list |

### 13.2 Naming
- Product: **MATRU OS** · Version label in UI: `MATRU OS v1.0` · Tagline: *Data. Intelligence. Leadership.*

### 13.3 Definition of Done (per module)
Implemented · responsive · reduced-motion safe · no console errors · content from config · keyboard reachable · reviewed against acceptance criteria.

---

*End of SRS v1.0 — pending your answers to §12 before development begins.*
