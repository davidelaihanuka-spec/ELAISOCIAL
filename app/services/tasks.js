(function initReelTasks(global) {
  const ns = global.REELApp = global.REELApp || {};
  const STORAGE_KEY = 'reel_tasks';
  let pendingDraft = null;

  function readStoredTasks() {
    try {
      return JSON.parse(global.localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
      return [];
    }
  }

  function read() {
    if (Array.isArray(global.reelTasksData)) return [...global.reelTasksData];
    const stored = readStoredTasks();
    global.reelTasksData = [...stored];
    return stored;
  }

  function write(items) {
    if (typeof global.saveTasksStore === 'function') {
      global.saveTasksStore(items || []);
      return;
    }
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
  }

  global.saveTasksStore = function saveTasksStore(items) {
    const nextItems = [...(items || [])];
    global.reelTasksData = nextItems;
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  };

  function normalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function dateStamp(value) {
    return normalizeDate(value)?.getTime() || 0;
  }

  function daysUntil(value) {
    const date = normalizeDate(value);
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return Math.round((date - today) / 86400000);
  }

  function sortTasks(a, b) {
    const aDone = a.status === 'done' ? 1 : 0;
    const bDone = b.status === 'done' ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    const aDays = daysUntil(a.dueDate);
    const bDays = daysUntil(b.dueDate);
    const aSort = aDays === null ? 9999 : aDays;
    const bSort = bDays === null ? 9999 : bDays;
    return aSort - bSort || dateStamp(b.createdAt) - dateStamp(a.createdAt);
  }

  function list() {
    return read().sort(sortTasks);
  }

  function listOpen() {
    return list().filter((task) => task.status !== 'done');
  }

  function getTask(id) {
    return list().find((task) => task.id === id) || null;
  }

  function create(input) {
    const title = String(input?.title || '').trim();
    if (!title) return null;
    const task = {
      id: (typeof global.genId === 'function' ? global.genId() : `task_${Date.now()}`),
      title,
      notes: String(input?.notes || '').trim(),
      dueDate: input?.dueDate || '',
      status: 'open',
      clientName: input?.clientName || '',
      clientId: input?.clientId || '',
      projectId: input?.projectId || '',
      projectName: input?.projectName || '',
      createdAt: new Date().toISOString(),
      completedAt: '',
    };
    const next = [task, ...read()];
    write(next);
    global.logActivity?.('update', '📌', 'נוספה משימת מעקב', task.projectName || task.title, task.clientName || '');
    return task;
  }

  function updateStatus(id, nextStatus) {
    const items = read();
    const index = items.findIndex((task) => task.id === id);
    if (index < 0) return null;
    items[index] = {
      ...items[index],
      status: nextStatus,
      completedAt: nextStatus === 'done' ? new Date().toISOString() : '',
    };
    write(items);
    return items[index];
  }

  function remove(id) {
    const items = read();
    const task = items.find((entry) => entry.id === id) || null;
    write(items.filter((entry) => entry.id !== id));
    return task;
  }

  function getEntityTasks({ clientName, projectId } = {}) {
    return list().filter((task) => {
      if (projectId && task.projectId === projectId) return true;
      if (clientName && task.clientName === clientName) return true;
      return false;
    });
  }

  function getOverview() {
    const items = list();
    const open = items.filter((task) => task.status !== 'done');
    const overdue = open.filter((task) => (daysUntil(task.dueDate) ?? 999) < 0);
    const today = open.filter((task) => daysUntil(task.dueDate) === 0);
    const upcoming = open.filter((task) => {
      const days = daysUntil(task.dueDate);
      return days !== null && days > 0 && days <= 7;
    });
    const done = items.filter((task) => task.status === 'done');

    return {
      items,
      open,
      overdue,
      today,
      upcoming,
      done,
    };
  }

  function setDraft(draft) {
    pendingDraft = draft || null;
  }

  function consumeDraft() {
    const draft = pendingDraft;
    pendingDraft = null;
    return draft;
  }

  function openComposer(draft) {
    setDraft(draft);
    ns.state?.setOnboardingDismissed?.(true);
    global.goView?.('tasks');
  }

  ns.tasks = {
    list,
    listOpen,
    getTask,
    create,
    updateStatus,
    remove,
    getEntityTasks,
    getOverview,
    daysUntil,
    setDraft,
    consumeDraft,
    openComposer,
  };

  global.openTaskComposer = openComposer;
})(window);
