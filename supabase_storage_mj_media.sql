insert into storage.buckets (id, name, public)
values ('mj-media', 'mj-media', true)
on conflict (id) do update set public = true;

-- Drop broad default storage policies so we can enforce bucket-scoped auth rules.
drop policy if exists "Allow public insert" on storage.objects;
drop policy if exists "Allow public update" on storage.objects;
drop policy if exists "Allow public delete" on storage.objects;
drop policy if exists "Allow public read" on storage.objects;
drop policy if exists "Allow public uploads wihbqs_0" on storage.objects;
drop policy if exists "Allow public read access wihbqs_0" on storage.objects;

drop policy if exists "public read mj-media" on storage.objects;
create policy "public read mj-media"
on storage.objects
for select
to public
using (bucket_id = 'mj-media');

drop policy if exists "anon upload mj-media" on storage.objects;
drop policy if exists "anon update mj-media" on storage.objects;
drop policy if exists "anon delete mj-media" on storage.objects;

drop policy if exists "auth upload mj-media" on storage.objects;
create policy "auth upload mj-media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "auth update mj-media" on storage.objects;
create policy "auth update mj-media"
on storage.objects
for update
to authenticated
using (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "auth delete mj-media" on storage.objects;
create policy "auth delete mj-media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'mj-media' and (storage.foldername(name))[1] = auth.uid()::text);
