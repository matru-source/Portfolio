# Matru Prasad Panda — Portfolio

> **Data Analyst & BI Engineer** · *Turning raw data into decisions.*

A clean, professional, multi-page portfolio with tasteful interactive 3D — built around real
data-analytics projects (FMCG, food & retail, aviation).

---

## 🚀 Getting started

```bash
npm install      # install dependencies
npm run dev      # dev server  → http://localhost:5173
npm run build    # typecheck + production build → /dist
npm run preview  # serve the production build
npm run lint     # eslint
```

Requires **Node 18+** (built on Node 24).

---

## 🧱 Tech stack

React 18 · TypeScript · Vite · TailwindCSS · React Router · Framer Motion ·
**React Three Fiber + drei** (interactive 3D) · lucide-react.

Light, clean theme · refined blue accent · lots of whitespace.

---

## 🗂️ Structure

```
src/
├─ pages/            # Home, About, Projects, Experience, Contact, 404
├─ routes/           # AppRoutes (multi-page routing)
├─ components/
│  ├─ layout/        # Navbar, Footer, Layout, ScrollToTop
│  ├─ ui/            # Button, Card, Section, SectionHeading, Badge, SkillBar, Stat, Reveal
│  └─ sections/      # ProjectCard, ContactForm
├─ three/            # Interactive 3D: HeroScene (data-bar field), ProjectsScene (floating shapes)
├─ data/             # ★ SINGLE SOURCE OF TRUTH — all résumé content (typed)
├─ hooks/            # useMouseParallax, usePrefersReducedMotion, useScrollProgress
├─ lib/              # cn(), constants
├─ types/            # shared types
└─ styles/           # tokens.css + globals.css
```

### Pages
- **Home** — hero with interactive 3D data-bar field, stats, featured projects, CTA.
- **About** — summary, quick facts, full skills (animated bars), certifications, achievements, leadership.
- **Projects** — interactive 3D header + detailed project cards + published research.
- **Experience** — vertical timeline of internships/roles + education.
- **Contact** — contact details, socials, and a working contact form.

---

## ✏️ Editing content

Everything is data-driven — edit the typed files in [`src/data/`](src/data/), no components needed:

- `profile.ts` — name, title, contact, **LinkedIn** (paste your URL into `linkedin`), résumé path.
- `projects.ts` · `skills.ts` · `experience.ts` · `certifications.ts` · `achievements.ts` ·
  `leadership.ts` · `research.ts` · `timeline.ts`.

### To-do for Matru
- [ ] Paste your **LinkedIn URL** into `src/data/profile.ts → linkedin` (it then appears in the nav/footer/contact).
- [ ] Add your résumé PDF at `public/resume/Matru_Prasad_Panda_Resume.pdf`.
- [ ] *(Optional)* Enable a real contact form: set `FORMSPREE_ENDPOINT` in
  `src/components/sections/ContactForm.tsx` to your [Formspree](https://formspree.io) URL.
  Until then, the form opens the visitor's email client (mailto) — which always works.

---

## ⚡ Performance

- The Three.js stack is **lazy-loaded** and code-split into its own chunk — it loads only when a
  3D scene mounts (Home / Projects). Other pages stay light (~110 KB gz initial).
- All 3D and animation honor `prefers-reduced-motion`.
- A WebGL error boundary falls back to a clean gradient if 3D can't run.

---

## 🎨 Theme tokens

| Token | Value |
|---|---|
| Ink / Body / Muted | `#0F172A` / `#475569` / `#64748B` |
| Primary (blue) | `#2563EB` |
| Accent (cyan) | `#06B6D4` |
| Canvas / Surface | `#F6F8FC` / `#FFFFFF` |
| Display / Body / Mono | Sora · Inter · JetBrains Mono |

---

*Note: the planning docs from an earlier, more elaborate concept (`SRS_…`, `CREATIVE_DIRECTION_…`,
`ENGINEERING_BLUEPRINT_…`) remain in the repo root for reference but no longer describe this build.*
