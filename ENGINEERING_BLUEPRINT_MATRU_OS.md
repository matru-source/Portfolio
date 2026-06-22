# MATRU OS — Master Engineering Blueprint
## v1.0 · Production-Grade Implementation Plan (Architecture Only)

> "Data. Intelligence. Leadership." — turning the Creative Direction Bible into a buildable system.

| Field | Value |
|---|---|
| Product | MATRU OS |
| Stack | React 18 + TypeScript + Vite + R3F + Zustand + GSAP + Tailwind |
| FPS targets | Desktop 60 · Laptop 45-60 · Mobile 30+ |
| Builder profile | One final-year CSE student (~15-20 hrs/week) |
| Companions | CREATIVE_DIRECTION_MATRU_OS.md · SRS_MATRU_OS.md |
| Status | Engineering blueprint — pre-build |
| Date | 2026-06-11 |

---

### How to read this blueprint
Section 0 is the one-breath overview. Sections 1-8 define the system (architecture, stack, structure, Three.js, state, design tokens, performance). Section 9 is the per-world engineering spec for all fifteen worlds. Section 10 covers recruiter-facing engineering. Sections 11-13 are the roadmap, build order, and risk plan. Section 14 closes with the Definition of Done. Every component, system, store, and hook uses the canonical names defined herein — build against those names and the pieces will fit together.


### Contents
0. Executive Engineering Summary
1. Technical Architecture
2. Tech Stack Review & Recommended Libraries
3. Folder Structure
4. Component Tree
5. Three.js System Architecture
6. State Management Strategy
7. Design System Engineering
8. Performance Plan
9. World Architecture — All 15 Worlds
10. Recruiter Experience Engineering
11. Development Roadmap
12. Build Order
13. Risk Assessment
14. Final Engineering Direction & Definition of Done

---

## 0. Executive Engineering Summary

MATRU OS is, in one breath: a **single global R3F `<Canvas>`** owned by `SceneDirector`, a layer of **world-agnostic shared systems** (`CameraRig`, `ParticleField`, `LightingDirector`, `PostFX`, `TransitionController`, `QualityGovernor`, `AssetManager`, `WorldRouter`, `AudioBus`) coordinated through **four Zustand stores**, against which **15 worlds are mounted scenes** — never separate canvases, never importing one another, communicating only through Systems and Stores. Everything is **tier-gated** by a runtime `QualityGovernor` that resolves Tier 0 Cinematic, Tier 1 Balanced, or Tier 2 Lite from a rolling FPS average plus device probe.

The four highest-leverage decisions:

1. **One Canvas, one camera, one particle system.** A solo dev cannot maintain 15 scene graphs. `ParticleField` is *one* instanced GPU points system that GPU-lerps between named morph targets (`globe`, `neuralNet`, `packetSwarm`, …) per world — this single shader is what makes inter-world travel feel cinematic instead of like page loads.

2. **`frameloop="demand"` by default.** Idle worlds cost ~0 GPU; the loop flips to `always` only during active transitions or live ticks, then settles. This is the difference between 60 FPS and a melting laptop.

3. **Strict authority boundaries between animation libs.** GSAP owns anything touching the Canvas, a uniform, or the scrollbar (deterministic, seekable timelines); Framer Motion owns DOM entering/leaving/relayouting. No third model.

4. **Recruiter-safe DOM is the default, not the fallback.** HUD/panels are real DOM in a `#hud-root` portal stacked above the Canvas (`z-10+`); the WebGL layer is `z-0`, `pointer-events:none` until a world declares interactive 3D. Tracking-a-3D-point → drei `<Html>`; static chrome → DOM portal.

**Quality-tier philosophy:** never branch on device strings — branch on *measured* frames with hysteresis, and always keep a recruiter-safe Lite path (flat glass UI, vignette-only PostFX) one toggle away. Degrade features, never usability.

**How to read this blueprint:** Sections 1–2 establish the architecture and stack; Sections 3–10 detail folders, the Three.js systems, state, tokens, performance budgets, the 15 world specs, and recruiter engineering; Sections 11–12 give the phased roadmap and hard build-order rules; this section frames the whole and Section 14 closes with non-negotiables and Definition of Done. Read 0 → 1 → 2 → 11/12 first to build; dive into world specs only when you reach that phase. Canonical names are law — use them verbatim everywhere.

## 1. Technical Architecture

### **System Layers**

MATRU OS is organized as six cooperating layers. Each owns a strict slice of responsibility so a solo developer can build and reason about them independently.

| Layer | Owns | Key modules |
|---|---|---|
| **Presentation / DOM-UI** | All recruiter-readable HTML: StatusBar, HUD panels, world overlays, command palette, copilot, toasts, cursor. Styling via Tailwind + CSS variables (design tokens). Animated with Framer Motion. | `src/ui/**`, `src/components/**` |
| **WebGL / 3D** | Everything rendered inside the single R3F `<Canvas>`: the active world's meshes, `ParticleField`, lights, post-processing. | `src/worlds/**`, `src/three/**` |
| **Systems** | Cross-cutting engine logic that is world-agnostic. The canonical `src/systems/*`: SceneDirector, WorldRouter, CameraRig/CameraController, ParticleField controller, LightingDirector, TransitionController, PostFX, QualityGovernor, AssetManager, AudioBus. | `src/systems/**` |
| **State** | Single source of runtime truth via Zustand: useSystemStore, useWorldStore, useRecruiterStore, useUIStore. No business logic in components. | `src/stores/**` |
| **Data** | Static typed content (projects, certs, timeline, skills), labeled mock vs real. Imported, never fetched. | `src/data/**`, `src/hooks/**` |
| **Routing** | URL <-> world reconciliation, deep links, and scroll-mode driving. | WorldRouter + React Router + Lenis |

The **dependency rule** flows one way: UI and Worlds read State and call Systems; Systems read State and Data; Data depends on nothing. Worlds never import each other; they coordinate only through Systems + Stores.

### **DOM <-> WebGL Coexistence**

A **single global `<Canvas>`** (owned by SceneDirector) is fixed at `z-0`, full-viewport, `pointer-events:none` by default. All HUD/panels/overlays live in a **DOM overlay portal** layer (`#hud-root`) stacked at `z-10+` above the Canvas. This is the default and recruiter-safe path: panels are real DOM (accessible, selectable, ATS/print-friendly), absolutely positioned, and re-enable `pointer-events:auto` only on interactive elements.

`drei <Html>` is used **sparingly** — only for labels/markers that must track a 3D point (e.g., a constellation node tooltip) where screen-space DOM math would be fragile. Rule: tracking-in-3D-space -> `Html`; static framing chrome -> DOM portal.

**Pointer/event strategy:** the Canvas opts into pointer events only when a world declares interactive 3D objects; otherwise raycasting is disabled to save cost. A shared `useUIStore.cursorState` mediates the custom cursor across both layers. Mouse parallax (`useMouseParallax`) is read by CameraController without stealing DOM focus.

### **Rendering Model**

Default **`frameloop="demand"`** — the Canvas renders only when invalidated. Continuous animation (particles morphing, idle camera `sway()`, live world ticks) calls `invalidate()` per frame or temporarily flips to `frameloop="always"` while a TransitionController timeline or particle morph is active, then drops back to demand on settle. This keeps idle worlds (e.g., a static Credential Vault) at ~0 GPU cost. QualityGovernor samples a rolling FPS average from the active render loop to drive tiering with hysteresis.

### **Routing Model**

WorldRouter supports two co-existing modes held in `useSystemStore.mode`:

- **Routed (deep-link):** React Router maps `/world/:key` <-> world. Recruiters land directly on `/impact`. WorldRouter resolves key -> world module, triggers TransitionController for the inter-world travel.
- **Scroll (cinematic):** Lenis drives a virtual scroll; `useScrollProgress` maps progress -> ordered world sequence. WorldRouter syncs the URL via `history.replace` as thresholds cross, so scroll mode stays deep-linkable without page reloads.

Reconciliation: WorldRouter is the **single arbiter**. Both a route change and a scroll threshold funnel into one `requestWorld(key, source)` call; it de-dupes, sets `activeWorld`, and hands the transition to TransitionController so the two modes never fight.

### **Boot-to-World Lifecycle**

```
mount App -> read device probe + prefersReducedMotion
  -> QualityGovernor sets initial tier -> useSystemStore.bootStatus='probing'
  -> SceneDirector mounts global <Canvas>
  -> AssetManager preloads boot + hero assets
  -> Cold Ignition world plays -> bootStatus='ready'
  -> WorldRouter resolves entry URL -> first world enter
```

### **Per-World Mount/Unmount Lifecycle**

```
requestWorld(key) -> useWorldStore.loadState='loading'
  -> AssetManager.lazyLoad(world) (+ useGLTF.preload next world)
  -> SceneDirector mounts world -> LightingDirector applies preset
  -> ParticleField.morphTo(target) + CameraController enter timeline
  -> loadState='ready'  ...world live...
  -> on exit: CameraController exit move -> SceneDirector unmounts
  -> AssetManager.dispose(world) (geometries/textures/materials)
```

### **ASCII System Architecture**

```
+---------------------------------------------------------------+
|  DOM OVERLAY PORTAL (#hud-root, z>=10)                         |
|  StatusBar | HUD Panels | CommandPalette | Copilot | Cursor   |
+---------------------------------------------------------------+
|  SINGLE R3F <Canvas> (z0, frameloop=demand)                   |
|   SceneDirector -> [ Active World ] + ParticleField + PostFX  |
+---------------------------------------------------------------+
        |                |                 |
   +----v----+   +-------v--------+   +-----v------+
   | SYSTEMS |   |  WorldRouter   |   | Quality    |
   | Camera/ |<->| (routed+scroll)|<->| Governor   |
   | Light/  |   | TransitionCtrl |   | (FPS tier) |
   | Asset/  |   +-------+--------+   +-----+------+
   | Audio   |           |                 |
   +----+----+           v                 v
        |        +-----------------------------------+
        +------->|  ZUSTAND STORES (single truth)    |
                 |  system | world | recruiter | ui  |
                 +----------------+------------------+
                                  |
                          +-------v-------+
                          | DATA src/data |  (typed, static)
                          +---------------+
```

### **ASCII Data-Flow Diagram**

```
[User input]            [Lenis scroll]         [URL change]
  click/key                 |                      |
     |                      v                      v
     |              useScrollProgress        React Router
     |                      \                    /
     v                       \                  /
  useUIStore  --------->   WorldRouter.requestWorld(key, source)
                                   |
                                   v
                          TransitionController
                          (camera move + particle morph + postFX)
                                   |
              +--------------------+--------------------+
              v                    v                    v
        CameraController     ParticleField        LightingDirector
              |                    |                    |
              +---------> invalidate()/frameloop -------+
                                   |
                                   v
                          <Canvas> renders frame
                                   |
                                   v
                 QualityGovernor samples FPS -> sets tier
                                   |
                                   v
              useSystemStore.qualityTier -> Systems re-read budget
```

Relevant references: `c:\Users\matru\OneDrive\Desktop\Portfolio\CREATIVE_DIRECTION_MATRU_OS.md`, `c:\Users\matru\OneDrive\Desktop\Portfolio\SRS_MATRU_OS.md`.

## 2. Tech Stack Review & Recommended Libraries

### Core Verdict Table

| Library | Verdict | Role in MATRU OS | Why |
|---|---|---|---|
| **React 18** | KEEP | App shell, component model, concurrent rendering | Industry baseline; concurrent features (`useTransition`) smooth world swaps; R3F demands it. |
| **Vite** | KEEP | Build tool + dev server | Fastest HMR for shader/scene iteration; native code-splitting per world route; tree-shakes three. |
| **TypeScript** | KEEP | Type safety across systems/stores/data | Canonical interfaces (morph targets, tiers, world keys) only stay consistent if compiler-enforced. |
| **TailwindCSS** | KEEP | DOM/UI styling + design tokens via CSS vars | Token-driven glass UI built fast; arbitrary values map cleanly to the spacing/radius scale. |
| **Framer Motion** | KEEP | DOM/UI + **layout** animation only | Best-in-class `layout`/`AnimatePresence` for panels, toasts, route-mounted HUD; declarative React fit. |
| **GSAP + ScrollTrigger** | KEEP | **Scroll + timeline + camera** authority | Owns CameraRig moves, TransitionController, ParticleField morphs; deterministic timelines beat spring physics for cinematics. |
| **React Three Fiber** | KEEP | The single global `<Canvas>` / scene graph | Declarative three; the entire SceneDirector/world architecture is built on it. |
| **drei** | KEEP | R3F helpers (loaders, Text, controls, perf) | Ships `useGLTF`, `Text` (troika), `AdaptiveDpr`, `Environment` — removes hundreds of lines of glue. |
| **@react-three/postprocessing** | KEEP | EffectComposer pipeline | The exact PostFX chain (Bloom→DOF→CA→Vignette→Noise) maps 1:1 to its effects; tier-gateable. |
| **Zustand** | KEEP | Global state (system/world/recruiter/UI stores) | Tiny, selector-based, **no re-render of the Canvas** on UI state change — critical for FPS. |
| **Lenis** | KEEP | Smooth scroll driving cinematic mode | Feeds normalized scroll to GSAP/ScrollTrigger + WorldRouter scroll mode; the velocity source for CA accents. |
| **Motion One** | **CUT** | (would-be micro UI animation) | Redundant: overlaps Framer Motion (UI) and GSAP (timeline). Adds a 3rd animation mental model for zero unique capability. |

### Resolving the Animation-Lib Overlap

Three animation libraries is one too many. Draw a hard boundary by **domain of authority**, not by preference:

- **GSAP + ScrollTrigger = the imperative/3D/scroll layer.** It owns everything tied to the WebGL world and the scrollbar: `CameraController` moves (`dolly/orbit/pushIn/focus/rackFocus/sway`), `ParticleField` morph lerps, `TransitionController` inter-world travel, and scroll-velocity → chromatic-aberration. Reason: GSAP timelines are *deterministic and seekable* (essential for scrubbed cinematic-scroll), and ScrollTrigger is the mature, battle-tested driver for scroll-pinned sequences. It animates plain objects/uniforms, so it reaches into three.js without React re-renders.
- **Framer Motion = the declarative DOM/UI/layout layer.** It owns HUD panels, StatusBar, toasts, command-palette entrance, route-mounted overlays, and shared-layout transitions (`AnimatePresence`, `layout`). Reason: spring-based, React-idiomatic, and unmatched at layout/exit animations — exactly where GSAP is awkward.
- **Motion One = DROP.** Its niche (tiny WAAPI-backed UI tweens) is fully covered by Framer Motion, and it cannot author the seekable 3D timelines GSAP owns. Keeping it would force the solo dev to learn a third API and risk two libs animating the same DOM node. Removing it shrinks bundle and cognitive load with zero feature loss.

**Rule of thumb for the builder:** *Does it touch the `<Canvas>`, a uniform, or the scrollbar? → GSAP. Is it a DOM element entering/leaving/relayouting? → Framer Motion.*

### Recommended Additions

| Library | Why add it |
|---|---|
| **r3f-perf** | In-canvas FPS/draw-call/memory HUD; feeds the dev-mode overlay and validates QualityGovernor tiers. Dev-gated. |
| **leva** | Dev-only GUI to tune bloom, lighting presets, morph speeds, camera moves without recompiling. Stripped from prod. |
| **maath** | Lightweight math helpers (easing, random distributions, `lerp`) for ParticleField morph buffers — avoids hand-rolling. |
| **troika-three-text** (via **drei `Text`**) | SDF text rendered in-scene (world labels, HUD-in-3D) at 60 FPS; prefer drei's wrapper, no separate install needed. |
| **ktx2 + draco loaders** | GPU-compressed textures + geometry; mandatory for mobile Tier 2 load budgets and AssetManager dispose-on-exit. |
| **meshline** | Fat/animated lines for Starline timeline, Uplink Array beams, neural-net edges — `THREE.Line` can't do width. |
| **kbar** | Battle-tested command palette (`Ctrl+K`) for recruiter fast-path navigation; saves building a11y/focus-trap from scratch. Evaluate vs custom — recommend kbar to save time. |
| **clsx + tailwind-merge** | Safe conditional Tailwind class composition (cursor states, tier-variant glass) without class conflicts. |
| **lucide-react** | Consistent, tree-shakeable icon set matching the clean HUD aesthetic. |
| **@studio-freight/lenis** | The actual npm package name for Lenis — pin this; it is the canonical scroll dependency. |
| **vite-imagetools** | Build-time responsive/AVIF/WebP image generation for DOM textures and OG/print assets. Dev (build) tool. |
| **Formspree** | Backendless contact submission for the Uplink Array; keeps the project static-deployable, no server. |

### Final Dependency Manifest

| Package | Purpose | Dev/Prod | Tier-gated? |
|---|---|---|---|
| react, react-dom | App runtime | Prod | No |
| typescript | Type safety | Dev | No |
| vite, @vitejs/plugin-react | Build/dev server | Dev | No |
| tailwindcss, postcss, autoprefixer | Styling | Dev (build) | No |
| framer-motion | DOM/UI + layout anim | Prod | No |
| gsap (+ ScrollTrigger) | Scroll/timeline/camera/morph | Prod | No |
| three | WebGL core | Prod | No |
| @react-three/fiber | React renderer for three | Prod | No |
| @react-three/drei | R3F helpers + `Text` | Prod | Partial (helpers tier-gated at use) |
| @react-three/postprocessing | EffectComposer PostFX | Prod | **Yes** (effects per tier) |
| zustand | State stores | Prod | No |
| @studio-freight/lenis | Smooth scroll | Prod | **Yes** (off in reduced-motion) |
| maath | Math/easing helpers | Prod | No |
| meshline | Fat animated lines | Prod | **Yes** (count/quality per tier) |
| three-stdlib (draco/ktx2 loaders) | Compressed asset loading | Prod | No (assets vary by tier) |
| kbar | Command palette | Prod | No |
| clsx, tailwind-merge | Class composition | Prod | No |
| lucide-react | Icons | Prod | No |
| @formspree/react | Contact form | Prod | No |
| r3f-perf | Perf HUD | **Dev** | Dev-only |
| leva | Tuning GUI | **Dev** | Dev-only |
| vite-imagetools | Image pipeline | **Dev** (build) | No |

*Cut from stack: **Motion One** (redundant with Framer Motion + GSAP).*

## 3. Folder Structure

```
matru-os/
├── public/                          # Static, un-bundled assets served as-is
│   ├── models/                      # .glb/.gltf (draco-compressed) per world
│   ├── textures/                    # .ktx2 / .webp env maps, matcaps, noise
│   ├── hdr/                         # .hdr environment lighting probes
│   ├── fonts/                       # Orbitron/Sora/Inter/JetBrains + troika .json msdf
│   ├── audio/                       # ambient.ogg, ui-tick.ogg (lazy, OFF by default)
│   ├── draco/                       # draco decoder wasm/js
│   ├── basis/                       # ktx2 transcoder wasm
│   └── og/                          # social share / print-mode images
└── src/
    ├── app/                         # App shell: <App>, providers, boot sequence, error boundary
    │   ├── App.tsx                  #   root composition (providers → router → scene + overlay)
    │   ├── Providers.tsx            #   nests all context providers in correct order
    │   ├── BootGate.tsx             #   blocks render until QualityGovernor probe + assets ready
    │   └── ErrorBoundary.tsx        #   recruiter-safe fallback on crash
    ├── routes/                      # Route table + per-route lazy world loaders (React Router)
    │   ├── router.tsx               #   createBrowserRouter config; maps URL ↔ WorldRouter
    │   └── routeMap.ts              #   worldKey ↔ path ↔ module registry (single source)
    ├── systems/                     # CANONICAL shared systems (one instance each, framework-level)
    │   ├── SceneDirector/           #   owns single <Canvas>; mounts/unmounts active world
    │   ├── WorldRouter/             #   routed mode + cinematic-scroll mode; drives transitions
    │   ├── CameraRig/               #   shared PerspectiveCamera + CameraController moves
    │   ├── ParticleField/           #   ONE instanced GPU points system + morph targets
    │   ├── LightingDirector/        #   global rig + per-world lighting/bloom presets
    │   ├── TransitionController/    #   inter-world camera move + particle morph + FX accent
    │   ├── PostFX/                  #   EffectComposer stack, tier-gated (see effects/)
    │   ├── QualityGovernor/         #   runtime FPS monitor → tier; hysteresis + override
    │   ├── AssetManager/            #   GLTF/draco/ktx2 lazy load + dispose-on-exit + preload
    │   └── AudioBus/                #   optional UI ticks + ambient; global mute
    ├── worlds/                      # The 15 worlds; one folder per WorldName (see detail below)
    │   ├── ColdIgnition/            #   boot
    │   ├── AscensionGrid/           #   hero
    │   ├── AwakeningChamber/        #   ai
    │   ├── Starline/                #   timeline
    │   ├── CredentialVault/         #   identity
    │   ├── ReactorForge/            #   skills
    │   ├── SovereignGrid/           #   fmcg
    │   ├── SentinelGrid/            #   cyber
    │   ├── OracleEngine/            #   research
    │   ├── HallOfCommand/           #   leadership
    │   ├── Reliquary/               #   vault
    │   ├── HangarOfMissions/        #   experience
    │   ├── VerificationVault/       #   certs
    │   ├── TribunalOfLight/         #   impact
    │   └── UplinkArray/             #   contact
    ├── components/                  # Reusable React UI (DOM, non-system)
    │   ├── ui/                      #   buttons, glass panels, badges, tooltips, modals
    │   ├── hud/                     #   StatusBar, NavDock, CommandPalette, Copilot/ARC, CustomCursor, Toasts
    │   └── charts/                  #   recharts/svg data viz for impact + skills + fmcg
    ├── shaders/                     # Raw GLSL (.glsl/.vert/.frag) + glslify chunks
    │   ├── particles/               #   morph-lerp points vertex/fragment
    │   ├── materials/               #   glass/transmission, grid, energy, fresnel
    │   └── chunks/                  #   shared noise/curl/sdf includes
    ├── effects/                     # postfx: custom Effect wrappers + composer presets per tier
    ├── transitions/                 # Named inter-world transition recipes (camera+particle+FX)
    ├── hooks/                       # Canonical hooks (useQualityTier, useScrollProgress, …)
    ├── stores/                      # Zustand stores (useSystemStore, useWorldStore, …)
    ├── data/                        # Static typed content — single source of truth (worlds, bio, skills)
    ├── audio/                       # Audio manifest + cue map consumed by AudioBus
    ├── lib/                         # Pure utilities: math, easing, gltf helpers, device probe, format
    ├── styles/                      # Tailwind entry, CSS variables (design tokens), global resets
    └── types/                       # Shared TS types: World, QualityTier, MorphTarget, RouteMap
```

A single world folder (e.g. `src/worlds/ReactorForge/`) contains:

```
ReactorForge/
├── ReactorForge.tsx          # [R3F] world root: scene graph mounted by SceneDirector
├── index.ts                  # barrel: lazy export + world manifest registration
├── config.ts                 # WorldConfig: camera preset, morph target, bloom, lighting, tier caps
├── scene/                    # [R3F] in-canvas pieces (Environment, props, instanced meshes)
├── overlay/                  # [DOM] world-specific HUD/panels portaled over the canvas
├── content.ts               # typed re-export/selector from src/data for this world
├── animations.ts            # GSAP enter/exit timelines + ScrollTrigger bindings
└── assets.ts                # manifest of models/textures for AssetManager lazy load + preload
```

## 4. Component Tree

The render tree from `<App>` downward. The Canvas hosts the entire R3F scene as a sibling to a fixed-position DOM overlay; both share state via Zustand (no prop drilling across the DOM/canvas boundary).

```
<App>                                         [DOM overlay] root
└─ <Providers>                                [DOM overlay] context nest
   ├─ Zustand (no provider; hooks only)
   ├─ <LenisProvider>                         [DOM overlay] smooth-scroll context
   ├─ <RouterProvider>                        [DOM overlay] React Router (createBrowserRouter)
   └─ <ErrorBoundary>                         [DOM overlay] recruiter-safe fallback
      └─ <BootGate>                           [DOM overlay] waits on QualityGovernor probe + boot assets
         ├─ <SceneDirector>                   [DOM overlay] owns the single Canvas + world lifecycle
         │  └─ <Canvas>                       [R3F in-canvas] ONE global R3F canvas (whole app)
         │     ├─ <CameraRig>                 [R3F in-canvas] shared PerspectiveCamera
         │     │  └─ CameraController          (imperative; GSAP moves: dolly/orbit/pushIn/focus…)
         │     ├─ <LightingDirector>          [R3F in-canvas] global rig + active world preset
         │     ├─ <ParticleField>             [R3F in-canvas] ONE instanced GPU points, morphs by world
         │     ├─ <TransitionController>      [R3F in-canvas] drives camera+particle morph between worlds
         │     ├─ <Suspense fallback={null}>  [R3F in-canvas] gates lazy world assets
         │     │  └─ <ActiveWorld/>           [R3F in-canvas] current world (one mounted at a time)
         │     │     └─ e.g. <ReactorForge>   [R3F in-canvas] world root subtree (decomposed below)
         │     └─ <PostFX>                    [R3F in-canvas] EffectComposer, tier-gated stack
         │        └─ Render → Bloom → DOF → ChromaticAberration → Vignette → Noise
         └─ <DOMOverlay>                       [DOM overlay] fixed full-screen UI layer (pointer-events scoped)
            ├─ <StatusBar>                     [DOM overlay] tier badge, FPS, manual tier override, mute, time-of-day
            ├─ <NavDock>                       [DOM overlay] world navigation / quest map
            ├─ <CommandPalette>                [DOM overlay] kbar-driven deep-jump (useUIStore.commandPaletteOpen)
            ├─ <Copilot/ARC>                   [DOM overlay] assistant panel (useCopilot)
            ├─ <CustomCursor>                  [DOM overlay] reactive cursor (useUIStore.cursorState)
            ├─ <Toasts>                        [DOM overlay] transient notifications
            └─ <WorldOverlayPortal>            [DOM overlay] mounts the ActiveWorld's overlay/* panels
```

A world subtree decomposes the same way every time (consistency lets one student build all 15). Using `ReactorForge` (skills → Reactor Forge):

```
<ReactorForge>                                [R3F in-canvas] world root, mounted by SceneDirector
├─ <WorldShell key="skills">                  [R3F in-canvas] standard wrapper: registers config, fires enter/exit
│  ├─ reads config.ts → CameraRig.applyPreset(), LightingDirector.apply(), ParticleField.morphTo('reactor')
│  └─ runs animations.ts (GSAP enter timeline) on mount; exit timeline on unmount
├─ <Environment/>                             [R3F in-canvas] HDR/env map + fog for this world
├─ <ReactorCore/>                             [R3F in-canvas] hero mesh (transmission @Tier0, glass @Tier1+)
├─ <SkillNodes/>                              [R3F in-canvas] instanced skill emitters bound to data/skills
├─ <InteractiveProps/>                        [R3F in-canvas] hover/focus targets → CameraController.focus()
└─ (portaled) <ReactorForgeOverlay>          [DOM overlay] world HUD: skill detail cards, legend, controls
   ├─ <GlassPanel> + <SkillChart>             [DOM overlay] components/ui + components/charts
   └─ <WorldNavHints>                          [DOM overlay] next/prev world, scroll affordance
```

Key invariants: exactly one `<Canvas>` exists for the app's lifetime (mounting/unmounting per world would thrash GPU context); only one `<ActiveWorld>` is mounted at a time, swapped by `SceneDirector` under a Suspense boundary while `AssetManager` preloads the next world. `ParticleField`, `CameraRig`, `LightingDirector`, `TransitionController`, and `PostFX` persist across world swaps — worlds only declare intent via `config.ts`, never instantiate these systems. In Tier 2 / `liteMode` / `reducedMotion`, `SceneDirector` may mount a flat `<World/>` swap (2D canvas or CSS glass UI) in place of the heavy R3F subtree while the DOM overlay tree stays identical, guaranteeing the recruiter-safe path.

## 5. Three.js System Architecture

### 5.1 Global Scene Graph

A **single** `<Canvas>` lives at the app root, owned by `SceneDirector`. It never unmounts. Everything below is a stable singleton; only the **WorldGroup contents** swap.

```
<Canvas frameloop={tier-driven} dpr={[1, capByTier]} gl={{ antialias:false, powerPreference:'high-performance' }}>
  <SceneRoot>                         // persistent
    ├─ <CameraRig> → PerspectiveCamera (the ONE shared camera)
    ├─ <LightingDirectorRig>          // global lights, swappable presets
    ├─ <ParticleField>                // ONE points system, persists across worlds
    ├─ <WorldGroup>                   // SceneDirector mounts/unmounts active world here
    │     └─ <ActiveWorld />          // lazy(); only ONE world mounted at a time
    ├─ <TransitionLayer>              // morph/camera choreography overlay (no meshes)
    └─ <PostFXComposer />             // EffectComposer, tier-gated
  </SceneRoot>
</Canvas>
```

Rules: ParticleField, CameraRig, LightingDirector, PostFX are **never** remounted — remounting reallocates GPU buffers and stutters. Worlds mount as `React.lazy` modules into `WorldGroup`. SceneDirector keeps at most the current world (+ a brief overlap window during a transition) alive. Per-world meshes own their geometry/material and dispose on unmount (§5.8).

### 5.2 ParticleField Engine

One `THREE.Points` over a single `BufferGeometry`, sized once to the **tier ceiling** (count never grows at runtime; tier shrinks the *drawn* range via geometry `setDrawRange`, avoiding realloc). Each world contributes a named **morph-target position buffer**; morphing is a GPU lerp in a custom `ShaderMaterial`.

Attributes (all `Float32`/static, written once per target swap):
- `position` — current/source target (vec3)
- `aTargetPos` — destination target (vec3); morph blends position→aTargetPos
- `aColorA`, `aColorB` — per-vertex source/dest color (lerped by uMorph)
- `aSize`, `aSeed` — base size, per-particle random for drift/twinkle

Uniforms: `uMorph` (0→1 blend), `uTime`, `uSizeScale` (tier), `uPixelRatio`, `uTint`, `uPointer` (parallax). The vertex shader: `pos = mix(position, aTargetPos, smootherstep(uMorph))` plus curl-noise drift via `aSeed`; fragment draws a soft additive disc.

Morph targets are precomputed CPU-side per world (`globe`, `neuralNet`, `packetSwarm`, `grid`, `constellation`, `reactor`, `stream`) and cached as `Float32Array` keyed by name + count. Switching = upload the new array into `aTargetPos`, reset `uMorph=0`, then GSAP-tween `uMorph→1` (driven by TransitionController). On completion, the dest buffer is copied into `position` and `aTargetPos` is freed for reuse.

```ts
type MorphTargetName = 'globe'|'neuralNet'|'packetSwarm'|'grid'|'constellation'|'reactor'|'stream';

interface ParticleFieldAPI {
  setCount(count: number): void;                 // clamps to tier ceiling via drawRange
  registerTarget(name: MorphTargetName, build: (count:number)=>Float32Array): void;
  morphTo(name: MorphTargetName, opts?: { duration?:number; ease?:string;
            colorA?:THREE.Color; colorB?:THREE.Color; onComplete?:()=>void }): gsap.core.Tween;
  setTint(color: THREE.Color): void;
  setPointer(x:number, y:number): void;          // parallax
  freeze(v:boolean): void;                        // pause drift (reduced-motion)
  current(): MorphTargetName;
}
```

Tier counts: Tier0 ≤120k, Tier1 ~50–60k, Tier2 ≤12–15k (or CSS fallback — ParticleField unmounts entirely in Lite and a flat layer renders). Single draw call; no per-particle objects.

### 5.3 CameraController

`CameraRig` holds the shared `PerspectiveCamera` on a `group` (rig). `CameraController` exposes **GSAP-timeline move primitives**; worlds never touch the camera directly — they *request* moves so TransitionController can sequence/interrupt them. `damp3`/`maath` smooths idle sway and pointer parallax in `useFrame`.

```ts
interface CameraMoveOpts { duration?:number; ease?:string; signal?:'interrupt'|'queue'; }
interface CameraController {
  dolly(z:number, o?:CameraMoveOpts): gsap.core.Timeline;
  orbit(theta:number, phi:number, radius?:number, o?:CameraMoveOpts): gsap.core.Timeline;
  pushIn(amount:number, o?:CameraMoveOpts): gsap.core.Timeline;
  focus(target:THREE.Vector3|THREE.Object3D, o?:CameraMoveOpts): gsap.core.Timeline;
  rackFocus(focusDistance:number, o?:CameraMoveOpts): void;   // drives DOF uniform
  sway(amp:number, freq:number): void;                        // idle ambient
  setFOV(fov:number, o?:CameraMoveOpts): gsap.core.Timeline;
  toPose(pose:CameraPose, o?:CameraMoveOpts): gsap.core.Timeline; // named per-world pose
  stop(): void;                                                // kill active tweens
}
interface CameraPose { position:[number,number,number]; lookAt:[number,number,number]; fov:number; }
```

`rackFocus` writes the DOF `focusDistance` uniform (Tier0/1). FOV pulls double as TransitionController "warp" accents. All tweens register with `CameraController.stop()` so an interrupting world entry cancels in-flight moves cleanly.

### 5.4 LightingDirector

Global rig = key + rim + ambient/hemisphere + optional env map. Each world declares a **preset** (color temperatures, intensities, fog, env intensity, **bloom intensity/threshold**). `LightingDirector.apply(preset, crossfadeMs)` GSAP-lerps light colors/intensities and the PostFX bloom uniforms so lighting and glow change *together* during a transition.

```ts
interface LightingPreset {
  key:{color:string;intensity:number;pos:[number,number,number]};
  rim:{color:string;intensity:number}; ambient:{color:string;intensity:number};
  fog:{color:string;near:number;far:number}; envIntensity:number;
  bloom:{intensity:number;threshold:number;radius:number};
}
// LightingDirector.apply(worldKey: WorldKey, crossfadeMs=600)
```

Shadows: dynamic (Tier0 only), baked/soft (Tier1), static/none (Tier2).

### 5.5 TransitionController — Travel Choreography

Inter-world travel is one synchronized timeline (NEVER a cross-fade). On `WorldRouter` change A→B:

```
0.00  lock input; QualityGovernor pauses tier downgrades
0.00  CameraController.toPose(B.entryPose, {signal:'interrupt'})   // camera flies
0.05  ParticleField.morphTo(B.target, {colorA:A.tint,colorB:B.tint}) // GPU lerp
0.05  PostFX: ramp ChromaticAberration ∝ scroll/camera velocity (warp accent)
0.15  LightingDirector.apply(B, 600)                                // lights+bloom xfade
0.30  SceneDirector.mount(B) BEHIND morph (AssetManager preloaded)  // overlap window
0.85  ramp ChromaticAberration → 0; bloom settles
1.00  SceneDirector.unmount(A) + dispose(A); unlock input
```

In cinematic-scroll mode the same steps are **scrubbed** by Lenis scroll progress instead of time. `useGLTF.preload(next)` runs during the prior world's idle so mount at 0.30 is allocation-free.

### 5.6 PostFX Pipeline

`@react-three/postprocessing` `EffectComposer`, fixed order, each pass tier-gated:

```
Render → Bloom → DOF → ChromaticAberration → Vignette → Noise(grain)
Tier0: all on (bloom+DOF+CA+vignette+grain)
Tier1: bloom on, DOF light/off, CA only during transitions, vignette on, grain off
Tier2: vignette only (or no composer at all → direct render)
```

Bloom intensity/threshold are driven by LightingDirector per world; CA is driven by TransitionController velocity. Composer `multisampling=0` (use FXAA-style or none on low tiers); `EffectComposer` is `enabled={tier!==2}` to skip the whole chain in Lite.

### 5.7 Render-Loop Strategy

Default `frameloop="demand"` for routed, mostly-static worlds (UI-heavy vaults) — render only on `invalidate()` (pointer, tween tick, store change). Worlds with continuous motion (ParticleField drift, scroll-scrub) switch to `frameloop="always"`; SceneDirector toggles this per active world via `setFrameloop`. During any active GSAP timeline (transitions, camera moves), force `always`, then drop back to `demand` on completion.

`useFrame` budgeting: ParticleField shader does the heavy work on GPU (cheap JS). CPU `useFrame` callbacks are **prioritized** — parallax/sway use throttled `damp3`; non-critical updates run every Nth frame. r3f-perf (dev only) watches the frame budget; QualityGovernor's rolling FPS avg (with hysteresis) drives tier, never raw per-frame numbers.

### 5.8 Disposal Strategy

On world exit (after the transition's unmount step), traverse the unmounting world group and release GPU memory; React unmount alone does **not** free `WebGLRenderer` resources.

```
disposeWorld(group):
  group.traverse(o => {
    o.geometry?.dispose();
    forEachMaterial(o, m => { disposeTextures(m); m.dispose(); });   // map, normalMap, env, ktx2
  });
  renderer.renderLists.dispose();
  AssetManager.release(worldKey);   // ref-counted GLTF/ktx2/draco cache
```

Persistent singletons (ParticleField, CameraRig, LightingDirector, PostFX) are **exempt** — never disposed. AssetManager ref-counts shared assets so a texture used by two worlds frees only at zero. ktx2/draco transcoders are created once and reused. This bounds VRAM to *one* world + the shared core at any moment, holding the 60 FPS target across all 15 worlds.

## 6. State Management Strategy

State is split into **four Zustand stores** (vanilla `create` + `subscribeWithSelector` + `persist` middleware) plus **typed content modules**. Zustand is chosen over Context because it allows reads *outside* React's render cycle — essential for 60 FPS inside `useFrame`.

### 6.1 Store Shapes (TS Sketches)

```ts
// useSystemStore — global runtime + device truth
interface SystemStore {
  bootStatus: 'cold' | 'loading' | 'ready';
  activeWorld: WorldKey;            // one of the 15 keys
  mode: 'routed' | 'scroll';
  qualityTier: 0 | 1 | 2;
  liteMode: boolean;               // forced Tier 2 path
  reducedMotion: boolean;
  audioOn: boolean;
  recruiterMode: boolean;
  devMode: boolean;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  // actions
  setActiveWorld(w: WorldKey): void;
  setTier(t: 0|1|2, source: 'auto'|'manual'): void;
  setMode(m: 'routed'|'scroll'): void;
  toggleAudio(): void;
}

// useWorldStore — per-world lifecycle, kept Map-like
interface WorldStore {
  load: Record<WorldKey, 'idle'|'loading'|'ready'|'error'>;
  ready: Record<WorldKey, boolean>;
  visited: Set<WorldKey>;
  quest: Record<WorldKey, number>;        // 0..1 progress
  markVisited(w: WorldKey): void;
  setLoad(w: WorldKey, s: WorldLoadState): void;
  setQuest(w: WorldKey, p: number): void;
}

// useRecruiterStore — the recruiter-safe lane
interface RecruiterStore {
  fastPath: boolean;
  atsMode: boolean;
  printMode: boolean;
  snapshotData: RecruiterSnapshot | null;   // typed, from src/data
  enableFastPath(): void;
}

// useUIStore — pure DOM/overlay state (re-renders OK here)
interface UIStore {
  commandPaletteOpen: boolean;
  copilotOpen: boolean;
  cursorState: 'default'|'hover'|'drag'|'focus';
  toasts: Toast[];
  pushToast(t: Toast): void;
  setCursor(s: CursorState): void;
}
```

### 6.2 R3F ↔ React Bridge (the critical rule)

**Nothing inside `<Canvas>` subscribes to per-frame-changing state via hooks.** Mouse position, scroll progress, camera targets, and particle morph weights live as **mutable refs**, mutated through `getState()` and read in `useFrame`:

```ts
// inside a world mesh — NO re-render
const get = useSystemStore.getState;            // stable ref
useFrame(() => {
  const t = get().qualityTier;                  // transient read
  particleRef.current.material.uniforms.uMorph.value =
    morphRef.current;                            // ref, not state
});
```

For values that change occasionally but must reach the GPU (tier, activeWorld, timeOfDay), use **transient subscriptions** set up once:

```ts
useEffect(() => useSystemStore.subscribe(
  s => s.qualityTier,
  tier => applyTierToMaterials(tier, matRef),   // imperative, no setState
), []);
```

Rule of thumb: **store-as-prop is forbidden inside Canvas**; pass refs and imperative setters. `useMouseParallax` / `useScrollProgress` write to a shared ref object, not React state. This keeps the R3F tree static while uniforms animate.

### 6.3 Selector Discipline (DOM side)

DOM/UI components subscribe with **narrow selectors + `shallow`** so a `timeOfDay` change never re-renders the StatusBar's audio toggle:

```ts
const tier = useSystemStore(s => s.qualityTier);          // primitive — fine
const { open, copilot } = useUIStore(
  s => ({ open: s.commandPaletteOpen, copilot: s.copilotOpen }), shallow);
```

Never `useStore()` with no selector. `useWorldStore.visited` (a Set) is read via a derived selector returning a boolean (`s => s.visited.has(key)`) to avoid identity churn. Actions are pulled once (stable identities) outside render-critical paths.

### 6.4 Routing / Scroll Sync

`WorldRouter` is the single writer that reconciles **URL ↔ store ↔ scroll**:

- **Routed mode:** React Router param `:world` → on change calls `setActiveWorld`; `SceneDirector` subscribes (transient) and triggers `TransitionController`.
- **Scroll mode:** Lenis emits progress → `useScrollProgress` writes to a **ref + throttled** `setActiveWorld` only when crossing a world boundary (hysteresis to prevent thrash). Scroll velocity is read in `useFrame` to drive chromatic-aberration accent — never stored in React.
- Guard against loops: the router checks `getState().activeWorld` before pushing a new URL, so programmatic transitions don't re-fire navigation.

### 6.5 Persistence (Session Resume)

`persist` middleware (sessionStorage, **partialized**) saves only resumable deep state: `activeWorld`, `mode`, `qualityTier` (if manual), `audioOn`, `recruiterMode`, `visited`, `quest`. Volatile fields (`bootStatus`, `load`, `cursorState`, `toasts`, refs) are **excluded**. A `version` + `migrate` fn handles schema drift. On boot, `QualityGovernor` may override a stale persisted tier after its live probe. `Set` is serialized via a custom `storage` replacer/reviver.

### 6.6 Where Content Lives

All portfolio content is **static typed imports from `src/data/*`** — the single source of truth, never fetched at runtime:

```
src/data/
  worlds.ts        // WorldKey → meta, route, morphTarget, lighting preset
  skills.ts        // self-assessed, flagged { source: 'self' }
  experience.ts  timeline.ts  certs.ts  research.ts
  recruiterSnapshot.ts   // feeds useRecruiterStore + ATS/print
  index.ts         // typed barrel; all `as const`
```

Mock vs. real is encoded in the type (`{ mock: true }`) so the UI can label it truthfully. Stores hold **runtime state only**; they reference content by key, never copy it. This keeps bundles tree-shakeable, enables ATS/print to read straight from `src/data`, and guarantees zero network dependency for the recruiter-safe path.

## 7. Design System Engineering

### Color Tokens

Authored as CSS variables on `:root` in `src/styles/tokens.css`; Tailwind reads them via `var()` so JS and CSS share one source of truth.

```css
:root{
  --void:#05070D; --panel:#0B1020;
  --glass:rgba(16,24,44,.55); --stroke:rgba(120,170,255,.18);
  --primary:#2D9CFF; --cyan:#00E5FF; --gold:#FFC857;
  --success:#37E0A8; --danger:#FF5C73;
  --text:#EAF2FF; --text-dim:#9DB2D6;
}
```

`tailwind.config.ts` → `theme.extend.colors`:

| Token | Tailwind key | Value |
|---|---|---|
| Background base | `void` | `var(--void)` |
| Surface | `panel` | `var(--panel)` |
| Glass fill | `glass` | `var(--glass)` |
| Border | `stroke` | `var(--stroke)` |
| Action | `primary` | `var(--primary)` |
| Glow accent | `cyan` | `var(--cyan)` |
| Achievement | `gold` | `var(--gold)` |
| Positive | `success` | `var(--success)` |
| Error | `danger` | `var(--danger)` |
| Text / dim | `text` / `text-dim` | `var(--text)` / `var(--text-dim)` |

`timeOfDay` (from `useSystemStore`) swaps a `--ambient` tint variable only; core tokens never mutate.

### Typography System

| Role | Font | Tailwind | Size / Line | Weight | Tracking |
|---|---|---|---|---|---|
| Hero display | Orbitron | `font-display` | clamp 40–72px / 1.05 | 700 | -1% |
| Section title | Sora | `font-display` | 28–40px / 1.15 | 600 | normal |
| Body / UI | Inter | `font-ui` | 14–16px / 1.5 | 400–500 | normal |
| Label / caption | Sora | `font-ui` | 12–13px / 1.3 | 500 | +4% |
| Data / metrics / code | JetBrains Mono | `font-mono` | 12–14px / 1.4 | 400 | tabular-nums |

**Loading:** self-host via `@fontsource` (no FOIT from Google CDN), preload only Orbitron-700 + Inter-400 (above-fold) with `<link rel="preload" as="font" crossorigin>`. `font-display: swap` on all faces. Mono and Sora-600 load non-blocking. WebGL `troika-three-text` uses its own Orbitron/JetBrains atlas, decoupled from DOM fonts.

### Spacing, Radius, Blur

| Scale | Values |
|---|---|
| Spacing (px) | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 |
| Radius (px) | `sm` 8 · `md` 16 · `lg` 24 |
| Glass blur (px) | `sm` 18 · `md` 22 · `lg` 28 |

All map into `theme.extend.spacing`, `borderRadius`, and a `backdropBlur` extend so usage is `p-6 rounded-md backdrop-blur-md`.

### Glassmorphism Rules

The single canonical recipe (one `.glass` utility + tier variants):

```
background:   var(--glass)              /* rgba(16,24,44,.55) */
backdrop:     blur(18–28px) saturate(120%)
border:       1px solid var(--stroke)
inner glow:   inset 0 1px 0 rgba(255,255,255,.06)
elevation:    0 8px 32px rgba(0,0,0,.45)
radius:       16 (md) default
```

**Use** for: floating HUD panels, StatusBar, command palette, recruiter cards, modals over 3D. **Do NOT use** for: full-bleed backgrounds, dense data tables (legibility), nested glass-on-glass (max ONE layer), or Tier 2 where `backdrop-filter` is GPU-costly — Tier 2 swaps to `--panel` solid at 92% opacity (`.glass-lite`). Hover lifts elevation one step + raises border to `.28` alpha; never animates blur radius (repaint cost).

### Animation Rules

Canonical easings (`src/systems/motion/easings.ts`), shared by GSAP, Framer Motion, and CameraRig:

| Name | Curve | Use |
|---|---|---|
| `standard` | `cubic-bezier(.4,0,.2,1)` | UI in/out |
| `decel` | `cubic-bezier(0,0,.2,1)` | enters |
| `accel` | `cubic-bezier(.4,0,1,1)` | exits |
| `expo` | `expo.out` (GSAP) | camera moves, world transitions |
| `spring` | Framer `{stiffness 220, damping 26}` | layout/UI pop |

**Duration bands:** micro 120–180ms (hover/toggle) · UI 240–360ms (panels) · world transition 800–1200ms (camera + particle morph) · ambient ≥4s loop (sway, drift).

**Stagger:** list/grid children 40–60ms, capped at 8 visible then batch. **Reduced-motion contract** (`usePrefersReducedMotion` → also forces Tier 2 behaviors): durations collapse to ≤120ms or 0; no camera dolly/orbit/sway, no particle morph (instant target snap or static frame); transforms degrade to opacity-only; ambient loops paused; Lenis scroll → native. This is the same recruiter-safe path as Tier 2.

### Particle Rules

ONE `ParticleField` instanced GPU points system.

| Tier | Count |
|---|---|
| 0 Cinematic | up to 120k |
| 1 Balanced | 50–60k |
| 2 Lite | ≤12–15k (or CSS/2D fallback) |

**Palette:** primary `--primary` → `--cyan` gradient by velocity/depth; `--success` only on quest/ready states; `--gold` reserved (see lighting law). **Size:** 1.5–3px attenuated by distance; soft circular sprite. **Motion:** ambient curl-noise drift + mouse-parallax repulsion. **Morph principle:** never spawn/destroy across worlds — each world declares a named target buffer (`'globe' | 'neuralNet' | 'packetSwarm' | 'grid' | 'constellation' | 'reactor' | 'stream'`); `TransitionController` drives a single shader `uMorph` uniform 0→1 GPU-lerping between current and next position buffers. Count only changes on tier switch.

### Lighting Rules

`LightingDirector` owns per-world bloom intensity; `PostFX` bloom is tier-gated (Tier 2 ≈ off/minimal).

| Mood | Worlds | Bloom intensity |
|---|---|---|
| Calm / intro | boot, contact | 0.3–0.5 |
| Standard | hero, timeline, skills, experience | 0.6–0.9 |
| Charged / dramatic | ai, cyber, reactor, impact | 1.0–1.4 |
| Achievement flare | vault, certs, leadership reveals | momentary 1.2 spike |

**THE GOLD LAW:** `--gold #FFC857` is forbidden as ambient/structural color. It appears ONLY on genuine achievement — unlocked vault items, verified certs, awards, quest completion, the impact tribunal verdict — paired with a brief bloom spike, then settles. Gold in a frame must always mean "something was earned."

## 8. Performance Plan

The performance contract: **never let the page drop below the floor of its tier for more than ~1s**. The `QualityGovernor` owns this, sampling FPS, probing the GPU at boot, and moving worlds between tiers with hysteresis. All systems read tier from `useQualityTier()`.

### QualityGovernor Algorithm

**Boot probe** (runs once, before first world mounts): combines a static device probe with a 0.5s warm-up burn-in to seed the starting tier so we never open in the wrong tier and visibly degrade.

```ts
interface DeviceProbe {
  gpuTier: 0|1|2|3;        // via WebGLRenderer UNMASKED_RENDERER + denylist
  deviceMemoryGB: number;  // navigator.deviceMemory ?? 4
  cores: number;           // navigator.hardwareConcurrency ?? 4
  isMobile: boolean;       // UA + pointer:coarse + maxTouchPoints
  prefersReducedMotion: boolean;
  maxTextureSize: number;  // gl.getParameter(MAX_TEXTURE_SIZE)
}

function seedTier(p: DeviceProbe): Tier {
  if (p.prefersReducedMotion || p.isMobile || p.deviceMemoryGB <= 3) return 2; // LITE
  if (p.gpuTier >= 3 && p.cores >= 8 && p.deviceMemoryGB >= 8)       return 0; // CINEMATIC
  return 1; // BALANCED
}
```

**Runtime sampler** — rolling window + hysteresis:

```ts
const WINDOW = 90;          // frames (~1.5s @60)
const UP = { 0:55, 1:45 };  // need avg >= to promote into tier-1..0
const DOWN = { 0:48, 1:38 };// drop below to demote (gap = hysteresis)
const COOLDOWN_MS = 2500;   // min time between any tier change
const PROMOTE_STREAK = 3;   // consecutive qualifying windows to promote

let buf: number[] = [], lastChange = 0, upStreak = 0;

function onFrame(dt: number, now: number) {
  buf.push(1000 / dt);
  if (buf.length < WINDOW) return;
  const avg = buf.reduce((a,b)=>a+b)/buf.length;
  buf = [];
  if (manualOverride) return;                    // StatusBar lock wins
  if (now - lastChange < COOLDOWN_MS) return;

  if (tier > 0 && avg < DOWN[tier-1]) {          // DEMOTE: instant (1 window)
    setTier(tier+1); lastChange = now; upStreak = 0;
  } else if (tier < 2 && avg >= UP[tier]) {      // PROMOTE: cautious
    if (++upStreak >= PROMOTE_STREAK) { setTier(tier-1); lastChange=now; upStreak=0; }
  } else upStreak = 0;
}
```

Asymmetry is deliberate: **demote fast** (one bad window) to protect the floor, **promote slow** (3 windows + cooldown) to avoid flapping. The DOWN/UP gap (e.g. promote at 55, demote at 48) is the hysteresis band. Manual override from `StatusBar` sets `manualOverride=true` and freezes the tier; transitions pause sampling for 800ms (transition spikes shouldn't trigger demotion).

### LOD System

| Asset | Tier 0 CINEMATIC | Tier 1 BALANCED | Tier 2 LITE |
|---|---|---|---|
| Particles | up to 120k | 50–60k | ≤12–15k or CSS/2D |
| GLTF geometry | full mesh | drei `<Detailed>` mid-LOD | low-poly / billboard impostor |
| Textures | ktx2 2K | ktx2 1K | ktx2 512 / CSS gradient |
| Shadow maps | 2048 dynamic | 1024 baked/soft | none (baked into texture) |
| Postprocessing | full chain | bloom only | vignette only |

Particle LOD is **free**: one buffer of 120k, draw range clamped per tier (`geometry.setDrawRange(0, count)`) — no realloc on tier change. GLTF LOD uses drei `<Detailed distances={[...]}>` with pre-decimated meshes from `AssetManager`.

### Dynamic Quality Scaling

`QualityGovernor` drives flags consumed by `PostFX`, `ParticleField`, `LightingDirector`:

| Feature | T0 | T1 | T2 |
|---|---|---|---|
| Bloom | ✓ | ✓ | ✗ |
| DOF | ✓ | light/off | ✗ |
| ChromaticAberration | ✓ (scroll-vel) | ✗ | ✗ |
| Vignette / Noise | ✓ / ✓ | ✓ / ✗ | ✓ / ✗ |
| Dynamic shadows | ✓ | baked soft | static |
| Transmission/refraction | ✓ | ✗ (opaque glass) | ✗ (CSS glass) |
| DPR cap | min(dpr,2) | 1.5 | 1 |

Effects mount/unmount conditionally in the `EffectComposer` tree so disabled passes cost zero. Transmission swaps to `MeshPhysicalMaterial` without transmission (T1) or a CSS `backdrop-filter` glass panel (T2).

### Asset Streaming & Lazy Loading

- Each world is `React.lazy(() => import('./worlds/<World>'))`, route-code-split via `WorldRouter` — initial bundle ships only boot + hero.
- `AssetManager` exposes `loadWorld(key)` (draco GLTF + ktx2) and `useGLTF.preload(nextWorldUrl)` triggered on world-enter for the *next* likely world (scroll order or hovered nav).
- **Dispose on exit**: `SceneDirector` unmount calls `disposeWorld(key)` → traverse, `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, clear `useGLTF` cache entry. Prevents GPU memory creep across 15 worlds.
- `<Suspense>` boundary per world shows a tier-appropriate loader; `useWorldLoad` exposes progress.

### GPU Optimization

- **Instancing**: ParticleField = one `InstancedMesh`/`Points`; repeated props (vault relics, grid nodes) via `InstancedMesh`.
- **Geometry merging**: static world scenery merged with `BufferGeometryUtils.mergeGeometries` to collapse draw calls.
- **On-demand frameloop**: `frameloop="demand"` for near-static worlds (Vault, Certs, Identity); `invalidate()` on camera/pointer/animation. Continuous loop only for particle-heavy worlds.
- **ktx2 + draco**: all textures GPU-compressed (Basis ETC1S/UASTC), meshes draco-decoded → smaller VRAM + faster upload.
- **Shader cost**: ParticleField morph is a single GPU lerp between target buffers in one vertex shader uniform `uMorph`; no CPU position writes.
- **Overdraw/transparency**: minimize stacked transparent particles; additive blending with `depthWrite:false`; sort-key grouping; opaque-first render. Bloom carries the "glow" so we avoid huge transparent quads.
- **Drawcall reduction**: target ≤150 calls/world T0; merge + instance + atlas textures.

### Memory Budget

| Pool | Budget |
|---|---|
| Total GPU (active world) | ≤512 MB T0 / ≤256 MB T1 / ≤128 MB T2 |
| Textures (resident) | ≤180 MB T0 |
| Geometry/buffers | ≤90 MB |
| Particle buffers (120k×~32B×targets) | ≤40 MB |
| JS heap | ≤350 MB |

Only one world resident at a time (dispose-on-exit). Next-world preload is the sole transient overlap; budget allows ~1.5× during the ~800ms transition.

### Consolidated Per-World Budget Table

| World | Draw calls | Particle budget | Texture MB | Target tier/FPS |
|---|---|---|---|---|
| boot — Cold Ignition | ≤40 | 8k–20k | ≤25 | all / 60 |
| hero — Ascension Grid | ≤120 | 60k–120k (grid) | ≤90 | 0 / 60 |
| ai — Awakening Chamber | ≤90 | 40k–90k (neuralNet) | ≤80 | 0–1 / 55 |
| timeline — Starline | ≤80 | 30k–60k (constellation) | ≤60 | 1 / 55 |
| identity — Credential Vault | ≤60 | 10k–20k | ≤50 | 1 / 60 (demand) |
| skills — Reactor Forge | ≤110 | 50k–100k (reactor) | ≤85 | 0–1 / 55 |
| fmcg — Sovereign Grid | ≤120 | 40k–70k (grid) | ≤80 | 1 / 55 |
| cyber — Sentinel Grid | ≤100 | 40k–80k (packetSwarm) | ≤75 | 0–1 / 55 |
| research — Oracle Engine | ≤90 | 30k–60k (stream) | ≤70 | 1 / 55 |
| leadership — Hall of Command | ≤80 | 15k–30k | ≤65 | 1 / 60 |
| vault — Reliquary | ≤70 | 10k–20k | ≤80 | 1 / 60 (demand) |
| experience — Hangar of Missions | ≤100 | 20k–40k | ≤75 | 1 / 55 |
| certs — Verification Vault | ≤60 | 8k–15k | ≤55 | 1 / 60 (demand) |
| impact — Tribunal of Light | ≤70 | 30k–50k (globe) | ≤70 | 1 / 55 |
| contact — Uplink Array | ≤70 | 20k–40k (packetSwarm) | ≤60 | 1 / 60 |

### Measurement Tooling

- **r3f-perf** (dev only, `devMode` flag): draw calls, GPU memory, triangle count, FPS — overlaid per world.
- **stats.js / drei `<Stats>`**: lightweight FPS/ms during QA.
- **QualityGovernor debug**: live tier + rolling avg surfaced in `StatusBar` (dev).
- **Lighthouse CI**: per-route perf/accessibility budget gate in CI (recruiter `fastPath` route must score ≥90).
- **Web Vitals** (`web-vitals`): LCP/INP/CLS reported to console (dev) and an opt-in beacon; INP is the key metric for the heavy interactive scenes.
- **Manual FPS log**: `QualityGovernor` can dump a per-world FPS histogram to console for tuning the budget table above.

## 9. World Architecture — All 15 Worlds

Each world below is an engineering spec (not a creative description): its components, assets, the canonical shared systems it uses, the stores it touches, its data sources, and a per-tier performance budget. Every world is a lazy-loaded scene mounted by SceneDirector into the single shared Canvas, drawing on ParticleField morph targets, CameraController moves, and LightingDirector presets.

I have the full creative spec for Cold Ignition. Now I'll write the engineering spec.

### 1. Cold Ignition — Boot / OS Startup

- **Purpose** — The once-per-session ignition: a procedural arc-reactor cracks to life, runs diagnostics, and authenticates the visitor ("ACCESS GRANTED: RECRUITER") before handing off to Hero.

- **Components**
  - `BootWorld` [R3F in-canvas] — world root; mounts reactor + particle hooks, owns the GSAP master timeline, fires `onComplete`.
  - `ReactorCore` [R3F in-canvas] — 3 instanced torus/ring meshes + central fresnel icosahedron; emissive intensity is the ignition driver.
  - `DiagnosticRings` [R3F in-canvas] — concentric holographic HUD circles (line geometry / SVG-on-plane), scanline shader, slow ease-rotate.
  - `WireframeShell` [R3F in-canvas] — low-poly `IcosahedronGeometry` (detail 2) background-scale shell.
  - `IgnitionBurst` [R3F in-canvas] — ~1,200-pt one-shot additive burst, time-gated to the 0.6s ignition beat.
  - `BootHUD` [DOM overlay] — `TerminalText` typewriter diagnostics + gold "AUTHENTICATING…/ACCESS GRANTED" stamp (Framer Motion).
  - `SkipButton` [DOM overlay] — persistent skip → Hero; fades in at second 1 (FR-0.2).

- **Assets** — Zero imported GLB (all procedural primitives). Textures: 1 soft circular dust sprite + 1 reactor noise/gradient map (PNG, ktx2 optional, ~2 small). Fonts: JetBrains Mono (telemetry), Orbitron (stamp) — already global. Data: 1 small JSON. **Weight: <150 KB, negligible.**

- **Shared Systems Used**
  - `ParticleField` — morph target `'reactor'`; ~6k inward dust motes at Cinematic.
  - `CameraController` — `pushIn()` (z12→z6, 2.2s `power3.out`) + `rackFocus()` blurred→sharp; `sway()` idle; exit `pushIn()`/dolly z-punch (FOV→60) feeding `TransitionController` "Reactor Bloom" to Hero.
  - `LightingDirector` — `boot` preset: single ramping reactor point light (0→8) + cool blue rim; owns bloom intensity ramp.
  - `PostFX` — Bloom (threshold .85, strength 1.4, radius .6) + GodRays (scene-gated) + ChromaticAberration pulse at ignition + Vignette.
  - `AssetManager` — lazy-load boot module, `useGLTF.preload` Hero, full dispose-on-exit.

- **State** — Reads/writes `useSystemStore` (bootStatus, recruiterMode, reducedMotion, qualityTier, timeOfDay for greeting). Writes `useWorldStore` (boot loadState/ready, visited). Reads `useRecruiterStore.fastPath`. Writes `useUIStore.cursorState`.

- **Data Sources** — `src/data/boot.ts` (diagnostic line list, auth-stamp copy, timings), `src/data/identity.ts` (name for greeting).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |---|---|---|---|---|
  | Cinematic | ≤14 | ~7.2k (6k dust + 1.2k burst) | ≤2 | 60 |
  | Balanced | ≤10 | ~3.5k | ≤1 | 45–55 |
  | Lite | 0 (CSS) | 0 | <0.5 | 30+ |

- **Build Complexity** — **Medium.** Mostly procedural geometry + GSAP timeline orchestration; risk is in shader tuning and clean dispose/handoff, not asset pipeline.

- **Key Risks & Mitigation**
  - Bloom fill-rate + particle overdraw → cap DPR at 2, downsample bloom pass on mobile, single instanced system.
  - Memory leak into Hero → enforce `dispose()` of all geometries/materials/render targets on exit; boot runs once/session (FR-0.3), guard via `bootStatus`.

- **Lite / Mobile Fallback** — Tier 2 swaps to a static CSS radial-gradient reactor glow; diagnostics typewriter (or render instant under reduced-motion) and "ACCESS GRANTED: RECRUITER" card fades in; Skip stays primary.

---

I have the full creative intent for the Hero Landing world. Now I'll write the engineering spec.

### 2. Ascension Grid — Hero Landing

- **Purpose** — The first interactive world: materialize above a living data-metropolis, render the name/role/CTAs, and hand off to any world via the command center.

- **Components**
  - `HeroWorld.tsx` — [R3F in-canvas] world root; mounts scene graph, wires GSAP master timeline, registers morph target on enter.
  - `DataCity.tsx` — [R3F in-canvas] single `InstancedMesh` of ~140 hex data-towers (4 LOD heights) on a slow-rotating platter with scanline emissive shader.
  - `ArcReactorCore.tsx` — [R3F in-canvas] icosahedron + breathing inner ring (vertex-noise displacement, fresnel rim) driving the WOW pulse.
  - `NeuralSky.tsx` — [R3F in-canvas] domed `Points` node cloud + `LineSegments` synapse graph with traveling-sine opacity.
  - `LightShafts.tsx` — [R3F in-canvas] 5 additive god-ray cone meshes (Tier 0/1 only).
  - `GroundGrid.tsx` — [R3F in-canvas] shader-drawn grid plane (no geometry).
  - `HeroHUD.tsx` — [DOM overlay] name decrypt-reveal + role-rotator + parallax mini-charts (Framer).
  - `HeroCTAs.tsx` — [DOM overlay] `NeonButton` "Launch Command Center" + "Download Resume".

- **Assets** — No heavy `.glb` (towers/core procedural). 1 ktx2 scanline/seam texture, 1 ktx2 soft-point particle sprite, 1 AVIF Lite hero still. Fonts: Orbitron, Sora, JetBrains Mono (subset). Data: 1 JSON. Total ≈ 600 KB–1.1 MB (texture-dominated).

- **Shared Systems Used**
  - **ParticleField** — morph target `'grid'` (drifting upward on curl noise); 6k desktop default.
  - **CameraController** — `dolly()` entry (z-200→-12, FOV 35→48, 2.4s `power4.out`), `sway()`+breathing dolly idle, `rackFocus()` on CTA hover, `pushIn()` descent-into-city on exit via TransitionController.
  - **LightingDirector** — preset `hero` (cool upper-left key + cyan rim); bloom intensity 0.9, threshold 0.85.
  - **PostFX** — Bloom (emissive-selective, half-res) + light DOF on name plane + vignette + faint CA on scroll/exit velocity.
  - **AssetManager** — lazy-load hero textures post-LCP; `useGLTF.preload` next world (`ai`); dispose on exit.

- **State**
  - Reads: `useSystemStore` (qualityTier, liteMode, reducedMotion, recruiterMode), `useUIStore` (cursorState, commandPaletteOpen).
  - Writes: `useSystemStore.activeWorld='hero'`; `useWorldStore` (loadState/ready, visited.add('hero')); `useUIStore.commandPaletteOpen` (CTA), `cursorState`.

- **Data Sources** — `src/data/profile.ts` (name, roles array, taglines), `src/data/heroCharts.ts` (mock mini-chart series, labeled mock), `src/data/cta.ts`.

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |------|-----------|-----------------|-----------|-----------|
  | Cinematic | ≤ 18 | 6k–8k | ≤ 4 | 60 |
  | Balanced | ≤ 12 | 3k–4k | ≤ 2 | 45–55 |
  | Lite | ≤ 3 (2D) | 0 / CSS | ≤ 0.8 | 30+ |

- **Build Complexity** — **High** — multi-layer parallax stage, custom shaders, GSAP-synced WOW pulse, and the first transition handoff all converge here.

- **Key Risks & Mitigation**
  - Particle/bloom overdraw → half-res bloom buffer + fps-watchdog DPR/particle auto-scale; god rays Tier-gated off.
  - First-impression LCP cost → procedural geometry + lazy textures post-LCP; DOM name/CTA render before canvas warm.

- **Lite / Mobile Fallback** — AVIF ignition still + static city silhouette, CSS-animated synapses and radial-glow shafts, retained name decrypt + fade role-rotator, no particles.

---

I have the creative intent. Now I'll write the engineering spec.

### 3. Awakening Chamber — AI Introduction

- **Purpose** — The AI "opens its eyes," self-narrates Matru's identity, and writes "MATRU OS" in light while four summary cards map directly to the résumé.

- **Components**
  - `AiWorld.tsx` — world root; subscribes to lifecycle, wires the GSAP master timeline. [R3F in-canvas]
  - `AiCore.tsx` — layered icosphere (displaced inner + wireframe shell + fresnel halo); pulses on narration peaks. [R3F in-canvas]
  - `HexDais.tsx` — beveled hexagon with emissive seam channels under the core. [R3F in-canvas]
  - `GlyphRings.tsx` — 3 instanced tori with scrolling mono-glyph texture. [R3F in-canvas]
  - `HoloCard.tsx` (x4) — extruded glass plane, scanline + RGB-fringe shader; lift/brighten on hover. [R3F in-canvas]
  - `GodRays.tsx` — volumetric shafts from the core through dust (Tier 0/1 only). [R3F in-canvas]
  - `NameConstellation.tsx` — drives the supernova→"MATRU OS" glyph-point morph. [R3F in-canvas]
  - `NarrationHud.tsx` — typewriter captions, Skip button, card KPIs. [DOM overlay]

- **Assets** — `ai_core.glb` (~80 KB, draco), `hex_dais.glb` (~40 KB, draco); ktx2 textures: glyph-scroll atlas, scanline, core-noise/normal (~3 files, ~0.6 MB total Tier 0). Fonts: JetBrains Mono SDF (troika atlas, shared). Data: 1 JSON. Total ≈ 0.7 MB. Weight class: **Light**.

- **Shared Systems Used** — **ParticleField** morph target `'neuralNet'` (idle swirl) → `'constellation'` (WOW name reveal), curl-noise drift. **CameraController**: `dolly()` entry 14u→7u (expo.out), `sway()` idle orbit ±0.4u, `pushIn()` + `focus(card)` on card speak, `rackFocus()` for DOF. **LightingDirector** preset `awakening` (single cyan in-core point + cold rim). **PostFX** accents: selective Bloom (threshold .85, str 1.4) on emissive layer, mild DOF on core, vignette; chromatic-aberration burst on supernova. **AssetManager**: lazy-load on route entry, `dispose()` on exit, `useGLTF.preload` next world (timeline).

- **State** — Reads `useSystemStore` (qualityTier, liteMode, reducedMotion, audioOn). Writes `useWorldStore` (ai.loadState/ready, visited add, quest: nameRevealed). Reads `useUIStore.cursorState`; toggles `audioBus` blips if audioOn.

- **Data Sources** — `src/data/ai.ts` (narration lines, 4 card KPIs, supernova trigger phrase), `src/data/summary.ts` (project/cert/role/paper counts).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |------|-----------|-----------------|-----------|-----------|
  | Cinematic | ~22 | 12k | ~0.7 | 60 |
  | Balanced | ~16 | 8k | ~0.5 | 45-55 |
  | Lite | ~4 (DOM) | 3k or 0 | ~0.2 | 30+ |

- **Build Complexity** — **High** — custom displacement/fresnel shaders + GSAP-narration sync + particle morph choreography.

- **Key Risks & Mitigation**
  - Audio-sync drift / autoplay block → drive timeline by narration text events, not audio; captions are source of truth, audio optional.
  - Bloom + fresnel overdraw → half-res selective bloom, single GPU Points, DPR cap 2, auto-scale 12k→3k.

- **Lite / Mobile Fallback** — Static high-res core render with CSS-glow pulse, instant captioned narration (no audio), four cards fade+rise via Framer (200ms stagger), Skip pinned top-right.

---

I have everything I need. The creative bible specifies five real stations plus a gold Future node, a CatmullRom spline, and the `'stream'` ParticleField morph fits the data-stream connector intent. Here is the engineering spec.

### 4. Starline — Journey Timeline

- **Purpose** — Scroll-driven cinematic flight along a luminous spline that docks at five dated career milestones plus a gold "Future" node, reading Matru's trajectory in ~10 seconds.

- **Components**
  - `StarlineWorld` [R3F in-canvas] — world root; mounts assets, subscribes to scroll t, owns enter/exit lifecycle via SceneDirector.
  - `StarlineSpline` [R3F in-canvas] — CatmullRom curve singleton; source of truth for camera path and station positions (memoized).
  - `PathTube` [R3F in-canvas] — TubeGeometry (~600 seg) with scrolling-UV "data pulse" emissive shader chasing the active node.
  - `StationField` [R3F in-canvas] — single InstancedMesh of 5 icosahedron cores; rim-shader, active core swaps cyan→gold.
  - `OrbitingShards` [R3F in-canvas] — one InstancedMesh (~360 octahedra) orbiting cores; additive emissive.
  - `FutureNode` [R3F in-canvas] — dashed gold wireframe torus-knot that self-assembles at the climax.
  - `Starfield` [R3F in-canvas] — 8k-point parallax background (uses ParticleField `'stream'` target; see below).
  - `DustStreaks` [R3F in-canvas] — 1.2k instanced motes + 40 plane sprites for speed parallax.
  - `TelemetryCard` [DOM overlay] — Framer/GSAP glassmorphic panel per docked station (year, role, tools).
  - `StationLabels` [R3F in-canvas] — troika-three-text labels billboarded to camera.
  - `StarlineHUD` [DOM overlay] — progress rail + node markers + Skip CTA.

- **Assets** — No `.glb` (all procedural geometry). Textures: 1 soft-circle sprite + 1 nebula fbm noise tile (ktx2, ~0.3MB). Fonts: JetBrains Mono + Sora via troika atlas (shared). Data: `timeline.ts`. Weight class: **Light (<1 MB)**, no draco/GLTF.

- **Shared Systems Used**
  - **ParticleField** — morph target `'stream'` for starfield/flow-field; tube data-pulse reads same shader uniform `uMorphT`.
  - **CameraController** — `dolly()` (warp entry), `sway()` (idle ±2° sine spline-crawl), `pushIn()` + `rackFocus(target)` on dock (FOV→42, aperture .025); exit `dolly()` FOV→80 warp.
  - **LightingDirector** — `starline` preset: cyan point light per active station, cool blue rim, emissive-driven; bloom intensity 1.1 / threshold .55.
  - **PostFX** — Bloom on; DOF rack-focus (Tier 0/1); chromatic aberration accent on scroll-velocity (TransitionController).
  - **AssetManager** — lazy-load nebula/sprite ktx2 on route entry; preload next world (`identity`); dispose tube/instances/RT on exit.
  - **TransitionController** — exit = *Lateral Strafe* to Identity.

- **State** — Reads `useSystemStore` (qualityTier, mode, reducedMotion). Writes `useWorldStore` (loadState/ready, visited add `timeline`, quest progress = stations docked). Reads `useScrollProgress` (Lenis t).

- **Data Sources** — `src/data/timeline.ts` (milestones array: year, title, org, tools, blurb, isFuture).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |---|---|---|---|---|
  | Cinematic | ~30 | 8k stars + 1.2k dust | ~1.0 | 60 |
  | Balanced | ~22 | ~5k stars, no DOF | ~0.6 | 45-55 |
  | Lite | ~6 (DOM) | 0 (CSS) | <0.2 | 30+ |

- **Build Complexity** — **Medium** — geometry is procedural and instanced, but spline↔scroll↔camera↔DOF sync and the data-pulse shader need careful sequencing.

- **Key Risks & Mitigation**
  - Scroll/camera desync or pin jank → single Lenis t source mapped to spline parameter; ScrollTrigger pins section, no competing rAF camera writes.
  - DOF + bloom + transparency overdraw → gate DOF/god-rays off in Tier 1+, LOD-swap distant stations to billboard sprites, half-res bloom.

- **Lite / Mobile Fallback** — Vertical glassmorphic node-card timeline on a static cyan gradient with a CSS stroke-dashoffset draw-on connector; gold Future node kept distinct; tap-to-expand, zero shaders.

---

I have the full creative and functional context. Here is the engineering spec.

### 5. Credential Vault — Digital Identity

- **Purpose** — A weightless data-chamber of hovering glass ID cards (contact + credentials) that tilt to the cursor and copy-on-click, ending in a one-sweep "VERIFICATION SCAN".

- **Components**
  - `IdentityWorld.tsx` — world root; orchestrates enter/exit lifecycle, mounts canvas + DOM layers. [R3F in-canvas]
  - `CardField.tsx` — single `InstancedMesh` arc of credential cards driven by per-instance attributes. [R3F in-canvas]
  - `GlassCard.tsx` — logical card model (transmission/fresnel material params per instance, scanline uniform). [R3F in-canvas]
  - `BadgeHero.tsx` — center ID badge: photo plane, troika name/role text, QR plane. [R3F in-canvas]
  - `VerificationBeam.tsx` — shader-plane cyan sweep + per-card "VERIFIED" stamp trigger. [R3F in-canvas]
  - `ScanDust.tsx` — small GPU points burst on hover/copy (feeds off ParticleField, not its own system). [R3F in-canvas]
  - `IdentityOverlay.tsx` — DOM copy buttons, toasts, "COPIED" labels, ATS-readable text mirror. [DOM overlay]
  - `IdentityHUDFrame.tsx` — reused `HUDFrame` corner brackets + world title. [DOM overlay]

- **Assets** — No heavy `.glb` (cards are procedural rounded-box geometry). Textures: headshot (ktx2, ~0.3MB), QR (generated or ktx2 0.05MB), 1 normal/roughness map for glass (ktx2 0.4MB). Fonts: Orbitron/JetBrains Mono atlases via troika (shared, reused). Data: 1 JSON. Total ~0.8–1.0MB (Light).

- **Shared Systems Used**
  - ParticleField → morph target **`constellation`** as ambient void field; emits `ScanDust` puffs.
  - CameraController → `pushIn()` entry (9m→4.2m, FOV 35), `sway()` idle breathing dolly + `useMouseParallax` yaw/pitch (max 6°), `focus(card)`/`rackFocus()` on hover and copy-snap.
  - LightingDirector → preset **`identity`**: cool top-left key 6500K, cyan rim, reactor soft fill.
  - PostFX → selective **Bloom** on emissive frames/text only; subtle Vignette; DOF light (Tier 0 only); ChromaticAberration accent fires on VerificationBeam sweep.
  - AssetManager → lazy-load headshot/QR/glass maps on route entry; `dispose()` all on exit; `useGLTF.preload` next world (Reactor Forge).

- **State**
  - Reads: `useSystemStore` (qualityTier, liteMode, reducedMotion, recruiterMode), `useWorldStore.ready`.
  - Writes: `useWorldStore` (loadState, visited.add('identity'), quest: scanCompleted), `useUIStore` (toasts, cursorState on hover/copy).

- **Data Sources** — `src/data/identity.ts` (location, education, CGPA 7.95, emails, GitHub, phone, QR target URL, headshot path).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |---|---|---|---|---|
  | Cinematic | ~12 | up to 30k constellation | ~1.0 | 60 |
  | Balanced | ~8 | ~15k, transmission off | ~0.7 | 45–55 |
  | Lite | DOM/CSS | <=3k or none | ~0.4 | 30+ |

- **Build Complexity** — **Medium** — instancing + per-instance shader tilt/scanline and clipboard wiring are moderate; transmission is the only hard part and is tier-gated off.

- **Key Risks & Mitigation**
  - Glass transmission + bloom = fill-rate spike → single shared transmission render target, selective bloom layer, transmission disabled below Tier 0.
  - Mouse-parallax over-updating → throttle to rAF, weight tilt by instance depth attribute, disable on touch.

- **Lite / Mobile Fallback** — Becomes a tap-friendly grid of real CSS glassmorphism tiles (backdrop-blur, gradient borders) with gyroscope tilt, instant copy buttons, and the same green confirm pulse — zero shaders, fully ATS/keyboard accessible.

---

I have the data file name (`skills.js`) and its schema. I have everything needed to write the spec.

### 6. Reactor Forge — Skills Matrix

- **Purpose** — A subterranean arc-reactor chamber where five orbital skill rings let recruiters read honest, self-assessed breadth/depth across Matru's real disciplines.

- **Components**
  - `ReactorForgeWorld` — world root; orchestrates enter/idle/select/exit phases. [R3F in-canvas]
  - `ReactorCore` — nested Icosahedron+Torus arc-reactor, emissive cyan, counter-rotating rings, LOD. [R3F in-canvas]
  - `OrbitalRing` (×5) — TubeGeometry track per category; carries hex instances; speed 0.02–0.06 rad/s. [R3F in-canvas]
  - `SkillHexField` — single `InstancedMesh` (~60 beveled RoundedBox hexes) with per-instance color/selection attr. [R3F in-canvas]
  - `SkillLabels` — troika-three-text billboards (instanced atlas) for hex names. [R3F in-canvas]
  - `RadarPlate` — holographic ShaderMaterial RingGeometry + dynamic LineLoop polygon (5–7 axes), draw-on. [R3F in-canvas]
  - `EnergyBars` — instanced thin boxes with emissive fill mask + mono count-up. [R3F in-canvas]
  - `ReactorWall` — fresnel-lit hex-panel normal backdrop with scanline sweep. [R3F in-canvas]
  - `SkillTooltip` — hover dossier (project context, "self-assessed" tag). [DOM overlay]
  - `CategoryTabs` / `SelfAssessedBadge` — category switch + integrity label. [DOM overlay]

- **Assets** — No `.glb` (all procedural geometry). 1 hex-panel normal map + 1 reactor-wall normal (ktx2, ~0.4MB); troika font atlas (JetBrains Mono/Orbitron, shared/cached); `skills.js` data. Total weight class: Light (<1MB, no draco models).

- **Shared Systems Used**
  - ParticleField → morph target `'reactor'`; ~8k motes orbiting core, accelerate inward on select.
  - CameraController → entry `orbit()`+`pushIn()` (55° from above-left, 1.8s power3.out); `focus(ring)` + `rackFocus()` on select; `sway()` idle 3°; exit `dolly()` back/up to 65°.
  - LightingDirector → `reactorForge` preset (cyan emissive key, two 6500K rim spots, fake god-ray cone, gold accent on active category).
  - TransitionController → outbound `Skills → FMCG` "Ascend to Mezzanine" (crane +4 + yaw, 1.7s).
  - PostFX → Bloom (threshold .85, intensity .9, half-res), mild DOF on active ring, vignette; CA accent only on select shockwave.
  - AssetManager → lazy-load on route focus; `useGLTF.preload` not needed (no models); preload FMCG next; dispose geometries/materials/textures on exit.

- **State**
  - useSystemStore (R): qualityTier, liteMode, reducedMotion, recruiterMode, activeWorld.
  - useWorldStore (R/W): `skills.loadState/ready`, visited Set add, quest progress (categories explored).
  - useUIStore (R/W): cursorState (magnetic on hex), tooltip/toast, commandPaletteOpen.
  - Local (non-store): selectedCategory, hoveredSkill.

- **Data Sources** — `src/data/skills.js` (`[{category, items:[{name, level 0-100 self-rated, note}]}]`), single source of truth.

- **Performance Budget**

| Tier | Draw calls | Particle budget | Texture MB | Target FPS |
|---|---|---|---|---|
| Cinematic | ~14 | 8k | ~0.8 | 60 |
| Balanced | ~10 | 4k | ~0.4 | 45–55 |
| Lite | ~2 (DOM/SVG) | 0 | 0 | 30+ |

- **Build Complexity** — Medium. Geometry is procedural and instanced (no asset pipeline), but the select-state choreography (ring recede + radar draw-on + shockwave + particle inrush) demands careful GSAP timeline sequencing.

- **Key Risks & Mitigation**
  - Particle overdraw + bloom cost from emissive core/hexes → single `InstancedMesh`, one GPU points system, half-res bloom, DPR cap 2, baked normal maps over geometry.
  - Radar polygon redraw on category switch can thrash buffers → mutate a single preallocated BufferGeometry attribute, animate via uniform, never recreate.

- **Lite / Mobile Fallback** — Becomes a static radar SVG plus animated CSS energy bars with category tabs, identical copy/tooltips and "self-assessed" labels — premium-dark, one CSS glow, zero shaders.

---

I have the full creative context for the Sovereign Grid (FMCG Command Center) from section 06 of the bible. I have everything needed to write the engineering spec.

### 7. Sovereign Grid — FMCG Command Center

- **Purpose** — A holographic CEO command center proving end-to-end FMCG analytics fluency: a data-globe orbited by live-mock KPI panels with a CEO→region→territory hierarchy reveal.

- **Components**
  - `FMCGWorld` [R3F in-canvas] — world root; mounts subsystems, registers enter/exit lifecycle with SceneDirector.
  - `DataGlobe` [R3F in-canvas] — low-poly icosphere + instanced extruded India-state shells; click-to-detonate hierarchy.
  - `RegionNodeField` [R3F in-canvas] — ~120 instanced billboard nodes that twinkle/flag regions.
  - `KPIPanelRig` [R3F in-canvas] — one `InstancedMesh` of ~40 glass panel frames; 2 foreground use MeshTransmissionMaterial, rest faked fresnel.
  - `KPIPanelContent` [R3F in-canvas] — `<Html>`/canvas-texture counters, gauges, sparklines per active panel (LOD-gated).
  - `DataStreamRibbons` [R3F in-canvas] — 24 CatmullRom tube ribbons globe→panel with flow-shader.
  - `HexFloor` [R3F in-canvas] — `ShaderMaterial` floor with periodic "data refresh" pulse.
  - `OrgHierarchyTree` [R3F in-canvas] — 3-tier holographic tree spawned by the WOW detonation.
  - `SalesmanLeaderboard` [R3F in-canvas] — vertical stacked-bar tower.
  - `FMCGHud` [DOM overlay] — HUD frame, "SIMULATION — MOCK DATA" label, region readout, panel dossier.
  - `FMCGLiteView` [DOM overlay] — Tier-2 flat dashboard fallback.

- **Assets** — `fmcg_globe.glb` (draco, low-poly + state shells, ~250KB), `kpi_panel.glb` (instanced frame, ~60KB). Textures ktx2: hex-floor normal/emissive, panel fresnel ramp, region billboard atlas (~1.2MB total). Fonts: JetBrains Mono (troika) for counters, Orbitron labels. Data: 1 JSON. ~5 files, Medium weight (~1.6MB).

- **Shared Systems Used** — ParticleField morph target `'globe'` (dome drift) + `'stream'` accent on detonate; CameraController `dolly()` entry (FOV32→settle), `orbit()`+`sway()` idle, `focus(panel)` + `rackFocus()` on region click (FOV40), `pushIn()` on WOW. LightingDirector preset `fmcg` (cool 6500K key, cyan rim halo, 3 god-ray cones, peak bloom 1.3). PostFX: Bloom(thr~0.6,str~0.9)+DOF on active panel+vignette+grain; chromatic-aberration accent via TransitionController on enter/exit. AssetManager: lazy-load on enter, `useGLTF.preload` cyber next, dispose-on-exit.

- **State** — Reads `useSystemStore` (qualityTier, liteMode, reducedMotion, recruiterMode, timeOfDay). Writes `useWorldStore` (fmcg loadState/ready, visited, quest: globeDetonated). Reads `useUIStore` (cursorState, toasts). `useRecruiterStore` for atsMode/snapshot.

- **Data Sources** — `src/data/fmcg.ts` (KPIs, regions, hierarchy, salesman board — all `mock:true`), `src/data/experience.ts` (Nexus Infotech link).

- **Performance Budget**

| Tier | Draw calls | Particle budget | Texture MB | Target FPS |
|------|-----------|-----------------|-----------|-----------|
| Cinematic | ~55 | 16k | 12 | 60 |
| Balanced | ~32 | 8k | 6 | 45-55 |
| Lite | ≤8 (DOM/SVG) | 0 | <1 | 30+ |

- **Build Complexity** — **High** — instancing + transmission + stream shaders + a choreographed multi-stage WOW detonation demand careful disposal and LOD.

- **Key Risks & Mitigation**
  - Glass transmission + bloom + particles overdraw → limit transmission to 2 foreground slabs (fake fresnel rest), half-res bloom, tier-gated particle counts, LOD globe.
  - WOW recomposition jank → pre-author single GSAP timeline, rAF-gate the 6s refresh pulse, reuse buffers.

- **Lite / Mobile Fallback** — Static globe poster + flat 2D KPI dashboard (CSS gauges, SVG sparklines, count-up only); India SVG map with tappable regions, gradient stream connectors — zero GPU.

---

I have the full creative intent for the cyber world. Now I'll write the engineering spec.

### 8. Blacksite / Sentinel Grid — Cyber Security Lab

- **Purpose** — A 3D network-graph attack/defense demo proving real cybersecurity literacy (IIT Jammu ARP-spoof detection) via an interactive Attack/Defense toggle culminating in a firewall-ignition WOW beat.

- **Components**
  - `CyberWorld.tsx` — world root; mounts via SceneDirector, wires lifecycle + store. [R3F in-canvas]
  - `NetworkGraph.tsx` — InstancedMesh icosahedron nodes + InstancedMesh beam-cylinder edges; 3D force-sim layout (precomputed, frozen). [R3F in-canvas]
  - `PacketFlow.tsx` — single BufferGeometry GPU point-sprites flowing along edge splines via shader uniform `uProgress`. [R3F in-canvas]
  - `RogueNode.tsx` — danger-tinted spoofed node; emissive pulse on detection. [R3F in-canvas]
  - `FirewallShield.tsx` — pooled subdivided icosphere, scanline-ripple shader; scale 0→1 elastic on ignite. [R3F in-canvas]
  - `NodeLabels.tsx` — sprite-atlas IP/MAC labels (troika fallback for hero node only). [R3F in-canvas]
  - `FogFloor.tsx` — volumetric fog plane shader. [R3F in-canvas]
  - `ThreatConsole.tsx` — typed `[ALERT] ARP spoof detected` terminal feed. [DOM overlay]
  - `AttackDefenseToggle.tsx` — mode switch + ARP-table panel + subnet-isolate control. [DOM overlay]
  - `useCyberSequence.ts` — GSAP master timeline (attack→detect→ignite→exhale).

- **Assets** — No heavy .glb (all procedural geometry). 1 sprite-atlas KTX2 for IP/MAC labels (~256KB); 1 packet point-sprite + 1 noise texture KTX2 (~128KB); JetBrains Mono (shared, already loaded). Data: 2 JSON. Total ~0.4MB, light weight class.

- **Shared Systems Used**
  - ParticleField: morph target `'packetSwarm'`; world owns its own `PacketFlow` for graph-bound packets, ParticleField provides ambient swarm.
  - CameraController: `dolly()` airlock entry → `focus(graphCentroid)`; idle `sway()` 4°/breathing DOF; on attack `pushIn()` to rogue node (FOV 50) + `rackFocus()` to spoofed packet.
  - LightingDirector: preset `cyber` (cool blue base, danger-red flash burst, gold shield rim).
  - PostFX: bloom on shield/packets; ChromaticAberration spike on detection screen-shake; Vignette always.
  - AssetManager: lazy-load KTX2 atlas on route enter; full `dispose()` of geometries/materials/textures on exit; preload next world.

- **State** — Reads `useSystemStore` (qualityTier, reducedMotion, liteMode). Writes `useWorldStore` (loadState/ready, quest: attackViewed/defenseViewed). Reads `useUIStore` (cursorState for magnetic hover). Local component state for toggle mode.

- **Data Sources** — `src/data/cyberGraph.ts` (nodes/edges/IPs/MACs, mock-labeled), `src/data/cyberNarrative.ts` (console lines, ARP-table rows, project copy).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |------|-----------|-----------------|-----------|-----------|
  | Cinematic | ~10 | 3k packets + swarm | ~0.4 | 60 |
  | Balanced | ~8 | ~1.5k packets | ~0.3 | 45-55 |
  | Lite | DOM/SVG | 0 | ~0.1 | 30+ |

- **Build Complexity** — High — choreographed multi-stage GSAP sequence + 3 custom shaders (packet flow, shield ripple, fog), but geometry is procedural and instanced so no asset pipeline.

- **Key Risks & Mitigation**
  - Packet overdraw / bloom cost on low-end → cap points per tier, additive blending with depthWrite off, gate bloom intensity via LightingDirector.
  - Force-sim jank if live → precompute layout once at build/load, freeze positions; only animate packets/shield.

- **Lite / Mobile Fallback** — Tier 2 swaps to a static pre-rendered graph image with CSS-animated 2D SVG attack path, looping typed console, single CSS-keyframe shield glow, and Attack/Defense as a tabbed glass panel.

---

I have the full creative context. Now I'll write the engineering spec.

### 9. Oracle Engine — Research Zone

- **Purpose** — Render Matru's published research (ICEVB 2025, astrology×AI predictive analytics) as a thinking neural brain wired to orbiting "zodiac planet" data-sources, converging into one published star.

- **Components**
  - `ResearchZoneWorld` [R3F in-canvas] — world root; mounts subtree, wires lifecycle to SceneDirector, owns local `useFrame` clock.
  - `OracleBrain` [R3F in-canvas] — central neural mesh (icosphere + animated synaptic arc lines) with displacement/pulse shader.
  - `SynapticArcs` [R3F in-canvas] — merged-line geometry connecting nodes→brain; emissive pulse uniform.
  - `ZodiacPlanets` [R3F in-canvas] — InstancedMesh of orbiting data-source planets (one per research theme); hover scale + arc brighten.
  - `ZodiacWheel` [R3F in-canvas] — instanced glyph ring (troika/sprite atlas) that snaps into the thesis constellation on focus.
  - `ThoughtDust` [R3F in-canvas] — local curl-noise points layered over ParticleField morph.
  - `PublishedStar` [R3F in-canvas] — single bright billboard born during the WOW moment, labelled "ICEVB 2025".
  - `CitationPanel` [DOM overlay] — glass card: paper title, venue, abstract, DOI/link, "mock/verified" tag.
  - `ResearchHUD` [DOM overlay] — scroll-progress thesis ticker + keyboard hint.

- **Assets** — `oracleBrain.glb` (draco, ~180KB) optional; mostly procedural geometry. Textures: glyph/sprite atlas + star sprite (ktx2, ~2 files, ~300KB). Fonts: JetBrains Mono (glyphs), Orbitron (title) — shared, no extra weight. Data: `research.ts`. Rough: ~2 models/textures, **Light** asset class (<600KB).

- **Shared Systems Used**
  - ParticleField: **morph target `'neuralNet'`** (brain/synapse cloud); ThoughtDust rides the same buffer.
  - CameraController: `dolly()` entry (14u→7u), `sway()` idle breathing orbit, `pushIn()`+`focus(brain)` on WOW, `rackFocus()` for DOF onto cards, `pushIn` exit blooming up through arcs.
  - LightingDirector: preset `oracle` — single cyan #00E5FF core point-light + cold #2D9CFF rear rim; per-world bloom intensity ~1.3.
  - TransitionController: enter via `neuralNet` morph + chromatic-aberration accent; never cross-fade.
  - PostFX: Bloom (emissive-only, threshold .85) + DOF (focus brain) + Vignette; CA spikes on scroll velocity.
  - AssetManager: lazy-load module on route, `useGLTF.preload` next world (leadership), full `dispose()` on exit.

- **State**
  - Reads: `useSystemStore` (qualityTier, liteMode, reducedMotion, mode, timeOfDay).
  - Writes: `useWorldStore` (loadState/ready, `visited.add('research')`, quest "viewed citation").
  - `useUIStore` (cursorState on planet hover, copilot toasts).
  - `useRecruiterStore` (fastPath skips WOW, atsMode forces CitationPanel-only).

- **Data Sources** — `src/data/research.ts` (papers, venue, abstract, themes→planet map, thesis string).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |------|-----------|-----------------|------------|-----------|
  | Cinematic | ~14 | 30k | ~3 | 60 |
  | Balanced | ~10 | 12k | ~1.5 | 50 |
  | Lite | ~5 | 4k / CSS | ~0.6 | 30+ |

- **Build Complexity** — **High** — custom pulse/arc shaders, focus-synchronized WOW choreography, and tier-gated transmission/bloom interplay.

- **Key Risks & Mitigation**
  - Particle overdraw + transmission cost on laptops → cap pixelRatio ≤2, half-res transmission, drop transmission at Tier 1, LOD planets, frustum-cull.
  - WOW timeline desync → drive arc-fire/constellation/star via one GSAP master timeline gated by `useWorldTransition`.

- **Lite / Mobile Fallback** — Static brain-and-planets hero render with a glass citation card; orbits become a CSS-rotated SVG ring and pulses become 3 opacity loops — keyboard-navigable, WCAG AA.

---

I have the full creative context for the Hall of Command. Writing the engineering spec now.

### 10. Hall of Command — Leadership Hub

- **Purpose** — Reverent processional "command hall" presenting Matru's leadership credentials (NCC SUO, coordinations, lecturer, civic) as illuminated monoliths culminating in a salute.

- **Components**
  - `LeadershipWorld` — root scene mount/lifecycle wrapper for SceneDirector. [R3F in-canvas]
  - `CommandHall` — environment shell: floor decal plane, fog volume, rear arc-reactor emblem. [R3F in-canvas]
  - `PillarColonnade` — 12 GPU-instanced pillars (single geometry, `InstancedMesh`). [R3F in-canvas]
  - `LeadershipMonolith` — one of 5 monolith meshes; owns rise/hover/spotlight state. [R3F in-canvas]
  - `RankInsignia` — orbiting insignia sprite/mesh; rotates-to-attention on salute. [R3F in-canvas]
  - `HoloPlaque` — troika-three-text plaque per monolith (lazy mounted on focus). [R3F in-canvas]
  - `ProcessionalAisle` — emissive tube circuit lines pulsing toward dais. [R3F in-canvas]
  - `SaluteSequencer` — non-visual controller firing the cascading-salute GSAP timeline. [R3F in-canvas]
  - `LeadershipHUD` — DOM detail card with stat chips on monolith click. [DOM overlay]
  - `LeadershipNav` — prev/next monolith + dais jump, keyboard-driven. [DOM overlay]

- **Assets** — `monolith.glb` (1 mesh, instanced ×5, draco) + `hero_medal.glb` (dais, normal-mapped). Textures (ktx2): insignia atlas, floor decal emissive, medal normal/roughness. Fonts: Orbitron (plaque titles), JetBrains Mono (chips). Data: 1 JSON. Rough count ~2 GLB + 4 textures; weight class **Medium (~1.6-2.2 MB)**.

- **Shared Systems Used** — ParticleField morph target `'constellation'` (dust shafts drifting upward). CameraController: `dolly()` processional entry, `pushIn()` + `focus(monolith)` on select, `rackFocus()` for HUD, `sway()` idle. LightingDirector preset `leadership` (warm key + gold rim + per-monolith spots, low ambient). PostFX accents: Bloom (gold flare at salute), Vignette always; scroll-velocity ChromaticAberration on aisle traversal. AssetManager: lazy-load module GLB, `useGLTF.preload` next world (Reliquary), dispose geometries/textures on exit.

- **State** — Reads `useSystemStore` (qualityTier, reducedMotion, mode, recruiterMode). Reads/writes `useWorldStore` (loadState/ready, visited, quest: monoliths viewed + salute fired). Writes `useUIStore` (HUD toast, cursorState on hover).

- **Data Sources** — `src/data/leadership.ts` (roles, ranks, tenure, civic entries, stat chips).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |---|---|---|---|---|
  | Cinematic | ~40 | 6k dust | ~12 | 60 |
  | Balanced | ~28 | 3k dust | ~7 | 45-55 |
  | Lite | ~6 (CSS) | 0 / 1.5k | ~2 | 30+ |

- **Build Complexity** — **High** — choreographed multi-actor salute timeline + per-monolith spotlights/fresnel shaders demand careful sequencing and instancing discipline.

- **Key Risks & Mitigation**
  - Volumetric spotlights/god-rays cost: single downsampled god-ray pass; bake fog to gradient on Balanced/Lite; LOD flat-shade monoliths beyond 25u.
  - Salute timeline jank with 5 actors: drive via one GSAP master timeline + shared uniforms, not per-frame React state.

- **Lite / Mobile Fallback** — Static vertical stack of 5 glass cards over a baked god-ray gradient with CSS conic gold-glow, insignia icons, stat chips, tap-to-expand; crossfades replace camera moves; fully keyboard-reachable, WCAG AA.

---

I have the full creative context. Writing the engineering spec now.

### 11. Reliquary — Achievement Vault

- **Purpose** — A reverent cylindrical vault where five verified honors hover as inspectable relics in god-ray light columns.

- **Components**
  - `VaultWorld` [R3F in-canvas] — world root; registers with SceneDirector, runs enter/boot-relay/exit lifecycle.
  - `BlastDoor` [R3F in-canvas] — 12 instanced hex teeth + gear-ring; staggered radial retract on enter.
  - `RelicPedestals` [R3F in-canvas] — `InstancedMesh` of 5 plinths on a 7m arc + ground reflection plane.
  - `Relic` (x5 via map) [R3F in-canvas] — individual relic mesh + fresnel rim shader; bob/idle-rotate; hover/click handlers, LOD twin.
  - `GodRayBeam` [R3F in-canvas] — additive cone-mesh w/ noise-displaced shader, one per relic.
  - `GoldDustField` [R3F in-canvas] — thin world-local wrapper binding ParticleField morph + curl drift toward active beam.
  - `VaultShell` [R3F in-canvas] — brushed-panel wall ring + 48 instanced data-conduits + depth fog.
  - `RelicInspector` [DOM overlay] — Framer Motion panel: title/year/tool chips, "verify" deep-link.
  - `VaultHud` [DOM overlay] — relic counter chips, exit/recenter, reduced-motion replay.
  - `VaultLiteGallery` [DOM overlay] — Tier-2 CSS card grid fallback.

- **Assets** — `vault.glb` (door+shell+5 relics+LODs, draco): ~1.2–1.8 MB. ktx2 textures: brushed-metal normal/roughness, holographic scanline, env probe — ~3 files, ~0.6 MB. Fonts reuse global Orbitron/Inter/JetBrains (troika for in-canvas relic labels). Data: 1 JSON. Rough total ~2–2.5 MB lazy-loaded.

- **Shared Systems Used**
  - **ParticleField** — morph target `'constellation'` (relics-as-stars), tinted gold; ~3k cap here, drifts toward active beam.
  - **CameraController** — `pushIn()`/dolly through door threshold (FOV 38→idle), `sway()` orbit ±12° idle loop, `focus(relic)`+`rackFocus()` for inspect (FOV 30, DOF pull); exit retreat.
  - **LightingDirector** — preset `vaultReverent`: per-relic warm gold spot keys feeding god-ray, cyan under-rim, low ambient; owns gated bloom (emissives/beams only).
  - **PostFX** — accents: Bloom (high), DOF bokeh on inspect, Vignette; ChromaticAberration only on transition velocity.
  - **AssetManager** — lazy-load `vault.glb` + ktx2 on enter, `useGLTF.preload` next world, dispose geometries/RTs/textures on exit.

- **State**
  - `useSystemStore` — read `qualityTier`, `liteMode`, `reducedMotion`, `recruiterMode`.
  - `useWorldStore` — write `loadState/ready`, add to `visited`, track inspected-relic quest progress.
  - `useUIStore` — `cursorState` (inspect hover), toast on verify-link.

- **Data Sources** — `src/data/achievements.ts` (5 relics: title, year, issuer, tools/tags, verifyUrl, relicMeshKey, mockLabel flags).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |---|---|---|---|---|
  | Cinematic | ~40 | 3,000 | ~3.5 | 60 |
  | Balanced | ~25 | 1,500 | ~2 | 50 |
  | Lite | DOM/CSS | 0 | ~0.4 | 30+ |

- **Build Complexity** — **High** — custom fresnel/volumetric shaders, sequenced boot-relay, constrained inspect-orbit, and reflection plane combine in one scene.

- **Key Risks & Mitigation**
  - God-ray + bloom cost — bake beams as additive cone meshes (no raymarch), half-res reflections, bloom threshold-gated; QualityGovernor drops beams/reflection at Tier 1.
  - Inspect camera fighting OrbitControls — gate OrbitControls behind `focus()` lock; disable dolly/sway while inspecting; single active relic.

- **Lite / Mobile Fallback** — `VaultLiteGallery`: static gold-lit CSS card grid with fresnel-edge styling, tap-to-flip, beams as CSS gradients, relay reduced to one fade-in — fully keyboard-navigable, recruiter-safe.

---

I have all the detail I need. Writing the engineering spec.

### 12. Hangar of Missions — Experience Command Room

- **Purpose** — Present Matru's four dated roles as opened-able holographic mission dossiers in a JARVIS-style obsidian hangar.

- **Components**
  - `ExperienceWorld` — world root; mounts/disposes via SceneDirector, wires entry/exit lifecycle. [R3F in-canvas]
  - `HangarEnvironment` — obsidian floor (grid shader plane), instanced wall-ribs, fog, distant blast-door. [R3F in-canvas]
  - `DossierSlab` (×4) — instanced 2.4×3.2m holographic glass slab + beveled gold frame + tether beam + hex platform; hover/open states. [R3F in-canvas]
  - `DossierBriefing` — exploded-view "page" deck (3–5 instanced quads: role, bullets, tool-chips, KPI sparkline) spawned on open. [R3F in-canvas]
  - `DustField` — local Points wrapper that biases ParticleField spores toward the active slab. [R3F in-canvas]
  - `GodRayCones` — 2 additive radial-blur cone sprites from ceiling vents (no raymarch). [R3F in-canvas]
  - `DomainFilterConsole` — Analytics/Cyber/Teaching segmented holo-rail filtering slabs. [DOM overlay]
  - `MissionHUD` — "MISSION ARCHIVE" header, breadcrumb, close-file button. [DOM overlay]

- **Assets** — `hangar.glb` (ribs/blast-door/cargo silhouettes, draco) ~0.9MB; brushed-metal frame + floor normal/roughness as ktx2 ~0.4MB; 1 spore sprite ktx2 ~40KB; Orbitron + JetBrains Mono (shared, troika). Data is JSON, not asset. Total ~1.4MB, Medium weight.

- **Shared Systems Used**
  - ParticleField → morph target `stream` (data attracted to active file).
  - CameraController → `dolly()` entry (FOV 50, 2.4s power3.out), `pushIn()`+`rackFocus()` on open (FOV 38, DOF tighten), `sway()` idle ±0.4m, pull-back exit.
  - LightingDirector → preset `hangar` (cool 5200K key, per-slab cyan rim, gold uplight).
  - PostFX → Bloom (thr 0.85, str 0.9), DOF focus on hovered slab, vignette; scroll-velocity chromatic accent on transition.
  - AssetManager → lazy-load `hangar.glb`+shaders on route, dispose on exit, preload next world.

- **State** — Reads `useSystemStore` (qualityTier, liteMode, reducedMotion, activeWorld); writes `useWorldStore` (loadState/ready, visited, opened-file quest progress); `useUIStore` (cursorState, toasts). Local Zustand-free useState for active slab/domain filter.

- **Data Sources** — `src/data/experience.ts` (4 roles: org, period, domain, bullets, tools, KPI), `src/data/worlds.ts` (route meta).

- **Performance Budget**

  | Tier | Draw calls | Particles | Texture MB | FPS |
  |---|---|---|---|---|
  | Cinematic | ~70 | 6,000 | ~12 | 60 |
  | Balanced | ~45 | 3,000 | ~7 | 45–55 |
  | Lite | ~6 (DOM) | 0 | ~1 | 30+ |

- **Build Complexity** — High — custom transmission/scanline glass shader, exploded-view 3D layout, and per-slab DOF focus management.

- **Key Risks & Mitigation**
  - Transmission glass is GPU-heavy: render full `transmissionResolution` only on the hovered/open slab; cheap fresnel-glass on the rest.
  - God rays/bloom stack: bake additive cone sprites instead of volumetrics; tier-gate DOF off in Balanced.

- **Lite / Mobile Fallback** — Tier 2 swaps the canvas for a vertical stack of frosted CSS case-file cards (gold seam + scanline), Framer inline expand, domain filter as a segmented control.

---

I have the full creative intent. Now I'll write the engineering spec.

### 13. Verification Vault — Certification Wall

- **Purpose** — A zero-gravity vault where 6 credential plates float in a 3D constellation and "verify" on focus, proving Matru's certifications are real and checkable.

- **Components**
  - `CertsWorld` [R3F in-canvas] — world root; mounts on `SceneDirector` enter, wires camera path + lifecycle.
  - `PlateConstellation` [R3F in-canvas] — instanced mesh of 6 beveled rounded-rect plates across 3 depth layers; per-instance uniforms (emblem index, fresnel phase).
  - `CertPlate` [R3F in-canvas] — single plate logic-wrapper: transmission glass + holo inner shader, hover/click verification state.
  - `PlateCaption` [R3F in-canvas] — troika-three-text mono caption per plate (Cisco, CTTC, IIT Jammu, Udemy×2, NCC).
  - `DataSpines` [R3F in-canvas] — `Line2` fat-lines tethering each plate, carry the WOW pulse.
  - `VaultFloor` [R3F in-canvas] — single reflective plane (drei `<Reflector>`, tier-gated); hosts the "VERIFIED" embossed seal decal.
  - `StarRing` [R3F in-canvas] — instanced ~2k-point rotating background ring.
  - `VerifiedSealFX` [R3F in-canvas] — gold-cyan seal ignition at the WOW beat.
  - `CertDetailPanel` [DOM overlay] — drei `<Html>` glass dossier on plate focus (issuer, ID, date, verify-link).
  - `CertsHUD` [DOM overlay] — Framer credential counter + "VERIFIED N/6" status, Skip pinned.

- **Assets** — No heavy GLB (plates are procedural geometry). 6 emblem decal textures + 1 "VERIFIED" seal (ktx2, ~0.8MB total); 1 env map (256px cube for floor/plate sheen). JetBrains Mono via troika. 1 data file. Weight class: **light** (~1.5MB).

- **Shared Systems Used**
  - **ParticleField** → `'constellation'` morph target (3.5k dust motes drifting toward focused plate).
  - **CameraController** → `dolly()` entry punch-up from floor reflection, `sway()` figure-eight idle, `pushIn()`+`rackFocus(plate)` on click, `dolly()` exit through StarRing.
  - **LightingDirector** → "vault-secure" preset: cyan top key + per-plate #2D9CFF rim; plates self-emissive; bloom intensity ~1.1 (threshold .82).
  - **PostFX** → Bloom (emissive only) + DOF rack-focus on focused plate; ChromaticAberration pulse on verify-lock; vignette.
  - **AssetManager** → lazy-load decals/seal/env on route enter; `useGLTF.preload` next world (impact); full dispose on exit.

- **State**
  - `useSystemStore`: read `qualityTier`, `reducedMotion`, `activeWorld`; set `activeWorld='certs'`.
  - `useWorldStore`: write `loadState/ready`, `visited`, quest progress (verified-plate count).
  - `useUIStore`: `cursorState`, toasts on copy/verify.
  - `useRecruiterStore`: read `fastPath` to auto-reveal all plates.

- **Data Sources** — `src/data/certifications.ts` (issuer, title, id, date, verifyUrl, securityTier).

- **Performance Budget**

| Tier | Draw calls | Particle budget | Texture MB | Target FPS |
|------|-----------|-----------------|------------|------------|
| Cinematic | ~30 | 3,500 motes + 2k ring | ~2.5 | 60 |
| Balanced | ~22 | 1,800 motes + 1k ring | ~1.5 | 50 |
| Lite | ~6 (DOM) | 0 (CSS) | ~0.5 | 30+ |

- **Build Complexity** — **High** — 6 simultaneous transmission materials + custom holo shader + SSR floor stack the most expensive effects; transmission count must be capped.

- **Key Risks & Mitigation**
  - Transmission + Reflector + Bloom fill-rate cliff → cap transmission to 6 plates, render transmission only on hovered plate at full res, half-res SSR, Reflector off on Balanced.
  - troika text + `Line2` draw-call creep → batch captions, single fat-line geometry, frustum-cull off-screen.

- **Lite / Mobile Fallback** — Becomes a static dark grid of 6 CSS-glass cards with cyan fresnel borders and gold security accents; tap expands `CertDetailPanel` inline; no WebGL, no camera moves.

---

I have everything needed. Writing the engineering spec now.

### 14. Tribunal of Light — Recruiter Impact

- **Purpose** — A climactic verdict chamber where 5 ignitable monolith-pillars present Matru's strongest hireability proofs, resolving into a dual CTA.

- **Components**
  - `TribunalWorld` [R3F in-canvas] — world root; owns mount/unmount via SceneDirector, sequences the ignition timeline.
  - `MonolithRing` [R3F in-canvas] — instanced 5-pillar ring (chamfered-box `MeshPhysicalMaterial`), drives per-pillar `uProgress` vertical-sweep + fresnel-ignite shader.
  - `FloorConduits` [R3F in-canvas] — instanced ~80 emissive line segments + inlaid pentagon; additive pulse toward firing pillar.
  - `ReflectiveFloor` [R3F in-canvas] — single mirror plane (drei `MeshReflectorMaterial`), roughness-mapped; half-res reflection.
  - `VerdictSlab` [R3F in-canvas] — extruded holographic panel rising on final beat; troika-three-text "DATA. INTELLIGENCE. LEADERSHIP."
  - `HorizonRing` [R3F in-canvas] — thin emissive torus + domed starfield backdrop.
  - `ProofCaptions` [DOM overlay] — per-pillar mono proof lines (Framer Motion), ARIA-live.
  - `TribunalHUD` [DOM overlay] — title bracket, ignition progress, Skip-to-CTA, dual CTA buttons (mirrors in-canvas plinths).

- **Assets** — 1 shared monolith `.glb` (draco, instanced ×5; ~120 KB). 2 ktx2 textures (panel normal map, floor roughness; ~400 KB). Starfield = procedural points (no texture). Fonts: JetBrains Mono SDF, Orbitron (preloaded global). 1 data file. Total ~0.6 MB, Light class.

- **Shared Systems Used**
  - ParticleField → `'reactor'` morph (radial upward-drift columns inside active pillars), additive, tier-scaled.
  - CameraController → entry `pushIn()` low glide (FOV 55, power3.out 2.2s); idle `orbit()` 0.4°/s; per-ignition `dolly()`+`sway()` tilt-up 6° / 1m; exit `pullOut` wide (FOV 48). `rackFocus()` for DOF on firing pillar.
  - LightingDirector → `tribunal` preset: near-black ambient (.15), per-pillar emissive-as-light + matched point lights fading on ignite, one cool overhead key.
  - PostFX → Bloom (1.4 / threshold .82 / radius .7), DOF rack on firing pillar, scroll-velocity ChromaticAberration accent, Vignette to seal the dome.
  - TransitionController → ignition chord drives morph + bloom pulse; exit = camera move + particle disperse.
  - AssetManager → lazy-load on route, `useGLTF.preload` next world, dispose + pause RAF off-screen.

- **State**
  - useSystemStore (read): qualityTier, liteMode, reducedMotion, recruiterMode (auto-fast-path ignite).
  - useWorldStore (write): loadState/ready, ignitedPillars Set, visited.
  - useRecruiterStore (read): fastPath, snapshotData (CTA copy/links).
  - useUIStore (write): cursorState, toasts (CTA copy), copilotOpen.

- **Data Sources** — `src/data/impact.ts` (5 proof entries: theme color, label, metric, source), `src/data/contact.ts` (CTA targets).

- **Performance Budget**

| Tier | Draw calls | Particles | Texture MB | FPS |
|---|---|---|---|---|
| Cinematic | ~45 | 30k (6k×5) | ~0.6 | 60 |
| Balanced | ~30 | 12k | ~0.4 | 45-55 |
| Lite | ~10 | <=2k / CSS | ~0.1 | 30+ |

- **Build Complexity** — High — custom vertical-sweep + fresnel shader, sequenced multi-pillar GSAP timeline, reflector floor, and transmission all interacting under a strict bloom budget.

- **Key Risks & Mitigation**
  - Transmission + reflector + bloom stack tanks fill-rate → cap transmission to Tier 0 only, half-res reflector, instance all pillars/conduits, gate FX by tier.
  - Long ignition sequence delays recruiter payoff → recruiterMode/Skip-to-CTA fires all pillars instantly to the verdict.

- **Lite / Mobile Fallback** — Static obsidian hero of 5 CSS-glow pillar cards igniting via staggered fade, proof lines, and the dual CTA (vignette only, no orbit/transmission, WCAG AA).

---

I have all the detail I need from the Creative Direction Bible. There are no existing `src/data/*` files yet (this is architecture-only). Here is the engineering spec.

### 15. Uplink Array — Contact Command Center

- **Purpose** — Orbital comms deck where the recruiter "launches a signal" via a real form submission (Formspree/Netlify) plus one-tap channel actions and resume download.

- **Components**
  - `ContactWorld` [R3F in-canvas] — world root; mounts scene graph, wires enter/exit lifecycle to SceneDirector.
  - `OrbitalDeck` [R3F in-canvas] — 14m circular deck + InstancedMesh hex floor (~600 tiles) with fresnel/scanline shader.
  - `ChannelPylons` [R3F in-canvas] — 4 instanced smoked-glass pylons (GitHub/Email/LinkedIn/Phone) with hover lift + telemetry readout.
  - `TransmitDish` [R3F in-canvas] — lathe parabolic dish + emissive feed-horn; god-ray source; fires uplink stream on send.
  - `DestinationBeacon` [R3F in-canvas] — icosahedron core + sprite glow; flares on packet impact, returns ACK pulse.
  - `PlanetaryHorizon` [R3F in-canvas] — 8 nested contour line-loops + satellite-relay silhouette + starfield.
  - `ConsoleRail` [DOM overlay via drei `Html`] — floating glass form (fields, Transmit, validation), submit-state machine.
  - `ChannelTiles` [DOM overlay] — clickable channel cards with live ONLINE status; copy-to-clipboard + toast.
  - `TransmitFX` [R3F in-canvas] — drives the send sequence (form→packet→particle comet→beacon flare→"SIGNAL DELIVERED" ring).

- **Assets** — `pylon.glb` (1 instanced mesh, draco), `dish.glb` (lathe), `beacon.glb`, `satellite.glb` — ~4 models, ~250–350 KB combined draco. Textures: hex-tile normal/emissive, dish brushed-dark, env cube 256px — all ktx2, ~1.5 MB. Fonts: Orbitron, JetBrains Mono (subset). Data: `contact.ts`. Weight class: Medium-Light.

- **Shared Systems Used**
  - ParticleField: morph target `'stream'` — the 8k uplink comet; idle-static, animated only on send.
  - CameraController: entry `dolly()` down to eye level (1.8s power3.out) + `rackFocus()` dish→console; `pushIn(6%)` + `focus(pylon)` on hover; `sway()` idle; FOV punch 55→62 + `tilt` on send.
  - LightingDirector: preset `contact` (cool 6500K key, cyan rim, one god-ray cone intensifying on send; bloom strength ~1.0, threshold 0.78).
  - PostFX accents: selective Bloom + light DOF + scroll-velocity ChromaticAberration on transmit/exit; Vignette always.
  - AssetManager: lazy-load module bundle on route enter, `useGLTF.preload` none-after (terminal world), full `dispose()` on exit.

- **State**
  - useSystemStore (read): qualityTier, liteMode, reducedMotion, recruiterMode, audioOn.
  - useWorldStore (write): `contact` loadState/ready, mark visited, quest progress (completion flourish).
  - useUIStore (write): toasts (copy confirmations), cursorState; (read) commandPaletteOpen.
  - useRecruiterStore (read): fastPath/printMode for direct CTA layout.
  - Local component state: form values + submit FSM (idle→sending→delivered/failed).

- **Data Sources** — `src/data/contact.ts` (channels, email, phone, GitHub, LinkedIn slot, resume URL, Formspree/Netlify endpoint), `src/data/system.ts` (ONLINE status copy).

- **Performance Budget**

  | Tier | Draw calls | Particle budget | Texture MB | Target FPS |
  |------|-----------|-----------------|-----------|-----------|
  | Cinematic | ~22 | 8k | ~3.0 | 60 |
  | Balanced | ~16 | 4k | ~1.8 | 45-55 |
  | Lite | ≤6 | 0 | ≤0.6 | 30+ |

- **Build Complexity** — **Medium** — geometry is simple (instancing + lathe), but the send-sequence choreography (form→packet→particle→beacon→ring) couples DOM form state to GSAP/particle timelines.

- **Key Risks & Mitigation**
  - Transmission glass on 4 pylons is GPU-heavy: cap to 4 meshes, limit transmission samples, LOD-swap to flat emissive cards beyond 8m / on Balanced.
  - False-success on network failure erodes trust: gate the "DELIVERED" flourish on real 2xx response; red short-circuit flicker on error, never the green ring.

- **Lite / Mobile Fallback** — Static space-deck CSS hero with four tappable glass channel cards, the live working form, and a CSS "SIGNAL SENT" checkmark sweep; vertical stack, 48px tap targets, full WCAG AA, all contact actions functional.

## 10. Recruiter Experience Engineering

The recruiter-facing layer is the highest-stakes path in MATRU OS: it must be fast, crawlable, and degrade to a flat resume on any device. Every feature below shares the same single source of truth (`src/data/*`), reuses canonical stores, and never reimplements content.

### Feature → Store → Route → Fallback Matrix

| Feature | Store flag(s) | Route | Fallback |
|---|---|---|---|
| Recruiter Mode | `useSystemStore.recruiterMode`, `useRecruiterStore.fastPath` | `/recruiter` | Static dashboard (no Canvas) |
| Fast Path | `useRecruiterStore.fastPath`, `useSystemStore.activeWorld` | `?fast=1` / `/recruiter` | Direct DOM render |
| Snapshot Card | `useRecruiterStore.snapshotData`, `useUIStore.toasts` | modal (any route) | Server-less PNG; copy-link |
| ATS Mode | `useRecruiterStore.atsMode` | `/resume` + hidden DOM | Always-present semantic HTML |
| Print Mode | `useRecruiterStore.printMode` | `@media print` | Browser print dialog |
| Command Palette | `useUIStore.commandPaletteOpen` | overlay (global) | Linked `<nav>` menu |

### Recruiter Mode

`/recruiter` is a **reduced-fidelity dashboard** that bypasses `SceneDirector`'s global Canvas entirely. On route match, `WorldRouter` sets `useSystemStore.recruiterMode = true` and **Tier-locks** `qualityTier` to Tier 2 via `QualityGovernor.lock(2)` (skips the FPS probe → instant paint). The route renders DOM-only widget cards (summary, top skills, impact metrics, certs) reading the same typed `src/data/*` imports the 3D worlds consume.

```ts
// useRecruiterStore
interface RecruiterState {
  fastPath: boolean;
  atsMode: boolean;
  printMode: boolean;
  snapshotData: SnapshotPayload | null;
  enterRecruiter(via: 'route' | 'palette' | 'fast'): void;
}
```

An **auto-summary** is derived once at boot: `buildSnapshot(data) → { name, role, topProofs: Proof[5], metrics }`, memoized into `snapshotData`. **Fallback:** if WebGL or `liteMode` is unavailable, `/recruiter` is already Canvas-free, so it is the recruiter-safe terminal state.

### Fast Path

Fast Path **skips Cold Ignition boot** and jumps to the curated snapshot. **Entry triggers:** (1) `?fast=1` query param, (2) the `/recruiter` route, (3) Command Palette "Recruiter fast path", (4) a returning-visitor cookie. On trigger, `WorldRouter` sets `fastPath = true`, instructs `SceneDirector` to skip the `boot` world's enter lifecycle, and `useSystemStore.bootStatus` jumps to `'ready'`. `TransitionController` is bypassed (no particle morph) for a sub-second first paint. **Fallback:** if JS hydration is slow, the ATS DOM (below) is already server-renderable/static, so content shows without the 3D layer.

### Snapshot Card

Client-side **branded image generation** — no server. Uses `html-to-image` (`toPng`) on an off-screen, fixed-size (1200×630, OG-ratio) hidden `<figure>` styled with design tokens (void bg, glass panel, gold accent). **Layout:** name + role (Orbitron) top-left; top-5 proofs as labeled chips; a metrics strip (JetBrains Mono); a **QR code** (qrcode library → data URL) bottom-right linking to `/recruiter?ref=card`. Flow:

```ts
generateSnapshot() →
  render hidden <SnapshotCard data={snapshotData}/> →
  toPng(node, { pixelRatio: 2 }) →
  { download(blob) | navigator.share(file) | copy link }
```

A `useUIStore.toasts` entry confirms download/share. **Fallback:** if `html-to-image` fails (CORS/old browser), present a copyable `/recruiter` deep link plus the same data as selectable text.

### ATS Mode

A **semantic, flat, crawlable resume DOM is ALWAYS present** — rendered server-static (or at hydration) inside `<main>` with real `<h1>/<h2>/<section>/<article>`, `<time>`, and `<address>` for contact. This is the SEO + screen-reader substrate; it is **visually hidden** (`sr-only`) during the 3D experience but never `display:none` from crawlers. The `/resume` route and the palette toggle set `atsMode = true`, which swaps to a **plain, styled view** (visible, no Canvas, high-contrast, single column). Because the markup pre-exists, toggling is purely a CSS visibility flip — zero re-fetch. **A11y:** logical heading order, skip-link, `lang`, ARIA landmarks, focus trap disabled in ATS view. **Fallback:** with JS off entirely, the static resume DOM is the page.

### Print Mode

Print Mode flattens the experience to a clean resume via an `@media print` stylesheet: hide Canvas/nav/palette, reveal the ATS DOM, force light background, single column, page-break rules on sections. The palette action and a StatusBar button set `printMode = true` and call `window.print()`. The same ATS markup is the print substrate (one DOM, three presentations: 3D / ATS / print). **Fallback:** the browser's native print dialog always works even if `printMode` state never flips.

### Command Palette

`⌘K` / `Ctrl+K` opens a palette (kbar recommended for the intent map + fuzzy search; custom fallback if bundle budget is tight). Bound via `useKeyboardNav`; visibility in `useUIStore.commandPaletteOpen`. **Intent map** (actions dispatch to stores/`WorldRouter`):

| Action | Effect |
|---|---|
| Jump to world (×15) | `WorldRouter.goto(key)` |
| Jump to skill / cert | route + `focus(target)` via `CameraController` |
| Recruiter fast path | `enterRecruiter('palette')` + `fastPath=true` |
| Toggle ATS / Print | `atsMode` / `printMode` |
| Toggle audio / Lite / reduced-motion | `useSystemStore` flags |
| Download snapshot | `generateSnapshot()` |
| Contact / copy email | `/contact` or clipboard |

**A11y:** palette is a focus-trapped `role="dialog"` with `aria-label`, arrow-key list nav, ESC to close, and every action mirrored in a visible `<nav>` so keyboard/no-JS users retain full navigation. **Fallback:** if the palette fails to mount, the linked `<nav>` and direct routes (`/recruiter`, `/resume`, `/contact`) cover all intents.

All six features converge on one principle: the recruiter path is **state-flagged, route-addressable, and DOM-first**, so it survives WebGL loss, slow hydration, and JS-off crawlers while still feeling like part of the same award-targeting OS.

I have enough detail to write the two sections consistently with the canonical systems and worlds. Writing now.

## 11. Development Roadmap

> Solo final-year CSE student, ~15–20 hrs/week, intermediate React, learning R3F. Hours are *engineering* hours (not calendar). Each phase ends demoable. Build canonical systems once; reuse everywhere.

---

### Phase 0 — Foundation
**Deliverables:** Repo + Vite/TS/Tailwind/ESLint/Prettier scaffold; CSS-variable design tokens; typed `src/data/*` content (single source of truth); all five Zustand stores (`useSystemStore`, `useWorldStore`, `useRecruiterStore`, `useUIStore`, content imports); router shell; persistent DOM HUD shell (StatusBar, NavDock stubs) with no 3D yet; `usePrefersReducedMotion`, `useQualityTier` (returns Tier 2 stub), `useTimeOfDay`.
**Components/Systems built:** Zustand stores, WorldRouter (routes only, no transitions), `useQualityTier`/`usePrefersReducedMotion`/`useTimeOfDay`, design-token layer, DOM shell.
**Complexity:** Low.
**Risks:** Over-engineering stores before worlds exist; token drift vs. SRS palette.
**Estimated hours:** 18.

### Phase 1 — Shared Void + Camera Spine
**Deliverables:** The single global `<Canvas>` and lifecycle backbone — *the spine every world depends on*. SceneDirector mount/unmount; CameraRig + CameraController GSAP moves (`dolly/orbit/pushIn/focus/rackFocus/sway`); ParticleField (one instanced GPU points system) with morph-target buffers + lerp uniform; LightingDirector global rig; PostFX EffectComposer (Render→Bloom→DOF→CA→Vignette→Noise) tier-gated; TransitionController; real QualityGovernor (rolling-FPS + device probe + hysteresis); AssetManager (draco/ktx2, lazy + dispose); AudioBus stub.
**Components/Systems built:** SceneDirector, CameraRig/CameraController, ParticleField, LightingDirector, PostFX, TransitionController, QualityGovernor, AssetManager, `useWorldTransition`, `useMouseParallax`, `useScrollProgress` (Lenis).
**Complexity:** Very High.
**Risks:** Hardest, riskiest phase — shader morph math, GPU dispose leaks, tier hysteresis tuning, R3F learning curve. Budget slip here cascades.
**Estimated hours:** 55.

### Phase 2 — Boot + Hero + Identity
**Deliverables:** First three real worlds proving the spine end-to-end: Cold Ignition (boot, once/session), Ascension Grid (hero, name decrypt + role-rotator + proof-chips), Credential Vault (identity, copy-to-clipboard, gyro/tilt cards). Routed + first TransitionController hop. Recruiter Skip path live.
**Components/Systems built:** 3 worlds via SceneDirector; ParticleField morphs `reactor→grid→globe`; LightingDirector presets; `useWorldLoad`, `useKeyboardNav`.
**Complexity:** High.
**Risks:** First worlds always over-built; boot-once persistence edge cases; mobile fallback parity.
**Estimated hours:** 42.

### Phase 3 — Skills + FMCG + Cyber
**Deliverables:** Reactor Forge (skills radar + bars, self-assessed labels), Sovereign Grid (flagship FMCG dashboard — KPI counters, gauges, mock-data labeled), Blacksite/Sentinel Grid (cyber attack/defense, packet-swarm morph, threat console). Heaviest data/UI phase.
**Components/Systems built:** charts (Radar/Gauge/BarMeter/Sparkline), ParticleField morphs `grid/packetSwarm`, force-graph, DOM-heavy dashboards over shared canvas.
**Complexity:** High.
**Risks:** Chart perf inside R3F context; FMCG scope creep; cyber animation complexity.
**Estimated hours:** 48.

### Phase 4 — Research + Leadership + Experience
**Deliverables:** Oracle Engine (research, neural+orbital, ICEVB card), Hall of Command (leadership grid, widest camera), Hangar of Missions (experience dossiers, filter/sort).
**Components/Systems built:** ParticleField morphs `neuralNet/constellation`; reusable HoloCard/dossier expand; `useTimeOfDay` theming.
**Complexity:** Medium.
**Risks:** Reuse fatigue → copy-paste divergence; neural-graph cost.
**Estimated hours:** 34.

### Phase 5 — Achievements + Recruiter + Contact
**Deliverables:** Reliquary (trophy vault, transmission glass, Tier-gated), Tribunal of Light (Recruiter Impact + 60s Recruiter Mode flat dashboard, snapshot card), Uplink Array (contact, Formspree/mailto, ONLINE status). Payoff "inhale" moment.
**Components/Systems built:** Recruiter Mode (recruiterStore: fastPath/atsMode/printMode), snapshot/OG card, transmission materials (Tier 0 only), final TransitionController choreography.
**Complexity:** Medium.
**Risks:** Transmission cost on laptops; recruiter-mode must stay recruiter-safe and fast.
**Estimated hours:** 30.

### Phase 6 — ARC Copilot + Command Palette
**Deliverables:** ARC scripted copilot (intent map, no LLM), ⌘K command palette (kbar), keyboard nav polish, Auto-Pilot guided tour.
**Components/Systems built:** `useCopilot`, kbar integration, `useKeyboardNav` completion, AudioBus UI ticks.
**Complexity:** Medium.
**Risks:** Intent-map maintenance; palette/route sync.
**Estimated hours:** 24.

### Phase 7 — Optimization + Polish
**Deliverables:** FPS hardening to targets (60/45-60/30+), tier ladder QA, a11y (WCAG AA, focus order, 3D screen-reader equivalents), SEO/OG/JSON-LD, responsive 360→1920, dispose-leak audit, r3f-perf pass, deploy.
**Components/Systems built:** QualityGovernor tuning, Lite-mode parity, print/ATS mode, cross-browser/device QA.
**Complexity:** High.
**Risks:** Perf whack-a-mole; mobile WebGL surprises; a11y gaps in pinned GSAP scenes.
**Estimated hours:** 41.

---

### Summary

| Phase | Complexity | Hours | Cumulative |
|---|---|---|---|
| 0 Foundation | Low | 18 | 18 |
| 1 Void + Camera Spine | Very High | 55 | 73 |
| 2 Boot/Hero/Identity | High | 42 | 115 |
| 3 Skills/FMCG/Cyber | High | 48 | 163 |
| 4 Research/Leadership/Experience | Medium | 34 | 197 |
| 5 Achievements/Recruiter/Contact | Medium | 30 | 227 |
| 6 ARC/Palette | Medium | 24 | 251 |
| 7 Optimization/Polish | High | 41 | 292 |

**Total: ~292 hrs.** At a *realistic* effective ~16 hrs/week (slippage, learning, debugging), that is **~18–20 calendar weeks (~4.5–5 months)**. Treat Phases 0–1 (73 hrs / ~5 weeks) as the unmovable critical-path investment; everything after is parallelizable in spirit but should ship serially for momentum.

---

## 12. Build Order

**Critical path:** `tokens + stores → global Canvas + SceneDirector → CameraRig → ParticleField morph engine → PostFX/QualityGovernor → first world (Hero) → TransitionController proven on a second world → all remaining worlds → cross-cutting (ARC, palette) → optimization.` Nothing immersive is real until SceneDirector + CameraRig + ParticleField exist together.

**Hard dependencies / do-not-build rules:**
- **Do NOT build any world before SceneDirector + CameraRig + ParticleField + PostFX exist.** Worlds are *consumers* of the spine; building one first forces a rewrite.
- **Do NOT build TransitionController before two worlds exist** — you cannot test a transition with one endpoint. Build Hero, then Identity, *then* wire the morph+camera hop.
- **Do NOT wire QualityGovernor tier-switching before PostFX is tier-gated** — the governor toggles PostFX/particle budgets, so PostFX must read tier first.
- **Do NOT build dashboards (FMCG/Skills/Cyber) before charts exist as standalone DOM components** — build/verify charts outside the canvas, then place them.
- **Do NOT build Recruiter Mode before recruiterStore + the data layer are final** — it is a flat projection of existing content; building it early means re-doing it.
- **Do NOT add ARC/command palette before routes + all worlds exist** — they navigate to targets that must already be addressable.
- **Do NOT chase 60 FPS before all worlds exist** — optimize the whole, not a moving target (Phase 7).

**Intra-phase ordering (the spine, Phase 1, in order):**
1. Global `<Canvas>` + SceneDirector mount/unmount one dummy world.
2. CameraRig + CameraController (`dolly/pushIn` first; `orbit/rackFocus/sway` after).
3. ParticleField: static instanced points → add named morph-target buffers → add GPU lerp uniform (morph between two targets manually before automating).
4. LightingDirector global rig.
5. PostFX composer, tier-gated, in canonical order.
6. QualityGovernor (FPS probe → tier → hysteresis → manual StatusBar override).
7. AssetManager (lazy-load + dispose-on-exit; verify no GPU leak via r3f-perf).
8. TransitionController **stub** (deferred until Phase 2 has two worlds).

**First 10 commits (week one, Phase 0 → start of 1):**
1. `chore: scaffold Vite + React 18 + TS + Tailwind + ESLint/Prettier`
2. `feat: design tokens (CSS vars + tailwind theme) from SRS palette/type/spacing`
3. `feat: typed src/data/* content modules (profile, skills, projects, experience, certs, achievements, leadership, research, fmcgMock)`
4. `feat: Zustand stores (system, world, recruiter, ui) with typed selectors`
5. `feat: WorldRouter routes + React Router shell (15 world keys, no transitions)`
6. `feat: persistent DOM shell — StatusBar + NavDock stubs (lite/mute/recruiter toggles)`
7. `feat: usePrefersReducedMotion + useTimeOfDay + useQualityTier (Tier-2 stub)`
8. `feat: mount global R3F <Canvas> + SceneDirector with one dummy world`
9. `feat: CameraRig + CameraController (dolly/pushIn GSAP timelines)`
10. `feat: ParticleField — instanced GPU points, single static target buffer`

By end of week one the canvas mounts, the camera moves, and one particle system renders — the spine's skeleton, ready for morph targets and PostFX next.

## 13. Risk Assessment

| Risk | Likelihood | Impact | Mitigation | Contingency |
|------|-----------|--------|------------|-------------|
| **Mobile 3D performance** (jank, GPU throttle, battery heat) | High | High | Tier 2 LITE is the *default* on mobile via `QualityGovernor` device probe; cap particles <=15k or swap to 2D canvas/CSS; disable PostFX except vignette; static lighting; `dpr` clamp [1,1.5]; no transmission/shadows. | Auto-fall to flat glass UI per world (the recruiter-safe path); show a one-tap "Enter Lite Experience" banner; route to `recruiterMode` snapshot. |
| **Solo-dev time/scope** (15 worlds is huge) | High | High | Build the *shared systems* (`SceneDirector`, `CameraRig`, `ParticleField`, `PostFX`, `QualityGovernor`) once; worlds become data + a morph target + a lighting preset. Ship worlds incrementally behind `WorldRouter`. | Apply **The Cut List**; collapse low-value worlds into shared templates; ship the **MLP** scope and label remaining worlds "Coming online". |
| **WebGL unavailable / context loss** | Medium | High | Feature-detect WebGL2 at boot (`useSystemStore.bootStatus`); listen for `webglcontextlost`; never assume a canvas. | Render the full DOM/CSS portfolio (Tier 2 path) with zero Three.js; toast "Visual mode unavailable, showing standard view". |
| **Shader / particle-morph complexity** (hardest custom code) | High | High | Single `ParticleField` with named position-buffer morph targets; GPU lerp via one uniform `uMorph`; pre-bake target buffers offline; unit-test buffer counts match. | Drop GPU morph to CPU `BufferAttribute` swaps with a GSAP-tweened blend; if still failing, cross-dissolve two static point clouds (the only allowed near-crossfade). |
| **Asset weight / load time** (GLTF, textures) | Medium | High | `AssetManager` with draco + ktx2 compression; per-world lazy load + dispose-on-exit; `useGLTF.preload` next world; budget <2MB/world, <1.5MB hero. | Replace heavy GLTF with instanced primitives + particles (no models); serve a low-res ktx2 first, swap on idle. |
| **Browser / Safari compatibility** (color, blur, ktx2, audio) | Medium | Medium | Test Safari/iOS early; guard `backdrop-filter` with fallbacks; verify ktx2 transcoder; avoid bleeding-edge GLSL; use `@react-three/postprocessing` defaults. | Solid-fill glass fallback when blur unsupported; PNG fallback for ktx2; skip effects Safari chokes on via UA + capability flags. |
| **Accessibility vs spectacle** | Medium | High | `usePrefersReducedMotion` forces Tier 2 + disables camera moves/morphs; full keyboard nav (`useKeyboardNav`); ARIA on all DOM UI; every world has a readable text equivalent; `recruiterMode`/`atsMode` strips effects. | Ship `recruiterMode` fast-path and `printMode` as first-class routes; ATS-plain resume always reachable. |
| **Audio autoplay policy** | Low | Low | `AudioBus` OFF by default; audio only after explicit user gesture; global mute in `StatusBar`. | If blocked, stay silent permanently; never gate UX on sound. |
| **State / re-render perf traps** (Zustand + R3F) | Medium | High | Selector-scoped subscriptions; transient `useFrame` updates via refs, NOT React state; never store per-frame values in stores; memoize world props; `r3f-perf` in `devMode`. | Move hot paths to a non-reactive `mutable` ref module; throttle store writes; split stores further. |
| **Scope creep & burnout** | High | High | Lock scope to MLP; timebox each world; "systems before sparkle" order; weekly demo-able milestone. | Freeze features, ship MLP, mark extras post-launch; lean on Cut List without guilt. |
| **SEO for a WebGL SPA** | Medium | Medium | Server-prerender (or static HTML) of core content per route via React Router; real `<h1>`/meta/OpenGraph; sitemap; the DOM text equivalents double as crawlable content. | Maintain a parallel static `/resume` + per-world text pages; submit to Search Console manually. |

### The Cut List
*(drop in this order if behind schedule — top goes first)*

1. **AudioBus** ambient/UI ticks (already OFF; pure polish).
2. **Tier 0 luxuries**: DOF, chromatic aberration, grain, transmission/refraction — keep bloom + vignette only.
3. **Continuous cinematic-scroll mode** — ship routed `WorldRouter` only; Lenis stays for smooth scroll, drop scroll-driven world travel.
4. **Copilot / command palette niceties** (`useCopilot`, kbar) — keep basic nav.
5. **Low-narrative worlds** merged into shared templates: `certs` (Verification Vault) and `vault` (Reliquary) become one card-grid template; `leadership` (Hall of Command) folds into `experience`.
6. **Per-world bespoke models** — replace with the shared `ParticleField` morph + primitives.
7. **Inter-world particle MORPH** itself — fall back to static per-world point clouds with a quick camera move.
8. **Quest progress / visited-Set gamification** (`useWorldStore` quest fields).
9. **timeOfDay** lighting variation.
10. **Secondary worlds entirely** (`research` Oracle, `impact` Tribunal) — link to text sections instead.

Never cut: boot, hero, the recruiter fast-path, contact, and the ATS/print resume.

### Minimum Lovable Product (MLP)
The smallest build that still feels award-worthy *and* is recruiter-complete:

- **Shared core**, fully working: `SceneDirector`, single `<Canvas>`, `CameraRig` + `CameraController` (dolly/pushIn/focus), one `ParticleField` (Tier-gated, with at least `globe`/`grid`/`reactor` morph targets), `PostFX` (bloom + vignette), `QualityGovernor` with all 3 tiers + hysteresis, `usePrefersReducedMotion`.
- **6 worlds, polished end-to-end**: `boot` (Cold Ignition), `hero` (Ascension Grid), `skills` (Reactor Forge), `experience` (Hangar of Missions), `impact` (Recruiter Impact), `contact` (Uplink Array). These cover the recruiter narrative: arrival -> who -> what I can do -> what I've done -> proof of value -> how to reach me.
- **Recruiter-safe everything**: `recruiterMode` fast-path, Tier 2 LITE auto on mobile/reduced-motion, full keyboard nav, ATS-plain + `printMode` resume.
- **Deep-linkable routes** for the 6 worlds; remaining 9 worlds appear as locked "Coming online" tiles that still expose their text content (SEO + completeness).

This MLP is demo-able, judge-impressive on desktop (Tier 0/1 spectacle on the 6 worlds), and never breaks for a recruiter on a mid-range laptop or phone.

## 14. Final Engineering Direction & Definition of Done

### Engineering Non-Negotiables

These are not preferences. Violating one forces a rewrite.

1. **One Canvas, forever.** A single global R3F `<Canvas>` owned by `SceneDirector`. Worlds mount/unmount into it. No world ever instantiates its own canvas.
2. **Tier-gated everything.** Every particle count, PostFX pass, shadow, and transmission material reads `useQualityTier()`. Nothing renders at a fixed cost. `QualityGovernor` is the only authority that sets the tier.
3. **Dispose-on-exit, always.** `AssetManager.dispose(world)` frees geometries, textures, and materials on unmount. Verify zero GPU growth across a full 15-world tour in `r3f-perf`. A leak here kills the project on mobile.
4. **Recruiter Skip is always present.** From any world, a recruiter reaches the Impact/snapshot path in one action. Recruiter Mode and Lite Mode are recruiter-safe, flat, fast, and never gated behind 3D.
5. **Accessibility floor (WCAG AA).** Real DOM panels, correct focus order, keyboard nav, `prefers-reduced-motion` honored (Lenis off, morphs static), and screen-reader equivalents for every 3D scene. The DOM layer is the source of truth; the Canvas is decoration over it.

### Recommended Solo Build Path (in order)

Follow the phases exactly; the order is the safeguard.

- **Phase 0 — Foundation:** tokens, typed `src/data/*`, four stores, router shell, DOM HUD shell, stub hooks. No 3D.
- **Phase 1 — The Spine (unmovable critical path):** global Canvas → `SceneDirector` → `CameraRig`/`CameraController` → `ParticleField` morph engine → `LightingDirector` → tier-gated `PostFX` → real `QualityGovernor` → `AssetManager`. Build this once, correctly; everything downstream is a consumer.
- **Phase 2 — Boot/Hero/Identity:** prove the spine end-to-end on three worlds; wire the first `TransitionController` hop.
- **Phase 3 — Skills/FMCG/Cyber:** heaviest data/UI; build charts as standalone DOM first.
- **Phase 4 — Research/Leadership/Experience:** reuse without copy-paste divergence.
- **Phase 5 — Achievements/Recruiter/Contact:** payoff worlds + Recruiter Mode projection.
- **Phase 6 — ARC Copilot + ⌘K Palette:** only after all routes are addressable.
- **Phase 7 — Optimization/Polish:** hit FPS targets (60 / 45–60 / 30+), a11y, SEO, dispose audit, deploy.

### Per-Phase Definition of Done

| Phase | Done when… |
|---|---|
| 0 | Stores typed; tokens match SRS palette exactly; routes resolve 15 keys; DOM shell renders; no 3D, no errors. |
| 1 | Canvas mounts; camera moves run; `ParticleField` lerps between two targets; PostFX gated by tier; `QualityGovernor` switches tiers with hysteresis; `r3f-perf` shows no dispose leak. |
| 2 | Boot plays once/session; Hero + Identity live; one transition hop morphs particles + moves camera; recruiter Skip works; mobile Lite parity verified. |
| 3 | Charts pass standalone; FMCG/Skills/Cyber render over shared canvas at tier budget; mock data labeled. |
| 4 | Three worlds reuse `HoloCard`/morphs cleanly; neural graph within frame budget. |
| 5 | Recruiter Mode is a flat projection of real data; snapshot/OG card renders; transmission gated to Tier 0. |
| 6 | ARC intent-map navigates; ⌘K palette routes correctly; keyboard nav complete. |
| 7 | All FPS targets met across devices; WCAG AA passes; print/ATS mode clean; deployed. |

### If You Only Do Five Things

1. Build the **spine (Phase 1)** correctly before any world.
2. Make **`ParticleField`** one morphing system — it carries the whole "award-winning" feel.
3. Keep **`frameloop="demand"`** and verify **dispose-on-exit** with `r3f-perf`.
4. Keep the **recruiter/Lite path** flat, fast, and always reachable.
5. Let **`QualityGovernor`** be the single source of tier truth — gate everything through it.

### Closing

This plan is sized for one final-year CSE student at ~16 effective hours/week over ~18–20 weeks (~292 engineering hours), front-loaded into the spine. The architecture deliberately trades breadth of novel code for **depth of reuse**: build ten shared systems once, then express fifteen worlds as configuration and content over them. Nothing here requires a backend, a team, or a research breakthrough — only disciplined sequencing and respect for the non-negotiables above. The risk is not capability; it is scope drift and skipping the dispose audit. Follow the phases, honor the canonical names, measure before you optimize, and MATRU OS is fully buildable by one person.

**Build the spine, mount the worlds, ship the signal — MATRU OS is one disciplined developer away from real.**

---

*End of MATRU OS Master Engineering Blueprint v1.0 — ready to scaffold Phase 0.*
