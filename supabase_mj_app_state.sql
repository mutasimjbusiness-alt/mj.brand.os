create table if not exists public.mj_app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.mj_app_state enable row level security;

drop policy if exists "allow anon read mj_app_state" on public.mj_app_state;
create policy "allow anon read mj_app_state"
on public.mj_app_state
for select
to anon
using (true);

drop policy if exists "allow anon insert mj_app_state" on public.mj_app_state;
create policy "allow anon insert mj_app_state"
on public.mj_app_state
for insert
to anon
with check (true);

drop policy if exists "allow anon update mj_app_state" on public.mj_app_state;
create policy "allow anon update mj_app_state"
on public.mj_app_state
for update
to anon
using (true)
with check (true);

drop policy if exists "allow anon delete mj_app_state" on public.mj_app_state;
create policy "allow anon delete mj_app_state"
on public.mj_app_state
for delete
to anon
using (true);
