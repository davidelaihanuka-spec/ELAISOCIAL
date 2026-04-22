(function initReelReceipts(global) {
  const ns = global.REELApp = global.REELApp || {};

  function getClientReceiptSent(clientName) {
    return Boolean((global.clientData || {})[clientName]?.receiptSent);
  }

  function getSourceLabel(entry) {
    return entry.sourceType === 'package' ? 'חבילה' : 'פרויקט';
  }

  function getReceiptState(entry) {
    if (!entry?.receipt) return 'missing';
    return getClientReceiptSent(entry.clientName) ? 'sent' : 'attached';
  }

  function getReceiptStateLabel(state) {
    return {
      missing: 'חסרה אסמכתא',
      attached: 'מוכן לשליחה',
      sent: 'נשלח ללקוח',
    }[state] || state;
  }

  function listEntries() {
    const ledgerEntries = ns.ledger?.listEntries?.() || [];
    return ledgerEntries.map((entry) => ({
      ...entry,
      sourceLabel: getSourceLabel(entry),
      receiptState: getReceiptState(entry),
      receiptStateLabel: getReceiptStateLabel(getReceiptState(entry)),
      clientReceiptSent: getClientReceiptSent(entry.clientName),
    }));
  }

  function listClientSummaries() {
    const grouped = new Map();
    listEntries().forEach((entry) => {
      const current = grouped.get(entry.clientName) || {
        clientName: entry.clientName,
        entryCount: 0,
        total: 0,
        withReceipt: 0,
        missingReceipt: 0,
        sent: getClientReceiptSent(entry.clientName),
      };
      current.entryCount += 1;
      current.total += +entry.amount || 0;
      if (entry.receipt) current.withReceipt += 1;
      else current.missingReceipt += 1;
      current.sent = getClientReceiptSent(entry.clientName);
      grouped.set(entry.clientName, current);
    });
    return [...grouped.values()].sort((a, b) => b.total - a.total || a.clientName.localeCompare(b.clientName, 'he'));
  }

  function getOverview() {
    const entries = listEntries();
    const withReceipt = entries.filter((entry) => entry.receiptState !== 'missing');
    const missing = entries.filter((entry) => entry.receiptState === 'missing');
    const readyToSend = entries.filter((entry) => entry.receiptState === 'attached');
    const sent = entries.filter((entry) => entry.receiptState === 'sent');

    return {
      totalEntries: entries.length,
      withReceipt: withReceipt.length,
      missing: missing.length,
      readyToSend: readyToSend.length,
      sent: sent.length,
      entries,
      missingEntries: missing,
      readyEntries: readyToSend,
      sentEntries: sent,
      clientSummaries: listClientSummaries(),
    };
  }

  function openReceiptLightbox(receipt, receiptName, receiptType) {
    if (!receipt) return;
    global.document.getElementById('receipt-lb')?.remove();
    const lightbox = global.document.createElement('div');
    lightbox.id = 'receipt-lb';
    lightbox.className = 'receipt-lightbox';
    lightbox.onclick = () => lightbox.remove();

    const isPdf = String(receiptType || receipt).includes('pdf') || String(receipt).startsWith('data:application/pdf');
    const downloadName = receiptName || (isPdf ? 'receipt.pdf' : 'receipt');

    if (isPdf) {
      lightbox.innerHTML = `
        <div class="receipt-lightbox-card">
          <div class="receipt-lightbox-icon">📄</div>
          <div class="receipt-lightbox-title">קובץ קבלה / חשבונית</div>
          <div class="receipt-lightbox-sub">${downloadName}</div>
          <a href="${receipt}" download="${downloadName}" class="receipt-lightbox-download">הורד PDF</a>
        </div>
      `;
    } else {
      lightbox.innerHTML = `
        <div class="receipt-lightbox-image-wrap">
          <img src="${receipt}" class="receipt-lightbox-image" alt="Receipt preview">
          <a href="${receipt}" download="${downloadName}" class="receipt-lightbox-download floating">הורד</a>
        </div>
      `;
    }

    global.document.body.appendChild(lightbox);
  }

  function openPaymentSource(entry) {
    if (!entry) return;
    global.goView?.('payments');
    global.setTimeout(() => {
      global.openPayDetail?.(entry.clientName);
      global.setTimeout(() => {
        if (entry.sourceType === 'project') global.openProjPayPanel?.(entry.sourceId);
        else global.openPkgPayPanel?.(entry.clientName);
      }, 120);
    }, 120);
  }

  function toggleClientReceipt(clientName) {
    if (!clientName) return;
    if (typeof global.toggleReceipt === 'function') global.toggleReceipt(clientName);
    else {
      if (!global.clientData[clientName]) global.clientData[clientName] = {};
      global.clientData[clientName].receiptSent = !global.clientData[clientName].receiptSent;
      global.saveClients?.();
    }
  }

  ns.receipts = {
    listEntries,
    listClientSummaries,
    getOverview,
    getReceiptStateLabel,
    openReceiptLightbox,
    openPaymentSource,
    toggleClientReceipt,
  };
})(window);
