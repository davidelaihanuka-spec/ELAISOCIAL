(function initReelSearch(global) {
  const ns = global.REELApp = global.REELApp || {};

  function match(text, query) {
    return String(text || '').toLowerCase().includes(query);
  }

  function clear() {
    const input = document.getElementById('gs-input');
    const wrap = document.getElementById('gs-results');
    const clearButton = document.getElementById('gs-clear');
    if (input) input.value = '';
    if (wrap) wrap.style.display = 'none';
    if (clearButton) clearButton.style.display = 'none';
    global._gsResults = [];
    global._gsFocusIdx = -1;
  }

  function renderResults(query) {
    const q = String(query || '').trim().toLowerCase();
    const wrap = document.getElementById('gs-results');
    const clearButton = document.getElementById('gs-clear');
    if (!wrap) return;
    if (clearButton) clearButton.style.display = q ? '' : 'none';
    if (!q) {
      wrap.style.display = 'none';
      global._gsResults = [];
      return;
    }

    const projects = (global.projects || []).filter((project) => match(project.name, q) || match(project.client, q) || match(project.notes, q)).slice(0, 6).map((data) => ({ type: 'project', data }));
    const clients = Object.keys(global.clientData || {}).filter((name) => {
      const client = global.clientData[name] || {};
      return match(name, q) || match(client.phone, q) || match(client.email, q) || match(client.notes, q);
    }).slice(0, 5).map((name) => ({ type: 'client', data: { ...global.clientData[name], name } }));
    const scripts = (global.scriptsData || []).filter((script) => match(script.title, q) || match(script.client, q) || match(script.scene, q) || match(script.voiceover, q)).slice(0, 5).map((data) => ({ type: 'script', data }));
    const shootDays = (global.shootDaysData || []).filter((item) => match(item.client_name, q) || match(item.notes, q) || match(item.date, q)).slice(0, 4).map((data) => ({ type: 'shootday', data }));
    const payments = (global.projects || []).filter((project) => project.paid !== 'paid' && (match(project.name, q) || match(project.client, q))).slice(0, 4).map((data) => ({ type: 'payment', data }));
    const results = [...projects, ...clients, ...scripts, ...shootDays, ...payments];
    global._gsResults = results;
    global._gsFocusIdx = -1;

    if (!results.length) {
      wrap.innerHTML = '<div class="gs-empty">אין תוצאות</div>';
      wrap.style.display = '';
      return;
    }

    wrap.innerHTML = results.map((result, index) => {
      if (result.type === 'project') {
        return `<button class="gs-item" data-idx="${index}" data-gs-kind="project" data-id="${result.data.id}"><span class="gs-item-icon">🎬</span><span class="gs-item-main"><span class="gs-item-name">${result.data.name}</span><span class="gs-item-sub">${result.data.client || 'ללא לקוח'}</span></span><span class="gs-item-tag">פרויקט</span></button>`;
      }
      if (result.type === 'client') {
        return `<button class="gs-item" data-idx="${index}" data-gs-kind="client" data-id="${result.data.name}"><span class="gs-item-icon">🏢</span><span class="gs-item-main"><span class="gs-item-name">${result.data.name}</span><span class="gs-item-sub">${result.data.phone || result.data.email || 'לקוח'}</span></span><span class="gs-item-tag">לקוח</span></button>`;
      }
      if (result.type === 'script') {
        return `<button class="gs-item" data-idx="${index}" data-gs-kind="script" data-id="${result.data.id}"><span class="gs-item-icon">📝</span><span class="gs-item-main"><span class="gs-item-name">${result.data.title || 'תסריט'}</span><span class="gs-item-sub">${result.data.client || 'ללא לקוח'}</span></span><span class="gs-item-tag">תסריט</span></button>`;
      }
      if (result.type === 'shootday') {
        return `<button class="gs-item" data-idx="${index}" data-gs-kind="shootday" data-date="${result.data.date}"><span class="gs-item-icon">📅</span><span class="gs-item-main"><span class="gs-item-name">יום צילום</span><span class="gs-item-sub">${result.data.client_name || 'ללא לקוח'} · ${result.data.date}</span></span><span class="gs-item-tag">צילום</span></button>`;
      }
      return `<button class="gs-item" data-idx="${index}" data-gs-kind="payment" data-client="${result.data.client || ''}"><span class="gs-item-icon">💰</span><span class="gs-item-main"><span class="gs-item-name">${result.data.name}</span><span class="gs-item-sub">${result.data.client || 'ללא לקוח'} · ₪${(+result.data.price || 0).toLocaleString()}</span></span><span class="gs-item-tag">תשלום</span></button>`;
    }).join('');

    wrap.style.display = '';
  }

  function openResult(button) {
    if (!button) return;
    const kind = button.dataset.gsKind;
    clear();
    if (kind === 'project') return global.openProjectWorkspace?.(button.dataset.id) || global.openEdit?.(button.dataset.id);
    if (kind === 'client') {
      global.goView('clients');
      return global.setTimeout(() => global.openClientPanel(button.dataset.id), 120);
    }
    if (kind === 'script') {
      global.goView('scripts');
      return global.setTimeout(() => global.openScriptEdit(button.dataset.id), 120);
    }
    if (kind === 'shootday') {
      global.goView('calendar');
      return global.setTimeout(() => global.openSDP(button.dataset.date), 120);
    }
    if (kind === 'payment') {
      global.goView('payments');
      return global.setTimeout(() => global.openPayDetail(button.dataset.client), 160);
    }
  }

  function bind() {
    const wrap = document.getElementById('gs-results');
    if (!wrap) return;
    wrap.addEventListener('click', (event) => {
      const button = event.target.closest('.gs-item');
      if (!button) return;
      openResult(button);
    });
  }

  ns.search = { clear, renderResults, bind, openResult };
})(window);
