(function initReelDevMode(global) {
  const ns = global.REELApp = global.REELApp || {};

  const MODE_KEY = 'reel_demo_mode';
  const SEEDED_KEY = 'reel_demo_seed_v1';
  const LEGACY_KEYS = [
    'reel_projects',
    'reel_clients',
    'reel_scripts',
    'reel_tracking',
    'reel_archive',
    'reel_trash',
    'reel_activity',
    'reel_shoot_days',
    'reel_tasks',
    'reel_onboarding_dismissed',
  ];

  function getParams() {
    try {
      return new URLSearchParams(global.location.search || '');
    } catch (error) {
      return new URLSearchParams();
    }
  }

  function isEnabled() {
    const params = getParams();
    return params.get('demo') === '1' || global.localStorage.getItem(MODE_KEY) === '1';
  }

  function shouldReset() {
    return getParams().get('resetDemo') === '1';
  }

  function daysFromToday(offset) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  }

  function nowTs(offset = 0) {
    return Date.now() + offset;
  }

  function buildSeed() {
    const clientA = 'סטודיו דמו';
    const clientB = 'לקוח בדיקה';
    const clientAId = 'client_demo_studio';
    const clientBId = 'client_demo_test';
    const pkgId = 'pkg_demo_studio';
    const projectA = 'proj_demo_overdue';
    const projectB = 'proj_demo_waiting';
    const projectC = 'proj_demo_published';

    return {
      projects: [
        {
          id: projectA,
          clientId: clientAId,
          client: clientA,
          name: 'ריל השקה אביב',
          type: 'reel',
          stage: 'editing',
          deadline: daysFromToday(-2),
          price: 3200,
          paid: 'unpaid',
          paidAmount: 0,
          notes: 'הפרויקט באיחור קטן וצריך לסגור עריכה סופית.',
          drive: 'https://drive.google.com/demo-project-a',
          progress: 70,
          files: [],
          paymentHistory: [],
        },
        {
          id: projectB,
          clientId: clientAId,
          client: clientA,
          name: 'ריל עדות לקוח',
          type: 'reel',
          stage: 'approval',
          deadline: daysFromToday(3),
          price: 1800,
          paid: 'partial',
          paidAmount: 900,
          notes: 'ממתין לאישור סופי מהלקוח.',
          drive: 'https://drive.google.com/demo-project-b',
          progress: 90,
          files: [],
          paymentHistory: [
            {
              id: 'pay_demo_project_b_1',
              amount: 900,
              date: daysFromToday(-1),
              method: 'transfer',
              note: 'מקדמה',
              receipt: 'https://example.com/receipt-demo-project-b.pdf',
              receipt_name: 'receipt-demo-project-b.pdf',
              receipt_type: 'application/pdf',
            },
          ],
        },
        {
          id: projectC,
          clientId: clientBId,
          client: clientB,
          name: 'סרטון מוצר ראשי',
          type: 'ad',
          stage: 'published',
          deadline: daysFromToday(-6),
          price: 4500,
          paid: 'paid',
          paidAmount: 4500,
          notes: 'פורסם וקיבל ביצועים טובים.',
          drive: 'https://drive.google.com/demo-project-c',
          progress: 100,
          files: [],
          paymentHistory: [
            {
              id: 'pay_demo_project_c_1',
              amount: 4500,
              date: daysFromToday(-5),
              method: 'credit',
              note: 'תשלום מלא',
              receipt: 'https://example.com/receipt-demo-project-c.pdf',
              receipt_name: 'receipt-demo-project-c.pdf',
              receipt_type: 'application/pdf',
            },
          ],
        },
      ],
      clients: {
        [clientA]: {
          id: clientAId,
          phone: '050-1111111',
          email: 'studio-demo@example.com',
          website: 'studio-demo.example.com',
          address: 'תל אביב',
          contact: 'נועה כהן',
          notes: 'לקוח קבוע עם חבילת תוכן חודשית.',
          receiptSent: false,
          package: {
            id: pkgId,
            name: 'חבילת רילסים חודשית',
            total: 4,
            price: 6400,
            start: daysFromToday(-20),
            end: daysFromToday(10),
            paid: 'partial',
            paidAmount: 3200,
            notes: '2 מתוך 4 סרטונים כבר בטיפול.',
            paymentHistory: [
              {
                id: 'pay_demo_package_1',
                amount: 3200,
                date: daysFromToday(-10),
                method: 'transfer',
                note: 'תשלום ראשון על החבילה',
                receipt: 'https://example.com/receipt-demo-package.pdf',
                receipt_name: 'receipt-demo-package.pdf',
                receipt_type: 'application/pdf',
              },
            ],
          },
        },
        [clientB]: {
          id: clientBId,
          phone: '050-2222222',
          email: 'test-client@example.com',
          website: '',
          address: 'חיפה',
          contact: 'דני לוי',
          notes: 'הלקוח אהב את הביצועים ורוצה הצעה לסבב נוסף.',
          receiptSent: true,
        },
      },
      scripts: [
        {
          id: 'script_demo_1',
          projectId: projectA,
          title: 'פתיח מהיר למבצע אביב',
          client: clientA,
          status: 'ready',
          shootDate: daysFromToday(1),
          scene: 'פתיח עם מוצר וצילום ידיים',
          voiceover: 'טקסט מכירה קצר',
          camera: 'קלוז-אפ + תנועה איטית',
          editNotes: 'לשמור קצב מהיר וכתוביות מודגשות',
          createdAt: nowTs(-86400000 * 2),
        },
        {
          id: 'script_demo_2',
          projectId: projectC,
          title: 'סצנת עדות לקוח',
          client: clientB,
          status: 'filmed',
          shootDate: daysFromToday(-7),
          scene: 'לקוח מדבר מול מצלמה',
          voiceover: '',
          camera: 'מצלמה סטטית',
          editNotes: 'הדגשת ציטוט מרכזי',
          createdAt: nowTs(-86400000 * 8),
        },
      ],
      tracking: [
        {
          id: 'track_demo_1',
          projectId: projectC,
          platform: 'instagram',
          date: daysFromToday(-3),
          time: '12:30',
          url: 'https://instagram.com/p/demo',
          views: 12340,
          likes: 812,
          comments: 34,
          shares: 21,
          saves: 67,
          reach: 10820,
          notes: 'ביצועים טובים במיוחד ב-24 השעות הראשונות',
        },
      ],
      activity: [
        {
          id: 'activity_demo_1',
          type: 'project',
          icon: '✂️',
          action: 'עודכנה עריכת הפרויקט',
          project: 'ריל השקה אביב',
          client: clientA,
          ts: nowTs(-3600000 * 5),
        },
        {
          id: 'activity_demo_2',
          type: 'payment',
          icon: '₪',
          action: 'התקבל תשלום מקדמה',
          project: 'ריל עדות לקוח',
          client: clientA,
          ts: nowTs(-3600000 * 26),
        },
        {
          id: 'activity_demo_3',
          type: 'publish',
          icon: '✅',
          action: 'הפרויקט פורסם בהצלחה',
          project: 'סרטון מוצר ראשי',
          client: clientB,
          ts: nowTs(-3600000 * 48),
        },
      ],
      shootDays: [
        {
          id: 'shootday_demo_1',
          client_name: clientA,
          date: daysFromToday(1),
          notes: 'אולפן + צילום מוצר',
          created_at: new Date().toISOString(),
        },
      ],
      archive: [],
      trash: [],
      tasks: [
        {
          id: 'task_demo_1',
          title: 'לסגור אישור אחרון מהלקוח',
          dueDate: daysFromToday(-1),
          notes: 'להתקשר לנועה ולוודא תשובה',
          clientName: clientA,
          projectId: projectB,
          projectName: 'ריל עדות לקוח',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task_demo_2',
          title: 'לשלוח הצעת מחיר לסבב נוסף',
          dueDate: daysFromToday(2),
          notes: 'ללקוח בדיקה',
          clientName: clientB,
          projectId: '',
          projectName: '',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task_demo_3',
          title: 'לצרף קבלה לתשלום האחרון',
          dueDate: daysFromToday(-4),
          notes: '',
          clientName: clientB,
          projectId: projectC,
          projectName: 'סרטון מוצר ראשי',
          status: 'done',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
  }

  function writeSeed(seed) {
    global.localStorage.setItem('reel_projects', JSON.stringify(seed.projects));
    global.localStorage.setItem('reel_clients', JSON.stringify(seed.clients));
    global.localStorage.setItem('reel_scripts', JSON.stringify(seed.scripts));
    global.localStorage.setItem('reel_tracking', JSON.stringify(seed.tracking));
    global.localStorage.setItem('reel_archive', JSON.stringify(seed.archive));
    global.localStorage.setItem('reel_trash', JSON.stringify(seed.trash));
    global.localStorage.setItem('reel_activity', JSON.stringify(seed.activity));
    global.localStorage.setItem('reel_shoot_days', JSON.stringify(seed.shootDays));
    global.localStorage.setItem('reel_tasks', JSON.stringify(seed.tasks));
    global.localStorage.setItem('reel_onboarding_dismissed', '1');
    global.localStorage.setItem(SEEDED_KEY, '1');
    global.localStorage.setItem(MODE_KEY, '1');
  }

  function loadJson(key, fallback) {
    try {
      return JSON.parse(global.localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (error) {
      return fallback;
    }
  }

  function writeLegacyStore(name, value) {
    if (typeof global.setLegacyStoreValue === 'function') {
      global.setLegacyStoreValue(name, value);
      return;
    }
    global[name] = value;
  }

  function applyFromStorage() {
    writeLegacyStore('projects', loadJson('reel_projects', []));
    writeLegacyStore('clientData', loadJson('reel_clients', {}));
    writeLegacyStore('scriptsData', loadJson('reel_scripts', []));
    writeLegacyStore('trackingData', loadJson('reel_tracking', []));
    writeLegacyStore('archiveData', loadJson('reel_archive', []));
    writeLegacyStore('trashData', loadJson('reel_trash', []));
    writeLegacyStore('activityLog', loadJson('reel_activity', []));
    writeLegacyStore('shootDaysData', loadJson('reel_shoot_days', []));
  }

  function resetStorage() {
    LEGACY_KEYS.forEach((key) => global.localStorage.removeItem(key));
    global.localStorage.removeItem(SEEDED_KEY);
  }

  function activate() {
    if (!isEnabled()) return false;
    if (shouldReset()) resetStorage();
    if (global.localStorage.getItem(SEEDED_KEY) !== '1') {
      writeSeed(buildSeed());
    } else {
      global.localStorage.setItem(MODE_KEY, '1');
    }
    applyFromStorage();
    ns.state?.replaceCanonical?.(ns.bridge?.buildCanonicalFromLegacy?.() || ns.state.canonical);
    global.syncAll?.();
    return true;
  }

  ns.devMode = {
    isEnabled,
    activate,
  };
})(window);
