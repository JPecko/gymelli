alter table workout_sessions
  add column if not exists pr_count integer not null default 0;
