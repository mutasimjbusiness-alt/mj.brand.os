import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const bat = readFileSync('run_migrations.bat', 'utf8');
const sk = bat.match(/SERVICE_ROLE_KEY=("[^"]+"|[^\r\n]+)/)[1].replace(/"/g, '');
const url = 'https://iqzzuyprmqsopzkegmoh.supabase.co';
const anon = readFileSync('config.js', 'utf8').match(/anonKey:\s*'([^']+)'/)[1];

const email = `test-${Date.now()}@mjbrand.test`;
const password = 'TestUpload123!';

const admin = createClient(url, sk);
const { data: created, error: ce } = await admin.auth.admin.createUser({
  email, password, email_confirm: true
});
if (ce) { console.error('create', ce); process.exit(1); }
const uid = created.user.id;
console.log('user', uid);

const client = createClient(url, anon);
const { data: session, error: se } = await client.auth.signInWithPassword({ email, password });
if (se) { console.error('signin', se); process.exit(1); }

const path = `${uid}/avatar/test.png`;
const blob = new Blob(['fake-png'], { type: 'image/png' });
const up = await client.storage.from('mj-media').upload(path, blob, { upsert: true });
console.log('upload', up.error?.message || 'OK');

const st = await client.from('mj_app_state').upsert(
  { user_id: uid, key: 'mj_system_state', value: { ok: true } },
  { onConflict: 'user_id,key' }
);
console.log('state', st.error?.message || 'OK');
