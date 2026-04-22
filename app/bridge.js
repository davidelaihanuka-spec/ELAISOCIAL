(function initReelBridge(global) {
  const ns = global.REELApp = global.REELApp || {};
  let syncTimer = null;
  let pipelineUiBound = false;

  function nowIso() { return new Date().toISOString(); }

  function writeLegacyStore(name, value) {
    if (typeof global.setLegacyStoreValue === 'function') {
      global.setLegacyStoreValue(name, value);
      return;
    }
    global[name] = value;
  }

  function ensureClientId(name) {
    if (!name) return null;
    if (!global.clientData[name]) global.clientData[name] = {};
    if (!global.clientData[name].id && typeof global.genId === 'function') global.clientData[name].id = global.genId();
    return global.clientData[name].id || name;
  }

  function readLocalLegacyState() {
    function parse(key, fallback) {
      try { return JSON.parse(global.localStorage.getItem(key) || JSON.stringify(fallback)); }
      catch (error) { return fallback; }
    }
    return {
      projects: parse('reel_projects', []),
      clients: parse('reel_clients', {}),
      scripts: parse('reel_scripts', []),
      tasks: parse('reel_tasks', []),
      tracking: parse('reel_tracking', []),
      archive: parse('reel_archive', []),
      trash: parse('reel_trash', []),
      activity: parse('reel_activity', []),
      shootDays: parse('reel_shoot_days', []),
    };
  }

  function readLegacyTasksState() {
    if (Array.isArray(global.reelTasksData)) return [...global.reelTasksData];
    const tasks = readLocalLegacyState().tasks;
    global.reelTasksData = [...tasks];
    return tasks;
  }

  function buildCanonicalFromLegacy() {
    const projects = global.projects || [];
    const clientMap = global.clientData || {};
    const scripts = global.scriptsData || [];
    const tasks = readLegacyTasksState();
    const tracking = global.trackingData || [];
    const archive = global.archiveData || [];
    const trash = global.trashData || [];
    const activity = global.activityLog || [];
    const shootDays = global.shootDaysData || [];

    const clients = Object.entries(clientMap).map(([name, data]) => ({
      id: ensureClientId(name),
      name,
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      address: data.address || '',
      contact_name: data.contact || '',
      notes: data.notes || '',
      receipt_sent: Boolean(data.receiptSent),
      created_at: data.created_at || nowIso(),
      updated_at: nowIso(),
    }));

    const packages = Object.entries(clientMap).filter(([, data]) => data.package && (data.package.total || data.package.price || data.package.name)).map(([name, data]) => {
      const clientId = ensureClientId(name);
      const pkgId = data.package.id || `pkg_${clientId}`;
      data.package.id = pkgId;
      return {
        id: pkgId,
        client_id: clientId,
        name: data.package.name || '',
        total_videos: +data.package.total || 0,
        price: +data.package.price || 0,
        start_date: data.package.start || null,
        end_date: data.package.end || null,
        payment_status: data.package.paid || 'unpaid',
        paid_amount: +data.package.paidAmount || 0,
        receipt_sent: Boolean(data.receiptSent),
        notes: data.package.notes || '',
        created_at: data.package.created_at || nowIso(),
        updated_at: nowIso(),
      };
    });

    const projectsCanonical = projects.map((project) => ({
      id: project.id,
      client_id: project.clientId || ensureClientId(project.client || ''),
      client_name: project.client || '',
      name: project.name || '',
      type: project.type || 'reel',
      stage: project.stage || 'script',
      deadline: project.deadline || null,
      price: +project.price || 0,
      payment_status: project.paid || 'unpaid',
      paid_amount: +project.paidAmount || 0,
      notes: project.notes || '',
      drive_url: project.drive || '',
      progress: +project.progress || 0,
      is_archived: false,
      archived_at: null,
      is_part_of_package: Boolean(project.isPartOfPackage),
      package_slot: project.vidNum || null,
      files: project.files || [],
      created_at: project.createdAt ? new Date(project.createdAt).toISOString() : nowIso(),
      updated_at: nowIso(),
    }));

    const scriptsCanonical = scripts.map((script) => ({
      id: script.id,
      client_id: script.client ? ensureClientId(script.client) : null,
      project_id: script.projectId || null,
      client_name: script.client || '',
      title: script.title || '',
      status: script.status || 'draft',
      shoot_date: script.shootDate || null,
      scene: script.scene || '',
      voiceover: script.voiceover || '',
      camera: script.camera || '',
      edit_notes: script.editNotes || '',
      created_at: script.createdAt ? new Date(script.createdAt).toISOString() : nowIso(),
      updated_at: nowIso(),
    }));

    const paymentEntries = [];
    projects.forEach((project) => {
      (project.paymentHistory || []).forEach((entry, index) => {
        paymentEntries.push({
          id: entry.id || `pay_proj_${project.id}_${index}`,
          client_id: project.clientId || ensureClientId(project.client || ''),
          project_id: project.id,
          package_id: null,
          amount: +entry.amount || 0,
          paid_at: entry.date || null,
          method: entry.method || '',
          note: entry.note || '',
          receipt: entry.receipt || null,
          receipt_name: entry.receipt_name || `receipt-${project.id}-${index}`,
          receipt_type: entry.receipt_type || '',
          created_at: entry.created_at || nowIso(),
        });
      });
    });
    Object.entries(clientMap).forEach(([name, data]) => {
      if (!data.package || !data.package.paymentHistory) return;
      const pkgId = data.package.id || `pkg_${ensureClientId(name)}`;
      data.package.paymentHistory.forEach((entry, index) => {
        paymentEntries.push({
          id: entry.id || `pay_pkg_${pkgId}_${index}`,
          client_id: ensureClientId(name),
          project_id: null,
          package_id: pkgId,
          amount: +entry.amount || 0,
          paid_at: entry.date || null,
          method: entry.method || '',
          note: entry.note || '',
          receipt: entry.receipt || null,
          receipt_name: entry.receipt_name || `receipt-${pkgId}-${index}`,
          receipt_type: entry.receipt_type || '',
          created_at: entry.created_at || nowIso(),
        });
      });
    });

    return {
      ownerId: ns.state.canonical.ownerId || null,
      clients,
      packages,
      projects: projectsCanonical,
      scripts: scriptsCanonical,
      shootDays: shootDays.map((item) => ({
        id: item.id || `shootday_${item.date}_${ensureClientId(item.client_name || item.client || 'general')}`,
        client_id: item.client_name ? ensureClientId(item.client_name) : item.client ? ensureClientId(item.client) : null,
        client_name: item.client_name || item.client || '',
        date: item.date || null,
        notes: item.notes || '',
        created_at: item.created_at || nowIso(),
        updated_at: nowIso(),
      })),
      tasks: tasks.map((task) => ({
        id: task.id,
        client_id: task.clientId || (task.clientName ? ensureClientId(task.clientName) : null),
        client_name: task.clientName || '',
        project_id: task.projectId || null,
        project_name: task.projectName || '',
        title: task.title || '',
        notes: task.notes || '',
        due_date: task.dueDate || null,
        status: task.status || 'open',
        completed_at: task.completedAt || null,
        created_at: task.createdAt || nowIso(),
        updated_at: nowIso(),
      })),
      paymentEntries,
      tracking: tracking.map((entry) => ({
        id: entry.id,
        project_id: entry.projectId || null,
        platform: entry.platform || 'instagram',
        tracked_at: entry.date ? `${entry.date}T${entry.time || '00:00'}:00` : nowIso(),
        url: entry.url || '',
        views: +entry.views || 0,
        likes: +entry.likes || 0,
        comments: +entry.comments || 0,
        shares: +entry.shares || 0,
        saves: +entry.saves || 0,
        reach: +entry.reach || 0,
        notes: entry.notes || '',
        created_at: entry.created_at || nowIso(),
      })),
      activity: activity.map((entry) => ({
        id: entry.id,
        type: entry.type || 'update',
        entity_type: entry.type || 'activity',
        entity_id: entry.project || entry.client || entry.id,
        message: `${entry.icon || ''} ${entry.action || ''}`.trim(),
        project_name: entry.project || '',
        client_name: entry.client || '',
        created_at: entry.ts ? new Date(entry.ts).toISOString() : nowIso(),
      })),
      archive: archive.map((item) => ({ id: item.id, item_type: item.client ? 'project' : 'item', payload: item, name: item.name || item.client || 'Archive Item', archived_at: item.archivedAt ? new Date(item.archivedAt).toISOString() : nowIso() })),
      trash: trash.map((item) => ({ id: item.id, item_type: item.type || 'item', payload: item, name: item.name || item.client || 'Trash Item', deleted_at: item.deletedAt ? new Date(item.deletedAt).toISOString() : nowIso() })),
    };
  }

  function hydrateLegacyFromCanonical(canonical) {
    const clientLookup = {}; canonical.clients.forEach((client) => { clientLookup[client.id] = client; });
    const paymentByProject = {}, paymentByPackage = {};
    canonical.paymentEntries.forEach((entry) => {
      const legacyEntry = { id: entry.id, amount: +entry.amount || 0, date: entry.paid_at ? String(entry.paid_at).slice(0, 10) : '', method: entry.method || '', note: entry.note || '', receipt: entry.receipt || null, receipt_name: entry.receipt_name || '', receipt_type: entry.receipt_type || '' };
      if (entry.project_id) (paymentByProject[entry.project_id] = paymentByProject[entry.project_id] || []).push(legacyEntry);
      else if (entry.package_id) (paymentByPackage[entry.package_id] = paymentByPackage[entry.package_id] || []).push(legacyEntry);
    });

    const nextClientData = {};
    canonical.clients.forEach((client) => {
      nextClientData[client.name] = { id: client.id, phone: client.phone || '', email: client.email || '', website: client.website || '', address: client.address || '', contact: client.contact_name || '', notes: client.notes || '', receiptSent: Boolean(client.receipt_sent) };
    });
    canonical.packages.forEach((pkg) => {
      const client = clientLookup[pkg.client_id]; if (!client) return;
      nextClientData[client.name] = nextClientData[client.name] || { id: client.id };
      nextClientData[client.name].package = { id: pkg.id, name: pkg.name || '', total: pkg.total_videos || 0, price: pkg.price || 0, start: pkg.start_date || '', end: pkg.end_date || '', paid: pkg.payment_status || 'unpaid', paidAmount: pkg.paid_amount || 0, notes: pkg.notes || '', paymentHistory: paymentByPackage[pkg.id] || [] };
    });

    const nextProjects = canonical.projects.map((project) => {
      const client = clientLookup[project.client_id]; const paymentHistory = paymentByProject[project.id] || [];
      return { id: project.id, clientId: project.client_id, client: project.client_name || client?.name || 'ללא לקוח', name: project.name, type: project.type, stage: project.stage, deadline: project.deadline, price: project.price, paid: project.payment_status || 'unpaid', paidAmount: paymentHistory.reduce((sum, entry) => sum + (+entry.amount || 0), 0), notes: project.notes || '', drive: project.drive_url || '', progress: project.progress || 0, isPartOfPackage: Boolean(project.is_part_of_package), vidNum: project.package_slot || null, files: (project.files || []).map((file) => ({ ...file, dataUrl: file.publicUrl || file.dataUrl || '' })), paymentHistory };
    });

    const nextTasks = (canonical.tasks || []).map((task) => ({
      id: task.id,
      title: task.title || '',
      notes: task.notes || '',
      dueDate: task.due_date || '',
      status: task.status || 'open',
      clientName: task.client_name || clientLookup[task.client_id]?.name || '',
      clientId: task.client_id || '',
      projectId: task.project_id || '',
      projectName: task.project_name || '',
      createdAt: task.created_at || nowIso(),
      completedAt: task.completed_at || '',
    }));

    writeLegacyStore('projects', nextProjects);
    writeLegacyStore('clientData', nextClientData);
    writeLegacyStore('scriptsData', canonical.scripts.map((script) => ({ id: script.id, projectId: script.project_id, title: script.title, client: script.client_name || clientLookup[script.client_id]?.name || '', status: script.status, shootDate: script.shoot_date, scene: script.scene || '', voiceover: script.voiceover || '', camera: script.camera || '', editNotes: script.edit_notes || '', createdAt: script.created_at ? new Date(script.created_at).getTime() : Date.now() })));
    writeLegacyStore('trackingData', canonical.tracking.map((entry) => ({ id: entry.id, projectId: entry.project_id, platform: entry.platform, date: entry.tracked_at ? String(entry.tracked_at).slice(0, 10) : '', time: entry.tracked_at ? String(entry.tracked_at).slice(11, 16) : '', url: entry.url || '', views: entry.views || 0, likes: entry.likes || 0, comments: entry.comments || 0, shares: entry.shares || 0, saves: entry.saves || 0, reach: entry.reach || 0, notes: entry.notes || '' })));
    writeLegacyStore('activityLog', canonical.activity.map((entry) => ({ id: entry.id, type: entry.type, icon: entry.message ? entry.message.split(' ')[0] : '•', action: entry.message || '', project: entry.project_name || '', client: entry.client_name || '', ts: entry.created_at ? new Date(entry.created_at).getTime() : Date.now() })));
    writeLegacyStore('archiveData', canonical.archive.map((entry) => ({ ...(entry.payload || {}), id: entry.id, archivedAt: entry.archived_at ? new Date(entry.archived_at).getTime() : Date.now(), name: entry.name })));
    writeLegacyStore('trashData', canonical.trash.map((entry) => ({ ...(entry.payload || {}), id: entry.id, deletedAt: entry.deleted_at ? new Date(entry.deleted_at).getTime() : Date.now(), name: entry.name, type: entry.item_type })));
    writeLegacyStore('shootDaysData', canonical.shootDays.map((item) => ({ id: item.id, client_name: item.client_name || clientLookup[item.client_id]?.name || '', date: item.date, notes: item.notes || '', created_at: item.created_at || nowIso() })));

    global.localStorage.setItem('reel_projects', JSON.stringify(global.projects));
    global.localStorage.setItem('reel_clients', JSON.stringify(global.clientData));
    global.localStorage.setItem('reel_scripts', JSON.stringify(global.scriptsData));
    global.reelTasksData = nextTasks;
    global.localStorage.setItem('reel_tasks', JSON.stringify(nextTasks));
    global.localStorage.setItem('reel_tracking', JSON.stringify(global.trackingData));
    global.localStorage.setItem('reel_archive', JSON.stringify(global.archiveData));
    global.localStorage.setItem('reel_trash', JSON.stringify(global.trashData));
    global.localStorage.setItem('reel_activity', JSON.stringify(global.activityLog));
    global.localStorage.setItem('reel_shoot_days', JSON.stringify(global.shootDaysData));
  }

  function hasAnyRemoteData(canonical) { return [canonical.clients, canonical.packages, canonical.projects, canonical.scripts, canonical.shootDays, canonical.tasks, canonical.paymentEntries, canonical.tracking, canonical.activity, canonical.archive, canonical.trash].some((items) => Array.isArray(items) && items.length > 0); }
  function hasAnyLocalData(localState) { return localState.projects.length || Object.keys(localState.clients).length || localState.scripts.length || localState.tasks.length || localState.tracking.length || localState.archive.length || localState.trash.length || localState.activity.length || localState.shootDays.length; }

  async function loadInitialState() {
    const session = await ns.repository.auth.getSession(); if (!session?.user) throw new Error('No session');
    const remoteState = await ns.repository.fetchAll();
    const migratedKey = `reel_cloud_migrated_${session.user.id}`; const localState = readLocalLegacyState(); const remoteHasData = hasAnyRemoteData(remoteState);
    if (!remoteHasData && hasAnyLocalData(localState) && !global.localStorage.getItem(migratedKey)) {
      const migratedState = ns.state.replaceCanonical(buildCanonicalFromLegacy());
      hydrateLegacyFromCanonical(migratedState);
      await ns.repository.replaceAll(migratedState);
      global.localStorage.setItem(migratedKey, nowIso());
      ns.state.replaceCanonical(migratedState);
    } else {
      hydrateLegacyFromCanonical(remoteState);
      global.localStorage.setItem(migratedKey, nowIso());
      ns.state.replaceCanonical(remoteState);
    }
    global.syncAll?.();
  }

  async function syncCloudNow() {
    const session = await ns.repository.auth.getSession(); if (!session?.user) return;
    ns.state.setSyncStatus('syncing');
    try { ns.state.replaceCanonical(buildCanonicalFromLegacy()); await ns.repository.replaceAll(ns.state.canonical); ns.state.setSyncStatus('idle'); }
    catch (error) { console.error(error); ns.state.setSyncStatus('error'); global.toast?.('שגיאת סנכרון מול Supabase'); }
  }

  function syncCloudDebounced() { clearTimeout(syncTimer); syncTimer = global.setTimeout(syncCloudNow, 650); }

  function installPersistencePatches() {
    ['save', 'saveClients', '_saveSC', 'saveTasksStore', 'saveTracking_store', '_saveArchive', '_saveTrash', '_saveLog'].forEach((name) => {
      const original = global[name]; if (typeof original !== 'function' || original.__cloudPatched) return;
      const wrapped = function wrappedPersistence() { const result = original.apply(this, arguments); syncCloudDebounced(); return result; };
      wrapped.__cloudPatched = true; global[name] = wrapped;
    });
  }

  function installShootDayPatches() {
    if (!Array.isArray(global.shootDaysData)) {
      try { global.shootDaysData = JSON.parse(global.localStorage.getItem('reel_shoot_days') || '[]'); }
      catch (error) { global.shootDaysData = []; }
    }
    global.saveShootDaysStore = function saveShootDaysStore() {
      global.localStorage.setItem('reel_shoot_days', JSON.stringify(global.shootDaysData || []));
      syncCloudDebounced();
    };
    global.saveShootDay = function saveShootDayPatched() {
      const date = global.document.getElementById('shoot-day-date')?.value; const client = global.document.getElementById('shoot-day-client')?.value || ''; const notes = global.document.getElementById('shoot-day-notes')?.value.trim() || '';
      if (!date) return global.toast?.('נא לבחור תאריך');
      const clientName = client && global.clientData[client] ? client : client;
      const existing = (global.shootDaysData || []).find((item) => item.date === date && item.client_name === clientName);
      if (existing) existing.notes = notes;
      else global.shootDaysData.push({ id: `shootday_${Date.now()}`, client_name: clientName, date, notes, created_at: nowIso() });
      global.saveShootDaysStore(); global.document.getElementById('overlay-shoot-day').classList.remove('open'); global.renderCalendar?.(); global.toast?.('יום צילום נשמר'); global.setTimeout(() => global.openSDP?.(date), 80);
    };
    const originalRenderCalendar = global.renderCalendar;
    if (typeof originalRenderCalendar === 'function' && !originalRenderCalendar.__shootDayPatched) {
      global.renderCalendar = function renderCalendarPatched() {
        originalRenderCalendar.apply(this, arguments);
        (global.shootDaysData || []).forEach((item) => {
          const day = Array.from(global.document.querySelectorAll('.cal-day')).find((node) => node.getAttribute('onclick')?.includes(item.date));
          if (!day) return;
          const marker = global.document.createElement('div'); marker.className = 'cal-shootday-chip'; marker.textContent = item.client_name ? `יום צילום · ${item.client_name}` : 'יום צילום'; day.appendChild(marker);
        });
        ns.calendarAgenda.ensureAgendaShell(); ns.calendarAgenda.applyCalendarMode();
      };
      global.renderCalendar.__shootDayPatched = true;
    }
    const originalOpenSDP = global.openSDP;
    if (typeof originalOpenSDP === 'function' && !originalOpenSDP.__shootDayPatched) {
      global.openSDP = function openSDPPatched(dateStr) {
        originalOpenSDP.call(this, dateStr);
        const list = (global.shootDaysData || []).filter((item) => item.date === dateStr); const target = global.document.getElementById('sdp-projs');
        if (!target || !list.length) return;
        const block = global.document.createElement('div'); block.className = 'sdp-shootday-list';
        block.innerHTML = list.map((item) => `<div class="sdp-proj-row shootday"><span style="font-size:18px">📅</span><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">יום צילום</div><div style="font-size:11px;color:var(--muted2)">${item.client_name || 'ללא לקוח'}${item.notes ? ` · ${item.notes}` : ''}</div></div><span style="background:rgba(0,229,160,.18);color:var(--success);font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px">צילום</span></div>`).join('');
        target.prepend(block);
      };
      global.openSDP.__shootDayPatched = true;
    }
  }

  function installSearchPatch() { global.runGlobalSearch = function(query) { ns.search.renderResults(query); }; global.clearSearch = function() { ns.search.clear(); }; }

  ns.bridge = { buildCanonicalFromLegacy, hydrateLegacyFromCanonical, readLocalLegacyState, loadInitialState, syncCloudNow, syncCloudDebounced, installPersistencePatches, installShootDayPatches, installSearchPatch };
})(window);
