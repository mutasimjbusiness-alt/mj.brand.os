-- DEPRECATED: use supabase_mj_app_state_auth.sql for per-user sync with Auth.
-- This legacy anon-wide table is kept only for reference.

create table if not exists public.mj_app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
