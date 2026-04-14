-- ============================================================
-- APP CONFIG
-- Generic key/value store for app-level settings.
-- Publicly readable (no auth required) — version check runs before login.
-- ============================================================

create table if not exists app_config (
  key    text primary key,
  value  text not null
);

-- Seed with current version (update via scripts/sync-version.mjs on deploy)
insert into app_config (key, value)
values ('app_version', '0.0.0')
on conflict (key) do nothing;

-- Allow anonymous reads (version check runs before auth)
alter table app_config enable row level security;

create policy "Public read app_config"
  on app_config for select
  using (true);
