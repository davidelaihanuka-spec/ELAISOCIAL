(function initReelReceiptsView(global) {
  const ns = global.REELApp = global.REELApp || {};

  function currency(value) {
    return `₪${(+value || 0).toLocaleString('he-IL')}`;
  }

  function renderStatCard(label, value, hint, tone) {
    return `<div class="receipt-stat-card ${tone || ''}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </div>`;
  }

  function renderEntryRow(entry, mode) {
    return `
      <div class="receipt-row" data-entry-id="${entry.id}">
        <div class="receipt-row-main">
          <div class="receipt-row-title">
            <strong>${entry.clientName}</strong>
            <span class="receipt-kind ${entry.sourceType}">${entry.sourceLabel}</span>
            <span class="receipt-state ${entry.receiptState}">${entry.receiptStateLabel}</span>
          </div>
          <div class="receipt-row-sub">
            <span>${entry.sourceName}</span>
            <span>${ns.ledger?.formatDate?.(entry.paidAt) || 'ללא תאריך'}</span>
            <span>${ns.ledger?.getMethodLabel?.(entry.method) || entry.method || 'ללא אמצעי'}</span>
            ${entry.note ? `<span>${entry.note}</span>` : ''}
          </div>
        </div>
        <div class="receipt-row-side">
          <strong>${currency(entry.amount)}</strong>
          <div class="receipt-row-actions">
            <button type="button" class="receipt-action-btn" data-open-source="${entry.id}">פתח תשלום</button>
            ${entry.receipt ? '<button type="button" class="receipt-action-btn accent" data-open-receipt="' + entry.id + '">צפה</button>' : ''}
            ${mode !== 'sent' ? '<button type="button" class="receipt-action-btn subtle" data-toggle-sent="' + entry.clientName + '">' + (entry.clientReceiptSent ? 'סמן כלא נשלח' : 'סמן כנשלח') + '</button>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderClientRow(item) {
    return `
      <div class="receipt-client-row">
        <div class="receipt-client-main">
          <strong>${item.clientName}</strong>
          <small>${item.entryCount} תנועות · ${currency(item.total)}</small>
        </div>
        <div class="receipt-client-side">
          <span class="receipt-client-meta">${item.withReceipt} עם אסמכתא · ${item.missingReceipt} חסרות</span>
          <button type="button" class="receipt-action-btn ${item.sent ? 'subtle' : 'accent'}" data-toggle-sent="${item.clientName}">
            ${item.sent ? 'סמן כלא נשלח' : 'סמן כנשלח'}
          </button>
        </div>
      </div>
    `;
  }

  function bind(root, overview) {
    root.querySelectorAll('[data-open-source]').forEach((button) => {
      button.addEventListener('click', () => {
        const entry = overview.entries.find((item) => item.id === button.dataset.openSource);
        ns.receipts?.openPaymentSource?.(entry);
      });
    });

    root.querySelectorAll('[data-open-receipt]').forEach((button) => {
      button.addEventListener('click', () => {
        const entry = overview.entries.find((item) => item.id === button.dataset.openReceipt);
        if (!entry?.receipt) return;
        ns.receipts?.openReceiptLightbox?.(entry.receipt, entry.receiptName, entry.receiptType);
      });
    });

    root.querySelectorAll('[data-toggle-sent]').forEach((button) => {
      button.addEventListener('click', () => {
        ns.receipts?.toggleClientReceipt?.(button.dataset.toggleSent);
        render();
      });
    });
  }

  function render() {
    const root = global.document.getElementById('receipts-grid');
    if (!root || !ns.receipts) return;

    const overview = ns.receipts.getOverview();
    const focusEntries = [...overview.missingEntries, ...overview.readyEntries].slice(0, 8);
    const sentEntries = overview.sentEntries.slice(0, 8);

    root.innerHTML = `
      <section class="receipts-hero">
        <div class="receipts-hero-copy">
          <div class="dash-eyebrow">Receipts</div>
          <h2>ניהול קבלות ואסמכתאות</h2>
          <p>כל האסמכתאות של הפרויקטים והחבילות במקום אחד. כאן רואים מה חסר, מה מוכן לשליחה, ומה כבר סומן כנשלח ללקוח.</p>
        </div>
        <div class="receipts-stat-grid">
          ${renderStatCard('תנועות עם אסמכתא', overview.withReceipt, `${overview.totalEntries} תנועות בסך הכל`, 'success')}
          ${renderStatCard('חסרות אסמכתאות', overview.missing, 'תשלומים שעדיין אין להם קובץ מצורף', 'danger')}
          ${renderStatCard('מוכן לשליחה', overview.readyToSend, 'יש קובץ אבל הלקוח עוד לא סומן כקיבל', 'warning')}
          ${renderStatCard('סומן כנשלח', overview.sent, 'תנועות עם קבלה שסומנה כנשלחה', 'accent')}
        </div>
      </section>
      <section class="receipts-panels">
        <div class="receipts-panel receipts-panel-wide">
          <div class="receipts-panel-head">
            <h3>דורש טיפול</h3>
            <span>${focusEntries.length} פריטים</span>
          </div>
          <div class="receipts-list">
            ${focusEntries.length ? focusEntries.map((entry) => renderEntryRow(entry, 'open')).join('') : '<div class="receipts-empty">כרגע אין קבלות חסרות או ממתינות לשליחה.</div>'}
          </div>
        </div>
        <div class="receipts-panel">
          <div class="receipts-panel-head">
            <h3>מצב לקוחות</h3>
            <span>${overview.clientSummaries.length} לקוחות</span>
          </div>
          <div class="receipts-client-list">
            ${overview.clientSummaries.length ? overview.clientSummaries.map(renderClientRow).join('') : '<div class="receipts-empty">עדיין אין לקוחות עם תנועות תשלום.</div>'}
          </div>
        </div>
        <div class="receipts-panel receipts-panel-wide">
          <div class="receipts-panel-head">
            <h3>נשלח לאחרונה</h3>
            <span>${sentEntries.length} פריטים</span>
          </div>
          <div class="receipts-list">
            ${sentEntries.length ? sentEntries.map((entry) => renderEntryRow(entry, 'sent')).join('') : '<div class="receipts-empty">עדיין אין קבלות שסומנו כנשלחו.</div>'}
          </div>
        </div>
      </section>
    `;

    bind(root, overview);
  }

  ns.receiptsView = { render };
})(window);
