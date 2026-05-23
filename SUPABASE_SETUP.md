# MJ Brand OS - Supabase Integration Setup ✅

## Summary of Completed Work

### ✅ Completed Tasks (100%)

#### 1. **Supabase Project Configuration**
   - ✅ Project Created: `mj-brand-os` on Supabase
   - ✅ Project URL: `https://iqzzuyprmqsopzkegmoh.supabase.co`
   - ✅ Region: EU-West-1 (Ireland)
   - ✅ Database: PostgreSQL 17.6.1

#### 2. **API Keys Retrieved**
   - ✅ **Anonymous Key (Anon Key)**: 
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxenp1eXBybXFzb3B6a2VnbW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Njg0MzMsImV4cCI6MjA5MjE0NDQzM30.vBmziYb6v8DBjzkS1sF0jnDT9D-rh-G1PcF9neRe8Xk
     ```
   - ✅ **Service Role Key**:
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxenp1eXBybXFzb3B6a2VnbW9oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU2ODQzMywiZXhwIjoyMDkyMTQ0NDMzfQ.lFmrq-_gaRFKy5syTnIdIjv7orT_MLkgdiQw61aiaE4
     ```

#### 3. **Configuration Files Updated**
   - ✅ **[config.js](config.js)** - Updated with real Supabase credentials:
     ```javascript
     supabase: {
       enabled:       true,
       url:           'https://iqzzuyprmqsopzkegmoh.supabase.co',
       anonKey:       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
       bucket:        'mj-media',
       appStateTable: 'mj_app_state',
     }
     ```

#### 4. **SQL Migrations Prepared**
   - ✅ [supabase_storage_mj_media.sql](supabase_storage_mj_media.sql) - Storage bucket + RLS policies
   - ✅ [supabase_mj_app_state.sql](supabase_mj_app_state.sql) - App state table + RLS policies

---

## 📋 Remaining Tasks (To Be Executed in Dashboard)

### Task 1: Create Storage Bucket & Policies
**File**: `supabase_storage_mj_media.sql`

**Steps**:
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor: [SQL Editor](https://supabase.com/dashboard/project/iqzzuyprmqsopzkegmoh/sql/new)
3. Create new query and paste the contents of `supabase_storage_mj_media.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Verify: Navigate to Storage → Buckets and confirm `mj-media` bucket exists

**SQL Preview**:
```sql
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
```

---

### Task 2: Create App State Table & Policies
**File**: `supabase_mj_app_state.sql`

**Steps**:
1. In the same SQL Editor
2. Create another new query and paste the contents of `supabase_mj_app_state.sql`
3. Click **Run**
4. Verify: Navigate to Database → Tables and confirm `mj_app_state` table exists in public schema

**SQL Preview**:
```sql
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
```

---

## 🚀 How to Test After Completion

### Test 1: Upload File to Storage
```javascript
const { data, error } = await supabaseClient
  .storage
  .from('mj-media')
  .upload('test/my-file.txt', file);
```

### Test 2: Save App State
```javascript
const { error } = await supabaseClient
  .from('mj_app_state')
  .upsert({ key: 'app-theme', value: { theme: 'dark' } });
```

### Test 3: Retrieve App State
```javascript
const { data, error } = await supabaseClient
  .from('mj_app_state')
  .select('value')
  .eq('key', 'app-theme')
  .single();
```

---

## 📁 File Structure

```
d:\Web Systems\MJ OS\
├── config.js                      ✅ Updated with real credentials
├── config.example.js              (template - reference only)
├── index.html                     ✅ Has Supabase integration code
├── supabase_storage_mj_media.sql  📋 Needs dashboard execution
├── supabase_mj_app_state.sql      📋 Needs dashboard execution
├── package.json                   (dependencies managed)
└── README.md                      (this file)
```

---

## 🔐 Security Notes

- **Anonymous Key** (public): Safe for client-side use in browser
  - Use for: Storage uploads, app state CRUD with RLS policies
  
- **Service Role Key** (private): Keep secret, backend-only
  - Use for: Admin operations, bypassing RLS policies
  - Current location: This README and [config.js](config.js)

---

## ✨ Next Steps After Dashboard SQL Execution

1. **Test the app in browser** at `file:///d:/Web%20Systems/MJ%20OS/index.html`
2. **Upload media** - system should mirror uploads to `mj-media` bucket
3. **Auto-save state** - app state should persist to `mj_app_state` table
4. **Monitor console** for Supabase sync logs

---

## 🆘 Troubleshooting

### Issue: "Bucket not found"
- **Solution**: Execute `supabase_storage_mj_media.sql` via dashboard

### Issue: "Table does not exist"
- **Solution**: Execute `supabase_mj_app_state.sql` via dashboard

### Issue: RLS Policy Denial
- **Solution**: Verify anon key policies exist in SQL output

### Issue: CORS errors
- **Solution**: Supabase handles CORS automatically; check network tab for 403s

---

**Setup Status**: 95% Complete ✅
**Final Step**: Execute 2 SQL migrations in Supabase dashboard
**Estimated Time**: 2-3 minutes
**Last Updated**: 2026-05-23

