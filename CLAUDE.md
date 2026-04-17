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

**MobileHeader** (`src/app/layouts/MobileHeader.tsx`) — always rendered inside AppLayout on mobile. Two modes:
- **Brand mode** (no route config): Gymelli stacked gold wordmark (`gymelli-gold-stacked-wormark.svg`) + version label inline + profile icon. Shown on root/main pages.
- **Detail mode** (route has `handle.mobileHeader`): back button + title + profile icon. Shown on sub-pages.

Every sub-page route that requires back navigation **must** declare `handle.mobileHeader` in the router. Without it, the brand header is shown (no back button). Routes currently configured: `workouts/new`, `exercises/:id`, `templates/new`, `templates/:id/edit`, `profile`.

The header is scroll-aware: in-flow → hidden (scroll down) → floating (scroll up). When floating, it is `position: fixed` and AppLayout sets `--mobile-sticky-offset: var(--mobile-topbar-total-height)` on the content div. Pages with `position: sticky` elements must use this variable (see Styling section).

### Feature Priority Order
1. **Workout Session** (core — most critical screen) ✓
2. Exercise Library ✓
3. Workout Templates ✓
4. History & Analytics ✓
5. Dashboard ✓
6. Profile / Settings ✓

### Core Screens
- **Dashboard** — suggested workout, streak, volume, last session
- **Workout Session** — active exercise, set table, quick weight/reps input, rest timer per exercise
- **Exercises** — searchable list with muscle/equipment filters, detail page with personal history
- **Templates** — create/edit workout templates, reorder exercises, set defaults
- **History** — session log, per-exercise progress, volume/PR metrics
- **Profile** — display name, email (read-only), sign out

### Navigation
- **BottomNav (mobile):** Home(/) · Programs(/templates) · [FAB→/workouts/new] · Exercises(/exercises) · Progress(/history)
  - Profile accessible via MobileHeader profile icon (always visible on mobile, top-right of the header bar)
- **SideNav (desktop):** Home · Programs · Exercises · Progress · Profile (all in scrollable nav list) + Start Workout button pinned in footer. Nav area has `overflow-y: auto` with top/bottom fade overlays; top fade only visible when scrolled past top (JS-driven `.scrolled` class). Version label sits below the wordmark in the logo area.
- **NavIcons** (`src/app/layouts/NavIcons.tsx`) — shared SVG line icons for both navs
- Nav height: 72px (`--nav-height: 4.5rem`)

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
  - `StatCard` — metric display card. Props: `label`, `value`, `unit?`, `accent?` (gold highlight). Used in History and Dashboard.
  - `ScoreRing` — SVG 270° arc ring. Props: `score: number`, `label: string`, `size?: number`, `showLabel?: boolean`. Fill colour driven by label (Poor/Fair → muted, Good → text-secondary, Great/Elite → gold). Score number uses `font-size: 1rem`.
  - `ConfirmSheet` — bottom sheet for destructive confirmations. Props: `message`, `confirmLabel?`, `onConfirm`, `onCancel`. `z-index: 200` (above BottomNav). No bottom padding compensation needed.
- **Auth-scoped components** live in `features/auth/components/` (not `shared/`):
  - `AuthCard` — full-screen centred shell with Gymelli logo. Used by LoginPage and SignUpPage.
- **Always check `shared/hooks/` before creating a new hook.**
  Existing:
  - `useElapsedTime(startedAt)` → formatted elapsed string (e.g. `"4:32"`)
  - `useCountdown(totalSeconds, onComplete)` → `{ remaining, progress, display }`. Counts down to 0 then calls `onComplete`. `totalSeconds` fixed on mount.
  - `useVersionCheck()` → `{ updateAvailable }`. Polls `/version.json` (static file generated at build time) every 5 min and on window focus. Compares against `APP_VERSION` (build-time constant).
  - `useSwipeGesture({ onSwipeLeft?, onSwipeRight?, threshold? })` → `{ onTouchStart, onTouchEnd }`. Fires only when gesture is primarily horizontal (`|dx| > |dy|`). Safe to use alongside `SwipeableItem` — `SwipeableItem` stops propagation on horizontal moves.

**Feature hooks — exercises (`features/exercises/hooks/`):** check before implementing any exercise-related logic.
  - `useExercisesWithMeta()` → `{ exercises: ExerciseWithMeta[], muscleGroups: MuscleGroup[], equipment: Equipment[], isLoading }`. Single `Promise.all` for all three tables. If any exercise has no equipment, pre-pends `{ id: 'none', name: 'Bodyweight' }` to the equipment list. Exports `BODYWEIGHT_ID = 'none'` sentinel — use it when filtering bodyweight exercises.
  - `useExerciseFilter(exercises)` → `{ filtered, query, setQuery, activeMuscleGroupId, setActiveMuscleGroupId, activeEquipmentId, setActiveEquipmentId }`. Text search across `name`, `muscle_group_name`, `equipment_name`, `type`. Chip filters for muscle group and equipment (handles `BODYWEIGHT_ID` → `equipment_id === null`). Used by both `ExercisesPage` and `ExercisePicker` — do not duplicate.

**Feature components — exercises (`features/exercises/components/`):** check before implementing new exercise UI.
  - `ExerciseFilters` — two rows of horizontal scrollable chips: Muscle Group + Equipment. Props: `muscleGroups?`, `activeMuscleGroupId?`, `onMuscleGroupChange?`, `equipment?`, `activeEquipmentId?`, `onEquipmentChange?`. Each row only renders if the array is non-empty and the change handler is provided. Used by `ExercisesPage` and `ExercisePicker`.
  - `ExerciseCard` — unified card for library (nav variant: `exerciseId`) and picker (select variant: `selected`, `onToggle`).

**Import direction:** `features` → `shared` → never the reverse.

---

## Data Model

```
profiles
exercises          → muscle_groups, equipment
workout_templates  → workout_template_exercises (incl. default_sets, default_reps, rest_seconds)
workout_sessions   → workout_session_exercises (incl. rest_seconds) → exercise_sets
app_config         → key/value store (app_version — no longer used for update checks; version.json is used instead)
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

**Sticky elements below MobileHeader (mobile):** Any `position: sticky` element that must sit flush below the floating MobileHeader must use:
```scss
top: max(0px, calc(var(--mobile-sticky-offset, 0px) - {element-padding-top}));
transition: top 220ms ease;
```
The `max(0px, ...)` prevents a negative `top` when the header is not floating. The subtraction absorbs the element's own padding-top so the floating header visually covers it. See `ExercisesPage.module.scss` (`.searchWrap`) and `ExercisePicker.module.scss` for reference implementations.

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

## Pre-implementation checklist (mandatory)

Before writing any code for a new feature, verify all of the following. Raise issues with the user **before** implementing — not after.

**Architecture**
- No cross-feature imports (`features/A` → `features/B`) unless truly unavoidable. If a component is used by 2+ features, move it to the feature that owns its data or to `shared/`.
- Import direction: `features` → `shared`, never the reverse.
- New component location: `shared/` only if domain-agnostic and reusable; otherwise inside the owning feature.

**Reuse**
- Check `shared/components/index.ts` and `shared/hooks/` before creating anything new.
- Check the feature's own components/hooks first.

**Data / Performance**
- No N+1 queries: never call an API inside `.map()`. Use `.in()` batch queries instead.
- Prefer one Supabase round-trip over sequential queries where possible.
- Optimistic UI for any user-facing write during a workout session.

**Quality**
- Components ≤ ~150 lines, hooks ≤ ~100 lines.
- No data fetching inside UI components — use hooks or API files.

---

## Constraints

- No monolithic files
- No mixed concerns in a single file
- No `components/` dumping ground or generic `utils/` folder
- Do not introduce new patterns without justification — stay consistent with existing architecture
