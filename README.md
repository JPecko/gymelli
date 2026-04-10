# Gymelli

Premium personal gym tracking app — speed-first, mobile-first, progress-driven.

## Stack

- React 19 + TypeScript + Vite
- SCSS Modules (styling)
- Supabase (auth + database)
- Vercel (hosting)

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in Supabase credentials
npm run dev
```

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Scripts

```bash
npm run dev       # Dev server with HMR
npm run build     # Type-check + production bundle
npm run lint      # ESLint
npm run preview   # Preview production build
```

## What It Does

Gymelli is a single-user fitness tracker focused on:

- **Fast workout logging** — registar sets com o mínimo de toques possível
- **Progress visibility** — PRs, volume, consistency always in view
- **Premium UX** — dark theme, gold accents, clean cards, fluid transitions

### Feature Priority

1. **Workout Session** — core screen; log sets, rest timer, repeat-last-set
2. **Exercise Library** — search, filter by muscle/equipment, personal history
3. **Workout Templates** — Upper/Lower/Push/Pull/etc., editable and reorderable
4. **History & Analytics** — session log, per-exercise graphs, volume trends
5. **Dashboard** — suggested workout, streak, last session summary

## Data Model

```
profiles
exercises          → muscle_groups, equipment
workout_templates  → workout_template_exercises
workout_sessions   → workout_session_exercises → exercise_sets
```
