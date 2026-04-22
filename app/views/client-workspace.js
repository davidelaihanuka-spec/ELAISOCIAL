(function initReelClientWorkspaceView(global) {
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

  function updateTitle(name) {
    const title = global.document.getElementById('view-title');
    const mobile = global.document.getElementById('mob-view-title');
    const subtitle = global.document.getElementById('view-subtitle');
    if (title) title.textContent = name || 'לקוח';
    if (mobile) mobile.textContent = name || 'לקוח';
    if (subtitle) {
      subtitle.textContent = 'תמונת מצב מלאה של הלקוח, הפרויקטים, התשלומים והפעולות הבאות.';
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
    const root = global.document.getElementById('client-workspace-grid');
    if (!root) return;

    const ref = ns.state?.ui?.currentClientId || ns.state?.ui?.currentClientName;
    const ctx = ns.workspaceModel?.getClientWorkspace?.(ref);
    if (!ctx) {
      root.innerHTML = '<div class="workspace-empty">בחר לקוח כדי לראות כאן תמונת מצב מלאה.</div>';
      updateTitle('Client 360');
      return;
    }

    updateTitle(ctx.name);

    root.innerHTML = `
      <section class="workspace-hero">
        <div class="workspace-hero-copy">
          <div class="dash-eyebrow">Client 360</div>
          <h2>${ctx.name}</h2>
          <p>${ctx.data.notes || 'מרכז עבודה שמחבר את הלקוח, הפרויקטים, התשלומים והמשימות התפעוליות למסך אחד ברור יותר.'}</p>
          <div class="workspace-pill-row">
            ${ctx.data.phone ? `<span class="workspace-pill">${ctx.data.phone}</span>` : ''}
            ${ctx.data.email ? `<span class="workspace-pill">${ctx.data.email}</span>` : ''}
            ${ctx.packageSummary.exists ? `<span class="workspace-pill success">${ctx.packageSummary.totalVideos} סרטונים בחבילה</span>` : '<span class="workspace-pill">ללא חבילה פעילה</span>'}
          </div>
        </div>
        <div class="workspace-actions">
          <button type="button" class="settings-btn primary" data-client-workspace-action="new-project">פרויקט חדש</button>
          <button type="button" class="settings-btn" data-client-workspace-action="payments">פתח תשלומים</button>
          <button type="button" class="settings-btn" data-client-workspace-action="script">תסריט חדש</button>
          <button type="button" class="settings-btn" data-client-workspace-action="task">משימת מעקב</button>
          <button type="button" class="settings-btn" data-client-workspace-action="edit">ערוך פרטי לקוח</button>
        </div>
      </section>

      <section class="workspace-stat-grid">
        ${renderStat('פרויקטים פעילים', ctx.totals.activeProjects, `${ctx.totals.publishedProjects} פורסמו`, 'accent')}
        ${renderStat('סה"כ לחיוב', currency(ctx.totals.total), 'כולל חבילה ופרויקטים', 'info')}
        ${renderStat('שולם בפועל', currency(ctx.totals.paid), `${ctx.paymentEntries.length} תנועות`, 'success')}
        ${renderStat('עדיין פתוח', currency(ctx.totals.due), ctx.waitingProjects.length ? `${ctx.waitingProjects.length} ממתינים לאישור` : 'אין תשלום פתוח נוסף', ctx.totals.due > 0 ? 'danger' : 'success')}
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
            <h3>תמונת תשלום</h3>
            <span>${ctx.packageSummary.exists ? 'חבילה + פרויקטים' : 'פרויקטים נפרדים'}</span>
          </div>
          <div class="workspace-split-list">
            <div class="workspace-summary-row">
              <strong>פרויקטים נפרדים</strong>
              <span>${currency(ctx.totals.total - ctx.packageSummary.price)}</span>
            </div>
            <div class="workspace-summary-row">
              <strong>חבילה פעילה</strong>
              <span>${currency(ctx.packageSummary.price)}</span>
            </div>
            <div class="workspace-summary-row">
              <strong>שולם בפועל</strong>
              <span>${currency(ctx.totals.paid)}</span>
            </div>
            <div class="workspace-summary-row">
              <strong>נותר פתוח</strong>
              <span>${currency(ctx.totals.due)}</span>
            </div>
          </div>
          <div class="workspace-mini-list">
            ${(ctx.paymentEntries || []).slice(0, 4).map((entry) => `
              <button type="button" class="workspace-mini-row" data-client-workspace-action="payments">
                <span>
                  <strong>${entry.sourceName}</strong>
                  <small>${formatDate(entry.paidAt)} · ${entry.sourceType === 'package' ? 'חבילה' : 'פרויקט'}</small>
                </span>
                <span class="workspace-mini-amount">${currency(entry.amount)}</span>
              </button>
            `).join('') || '<div class="workspace-empty-inline">עדיין אין תנועות תשלום ללקוח הזה.</div>'}
          </div>
        </section>

        <section class="workspace-panel workspace-panel-wide">
          <div class="workspace-panel-head">
            <h3>פרויקטים של הלקוח</h3>
            <span>${ctx.projects.length} פרויקטים</span>
          </div>
          <div class="workspace-card-list">
            ${ctx.projects.map((project) => {
              const stage = global.STAGES?.[project.stage] || { label: project.stage || 'ללא שלב', color: 'var(--muted2)' };
              return `
                <button type="button" class="workspace-project-card" data-open-project-workspace="${project.id}">
                  <div class="workspace-project-top">
                    <strong>${project.name}</strong>
                    <span class="workspace-stage-chip" style="background:${stage.color}18;color:${stage.color}">${stage.label}</span>
                  </div>
                  <div class="workspace-project-meta">
                    <span>${formatDate(project.deadline, 'ללא דדליין')}</span>
                    <span>${currency(project.price)}</span>
                    <span>${project.paid === 'paid' ? 'שולם' : project.paid === 'partial' ? 'חלקי' : 'לא שולם'}</span>
                  </div>
                </button>
              `;
            }).join('') || '<div class="workspace-empty-inline">עדיין אין פרויקטים ללקוח הזה.</div>'}
          </div>
        </section>

        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>פעילות ולו"ז</h3>
            <span>${ctx.shootDays.length} ימי צילום · ${ctx.scripts.length} תסריטים</span>
          </div>
          <div class="workspace-mini-list">
            ${ctx.upcomingShootDay ? `
              <div class="workspace-mini-row static">
                <span>
                  <strong>יום צילום קרוב</strong>
                  <small>${formatDate(ctx.upcomingShootDay.date)}${ctx.upcomingShootDay.notes ? ` · ${ctx.upcomingShootDay.notes}` : ''}</small>
                </span>
                <span class="workspace-mini-tag success">צילום</span>
              </div>
            ` : ''}
            ${(ctx.activity || []).slice(0, 5).map((entry) => `
              <div class="workspace-mini-row static">
                <span>
                  <strong>${entry.action || 'עדכון'}</strong>
                  <small>${entry.project || ctx.name} · ${formatDate(entry.ts || Date.now())}</small>
                </span>
                <span class="workspace-mini-tag">${entry.icon || '•'}</span>
              </div>
            `).join('') || '<div class="workspace-empty-inline">אין עדיין פעילות אחרונה להצגה.</div>'}
          </div>
        </section>

        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>משימות ומעקבים</h3>
            <span>${ctx.tasks.length} משימות</span>
          </div>
          <div class="workspace-mini-list">
            ${(ctx.tasks || []).slice(0, 5).map((task) => `
              <button type="button" class="workspace-mini-row" data-client-workspace-action="task">
                <span>
                  <strong>${task.title}</strong>
                  <small>${formatDate(task.dueDate, 'ללא תאריך יעד')}${task.notes ? ` · ${task.notes}` : ''}</small>
                </span>
                <span class="workspace-mini-tag ${task.status === 'done' ? 'success' : ''}">${task.status === 'done' ? 'בוצע' : 'פתוח'}</span>
              </button>
            `).join('') || '<div class="workspace-empty-inline">עדיין אין משימות מעקב ללקוח הזה.</div>'}
          </div>
        </section>

        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>אנשי קשר והערות</h3>
            <span>גישה מהירה למידע תפעולי</span>
          </div>
          <div class="workspace-contact-list">
            <div><strong>איש קשר</strong><span>${ctx.data.contact || 'לא הוגדר'}</span></div>
            <div><strong>טלפון</strong><span>${ctx.data.phone || 'לא הוגדר'}</span></div>
            <div><strong>אימייל</strong><span>${ctx.data.email || 'לא הוגדר'}</span></div>
            <div><strong>אתר</strong><span>${ctx.data.website || 'לא הוגדר'}</span></div>
            <div><strong>כתובת</strong><span>${ctx.data.address || 'לא הוגדרה'}</span></div>
          </div>
          <div class="workspace-note-box">${ctx.data.notes || 'אין עדיין הערות על הלקוח.'}</div>
        </section>
      </div>
    `;
  }

  function open(ref) {
    const ctx = ns.workspaceModel?.getClientWorkspace?.(ref);
    if (!ctx) return;
    ns.state?.setCurrentClient?.(ctx.id, ctx.name);
    global.goView?.('client-workspace');
    render();
  }

  ns.clientWorkspaceView = { render, open };
  global.openClientWorkspace = open;
})(window);
