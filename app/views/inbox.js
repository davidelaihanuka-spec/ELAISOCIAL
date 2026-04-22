(function initReelInboxView(global) {
  const ns = global.REELApp = global.REELApp || {};

  function renderStat(label, value, hint, tone) {
    return `<div class="inbox-stat ${tone || ''}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </div>`;
  }

  function renderItems(items, emptyText) {
    if (!items.length) return `<div class="workspace-empty-inline">${emptyText}</div>`;
    return items.map((item) => `
      <button type="button" class="inbox-row ${item.tone || 'info'}" data-inbox-kind="${item.kind}" data-project-id="${item.projectId || ''}" data-client-name="${item.clientName || ''}" data-shoot-date="${item.shootDate || ''}">
        <div class="inbox-row-main">
          <strong>${item.title}</strong>
          <small>${item.description}</small>
        </div>
        <span class="inbox-row-cta">${item.cta || 'פתח'}</span>
      </button>
    `).join('');
  }

  function render() {
    const root = global.document.getElementById('inbox-grid');
    if (!root || !ns.inboxModel) return;

    const inbox = ns.inboxModel.getInbox();
    ns.shell?.updateInboxBadge?.(inbox.counts.urgent || 0);

    root.innerHTML = `
      <section class="inbox-hero">
        <div class="inbox-hero-copy">
          <div class="dash-eyebrow">Inbox</div>
          <h2>הפעולות שדורשות אותך עכשיו</h2>
          <p>מסך תפעולי שמרכז איחורים, תשלומים פתוחים, פרויקטים שמחכים ללקוח, ימי צילום קרובים וחוסרים בפרטי לקוחות.</p>
        </div>
        <div class="inbox-stat-grid">
          ${renderStat('דחוף עכשיו', inbox.counts.urgent, `${inbox.counts.overdue} באיחור`, inbox.counts.urgent ? 'danger' : 'success')}
          ${renderStat('תשלומים פתוחים', inbox.counts.unpaid, `${inbox.counts.waiting} ממתינים ללקוח`, 'warning')}
          ${renderStat('קרוב השבוע', inbox.counts.upcoming, 'ימי צילום ולו"ז קרוב', 'info')}
          ${renderStat('חוסרי מידע', inbox.counts.clientGaps, 'לקוחות בלי פרטי קשר מלאים', inbox.counts.clientGaps ? 'accent' : 'success')}
        </div>
      </section>
      <div class="inbox-panels">
        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>דחוף</h3>
            <span>${inbox.sections.urgent.length} פריטים</span>
          </div>
          <div class="inbox-list">
            ${renderItems(inbox.sections.urgent, 'אין כרגע פריטים דחופים.')}
          </div>
        </section>
        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <h3>השבוע הקרוב</h3>
            <span>${inbox.sections.upcoming.length} פריטים</span>
          </div>
          <div class="inbox-list">
            ${renderItems(inbox.sections.upcoming, 'אין כרגע אירועים קרובים לשבוע הקרוב.')}
          </div>
        </section>
        <section class="workspace-panel workspace-panel-wide">
          <div class="workspace-panel-head">
            <h3>מעקבי המשך</h3>
            <span>${inbox.sections.followUps.length} פריטים</span>
          </div>
          <div class="inbox-list">
            ${renderItems(inbox.sections.followUps, 'אין כרגע פריטי מעקב נוספים.')}
          </div>
        </section>
      </div>
    `;
  }

  ns.inboxView = { render };
})(window);
