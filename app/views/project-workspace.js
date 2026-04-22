(function initReelProjectWorkspaceView(global) {
  const ns = global.REELApp = global.REELApp || {};

  function currency(value) {
    return `₪${(+value || 0).toLocaleString('he-IL')}`;
  }

  function formatDate(value, fallback) {
    if (!value) return fallback || 'ללא תאריך';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback || 'ללא תאריך';
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function updateTitle(projectName) {
    const title = global.document.getElementById('view-title');
    const mobile = global.document.getElementById('mob-view-title');
    const subtitle = global.document.getElementById('view-subtitle');
    if (title) title.textContent = projectName || 'פרויקט';
    if (mobile) mobile.textContent = projectName || 'פרויקט';
    if (subtitle) {
      subtitle.textContent = 'מסך עבודה לפרויקט אחד: מצב ביצוע, תשלום, קבצים, מעקב והקשר ללקוח.';
      subtitle.style.display = '';
    }
  }

  function renderStat(label, value, hint, tone) {
    return `<div class="workspace-stat ${tone || ''}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </div>`;
  }

  function renderAlert(item) {
    return `<div class="workspace-alert ${item.tone || 'info'}">${item.label}</div>`;
  }

  function render() {
    const root = global.document.getElementById('project-workspace-grid');
    if (!root) return;

    const projectId = ns.state?.ui?.currentProjectId;
    const ctx = ns.workspaceModel?.getProjectWorkspace?.(projectId);
    if (!ctx) {
      root.innerHTML = '<div class="workspace-empty">בחר פרויקט כדי לפתוח כאן סביבת עבודה מלאה.</div>';
      updateTitle('Project Workspace');
      return;
    }

    const project = ctx.project;
    const stage = global.STAGES?.[project.stage] || { label: project.stage || 'ללא שלב', color: 'var(--muted2)' };
    updateTitle(project.name);

    root.innerHTML = `
      <section class="workspace-hero project">
        <div class="workspace-hero-copy">
          <div class="dash-eyebrow">Project Workspace</div>
          <h2>${project.name}</h2>
          <p>${project.notes || 'מרכז עבודה לפרויקט אחד עם כל מה שצריך כדי להחליט מה הצעד הבא, האם התשלום מסודר, והאם הביצועים נאספים כמו שצריך.'}</p>
          <div class="workspace-pill-row">
            <span class="workspace-pill">${ctx.clientName || 'ללא לקוח'}</span>
            <span class="workspace-pill" style="background:${stage.color}18;color:${stage.color}">${stage.label}</span>
            <span class="workspace-pill ${ctx.totals.status === 'paid' ? 'success' : ctx.totals.status === 'partial' ? 'warning' : ''}">
              ${ctx.totals.status === 'paid' ? 'שולם' : ctx.totals.status === 'partial' ? 'שולם חלקית' : 'לא שולם'}
            </span>
          </div>
        </div>
        <div class="workspace-actions">
          <button type="button" class="settings-btn primary" data-project-workspace-action="edit">ערוך פרויקט</button>
          <button type="button" class="settings-btn" data-project-workspace-action="payments">ניהול תשלום</button>
          <button type="button" class="settings-btn" data-project-workspace-action="tracking">הוסף מעקב</button>
          <button type="button" class="settings-btn" data-project-workspace-action="task">משימת מעקב</button>
          <button type="button" class="settings-btn" data-project-workspace-action="client">פתח לקוח</button>
        </div>
      </section>

      <section class="workspace-stat-grid">
        ${renderStat('דדליין', formatDate(project.deadline, 'ללא דדליין'), ctx.overdue ? 'באיחור' : 'במסלול', ctx.overdue ? 'danger' : 'accent')}
        ${renderStat('התקדמות', `${project.progress || 0}%`, stage.label, 'info')}
        ${renderStat('שולם בפועל', currency(ctx.totals.paid), `${ctx.paymentEntries.length} תשלומים`, 'success')}
        ${renderStat('נותר פתוח', currency(ctx.totals.due), ctx.totals.status === 'paid' ? 'נסגר במלואו' : 'עדיין דורש מעקב', ctx.totals.due > 0 ? 'danger' : 'success')}
      </section>

      <div class="workspace-panels">
        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>מה דורש טיפול</h3>
            <span>${ctx.alerts.length} נקודות</span>
          </div>
          <div class="workspace-alert-list">
            ${ctx.alerts.map(renderAlert).join('')}
          </div>
        </section>

        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>כסף וקבצים</h3>
            <span>${currency(project.price)} סה"כ</span>
          </div>
          <div class="workspace-split-list">
            <div class="workspace-summary-row"><strong>מחיר פרויקט</strong><span>${currency(project.price)}</span></div>
            <div class="workspace-summary-row"><strong>שולם</strong><span>${currency(ctx.totals.paid)}</span></div>
            <div class="workspace-summary-row"><strong>פתוח</strong><span>${currency(ctx.totals.due)}</span></div>
            <div class="workspace-summary-row"><strong>קבצים מצורפים</strong><span>${(project.files || []).length}</span></div>
          </div>
          <div class="workspace-link-card">
            <strong>Google Drive</strong>
            <span>${project.drive || 'עדיין אין קישור שמור לפרויקט הזה.'}</span>
          </div>
        </section>

        <section class="workspace-panel workspace-panel-wide">
          <div class="workspace-panel-head">
            <h3>תשלומים אחרונים</h3>
            <span>${ctx.paymentEntries.length} תנועות</span>
          </div>
          <div class="workspace-mini-list">
            ${ctx.paymentEntries.map((entry) => `
              <button type="button" class="workspace-mini-row" data-project-workspace-action="payments">
                <span>
                  <strong>${currency(entry.amount)}</strong>
                  <small>${formatDate(entry.date || entry.created_at)}${entry.method ? ` · ${entry.method}` : ''}</small>
                </span>
                <span class="workspace-mini-tag ${entry.receipt ? 'success' : ''}">${entry.receipt ? 'קבלה' : 'ללא קבלה'}</span>
              </button>
            `).join('') || '<div class="workspace-empty-inline">עדיין אין תשלומים לפרויקט הזה.</div>'}
          </div>
        </section>

        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>ביצועים ומעקב</h3>
            <span>${ctx.trackingEntries.length} רשומות</span>
          </div>
          <div class="workspace-split-list">
            <div class="workspace-summary-row"><strong>צפיות מצטברות</strong><span>${(+ctx.trackingSummary.views || 0).toLocaleString('he-IL')}</span></div>
            <div class="workspace-summary-row"><strong>לייקים</strong><span>${(+ctx.trackingSummary.likes || 0).toLocaleString('he-IL')}</span></div>
            <div class="workspace-summary-row"><strong>תגובות</strong><span>${(+ctx.trackingSummary.comments || 0).toLocaleString('he-IL')}</span></div>
            <div class="workspace-summary-row"><strong>שמירות/שיתופים</strong><span>${((+ctx.trackingSummary.saves || 0) + (+ctx.trackingSummary.shares || 0)).toLocaleString('he-IL')}</span></div>
          </div>
          <div class="workspace-mini-list">
            ${ctx.trackingSummary.latest ? `
              <div class="workspace-mini-row static">
                <span>
                  <strong>הרשומה האחרונה</strong>
                  <small>${formatDate(ctx.trackingSummary.latest.trackedAt || ctx.trackingSummary.latest.date || ctx.trackingSummary.latest.created_at)}</small>
                </span>
                <span class="workspace-mini-amount">${(+ctx.trackingSummary.latest.views || 0).toLocaleString('he-IL')} צפיות</span>
              </div>
            ` : '<div class="workspace-empty-inline">עדיין אין נתוני מעקב לפרויקט הזה.</div>'}
          </div>
        </section>

        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>סקריפטים, לו"ז ופעילות</h3>
            <span>${ctx.scripts.length} תסריטים</span>
          </div>
          <div class="workspace-mini-list">
            ${ctx.scripts.map((script) => `
              <div class="workspace-mini-row static">
                <span>
                  <strong>${script.title || 'תסריט'}</strong>
                  <small>${script.status || 'draft'}${script.shootDate ? ` · ${formatDate(script.shootDate)}` : ''}</small>
                </span>
                <span class="workspace-mini-tag">תסריט</span>
              </div>
            `).join('')}
            ${ctx.shootDays.slice(0, 2).map((item) => `
              <div class="workspace-mini-row static">
                <span>
                  <strong>יום צילום קשור</strong>
                  <small>${formatDate(item.date)}${item.notes ? ` · ${item.notes}` : ''}</small>
                </span>
                <span class="workspace-mini-tag success">צילום</span>
              </div>
            `).join('')}
            ${(ctx.activity || []).slice(0, 4).map((entry) => `
              <div class="workspace-mini-row static">
                <span>
                  <strong>${entry.action || 'עדכון'}</strong>
                  <small>${formatDate(entry.ts || Date.now())}</small>
                </span>
                <span class="workspace-mini-tag">${entry.icon || '•'}</span>
              </div>
            `).join('') || '<div class="workspace-empty-inline">אין עדיין פעילות אחרונה להצגה.</div>'}
          </div>
        </section>

        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>משימות מעקב</h3>
            <span>${ctx.tasks.length} משימות</span>
          </div>
          <div class="workspace-mini-list">
            ${(ctx.tasks || []).slice(0, 5).map((task) => `
              <button type="button" class="workspace-mini-row" data-project-workspace-action="task">
                <span>
                  <strong>${task.title}</strong>
                  <small>${formatDate(task.dueDate, 'ללא תאריך יעד')}${task.notes ? ` · ${task.notes}` : ''}</small>
                </span>
                <span class="workspace-mini-tag ${task.status === 'done' ? 'success' : ''}">${task.status === 'done' ? 'בוצע' : 'פתוח'}</span>
              </button>
            `).join('') || '<div class="workspace-empty-inline">עדיין אין משימות מעקב לפרויקט הזה.</div>'}
          </div>
        </section>
      </div>
    `;
  }

  function open(projectId) {
    if (!projectId) return;
    ns.state?.setCurrentProject?.(projectId);
    global.goView?.('project-workspace');
    render();
  }

  ns.projectWorkspaceView = { render, open };
  global.openProjectWorkspace = open;
})(window);
