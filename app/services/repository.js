(function initReelRepository(global) {
  const ns = global.REELApp = global.REELApp || {};

  const TABLES = {
    clients: 'clients',
    packages: 'client_packages',
    projects: 'projects',
    scripts: 'scripts',
    shootDays: 'shoot_days',
    tasks: 'tasks',
    paymentEntries: 'payment_entries',
    tracking: 'tracking_entries',
    activity: 'activity_entries',
    archive: 'archive_items',
    trash: 'trash_items',
  };

  function sanitizeName(name, fallback) {
    return String(name || fallback || 'file')
      .replace(/[^\w.-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  async function requireClient() {
    const client = await ns.supabase.init();
    if (!client) throw new Error('Supabase is not configured yet.');
    return client;
  }

  async function requireUser() {
    const client = await requireClient();
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('No authenticated user.');
    return { client, user: data.user };
  }

  const UPSERT_CHUNK_SIZE = 200;
  const DELETE_CHUNK_SIZE = 200;
  const UPSERT_ORDER = [
    TABLES.clients,
    TABLES.packages,
    TABLES.projects,
    TABLES.scripts,
    TABLES.shootDays,
    TABLES.tasks,
    TABLES.paymentEntries,
    TABLES.tracking,
    TABLES.activity,
    TABLES.archive,
    TABLES.trash,
  ];
  const DELETE_ORDER = [...UPSERT_ORDER].reverse();

  function chunk(items, size) {
    const groups = [];
    for (let index = 0; index < items.length; index += size) {
      groups.push(items.slice(index, index + size));
    }
    return groups;
  }

  async function listTableIds(client, table, ownerId) {
    const { data, error } = await client.from(table).select('id').eq('owner_id', ownerId);
    if (error) throw error;
    return (data || []).map((row) => row.id).filter(Boolean);
  }

  async function upsertRows(client, table, rows) {
    const items = rows || [];
    if (!items.length) return;
    for (const group of chunk(items, UPSERT_CHUNK_SIZE)) {
      const { error } = await client.from(table).upsert(group, { onConflict: 'id' });
      if (error) throw error;
    }
  }

  async function deleteRows(client, table, ownerId, ids) {
    const staleIds = ids || [];
    if (!staleIds.length) return;
    for (const group of chunk(staleIds, DELETE_CHUNK_SIZE)) {
      const { error } = await client.from(table).delete().eq('owner_id', ownerId).in('id', group);
      if (error) throw error;
    }
  }

  async function listTable(client, table, ownerId, orderColumn) {
    let query = client.from(table).select('*').eq('owner_id', ownerId);
    if (orderColumn) query = query.order(orderColumn, { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function upsertRow(table, row) {
    const { client, user } = await requireUser();
    const payload = { ...row, owner_id: user.id };
    const { data, error } = await client.from(table).upsert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteRow(table, id) {
    const { client, user } = await requireUser();
    const { error } = await client.from(table).delete().eq('owner_id', user.id).eq('id', id);
    if (error) throw error;
  }

  async function uploadDataUrl(client, ownerId, folder, fileLike) {
    if (!fileLike || !fileLike.dataUrl || !fileLike.name) return fileLike;
    const bucket = ns.supabase.getBucket();
    const fileName = sanitizeName(fileLike.name, 'asset');
    const path = `${ownerId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${fileName}`;
    const response = await fetch(fileLike.dataUrl);
    const blob = await response.blob();
    const { error } = await client.storage.from(bucket).upload(path, blob, {
      contentType: fileLike.type || blob.type || 'application/octet-stream',
      upsert: true,
    });
    if (error) throw error;
    const publicUrl = client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return {
      name: fileLike.name,
      size: fileLike.size || blob.size || 0,
      type: fileLike.type || blob.type || '',
      storagePath: path,
      publicUrl,
      dataUrl: publicUrl,
    };
  }

  async function normalizeProjectFiles(client, ownerId, projects) {
    const nextProjects = [];
    for (const project of projects || []) {
      const nextFiles = [];
      for (const file of project.files || []) {
        if (file && file.storagePath && file.publicUrl) {
          nextFiles.push({ ...file, dataUrl: file.publicUrl });
          continue;
        }
        if (file && file.dataUrl) {
          nextFiles.push(await uploadDataUrl(client, ownerId, 'project-files', file));
          continue;
        }
        nextFiles.push(file);
      }
      nextProjects.push({ ...project, files: nextFiles });
    }
    return nextProjects;
  }

  async function normalizePaymentEntries(client, ownerId, entries) {
    const nextEntries = [];
    for (const entry of entries || []) {
      if (entry.receipt && /^data:/i.test(entry.receipt)) {
        const uploaded = await uploadDataUrl(client, ownerId, 'payment-receipts', {
          dataUrl: entry.receipt,
          name: entry.receipt_name || `receipt-${entry.id || Date.now()}.bin`,
          type: entry.receipt_type || '',
        });
        nextEntries.push({
          ...entry,
          receipt: uploaded.publicUrl,
          receipt_name: uploaded.name,
          receipt_type: uploaded.type,
          receipt_path: uploaded.storagePath,
        });
      } else {
        nextEntries.push(entry);
      }
    }
    return nextEntries;
  }

  const repository = {
    auth: {
      async getSession() {
        const client = await ns.supabase.init();
        if (!client) return null;
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        return data.session || null;
      },
      async signIn(email, password) {
        const client = await requireClient();
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },
      async signUp(email, password) {
        const client = await requireClient();
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        return data;
      },
      async signOut() {
        const client = await requireClient();
        const { error } = await client.auth.signOut();
        if (error) throw error;
      },
      onAuthStateChange(callback) {
        const client = ns.supabase.getClient();
        if (!client) return { data: { subscription: { unsubscribe() {} } } };
        return client.auth.onAuthStateChange(callback);
      },
    },

    async fetchAll() {
      const { client, user } = await requireUser();
      const [
        clients,
        packages,
        projects,
        scripts,
        shootDays,
        tasks,
        paymentEntries,
        tracking,
        activity,
        archive,
        trash,
      ] = await Promise.all([
        listTable(client, TABLES.clients, user.id, 'updated_at'),
        listTable(client, TABLES.packages, user.id, 'updated_at'),
        listTable(client, TABLES.projects, user.id, 'updated_at'),
        listTable(client, TABLES.scripts, user.id, 'updated_at'),
        listTable(client, TABLES.shootDays, user.id, 'created_at'),
        listTable(client, TABLES.tasks, user.id, 'updated_at'),
        listTable(client, TABLES.paymentEntries, user.id, 'paid_at'),
        listTable(client, TABLES.tracking, user.id, 'tracked_at'),
        listTable(client, TABLES.activity, user.id, 'created_at'),
        listTable(client, TABLES.archive, user.id, 'archived_at'),
        listTable(client, TABLES.trash, user.id, 'deleted_at'),
      ]);

      return {
        ownerId: user.id,
        clients,
        packages,
        projects,
        scripts,
        shootDays,
        tasks,
        paymentEntries,
        tracking,
        activity,
        archive,
        trash,
      };
    },

    async replaceAll(state) {
      const { client, user } = await requireUser();
      const ownerId = user.id;
      const normalizedProjects = await normalizeProjectFiles(client, ownerId, state.projects || []);
      const normalizedPaymentEntries = await normalizePaymentEntries(client, ownerId, state.paymentEntries || []);

      const rows = {
        [TABLES.clients]: (state.clients || []).map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.packages]: (state.packages || []).map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.projects]: normalizedProjects.map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.scripts]: (state.scripts || []).map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.shootDays]: (state.shootDays || []).map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.tasks]: (state.tasks || []).map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.paymentEntries]: normalizedPaymentEntries.map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.tracking]: (state.tracking || []).map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.activity]: (state.activity || []).map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.archive]: (state.archive || []).map((item) => ({ ...item, owner_id: ownerId })),
        [TABLES.trash]: (state.trash || []).map((item) => ({ ...item, owner_id: ownerId })),
      };

      const remoteIdsByTable = {};
      await Promise.all(UPSERT_ORDER.map(async (table) => {
        remoteIdsByTable[table] = await listTableIds(client, table, ownerId);
      }));

      for (const table of UPSERT_ORDER) {
        await upsertRows(client, table, rows[table] || []);
      }

      for (const table of DELETE_ORDER) {
        const nextIds = new Set((rows[table] || []).map((item) => item.id).filter(Boolean));
        const staleIds = (remoteIdsByTable[table] || []).filter((id) => !nextIds.has(id));
        await deleteRows(client, table, ownerId, staleIds);
      }
    },

    clients: {
      async list() {
        const { client, user } = await requireUser();
        return listTable(client, TABLES.clients, user.id, 'updated_at');
      },
      async upsert(row) {
        return upsertRow(TABLES.clients, row);
      },
      async remove(id) {
        return deleteRow(TABLES.clients, id);
      },
    },

    projects: {
      async list() {
        const { client, user } = await requireUser();
        return listTable(client, TABLES.projects, user.id, 'updated_at');
      },
      async upsert(row) {
        return upsertRow(TABLES.projects, row);
      },
      async remove(id) {
        return deleteRow(TABLES.projects, id);
      },
      async archive(id) {
        return upsertRow(TABLES.projects, { id, is_archived: true, archived_at: new Date().toISOString() });
      },
      async restore(id) {
        return upsertRow(TABLES.projects, { id, is_archived: false, archived_at: null });
      },
    },

    packages: {
      async list() {
        const { client, user } = await requireUser();
        return listTable(client, TABLES.packages, user.id, 'updated_at');
      },
      async upsert(row) {
        return upsertRow(TABLES.packages, row);
      },
    },

    scripts: {
      async list() {
        const { client, user } = await requireUser();
        return listTable(client, TABLES.scripts, user.id, 'updated_at');
      },
      async upsert(row) {
        return upsertRow(TABLES.scripts, row);
      },
      async remove(id) {
        return deleteRow(TABLES.scripts, id);
      },
    },

    shootDays: {
      async list() {
        const { client, user } = await requireUser();
        return listTable(client, TABLES.shootDays, user.id, 'created_at');
      },
      async upsert(row) {
        return upsertRow(TABLES.shootDays, row);
      },
      async remove(id) {
        return deleteRow(TABLES.shootDays, id);
      },
    },

    tasks: {
      async list() {
        const { client, user } = await requireUser();
        return listTable(client, TABLES.tasks, user.id, 'updated_at');
      },
      async upsert(row) {
        return upsertRow(TABLES.tasks, row);
      },
      async remove(id) {
        return deleteRow(TABLES.tasks, id);
      },
    },

    payments: {
      async list() {
        const { client, user } = await requireUser();
        return listTable(client, TABLES.paymentEntries, user.id, 'paid_at');
      },
      async upsert(row) {
        return upsertRow(TABLES.paymentEntries, row);
      },
      async remove(id) {
        return deleteRow(TABLES.paymentEntries, id);
      },
    },

    tracking: {
      async list() {
        const { client, user } = await requireUser();
        return listTable(client, TABLES.tracking, user.id, 'tracked_at');
      },
      async upsert(row) {
        return upsertRow(TABLES.tracking, row);
      },
      async remove(id) {
        return deleteRow(TABLES.tracking, id);
      },
    },

    search: {
      async global(query) {
        const all = await repository.fetchAll();
        const q = String(query || '').trim().toLowerCase();
        if (!q) return [];
        const matches = [];
        all.projects.filter((item) => String(item.name || '').toLowerCase().includes(q) || String(item.client_name || '').toLowerCase().includes(q)).forEach((item) => matches.push({ type: 'project', item }));
        all.clients.filter((item) => String(item.name || '').toLowerCase().includes(q) || String(item.email || '').toLowerCase().includes(q)).forEach((item) => matches.push({ type: 'client', item }));
        all.scripts.filter((item) => String(item.title || '').toLowerCase().includes(q)).forEach((item) => matches.push({ type: 'script', item }));
        all.paymentEntries.filter((item) => String(item.note || '').toLowerCase().includes(q) || String(item.method || '').toLowerCase().includes(q)).forEach((item) => matches.push({ type: 'payment', item }));
        all.shootDays.filter((item) => String(item.client_name || '').toLowerCase().includes(q) || String(item.notes || '').toLowerCase().includes(q)).forEach((item) => matches.push({ type: 'shootDay', item }));
        return matches;
      },
    },
  };

  ns.repository = repository;
})(window);
