insert into storage.buckets (id, name, public)
values ('mj-media', 'mj-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read mj-media" on storage.objects;
create policy "public read mj-media"
on storage.objects
for select
to public
using (bucket_id = 'mj-media');

drop policy if exists "anon upload mj-media" on storage.objects;
create policy "anon upload mj-media"
on storage.objects
for insert
to anon
with check (bucket_id = 'mj-media');

drop policy if exists "anon update mj-media" on storage.objects;
create policy "anon update mj-media"
on storage.objects
for update
to anon
using (bucket_id = 'mj-media')
with check (bucket_id = 'mj-media');

drop policy if exists "anon delete mj-media" on storage.objects;
create policy "anon delete mj-media"
on storage.objects
for delete
to anon
using (bucket_id = 'mj-media');
