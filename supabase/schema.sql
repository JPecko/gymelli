-- ============================================================
-- GYMELLI — Database Schema
-- Run this in the Supabase SQL Editor (project > SQL Editor)
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";


-- ============================================================
-- PROFILES
-- Auto-created when a user signs up via Supabase Auth
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  display_name text,
  created_at  timestamptz not null default now()
);

-- Trigger: create profile automatically on auth.users insert
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ============================================================
-- REFERENCE DATA
-- ============================================================

create table muscle_groups (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique
);

create table equipment (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique
);


-- ============================================================
-- EXERCISES
-- ============================================================

create table exercises (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null unique,
  muscle_group_id uuid not null references muscle_groups (id),
  equipment_id    uuid references equipment (id),
  type            text not null check (type in ('compound', 'isolation')),
  instructions    text,
  created_at      timestamptz not null default now()
);

create index exercises_muscle_group_idx on exercises (muscle_group_id);
create index exercises_equipment_idx on exercises (equipment_id);


-- ============================================================
-- WORKOUT TEMPLATES
-- ============================================================

create table workout_templates (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table workout_template_exercises (
  id            uuid primary key default uuid_generate_v4(),
  template_id   uuid not null references workout_templates (id) on delete cascade,
  exercise_id   uuid not null references exercises (id),
  order_index   integer not null,
  default_sets  integer,
  default_reps  integer,
  rest_seconds  integer,
  unique (template_id, order_index)
);

create index template_exercises_template_idx on workout_template_exercises (template_id);


-- ============================================================
-- WORKOUT SESSIONS
-- ============================================================

create table workout_sessions (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  template_id uuid references workout_templates (id) on delete set null,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  notes       text
);

create index sessions_profile_idx on workout_sessions (profile_id);
create index sessions_started_at_idx on workout_sessions (started_at desc);

create table workout_session_exercises (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid not null references workout_sessions (id) on delete cascade,
  exercise_id  uuid not null references exercises (id),
  order_index  integer not null,
  is_completed boolean not null default false,
  rest_seconds integer,
  unique (session_id, order_index)
);

create index session_exercises_session_idx on workout_session_exercises (session_id);

create table exercise_sets (
  id                   uuid primary key default uuid_generate_v4(),
  session_exercise_id  uuid not null references workout_session_exercises (id) on delete cascade,
  set_number           integer not null,
  weight_kg            numeric(6, 2),
  reps                 integer,
  rpe                  numeric(3, 1) check (rpe >= 1 and rpe <= 10),
  logged_at            timestamptz not null default now(),
  unique (session_exercise_id, set_number)
);

create index sets_session_exercise_idx on exercise_sets (session_exercise_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles                  enable row level security;
alter table workout_templates         enable row level security;
alter table workout_template_exercises enable row level security;
alter table workout_sessions          enable row level security;
alter table workout_session_exercises enable row level security;
alter table exercise_sets             enable row level security;

-- exercises and reference data are readable by all authenticated users
alter table exercises      enable row level security;
alter table muscle_groups  enable row level security;
alter table equipment      enable row level security;

-- profiles: own row only
create policy "profiles: own row" on profiles
  for all using (auth.uid() = id);

-- exercises / reference data: read-only for authenticated users
create policy "exercises: read" on exercises
  for select using (auth.role() = 'authenticated');

create policy "muscle_groups: read" on muscle_groups
  for select using (auth.role() = 'authenticated');

create policy "equipment: read" on equipment
  for select using (auth.role() = 'authenticated');

-- templates: own data only
create policy "templates: own" on workout_templates
  for all using (auth.uid() = profile_id);

create policy "template_exercises: own via template" on workout_template_exercises
  for all using (
    exists (
      select 1 from workout_templates t
      where t.id = template_id and t.profile_id = auth.uid()
    )
  );

-- sessions: own data only
create policy "sessions: own" on workout_sessions
  for all using (auth.uid() = profile_id);

create policy "session_exercises: own via session" on workout_session_exercises
  for all using (
    exists (
      select 1 from workout_sessions s
      where s.id = session_id and s.profile_id = auth.uid()
    )
  );

create policy "sets: own via session_exercise" on exercise_sets
  for all using (
    exists (
      select 1
      from workout_session_exercises se
      join workout_sessions s on s.id = se.session_id
      where se.id = session_exercise_id and s.profile_id = auth.uid()
    )
  );


-- ============================================================
-- SEED: MUSCLE GROUPS
-- ============================================================

insert into muscle_groups (name) values
  ('Chest'),
  ('Back'),
  ('Shoulders'),
  ('Biceps'),
  ('Triceps'),
  ('Forearms'),
  ('Core'),
  ('Glutes'),
  ('Quads'),
  ('Hamstrings'),
  ('Calves');


-- ============================================================
-- SEED: EQUIPMENT
-- ============================================================

insert into equipment (name) values
  ('Barbell'),
  ('Dumbbell'),
  ('Cable'),
  ('Machine'),
  ('Smith Machine'),
  ('Kettlebell'),
  ('Resistance Band'),
  ('Bodyweight');


-- ============================================================
-- SEED: EXERCISES
-- ============================================================

insert into exercises (name, muscle_group_id, equipment_id, type) values
  -- Chest
  ('Bench Press',          (select id from muscle_groups where name = 'Chest'),      (select id from equipment where name = 'Barbell'),   'compound'),
  ('Incline Bench Press',  (select id from muscle_groups where name = 'Chest'),      (select id from equipment where name = 'Barbell'),   'compound'),
  ('Dumbbell Fly',         (select id from muscle_groups where name = 'Chest'),      (select id from equipment where name = 'Dumbbell'),  'isolation'),
  ('Cable Crossover',      (select id from muscle_groups where name = 'Chest'),      (select id from equipment where name = 'Cable'),     'isolation'),
  ('Push-up',              (select id from muscle_groups where name = 'Chest'),      (select id from equipment where name = 'Bodyweight'),'compound'),

  -- Back
  ('Deadlift',             (select id from muscle_groups where name = 'Back'),       (select id from equipment where name = 'Barbell'),   'compound'),
  ('Pull-up',              (select id from muscle_groups where name = 'Back'),       (select id from equipment where name = 'Bodyweight'),'compound'),
  ('Barbell Row',          (select id from muscle_groups where name = 'Back'),       (select id from equipment where name = 'Barbell'),   'compound'),
  ('Lat Pulldown',         (select id from muscle_groups where name = 'Back'),       (select id from equipment where name = 'Cable'),     'compound'),
  ('Seated Cable Row',     (select id from muscle_groups where name = 'Back'),       (select id from equipment where name = 'Cable'),     'compound'),
  ('Single-arm DB Row',    (select id from muscle_groups where name = 'Back'),       (select id from equipment where name = 'Dumbbell'),  'compound'),

  -- Shoulders
  ('Overhead Press',       (select id from muscle_groups where name = 'Shoulders'),  (select id from equipment where name = 'Barbell'),   'compound'),
  ('Dumbbell Shoulder Press',(select id from muscle_groups where name = 'Shoulders'),(select id from equipment where name = 'Dumbbell'),  'compound'),
  ('Lateral Raise',        (select id from muscle_groups where name = 'Shoulders'),  (select id from equipment where name = 'Dumbbell'),  'isolation'),
  ('Face Pull',            (select id from muscle_groups where name = 'Shoulders'),  (select id from equipment where name = 'Cable'),     'isolation'),

  -- Biceps
  ('Barbell Curl',         (select id from muscle_groups where name = 'Biceps'),     (select id from equipment where name = 'Barbell'),   'isolation'),
  ('Dumbbell Curl',        (select id from muscle_groups where name = 'Biceps'),     (select id from equipment where name = 'Dumbbell'),  'isolation'),
  ('Hammer Curl',          (select id from muscle_groups where name = 'Biceps'),     (select id from equipment where name = 'Dumbbell'),  'isolation'),
  ('Cable Curl',           (select id from muscle_groups where name = 'Biceps'),     (select id from equipment where name = 'Cable'),     'isolation'),

  -- Triceps
  ('Tricep Dip',           (select id from muscle_groups where name = 'Triceps'),    (select id from equipment where name = 'Bodyweight'),'compound'),
  ('Skull Crusher',        (select id from muscle_groups where name = 'Triceps'),    (select id from equipment where name = 'Barbell'),   'isolation'),
  ('Cable Pushdown',       (select id from muscle_groups where name = 'Triceps'),    (select id from equipment where name = 'Cable'),     'isolation'),
  ('Overhead Tricep Extension',(select id from muscle_groups where name = 'Triceps'),(select id from equipment where name = 'Dumbbell'), 'isolation'),

  -- Core
  ('Plank',                (select id from muscle_groups where name = 'Core'),       (select id from equipment where name = 'Bodyweight'),'isolation'),
  ('Crunch',               (select id from muscle_groups where name = 'Core'),       (select id from equipment where name = 'Bodyweight'),'isolation'),
  ('Cable Crunch',         (select id from muscle_groups where name = 'Core'),       (select id from equipment where name = 'Cable'),     'isolation'),
  ('Ab Wheel Rollout',     (select id from muscle_groups where name = 'Core'),       (select id from equipment where name = 'Bodyweight'),'isolation'),

  -- Glutes
  ('Hip Thrust',           (select id from muscle_groups where name = 'Glutes'),     (select id from equipment where name = 'Barbell'),   'isolation'),
  ('Romanian Deadlift',    (select id from muscle_groups where name = 'Glutes'),     (select id from equipment where name = 'Barbell'),   'compound'),
  ('Glute Kickback',       (select id from muscle_groups where name = 'Glutes'),     (select id from equipment where name = 'Cable'),     'isolation'),

  -- Quads
  ('Squat',                (select id from muscle_groups where name = 'Quads'),      (select id from equipment where name = 'Barbell'),   'compound'),
  ('Leg Press',            (select id from muscle_groups where name = 'Quads'),      (select id from equipment where name = 'Machine'),   'compound'),
  ('Leg Extension',        (select id from muscle_groups where name = 'Quads'),      (select id from equipment where name = 'Machine'),   'isolation'),
  ('Hack Squat',           (select id from muscle_groups where name = 'Quads'),      (select id from equipment where name = 'Machine'),   'compound'),
  ('Bulgarian Split Squat',(select id from muscle_groups where name = 'Quads'),      (select id from equipment where name = 'Dumbbell'),  'compound'),

  -- Hamstrings
  ('Leg Curl',             (select id from muscle_groups where name = 'Hamstrings'), (select id from equipment where name = 'Machine'),   'isolation'),
  ('Nordic Curl',          (select id from muscle_groups where name = 'Hamstrings'), (select id from equipment where name = 'Bodyweight'),'isolation'),

  -- Calves
  ('Standing Calf Raise',  (select id from muscle_groups where name = 'Calves'),     (select id from equipment where name = 'Machine'),   'isolation'),
  ('Seated Calf Raise',    (select id from muscle_groups where name = 'Calves'),     (select id from equipment where name = 'Machine'),   'isolation');
