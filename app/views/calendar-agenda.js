(function initReelCalendarAgenda(global) {
  const ns = global.REELApp = global.REELApp || {};

  function ensureAgendaShell() {
    const view = document.getElementById('view-calendar');
    if (!view || document.getElementById('calendar-mode-switch')) return;
    const nav = view.querySelector('.cal-nav');
    if (nav) {
      nav.insertAdjacentHTML('beforeend', `
        <div class="calendar-mode-switch" id="calendar-mode-switch">
          <button type="button" class="calendar-mode-btn active" data-calendar-mode="month">חודש</button>
          <button type="button" class="calendar-mode-btn" data-calendar-mode="agenda">אג׳נדה</button>
        </div>
      `);
    }
    const wrap = view.querySelector('.cal-wrap');
    if (wrap && !document.getElementById('calendar-agenda-list')) {
      wrap.insertAdjacentHTML('beforeend', `<div class="calendar-agenda-list" id="calendar-agenda-list" style="display:none"></div>`);
    }
  }

  function buildAgendaItems() {
    const items = [];
    (global.projects || []).forEach((project) => {
      if (!project.deadline || project.type === 'shootday') return;
      items.push({ id: project.id, date: project.deadline, title: project.name, subtitle: project.client || 'ללא לקוח', kind: 'project' });
    });
    (global.scriptsData || []).forEach((script) => {
      if (!script.shootDate) return;
      items.push({ id: script.id, date: script.shootDate, title: script.title || 'תסריט', subtitle: script.client || 'ללא לקוח', kind: 'script' });
    });
    (global.shootDaysData || []).forEach((shootDay) => {
      items.push({ id: shootDay.id, date: shootDay.date, title: `יום צילום${shootDay.client_name ? ` · ${shootDay.client_name}` : ''}`, subtitle: shootDay.notes || 'יום צילום מתוכנן', kind: 'shootday' });
    });
    return items.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function renderAgenda() {
    const container = document.getElementById('calendar-agenda-list');
    if (!container) return;
    const items = buildAgendaItems();
    container.innerHTML = items.length
      ? items.map((item) => `
          <button class="agenda-row" data-agenda-kind="${item.kind}" data-agenda-id="${item.id}" data-agenda-date="${item.date}">
            <span class="agenda-date">${new Date(item.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}</span>
            <span class="agenda-main">
              <strong>${item.title}</strong>
              <small>${item.subtitle}</small>
            </span>
            <span class="agenda-kind ${item.kind}">${item.kind === 'shootday' ? 'צילום' : item.kind === 'script' ? 'תסריט' : 'פרויקט'}</span>
          </button>
        `).join('')
      : `<div class="dash-empty">אין פריטים ביומן כרגע.</div>`;
  }

  function applyCalendarMode() {
    ensureAgendaShell();
    const mode = ns.state.ui.calendarMode;
    const grid = document.getElementById('cal-grid');
    const agenda = document.getElementById('calendar-agenda-list');
    if (!grid || !agenda) return;
    grid.style.display = mode === 'month' ? '' : 'none';
    agenda.style.display = mode === 'agenda' ? '' : 'block';
    document.querySelectorAll('[data-calendar-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.calendarMode === mode);
    });
    renderAgenda();
  }

  ns.calendarAgenda = { ensureAgendaShell, applyCalendarMode, renderAgenda };
})(window);
