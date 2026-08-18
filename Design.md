# Design.md — Visual & Motion Direction

Status: **direction not finalized** — this file records the constraints and options under consideration. Lock in the final choice here once decided, and update Rules.md §1 to match (one animation library, one theme).

---

## 1. Theme Direction

**Decided constraint:** not a plain white/light UI. Two directions under consideration:

### Option A — Dark Metallic
- Near-black base (`#0B0C0E`–`#121316`) with brushed-metal accents: cool greys with a subtle sheen/gradient on key surfaces (cards, buttons, active nav item).
- Sheen achieved via CSS gradients + a soft highlight on hover/focus rather than heavy imagery — keeps it performant.
- Accent color: a single metallic-adjacent hue (steel blue, chrome silver, or a muted gold) used sparingly for primary actions and status highlights.
- Risk: can read as "gamer UI" if overdone — keep gradients subtle, reserve shine for interactive states, not static backgrounds.

### Option B — Dark, Flat Palette (non-metallic)
- Deep neutral base (charcoal/near-black or deep navy) with a restrained accent palette suited to a productivity tool — e.g. one primary accent + one semantic set (success/warning/danger/info).
- Flatter surfaces, relies on typography, spacing, and subtle elevation (shadow/border) rather than sheen for hierarchy.
- Lower risk, easier to keep "productivity tool" feeling rather than "showcase" feeling — closer to tools like Linear/Raycast in mood.

**Recommendation:** prototype both on the Dashboard and Task list (the two highest-traffic screens) before committing — the metallic look is easy to get right on a hero page and easy to get wrong on dense data tables. A hybrid is reasonable: flat neutral base (Option B) with metallic *accents* reserved for primary buttons, active states, and brand touches (Option A used sparingly) rather than metallic used everywhere.

Regardless of which is chosen:
- Maintain WCAG-reasonable contrast for text on dark surfaces.
- Status colors (To Do / In Progress / Blocked / Completed; Low/Med/High/Urgent) must stay visually distinct and consistent across the whole app.
- Define the palette as design tokens (CSS variables / Tailwind theme extension), never hard-coded hex values inside components.

---

## 2. Typography

- Pick **one primary typeface** for UI text and, optionally, one distinct display face for headings/dashboard hero numbers if extra character is wanted.
- Favor a modern, geometric or grotesk sans for a "productivity tool" feel (legible at small sizes, works well in dense tables) — e.g. Inter, Geist, or similar — final pick during prototyping.
- Monospace font reserved for things like timestamps/IDs if that fits the aesthetic — optional, not required.
- Type scale should be defined once (h1–h6, body, small, caption) and reused via Tailwind config — no ad hoc font sizes in components.

---

## 3. Motion & Animation

Three options are on the table; they are not mutually exclusive but **one should be the primary engine** per Rules.md:

- **Motion (Framer Motion):** best for React-native component transitions, layout animations, page/route transitions, list reordering (e.g. task moving between status columns). Recommended as the **primary** engine given the Next.js/React stack — it integrates most naturally with component state.
- **Anime.js:** better suited to more free-form/SVG/timeline-based animation (e.g. a decorative dashboard intro, icon micro-animations). Use narrowly, not as the app-wide engine, if a specific effect needs it.
- **"Stitch"-style scroll/animation approach:** if referring to scroll-driven storytelling/landing-page style animation — this fits a marketing/landing surface far more than the authenticated app itself. If this product ever gets a public marketing page, that's the place for heavier scroll animation; the authenticated dashboard/task views should stay fast and restrained (productivity tools lose trust if they feel slow or gimmicky).
- The `frontend-design` skill (referred to as a "taste" skill) should be consulted directly during implementation for concrete visual/motion choices once a direction (metallic vs flat) is picked — it's an implementation aid, not a decision this file needs to pre-empt.

**Guiding rule:** motion should communicate state changes (task moved, status changed, item completed) and add polish to transitions — it should never delay the user from completing a task. Keep durations short (150–300ms typical), avoid animating on every list re-render, and always respect `prefers-reduced-motion`.

---

## 4. Loading / Perceived-Performance Pattern

Every data-driven view (Dashboard, Task list, Project list, Activity feed, Profile) must use a **skeleton loader** that mirrors the real layout while data fetches — this is a hard requirement, see Security.md §4 for the performance/latency trigger condition. Skeletons should use the same dark theme surfaces (subtle pulse/shimmer, not a spinner) so the loading state doesn't visually clash with the final content.

---

## 5. Open Decisions to Finalize Before Phase 0 UI Work
- [ ] Confirm Option A (metallic), Option B (flat dark), or hybrid
- [ ] Confirm accent color(s) and semantic status colors
- [ ] Confirm primary typeface (and optional display face)
- [ ] Confirm Motion vs Anime.js as primary animation engine
- [ ] Decide if/when a public marketing page exists (affects whether "Stitch"-style scroll storytelling is ever needed)

Once these are locked, record the final values here (as design tokens) and treat this section as source of truth for `tailwind.config` theme values.