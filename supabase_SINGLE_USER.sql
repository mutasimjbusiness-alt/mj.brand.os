-- MJ Brand OS — SINGLE PERSONAL USER (not multi-tenant SaaS)
-- One Supabase Auth account → one user_id → one row in mj_app_state
-- Run in: https://supabase.com/dashboard/project/iqzzuyprmqsopzkegmoh/sql/new

-- Storage (public read URLs, write only in own folder = auth.uid())
insert into storage.buckets (id, name, public)
values ('mj-media', 'mj-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read mj-media" on storage.objects;
create policy "public read mj-media" on storage.objects
  for select to public using (bucket_id = 'mj-media');

drop policy if exists "auth upload mj-media" on storage.objects;
create policy "auth upload mj-media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "auth update mj-media" on storage.objects;
create policy "auth update mj-media" on storage.objects
  for update to authenticated
  using (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "auth delete mj-media" on storage.objects;
create policy "auth delete mj-media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- Single document per authenticated identity (personal OS state)
drop table if exists public.mj_app_state cascade;

create table public.mj_app_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null default 'mj_system_state',
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.mj_app_state enable row level security;

-- Not multi-user logic: RLS ties rows to THE logged-in identity only
drop policy if exists "owner read state" on public.mj_app_state;
create policy "owner read state" on public.mj_app_state
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "owner insert state" on public.mj_app_state;
create policy "owner insert state" on public.mj_app_state
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "owner update state" on public.mj_app_state;
create policy "owner update state" on public.mj_app_state
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "owner delete state" on public.mj_app_state;
create policy "owner delete state" on public.mj_app_state
  for delete to authenticated using (auth.uid() = user_id);

-- Realtime sync between tabs/devices (optional)
alter publication supabase_realtime add table public.mj_app_state;
