(function initReelTasksView(global) {
  const ns = global.REELApp = global.REELApp || {};

  function formatDate(value, fallback) {
    if (!value) return fallback || 'ללא תאריך';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback || 'ללא תאריך';
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderTaskRow(task, mode) {
    const dueDays = ns.tasks?.daysUntil?.(task.dueDate);
    const dueLabel = dueDays === null ? 'ללא יעד' : dueDays < 0 ? `איחור של ${Math.abs(dueDays)} ימים` : dueDays === 0 ? 'היום' : `עוד ${dueDays} ימים`;
    return `
      <div class="task-row ${mode || ''}" data-task-id="${task.id}">
        <div class="task-row-main">
          <div class="task-row-title">
            <strong>${task.title}</strong>
            ${task.projectName ? `<span class="task-chip project">${task.projectName}</span>` : ''}
            ${task.clientName ? `<span class="task-chip client">${task.clientName}</span>` : ''}
          </div>
          <div class="task-row-sub">
            <span>${dueLabel}</span>
            ${task.notes ? `<span>${task.notes}</span>` : ''}
          </div>
        </div>
        <div class="task-row-actions">
          ${task.projectId ? '<button type="button" class="task-action-btn" data-open-project="' + task.projectId + '">פתח פרויקט</button>' : task.clientName ? '<button type="button" class="task-action-btn" data-open-client="' + task.clientName + '">פתח לקוח</button>' : ''}
          ${task.status === 'done'
            ? '<button type="button" class="task-action-btn subtle" data-reopen-task="' + task.id + '">פתח מחדש</button>'
            : '<button type="button" class="task-action-btn accent" data-complete-task="' + task.id + '">סמן כבוצע</button>'}
          <button type="button" class="task-action-btn subtle" data-delete-task="${task.id}">מחק</button>
        </div>
      </div>
    `;
  }

  function applyDraft(root) {
    const draft = ns.tasks?.consumeDraft?.();
    if (!draft) return;
    if (root.querySelector('#task-title')) root.querySelector('#task-title').value = draft.title || '';
    if (root.querySelector('#task-due-date')) root.querySelector('#task-due-date').value = draft.dueDate || '';
    if (root.querySelector('#task-notes')) root.querySelector('#task-notes').value = draft.notes || '';
    if (root.querySelector('#task-client-name')) root.querySelector('#task-client-name').value = draft.clientName || '';
    if (root.querySelector('#task-project-id')) root.querySelector('#task-project-id').value = draft.projectId || '';
    if (root.querySelector('#task-project-name')) root.querySelector('#task-project-name').value = draft.projectName || '';
  }

  function bind(root) {
    root.querySelector('#task-create-btn')?.addEventListener('click', () => {
      const title = root.querySelector('#task-title')?.value.trim();
      const dueDate = root.querySelector('#task-due-date')?.value || '';
      const notes = root.querySelector('#task-notes')?.value.trim() || '';
      const clientName = root.querySelector('#task-client-name')?.value.trim() || '';
      const projectId = root.querySelector('#task-project-id')?.value || '';
      const projectName = root.querySelector('#task-project-name')?.value || '';
      const task = ns.tasks?.create?.({ title, dueDate, notes, clientName, projectId, projectName });
      if (!task) {
        global.toast?.('נא להזין כותרת למשימה');
        return;
      }
      root.querySelector('#task-title').value = '';
      root.querySelector('#task-due-date').value = '';
      root.querySelector('#task-notes').value = '';
      root.querySelector('#task-client-name').value = clientName;
      root.querySelector('#task-project-id').value = projectId;
      root.querySelector('#task-project-name').value = projectName;
      global.toast?.('משימת מעקב נוספה');
      render();
      global.syncAll?.();
    });

    root.querySelectorAll('[data-complete-task]').forEach((button) => {
      button.addEventListener('click', () => {
        ns.tasks?.updateStatus?.(button.dataset.completeTask, 'done');
        render();
      });
    });

    root.querySelectorAll('[data-reopen-task]').forEach((button) => {
      button.addEventListener('click', () => {
        ns.tasks?.updateStatus?.(button.dataset.reopenTask, 'open');
        render();
      });
    });

    root.querySelectorAll('[data-delete-task]').forEach((button) => {
      button.addEventListener('click', () => {
        global.showConfirm?.({
          icon: '🗑️',
          title: 'מחיקת משימה',
          msg: 'המשימה תוסר מהרשימה. אפשר ליצור אותה שוב בהמשך אם צריך.',
          okText: 'מחק',
          okClass: 'danger',
          cancelText: 'ביטול',
        }, () => {
          ns.tasks?.remove?.(button.dataset.deleteTask);
          render();
        });
      });
    });

    root.querySelectorAll('[data-open-project]').forEach((button) => {
      button.addEventListener('click', () => global.openProjectWorkspace?.(button.dataset.openProject));
    });

    root.querySelectorAll('[data-open-client]').forEach((button) => {
      button.addEventListener('click', () => global.openClientWorkspace?.(button.dataset.openClient));
    });
  }

  function render() {
    const root = global.document.getElementById('tasks-grid');
    if (!root || !ns.tasks) return;

    const overview = ns.tasks.getOverview();

    root.innerHTML = `
      <section class="tasks-hero">
        <div class="tasks-hero-copy">
          <div class="dash-eyebrow">Tasks</div>
          <h2>משימות ומעקבי המשך</h2>
          <p>כאן נשמרים כל ה"לא לשכוח" של העבודה: לעקוב אחרי לקוח, לסגור תשלום, לבקש אישור, או לטפל בפרויקט בזמן הנכון.</p>
        </div>
        <div class="tasks-stat-grid">
          <div class="tasks-stat-card"><span>פתוחות</span><strong>${overview.open.length}</strong><small>כל המשימות שעדיין לא הושלמו</small></div>
          <div class="tasks-stat-card danger"><span>באיחור</span><strong>${overview.overdue.length}</strong><small>דורש טיפול מיידי</small></div>
          <div class="tasks-stat-card warning"><span>היום / השבוע</span><strong>${overview.today.length + overview.upcoming.length}</strong><small>משימות קרובות</small></div>
          <div class="tasks-stat-card success"><span>הושלמו</span><strong>${overview.done.length}</strong><small>נסגרו בהצלחה</small></div>
        </div>
      </section>

      <section class="tasks-panel">
        <div class="tasks-panel-head">
          <h3>משימת מעקב חדשה</h3>
          <span>תוכל לקשור אותה ללקוח או לפרויקט</span>
        </div>
        <div class="tasks-form-grid">
          <div class="fg">
            <label class="fl">כותרת משימה *</label>
            <input class="fi" id="task-title" placeholder="למשל: לשלוח תזכורת ללקוח">
          </div>
          <div class="fg">
            <label class="fl">תאריך יעד</label>
            <input class="fi" id="task-due-date" type="date">
          </div>
          <div class="fg">
            <label class="fl">לקוח</label>
            <input class="fi" id="task-client-name" placeholder="שם לקוח">
          </div>
          <div class="fg">
            <label class="fl">פרויקט</label>
            <input class="fi" id="task-project-name" placeholder="שם פרויקט">
            <input type="hidden" id="task-project-id">
          </div>
        </div>
        <div class="fg">
          <label class="fl">הערות</label>
          <textarea class="fi" id="task-notes" rows="3" placeholder="מה בדיוק צריך לעשות או לבדוק"></textarea>
        </div>
        <div class="tasks-form-actions">
          <button type="button" class="settings-btn primary" id="task-create-btn">הוסף משימה</button>
        </div>
      </section>

      <div class="tasks-panels">
        <section class="tasks-panel">
          <div class="tasks-panel-head">
            <h3>דורש טיפול עכשיו</h3>
            <span>${overview.overdue.length} משימות</span>
          </div>
          <div class="tasks-list">
            ${overview.overdue.length ? overview.overdue.map((task) => renderTaskRow(task, 'danger')).join('') : '<div class="tasks-empty">אין כרגע משימות באיחור.</div>'}
          </div>
        </section>
        <section class="tasks-panel">
          <div class="tasks-panel-head">
            <h3>קרוב לביצוע</h3>
            <span>${overview.today.length + overview.upcoming.length} משימות</span>
          </div>
          <div class="tasks-list">
            ${[...overview.today, ...overview.upcoming].length ? [...overview.today, ...overview.upcoming].map((task) => renderTaskRow(task, 'warning')).join('') : '<div class="tasks-empty">אין כרגע משימות קרובות.</div>'}
          </div>
        </section>
        <section class="tasks-panel tasks-panel-wide">
          <div class="tasks-panel-head">
            <h3>הושלמו לאחרונה</h3>
            <span>${overview.done.length} משימות</span>
          </div>
          <div class="tasks-list">
            ${overview.done.length ? overview.done.slice(0, 10).map((task) => renderTaskRow(task, 'done')).join('') : '<div class="tasks-empty">עדיין אין משימות שהושלמו.</div>'}
          </div>
        </section>
      </div>
    `;

    applyDraft(root);
    bind(root);
  }

  ns.tasksView = { render };
})(window);
