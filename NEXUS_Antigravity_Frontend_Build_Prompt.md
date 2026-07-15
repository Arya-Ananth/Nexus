# NEXUS — Frontend Build Prompt (for Antigravity)

> **Scope lock:** FRONTEND ONLY. No backend, no server, no real API, no database, no auth. Every "live" number, alert, host, and incident on screen is generated from local mock data (hardcoded JSON + a client-side fake-telemetry generator running on `setInterval`/`requestAnimationFrame`). If a feature seems to need a backend, fake it in the browser instead — do not scaffold one.

---

## 0. Read This First — The Scenario You're Building For

This is a **Stellar Hack** submission (Theme: **Beyond Human**) by team **Kaizen**. Round 1 was planning-only (Universe Card, Mission Card, Dashboard Blueprint — attached as source PDFs). This prompt is for the Round 2 build: turn that plan into a working, demo-able, judged-live frontend prototype.

**Do not invent new lore, new mechanics, new personas, or new panels that aren't in the source PDFs.** Everything you build should trace back to a specific line in the Universe Card, Mission Card, or Dashboard Blueprint below. The one exception is the 3D requirement — the source PDFs specced a 2D cross-section for one panel; you are explicitly upgrading that (and the taxonomy visualization) to 3D per the instructions in Section 5. That is the only deliberate deviation from the source spec.

### The World
It's 2091. Engineered organisms called **Neurografts** — grown, not built — are fused into the human nervous system to grant enhanced senses, reflexes, or cognition. Fusion is legal, popular, permanent. Neurografts carry **no personality, intent, or voice** — they are read strictly as living biological signal, never as characters. Keep the tone **clinical, not heroic.**

Every fusion can destabilize — identity blur, organ rejection, neural override — collectively called **Fusion Drift**. A rarer fourth phenomenon, **Emergence**, isn't a failure at all: it's a long-fused host becoming something no longer classifiable as human *or* Neurograft.

**NEXUS** is the registry that tracks, scores, and keeps every fused human — every "host" — alive.

### The Core Conflict
Synth-Medics are caught between two failures: **miss a warning sign** and a host suffers rejection or override; **flag too aggressively** and a stable, thriving fusion gets forcibly extracted. Emergence sharpens this further — it presents as neither clearly healthy nor clearly failing, forcing a judgment call the risk-scoring system was never built to make: *is this host in danger, or becoming something new?*

### Who Is Using This Dashboard, and Why
**Primary user: Dr. Ama Reyes, Synth-Medic.** Caseload of 20–40 hosts. Her goal every shift: watch every active fusion under her care, catch instability while it's still reversible, and decide fast — observe, intervene, or escalate. She is not trying to eliminate risk. She's trying to catch danger before it's irreversible, **and** to tell a dangerous drift apart from a host who is simply becoming something new.

**This is the design brief in one sentence:** build the console Ama opens at the start of every shift — a single live view where an unstable or emerging host surfaces itself, so she never has to go hunting for the problem, and where she has the tools to *act* on what she finds, not just read about it.

Secondary personas that shape tone/copy (not separate screens):
- **Kael Ito — Host.** Courier fused with a Crystalline-Reflex Neurograft for reaction speed. Wants autonomy, resents being monitored, fears an unjust extraction over his livelihood. (Use this to keep host-facing copy — names, incident descriptions — human, not just numbers.)
- **The Compliance Office.** NEXUS's enforcement arm. Scores risk, not people. Orders extraction on any case — including Emergence — it can't confidently classify. (This is the invisible pressure behind the Compliance Pressure meter — it's a countdown to an automated decision Ama is racing against.)

---

## 1. The Four Key Moments — Design Around These, Literally

The dashboard must make each of these four scenarios *playable* in a demo, not just visually present. Build your mock data generator so a judge watching a live demo can see all four happen within a few minutes:

1. **The Quiet Drift** — A host's Cognition Drift score creeps up over days, no single spike, easy to miss in raw numbers. **The dashboard must visualize a trend, not just a moment** (radar chart comparing current 4-axis reading against a 3-day-ago snapshot, not just a live number).
2. **The False Alarm** — A host's bio-sync spikes during a workout — normal — but looks identical to early rejection on paper. **Ama needs enough on-screen context to tell the difference without switching views** (Bio-Sync Graph and Incident Feed must be visible simultaneously and cross-referenceable).
3. **The Extraction Call** — A host's Fusion Integrity Score crashes below threshold. Ama has minutes to choose: **Sedate Fusion**, **Schedule Extraction**, or — Emergence cases only — **Recalibrate**. Recalibrate is *not* a guaranteed fix: it can stabilize, partially help, or worsen the case. It's a real clinical gamble, not a safety net — the UI should communicate that (e.g. a probability/risk indicator on the action, an animated uncertain outcome when triggered in the demo, not a clean checkmark).
4. **The Emergence Question** — A long-fused host stops reading as sick or stable — a third category the system wasn't built to score. Compliance defaults to extraction. Ama must judge: intervene, monitor, or let it stand. **This is the sharpest expression of the whole premise — make Emergence hosts visually and interactionally distinct from Critical hosts, not just another color on the same scale.**

---

## 2. Neurograft Taxonomy — This Drives the 3D Models

Every host is fused with exactly one of four structurally distinct organism classes. Each class needs its own visually distinct model/motif — do not reuse one generic "blob" for all four.

| Class | Specialization | Structural Motif (use this to shape the 3D geometry) |
|---|---|---|
| **Coral-Vascular** | Circulatory & stamina fusions | Branching, calcified growth — like coral or a vascular/blood-vessel tree. Radiating, forking branches from a central trunk. |
| **Mycelial-Neural** | Cognition & parallel-processing fusions | Thread-like fungal network — like mycelium. Dense, fine web of interconnected filament nodes. |
| **Crystalline-Reflex** | Combat & courier reflex fusions | Faceted, angular lattice growth — like crystal formations. Sharp geometric planes, high-contrast facets. |
| **Vine-Cognitive** | Memory & sensory-extension fusions | Curling, tendril-based growth — like vines. Spiraling, looping curves, softer organic motion. |

Kael Ito (the example host persona) is fused with a **Crystalline-Reflex** Neurograft — use that as your default/demo host so the crystalline model gets primary screen time.

---

## 3. Scope — CORE vs. STRETCH (from the source Dashboard Blueprint)

The source PDF explicitly tiers the build. Respect this tiering for build order, but see Section 5 for where the 3D requirement overrides the STRETCH label.

**CORE — the must-ship triage loop.** Build this first, and it must work end-to-end before touching anything else:
- Topbar (shift status, alert count, ID badge)
- Host Roster (scrollable, auto-sorted by risk)
- Fusion Integrity Gauge
- Bio-Sync Graph
- Cognition Drift Radar
- Compliance Pressure meter
- Incident Feed
- Quick Actions (Sedate Fusion · Schedule Extraction · Flag for Review · Recalibrate for Emergence hosts)

**STRETCH — build once Core is stable and demo-ready:**
- Neurograft Genome Map (D3 node-web, styled per taxonomy)
- Neurograft Interior View (cross-section deep-dive, opened from a flagged marker)

> **Per this build's explicit requirements, the 3D Neurograft models (Section 5) are elevated to CORE priority** — they are the "showoff at first glance" moment and cannot be deferred to a stretch pass. Everything else in STRETCH stays stretch.

---

## 4. Tech Stack

Use the stack named in the source PDF as the baseline, extended with what's needed for 3D and a polished interactive build. All of this is frontend-only; no server runtime required.

**Core framework**
- **React 18** + **Vite** (fast dev/demo reload — important for a live-judged hackathon)
- **TypeScript** (optional but recommended — mock data schemas in Section 7 are easier to keep consistent with types)

**Styling & motion**
- **Tailwind CSS** — utility styling, matches source spec
- **Framer Motion** — panel transitions, host-switch animations, Quick Action feedback states
- **Lucide Icons** — iconography, matches source spec

**Data visualization**
- **Recharts** — Bio-Sync Graph (line chart), Compliance Pressure (progress/countdown), Cognition Drift Radar
- **D3.js** — Neurograft Genome Map (node-web graph), any custom scale/interpolation logic behind the 3D data-to-color mapping

**3D**
- **Three.js** via **React Three Fiber (`@react-three/fiber`)** — the rendering layer for all Neurograft 3D models
- **`@react-three/drei`** — orbit controls, environment lighting, `Html` overlays for in-3D-scene labels/tooltips, procedural geometry helpers
- Optional: a lightweight custom procedural-geometry approach (branching L-system for Coral-Vascular, particle/line-network for Mycelial-Neural, faceted `IcosahedronGeometry`/custom lattice for Crystalline-Reflex, tube/spline curls for Vine-Cognitive) rather than importing static 3D asset files — this keeps the whole thing dependency-light, frontend-only, and gives you clean per-taxonomy color/state theming for free. If you'd rather use pre-built assets, glTF models loaded via `@react-three/drei`'s `useGLTF` are fine too — either approach is acceptable as long as all four taxonomies are visually distinct and interactive.

**State & mock data**
- **Zustand** (or React Context if you prefer fewer dependencies) — global state for selected host, alert queue, shift status
- A local **fake telemetry engine**: a `setInterval`-driven module that mutates mock host data over time (drift creeping up, occasional bio-sync spikes, an Emergence host slowly shifting) so the dashboard feels *live* in a demo without any backend

**No backend. No REST/GraphQL calls. No websockets to a real server.** If you want a "live" feel, simulate it entirely client-side.

---

## 5. The 3D Requirement — "Showoff at First Glance"

This is the headline feature judges see in the first five seconds. Do not treat it as decorative — it needs to be genuinely interactive.

### 5.1 Landing / Hero Moment
Before Ama's dashboard loads, build a short **hero screen**:
- A large, slowly rotating 3D Neurograft model (start with Crystalline-Reflex, matching Kael Ito's fusion) centered on a near-black background (`#0B1015`), lit with a soft teal/violet rim light.
- Title treatment: "NEXUS — The Neurograft Integration Registry" with the one-line premise beneath it.
- The model should react to pointer movement (subtle parallax tilt) and support orbit-drag — this is the "wow" moment, it should feel alive and touchable, not a static render.
- A clear call-to-action ("Enter Console" / "Start Shift") transitions into the main dashboard (use Framer Motion for the transition — don't hard-cut).

### 5.2 Neurograft Genome Map (upgrade from D3 node-web to 3D)
The source spec calls this a "D3 node-web, styled per taxonomy." Build it as an **interactive 3D node graph** using React Three Fiber instead of a flat D3 SVG graph: nodes as small glowing spheres colored/shaped per the host's taxonomy, connected by animated line-edges, orbitable and zoomable. This is the panel Ama opens to understand *why* a host is reacting the way they are — node clusters should visually correspond to the taxonomy's structural motif (branching for Coral-Vascular, web-like density for Mycelial-Neural, faceted arrangement for Crystalline-Reflex, spiral/curl arrangement for Vine-Cognitive).

### 5.3 Neurograft Interior View (upgrade from 2D cross-section to 3D)
Source spec: "2D cross-section deep-dive, opened on demand from a flagged marker — gene-dot cross-section for False Alarm review and Recalibration calls," with a marker-detail panel (% change graph) and marker actions.

Build this as a **3D drill-down**, not flat: clicking a flagged marker on the Genome Map or Host Roster opens a full 3D interior render of that host's specific Neurograft, with clickable "gene-dot" markers floating at anatomically-plausible points on the model. Clicking a marker opens the detail panel (small trend graph + marker actions), exactly as specced, just staged in 3D space instead of a flat canvas.

### 5.4 Per-Taxonomy Model Requirements
All four taxonomy models must exist and be swappable (the Genome Map / Interior View should render whichever taxonomy the selected host actually has):

- **Coral-Vascular** — procedurally branching structure, calcified/matte material, teal-dominant.
- **Mycelial-Neural** — fine interconnected thread/web structure, violet-dominant, subtle pulse animation along threads (signal-firing effect).
- **Crystalline-Reflex** — faceted low-poly lattice, high specular/glass-like material, sharp teal/violet gradient facets.
- **Vine-Cognitive** — curling tube/spline geometry, organic slow-drift animation, soft violet glow at tendril tips.

### 5.5 State-Reactive Coloring (applies to every 3D model, not just the hero)
The model's material color/glow must reflect the host's current status, using the source palette:
- Stable → `#45D9C4` (teal)
- Drift / Watch / Alert → `#B58BFF` (violet)
- Critical → a red/warning shift (not in the base 4-color palette — introduce a clear critical red, e.g. `#FF5C5C`, consistent with "glow instead of drop shadow" mood)
- Emergence → should read as visually *distinct* from Critical, not just "more red." Consider a shifting/unstable dual-tone effect (teal-violet interference pattern) to visually communicate "the system can't classify this," matching the Emergence Question's whole point.

---

## 6. Screen-by-Screen Spec

### 6.1 Hero / Landing (see 5.1)
One screen, one clear CTA, transitions into the console.

### 6.2 Main Console (the Dashboard Blueprint, built to spec)

**Topbar** — persistent header:
- Shift status ("SHIFT: ACTIVE")
- Active alert count ("ALERTS: 04" — live count from mock data)
- Dr. Ama Reyes — ID badge

**Host Roster** (left column, scrollable, 20–40 mock hosts):
- Auto-sorted by risk: **Emergence** and **Critical** hosts surface first, then **Watch**, then **Stable**.
- Each row: host ID + status pill, color-coded (teal/violet/critical-red/Emergence-distinct as defined in 5.5).
- Clicking a host populates the Main Grid.

**Main Grid** (selected host's live panels — all CORE):
- **Fusion Integrity Gauge** — radial 0–100% score, big readout number, color-shifts per threshold.
- **Bio-Sync Graph** — HR + neural sync, live-scrolling line chart (Recharts), fed by the mock telemetry engine.
- **Compliance Pressure** — a countdown/progress bar toward auto-intervention by the Compliance Office. This should visibly tick down in the demo, creating real time pressure — this is the mechanical expression of "Compliance doesn't see people, only risk scores."
- **Cognition Drift Radar** — 4-axis radar chart, current reading plotted against a 3-day-ago snapshot on the same chart, so "the trend, not the moment" is visible at a glance.
- **Incident Feed** — timestamped log, most recent first, scrollable, with a "REVIEW" badge on unresolved items. Include a mix of resolved ("routine check, cleared") and unresolved entries so the False Alarm scenario is demoable.
- **Quick Actions** — four buttons: **Sedate Fusion**, **Schedule Extraction**, **Flag for Review** (always available), and **Recalibrate** (only enabled/visible for hosts flagged Emergence — visually marked as higher-risk/gamble, e.g. dashed border or a distinct warning treatment, per the source spec's "Recalibrate (Emergence only)" styling).

**Genome Map + Interior View** — STRETCH tier, built after Core is demo-stable, per Section 5.2–5.3.

### 6.3 Quick Action Feedback
Every Quick Action needs a visible outcome in the demo (this is a prototype for judges, not a real clinical tool — don't leave actions feeling like dead clicks):
- **Sedate Fusion** → Bio-Sync Graph visibly flattens/stabilizes over a few seconds.
- **Schedule Extraction** → host is marked and moves toward the bottom of the roster with a "pending extraction" tag.
- **Flag for Review** → adds an entry to the Incident Feed with the REVIEW badge.
- **Recalibrate** → trigger a genuinely uncertain animated outcome (e.g. a brief suspense state, then resolves to one of: stabilized / partially improved / worsened) — reinforce that this is a gamble, not a guaranteed fix, per the source spec.

---

## 7. Mock Data — Shape It Like This

No backend, so the frontend needs a believable local data layer. Suggested shape (adjust freely, but keep the fields the panels above actually need):

```ts
type NeurograftClass =
  | "coral-vascular"
  | "mycelial-neural"
  | "crystalline-reflex"
  | "vine-cognitive";

type HostStatus = "stable" | "watch" | "critical" | "emergence";

interface Host {
  id: string;               // "HOST-07"
  name?: string;             // optional flavor, e.g. "Kael Ito" for the demo host
  neurograftClass: NeurograftClass;
  status: HostStatus;
  fusionIntegrity: number;   // 0-100
  bioSync: { timestamp: number; heartRate: number; neuralSync: number }[];
  cognitionDrift: {
    current: { memory: number; mood: number; impulseControl: number; identityContinuity: number };
    threeDaysAgo: { memory: number; mood: number; impulseControl: number; identityContinuity: number };
  };
  compliancePressure: number; // 0-100, counts down toward auto-intervention
  incidents: { timestamp: string; label: string; resolved: boolean }[];
  genomeNodes: { id: string; x: number; y: number; z: number; connections: string[] }[];
}
```

Build a small generator (`generateMockHosts(count)`) plus a `setInterval` "tick" that nudges 2–3 fields per host per tick, so the console visibly breathes during a live demo. Script at least one host on a deliberate slow drift-to-Emergence arc so Moment #1 and #4 are guaranteed to be demoable without waiting on randomness.

---

## 8. Interactivity Checklist

Everything below should be genuinely interactive, not static mockup images:

- [ ] Hero 3D model responds to pointer/drag (orbit + subtle parallax)
- [ ] Host Roster is clickable, sortable-by-risk, and scrollable
- [ ] Selecting a host animates the Main Grid transition (Framer Motion, not a hard reload)
- [ ] Bio-Sync Graph updates live from the mock telemetry tick
- [ ] Cognition Drift Radar toggles/overlays current vs. 3-day-ago
- [ ] Compliance Pressure visibly counts down and is time-sensitive in the demo
- [ ] Incident Feed items are hoverable/expandable for detail
- [ ] Quick Actions all produce a visible, distinct outcome (Section 6.3)
- [ ] Genome Map is a real orbitable 3D scene, not a static image, with clickable nodes
- [ ] Interior View opens as a drill-down (modal or route transition) from a flagged marker, with clickable gene-dot markers and a marker detail panel
- [ ] All four Neurograft taxonomy models are implemented and visually distinct
- [ ] Layout is responsive down to a reasonable laptop demo resolution (doesn't need full mobile support, but shouldn't break on a projector at a different aspect ratio)

---

## 9. Visual Style Guide

From the source Universe Card — follow this exactly, don't substitute a different palette:

| Token | Hex | Use |
|---|---|---|
| Base | `#0B1015` | Background, near-black |
| Stable | `#45D9C4` | Teal — stable hosts, "healthy" data |
| Alert | `#B58BFF` | Violet — drift/watch/cognition data |
| Readouts | `#F2FBFA` | Off-white — reserved for key numeric readouts only, not general text |
| Critical *(introduced, not in source palette)* | `#FF5C5C` | Use sparingly, only for Critical-status states |

**Mood:** "Clinical HUD meets living organism" — soft-rounded cards, vein-like organic grid lines instead of hard borders, glow instead of drop shadow.

**Type:** Monospace (e.g. `Consolas`/`JetBrains Mono`/system-mono fallback) for data and labels; a clean sans (e.g. system sans or `Inter`) for narrative/UI text. Keep Neurograft-related copy clinical and signal-based — no personality, no character voice for the organisms themselves, per the premise.

---

## 10. Explicit Constraints

- **Frontend only.** No backend, no server process, no database, no real network calls. Mock/generate everything client-side.
- **No invented mechanics.** Every panel, action, and status this prompt asks for traces back to the source PDFs. The only intentional addition is 3D (Section 5), which upgrades two STRETCH items (Genome Map, Interior View) and adds a hero moment — it does not add new game mechanics.
- **Keep Neurografts non-sentient in tone.** They're signal, not characters — this affects copywriting (incident feed strings, tooltips) as much as visuals.
- **Emergence ≠ Critical.** Keep these two states visually and interactionally distinct at every point they appear (roster color, 3D material treatment, Quick Actions availability).
- **Recalibrate is a gamble, not a fix.** Its UI treatment (availability, styling, outcome animation) must never imply a guaranteed success.

---

## 11. Acceptance Checklist (what "done" looks like for a live judged demo)

- [ ] Hero screen loads first, 3D model is interactive within the first few seconds, clear CTA into the console
- [ ] Console loads with Topbar + populated, sorted Host Roster
- [ ] Selecting any host populates all CORE panels with that host's live data
- [ ] At least one scripted host demonstrates each of the Four Key Moments (Section 1) reliably, without relying on random luck during the live demo
- [ ] All four Quick Actions are clickable and produce visible, distinct outcomes
- [ ] Genome Map and Interior View are reachable, 3D, and interactive (orbit + clickable markers)
- [ ] All four Neurograft taxonomy 3D models exist and are visually distinct
- [ ] Palette, type, and "clinical HUD meets living organism" mood are consistent across every screen
