/**
 * Usage: set SUPABASE_EMAIL and SUPABASE_PASSWORD, then node scripts/get-supabase-access-token.js
 */
import { readFileSync } from 'fs';

const email = process.env.SUPABASE_EMAIL;
const password = process.env.SUPABASE_PASSWORD;
if (!email || !password) {
  console.error('Set SUPABASE_EMAIL and SUPABASE_PASSWORD environment variables.');
  process.exit(1);
}

const configText = readFileSync('config.js', 'utf8');
const anonKey = configText.match(/anonKey:\s*'([^']+)'/)[1];
const projectUrl = configText.match(/url:\s*'([^']+)'/)[1];

const res = await fetch(`${projectUrl}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: anonKey },
  body: JSON.stringify({ email, password })
});
const data = await res.json();
if (!res.ok) throw new Error(JSON.stringify(data));
console.log(data.access_token);
