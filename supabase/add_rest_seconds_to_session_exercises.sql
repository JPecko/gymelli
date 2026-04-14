alter table workout_session_exercises
  add column if not exists rest_seconds integer;
