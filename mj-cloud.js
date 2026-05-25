/* MJ Brand OS — Personal single-user cloud (Supabase = sole source of truth) */
(function (global) {
  const MJCloud = {
    _client: null,
    _channel: null,
    ready: false,

    cfg() {
      const c = global.MJ_CONFIG?.supabase;
      return c?.enabled && c.url && c.anonKey ? c : null;
    },

    stateKey() {
      return this.cfg()?.stateKey || 'mj_system_state';
    },

    ownerEmail() {
      return (this.cfg()?.ownerEmail || '').trim().toLowerCase();
    },

    enabled() { return !!this.cfg(); },

    _prefillOwnerEmail() {
      const owner = this.ownerEmail();
      const inp = document.getElementById('cloud-auth-email');
      if (inp && owner) {
        inp.value = owner;
        inp.readOnly = true;
      }
    },

    async _assertOwnerAccount() {
      const owner = this.ownerEmail();
      if (!owner) return true;
      const { data: { user } } = await this._client.auth.getUser();
      if (!user?.email) return false;
      if (user.email.toLowerCase() !== owner) {
        await this._client.auth.signOut();
        this.ready = false;
        throw new Error('هذا الحساب غير مسموح. استخدم البريد الشخصي المعرّف في config.js');
      }
      return true;
    },

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
      if (this.ready) {
        try { await this._assertOwnerAccount(); } catch (e) { console.warn(e.message); this.ready = false; }
      }

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
      this._prefillOwnerEmail();
      if (await this.isSignedIn()) {
        try {
          await this._assertOwnerAccount();
          return true;
        } catch (e) {
          const err = document.getElementById('cloud-auth-error');
          if (err) err.textContent = e.message;
        }
      }

      return new Promise((resolve) => {
        const el = document.getElementById('modal-cloud-auth');
        if (!el) { resolve(false); return; }
        this._prefillOwnerEmail();
        el.classList.add('show');
        el._authResolve = resolve;
        const { data: sub } = this._client.auth.onAuthStateChange(async (_e, session) => {
          if (session?.access_token) {
            try {
              await this._assertOwnerAccount();
              el.classList.remove('show');
              this.ready = true;
              if (el._authResolve) { el._authResolve(true); el._authResolve = null; }
              sub?.subscription?.unsubscribe?.();
            } catch (ex) {
              const err = document.getElementById('cloud-auth-error');
              if (err) err.textContent = ex.message;
            }
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
      const owner = this.ownerEmail();
      if (owner && email.trim().toLowerCase() !== owner) {
        throw new Error('استخدم البريد الشخصي فقط: ' + this.cfg().ownerEmail);
      }
      const { data, error } = await this._client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await this._assertOwnerAccount();
      this.ready = true;
      await this._subscribeRealtime();
      return data;
    },

    async signOut() {
      await this._client?.auth.signOut();
      this.ready = false;
      this._unsubscribeRealtime();
    },

    async saveState(value) {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return { ok: false, error: 'not_signed_in' };
      const c = this.cfg();
      const row = {
        user_id: user.id,
        key: this.stateKey(),
        value,
        updated_at: new Date().toISOString()
      };
      const { error } = await this._client.from(c.appStateTable).upsert(row, { onConflict: 'user_id,key' });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },

    async loadState() {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return { ok: false, error: 'not_signed_in', value: null };
      const c = this.cfg();
      const { data, error } = await this._client
        .from(c.appStateTable)
        .select('value,updated_at')
        .eq('user_id', user.id)
        .eq('key', this.stateKey())
        .maybeSingle();
      if (error) return { ok: false, error: error.message, value: null };
      return { ok: true, value: data?.value ?? null };
    },

    async deleteState() {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return;
      const c = this.cfg();
      await this._client.from(c.appStateTable).delete().eq('user_id', user.id).eq('key', this.stateKey());
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
      return this._client.storage.from(c.bucket).getPublicUrl(storagePath).data.publicUrl;
    },

    async _subscribeRealtime() {
      if (!this._client || this._channel) return;
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return;
      const c = this.cfg();
      this._channel = this._client
        .channel('mj_personal_state')
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
    if (!email || !pwd) { if (err) err.textContent = 'أدخل كلمة المرور'; return; }
    try {
      await MJCloud.signIn(email, pwd);
      if (err) err.textContent = '';
      MJCloud.resolveAuth(true);
      if (global.syncFromCloud) await global.syncFromCloud(true);
    } catch (e) {
      if (err) err.textContent = e.message || 'فشل تسجيل الدخول';
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
