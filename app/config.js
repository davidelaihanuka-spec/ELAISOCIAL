(function initReelAppConfig(global) {
  const ns = global.REELApp = global.REELApp || {};
  const STORAGE_KEY = 'reel_supabase_config_v1';
  const DEFAULTS = {
    url: '',
    anonKey: '',
    bucket: 'reel-files',
  };

  function readSearchParams() {
    try {
      return new URLSearchParams(global.location.search || '');
    } catch (error) {
      return new URLSearchParams();
    }
  }

  function isLoopbackHost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  }

  function canUseStoredConfig() {
    const params = readSearchParams();
    if (params.get('hosted') === '1') return false;
    if (global.REEL_ALLOW_LOCAL_CONFIG === true) return true;
    const hostname = String(global.location?.hostname || '').toLowerCase();
    const protocol = String(global.location?.protocol || '').toLowerCase();
    return protocol === 'file:' || isLoopbackHost(hostname);
  }

  function readRuntimeOnlyConfig() {
    return {
      ...DEFAULTS,
      ...((global.REEL_APP_CONFIG || global.REEL_ENV || {})),
    };
  }

  function readStoredConfig() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...(parsed || {}) };
    } catch (error) {
      console.warn('Failed to read Supabase config from localStorage', error);
      return { ...DEFAULTS };
    }
  }

  function readEffectiveConfig() {
    const runtimeConfig = readRuntimeOnlyConfig();
    if (runtimeConfig.url && runtimeConfig.anonKey) return runtimeConfig;
    if (!canUseStoredConfig()) return runtimeConfig;
    return {
      ...runtimeConfig,
      ...readStoredConfig(),
    };
  }

  function hasRequiredConfig(config) {
    return Boolean(config?.url && config?.anonKey);
  }

  const configApi = {
    storageKey: STORAGE_KEY,
    get() {
      return readEffectiveConfig();
    },
    getRuntime() {
      return readRuntimeOnlyConfig();
    },
    canConfigureInApp() {
      return canUseStoredConfig();
    },
    hasRuntimeConfig() {
      return hasRequiredConfig(readRuntimeOnlyConfig());
    },
    save(nextConfig) {
      if (!canUseStoredConfig()) {
        throw new Error('Hosted deployments must provide Supabase config through runtime configuration.');
      }
      const merged = { ...DEFAULTS, ...nextConfig };
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    },
    clear() {
      if (!canUseStoredConfig()) return;
      global.localStorage.removeItem(STORAGE_KEY);
    },
    isConfigured() {
      return hasRequiredConfig(readEffectiveConfig());
    },
  };

  ns.config = configApi;
})(window);
