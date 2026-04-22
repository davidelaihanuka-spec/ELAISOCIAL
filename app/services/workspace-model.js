(function initReelWorkspaceModel(global) {
  const ns = global.REELApp = global.REELApp || {};

  function normalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function dateStamp(value) {
    return normalizeDate(value)?.getTime() || 0;
  }

  function sortByUpcoming(a, b, field) {
    const aTime = dateStamp(a?.[field]);
    const bTime = dateStamp(b?.[field]);
    if (!aTime && !bTime) return String(a?.name || '').localeCompare(String(b?.name || ''), 'he');
    if (!aTime) return 1;
    if (!bTime) return -1;
    return aTime - bTime;
  }

  function sortByRecent(a, b, field) {
    return dateStamp(b?.[field]) - dateStamp(a?.[field]);
  }

  function getClientName(ref) {
    if (!ref) return '';
    if (typeof ref === 'string') {
      if ((global.clientData || {})[ref]) return ref;
      return ns.clientModel?.findClientNameById?.(ref) || ref;
    }
    if (typeof ref === 'object') {
      if (ref.name && (global.clientData || {})[ref.name]) return ref.name;
      if (ref.id) return ns.clientModel?.findClientNameById?.(ref.id) || '';
    }
    return '';
  }

  function getClientRecord(name) {
    if (!name) return null;
    const data = (global.clientData || {})[name] || {};
    const id = data.id || ns.clientModel?.listClients?.().find((entry) => entry.name === name)?.id || null;
    return { id, name, data };
  }

  function getProjectPaid(project) {
    return +ns.ledger?.getProjectPaid?.(project) || +(project?.paidAmount || 0);
  }

  function getPackagePaid(pkg) {
    return +ns.ledger?.getPackagePaid?.(pkg) || +(pkg?.paidAmount || 0);
  }

  function getStatus(total, paid) {
    if ((+total || 0) <= 0) return 'unpaid';
    if ((+paid || 0) >= (+total || 0)) return 'paid';
    if ((+paid || 0) > 0) return 'partial';
    return 'unpaid';
  }

  function resolveClientProjects(record) {
    if (!record) return [];
    return (global.projects || [])
      .filter((project) => project.clientId === record.id || project.client === record.name)
      .sort((a, b) => sortByUpcoming(a, b, 'deadline'));
  }

  function resolveClientScripts(record) {
    if (!record) return [];
    return (global.scriptsData || [])
      .filter((script) => script.clientId === record.id || script.client === record.name)
      .sort((a, b) => sortByUpcoming(a, b, 'shootDate'));
  }

  function resolveClientShootDays(record) {
    if (!record) return [];
    return (global.shootDaysData || [])
      .filter((item) => item.clientId === record.id || item.client_name === record.name || item.client === record.name)
      .sort((a, b) => sortByUpcoming(a, b, 'date'));
  }

  function resolveClientActivity(record) {
    if (!record) return [];
    return (global.activityLog || [])
      .filter((entry) => entry.client === record.name || entry.client_name === record.name)
      .sort((a, b) => sortByRecent(a, b, 'ts'))
      .slice(0, 8);
  }

  function resolveProjectTracking(projectId) {
    return (global.trackingData || [])
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => sortByRecent(a, b, 'trackedAt') || sortByRecent(a, b, 'date') || sortByRecent(a, b, 'created_at'));
  }

  function getTrackingTotals(entries) {
    if (!entries.length) {
      return {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        reach: 0,
        latest: null,
        previous: null,
      };
    }
    const [latest, previous] = entries;
    return {
      views: entries.reduce((sum, entry) => sum + (+entry.views || 0), 0),
      likes: entries.reduce((sum, entry) => sum + (+entry.likes || 0), 0),
      comments: entries.reduce((sum, entry) => sum + (+entry.comments || 0), 0),
      shares: entries.reduce((sum, entry) => sum + (+entry.shares || 0), 0),
      saves: entries.reduce((sum, entry) => sum + (+entry.saves || 0), 0),
      reach: entries.reduce((sum, entry) => sum + (+entry.reach || 0), 0),
      latest: latest || null,
      previous: previous || null,
    };
  }

  function getClientWorkspace(ref) {
    const name = getClientName(ref);
    const record = getClientRecord(name);
    if (!record) return null;

    const projects = resolveClientProjects(record);
    const scripts = resolveClientScripts(record);
    const shootDays = resolveClientShootDays(record);
    const activity = resolveClientActivity(record);
    const paymentEntries = (ns.ledger?.listEntries?.() || []).filter((entry) => entry.clientName === record.name);
    const tasks = ns.tasks?.getEntityTasks?.({ clientName: record.name }) || [];
    const pkg = record.data.package || null;
    const standaloneProjects = projects.filter((project) => !project.isPartOfPackage);
    const activeProjects = projects.filter((project) => project.stage !== 'published');
    const overdueProjects = projects.filter((project) => {
      const deadline = normalizeDate(project.deadline);
      return deadline && project.stage !== 'published' && deadline < new Date();
    });
    const waitingProjects = projects.filter((project) => project.stage === 'approval');
    const standaloneTotal = standaloneProjects.reduce((sum, project) => sum + (+project.price || 0), 0);
    const standalonePaid = standaloneProjects.reduce((sum, project) => sum + getProjectPaid(project), 0);
    const packageTotal = +pkg?.price || 0;
    const packagePaid = getPackagePaid(pkg);
    const total = standaloneTotal + packageTotal;
    const paid = standalonePaid + packagePaid;
    const due = Math.max(0, total - paid);
    const upcomingShootDay = shootDays.find((item) => dateStamp(item.date) >= Date.now() - 86400000) || null;
    const projectIds = new Set(projects.map((project) => project.id));
    const trackingSummary = getTrackingTotals(
      (global.trackingData || []).filter((entry) => projectIds.has(entry.projectId)).sort((a, b) => sortByRecent(a, b, 'trackedAt'))
    );

    const alerts = [];
    if (!record.data.phone && !record.data.email) alerts.push({ tone: 'warning', label: 'אין פרטי קשר מלאים ללקוח.' });
    if (overdueProjects.length) alerts.push({ tone: 'danger', label: `${overdueProjects.length} פרויקטים באיחור.` });
    if (waitingProjects.length) alerts.push({ tone: 'warning', label: `${waitingProjects.length} פרויקטים ממתינים לאישור לקוח.` });
    if (tasks.filter((task) => task.status !== 'done').length) alerts.push({ tone: 'info', label: `${tasks.filter((task) => task.status !== 'done').length} משימות מעקב פתוחות.` });
    if (due > 0) alerts.push({ tone: 'info', label: `נותרו ${due.toLocaleString('he-IL')} ש"ח פתוחים.` });
    if (upcomingShootDay?.date) alerts.push({ tone: 'success', label: `יום צילום קרוב ב-${new Date(upcomingShootDay.date).toLocaleDateString('he-IL')}.` });
    if (!alerts.length) alerts.push({ tone: 'success', label: 'הלקוח הזה במצב טוב כרגע.' });

    return {
      ...record,
      projects,
      scripts,
      shootDays,
      activity,
      tasks,
      paymentEntries,
      trackingSummary,
      standaloneProjects,
      activeProjects,
      overdueProjects,
      waitingProjects,
      packageSummary: {
        exists: Boolean(pkg && (pkg.total || pkg.price || pkg.name)),
        totalVideos: +pkg?.total || 0,
        price: packageTotal,
        paid: packagePaid,
        due: Math.max(0, packageTotal - packagePaid),
        status: getStatus(packageTotal, packagePaid),
        name: pkg?.name || 'חבילת סרטונים',
        startDate: pkg?.startDate || '',
        endDate: pkg?.endDate || '',
      },
      totals: {
        total,
        paid,
        due,
        activeProjects: activeProjects.length,
        publishedProjects: projects.filter((project) => project.stage === 'published').length,
        scripts: scripts.length,
      },
      alerts,
      upcomingShootDay,
    };
  }

  function getProjectWorkspace(projectId) {
    const project = (global.projects || []).find((item) => item.id === projectId);
    if (!project) return null;

    const clientName = project.client || ns.clientModel?.findClientNameById?.(project.clientId) || '';
    const clientWorkspace = getClientWorkspace(project.clientId || clientName);
    const paymentEntries = (project.paymentHistory || []).slice().sort((a, b) => sortByRecent(a, b, 'date'));
    const trackingEntries = resolveProjectTracking(project.id);
    const trackingSummary = getTrackingTotals(trackingEntries);
    const tasks = ns.tasks?.getEntityTasks?.({ clientName, projectId: project.id }) || [];
    const scripts = (global.scriptsData || [])
      .filter((script) => script.projectId === project.id)
      .sort((a, b) => sortByUpcoming(a, b, 'shootDate'));
    const activity = (global.activityLog || [])
      .filter((entry) => entry.project === project.name || entry.projectName === project.name || entry.entity_id === project.id)
      .sort((a, b) => sortByRecent(a, b, 'ts'))
      .slice(0, 8);
    const shootDays = (clientWorkspace?.shootDays || []).slice(0, 4);
    const paid = getProjectPaid(project);
    const total = +project.price || 0;
    const due = Math.max(0, total - paid);
    const status = getStatus(total, paid);
    const deadline = normalizeDate(project.deadline);
    const overdue = deadline && project.stage !== 'published' && deadline < new Date();
    const alerts = [];
    if (overdue) alerts.push({ tone: 'danger', label: 'הדדליין עבר והפרויקט עדיין לא פורסם.' });
    if (project.stage === 'approval') alerts.push({ tone: 'warning', label: 'הפרויקט ממתין לפידבק או אישור לקוח.' });
    if (due > 0) alerts.push({ tone: 'info', label: `נותרו ${due.toLocaleString('he-IL')} ש"ח פתוחים.` });
    if (tasks.filter((task) => task.status !== 'done').length) alerts.push({ tone: 'info', label: `${tasks.filter((task) => task.status !== 'done').length} משימות מעקב פתוחות לפרויקט.` });
    if (!trackingEntries.length) alerts.push({ tone: 'warning', label: 'אין עדיין נתוני מעקב לביצועים.' });
    if (!alerts.length) alerts.push({ tone: 'success', label: 'הפרויקט מתקדם בצורה תקינה.' });

    return {
      project,
      clientName,
      clientWorkspace,
      paymentEntries,
      trackingEntries,
      trackingSummary,
      tasks,
      scripts,
      activity,
      shootDays,
      totals: {
        total,
        paid,
        due,
        status,
      },
      alerts,
      overdue,
    };
  }

  ns.workspaceModel = {
    getClientWorkspace,
    getProjectWorkspace,
    getStatus,
  };
})(window);
