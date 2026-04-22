(function initReelClientModel(global) {
  const ns = global.REELApp = global.REELApp || {};

  function getClientStore() {
    return typeof clientData !== 'undefined' ? clientData : (global.clientData || {});
  }

  function getProjectsStore() {
    return typeof projects !== 'undefined' ? projects : (global.projects || []);
  }

  function getScriptsStore() {
    return typeof scriptsData !== 'undefined' ? scriptsData : (global.scriptsData || []);
  }

  function getShootDaysStore() {
    return typeof shootDaysData !== 'undefined' ? shootDaysData : (global.shootDaysData || []);
  }

  function getActivityStore() {
    return typeof activityLog !== 'undefined' ? activityLog : (global.activityLog || []);
  }

  function generateId() {
    if (typeof global.genId === 'function') return global.genId();
    return `client_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  function listClients() {
    const store = getClientStore();
    return Object.entries(store).map(([name, data]) => ({
      name,
      id: data?.id || null,
      data: data || {},
    })).sort((a, b) => a.name.localeCompare(b.name, 'he'));
  }

  function listClientNames() {
    return listClients().map((entry) => entry.name);
  }

  function findClientNameById(id) {
    if (!id) return '';
    const match = listClients().find((entry) => entry.id === id);
    return match?.name || '';
  }

  function findClientById(id) {
    const name = findClientNameById(id);
    if (!name) return null;
    return { name, data: getClientStore()[name] || {} };
  }

  function ensureClientRecord(name, extra) {
    const nextName = String(name || '').trim();
    if (!nextName) return null;
    const store = getClientStore();
    if (!store[nextName]) store[nextName] = {};
    if (!store[nextName].id) store[nextName].id = generateId();
    if (extra && typeof extra === 'object') {
      store[nextName] = { ...store[nextName], ...extra, id: store[nextName].id };
    }
    return { name: nextName, id: store[nextName].id, data: store[nextName] };
  }

  function renameReferences(clientId, oldName, newName) {
    let projectDirty = false;
    let scriptDirty = false;
    let shootDayDirty = false;
    let activityDirty = false;

    getProjectsStore().forEach((project) => {
      if (project.clientId === clientId || project.client === oldName) {
        project.clientId = clientId;
        project.client = newName;
        projectDirty = true;
      }
    });

    getScriptsStore().forEach((script) => {
      if (script.clientId === clientId || script.client === oldName) {
        script.clientId = clientId;
        script.client = newName;
        scriptDirty = true;
      }
    });

    getShootDaysStore().forEach((item) => {
      if (item.clientId === clientId || item.client_name === oldName || item.client === oldName) {
        item.clientId = clientId;
        item.client_name = newName;
        if ('client' in item) item.client = newName;
        shootDayDirty = true;
      }
    });

    getActivityStore().forEach((entry) => {
      if (entry.client === oldName) {
        entry.client = newName;
        activityDirty = true;
      }
    });

    if (projectDirty) global.save?.();
    if (scriptDirty) global._saveSC?.();
    if (shootDayDirty) global.saveShootDaysStore?.();
    if (activityDirty) global._saveLog?.();
  }

  function upsertClient(payload) {
    const store = getClientStore();
    const nextName = String(payload?.name || '').trim();
    if (!nextName) return null;

    const explicitId = payload?.id || null;
    const existingNameById = explicitId ? findClientNameById(explicitId) : '';
    const existingName = existingNameById || (store[nextName] ? nextName : '');
    const base = existingName ? (store[existingName] || {}) : {};
    const id = explicitId || base.id || store[nextName]?.id || generateId();

    store[nextName] = {
      ...base,
      ...(store[nextName] || {}),
      ...payload,
      id,
    };

    if (existingName && existingName !== nextName) {
      delete store[existingName];
      renameReferences(id, existingName, nextName);
    }

    return { name: nextName, id, data: store[nextName] };
  }

  function normalizeAll() {
    const store = getClientStore();
    let clientDirty = false;
    let projectDirty = false;
    let scriptDirty = false;
    let shootDayDirty = false;

    Object.keys(store).forEach((name) => {
      if (!store[name]?.id) {
        store[name] = { ...(store[name] || {}), id: generateId() };
        clientDirty = true;
      }
    });

    getProjectsStore().forEach((project) => {
      if (project.clientId) {
        const nameFromId = findClientNameById(project.clientId);
        if (nameFromId && project.client !== nameFromId) {
          project.client = nameFromId;
          projectDirty = true;
        } else if (!nameFromId && project.client) {
          store[project.client] = { ...(store[project.client] || {}), id: project.clientId };
          clientDirty = true;
        }
      } else if (project.client) {
        const ensured = ensureClientRecord(project.client);
        project.clientId = ensured.id;
        project.client = ensured.name;
        clientDirty = true;
        projectDirty = true;
      }
    });

    getScriptsStore().forEach((script) => {
      if (script.clientId) {
        const nameFromId = findClientNameById(script.clientId);
        if (nameFromId && script.client !== nameFromId) {
          script.client = nameFromId;
          scriptDirty = true;
        } else if (!nameFromId && script.client) {
          store[script.client] = { ...(store[script.client] || {}), id: script.clientId };
          clientDirty = true;
        }
      } else if (script.client) {
        const ensured = ensureClientRecord(script.client);
        script.clientId = ensured.id;
        script.client = ensured.name;
        clientDirty = true;
        scriptDirty = true;
      }
    });

    getShootDaysStore().forEach((item) => {
      const legacyName = item.client_name || item.client || '';
      if (item.clientId) {
        const nameFromId = findClientNameById(item.clientId);
        if (nameFromId && item.client_name !== nameFromId) {
          item.client_name = nameFromId;
          if ('client' in item) item.client = nameFromId;
          shootDayDirty = true;
        }
      } else if (legacyName) {
        const ensured = ensureClientRecord(legacyName);
        item.clientId = ensured.id;
        item.client_name = ensured.name;
        if ('client' in item) item.client = ensured.name;
        clientDirty = true;
        shootDayDirty = true;
      }
    });

    if (clientDirty) global.saveClients?.();
    if (projectDirty) global.save?.();
    if (scriptDirty) global._saveSC?.();
    if (shootDayDirty) global.saveShootDaysStore?.();

    return { clientDirty, projectDirty, scriptDirty, shootDayDirty };
  }

  function patchLegacyApi() {
    global.ensureClientId = function ensureClientIdPatched(name) {
      return ensureClientRecord(name)?.id || null;
    };

    global.getClientNameById = findClientNameById;

    global.updateFcList = function updateFcListPatched() {
      const dl = global.document.getElementById('fc-list');
      if (!dl) return;
      dl.innerHTML = listClientNames().map((name) => `<option value="${name}">`).join('');
    };

    global._getClientNames = function getClientNamesPatched() {
      return listClientNames();
    };

    if (typeof global.saveClientData === 'function' && !global.saveClientData.__clientModelPatched) {
      global.saveClientData = function saveClientDataPatched() {
        const newName = global.document.getElementById('cp-name-input').value.trim();
        if (!newName) { global.toast?.('נא להזין שם לקוח'); return; }

        const info = {
          phone: global.document.getElementById('cp-phone').value.trim(),
          email: global.document.getElementById('cp-email').value.trim(),
          website: global.document.getElementById('cp-website').value.trim(),
          address: global.document.getElementById('cp-address').value.trim(),
          contact: global.document.getElementById('cp-contact').value.trim(),
          notes: global.document.getElementById('cp-notes').value.trim(),
        };

        const previousName = typeof activeClientName !== 'undefined' ? activeClientName : '';
        const previousRecord = previousName ? ensureClientRecord(previousName) : null;
        const nextRecord = upsertClient({ id: previousRecord?.id, name: newName, ...info });
        normalizeAll();
        global.saveClients?.();
        if (typeof activeClientName !== 'undefined') activeClientName = nextRecord.name;
        global.syncAll?.();
        global.renderClients?.();
        global.renderCalendar?.();
        global.closeClientPanel?.();
        global.toast?.('פרטי לקוח נשמרו!');
      };
      global.saveClientData.__clientModelPatched = true;
    }

    if (typeof global.saveNewClientFromModal === 'function' && !global.saveNewClientFromModal.__clientModelPatched) {
      global.saveNewClientFromModal = function saveNewClientFromModalPatched() {
        const name = global.document.getElementById('new-client-name')?.value.trim();
        if (!name) {
          global.toast?.('נא להזין שם לקוח');
          return;
        }

        if (getClientStore()?.[name]) {
          global.toast?.('לקוח בשם הזה כבר קיים');
          global.goView?.('clients');
          global.closeNewClientModal?.();
          global.setTimeout(() => global.openClientPanel?.(name), 120);
          return;
        }

        upsertClient({
          name,
          phone: global.document.getElementById('new-client-phone')?.value.trim() || '',
          email: global.document.getElementById('new-client-email')?.value.trim() || '',
          website: global.document.getElementById('new-client-website')?.value.trim() || '',
          address: global.document.getElementById('new-client-address')?.value.trim() || '',
          contact: global.document.getElementById('new-client-contact')?.value.trim() || '',
          notes: global.document.getElementById('new-client-notes')?.value.trim() || '',
          created_at: new Date().toISOString(),
        });
        normalizeAll();
        global.saveClients?.();
        global.renderClients?.();
        global.renderCalendar?.();
        global.syncAll?.();
        global.closeNewClientModal?.();
        global.goView?.('clients');
        global.setTimeout(() => global.openClientPanel?.(name), 140);
        global.toast?.('לקוח חדש נוסף');
      };
      global.saveNewClientFromModal.__clientModelPatched = true;
    }

    if (typeof global._collectAndSaveScript === 'function' && !global._collectAndSaveScript.__clientModelPatched) {
      const originalCollect = global._collectAndSaveScript;
      global._collectAndSaveScript = function collectAndSaveScriptPatched() {
        const result = originalCollect.apply(this, arguments);
        if (result) normalizeAll();
        return result;
      };
      global._collectAndSaveScript.__clientModelPatched = true;
    }
  }

  ns.clientModel = {
    listClients,
    listClientNames,
    findClientById,
    findClientNameById,
    ensureClientRecord,
    upsertClient,
    normalizeAll,
    patchLegacyApi,
  };

  global.document.addEventListener('DOMContentLoaded', () => {
    patchLegacyApi();
    normalizeAll();
  });
})(window);
