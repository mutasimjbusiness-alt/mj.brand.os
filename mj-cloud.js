/* MJ Brand OS — Cloud layer (Supabase = single source of truth) */
(function (global) {
  const STATE_KEY = 'mj_system_state';

  const MJCloud = {
    _client: null,
    _channel: null,
    ready: false,

    cfg() {
      const c = global.MJ_CONFIG?.supabase;
      return c?.enabled && c.url && c.anonKey ? c : null;
    },

    enabled() { return !!this.cfg(); },

    async init() {
      if (!this.enabled()) return false;
      if (!global.supabase?.createClient) {
        console.error('[MJCloud] Missing @supabase/supabase-js');
        return false;
      }
      const c = this.cfg();
      this._client = global.supabase.createClient(c.url, c.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: global.localStorage
        }
      });
      global.supabaseClient = this.clientAdapter();
      global.SUPABASE_ENABLED = true;

      const { data } = await this._client.auth.getSession();
      this.ready = !!data?.session?.access_token;

      this._client.auth.onAuthStateChange((event, session) => {
        this.ready = !!session?.access_token;
        if (event === 'SIGNED_IN' && session) {
          this._subscribeRealtime();
          if (typeof global.syncFromCloud === 'function') global.syncFromCloud(false);
        }
        if (event === 'SIGNED_OUT') this._unsubscribeRealtime();
      });

      if (this.ready) await this._subscribeRealtime();
      return true;
    },

    async isSignedIn() {
      if (!this._client) return false;
      const { data } = await this._client.auth.getSession();
      return !!data?.session?.access_token;
    },

    async requireAuth() {
      if (!this.enabled()) return false;
      if (!this._client) await this.init();
      if (await this.isSignedIn()) return true;

      return new Promise((resolve) => {
        const el = document.getElementById('modal-cloud-auth');
        if (!el) { resolve(false); return; }
        const emailInp = document.getElementById('cloud-auth-email');
        try {
          const saved = global.localStorage?.getItem('mj_cloud_email');
          if (saved && emailInp && !emailInp.value) emailInp.value = saved;
        } catch (_) {}
        el.classList.add('show');
        el._authResolve = resolve;
        const { data: sub } = this._client.auth.onAuthStateChange((_e, session) => {
          if (session?.access_token) {
            el.classList.remove('show');
            this.ready = true;
            if (el._authResolve) { el._authResolve(true); el._authResolve = null; }
            sub?.subscription?.unsubscribe?.();
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

    async signIn(email, password) {
      const { data, error } = await this._client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.ready = true;
      try { global.localStorage?.setItem('mj_cloud_email', email); } catch (_) {}
      await this._subscribeRealtime();
      return data;
    },

    async signUp(email, password) {
      const { data, error } = await this._client.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) {
        const { error: e2 } = await this._client.auth.signInWithPassword({ email, password });
        if (e2) throw e2;
      }
      this.ready = true;
      try { global.localStorage?.setItem('mj_cloud_email', email); } catch (_) {}
      await this._subscribeRealtime();
      return data;
    },

    async signOut() {
      await this._client?.auth.signOut();
      this.ready = false;
      this._unsubscribeRealtime();
    },

    async saveState(value) {
      if (!this._client) return { ok: false, error: 'no_client' };
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return { ok: false, error: 'not_signed_in' };
      const c = this.cfg();
      const row = {
        user_id: user.id,
        key: STATE_KEY,
        value,
        updated_at: new Date().toISOString()
      };
      const { error } = await this._client
        .from(c.appStateTable)
        .upsert(row, { onConflict: 'user_id,key' });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },

    async loadState() {
      if (!this._client) return { ok: false, error: 'no_client', value: null };
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return { ok: false, error: 'not_signed_in', value: null };
      const c = this.cfg();
      const { data, error } = await this._client
        .from(c.appStateTable)
        .select('value,updated_at')
        .eq('user_id', user.id)
        .eq('key', STATE_KEY)
        .maybeSingle();
      if (error) return { ok: false, error: error.message, value: null };
      return { ok: true, value: data?.value ?? null, updated_at: data?.updated_at };
    },

    async deleteState() {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return;
      const c = this.cfg();
      await this._client.from(c.appStateTable).delete().eq('user_id', user.id).eq('key', STATE_KEY);
    },

    async upload(file, path) {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user || !file) return null;
      const c = this.cfg();
      const storagePath = `${user.id}/${path}`;
      const { error } = await this._client.storage.from(c.bucket).upload(storagePath, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream'
      });
      if (error) {
        global._mjLastUploadError = error.message;
        return null;
      }
      const { data } = this._client.storage.from(c.bucket).getPublicUrl(storagePath);
      return data.publicUrl;
    },

    async _subscribeRealtime() {
      if (!this._client || this._channel) return;
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return;
      const c = this.cfg();
      this._channel = this._client
        .channel(`mj_state_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: c.appStateTable,
          filter: `user_id=eq.${user.id}`
        }, () => {
          if (typeof global.syncFromCloud === 'function') global.syncFromCloud(false);
        })
        .subscribe();
    },

    _unsubscribeRealtime() {
      if (this._channel) {
        this._client?.removeChannel(this._channel);
        this._channel = null;
      }
    },

    storageAdapter() {
      const self = this;
      return {
        from(bucket) {
          return {
            upload: (path, file) => self.upload(file, path).then((url) =>
              url ? { data: { path }, error: null } : { data: null, error: { message: global._mjLastUploadError || 'upload failed' } }
            )
          };
        }
      };
    },

    clientAdapter() {
      return { storage: this.storageAdapter(), from: () => ({ upsert: () => Promise.resolve({ error: null }) }) };
    }
  };

  global.MJCloud = MJCloud;

  global.mjCloudSignIn = async function () {
    const email = document.getElementById('cloud-auth-email')?.value?.trim();
    const pwd = document.getElementById('cloud-auth-password')?.value;
    const err = document.getElementById('cloud-auth-error');
    if (!email || !pwd) { if (err) err.textContent = 'أدخل البريد وكلمة المرور'; return; }
    try {
      await MJCloud.signIn(email, pwd);
      if (err) err.textContent = '';
      MJCloud.resolveAuth(true);
      if (global.syncFromCloud) await global.syncFromCloud(true);
    } catch (e) {
      if (err) err.textContent = e.message || 'فشل تسجيل الدخول';
    }
  };

  global.mjCloudSignUp = async function () {
    const email = document.getElementById('cloud-auth-email')?.value?.trim();
    const pwd = document.getElementById('cloud-auth-password')?.value;
    const err = document.getElementById('cloud-auth-error');
    if (!email || !pwd) { if (err) err.textContent = 'أدخل البريد وكلمة المرور'; return; }
    try {
      await MJCloud.signUp(email, pwd);
      if (err) err.textContent = '';
      MJCloud.resolveAuth(true);
      if (global.syncFromCloud) await global.syncFromCloud(true);
    } catch (e) {
      if (err) err.textContent = e.message || 'فشل إنشاء الحساب';
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
