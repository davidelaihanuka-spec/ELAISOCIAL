(function initReelInboxModel(global) {
  const ns = global.REELApp = global.REELApp || {};

  function normalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function daysUntil(value) {
    const date = normalizeDate(value);
    if (!date) return null;
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.round((date - today) / 86400000);
  }

  function sortByPriority(a, b) {
    const order = { critical: 1, warning: 2, info: 3, success: 4 };
    return (order[a.tone] || 99) - (order[b.tone] || 99) || ((a.days ?? 999) - (b.days ?? 999));
  }

  function buildProjectItem(project, config) {
    return {
      id: `${config.kind}:${project.id}`,
      kind: config.kind,
      tone: config.tone,
      title: config.title(project),
      description: config.description(project),
      projectId: project.id,
      clientName: project.client || '',
      days: config.days?.(project) ?? null,
      cta: config.cta || 'פתח פרויקט',
    };
  }

  function buildClientItem(summary, config) {
    return {
      id: `${config.kind}:${summary.name}`,
      kind: config.kind,
      tone: config.tone,
      title: config.title(summary),
      description: config.description(summary),
      clientName: summary.name,
      amount: summary.due || 0,
      cta: config.cta || 'פתח לקוח',
    };
  }

  function buildShootDayItem(item) {
    const dayCount = daysUntil(item.date);
    return {
      id: `shootday:${item.id || item.date}`,
      kind: 'shootday',
      tone: dayCount === 0 ? 'warning' : 'info',
      title: dayCount === 0 ? 'יום צילום היום' : 'יום צילום קרוב',
      description: `${item.client_name || item.client || 'ללא לקוח'} · ${normalizeDate(item.date)?.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }) || 'ללא תאריך'}${item.notes ? ` · ${item.notes}` : ''}`,
      clientName: item.client_name || item.client || '',
      shootDate: item.date,
      days: dayCount,
      cta: 'פתח יומן',
    };
  }

  function buildClientGapItem(name, data) {
    const missing = [];
    if (!data?.phone) missing.push('טלפון');
    if (!data?.email) missing.push('אימייל');
    return {
      id: `client-gap:${name}`,
      kind: 'client-gap',
      tone: 'info',
      title: 'חסר מידע ללקוח',
      description: `${name} · חסר ${missing.join(' ו-')}`,
      clientName: name,
      cta: 'השלם פרטים',
    };
  }

  function buildTaskItem(task) {
    const dayCount = ns.tasks?.daysUntil?.(task.dueDate);
    return {
      id: `task:${task.id}`,
      kind: 'task',
      tone: dayCount !== null && dayCount < 0 ? 'critical' : dayCount === 0 ? 'warning' : 'info',
      title: dayCount !== null && dayCount < 0 ? 'משימת מעקב באיחור' : 'משימת מעקב פתוחה',
      description: `${task.title}${task.clientName ? ` · ${task.clientName}` : ''}${task.projectName ? ` · ${task.projectName}` : ''}${task.dueDate ? ` · ${normalizeDate(task.dueDate)?.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}`,
      clientName: task.clientName || '',
      projectId: task.projectId || '',
      taskId: task.id,
      days: dayCount,
      cta: 'פתח משימות',
    };
  }

  function getInbox() {
    const projects = global.projects || [];
    const shootDays = global.shootDaysData || [];
    const clientData = global.clientData || {};
    const summaries = ns.ledger?.getClientSummaries?.() || [];

    const overdueProjects = projects
      .filter((project) => project.stage !== 'published' && (daysUntil(project.deadline) ?? 999) < 0)
      .map((project) => buildProjectItem(project, {
        kind: 'overdue',
        tone: 'critical',
        title: () => 'פרויקט באיחור',
        description: (item) => `${item.name} · ${item.client || 'ללא לקוח'} · איחור של ${Math.abs(daysUntil(item.deadline) || 0)} ימים`,
        days: (item) => daysUntil(item.deadline),
      }))
      .sort(sortByPriority);

    const waitingProjects = projects
      .filter((project) => project.stage === 'approval')
      .map((project) => buildProjectItem(project, {
        kind: 'waiting',
        tone: 'warning',
        title: () => 'ממתין לאישור לקוח',
        description: (item) => `${item.name} · ${item.client || 'ללא לקוח'}${item.deadline ? ` · דדליין ${normalizeDate(item.deadline)?.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}` : ''}`,
      }))
      .sort(sortByPriority);

    const unpaidClients = summaries
      .filter((summary) => summary.due > 0)
      .map((summary) => buildClientItem(summary, {
        kind: 'unpaid',
        tone: summary.due > 2000 ? 'critical' : 'warning',
        title: () => 'תשלום פתוח',
        description: (item) => `${item.name} · נותרו ₪${(+item.due || 0).toLocaleString('he-IL')} פתוחים`,
        cta: 'פתח תשלומים',
      }))
      .sort((a, b) => (b.amount || 0) - (a.amount || 0));

    const upcomingShootDays = shootDays
      .filter((item) => {
        const days = daysUntil(item.date);
        return days !== null && days >= 0 && days <= 7;
      })
      .map(buildShootDayItem)
      .sort(sortByPriority);

    const clientGaps = Object.entries(clientData)
      .filter(([, data]) => !data?.phone || !data?.email)
      .map(([name, data]) => buildClientGapItem(name, data))
      .sort(sortByPriority);

    const openTasks = (ns.tasks?.listOpen?.() || [])
      .map(buildTaskItem)
      .sort(sortByPriority);

    const urgent = [...overdueProjects, ...unpaidClients.slice(0, 6), ...waitingProjects, ...openTasks.filter((item) => (item.days ?? 999) <= 0)].sort(sortByPriority);
    const upcoming = [...upcomingShootDays].sort(sortByPriority);
    const followUps = [...clientGaps, ...waitingProjects.slice(0, 6), ...openTasks.filter((item) => (item.days ?? 999) > 0 || item.days === null)].sort(sortByPriority);

    return {
      counts: {
        urgent: urgent.length,
        overdue: overdueProjects.length,
        unpaid: unpaidClients.length,
        waiting: waitingProjects.length,
        upcoming: upcomingShootDays.length,
        clientGaps: clientGaps.length,
        tasks: openTasks.length,
      },
      sections: {
        urgent,
        upcoming,
        followUps,
      },
    };
  }

  ns.inboxModel = { getInbox, daysUntil };
})(window);
