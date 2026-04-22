(function initReelShell(global) {
  const ns = global.REELApp = global.REELApp || {};

  function injectShell() {
    const topbar = document.querySelector('.topbar');
    if (topbar && !document.getElementById('topbar-back-btn')) {
      topbar.insertAdjacentHTML('afterbegin', `
        <button type="button" class="topbar-back-btn" id="topbar-back-btn" aria-label="חזרה" title="חזרה" onclick="window.goBack && window.goBack()" hidden>
          <span class="topbar-back-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path></svg>
          </span>
          <span class="topbar-back-label">חזרה</span>
        </button>
      `);
    }
    const mobileTopbar = document.getElementById('mobile-topbar');
    if (mobileTopbar && !document.getElementById('mob-back-btn')) {
      mobileTopbar.insertAdjacentHTML('afterbegin', `
        <button type="button" class="mob-topbar-back" id="mob-back-btn" aria-label="חזרה" title="חזרה" onclick="window.goBack && window.goBack()" hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path></svg>
        </button>
      `);
    }
    if (topbar && !document.getElementById('topbar-actions')) {
      topbar.insertAdjacentHTML('beforeend', `
        <div class="topbar-actions" id="topbar-actions">
          <button type="button" class="topbar-chip" id="inbox-chip" onclick="goView('inbox')">Inbox</button>
          <button type="button" class="topbar-chip" id="sync-chip">לא מחובר</button>
          <button type="button" class="topbar-chip accent" id="auth-status-btn">חשבון</button>
        </div>
      `);
    }

    const sidebarCards = document.getElementById('card-nav');
    if (sidebarCards && !document.getElementById('cn-dashboard')) {
      sidebarCards.insertAdjacentHTML('afterbegin', `
        <div class="cn-card" id="cn-dashboard" onclick="cnClick('dashboard',this)">
          <div class="cn-bg" style="background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(0,229,160,.08))"></div>
          <div class="cn-header">
            <span class="cn-icon">✦</span>
            <span class="cn-label">דשבורד</span>
          </div>
        </div>
        <div class="cn-card" id="cn-inbox" onclick="cnClick('inbox',this)">
          <div class="cn-bg" style="background:linear-gradient(135deg,rgba(244,63,94,.10),rgba(245,158,11,.05))"></div>
          <div class="cn-header">
            <span class="cn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128v80a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V128a8,8,0,0,1,8-8H82.75l16.63,22.19a8,8,0,0,0,6.4,3.2h44.44a8,8,0,0,0,6.4-3.2L173.25,120H216A8,8,0,0,1,224,128Zm-21.44-77.66A16,16,0,0,0,189.85,44H66.15A16,16,0,0,0,53.44,50.34L19.09,93.28A8,8,0,0,0,25.34,106H84.11l16.63,22.18a8,8,0,0,0,6.4,3.2h41.72a8,8,0,0,0,6.4-3.2L171.89,106h58.77a8,8,0,0,0,6.25-12.72Z"></path></svg></span>
            <span class="cn-label">Inbox</span>
            <span class="cn-badge" id="cn-inbox-badge" style="display:none">0</span>
          </div>
        </div>
        <div class="cn-card" id="cn-tasks" onclick="cnClick('tasks',this)">
          <div class="cn-bg" style="background:linear-gradient(135deg,rgba(59,130,246,.10),rgba(14,165,233,.05))"></div>
          <div class="cn-header">
            <span class="cn-icon">✓</span>
            <span class="cn-label">משימות</span>
          </div>
        </div>
      `);
    }

    const paymentsCard = document.getElementById('cn-payments');
    if (paymentsCard && !document.getElementById('cn-insights')) {
      paymentsCard.insertAdjacentHTML('afterend', `
        <div class="cn-card" id="cn-receipts" onclick="cnClick('receipts',this)">
          <div class="cn-bg" style="background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(249,115,22,.05))"></div>
          <div class="cn-header">
            <span class="cn-icon">🧾</span>
            <span class="cn-label">קבלות</span>
          </div>
        </div>
        <div class="cn-card" id="cn-ledger" onclick="cnClick('ledger',this)">
          <div class="cn-bg" style="background:linear-gradient(135deg,rgba(34,197,94,.12),rgba(20,184,166,.05))"></div>
          <div class="cn-header">
            <span class="cn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M32,64A16,16,0,0,1,48,48H208a16,16,0,0,1,16,16v24a16,16,0,0,1-16,16H48A16,16,0,0,1,32,88Zm16,0V88H208V64Zm0,80H208v48H48Zm80,24a8,8,0,0,0-8-8H80a8,8,0,0,0,0,16h40A8,8,0,0,0,128,168Z"></path></svg></span>
            <span class="cn-label">Ledger</span>
          </div>
        </div>
        <div class="cn-card" id="cn-insights" onclick="cnClick('insights',this)">
          <div class="cn-bg" style="background:linear-gradient(135deg,rgba(20,184,166,.12),rgba(14,165,233,.05))"></div>
          <div class="cn-header">
            <span class="cn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M32,216a8,8,0,0,1-8-8V40a8,8,0,0,1,16,0V200H224a8,8,0,0,1,0,16ZM80,184a8,8,0,0,1-8-8V120a8,8,0,0,1,16,0v56A8,8,0,0,1,80,184Zm48,0a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v88A8,8,0,0,1,128,184Zm48,0a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0v120A8,8,0,0,1,176,184Z"></path></svg></span>
            <span class="cn-label">תובנות</span>
          </div>
        </div>
      `);
    }

    const historyCard = document.getElementById('cn-history');
    if (historyCard && !document.getElementById('cn-settings')) {
      historyCard.insertAdjacentHTML('afterend', `
        <div class="cn-card" id="cn-settings" onclick="cnClick('settings',this)">
          <div class="cn-bg" style="background:linear-gradient(135deg,rgba(148,163,184,.12),rgba(15,23,42,.05))"></div>
          <div class="cn-header">
            <span class="cn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-36.37V132.37a8,8,0,0,1-6.53,7.87l-17.67,3.22a64.8,64.8,0,0,1-5.54,13.35l10.08,14.88a8,8,0,0,1-1,10.18l-6.19,6.19a8,8,0,0,1-10.18,1l-14.88-10.08a64.8,64.8,0,0,1-13.35,5.54l-3.22,17.67a8,8,0,0,1-7.87,6.53H123.63a8,8,0,0,1-7.87-6.53l-3.22-17.67a64.8,64.8,0,0,1-13.35-5.54L84.31,189a8,8,0,0,1-10.18-1l-6.19-6.19a8,8,0,0,1-1-10.18l10.08-14.88a64.8,64.8,0,0,1-5.54-13.35l-17.67-3.22A8,8,0,0,1,48,132.37V123.63a8,8,0,0,1,6.53-7.87l17.67-3.22a64.8,64.8,0,0,1,5.54-13.35L67.66,84.31a8,8,0,0,1,1-10.18l6.19-6.19a8,8,0,0,1,10.18-1l14.88,10.08a64.8,64.8,0,0,1,13.35-5.54l3.22-17.67A8,8,0,0,1,123.63,48h8.74a8,8,0,0,1,7.87,6.53l3.22,17.67a64.8,64.8,0,0,1,13.35,5.54l14.88-10.08a8,8,0,0,1,10.18,1l6.19,6.19a8,8,0,0,1,1,10.18l-10.08,14.88a64.8,64.8,0,0,1,5.54,13.35l17.67,3.22A8,8,0,0,1,216,123.63Z"></path></svg></span>
            <span class="cn-label">הגדרות</span>
          </div>
        </div>
      `);
    }

    const content = document.querySelector('.content');
    if (content && !document.getElementById('view-dashboard')) {
      content.insertAdjacentHTML('afterbegin', `<div class="view" id="view-dashboard"><div class="dashboard-grid" id="dashboard-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-inbox')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-inbox"><div class="inbox-grid" id="inbox-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-onboarding')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-onboarding"><div class="onboarding-grid" id="onboarding-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-tasks')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-tasks"><div class="tasks-grid" id="tasks-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-insights')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-insights"><div class="insights-grid" id="insights-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-client-workspace')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-client-workspace"><div class="workspace-grid" id="client-workspace-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-ledger')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-ledger"><div class="ledger-grid" id="ledger-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-receipts')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-receipts"><div class="receipts-grid" id="receipts-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-project-workspace')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-project-workspace"><div class="workspace-grid" id="project-workspace-grid"></div></div>`);
    }

    if (content && !document.getElementById('view-settings')) {
      content.insertAdjacentHTML('beforeend', `<div class="view" id="view-settings"><div class="settings-grid" id="settings-grid"></div></div>`);
    }

    const dock = document.getElementById('dock');
    if (dock && !dock.querySelector('[data-view="dashboard"]')) {
      dock.insertAdjacentHTML('afterbegin', `<button class="dock-item" data-view="dashboard" onclick="dockClick('dashboard',this)"><div class="dock-icon">✦</div><span class="dock-label">דשבורד</span></button>`);
    }

    const dockDashboard = dock?.querySelector('[data-view="dashboard"]');
    if (dockDashboard && !dock.querySelector('[data-view="inbox"]')) {
      dockDashboard.insertAdjacentHTML('afterend', `<button class="dock-item" data-view="inbox" onclick="dockClick('inbox',this)"><div class="dock-icon">!</div><span class="dock-label">Inbox</span></button>`);
    }

    const dockInbox = dock?.querySelector('[data-view="inbox"]');
    if (dockInbox && !dock.querySelector('[data-view="tasks"]')) {
      dockInbox.insertAdjacentHTML('afterend', `<button class="dock-item" data-view="tasks" onclick="dockClick('tasks',this)"><div class="dock-icon">✓</div><span class="dock-label">משימות</span></button>`);
    }

    const dockPayments = dock?.querySelector('[data-view="payments"]');
    if (dockPayments && !dock.querySelector('[data-view="ledger"]')) {
      dockPayments.insertAdjacentHTML('afterend', `<button class="dock-item" data-view="ledger" onclick="dockClick('ledger',this)"><div class="dock-icon">₪</div><span class="dock-label">Ledger</span></button>`);
    }

    if (!document.getElementById('reel-auth-overlay')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div class="reel-auth-overlay" id="reel-auth-overlay">
          <div class="reel-auth-card" id="reel-auth-card">
            <div class="reel-auth-brand">REEL Cloud</div>
            <h1 id="auth-title">חיבור ל-Supabase</h1>
            <p id="auth-subtitle">הגדר את פרטי הפרויקט שלך ואז התחבר לחשבון כדי לטעון את הנתונים מהענן.</p>
            <div class="reel-auth-section" id="setup-section">
              <label class="reel-auth-label">Supabase URL</label>
              <input class="reel-auth-input" id="supabase-url-input" placeholder="https://your-project.supabase.co">
              <label class="reel-auth-label">Supabase Anon Key</label>
              <textarea class="reel-auth-input reel-auth-textarea" id="supabase-key-input" placeholder="eyJ..."></textarea>
              <label class="reel-auth-label">Storage Bucket</label>
              <input class="reel-auth-input" id="supabase-bucket-input" placeholder="reel-files">
              <div class="reel-auth-actions">
                <button type="button" class="reel-auth-btn primary" id="save-supabase-config-btn">שמור חיבור</button>
              </div>
            </div>
            <div class="reel-auth-section" id="login-section" style="display:none">
              <label class="reel-auth-label">אימייל</label>
              <input class="reel-auth-input" id="auth-email-input" type="email" placeholder="name@example.com">
              <label class="reel-auth-label">סיסמה</label>
              <input class="reel-auth-input" id="auth-password-input" type="password" placeholder="••••••••">
              <div class="reel-auth-actions">
                <button type="button" class="reel-auth-btn primary" id="auth-signin-btn">התחבר</button>
                <button type="button" class="reel-auth-btn" id="auth-signup-btn">צור משתמש</button>
                <button type="button" class="reel-auth-btn subtle" id="edit-supabase-config-btn">ערוך חיבור</button>
              </div>
            </div>
            <div class="reel-auth-status" id="reel-auth-status"></div>
          </div>
        </div>
      `);
    }

    const clientStats = document.getElementById('cp-stats');
    if (clientStats && !document.getElementById('client-tabbar')) {
      clientStats.insertAdjacentHTML('afterend', `
        <div class="client-tabbar" id="client-tabbar">
          <button type="button" class="client-tab active" data-client-tab="overview">סקירה</button>
          <button type="button" class="client-tab" data-client-tab="projects">פרויקטים</button>
          <button type="button" class="client-tab" data-client-tab="payments">תשלומים</button>
          <button type="button" class="client-tab" data-client-tab="notes">הערות</button>
        </div>
      `);
    }

    const clientBody = document.querySelector('.cp-body');
    if (clientBody && !document.getElementById('cp-payments-panel')) {
      clientBody.insertAdjacentHTML('beforeend', `
        <div class="cp-tab-panel" id="cp-payments-panel" data-client-panel="payments" style="display:none">
          <div class="cp-section-title">תמונת תשלומים</div>
          <div class="cp-payment-summary" id="cp-payment-summary"></div>
          <button type="button" class="cp-open-payments-btn" id="cp-open-payments-btn">פתח מסך תשלומים</button>
        </div>
      `);
    }
  }

  function showStatus(message, tone) {
    const status = document.getElementById('reel-auth-status');
    if (!status) return;
    status.textContent = message || '';
    status.dataset.tone = tone || 'neutral';
  }

  function showSetupMode() {
    if (!ns.config.canConfigureInApp()) {
      showHostedConfigMissingMode();
      return;
    }
    document.getElementById('setup-section').style.display = '';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('auth-title').textContent = 'חיבור ל-Supabase';
    document.getElementById('auth-subtitle').textContent = 'הגדר את כתובת הפרויקט, מפתח ה-anon, ושם ה-bucket לקבצים.';
    const cfg = ns.config.get();
    document.getElementById('supabase-url-input').value = cfg.url || '';
    document.getElementById('supabase-key-input').value = cfg.anonKey || '';
    document.getElementById('supabase-bucket-input').value = cfg.bucket || 'reel-files';
  }

  function showLoginMode() {
    document.getElementById('setup-section').style.display = 'none';
    document.getElementById('login-section').style.display = '';
    const editButton = document.getElementById('edit-supabase-config-btn');
    if (editButton) editButton.style.display = ns.config.canConfigureInApp() ? '' : 'none';
    document.getElementById('auth-title').textContent = 'כניסה לחשבון';
    document.getElementById('auth-subtitle').textContent = 'התחבר כדי לטעון, לסנכרן ולהגר את הנתונים לענן.';
  }

  function showHostedConfigMissingMode(message) {
    document.getElementById('setup-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('auth-title').textContent = '×”××¤×œ×™×§×¦×™×” ×× ×ž×•×’×“×¨×ª';
    document.getElementById('auth-subtitle').textContent = '×‘×¡×‘×™×‘×ª ××™×¨×•×— ×¦×¨×™×š ×œ×”×–×¨×™×§ ××ª ×”×’×“×¨×•×ª Supabase ×ž×”×§×•× ×¤×™×’×•×¨×¦×™×” ×©×œ ×”××™×¨×•×—, ×•×× ×“×¨×š ×”×“×¤×“×¤×Ÿ.';
    showStatus(message || '×—×¡×¨×” ×”×’×“×¨×ª ××™×¨×•×— ×œ-Supabase. ×™×© ××¢×“×›×Ÿ ××ª ×”×§×•× ×¤×™×’×•×¨×¦×™×” ×‘×©×¨×ª/×‘×”×•×¡×˜×™× ×’.', 'error');
  }

  function updateSyncChip(status) {
    const chip = document.getElementById('sync-chip');
    if (!chip) return;
    const labels = { idle: 'מסונכרן', syncing: 'מסנכרן...', error: 'שגיאת סנכרון', setup: 'דרושה הגדרה', auth: 'דרושה התחברות', loading: 'טוען...' };
    chip.textContent = labels[status] || status;
    chip.dataset.status = status;
  }

  function updateAuthButton(session) {
    const button = document.getElementById('auth-status-btn');
    if (!button) return;
    button.textContent = session?.user?.email || 'חשבון';
  }

  function updateInboxBadge(count) {
    const badge = document.getElementById('cn-inbox-badge');
    if (badge) {
      badge.textContent = count || 0;
      badge.style.display = count ? '' : 'none';
    }
    const chip = document.getElementById('inbox-chip');
    if (chip) chip.textContent = count ? `Inbox · ${count}` : 'Inbox';
  }

  function updateBackButton(canGoBack) {
    const button = document.getElementById('topbar-back-btn');
    const mobileButton = document.getElementById('mob-back-btn');
    if (button) {
      button.hidden = !canGoBack;
      button.disabled = !canGoBack;
    }
    if (mobileButton) {
      mobileButton.hidden = !canGoBack;
      mobileButton.disabled = !canGoBack;
    }
  }

  function ensurePipelineToolbar() {
    const filterRow = document.querySelector('#view-pipeline .filter-row');
    if (!filterRow || document.getElementById('pipeline-enhancements')) return;
    filterRow.insertAdjacentHTML('beforeend', `
      <div class="pipeline-enhancements" id="pipeline-enhancements">
        <button type="button" class="filter-chip" onclick="setFilter('today',this)">היום</button>
        <button type="button" class="filter-chip" onclick="setFilter('waiting',this)">ממתין ללקוח</button>
        <button type="button" class="filter-chip" onclick="setFilter('unpaid',this)">לא שולם</button>
        <select id="pipeline-sort" class="pipeline-sort">
          <option value="deadline-asc">מיון: תאריך קרוב</option>
          <option value="deadline-desc">מיון: תאריך רחוק</option>
          <option value="price-desc">מיון: סכום גבוה</option>
          <option value="client-asc">מיון: לקוח</option>
          <option value="stage-asc">מיון: שלב</option>
        </select>
        <button type="button" class="bulk-toggle-btn" id="bulk-toggle-btn">בחירה מרובה</button>
      </div>
      <div class="pipeline-bulkbar" id="pipeline-bulkbar" style="display:none">
        <span id="bulk-count-label">0 נבחרו</span>
        <button type="button" class="bulk-action-btn" id="bulk-waiting-btn">לשלב אישור לקוח</button>
        <button type="button" class="bulk-action-btn" id="bulk-published-btn">לפורסם</button>
        <button type="button" class="bulk-action-btn danger" id="bulk-delete-btn">העבר לפח</button>
        <button type="button" class="bulk-action-btn danger" id="bulk-archive-btn">ארכב נבחרים</button>
      </div>
    `);
    const sort = document.getElementById('pipeline-sort');
    if (sort) sort.value = ns.state.ui.pipelineSort;
  }

  function applyClientTab(tabName) {
    document.querySelectorAll('.client-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.clientTab === tabName);
    });
    const contactSection = document.querySelector('.cp-body > .cp-fade-3');
    const packageSection = document.getElementById('cp-package-section');
    const noPackageSection = document.getElementById('cp-nopackage-section');
    const notesSection = document.getElementById('cp-notes')?.closest('div');
    const paymentPanel = document.getElementById('cp-payments-panel');
    const stats = document.getElementById('cp-stats');

    if (contactSection) contactSection.style.display = tabName === 'overview' ? '' : 'none';
    if (packageSection) packageSection.style.display = tabName === 'projects' && packageSection.dataset.forceHidden !== '1' ? '' : 'none';
    if (noPackageSection) noPackageSection.style.display = tabName === 'projects' && noPackageSection.dataset.forceHidden !== '1' ? '' : 'none';
    if (notesSection) notesSection.style.display = tabName === 'notes' ? '' : 'none';
    if (paymentPanel) paymentPanel.style.display = tabName === 'payments' ? '' : 'none';
    if (stats) stats.style.display = tabName === 'overview' ? '' : 'none';
  }

  function renderClientPaymentSummary(clientName) {
    const target = document.getElementById('cp-payment-summary');
    if (!target || !clientName) return;
    const projects = (global.projects || []).filter((project) => project.client === clientName);
    const total = projects.reduce((sum, project) => sum + (+project.price || 0), 0);
    const paid = projects.reduce((sum, project) => sum + (typeof global.getProjectPaid === 'function' ? global.getProjectPaid(project) : (+project.paidAmount || 0)), 0);
    target.innerHTML = `
      <div class="cp-payment-card"><span>סה"כ לחיוב</span><strong>₪${total.toLocaleString()}</strong></div>
      <div class="cp-payment-card success"><span>שולם בפועל</span><strong>₪${paid.toLocaleString()}</strong></div>
      <div class="cp-payment-card warning"><span>יתרה פתוחה</span><strong>₪${Math.max(0, total - paid).toLocaleString()}</strong></div>
    `;
  }

  ns.shell = {
    injectShell,
    showStatus,
    showSetupMode,
    showLoginMode,
    showHostedConfigMissingMode,
    updateSyncChip,
    updateAuthButton,
    updateInboxBadge,
    updateBackButton,
    ensurePipelineToolbar,
    applyClientTab,
    renderClientPaymentSummary,
  };
})(window);
