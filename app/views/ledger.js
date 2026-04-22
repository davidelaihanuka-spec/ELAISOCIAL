(function initReelLedgerView(global) {
  const ns = global.REELApp = global.REELApp || {};

  function currency(value) {
    return `₪${(+value || 0).toLocaleString('he-IL')}`;
  }

  function renderOverviewCard(label, value, hint) {
    return `<div class="ledger-stat-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </div>`;
  }

  function render() {
    const root = global.document.getElementById('ledger-grid');
    if (!root || !ns.ledger) return;

    const overview = ns.ledger.getOverview();
    const rows = overview.entries;

    root.innerHTML = `
      <section class="ledger-hero">
        <div class="ledger-hero-copy">
          <div class="dash-eyebrow">Ledger</div>
          <h2>כל הכסף במקום אחד</h2>
          <p>מסך תנועות מרכזי שמחבר בין תשלומי פרויקטים לתשלומי חבילות. זה הבסיס למסך כספים ברור יותר בהמשך.</p>
        </div>
        <div class="ledger-stat-grid">
          ${renderOverviewCard('סה"כ לחיוב', currency(overview.total), 'כולל פרויקטים וחבילות')}
          ${renderOverviewCard('שולם בפועל', currency(overview.paid), `${overview.receivedCount} תנועות`)}
          ${renderOverviewCard('עדיין פתוח', currency(overview.due), `${overview.unpaidClients} לקוחות עם חוב פתוח`)}
          ${renderOverviewCard('חבילות פעילות', overview.packageCount, 'לקוחות עם מסלול חבילה')}
        </div>
      </section>
      <section class="ledger-panel">
        <div class="ledger-panel-head">
          <h3>תנועות אחרונות</h3>
          <span>${rows.length} תנועות</span>
        </div>
        <div class="ledger-list">
          ${rows.length ? rows.map((entry) => `
            <button class="ledger-row" type="button" data-client="${entry.clientName}">
              <div class="ledger-row-main">
                <div class="ledger-row-title">
                  <strong>${entry.clientName}</strong>
                  <span class="ledger-kind ${entry.sourceType}">${entry.sourceType === 'package' ? 'חבילה' : 'פרויקט'}</span>
                </div>
                <div class="ledger-row-sub">
                  <span>${entry.sourceName}</span>
                  <span>${ns.ledger.formatDate(entry.paidAt)}</span>
                  <span>${ns.ledger.getMethodLabel(entry.method)}</span>
                  ${entry.note ? `<span>${entry.note}</span>` : ''}
                </div>
              </div>
              <div class="ledger-row-side">
                <strong>${currency(entry.amount)}</strong>
                <small>${ns.ledger.getStatusLabel(entry.status)}</small>
                ${entry.receipt ? '<span class="ledger-receipt">יש קבלה</span>' : ''}
              </div>
            </button>
          `).join('') : '<div class="ledger-empty">עדיין אין תנועות תשלום. הוסף תשלום למסך התשלומים כדי לראות אותו כאן.</div>'}
        </div>
      </section>
    `;

    root.querySelectorAll('.ledger-row').forEach((row) => {
      row.addEventListener('click', () => {
        global.goView?.('payments');
        global.setTimeout(() => global.openPayDetail?.(row.dataset.client), 120);
      });
    });
  }

  ns.ledgerView = { render };
})(window);
