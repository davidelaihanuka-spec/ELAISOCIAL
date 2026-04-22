(function initReelOnboarding(global) {
  const ns = global.REELApp = global.REELApp || {};

  function getCounts() {
    return {
      clients: Object.keys(global.clientData || {}).length,
      projects: (global.projects || []).length,
      scripts: (global.scriptsData || []).length,
      shootDays: (global.shootDaysData || []).length,
      tracking: (global.trackingData || []).length,
    };
  }

  function hasAnyData(counts = getCounts()) {
    return Object.values(counts).some((value) => value > 0);
  }

  function isEmptyWorkspace() {
    return !hasAnyData();
  }

  function shouldAutoOpen() {
    return isEmptyWorkspace() && !ns.state?.ui?.onboardingDismissed;
  }

  async function getSessionLabel() {
    try {
      const session = await ns.repository?.auth?.getSession?.();
      return session?.user?.email || 'מחובר לחשבון';
    } catch (error) {
      return 'מחובר לחשבון';
    }
  }

  function renderStep(title, body, done, actionLabel, action) {
    return `
      <div class="onboarding-step ${done ? 'done' : ''}">
        <div class="onboarding-step-top">
          <div>
            <strong>${title}</strong>
            <p>${body}</p>
          </div>
          <span class="onboarding-step-state ${done ? 'done' : 'pending'}">${done ? 'בוצע' : 'ממתין'}</span>
        </div>
        ${actionLabel ? `<button type="button" class="onboarding-action-btn" data-onboarding-action="${action}">${actionLabel}</button>` : ''}
      </div>
    `;
  }

  async function render() {
    const root = global.document.getElementById('onboarding-grid');
    if (!root) return;

    const counts = getCounts();
    const sessionLabel = await getSessionLabel();
    const doneCount = [
      Boolean(ns.config?.isConfigured?.()),
      Boolean(counts.clients),
      Boolean(counts.projects),
      hasAnyData(counts),
    ].filter(Boolean).length;

    root.innerHTML = `
      <section class="onboarding-hero">
        <div class="onboarding-hero-copy">
          <div class="dash-eyebrow">Onboarding</div>
          <h2>בוא נסדר את ההתחלה כמו שצריך</h2>
          <p>זה המסלול הראשוני להגדרת המערכת: להתחבר, לייבא מידע אם יש, ליצור לקוח ראשון, ואז לפתוח פרויקט ראשון בלי לנחש מה לעשות קודם.</p>
        </div>
        <div class="onboarding-stat-grid">
          <div class="onboarding-stat-card">
            <span>התקדמות</span>
            <strong>${doneCount}/4</strong>
            <small>שלבים עיקריים להגדרה הראשונית</small>
          </div>
          <div class="onboarding-stat-card">
            <span>חשבון</span>
            <strong>${sessionLabel}</strong>
            <small>Supabase Auth פעיל</small>
          </div>
        </div>
      </section>

      <section class="onboarding-panel">
        <div class="onboarding-panel-head">
          <h3>שלבי התחלה</h3>
          <span>${hasAnyData(counts) ? 'כבר יש מידע במערכת' : 'המערכת עדיין ריקה'}</span>
        </div>
        <div class="onboarding-steps">
          ${renderStep(
            'חיבור לחשבון ול-Supabase',
            'החיבור הטכני כבר בוצע. אפשר לחזור למסך ההגדרות בכל שלב כדי לשנות URL, bucket או פרטי חשבון.',
            Boolean(ns.config?.isConfigured?.()),
            'פתח הגדרות',
            'settings'
          )}
          ${renderStep(
            'ייבוא מידע קיים',
            'אם יש לך גיבוי JSON ישן, אפשר לייבא אותו עכשיו במקום להתחיל מאפס. זה צעד אופציונלי.',
            hasAnyData(counts),
            'ייבוא JSON',
            'import'
          )}
          ${renderStep(
            'יצירת לקוח ראשון',
            'כדאי להתחיל מלקוח אמיתי ולא רק מפרויקט. כך כל המערכת תישאר מסודרת סביב לקוחות, תשלומים והיסטוריה.',
            counts.clients > 0,
            'לקוח חדש',
            'new-client'
          )}
          ${renderStep(
            'פתיחת פרויקט ראשון',
            'אחרי שיש לקוח, אפשר לפתוח פרויקט עם דדליין, שלב עבודה, מחיר וקישורים ולהתחיל להשתמש בכל המסכים החדשים.',
            counts.projects > 0,
            'פרויקט חדש',
            'new-project'
          )}
        </div>
      </section>

      <section class="onboarding-panel">
        <div class="onboarding-panel-head">
          <h3>לאן ממשיכים מכאן</h3>
          <span>מסלולים מהירים</span>
        </div>
        <div class="onboarding-shortcuts">
          <button type="button" class="onboarding-shortcut" data-onboarding-action="dashboard">
            <strong>לעבור לדשבורד</strong>
            <small>לראות מה קורה עכשיו במערכת</small>
          </button>
          <button type="button" class="onboarding-shortcut" data-onboarding-action="clients">
            <strong>למסך הלקוחות</strong>
            <small>לצפות בכרטיסי הלקוחות ולעדכן פרטים</small>
          </button>
          <button type="button" class="onboarding-shortcut" data-onboarding-action="pipeline">
            <strong>לצינור הפרויקטים</strong>
            <small>להמשיך לעבודה היומית ולשלבים</small>
          </button>
          <button type="button" class="onboarding-shortcut subtle" data-onboarding-action="dismiss">
            <strong>דלג בינתיים</strong>
            <small>אפשר לפתוח את המסך הזה שוב מתוך ההגדרות</small>
          </button>
        </div>
        <input type="file" id="onboarding-import-input" accept=".json" hidden>
      </section>
    `;

    root.querySelectorAll('[data-onboarding-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.onboardingAction;
        if (action === 'settings') {
          ns.state?.setOnboardingDismissed?.(true);
          global.goView?.('settings');
          return ns.settings?.render?.();
        }
        if (action === 'import') {
          return root.querySelector('#onboarding-import-input')?.click();
        }
        if (action === 'new-client') {
          ns.state?.setOnboardingDismissed?.(true);
          return global.openNewClientModal?.();
        }
        if (action === 'new-project') {
          ns.state?.setOnboardingDismissed?.(true);
          return global.openProjectFlow?.();
        }
        if (action === 'clients') {
          ns.state?.setOnboardingDismissed?.(true);
          return global.goView?.('clients');
        }
        if (action === 'pipeline') {
          ns.state?.setOnboardingDismissed?.(true);
          return global.goView?.('pipeline');
        }
        if (action === 'dashboard') {
          ns.state?.setOnboardingDismissed?.(true);
          return global.goView?.('dashboard');
        }
        if (action === 'dismiss') {
          ns.state?.setOnboardingDismissed?.(true);
          return global.goView?.('dashboard');
        }
      });
    });

    root.querySelector('#onboarding-import-input')?.addEventListener('change', (event) => {
      ns.state?.setOnboardingDismissed?.(true);
      global.importData?.(event);
    });
  }

  ns.onboarding = {
    render,
    getCounts,
    hasAnyData,
    isEmptyWorkspace,
    shouldAutoOpen,
  };
})(window);
