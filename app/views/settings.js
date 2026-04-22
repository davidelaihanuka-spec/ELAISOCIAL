(function initReelSettings(global) {
  const ns = global.REELApp = global.REELApp || {};

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function statLine(label, value) {
    return `<div class="settings-stat-line"><span>${label}</span><strong>${value}</strong></div>`;
  }

  async function render() {
    const root = global.document.getElementById('settings-grid');
    if (!root) return;

    const config = ns.config?.get?.() || {};
    let session = null;
    try {
      session = await ns.repository?.auth?.getSession?.();
    } catch (error) {
      session = null;
    }

    const counts = {
      clients: Object.keys(global.clientData || {}).length,
      projects: (global.projects || []).length,
      scripts: (global.scriptsData || []).length,
      shootDays: (global.shootDaysData || []).length,
      tracking: (global.trackingData || []).length,
    };

    const projectUrl = config.url ? new URL(config.url) : null;
    root.innerHTML = `
      <section class="settings-hero">
        <div>
          <div class="dash-eyebrow">Settings</div>
          <h2>חיבור, גיבוי ותחזוקת האפליקציה</h2>
          <p>מסך מרכזי לחשבון, Supabase, סנכרון ידני וגיבוי JSON. זה מחליף את הצורך לזכור איפה כל פעולה טכנית מסתתרת.</p>
        </div>
        <div class="settings-pill-row">
          <span class="settings-pill ${config.url ? 'success' : 'warning'}">${config.url ? 'Supabase מחובר' : 'נדרש חיבור'}</span>
          <span class="settings-pill ${session?.user?.email ? 'info' : 'warning'}">${session?.user?.email ? 'מחובר לחשבון' : 'לא מחובר'}</span>
          <span class="settings-pill">${ns.state?.ui?.syncStatus || 'idle'}</span>
        </div>
      </section>
      <div class="settings-panels">
        <section class="settings-card">
          <div class="settings-card-head">
            <h3>Supabase וחשבון</h3>
            <span>חיבור פעיל וניהול התחברות</span>
          </div>
          <div class="settings-stack">
            ${statLine('שרת', projectUrl ? escapeHtml(projectUrl.host) : 'לא הוגדר')}
            ${statLine('Bucket', config.bucket || 'reel-files')}
            ${statLine('משתמש', session?.user?.email ? escapeHtml(session.user.email) : 'לא מחובר')}
          </div>
          <div class="settings-actions">
            <button type="button" class="settings-btn primary" id="settings-sync-now-btn">סנכרן עכשיו</button>
            <button type="button" class="settings-btn" id="settings-reconnect-btn">ערוך חיבור</button>
            <button type="button" class="settings-btn danger" id="settings-signout-btn">התנתק</button>
          </div>
        </section>
        <section class="settings-card">
          <div class="settings-card-head">
            <h3>גיבוי וייבוא</h3>
            <span>שמור עותק מקומי ועבוד בביטחון</span>
          </div>
          <div class="settings-stack">
            <p class="settings-copy">גם עם Supabase פעיל, מומלץ לשמור ייצוא JSON תקופתי לפני שינויים גדולים.</p>
          </div>
          <div class="settings-actions">
            <button type="button" class="settings-btn primary" id="settings-export-btn">ייצוא JSON</button>
            <label class="settings-btn file">
              ייבוא JSON
              <input type="file" id="settings-import-input" accept=".json" hidden>
            </label>
          </div>
        </section>
        <section class="settings-card">
          <div class="settings-card-head">
            <h3>מצב נתונים</h3>
            <span>כמה מידע מנוהל כרגע באפליקציה</span>
          </div>
          <div class="settings-stack">
            ${statLine('לקוחות', counts.clients)}
            ${statLine('פרויקטים', counts.projects)}
            ${statLine('תסריטים', counts.scripts)}
            ${statLine('ימי צילום', counts.shootDays)}
            ${statLine('רשומות מעקב', counts.tracking)}
          </div>
        </section>
        <section class="settings-card">
          <div class="settings-card-head">
            <h3>מה נוסף עכשיו</h3>
            <span>כיוון המוצר במסך אחד</span>
          </div>
          <div class="settings-checklist">
            <div>מסך תובנות נפרד לניתוח עבודה, כסף וביצועים</div>
            <div>זרימת יצירת לקוח ייעודית במקום להסתמך רק על פרויקטים</div>
            <div>מסך הגדרות מרוכז לחיבור, סנכרון וגיבוי</div>
            <div>נוספו גם Ledger, Notifications, Project Workspace ומסך Onboarding מלא</div>
          </div>
          <div class="settings-actions">
            <button type="button" class="settings-btn" id="settings-open-onboarding-btn">פתח Onboarding</button>
          </div>
        </section>
      </div>
    `;

    global.document.getElementById('settings-sync-now-btn')?.addEventListener('click', async () => {
      try {
        await ns.bridge.syncCloudNow();
        global.toast?.('הסנכרון מול Supabase הושלם');
        render();
      } catch (error) {
        global.toast?.('שגיאת סנכרון');
      }
    });

    global.document.getElementById('settings-export-btn')?.addEventListener('click', () => {
      global.exportData?.();
    });

    global.document.getElementById('settings-import-input')?.addEventListener('change', (event) => {
      global.importData?.(event);
    });

    global.document.getElementById('settings-reconnect-btn')?.addEventListener('click', () => {
      const overlay = global.document.getElementById('reel-auth-overlay');
      overlay?.classList.remove('hidden');
      ns.shell?.showSetupMode?.();
      ns.shell?.showStatus?.('ערוך את פרטי החיבור ושמור כדי לעדכן את ההגדרות.', 'neutral');
      ns.state?.setSyncStatus?.('setup');
    });

    global.document.getElementById('settings-signout-btn')?.addEventListener('click', async () => {
      try {
        await ns.repository.auth.signOut();
        global.document.getElementById('reel-auth-overlay')?.classList.remove('hidden');
        ns.shell?.showLoginMode?.();
        ns.shell?.showStatus?.('התנתקת מהחשבון.', 'neutral');
        ns.state?.setSyncStatus?.('auth');
      } catch (error) {
        global.toast?.('לא ניתן היה להתנתק');
      }
    });

    global.document.getElementById('settings-open-onboarding-btn')?.addEventListener('click', () => {
      ns.state?.setOnboardingDismissed?.(false);
      global.goView?.('onboarding');
      ns.onboarding?.render?.();
    });
  }

  ns.settings = { render };
})(window);
