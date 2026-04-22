(function initReelLedger(global) {
  const ns = global.REELApp = global.REELApp || {};

  function normalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value) {
    const date = normalizeDate(value);
    if (!date) return 'ללא תאריך';
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getProjectPaid(project) {
    if (!project) return 0;
    if (Array.isArray(project.paymentHistory) && project.paymentHistory.length) {
      return project.paymentHistory.reduce((sum, entry) => sum + (+entry.amount || 0), 0);
    }
    return project.paid === 'paid' ? (+project.price || 0) : (+project.paidAmount || 0);
  }

  function getPackagePaid(pkg) {
    if (!pkg) return 0;
    if (Array.isArray(pkg.paymentHistory) && pkg.paymentHistory.length) {
      return pkg.paymentHistory.reduce((sum, entry) => sum + (+entry.amount || 0), 0);
    }
    return pkg.paid === 'paid' ? (+pkg.price || 0) : (+pkg.paidAmount || 0);
  }

  function getStatusFromTotals(total, paid) {
    if ((+total || 0) <= 0) return 'unpaid';
    if ((+paid || 0) >= (+total || 0)) return 'paid';
    if ((+paid || 0) > 0) return 'partial';
    return 'unpaid';
  }

  function getStatusLabel(status) {
    return { paid: 'שולם', partial: 'שולם חלקית', unpaid: 'לא שולם' }[status] || status;
  }

  function getMethodLabel(method) {
    return { transfer: 'העברה', bit: 'ביט', cash: 'מזומן', check: "צ'ק" }[method] || method || 'ללא אמצעי';
  }

  function listClientNames() {
    const names = new Set(Object.keys(global.clientData || {}));
    (global.projects || []).forEach((project) => {
      if (project.client) names.add(project.client);
    });
    return [...names].sort((a, b) => String(a).localeCompare(String(b), 'he'));
  }

  function listEntries() {
    const entries = [];
    const projects = global.projects || [];
    const clientData = global.clientData || {};

    projects.forEach((project) => {
      (project.paymentHistory || []).forEach((entry, index) => {
        entries.push({
          id: entry.id || `proj_${project.id}_${index}`,
          clientName: project.client || 'ללא לקוח',
          sourceType: 'project',
          sourceId: project.id,
          sourceName: project.name || 'פרויקט',
          amount: +entry.amount || 0,
          paidAt: entry.date || entry.created_at || '',
          method: entry.method || '',
          note: entry.note || '',
          receipt: entry.receipt || '',
          receiptName: entry.receipt_name || '',
          receiptType: entry.receipt_type || '',
          total: +project.price || 0,
          status: getStatusFromTotals(+project.price || 0, getProjectPaid(project)),
        });
      });
    });

    Object.entries(clientData).forEach(([clientName, data]) => {
      const pkg = data.package;
      if (!pkg) return;
      (pkg.paymentHistory || []).forEach((entry, index) => {
        entries.push({
          id: entry.id || `pkg_${pkg.id || clientName}_${index}`,
          clientName,
          sourceType: 'package',
          sourceId: pkg.id || clientName,
          sourceName: pkg.name || 'חבילת סרטונים',
          amount: +entry.amount || 0,
          paidAt: entry.date || entry.created_at || '',
          method: entry.method || '',
          note: entry.note || '',
          receipt: entry.receipt || '',
          receiptName: entry.receipt_name || '',
          receiptType: entry.receipt_type || '',
          total: +pkg.price || 0,
          status: getStatusFromTotals(+pkg.price || 0, getPackagePaid(pkg)),
        });
      });
    });

    return entries.sort((a, b) => {
      const ta = normalizeDate(a.paidAt)?.getTime() || 0;
      const tb = normalizeDate(b.paidAt)?.getTime() || 0;
      return tb - ta;
    });
  }

  function getClientSummaries() {
    return listClientNames().map((name) => {
      const projects = (global.projects || []).filter((project) => project.client === name);
      const standaloneProjects = projects.filter((project) => !project.isPartOfPackage);
      const packageProjects = projects.filter((project) => project.isPartOfPackage);
      const clientInfo = (global.clientData || {})[name] || {};
      const pkg = clientInfo.package || null;
      const projectTotal = standaloneProjects.reduce((sum, project) => sum + (+project.price || 0), 0);
      const projectPaid = standaloneProjects.reduce((sum, project) => sum + getProjectPaid(project), 0);
      const packageTotal = +pkg?.price || 0;
      const packagePaid = getPackagePaid(pkg);
      const total = projectTotal + packageTotal;
      const paid = projectPaid + packagePaid;
      const due = Math.max(0, total - paid);
      const status = getStatusFromTotals(total, paid);
      return {
        name,
        projectCount: projects.length,
        standaloneCount: standaloneProjects.length,
        packageProjectCount: packageProjects.length,
        hasPackage: Boolean(pkg && (pkg.total || pkg.price || pkg.name)),
        packageName: pkg?.name || '',
        total,
        paid,
        due,
        progress: total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0,
        status,
      };
    }).filter((item) => item.projectCount || item.total || (global.clientData || {})[item.name])
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'he'));
  }

  function getOverview() {
    const summaries = getClientSummaries();
    const entries = listEntries();
    return {
      total: summaries.reduce((sum, item) => sum + item.total, 0),
      paid: summaries.reduce((sum, item) => sum + item.paid, 0),
      due: summaries.reduce((sum, item) => sum + item.due, 0),
      receivedCount: entries.length,
      unpaidClients: summaries.filter((item) => item.status !== 'paid' && item.total > 0).length,
      packageCount: summaries.filter((item) => item.hasPackage).length,
      summaries,
      entries,
    };
  }

  function renderLegacyPaymentsScreen() {
    const overview = getOverview();
    const summaryEl = global.document.getElementById('pay-summary');
    const tableEl = global.document.getElementById('pay-table');
    if (!summaryEl || !tableEl) return;

    summaryEl.innerHTML = `
      <div class="pay-sum"><div class="pay-sum-num" style="color:var(--text)">₪${overview.total.toLocaleString()}</div><div class="pay-sum-lbl">סה"כ לחיוב</div></div>
      <div class="pay-sum"><div class="pay-sum-num" style="color:var(--success)">₪${overview.paid.toLocaleString()}</div><div class="pay-sum-lbl">התקבל</div></div>
      <div class="pay-sum"><div class="pay-sum-num" style="color:var(--danger)">₪${overview.due.toLocaleString()}</div><div class="pay-sum-lbl">פתוח</div></div>
    `;

    tableEl.innerHTML = overview.summaries.map((item, index) => {
      const color = global.ac ? global.ac(item.name) : 'var(--accent)';
      const statusText = { paid: 'שולם הכל', partial: 'חלקי', unpaid: 'ממתין' }[item.status];
      const statusColor = { paid: 'var(--success)', partial: 'var(--warn)', unpaid: 'var(--danger)' }[item.status];
      return `<div class="pay-client-row" style="animation-delay:${index * 0.07}s" data-cname="${global.h ? global.h(item.name) : item.name}" onclick="openPayDetail(this.dataset.cname)">
        <div class="pay-client-head" style="cursor:pointer">
          <div class="pay-client-avatar" style="background:${color}20;color:${color}">${(item.name || '?').charAt(0)}</div>
          <div class="pay-client-info">
            <div class="pay-client-name">${global.h ? global.h(item.name) : item.name}</div>
            <div class="pay-client-sub">${item.projectCount} פרויקטים${item.hasPackage ? ' · חבילה פעילה' : ''}</div>
            <span class="pay-mob-amount" style="color:${statusColor}">₪${item.paid.toLocaleString()}</span>
            <span class="pay-mob-of">מתוך ₪${item.total.toLocaleString()}</span>
          </div>
          <div class="pay-client-head-right" style="text-align:left">
            <div style="font-size:18px;font-weight:900;color:${statusColor}">₪${item.paid.toLocaleString()}</div>
            <div style="font-size:10px;color:var(--muted2);margin-top:1px">פתוח ₪${item.due.toLocaleString()}</div>
          </div>
        </div>
        <div style="padding:0 16px 14px">
          <div style="height:6px;background:var(--s3);border-radius:6px;overflow:hidden">
            <div style="height:100%;width:${item.progress}%;background:${item.progress >= 100 ? 'var(--success)' : 'linear-gradient(90deg,var(--accent),var(--accent2))'};border-radius:6px;transition:width .6s"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:var(--muted2)">
            <span style="font-weight:700;color:${statusColor}">${statusText}</span>
            <span>${item.progress}% שולם</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function patchLegacyPaymentsView() {
    global.getProjectPaid = getProjectPaid;
    global.getPackagePaid = getPackagePaid;
    global.renderPayments = renderLegacyPaymentsScreen;
  }

  ns.ledger = {
    formatDate,
    getProjectPaid,
    getPackagePaid,
    getStatusLabel,
    getMethodLabel,
    listEntries,
    getClientSummaries,
    getOverview,
    patchLegacyPaymentsView,
  };
})(window);
