(function initReelSupabase(global) {
  const ns = global.REELApp = global.REELApp || {};

  const service = {
    client: null,
    configSnapshot: null,
    async init() {
      if (!global.supabase || typeof global.supabase.createClient !== 'function') {
        throw new Error('Supabase client library was not loaded.');
      }
      const cfg = ns.config.get();
      if (!cfg.url || !cfg.anonKey) {
        this.client = null;
        this.configSnapshot = cfg;
        return null;
      }
      if (
        this.client &&
        this.configSnapshot &&
        this.configSnapshot.url === cfg.url &&
        this.configSnapshot.anonKey === cfg.anonKey
      ) {
        return this.client;
      }
      this.configSnapshot = cfg;
      this.client = global.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return this.client;
    },
    getClient() {
      return this.client;
    },
    hasClient() {
      return Boolean(this.client);
    },
    getBucket() {
      return (ns.config.get().bucket || 'reel-files').trim();
    },
  };

  ns.supabase = service;
})(window);
