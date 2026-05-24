-- Run AFTER supabase_storage_mj_media.sql
-- Enables Auth + per-user sync. Drops legacy anon-wide table.

drop table if exists public.mj_app_state cascade;

create table public.mj_app_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.mj_app_state enable row level security;

drop policy if exists "users read own state" on public.mj_app_state;
create policy "users read own state" on public.mj_app_state
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "users insert own state" on public.mj_app_state;
create policy "users insert own state" on public.mj_app_state
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users update own state" on public.mj_app_state;
create policy "users update own state" on public.mj_app_state
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own state" on public.mj_app_state;
create policy "users delete own state" on public.mj_app_state
  for delete to authenticated using (auth.uid() = user_id);

-- Storage: authenticated users upload to their folder
drop policy if exists "auth upload mj-media" on storage.objects;
create policy "auth upload mj-media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "auth update mj-media" on storage.objects;
create policy "auth update mj-media" on storage.objects
  for update to authenticated
  using (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "auth delete mj-media" on storage.objects;
create policy "auth delete mj-media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);
