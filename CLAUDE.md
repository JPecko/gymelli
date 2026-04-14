# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Type-check (tsc -b) then bundle with Vite
npm run lint      # Run ESLint
npm run preview   # Preview the production build locally
```

No test runner is configured yet.

---

## Product Overview

**Gymelli** is a personal gym tracking app for a single user, focused on:
- **Speed-first** workout logging during live sessions (minimum taps)
- **Visual clarity** — key data (weight, reps, progress) always visible
- **Progress-driven** — everything revolves around evolution: PRs, volume, consistency
- **Mobile-first** — primary use is on phone during workout; desktop is secondary

Stack: React 19 + TypeScript + Vite, SCSS Modules for styling, Supabase for auth and database.
Theme: dark neutrals (90%) with gold accents (10%).

**Layouts:**
- `AppLayout` — standard layout with bottom nav (mobile) and sidebar (desktop). Used for all main routes.
- `SessionLayout` — minimal full-screen layout with no nav. Used for screens requiring full focus (e.g. active workout session). Route must be declared **outside** the `AppLayout` tree in the router.

### Feature Priority Order
1. **Workout Session** (core — most critical screen)
2. Exercise Library
3. Workout Templates
4. History & Analytics
5. Dashboard polish

### Core Screens
- **Dashboard** — suggested workout, streak, volume, last session
- **Workout Session** — active exercise, set table, quick weight/reps input, repeat-last-set, rest timer
- **Exercises** — searchable list with muscle/equipment filters, detail page with personal history
- **Templates** — create/edit workout templates, reorder exercises, set defaults
- **History** — session log, per-exercise progress, volume/PR metrics

---

## Architecture

Feature-first / domain-oriented structure:

```
src/
  app/        → bootstrap, providers, routing, global state
  features/   → business logic organized by domain
  pages/      → page composition only, no heavy logic
  shared/     → reusable, domain-agnostic code and components
```

**Feature rules:**
- Each feature is self-contained: components, hooks, services, and types live inside the feature folder
- Avoid cross-feature imports unless absolutely necessary
- Each feature owns its own API layer (e.g. `features/workouts/workouts.api.ts`)

**Shared rules:**
- Only truly reusable, domain-agnostic logic goes here
- No business-specific logic allowed
- **Always check `shared/components/` before creating any UI primitive.**
  Existing components (all exported from `shared/components/index.ts`):
  - `Button` — variants: primary (gold fill), secondary (gold border), ghost. Sizes: sm/md/lg. Prop: fullWidth.
  - `Input` — label + input + error. font-size: 1rem enforced.
  - `IconButton` — circular button. Props: `done` (success state), `size` (sm/md).
  - `Badge` — inline pill label. Variants: `default` (neutral), `gold` (PR/achievement highlight).
  - `SetRow` — read-only display row: "Set N · X kg × Y". For logged set history.
  - `SetsCard` — card with header slot + list of `SetRow`. Props: `header: ReactNode`, `sets[]`, `emptyMessage?`.
  - `SwipeableItem` — swipe-left-to-delete wrapper (touch). Shows delete button on hover (desktop, `hover: none` media query excluded).
  - `StepperInput` — numeric stepper with −/+ buttons. Props: `value: number | null`, `onChange`, `step`, `min`, `disabled`, `inputMode`. Disabled state hides buttons and shows static value. Touch-friendly (44px min-height).
- **Always check `shared/hooks/` before creating a new hook.**
  Existing:
  - `useElapsedTime(startedAt)` → formatted elapsed string (e.g. `"4:32"`)
  - `useCountdown(totalSeconds, onComplete)` → `{ remaining, progress, display }`. Counts down to 0 then calls `onComplete`. `totalSeconds` fixed on mount.

**Import direction:** `features` → `shared` → never the reverse.

---

## Data Model

```
profiles
exercises          → muscle_groups, equipment
workout_templates  → workout_template_exercises
workout_sessions   → workout_session_exercises → exercise_sets
```

App is mostly CRUD + derived metrics. No heavy backend logic required.
Optimistic UI is strongly encouraged for workout logging (speed-first).

---

## Styling (SCSS Modules)

SCSS Modules are the primary styling system. Inline styles and Tailwind are discouraged except for simple one-off layout utilities.

**Design tokens:** All CSS variables (colors, spacing, sizes) live in `app/globals.scss`. Never hardcode values — always reference tokens.

**Breakpoints:**
- Mobile-first (`min-width` queries)
- Breakpoint variables defined in `shared/styles/_breakpoints.scss`
- In `.module.scss` files: `bp` namespace is **auto-injected** — never add `@use` manually. Use `bp.$breakpoint-*-up`
- In `_*.scss` partials: `bp` is NOT injected — must explicitly `@use '../../styles/breakpoints' as bp;`

**Input font-size (mandatory):** All `<input>` elements must have `font-size: 1rem` (16px) minimum — iOS Safari auto-zooms on inputs smaller than 16px. Use the shared `Input` component (enforced automatically) or set `font-size: 1rem` explicitly with a comment.

**px → rem (mandatory)** — all dimensional values use `rem`:

| px  | rem      |
|-----|----------|
| 2   | 0.125rem |
| 4   | 0.25rem  |
| 8   | 0.5rem   |
| 12  | 0.75rem  |
| 14  | 0.875rem |
| 16  | 1rem     |

Keep in `px` only: border widths, outlines, border-radius, and breakpoints.

**Turbopack constraint (critical):** Never use `:global {}` inside a CSS module class — this causes build errors. Third-party overrides must go in `globals.scss`, scoped with a wrapper class.

**Semantic class names:** `.card`, `.title`, `.value` — not utility names.

---

## Design System

- **Theme:** dark premium + gold accents
- **Gold:** use only for CTAs, highlights (PRs, achievements), selected states, key metrics. Avoid large gold backgrounds or long gold text.
- **Visual style:** clean and minimal, soft shadows, rounded corners, high contrast
- **During workout session:** hide everything non-essential — reduce cognitive load

---

## Component Rules

- Small and focused (~150 lines max)
- Prefer composition over large monolithic components
- Avoid deeply nested JSX
- Use semantic PascalCase names: `WorkoutCard`, `SetRow`, `ExerciseBlock`
- Use `clsx` for conditional class application — no inline conditional styles
- No direct fetch/API calls inside UI components
- No raw API payloads passed through the component tree

---

## State Management

| Scope         | Use for                                           |
|---------------|---------------------------------------------------|
| Local state   | UI interactions, forms, toggles                   |
| Feature state | Business logic per feature (e.g. workout session) |
| Global state  | Auth, theme, global UI flags only                 |

Avoid global state overuse.

---

## Data Layer

- Supabase accessed via a shared client in `shared/lib/supabase.ts`
- Each feature owns its API file: `features/<domain>/<domain>.api.ts`
- No centralized API files
- No direct `fetch` calls in components
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Types: snake_case throughout** — TypeScript interfaces mirror the Supabase/PostgreSQL schema directly (snake_case). No DTOs, no mappers, no camelCase conversion layer. This is intentional: the app is CRUD-heavy and single-user; the added abstraction would be overhead without benefit.

**No Axios** — the Supabase JS client is the HTTP layer. Do not introduce Axios or custom fetch wrappers.

---

## Code Quality

- TypeScript strict mode — no `any`
- Hooks: ~100 lines max
- Functions: verb-first naming (`getWorkout`, `createSession`)
- No duplication — reuse existing patterns before creating new ones
- Prefer simple solutions over clever ones
- Always read a file before editing it

---

## Exercise Images

Static images live in `public/images/exercises/`. Filename = exercise name slugified:
```
"Bench Press" → bench-press.png
"Overhead Press" → overhead-press.png
```

Slug derivation: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`

Reference in components: `src={'/images/exercises/${slug}.png'}`. Always provide an `onError` fallback (placeholder div with muscle group name). Do not store the slug in the database — derive it from `exercise.name` at render time.

---

## Constraints

- No monolithic files
- No mixed concerns in a single file
- No `components/` dumping ground or generic `utils/` folder
- Do not introduce new patterns without justification — stay consistent with existing architecture
