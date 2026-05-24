/* MJ Brand OS — Supabase cloud sync (Auth + DB + Storage) */
(function (global) {
  const STATE_KEY = 'mj_system_state';

  const MJCloud = {
    _client: null,
    ready: false,

    cfg() {
      const c = global.MJ_CONFIG?.supabase;
      return c?.enabled && c.url && c.anonKey ? c : null;
    },

    enabled() { return !!this.cfg(); },

    async userId() {
      if (!this._client) return null;
      try {
        const { data } = await this._client.auth.getUser();
        return data?.user?.id || null;
      } catch (_) {
        return null;
      }
    },

    async init() {
      if (!this.enabled()) return false;
      const c = this.cfg();
      if (!global.supabase || !global.supabase.createClient) {
        console.warn('Supabase JS not found. Include @supabase/supabase-js before mj-cloud.js');
        return false;
      }
      this._client = global.supabase.createClient(c.url, c.anonKey, { auth: { persistSession: true } });
      global.supabaseClient = this.clientAdapter();
      global.SUPABASE_ENABLED = true;
      // keep ready state in sync with auth changes
      if (this._client.auth && this._client.auth.onAuthStateChange) {
        this._client.auth.onAuthStateChange((event, session) => {
          this.ready = !!session?.access_token;
        });
      }
      // try to load current session
      try {
        const s = await this._client.auth.getSession();
        this.ready = !!s?.data?.session?.access_token;
      } catch (_) {}
      return true;
    },

    async signIn(email, password) {
      if (!this._client) throw new Error('Supabase client not initialized');
      const { data, error } = await this._client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.ready = !!data?.session?.access_token;
      return data;
    },

    async signUp(email, password) {
      if (!this._client) throw new Error('Supabase client not initialized');
      const { data, error } = await this._client.auth.signUp({ email, password });
      if (error) throw error;
      // if signed in automatically, set ready
      this.ready = !!data?.session?.access_token;
      return data;
    },

    async signOut() {
      if (!this._client) return;
      await this._client.auth.signOut();
      this.ready = false;
    },

    async ensureAuth() {
      if (!this.enabled()) return false;
      // if already signed in, resolve true
      try {
        const s = await this._client.auth.getSession();
        if (s?.data?.session?.access_token) { this.ready = true; return true; }
      } catch (_) {}

      return new Promise((resolve) => {
        const el = document.getElementById('modal-cloud-auth');
        if (!el) { resolve(false); return; }
        el.classList.add('show');
        el._authResolve = resolve;
        // listen once for auth state change
        const remove = this._client.auth.onAuthStateChange((event, session) => {
          if (session?.access_token) {
            el.classList.remove('show');
            this.ready = true;
            if (el._authResolve) { el._authResolve(true); el._authResolve = null; }
            remove?.data?.subscription?.unsubscribe?.();
          }
        });
      });
    },

    resolveAuth(ok) {
      const el = document.getElementById('modal-cloud-auth');
      if (el) el.classList.remove('show');
      this.ready = !!ok;
      if (el?._authResolve) { el._authResolve(!!ok); el._authResolve = null; }
    },

    async upsertState(value) {
      if (!this._client) return { ok: false, error: 'No client' };
      const uid = (await this._client.auth.getUser()).data?.user?.id;
      if (!uid) return { ok: false, error: 'Not signed in' };
      const c = this.cfg();
      const row = { user_id: uid, key: STATE_KEY, value, updated_at: new Date().toISOString() };
      const { data, error } = await this._client.from(c.appStateTable).upsert(row, { onConflict: ['user_id', 'key'] });
      if (error) return { ok: false, error: error.message || error.toString() };
      return { ok: true, data };
    },

    async loadState() {
      if (!this._client) return null;
      const uid = (await this._client.auth.getUser()).data?.user?.id;
      if (!uid) return null;
      const c = this.cfg();
      const { data, error } = await this._client.from(c.appStateTable).select('value').eq('user_id', uid).eq('key', STATE_KEY).maybeSingle();
      if (error) return null;
      return data?.value || null;
    },

    async upload(file, path) {
      if (!this._client) return null;
      const uid = (await this._client.auth.getUser()).data?.user?.id;
      if (!uid || !file) return null;
      const c = this.cfg();
      const storagePath = uid + '/' + path;
      const { error } = await this._client.storage.from(c.bucket).upload(storagePath, file, { upsert: true });
      if (error) { console.warn('Storage upload failed', error); return null; }
      const { data } = this._client.storage.from(c.bucket).getPublicUrl(storagePath);
      return data?.publicUrl || (c.url + '/storage/v1/object/public/' + c.bucket + '/' + storagePath);
    },

    storageAdapter() {
      const self = this;
      return {
        from(bucket) {
          return {
            async upload(path, file) {
              const c = self.cfg();
              if (bucket !== c.bucket) return { data: null, error: { message: 'bad bucket' } };
              const publicUrl = await self.upload(file, path);
              return publicUrl ? { data: { path }, error: null } : { data: null, error: { message: 'upload failed' } };
            },
            getPublicUrl(path) {
              const c = self.cfg();
              const uid = null; // public url builder uses stored path
              const p = path;
              return { data: { publicUrl: c.url + '/storage/v1/object/public/' + c.bucket + '/' + p } };
            }
          };
        }
      };
    },

    clientAdapter() {
      const self = this;
      return {
        storage: self.storageAdapter(),
        from(table) {
          return {
            upsert: async (data) => {
              // legacy compatibility: expect data.value -> upsert state
              const val = data?.value ?? data;
              const r = await self.upsertState(val);
              return { data: r.ok ? data : null, error: r.ok ? null : r.error };
            }
          };
        }
      };
    }
  };

  global.MJCloud = MJCloud;

  global.mjCloudSignIn = async function () {
    const email = document.getElementById('cloud-auth-email')?.value?.trim();
    const pwd = document.getElementById('cloud-auth-password')?.value;
    const err = document.getElementById('cloud-auth-error');
    if (!email || !pwd) { if (err) err.textContent = 'Email and password required'; return; }
    try {
      await MJCloud.signIn(email, pwd);
      if (err) err.textContent = '';
      MJCloud.resolveAuth(true);
    } catch (e) {
      if (err) err.textContent = e.message || 'Sign in failed';
    }
  };

  global.mjCloudSignUp = async function () {
    const email = document.getElementById('cloud-auth-email')?.value?.trim();
    const pwd = document.getElementById('cloud-auth-password')?.value;
    const err = document.getElementById('cloud-auth-error');
    if (!email || !pwd) { if (err) err.textContent = 'Email and password required'; return; }
    try {
      await MJCloud.signUp(email, pwd);
      if (err) err.textContent = '';
      MJCloud.resolveAuth(true);
    } catch (e) {
      if (err) err.textContent = e.message || 'Sign up failed';
    }
  };

})(typeof window !== 'undefined' ? window : globalThis);
