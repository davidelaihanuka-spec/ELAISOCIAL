(function initReelDashboard(global) {
  const ns = global.REELApp = global.REELApp || {};

  function daysUntil(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    date.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.round((date - now) / 86400000);
  }

  function formatShortDate(dateString) {
    if (!dateString) return 'ללא תאריך';
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
    });
  }

  function cardRow(label, value, className) {
    return `<div class="dash-mini-card ${className || ''}">
      <div class="dash-mini-label">${label}</div>
      <div class="dash-mini-value">${value}</div>
    </div>`;
  }

  function renderListSection(title, items, emptyText) {
    return `<section class="dash-panel">
      <div class="dash-panel-head">
        <h3>${title}</h3>
      </div>
      <div class="dash-list">
        ${items.length ? items.join('') : `<div class="dash-empty">${emptyText}</div>`}
      </div>
    </section>`;
  }

  function render() {
    const root = document.getElementById('dashboard-grid');
    if (!root) return;

    const projects = global.projects || [];
    const scripts = global.scriptsData || [];
    const activity = global.activityLog || [];
    const shootDays = global.shootDaysData || [];
    const clientData = global.clientData || {};

    const overdueProjects = projects
      .filter((project) => project.stage !== 'published' && daysUntil(project.deadline) < 0)
      .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));

    const weekProjects = projects
      .filter((project) => {
        const days = daysUntil(project.deadline);
        return project.stage !== 'published' && days !== null && days >= 0 && days <= 7;
      })
      .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));

    const upcomingShootDays = [...shootDays]
      .filter((item) => {
        const days = daysUntil(item.date);
        return days !== null && days >= 0;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);

    const unpaidProjects = projects
      .filter((project) => project.paid !== 'paid')
      .sort((a, b) => (+b.price || 0) - (+a.price || 0));

    const recentActivity = [...activity].sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 7);
    const shootScripts = scripts.filter((script) => script.status !== 'filmed').length;
    const activeProjects = projects.filter((project) => project.stage !== 'published').length;
    const unpaidAmount = unpaidProjects.reduce((sum, project) => sum + (+project.price || 0), 0);
    const activeClients = Object.keys(clientData).length || new Set(projects.map((project) => project.client)).size;

    root.innerHTML = `
      <div class="dash-hero">
        <div class="dash-hero-copy">
          <div class="dash-eyebrow">Dashboard</div>
          <h2>מה דורש טיפול עכשיו</h2>
          <p>סקירה מהירה של הדדליינים, ימי הצילום, התשלומים והפעילות האחרונה.</p>
        </div>
        <div class="dash-mini-grid">
          ${cardRow('פרויקטים פעילים', activeProjects)}
          ${cardRow('לקוחות פעילים', activeClients)}
          ${cardRow('תסריטים פתוחים', shootScripts)}
          ${cardRow('ממתין לתשלום', `₪${unpaidAmount.toLocaleString()}`, 'danger')}
        </div>
      </div>
      <div class="dash-panels">
        ${renderListSection(
          'דדליינים שעברו',
          overdueProjects.slice(0, 6).map((project) => `
            <button class="dash-row-btn" data-open-project="${project.id}">
              <span class="dash-row-main">
                <strong>${project.name}</strong>
                <small>${project.client || 'ללא לקוח'}</small>
              </span>
              <span class="dash-pill danger">${Math.abs(daysUntil(project.deadline))} ימים באיחור</span>
            </button>
          `),
          'אין פרויקטים באיחור כרגע.'
        )}
        ${renderListSection(
          'השבוע הקרוב',
          weekProjects.slice(0, 6).map((project) => `
            <button class="dash-row-btn" data-open-project="${project.id}">
              <span class="dash-row-main">
                <strong>${project.name}</strong>
                <small>${project.client || 'ללא לקוח'} · ${formatShortDate(project.deadline)}</small>
              </span>
              <span class="dash-pill">${daysUntil(project.deadline) === 0 ? 'היום' : `עוד ${daysUntil(project.deadline)} ימים`}</span>
            </button>
          `),
          'אין דדליינים קרובים.'
        )}
        ${renderListSection(
          'ימי צילום קרובים',
          upcomingShootDays.map((shootDay) => `
            <button class="dash-row-btn" data-open-shootday="${shootDay.date}">
              <span class="dash-row-main">
                <strong>${shootDay.client_name || shootDay.client || 'יום צילום'}</strong>
                <small>${formatShortDate(shootDay.date)}${shootDay.notes ? ` · ${shootDay.notes}` : ''}</small>
              </span>
              <span class="dash-pill accent">יום צילום</span>
            </button>
          `),
          'עדיין אין ימי צילום עתידיים.'
        )}
        ${renderListSection(
          'תשלומים פתוחים',
          unpaidProjects.slice(0, 6).map((project) => `
            <button class="dash-row-btn" data-open-payment="${project.client || ''}">
              <span class="dash-row-main">
                <strong>${project.name}</strong>
                <small>${project.client || 'ללא לקוח'}</small>
              </span>
              <span class="dash-pill warning">₪${(+project.price || 0).toLocaleString()}</span>
            </button>
          `),
          'כל הפרויקטים מסומנים כשולמו.'
        )}
        ${renderListSection(
          'פעילות אחרונה',
          recentActivity.map((entry) => `
            <div class="dash-row-static">
              <span class="dash-row-main">
                <strong>${entry.action || 'עדכון'}</strong>
                <small>${entry.project || entry.client || 'ללא פריט'} · ${new Date(entry.ts || Date.now()).toLocaleDateString('he-IL')}</small>
              </span>
              <span class="dash-pill subtle">${entry.icon || '•'}</span>
            </div>
          `),
          'אין פעילות אחרונה להצגה.'
        )}
      </div>
    `;
  }

  ns.dashboard = { render, daysUntil, formatShortDate };
})(window);
