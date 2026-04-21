-- ============================================================
-- Exercise create/edit + tracking types + goals
-- Run in Supabase SQL Editor
-- ============================================================


-- ── exercises: new columns ────────────────────────────────────

alter table exercises
  add column if not exists tracking_type text not null default 'weight_reps'
    check (tracking_type in ('weight_reps', 'reps_only', 'duration', 'distance')),
  add column if not exists image_url text;


-- ── exercise_sets: columns for non-weight tracking types ─────

alter table exercise_sets
  add column if not exists duration_seconds integer,
  add column if not exists distance_km      numeric(6, 3);


-- ── exercise_goals: new table ─────────────────────────────────

create table if not exists exercise_goals (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles (id) on delete cascade,
  exercise_id      uuid not null references exercises (id) on delete cascade,
  target_weight_kg numeric(6, 2),
  target_reps      integer,
  target_duration_seconds integer,
  target_distance_km numeric(6, 3),
  note             text,
  target_date      date,
  created_at       timestamptz not null default now(),
  unique (user_id, exercise_id)
);

alter table exercise_goals enable row level security;

create policy "exercise_goals: own rows" on exercise_goals
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── exercises: add write policies ────────────────────────────

create policy "exercises: insert" on exercises
  for insert to authenticated
  with check (true);

create policy "exercises: update" on exercises
  for update to authenticated
  using (true);


-- ── Supabase Storage: exercise-images bucket ─────────────────
-- Run separately in Storage dashboard or via CLI:
--   supabase storage create exercise-images --public
-- Or via SQL:

insert into storage.buckets (id, name, public)
  values ('exercise-images', 'exercise-images', true)
  on conflict (id) do nothing;

create policy "exercise-images: public read"
  on storage.objects for select
  using (bucket_id = 'exercise-images');

create policy "exercise-images: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'exercise-images');

create policy "exercise-images: authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'exercise-images');
