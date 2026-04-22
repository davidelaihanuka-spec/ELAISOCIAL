// ── HTML ESCAPE (מניעת XSS) ──────────────────────────────────────
function h(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
// עבור onclick attributes עם שמות לקוח (מכיל גרש וכדומה)
function j(s){return JSON.stringify(String(s==null?'':s));}

// ── STORAGE ERROR TOAST ──────────────────────────────────────────
function _storageErr(e) {
  const id = 'storage-err-toast';
  if (document.getElementById(id)) return;
  const t = document.createElement('div');
  t.id = id;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#e53935;color:#fff;padding:12px 22px;border-radius:12px;font-size:14px;font-family:Heebo,sans-serif;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.4);direction:rtl;max-width:360px;text-align:center';
  t.innerHTML = '⚠️ שגיאת שמירה: נפח האחסון מלא. מחק קבצים ישנים ונסה שוב.';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 6000);
  console.error('localStorage error:', e);
}

window.REEL_LEGACY_STORES = window.REEL_LEGACY_STORES || {};
function registerLegacyStore(name, getValue, setValue) {
  window.REEL_LEGACY_STORES[name] = { get: getValue, set: setValue };
}
function setLegacyStoreValue(name, value) {
  const store = window.REEL_LEGACY_STORES?.[name];
  if (typeof store?.set === 'function') return store.set(value);
  window[name] = value;
  return value;
}
function getLegacyStoreValue(name, fallback) {
  const store = window.REEL_LEGACY_STORES?.[name];
  if (typeof store?.get === 'function') return store.get();
  return typeof window[name] !== 'undefined' ? window[name] : fallback;
}
window.registerLegacyStore = registerLegacyStore;
window.setLegacyStoreValue = setLegacyStoreValue;
window.getLegacyStoreValue = getLegacyStoreValue;

const STAGE_ICONS = {
  script:    '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0;margin-left:4px"><path d="M163.31,100.69a16,16,0,0,0-22.63,0L72,169.37,56,224l54.63-16L178.69,140a16,16,0,0,0,0-22.63ZM92.37,214,68,221l7-24.33,77.37-77.38,17.37,17.37ZM168,128.69l-17.37-17.38,11.32-11.31,17.37,17.37ZM216,88H152a8,8,0,0,0,0,16h56V208H48V104H96a8,8,0,0,0,0-16H48A16,16,0,0,0,32,104V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104A16,16,0,0,0,216,88Z"/></svg>',
  filming:   '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0;margin-left:4px"><path d="M216,80H180.92L207.72,53.2a8,8,0,1,0-11.44-11.17l-35.88,36.72a8.07,8.07,0,0,1-1.15.88H147.3l10.08-28.22A8,8,0,0,0,142.38,43l-12.58,35.19a8.22,8.22,0,0,1-.55.88H115.3l10.08-28.22A8,8,0,0,0,110.38,43L97.8,78.19a8.22,8.22,0,0,1-.55.88H40A16,16,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A16,16,0,0,0,216,80Zm0,120H40V96H216Z"/></svg>',
  editing:   '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0;margin-left:4px"><path d="M157.73,113.13A8,8,0,0,1,159.82,102L227.48,55.7a8,8,0,0,1,9,13.21l-67.67,46.3a7.92,7.92,0,0,1-4.51,1.4A8,8,0,0,1,157.73,113.13Zm80.87,85.09a8,8,0,0,1-11.12,2.08L136,137.7,93.49,166.78a36,36,0,1,1-9-13.19L121.83,128,84.44,102.41a35.86,35.86,0,1,1,9-13.19l143,97.87A8,8,0,0,1,238.6,198.22ZM80,180a20,20,0,1,0-5.86,14.14A19.85,19.85,0,0,0,80,180ZM74.14,90.13a20,20,0,1,0-28.28,0A19.85,19.85,0,0,0,74.14,90.13Z"/></svg>',
  approval:  '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0;margin-left:4px"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,182.49,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/></svg>',
  published: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0;margin-left:4px"><path d="M205.66,117.56l-128-112A8,8,0,0,0,64,12V240a8,8,0,0,0,13.66,5.66l58.91-58.9,41.1,87.63a8,8,0,0,0,10.69,3.8l28.58-13.43a8,8,0,0,0,3.8-10.68l-41.2-87.82,52.53-17.5a8,8,0,0,0,0-15.14ZM194,124.31l-55.38,18.45a8,8,0,0,0-4.27,11.62L176.53,244l-13.27,6.24-42-89.65a8,8,0,0,0-12.5-2.63L80,185.94V27.63Z"/></svg>',
};

const STAGES = {
  script:    { label: 'אישור תסריט', color: '#6c63ff', icon: 'script',    emoji: '📝' },
  filming:   { label: 'צילום',       color: '#00b4d8', icon: 'filming',   emoji: '🎥' },
  editing:   { label: 'עריכה',       color: '#ff8c42', icon: 'editing',   emoji: '✂️' },
  approval:  { label: 'אישור לקוח',  color: '#ffb830', icon: 'approval',  emoji: '👁' },
  published: { label: 'פורסם',       color: '#00e5a0', icon: 'published', emoji: '✅' },
};
const TYPES = {
  reel:  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16Zm8,200a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8Zm-48-24a12,12,0,1,1-12-12A12,12,0,0,1,136,192Z"/></svg>',
  short: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M213.85,125.46l-112,120a8,8,0,0,1-13.85-5.46V144H40a8,8,0,0,1-5.85-13.46l112-120a8,8,0,0,1,13.85,5.46V112h48a8,8,0,0,1,5.85,13.46Z"/></svg>',
  story: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M243.27,89l-59.46-20.35L163.45,12.58a16,16,0,0,0-30.9,0L112.19,68.67,52.73,89a16,16,0,0,0,0,30.26l59.46,20.35,20.36,56.08a16,16,0,0,0,30.9,0l20.36-56.08L243.27,119.3a16,16,0,0,0,0-30.26ZM231.48,107l-59.47,20.36a16,16,0,0,0-9.94,9.94L142,196.83l-20.07-59.53a16,16,0,0,0-9.94-9.94L52.52,107l59.47-20.36a16,16,0,0,0,9.94-9.94L142,17.17l20.07,59.53a16,16,0,0,0,9.94,9.94Z"/></svg>',
  long:  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>',
  ad:    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M251.77,73a8,8,0,0,0-8.21.39L208,97.05V80a16,16,0,0,0-16-16H32A16,16,0,0,0,16,80V176a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V159l35.56,23.71A8,8,0,0,0,256,176V80A8,8,0,0,0,251.77,73ZM192,176H32V80H192v96Zm48-14.43-32-21.33V115.76L240,94.43Z"/></svg>',
};
const AVATARS = ['#6c63ff','var(--accent)','#00b4d8','#ff8c42','#00e5a0','#ffb830','#c084fc'];

let projects = JSON.parse(localStorage.getItem('reel_projects') || '[]');
window.projects = projects;
registerLegacyStore('projects', () => projects, (nextValue) => {
  projects = Array.isArray(nextValue) ? nextValue : [];
  window.projects = projects;
  return projects;
});
let editId = null;
let modalReturnClient = null; // set when modal opened from client panel
let selStage = 'brief';
let calY = new Date().getFullYear(), calM = new Date().getMonth();
let viewMode = 'kanban';
let activeFilter = 'all';

function save() { window.projects = projects; try { localStorage.setItem('reel_projects', JSON.stringify(projects)); } catch(e) { _storageErr(e); } }
function ac(s) { let h=0; for(let c of s) h=(h*31+c.charCodeAt(0))%AVATARS.length; return AVATARS[h]; }

function daysLeft(ds) {
  if (!ds) return null;
  const d = new Date(ds), n = new Date();
  d.setHours(0,0,0,0); n.setHours(0,0,0,0);
  return Math.round((d-n)/86400000);
}
function dlClass(d) {
  if (d===null) return '';
  if (d<0) return 'overdue'; if (d<=3) return 'deadline'; return 'ok';
}
function dlText(d, ds) {
  const _ic = (p,s=13) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 256 256" fill="currentColor" style="vertical-align:middle;flex-shrink:0"><path d="${p}"/></svg>`;
  const _warn = _ic('M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z');
  const _clk  = _ic('M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v52h48A8,8,0,0,1,192,128Z');
  const _fire = _ic('M181.23,172.84C170.18,193.42,149.3,208,128,208A80.09,80.09,0,0,1,48,128a81.39,81.39,0,0,1,1.8-17c4.82-22,18.26-40.49,29.42-55.33,2.68-3.57,5.27-7,7.5-10.26a8,8,0,0,1,13.4.68,80.4,80.4,0,0,0,23.72,24.77,94.07,94.07,0,0,1,10.14-38.37,8,8,0,0,1,12-2.24c4.3,3.81,50.06,45.56,44.86,98.34C192.17,150.28,188.3,159.92,181.23,172.84Z');
  const _cal  = _ic('M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24Z');
  if (d===null) return '';
  if (d<0)  return `${_warn} עבר ${-d}ד`;
  if (d===0) return `${_fire} היום!`;
  if (d===1) return `${_clk} מחר`;
  if (d<=7)  return `${_clk} ${d} ימים`;
  const dt = new Date(ds);
  return `${_cal} ${dt.toLocaleDateString('he-IL',{day:'numeric',month:'short'})}`;
}

// ── SIDEBAR TOGGLE ──────────────────
(function(){
  if (localStorage.getItem('reel_sidebar_collapsed') === '1') {
    document.getElementById('main-sidebar').classList.add('collapsed');
    const btn = document.getElementById('sidebar-toggle-btn');
    if (btn) btn.textContent = '›';
  }
})();
function toggleSidebar() {
  const sb = document.getElementById('main-sidebar');
  const btn = document.getElementById('sidebar-toggle-btn');
  const collapsed = sb.classList.toggle('collapsed');
  btn.textContent = collapsed ? '›' : '‹';
  localStorage.setItem('reel_sidebar_collapsed', collapsed ? '1' : '0');
}

// ── NAV ────────────────────
function goView(v, el) {
  document.querySelectorAll('.view').forEach(x=>{x.classList.remove('active');x.style.display='none';});
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.mob-tab').forEach(x=>x.classList.toggle('active', x.dataset.view===v));
  const vEl = document.getElementById('view-'+v);
  if(vEl) {
    vEl.style.display = '';
    // Reset animation so it replays on every tab switch
    vEl.style.animation = 'none';
    vEl.offsetHeight; // force reflow
    vEl.style.animation = '';
    vEl.classList.add('active');
  }
  if(el && el.classList.contains('nav-btn')) el.classList.add('active');
  const titles = {
    pipeline:'צינור הפרויקטים', clients:'הלקוחות שלי',
    calendar:'לוח שנה', payments:'מעקב תשלומים',
    tracking:'מעקב ביצועים', scripts:'תסריטים',
    trash:'פח אשפה', history:'היסטוריה'
  };
  const t = titles[v] || v;
  document.getElementById('view-title').textContent = t;
  const mt = document.getElementById('mob-view-title'); if(mt) mt.textContent = t;
  const subtitles = {
    scripts: 'ניהול תסריטים לפרויקטים',
    history: 'ארכיון, לוג פעילות וסטטיסטיקות',
    trash: 'פריטים שנמחקו ישמרו כאן',
    tracking: 'מעקב ביצועי וידאו'
  };
  const subEl = document.getElementById('view-subtitle');
  if (subEl) {
    const sub = subtitles[v];
    subEl.textContent = sub || '';
    subEl.style.display = sub ? '' : 'none';
  }
  document.getElementById('stats-row').style.display = v==='pipeline' ? '' : 'none';
  document.querySelector('.main')?.setAttribute('data-view', v);

  // ── Show/hide desktop subheaders ──
  ['scripts','history'].forEach(name => {
    const sh = document.getElementById('subheader-' + name);
    if (sh) sh.classList.toggle('active', v === name);
  });

  // ── Show/hide mobile subheaders + adjust content top padding ──
  const isMobile = window.innerWidth <= 768;
  ['scripts','history'].forEach(name => {
    const msh = document.getElementById('mob-subheader-' + name);
    if (msh) msh.classList.toggle('active', v === name);
  });

  // ── Hide .content when scripts/history are active (they live outside .content) ──
  const isOutsideContent = (v === 'scripts' || v === 'history');
  const contentEl = document.querySelector('.content');
  if (contentEl) {
    contentEl.style.display = isOutsideContent ? 'none' : '';
    if (!isOutsideContent) contentEl.scrollTop = 0;
  }

  // ── Mobile only: hide FAB on history view (no new items to add) ──
  const fab = document.getElementById('mobile-fab');
  if (fab) {
    if (isMobile && v === 'history') {
      fab.style.setProperty('display', 'none', 'important');
    } else {
      fab.style.removeProperty('display');
    }
  }
  if(v==='pipeline') { renderPipeline(); updateStats(); }
  if(v==='clients') renderClients();
  if(v==='calendar') renderCalendar();
  if(v==='payments') renderPayments();
  if(v==='tracking') renderTracking();
  if(v==='scripts') { fillScriptClients(''); renderScripts(); }
  if(v==='trash') renderTrash();
  if(v==='history') renderHistory();
}

// ── STATS ──────────────────
function updateStats() {
  const active = projects.filter(p=>p.stage!=='published');
  const now=new Date(), week=new Date(now.getTime()+7*86400000);
  const due = projects.filter(p=>{if(!p.deadline) return false; const d=new Date(p.deadline); return d>=now&&d<=week;});
  const paid = projects.filter(p=>p.paid==='paid').reduce((s,p)=>s+(+p.price||0),0);
  const unpaid = projects.filter(p=>p.paid!=='paid').reduce((s,p)=>s+(+p.price||0),0);
  document.getElementById('s-total').textContent = active.length;
  document.getElementById('s-due').textContent = due.length;
  document.getElementById('s-paid').textContent = '₪'+paid.toLocaleString();
  document.getElementById('s-unpaid').textContent = '₪'+unpaid.toLocaleString();
  document.getElementById('nc-active').textContent = active.length;
}

// ── FILTER ─────────────────
function setFilter(f, el) {
  activeFilter=f;
  document.querySelectorAll('.filter-chip').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderPipeline();
}
function filteredProjects() {
  if (activeFilter==='overdue') return projects.filter(p=>daysLeft(p.deadline)<0);
  if (activeFilter==='week') return projects.filter(p=>{const d=daysLeft(p.deadline); return d!==null&&d>=0&&d<=7;});
  return [...projects];
}

// ── VIEW MODE ──────────────
function setViewMode(m) {
  viewMode=m;
  document.getElementById('vt-kanban').classList.toggle('active', m==='kanban');
  document.getElementById('vt-list').classList.toggle('active', m==='list');
  document.getElementById('kanban-view').style.display = m==='kanban'?'':'none';
  document.getElementById('list-view-wrap').style.display = m==='list'?'':'none';
  renderPipeline();
}

function quickSetPaid(id, status, e) {
  e.stopPropagation();
  const p = projects.find(x => x.id === id);
  if (!p) return;
  p.paid = status;
  save();
  syncAll();
  const labels = { paid: '✅ סומן כשולם!', partial: '⚡ סומן כחלקי!', unpaid: '↩ סומן כלא שולם' };
  logActivity('payment','💰',`תשלום: ${labels[status].replace(/^[^\s]+\s/,'')}`,p.name,p.client);
  toast(labels[status]);
}


// ── PAYMENTS ───────────────
function togglePayClient(name) {
  const el = document.getElementById('pay-projs-' + CSS.escape(name));
  if (el) el.classList.toggle('open');
}

function toggleReceipt(name, e) {
  if(e) e.stopPropagation();
  if (!clientData[name]) clientData[name] = {};
  clientData[name].receiptSent = !clientData[name].receiptSent;
  saveClients(); renderPayments();
  toast(clientData[name].receiptSent ? '🧾 קבלה סומנה כנשלחה!' : '↩ קבלה סומנה כלא נשלחה');
}

// ── PAYMENT DETAIL SCREEN ──────────────────────────────────────
let _payDetailClient = null;

function openPayDetail(clientName) {
  _payDetailClient = clientName;
  const col = ac(clientName);
  const cd  = clientData[clientName] || {};
  const pkg = cd.package || {};
  const clientProjects = projects.filter(p => p.client === clientName);
  const packageProjects = clientProjects.filter(p => p.isPartOfPackage);
  const standaloneProjects = clientProjects.filter(p => !p.isPartOfPackage);

  // Header
  const avatarEl = document.getElementById('pay-detail-avatar');
  avatarEl.textContent = clientName.charAt(0);
  avatarEl.style.background = col+'22';
  avatarEl.style.color = col;
  document.getElementById('pay-detail-name').textContent = clientName;

  // Totals
  const pkgPaid = _getPkgPaid(pkg);
  const projPaid = standaloneProjects.reduce((s,p)=>s+getProjectPaid(p),0);
  const pkgTotal = +pkg.price||0;
  const projTotal = standaloneProjects.reduce((s,p)=>s+(+p.price||0),0);
  const totalOwed = pkgTotal + projTotal;
  const totalPaid = pkgPaid + projPaid;
  const totalPending = Math.max(0, totalOwed - totalPaid);

  document.getElementById('pay-detail-sub').textContent = `${clientProjects.length} פרויקטים${pkg.price?' · חבילה':''}`;
  document.getElementById('pay-detail-totals').innerHTML = `
    <div style="text-align:center">
      <div style="font-size:18px;font-weight:900;color:var(--success)">₪${totalPaid.toLocaleString()}</div>
      <div style="font-size:10px;color:var(--muted2)">שולם</div>
    </div>
    <div style="text-align:center">
      <div style="font-size:18px;font-weight:900;color:${totalPending>0?'var(--danger)':'var(--muted2)'}">₪${totalPending.toLocaleString()}</div>
      <div style="font-size:10px;color:var(--muted2)">ממתין</div>
    </div>`;

  // Body
  let html = '';

  // ── Package section ──────────────────────────────────────
  if (pkg.price) {
    const pkgPct = Math.min(100, pkgTotal>0 ? Math.round(pkgPaid/pkgTotal*100) : 0);
    const pkgHistory = pkg.paymentHistory || [];
    html += `<div class="pay-section">
      <div class="pay-section-title">📦 חבילת סרטונים</div>
      <div class="pay-item-card" style="cursor:pointer" onclick="openPkgPayPanel(this.dataset.cn)" data-cn="${clientName}" onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">
        <div class="pay-item-header">
          <div class="pay-item-icon" style="background:linear-gradient(135deg,#ff3c6e18,#ff8c4210)">📦</div>
          <div class="pay-item-info">
            <div class="pay-item-name">${pkg.name||'חבילת סרטונים'}</div>
            <div class="pay-item-sub">${pkg.total||'?'} סרטונים · ${packageProjects.length} הועלו</div>
          </div>
          <div class="pay-item-amounts">
            <div class="pay-item-total" style="color:var(--success)">₪${pkgPaid.toLocaleString()}</div>
            <div class="pay-item-paid-row" style="color:var(--muted2)">מתוך ₪${pkgTotal.toLocaleString()}</div>
          </div>
        </div>
        <div style="padding:0 16px 4px">
          <div class="pay-item-progress" style="border-radius:6px;overflow:hidden">
            <div class="pay-item-progress-fill" style="width:${pkgPct}%;background:${pkgPct>=100?'var(--success)':'linear-gradient(90deg,var(--accent),var(--accent2))'}"></div>
          </div>
          <div style="font-size:10px;color:var(--muted2);margin-top:4px;margin-bottom:8px">${pkgPct}% שולם</div>
        </div>
        ${pkgHistory.length ? `<div class="pay-history-list">${pkgHistory.map((entry,i)=>`
          <div class="pay-history-row">
            <div class="pay-history-amt">₪${Number(entry.amount).toLocaleString()}</div>
            <div class="pay-history-date">${new Date(entry.date).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit',year:'2-digit'})}</div>
            ${entry.method?`<div class="pay-history-method">${_methodLabel(entry.method)}</div>`:''}
            <button class="pay-history-del" data-cn="${h(clientName)}" data-idx="${i}" onclick="removePaymentFromPkg(this.dataset.cn,+this.dataset.idx)">✕</button>
          </div>`).join('')}</div>` : ''}
        <button class="pay-add-btn" data-cn="${h(clientName)}" onclick="openPayModal('__pkg__',this.dataset.cn)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/></svg>
          הוסף תשלום לחבילה
        </button>
      </div>
    </div>`;
  }

  // ── Standalone projects section ───────────────────────────
  if (standaloneProjects.length) {
    html += `<div class="pay-section">
      <div class="pay-section-title">🎬 פרויקטים נפרדים</div>
      ${standaloneProjects.map(p => {
        const paid    = getProjectPaid(p);
        const total   = +p.price||0;
        const pct     = total>0 ? Math.min(100,Math.round(paid/total*100)) : 0;
        const history = p.paymentHistory || [];
        const stg     = (typeof STAGES!=='undefined'&&STAGES[p.stage])||{color:'#888',label:''};
        return `<div class="pay-item-card" style="cursor:pointer" onclick="openProjPayPanel('${p.id}')" onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">
          <div class="pay-item-header">
            <div class="pay-item-icon" style="background:${stg.color}18">${(typeof TYPES!=='undefined'&&TYPES[p.type])||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'}</div>
            <div class="pay-item-info">
              <div class="pay-item-name">${h(p.name)}</div>
              <div class="pay-item-sub" style="color:${stg.color}">${stg.label}${p.deadline?' · '+new Date(p.deadline).toLocaleDateString('he-IL',{day:'numeric',month:'short'}):''}</div>
            </div>
            <div class="pay-item-amounts">
              <div class="pay-item-total" style="color:${paid>=total&&total>0?'var(--success)':paid>0?'var(--warn)':'var(--muted2)'}">₪${paid.toLocaleString()}</div>
              <div class="pay-item-paid-row" style="color:var(--muted2)">מתוך ₪${total.toLocaleString()}</div>
            </div>
          </div>
          ${total>0?`<div style="padding:0 16px 4px">
            <div class="pay-item-progress" style="border-radius:6px;overflow:hidden">
              <div class="pay-item-progress-fill" style="width:${pct}%;background:${pct>=100?'var(--success)':'linear-gradient(90deg,var(--success),#00c987)'}"></div>
            </div>
            <div style="font-size:10px;color:var(--muted2);margin-top:4px;margin-bottom:8px">${pct}% שולם</div>
          </div>`:''}
          ${history.length ? `<div class="pay-history-list">${history.map((entry,i)=>`
            <div class="pay-history-row">
              <div class="pay-history-amt">₪${Number(entry.amount).toLocaleString()}</div>
              <div class="pay-history-date">${new Date(entry.date).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit',year:'2-digit'})}</div>
              ${entry.method?`<div class="pay-history-method">${_methodLabel(entry.method)}</div>`:''}
              <button class="pay-history-del" onclick="removePaymentFromProj('${p.id}',${i})">✕</button>
            </div>`).join('')}</div>` : ''}
          <button class="pay-add-btn" onclick="event.stopPropagation();openProjPayPanel('${p.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/></svg>
            עריכת תשלום
          </button>
        </div>`;
      }).join('')}
    </div>`;
  }

  if (!html) html = `<div style="text-align:center;padding:60px 20px;color:var(--muted2)">אין פרויקטים או חבילה ללקוח זה</div>`;

  document.getElementById('pay-detail-body').innerHTML = html;
  document.getElementById('pay-detail-screen').style.display = 'flex';
  document.getElementById('pay-detail-screen').style.flexDirection = 'column';
}

function closePayDetail() {
  document.getElementById('pay-detail-screen').style.display = 'none';
  _payDetailClient = null;
}

function _getPkgPaid(pkg) {
  if (pkg.paymentHistory && pkg.paymentHistory.length)
    return pkg.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  return pkg.paid==='paid' ? (+pkg.price||0) : (+pkg.paidAmount||0);
}

function _methodLabel(m) {
  return {transfer:'העברה',bit:'ביט',cash:'מזומן',check:"צ'ק"}[m]||m;
}

function removePaymentFromProj(projId, idx) {
  const p = projects.find(x=>x.id===projId); if(!p) return;
  p.paymentHistory = (p.paymentHistory||[]).filter((_,i)=>i!==idx);
  const total = p.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  p.paidAmount = total;
  p.paid = p.price&&total>=(+p.price)?'paid':total>0?'partial':'unpaid';
  save(); syncAll(); openPayDetail(_payDetailClient);
  toast('🗑️ תשלום הוסר');
}

function removePaymentFromPkg(clientName, idx) {
  const cd = clientData[clientName]; if(!cd||!cd.package) return;
  cd.package.paymentHistory = (cd.package.paymentHistory||[]).filter((_,i)=>i!==idx);
  const total = cd.package.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  cd.package.paidAmount = total;
  cd.package.paid = cd.package.price&&total>=(+cd.package.price)?'paid':total>0?'partial':'unpaid';
  saveClients(); renderPayments(); openPayDetail(clientName);
  toast('🗑️ תשלום הוסר');
}

// ── PAY MODAL (shared for project + package) ───────────────────
function openPayModal(projId, clientName) {
  const existing = document.getElementById('pay-modal-overlay');
  if (existing) existing.remove();
  const isPkg = projId === '__pkg__';
  const p     = isPkg ? null : projects.find(x=>x.id===projId);
  const cd    = clientData[clientName]||{};
  const pkg   = cd.package||{};
  const title = isPkg ? `📦 ${pkg.name||'חבילת סרטונים'}` : `🎬 ${p?p.name:'פרויקט'}`;
  const sub   = isPkg ? `₪${Number(pkg.price||0).toLocaleString()} סה"כ` : `₪${Number(p&&p.price||0).toLocaleString()} סה"כ`;
  const today = new Date().toISOString().slice(0,10);
  const METHODS = [{k:'transfer',l:'🏦 העברה'},{k:'bit',l:'📱 ביט'},{k:'cash',l:'💵 מזומן'},{k:'check',l:"📄 צ'ק"}];

  const ov = document.createElement('div');
  ov.id = 'pay-modal-overlay';
  ov.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML = `
    <div style="background:var(--s1);border:1px solid var(--border2);border-radius:20px;padding:28px;width:100%;max-width:420px;box-shadow:0 24px 80px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px">
        <div>
          <div style="font-size:18px;font-weight:900;margin-bottom:3px">הוספת תשלום</div>
          <div style="font-size:13px;font-weight:700;color:var(--muted2)">${title}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${sub}</div>
        </div>
        <button onclick="document.getElementById('pay-modal-overlay').remove()" style="background:var(--s2);border:1px solid var(--border);color:var(--muted2);width:32px;height:32px;border-radius:9px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div>
          <label style="font-size:11px;color:var(--muted2);font-weight:700;display:block;margin-bottom:6px">סכום (₪) *</label>
          <input id="pm-amount" type="number" min="0" placeholder="0" autofocus
            style="width:100%;background:var(--s3);border:1.5px solid var(--border2);border-radius:10px;padding:11px 13px;font-family:inherit;font-size:18px;font-weight:800;color:var(--text);outline:none">
        </div>
        <div>
          <label style="font-size:11px;color:var(--muted2);font-weight:700;display:block;margin-bottom:6px">תאריך</label>
          <input id="pm-date" type="date" value="${today}"
            style="width:100%;background:var(--s3);border:1.5px solid var(--border2);border-radius:10px;padding:10px 13px;font-family:inherit;font-size:13px;color:var(--text);outline:none">
        </div>
      </div>

      <div style="margin-bottom:20px">
        <label style="font-size:11px;color:var(--muted2);font-weight:700;display:block;margin-bottom:8px">אמצעי תשלום</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${METHODS.map(m=>`<button id="pm-m-${m.k}" onclick="selectPM('${m.k}')"
            style="flex:1;padding:10px 6px;border-radius:10px;border:1.5px solid var(--border2);background:var(--s2);color:var(--muted2);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;min-width:70px">${m.l}</button>`).join('')}
        </div>
        <input type="hidden" id="pm-method" value="">
      </div>

      <button data-projid="${h(projId)}" data-client="${h(clientName)}" data-ispkg="${isPkg}" onclick="savePM(this.dataset.projid,this.dataset.client,this.dataset.ispkg==='true')"
        style="width:100%;padding:14px;background:linear-gradient(135deg,var(--success),#00c987);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;transition:all .2s">
        💰 שמור תשלום
      </button>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if(e.target===ov) ov.remove(); });
  document.getElementById('pm-amount').focus();
}

function selectPM(m) {
  document.getElementById('pm-method').value = m;
  const cols = {transfer:'var(--cyan)',bit:'#a78bfa',cash:'var(--success)',check:'var(--warn)'};
  ['transfer','bit','cash','check'].forEach(k=>{
    const b = document.getElementById('pm-m-'+k); if(!b)return;
    const on = k===m;
    b.style.borderColor = on?cols[k]:'var(--border2)';
    b.style.color       = on?cols[k]:'var(--muted2)';
    b.style.background  = on?cols[k].replace('var(--cyan)','rgba(0,229,255,.1)').replace('var(--success)','rgba(0,229,160,.1)').replace('var(--warn)','rgba(255,184,48,.1)').replace('#a78bfa','rgba(167,139,250,.1)'):'var(--s2)';
  });
}

function savePM(projId, clientName, isPkg) {
  const amt    = parseFloat(document.getElementById('pm-amount').value)||0;
  const date   = document.getElementById('pm-date').value || new Date().toISOString().slice(0,10);
  const method = document.getElementById('pm-method').value||'';
  if (!amt) { toast('⚠️ נא להזין סכום'); return; }
  const entry = { amount: amt, date, method };

  if (isPkg || projId === '__pkg__') {
    if (!clientData[clientName]) clientData[clientName]={};
    if (!clientData[clientName].package) clientData[clientName].package={};
    const pkg = clientData[clientName].package;
    if (!pkg.paymentHistory) pkg.paymentHistory=[];
    pkg.paymentHistory.push(entry);
    const total = pkg.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
    pkg.paidAmount = total;
    pkg.paid = pkg.price&&total>=(+pkg.price)?'paid':total>0?'partial':'unpaid';
    saveClients();
  } else {
    const p = projects.find(x=>x.id===projId); if(!p) return;
    if (!p.paymentHistory) p.paymentHistory=[];
    p.paymentHistory.push(entry);
    const total = p.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
    p.paidAmount = total;
    p.paid = p.price&&total>=(+p.price)?'paid':total>0?'partial':'unpaid';
    save();
  }
  syncAll();
  document.getElementById('pay-modal-overlay').remove();
  openPayDetail(clientName);
  toast('💰 תשלום נוסף!');
}

// ═══════════════════════════════════════════════════════════════
// PROJECT PAYMENT SIDE PANEL
// ═══════════════════════════════════════════════════════════════
let _pppId = null; // current project id in panel

// ── PACKAGE PAYMENT PANEL ─────────────────────────────────────
let _pppClientName = null; // for package panel

function openPkgPayPanel(clientName) {
  _pppClientName = clientName;
  renderPkgPayPanel();
  document.getElementById('proj-pay-panel').classList.add('open');
  document.getElementById('ppp-overlay').classList.add('open');
}

function renderPkgPayPanel() {
  const cn  = _pppClientName;
  const cd  = clientData[cn] || {};
  const pkg = cd.package || {};
  const total   = +pkg.price || 0;
  const paid    = _getPkgPaid(pkg);
  const due     = Math.max(0, total - paid);
  const pct     = total > 0 ? Math.min(100, Math.round(paid/total*100)) : 0;
  const STATUS  = { paid:'✓ שולם', partial:'⚡ חלקי', unpaid:'✗ לא שולם' };
  const SCOL    = { paid:'var(--success)', partial:'var(--warn)', unpaid:'var(--danger)' };
  const st      = pkg.paid || 'unpaid';

  document.getElementById('ppp-title').textContent  = pkg.name || 'חבילת סרטונים';
  document.getElementById('ppp-client').textContent = cn + (pkg.total ? ` · ${pkg.total} סרטונים` : '');
  document.getElementById('ppp-status-badge').innerHTML = `<span style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;background:${SCOL[st]}18;color:${SCOL[st]};border:1px solid ${SCOL[st]}40">${STATUS[st]||''}</span>`;
  document.getElementById('ppp-total').textContent  = '₪' + total.toLocaleString();
  document.getElementById('ppp-paid').textContent   = '₪' + paid.toLocaleString();
  document.getElementById('ppp-due').textContent    = '₪' + due.toLocaleString();
  document.getElementById('ppp-due').style.color    = due > 0 ? 'var(--danger)' : 'var(--muted2)';
  document.getElementById('ppp-progress').style.width = pct + '%';
  document.getElementById('ppp-progress').style.background = pct >= 100 ? 'var(--success)' : 'linear-gradient(90deg,var(--accent),var(--accent2))';

  const history = pkg.paymentHistory || [];

  let html = '';

  // Edit price
  html += `
  <div style="margin-bottom:24px">
    <div style="font-size:11px;font-weight:700;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">💲 מחיר החבילה</div>
    <div style="display:flex;gap:8px;align-items:center">
      <input id="ppp-price-input" type="number" value="${pkg.price||''}" placeholder="0"
        style="flex:1;background:var(--s2);border:1.5px solid var(--border2);border-radius:10px;padding:10px 13px;font-family:inherit;font-size:16px;font-weight:800;color:var(--text);outline:none">
      <button onclick="savePkgPrice('${cn}')" style="padding:10px 16px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">שמור</button>
    </div>
  </div>`;

  // History
  html += `
  <div style="margin-bottom:20px">
    <div style="font-size:11px;font-weight:700;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">📋 היסטוריית תשלומים</div>`;

  if (!history.length) {
    html += `<div style="text-align:center;padding:24px;color:var(--muted2);font-size:13px;background:var(--s2);border-radius:12px;border:1px dashed var(--border2)">עדיין לא נרשמו תשלומים</div>`;
  } else {
    html += `<div style="display:flex;flex-direction:column;gap:10px">`;
    history.forEach((h, i) => {
      const methodIcon = {transfer:'🏦',bit:'📱',cash:'💵',check:"📄"}[h.method]||'💳';
      const hasReceipt = h.receipt;
      const METHS = [{k:'transfer',l:'🏦'},{k:'bit',l:'📱'},{k:'cash',l:'💵'},{k:'check',l:'📄'}];
      html += `
      <div style="background:var(--s2);border:1px solid var(--border);border-radius:13px;overflow:hidden">
        <div id="pkg-view-${i}" style="display:flex;align-items:center;gap:8px;padding:12px 14px">
          <div style="width:36px;height:36px;border-radius:9px;background:rgba(0,229,160,.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${methodIcon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:16px;font-weight:900;color:var(--success)">₪${Number(h.amount).toLocaleString()}</div>
            <div style="font-size:11px;color:var(--muted2);margin-top:1px">${h.date?new Date(h.date).toLocaleDateString('he-IL',{day:'numeric',month:'long',year:'numeric'}):'—'}${h.method?' · '+_methodLabel(h.method):''}</div>
          </div>
          ${hasReceipt
            ? `<div onclick="viewPkgReceipt(${i})" style="cursor:pointer">${hasReceipt.startsWith('data:image')?`<img src="${hasReceipt}" class="receipt-thumb">`:`<div class="receipt-thumb-pdf">📄</div>`}</div>`
            : `<label class="receipt-upload-btn">📎<input type="file" accept="image/*,application/pdf" style="display:none" onchange="attachPkgReceipt(event,${i},'${cn}')"></label>`}
          <button onclick="togglePkgEdit(${i})" style="background:var(--s3);border:1px solid var(--border2);color:var(--muted2);cursor:pointer;font-size:11px;font-weight:700;padding:5px 9px;border-radius:7px;font-family:inherit">✏️</button>
          <button onclick="deletePkgEntry(${i},'${cn}')" style="background:rgba(255,60,110,.1);border:1px solid rgba(255,60,110,.25);color:var(--danger);cursor:pointer;font-size:11px;font-weight:700;padding:5px 9px;border-radius:7px;font-family:inherit">🗑</button>
        </div>
        <div id="pkg-edit-${i}" style="display:none;flex-direction:column;gap:10px;padding:12px 14px;border-top:1px solid var(--border);background:var(--s1)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div>
              <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:4px">סכום (₪)</label>
              <input id="pkg-edit-amt-${i}" type="number" value="${h.amount}" style="width:100%;background:var(--s2);border:1.5px solid var(--border2);border-radius:8px;padding:8px 10px;font-family:inherit;font-size:15px;font-weight:800;color:var(--text);outline:none">
            </div>
            <div>
              <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:4px">תאריך</label>
              <input id="pkg-edit-date-${i}" type="date" value="${h.date||new Date().toISOString().slice(0,10)}" style="width:100%;background:var(--s2);border:1.5px solid var(--border2);border-radius:8px;padding:7px 10px;font-family:inherit;font-size:12px;color:var(--text);outline:none">
            </div>
          </div>
          <div>
            <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:5px">אמצעי תשלום</label>
            <div style="display:flex;gap:5px">
              ${METHS.map(m=>`<button id="pkg-em-${i}-${m.k}" onclick="setPkgEditMethod(${i},'${m.k}','${cn}')" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid ${h.method===m.k?'var(--success)':'var(--border2)'};background:${h.method===m.k?'rgba(0,229,160,.12)':'var(--s2)'};color:${h.method===m.k?'var(--success)':'var(--muted2)'};font-family:inherit;font-size:14px;cursor:pointer;transition:all .15s">${m.l}</button>`).join('')}
            </div>
            <input type="hidden" id="pkg-edit-method-${i}" value="${h.method||''}">
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="savePkgEdit(${i},'${cn}')" style="flex:1;padding:9px;background:linear-gradient(135deg,var(--success),#00c987);color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer">✓ שמור</button>
            <button onclick="togglePkgEdit(${i})" style="padding:9px 14px;background:var(--s2);border:1px solid var(--border2);color:var(--muted2);border-radius:9px;font-family:inherit;font-size:13px;cursor:pointer">ביטול</button>
          </div>
        </div>
      </div>`;
    });
    html += `</div>`;
  }
  html += `</div>`;

  // Add payment form
  const today = new Date().toISOString().slice(0,10);
  const METHODS = [{k:'transfer',l:'🏦 העברה'},{k:'bit',l:'📱 ביט'},{k:'cash',l:'💵 מזומן'},{k:'check',l:"📄 צ'ק"}];
  html += `
  <div style="background:var(--s2);border:1.5px solid var(--border2);border-radius:14px;padding:16px;margin-bottom:20px">
    <div style="font-size:11px;font-weight:700;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">➕ תשלום חדש</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div>
        <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:5px">סכום (₪) *</label>
        <input id="ppp-new-amount" type="number" min="0" placeholder="0"
          style="width:100%;background:var(--s1);border:1.5px solid var(--border2);border-radius:9px;padding:10px 12px;font-family:inherit;font-size:17px;font-weight:900;color:var(--text);outline:none">
      </div>
      <div>
        <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:5px">תאריך</label>
        <input id="ppp-new-date" type="date" value="${today}"
          style="width:100%;background:var(--s1);border:1.5px solid var(--border2);border-radius:9px;padding:9px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none">
      </div>
    </div>
    <div style="margin-bottom:12px">
      <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:6px">אמצעי תשלום</label>
      <div style="display:flex;gap:6px">
        ${METHODS.map(m=>`<button id="ppp-m-${m.k}" onclick="selectPPPMethod('${m.k}')"
          style="flex:1;padding:8px 4px;border-radius:9px;border:1.5px solid var(--border2);background:var(--s1);color:var(--muted2);font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s">${m.l}</button>`).join('')}
      </div>
      <input type="hidden" id="ppp-new-method" value="">
    </div>
    <div style="margin-bottom:12px">
      <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:6px">אסמכתא (אופציונלי)</label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 12px;background:var(--s1);border:1.5px dashed var(--border2);border-radius:9px;color:var(--muted2);font-size:12px;font-weight:600" id="ppp-receipt-label">
        <span id="ppp-receipt-icon">📎</span>
        <span id="ppp-receipt-name">לחץ לצירוף תמונה / PDF</span>
        <input type="file" id="ppp-new-receipt" accept="image/*,application/pdf" style="display:none" onchange="previewNewReceipt(event)">
      </label>
      <div id="ppp-receipt-preview" style="margin-top:8px;display:none">
        <img id="ppp-receipt-img" style="max-height:80px;border-radius:8px;border:1px solid var(--border2)">
      </div>
    </div>
    <button onclick="savePkgNewPayment('${cn}')" style="width:100%;padding:13px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;border-radius:11px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer">💰 הוסף תשלום לחבילה</button>
  </div>`;

  document.getElementById('ppp-body').innerHTML = html;
}

function savePkgPrice(cn) {
  if (!clientData[cn]) clientData[cn] = {};
  if (!clientData[cn].package) clientData[cn].package = {};
  const val = parseFloat(document.getElementById('ppp-price-input').value)||0;
  clientData[cn].package.price = val;
  const paid = _getPkgPaid(clientData[cn].package);
  clientData[cn].package.paid = val && paid >= val ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  saveClients(); syncAll();
  renderPkgPayPanel();
  toast('✏️ מחיר עודכן!');
}

function savePkgNewPayment(cn) {
  if (!clientData[cn]) clientData[cn] = {};
  if (!clientData[cn].package) clientData[cn].package = {};
  const pkg = clientData[cn].package;
  const amt = parseFloat(document.getElementById('ppp-new-amount').value)||0;
  if (!amt) { toast('⚠️ נא להזין סכום'); return; }
  const date   = document.getElementById('ppp-new-date').value || new Date().toISOString().slice(0,10);
  const method = document.getElementById('ppp-new-method').value || '';
  const entry  = { amount: amt, date, method };

  const fileInput = document.getElementById('ppp-new-receipt');
  const file = fileInput && fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      entry.receipt = e.target.result;
      _commitPkgPayment(pkg, entry, cn);
    };
    reader.readAsDataURL(file);
  } else {
    _commitPkgPayment(pkg, entry, cn);
  }
}

function _commitPkgPayment(pkg, entry, cn) {
  if (!pkg.paymentHistory) pkg.paymentHistory = [];
  pkg.paymentHistory.push(entry);
  const total = pkg.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  pkg.paidAmount = total;
  pkg.paid = pkg.price && total >= (+pkg.price) ? 'paid' : total > 0 ? 'partial' : 'unpaid';
  saveClients(); syncAll();
  renderPkgPayPanel();
  toast('💰 תשלום נוסף!');
}

function togglePkgEdit(i) {
  const el = document.getElementById('pkg-edit-'+i); if(!el) return;
  const isOpen = el.style.display === 'flex';
  el.style.display = isOpen ? 'none' : 'flex';
  el.style.flexDirection = 'column';
}

function setPkgEditMethod(i, m, cn) {
  document.getElementById('pkg-edit-method-'+i).value = m;
  ['transfer','bit','cash','check'].forEach(k => {
    const b = document.getElementById('pkg-em-'+i+'-'+k); if(!b) return;
    const on = k===m;
    b.style.borderColor = on ? 'var(--success)' : 'var(--border2)';
    b.style.background  = on ? 'rgba(0,229,160,.12)' : 'var(--s2)';
    b.style.color       = on ? 'var(--success)' : 'var(--muted2)';
  });
}

function savePkgEdit(i, cn) {
  const pkg = (clientData[cn]||{}).package; if(!pkg||!pkg.paymentHistory) return;
  const amt    = parseFloat(document.getElementById('pkg-edit-amt-'+i).value)||0;
  const date   = document.getElementById('pkg-edit-date-'+i).value;
  const method = document.getElementById('pkg-edit-method-'+i).value;
  if (!amt) { toast('⚠️ נא להזין סכום'); return; }
  pkg.paymentHistory[i].amount = amt;
  pkg.paymentHistory[i].date   = date;
  pkg.paymentHistory[i].method = method;
  const total = pkg.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  pkg.paidAmount = total;
  pkg.paid = pkg.price && total >= (+pkg.price) ? 'paid' : total > 0 ? 'partial' : 'unpaid';
  saveClients(); syncAll();
  renderPkgPayPanel();
  toast('✏️ תשלום עודכן!');
}

function deletePkgEntry(idx, cn) {
  const pkg = (clientData[cn]||{}).package; if(!pkg) return;
  pkg.paymentHistory = (pkg.paymentHistory||[]).filter((_,i)=>i!==idx);
  const total = pkg.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  pkg.paidAmount = total;
  pkg.paid = pkg.price && total >= (+pkg.price) ? 'paid' : total > 0 ? 'partial' : 'unpaid';
  saveClients(); syncAll();
  renderPkgPayPanel();
  toast('🗑️ תשלום נמחק');
}

function attachPkgReceipt(event, idx, cn) {
  const pkg = (clientData[cn]||{}).package; if(!pkg) return;
  const file = event.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    if (!pkg.paymentHistory[idx]) return;
    pkg.paymentHistory[idx].receipt = e.target.result;
    saveClients();
    renderPkgPayPanel();
    toast('📎 אסמכתא צורפה!');
  };
  reader.readAsDataURL(file);
}

function removePkgReceipt(idx, cn) {
  const pkg = (clientData[cn]||{}).package; if(!pkg) return;
  if (pkg.paymentHistory[idx]) delete pkg.paymentHistory[idx].receipt;
  saveClients();
  renderPkgPayPanel();
  toast('🗑️ אסמכתא הוסרה');
}

function viewPkgReceipt(idx) {
  const pkg = (clientData[_pppClientName]||{}).package; if(!pkg) return;
  const h = (pkg.paymentHistory||[])[idx]; if(!h||!h.receipt) return;
  const existing = document.getElementById('receipt-lb');
  if (existing) existing.remove();
  const lb = document.createElement('div');
  lb.id = 'receipt-lb';
  lb.className = 'receipt-lightbox';
  lb.onclick = () => lb.remove();
  if (h.receipt.startsWith('data:application/pdf')) {
    lb.innerHTML = `<div style="background:var(--s1);padding:24px;border-radius:16px;text-align:center;max-width:400px">
      <div style="font-size:60px;margin-bottom:12px">📄</div>
      <div style="font-weight:700;margin-bottom:16px">קובץ PDF</div>
      <a href="${h.receipt}" download="receipt.pdf" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border-radius:10px;text-decoration:none;font-weight:700">הורד PDF</a>
    </div>`;
  } else {
    lb.innerHTML = `<div style="position:relative">
      <img src="${h.receipt}" style="max-width:90vw;max-height:90vh;border-radius:12px;display:block">
      <a href="${h.receipt}" download="receipt" style="position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,.7);color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700">⬇ הורד</a>
    </div>`;
  }
  document.body.appendChild(lb);
}

// update closeProjPayPanel to also handle pkg mode
function closeProjPayPanel() {
  document.getElementById('proj-pay-panel').classList.remove('open');
  document.getElementById('ppp-overlay').classList.remove('open');
  if (_payDetailClient) openPayDetail(_payDetailClient);
  else renderPayments();
  _pppId = null;
  _pppClientName = null;
}

function openProjPayPanel(projId) {
  _pppId = projId;
  renderProjPayPanel();
  document.getElementById('proj-pay-panel').classList.add('open');
  document.getElementById('ppp-overlay').classList.add('open');
}

function renderProjPayPanel() {
  const p = projects.find(x=>x.id===_pppId); if(!p) return;
  const total   = +p.price || 0;
  const paid    = getProjectPaid(p);
  const due     = Math.max(0, total - paid);
  const pct     = total > 0 ? Math.min(100, Math.round(paid/total*100)) : 0;
  const stg     = (typeof STAGES!=='undefined' && STAGES[p.stage]) || {color:'#888', label:''};
  const STATUS  = { paid:'✓ שולם', partial:'⚡ חלקי', unpaid:'✗ לא שולם' };
  const SCOL    = { paid:'var(--success)', partial:'var(--warn)', unpaid:'var(--danger)' };

  // Header elements
  document.getElementById('ppp-title').textContent  = p.name;
  document.getElementById('ppp-client').textContent = p.client + (p.deadline ? ' · ' + new Date(p.deadline).toLocaleDateString('he-IL',{day:'numeric',month:'short'}) : '');
  document.getElementById('ppp-status-badge').innerHTML = `<span style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;background:${SCOL[p.paid]}18;color:${SCOL[p.paid]};border:1px solid ${SCOL[p.paid]}40">${STATUS[p.paid]||''}</span>`;
  document.getElementById('ppp-total').textContent  = '₪' + total.toLocaleString();
  document.getElementById('ppp-paid').textContent   = '₪' + paid.toLocaleString();
  document.getElementById('ppp-due').textContent    = '₪' + due.toLocaleString();
  document.getElementById('ppp-due').style.color    = due > 0 ? 'var(--danger)' : 'var(--muted2)';
  document.getElementById('ppp-progress').style.width = pct + '%';
  document.getElementById('ppp-progress').style.background = pct >= 100 ? 'var(--success)' : 'linear-gradient(90deg,var(--success),#00c987)';

  const history = p.paymentHistory || [];

  // ── Body ─────────────────────────────────────────────────
  let html = '';

  // Edit price section
  html += `
  <div style="margin-bottom:24px">
    <div style="font-size:11px;font-weight:700;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">💲 מחיר הפרויקט</div>
    <div style="display:flex;gap:8px;align-items:center">
      <input id="ppp-price-input" type="number" value="${p.price||''}" placeholder="0"
        style="flex:1;background:var(--s2);border:1.5px solid var(--border2);border-radius:10px;padding:10px 13px;font-family:inherit;font-size:16px;font-weight:800;color:var(--text);outline:none">
      <button onclick="savePppPrice()" style="padding:10px 16px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">שמור</button>
    </div>
  </div>`;

  // Payment history section
  html += `
  <div style="margin-bottom:20px">
    <div style="font-size:11px;font-weight:700;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">📋 היסטוריית תשלומים</div>`;

  if (history.length === 0) {
    html += `<div style="text-align:center;padding:24px;color:var(--muted2);font-size:13px;background:var(--s2);border-radius:12px;border:1px dashed var(--border2)">עדיין לא נרשמו תשלומים</div>`;
  } else {
    html += `<div style="display:flex;flex-direction:column;gap:10px">`;
    history.forEach((h, i) => {
      const methodIcon = {transfer:'🏦',bit:'📱',cash:'💵',check:"📄"}[h.method]||'💳';
      const hasReceipt = h.receipt;
      const METHS = [{k:'transfer',l:'🏦'},{k:'bit',l:'📱'},{k:'cash',l:'💵'},{k:'check',l:'📄'}];
      html += `
      <div style="background:var(--s2);border:1px solid var(--border);border-radius:13px;overflow:hidden">
        <div id="ppp-view-${i}" style="display:flex;align-items:center;gap:8px;padding:12px 14px">
          <div style="width:36px;height:36px;border-radius:9px;background:rgba(0,229,160,.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${methodIcon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:16px;font-weight:900;color:var(--success)">₪${Number(h.amount).toLocaleString()}</div>
            <div style="font-size:11px;color:var(--muted2);margin-top:1px">${h.date?new Date(h.date).toLocaleDateString('he-IL',{day:'numeric',month:'long',year:'numeric'}):'—'}${h.method?' · '+_methodLabel(h.method):''}</div>
          </div>
          ${hasReceipt
            ? `<div onclick="viewReceipt(${i})" style="cursor:pointer" title="צפה באסמכתא">${hasReceipt.startsWith('data:image')?`<img src="${hasReceipt}" class="receipt-thumb">`:`<div class="receipt-thumb-pdf">📄</div>`}</div>`
            : `<label class="receipt-upload-btn" title="צרף אסמכתא">📎<input type="file" accept="image/*,application/pdf" style="display:none" onchange="attachReceipt(event,${i})"></label>`}
          <button onclick="togglePppEdit(${i})" style="background:var(--s3);border:1px solid var(--border2);color:var(--muted2);cursor:pointer;font-size:11px;font-weight:700;padding:5px 9px;border-radius:7px;font-family:inherit">✏️</button>
          <button onclick="deletePppEntry(${i})" style="background:rgba(255,60,110,.1);border:1px solid rgba(255,60,110,.25);color:var(--danger);cursor:pointer;font-size:11px;font-weight:700;padding:5px 9px;border-radius:7px;font-family:inherit">🗑</button>
        </div>
        <div id="ppp-edit-${i}" style="display:none;flex-direction:column;gap:10px;padding:12px 14px;border-top:1px solid var(--border);background:var(--s1)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div>
              <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:4px">סכום (₪)</label>
              <input id="ppp-edit-amt-${i}" type="number" value="${h.amount}" style="width:100%;background:var(--s2);border:1.5px solid var(--border2);border-radius:8px;padding:8px 10px;font-family:inherit;font-size:15px;font-weight:800;color:var(--text);outline:none">
            </div>
            <div>
              <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:4px">תאריך</label>
              <input id="ppp-edit-date-${i}" type="date" value="${h.date||new Date().toISOString().slice(0,10)}" style="width:100%;background:var(--s2);border:1.5px solid var(--border2);border-radius:8px;padding:7px 10px;font-family:inherit;font-size:12px;color:var(--text);outline:none">
            </div>
          </div>
          <div>
            <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:5px">אמצעי תשלום</label>
            <div style="display:flex;gap:5px">
              ${METHS.map(m=>`<button id="ppp-em-${i}-${m.k}" onclick="setPppEditMethod(${i},'${m.k}')" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid ${h.method===m.k?'var(--success)':'var(--border2)'};background:${h.method===m.k?'rgba(0,229,160,.12)':'var(--s2)'};color:${h.method===m.k?'var(--success)':'var(--muted2)'};font-family:inherit;font-size:14px;cursor:pointer;transition:all .15s">${m.l}</button>`).join('')}
            </div>
            <input type="hidden" id="ppp-edit-method-${i}" value="${h.method||''}">
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="savePppEdit(${i})" style="flex:1;padding:9px;background:linear-gradient(135deg,var(--success),#00c987);color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer">✓ שמור</button>
            <button onclick="togglePppEdit(${i})" style="padding:9px 14px;background:var(--s2);border:1px solid var(--border2);color:var(--muted2);border-radius:9px;font-family:inherit;font-size:13px;cursor:pointer">ביטול</button>
          </div>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;

  // Add payment form
  const today = new Date().toISOString().slice(0,10);
  const METHODS = [{k:'transfer',l:'🏦 העברה'},{k:'bit',l:'📱 ביט'},{k:'cash',l:'💵 מזומן'},{k:'check',l:"📄 צ'ק"}];
  html += `
  <div style="background:var(--s2);border:1.5px solid var(--border2);border-radius:14px;padding:16px;margin-bottom:20px">
    <div style="font-size:11px;font-weight:700;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">➕ תשלום חדש</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div>
        <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:5px">סכום (₪) *</label>
        <input id="ppp-new-amount" type="number" min="0" placeholder="0"
          style="width:100%;background:var(--s1);border:1.5px solid var(--border2);border-radius:9px;padding:10px 12px;font-family:inherit;font-size:17px;font-weight:900;color:var(--text);outline:none">
      </div>
      <div>
        <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:5px">תאריך</label>
        <input id="ppp-new-date" type="date" value="${today}"
          style="width:100%;background:var(--s1);border:1.5px solid var(--border2);border-radius:9px;padding:9px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none">
      </div>
    </div>
    <div style="margin-bottom:12px">
      <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:6px">אמצעי תשלום</label>
      <div style="display:flex;gap:6px">
        ${METHODS.map(m=>`<button id="ppp-m-${m.k}" onclick="selectPPPMethod('${m.k}')"
          style="flex:1;padding:8px 4px;border-radius:9px;border:1.5px solid var(--border2);background:var(--s1);color:var(--muted2);font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s">${m.l}</button>`).join('')}
      </div>
      <input type="hidden" id="ppp-new-method" value="">
    </div>
    <div style="margin-bottom:12px">
      <label style="font-size:10px;color:var(--muted2);font-weight:700;display:block;margin-bottom:6px">אסמכתא (אופציונלי)</label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 12px;background:var(--s1);border:1.5px dashed var(--border2);border-radius:9px;color:var(--muted2);font-size:12px;font-weight:600;transition:all .15s" id="ppp-receipt-label">
        <span id="ppp-receipt-icon">📎</span>
        <span id="ppp-receipt-name">לחץ לצירוף תמונה / PDF</span>
        <input type="file" id="ppp-new-receipt" accept="image/*,application/pdf" style="display:none" onchange="previewNewReceipt(event)">
      </label>
      <div id="ppp-receipt-preview" style="margin-top:8px;display:none">
        <img id="ppp-receipt-img" style="max-height:80px;border-radius:8px;border:1px solid var(--border2)">
      </div>
    </div>
    <button onclick="savePppNewPayment()" style="width:100%;padding:13px;background:linear-gradient(135deg,var(--success),#00c987);color:#fff;border:none;border-radius:11px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;transition:all .2s">💰 הוסף תשלום</button>
  </div>`;

  document.getElementById('ppp-body').innerHTML = html;
}

function selectPPPMethod(m) {
  document.getElementById('ppp-new-method').value = m;
  const cols = {transfer:'var(--cyan)',bit:'#a78bfa',cash:'var(--success)',check:'var(--warn)'};
  const bgs  = {transfer:'rgba(0,229,255,.1)',bit:'rgba(167,139,250,.1)',cash:'rgba(0,229,160,.1)',check:'rgba(255,184,48,.1)'};
  ['transfer','bit','cash','check'].forEach(k => {
    const b = document.getElementById('ppp-m-'+k); if(!b) return;
    const on = k===m;
    b.style.borderColor = on ? cols[k] : 'var(--border2)';
    b.style.color       = on ? cols[k] : 'var(--muted2)';
    b.style.background  = on ? bgs[k]  : 'var(--s1)';
  });
}

function previewNewReceipt(event) {
  const file = event.target.files[0]; if(!file) return;
  document.getElementById('ppp-receipt-name').textContent = file.name;
  document.getElementById('ppp-receipt-icon').textContent = file.type === 'application/pdf' ? '📄' : '🖼️';
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('ppp-receipt-img').src = e.target.result;
      document.getElementById('ppp-receipt-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById('ppp-receipt-preview').style.display = 'none';
  }
}

function savePppNewPayment() {
  const p   = projects.find(x=>x.id===_pppId); if(!p) return;
  const amt = parseFloat(document.getElementById('ppp-new-amount').value)||0;
  if (!amt) { toast('⚠️ נא להזין סכום'); return; }
  const date   = document.getElementById('ppp-new-date').value || new Date().toISOString().slice(0,10);
  const method = document.getElementById('ppp-new-method').value || '';
  const entry  = { amount: amt, date, method };

  const fileInput = document.getElementById('ppp-new-receipt');
  const file = fileInput && fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      entry.receipt = e.target.result;
      _commitPppPayment(p, entry);
    };
    reader.readAsDataURL(file);
  } else {
    _commitPppPayment(p, entry);
  }
}

function _commitPppPayment(p, entry) {
  if (!p.paymentHistory) p.paymentHistory = [];
  p.paymentHistory.push(entry);
  const total = p.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  p.paidAmount = total;
  p.paid = p.price && total >= (+p.price) ? 'paid' : total > 0 ? 'partial' : 'unpaid';
  save(); syncAll();
  renderProjPayPanel();
  toast('💰 תשלום נוסף!');
}

function savePppPrice() {
  const p = projects.find(x=>x.id===_pppId); if(!p) return;
  const val = parseFloat(document.getElementById('ppp-price-input').value)||0;
  p.price = val;
  const total = getProjectPaid(p);
  p.paid = val && total >= val ? 'paid' : total > 0 ? 'partial' : 'unpaid';
  save(); syncAll();
  renderProjPayPanel();
  toast('✏️ מחיר עודכן!');
}

function togglePppEdit(i) {
  const editEl = document.getElementById('ppp-edit-'+i);
  const viewEl = document.getElementById('ppp-view-'+i);
  if (!editEl) return;
  const isOpen = editEl.style.display === 'flex';
  editEl.style.display = isOpen ? 'none' : 'flex';
  editEl.style.flexDirection = 'column';
}

function setPppEditMethod(i, m) {
  document.getElementById('ppp-edit-method-'+i).value = m;
  const cols = {transfer:'var(--success)',bit:'var(--success)',cash:'var(--success)',check:'var(--success)'};
  ['transfer','bit','cash','check'].forEach(k => {
    const b = document.getElementById('ppp-em-'+i+'-'+k); if(!b) return;
    const on = k===m;
    b.style.borderColor = on ? 'var(--success)' : 'var(--border2)';
    b.style.background  = on ? 'rgba(0,229,160,.12)' : 'var(--s2)';
    b.style.color       = on ? 'var(--success)' : 'var(--muted2)';
  });
}

function savePppEdit(i) {
  const p = projects.find(x=>x.id===_pppId); if(!p||!p.paymentHistory) return;
  const amt    = parseFloat(document.getElementById('ppp-edit-amt-'+i).value)||0;
  const date   = document.getElementById('ppp-edit-date-'+i).value;
  const method = document.getElementById('ppp-edit-method-'+i).value;
  if (!amt) { toast('⚠️ נא להזין סכום'); return; }
  p.paymentHistory[i].amount = amt;
  p.paymentHistory[i].date   = date;
  p.paymentHistory[i].method = method;
  const total = p.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  p.paidAmount = total;
  p.paid = p.price && total >= (+p.price) ? 'paid' : total > 0 ? 'partial' : 'unpaid';
  save(); syncAll();
  renderProjPayPanel();
  toast('✏️ תשלום עודכן!');
}

function deletePppEntry(idx) {
  const p = projects.find(x=>x.id===_pppId); if(!p) return;
  p.paymentHistory = (p.paymentHistory||[]).filter((_,i)=>i!==idx);
  const total = p.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  p.paidAmount = total;
  p.paid = p.price && total >= (+p.price) ? 'paid' : total > 0 ? 'partial' : 'unpaid';
  save(); syncAll();
  renderProjPayPanel();
  toast('🗑️ תשלום נמחק');
}

function attachReceipt(event, idx) {
  const p = projects.find(x=>x.id===_pppId); if(!p) return;
  const file = event.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    if (!p.paymentHistory[idx]) return;
    p.paymentHistory[idx].receipt = e.target.result;
    save();
    renderProjPayPanel();
    toast('📎 אסמכתא צורפה!');
  };
  reader.readAsDataURL(file);
}

function removeReceipt(idx) {
  const p = projects.find(x=>x.id===_pppId); if(!p) return;
  if (p.paymentHistory[idx]) { delete p.paymentHistory[idx].receipt; }
  save();
  renderProjPayPanel();
  toast('🗑️ אסמכתא הוסרה');
}

function viewReceipt(idx) {
  const p = projects.find(x=>x.id===_pppId); if(!p) return;
  const h = (p.paymentHistory||[])[idx]; if(!h||!h.receipt) return;
  const existing = document.getElementById('receipt-lb');
  if (existing) existing.remove();
  const lb = document.createElement('div');
  lb.id = 'receipt-lb';
  lb.className = 'receipt-lightbox';
  lb.onclick = () => lb.remove();
  if (h.receipt.startsWith('data:application/pdf')) {
    lb.innerHTML = `<div style="background:var(--s1);padding:24px;border-radius:16px;text-align:center;max-width:400px">
      <div style="font-size:60px;margin-bottom:12px">📄</div>
      <div style="font-weight:700;margin-bottom:16px">קובץ PDF</div>
      <a href="${h.receipt}" download="receipt.pdf" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border-radius:10px;text-decoration:none;font-weight:700">הורד PDF</a>
      <div style="margin-top:12px;font-size:12px;color:var(--muted2)">לחץ מחוץ לאזור לסגירה</div>
    </div>`;
  } else {
    lb.innerHTML = `<div style="position:relative;max-width:90vw">
      <img src="${h.receipt}" style="max-width:90vw;max-height:90vh;border-radius:12px;display:block">
      <a href="${h.receipt}" download="receipt" style="position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,.7);color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700">⬇ הורד</a>
      <div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,.6);color:#fff;padding:6px 10px;border-radius:8px;font-size:11px">לחץ לסגירה</div>
    </div>`;
  }
  document.body.appendChild(lb);
}





function getProjectPaid(p) {
  if (p.paymentHistory && p.paymentHistory.length)
    return p.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0);
  return p.paid==='paid' ? (+p.price||0) : (+p.paidAmount||0);
}

function renderPayments() {
  // ── Summary bar ──────────────────────────────────────────
  const allPaid    = projects.reduce((s,p)=>s+getProjectPaid(p),0);
  const allTotal   = projects.filter(p=>!p.isPartOfPackage).reduce((s,p)=>s+(+p.price||0),0);
  const allPending = Math.max(0, allTotal - allPaid);
  document.getElementById('pay-summary').innerHTML=`
    <div class="pay-sum"><div class="pay-sum-num" style="color:var(--text)">₪${allTotal.toLocaleString()}</div><div class="pay-sum-lbl">סה"כ</div></div>
    <div class="pay-sum"><div class="pay-sum-num" style="color:var(--success)">₪${allPaid.toLocaleString()}</div><div class="pay-sum-lbl">💰 התקבל</div></div>
    <div class="pay-sum"><div class="pay-sum-num" style="color:var(--danger)">₪${allPending.toLocaleString()}</div><div class="pay-sum-lbl">⏳ ממתין</div></div>`;

  // ── Build per-client data ────────────────────────────────
  const clientMap = {};
  projects.forEach(p => {
    if (!clientMap[p.client]) clientMap[p.client] = { projects: [], pkgTotal:0, projTotal:0, paid:0 };
    clientMap[p.client].projects.push(p);
    if (!p.isPartOfPackage) clientMap[p.client].projTotal += (+p.price||0);
    clientMap[p.client].paid += getProjectPaid(p);
  });
  Object.keys(clientData).forEach(name => {
    if (!clientMap[name]) clientMap[name] = { projects:[], pkgTotal:0, projTotal:0, paid:0 };
    const pkg = clientData[name].package;
    if (pkg && pkg.price) clientMap[name].pkgTotal = +pkg.price||0;
  });

  const sorted = Object.entries(clientMap)
    .filter(([n,d]) => d.projects.length || clientData[n])
    .sort((a,b) => (b[1].pkgTotal+b[1].projTotal) - (a[1].pkgTotal+a[1].projTotal));

  document.getElementById('pay-table').innerHTML = sorted.map(([name, d], i) => {
    const col      = ac(name);
    const cd       = clientData[name] || {};
    const pkg      = cd.package || {};
    const pkgPaid  = pkg.paymentHistory ? pkg.paymentHistory.reduce((s,x)=>s+(+x.amount||0),0) : (pkg.paid==='paid'?(+pkg.price||0):(+pkg.paidAmount||0));
    const totalOwed = d.projTotal + (pkg.price ? +pkg.price : 0);
    const totalPaid = d.paid + (pkg.price ? pkgPaid : 0) - (pkg.price ? d.paid : 0); // avoid double count
    // simpler: paid = sum of all project payments + pkg payments
    const realPaid  = projects.filter(p=>p.client===name&&!p.isPartOfPackage).reduce((s,p)=>s+getProjectPaid(p),0)
                    + pkgPaid;
    const realOwed  = d.projTotal + (pkg.price ? +pkg.price : 0);
    const pct       = realOwed > 0 ? Math.min(100, Math.round(realPaid/realOwed*100)) : 0;
    const statusCls = realPaid >= realOwed && realOwed > 0 ? 'paid' : realPaid > 0 ? 'partial' : 'unpaid';
    const statusTxt = { paid:'✓ שולם הכל', partial:'⚡ חלקי', unpaid:'✗ ממתין' }[statusCls];
    const statusCol = { paid:'var(--success)', partial:'var(--warn)', unpaid:'var(--danger)' }[statusCls];

    return `<div class="pay-client-row" style="animation-delay:${i*0.07}s" data-cname="${h(name)}" onclick="openPayDetail(this.dataset.cname)">
      <div class="pay-client-head" style="cursor:pointer">
        <div class="pay-client-avatar" style="background:${col}20;color:${col}">${h(name.charAt(0))}</div>
        <div class="pay-client-info">
          <div class="pay-client-name">${h(name)}</div>
          <div class="pay-client-sub">${d.projects.length} פרויקטים${pkg.price?' · חבילה':''}</div>
          <span class="pay-mob-amount" style="color:${statusCol}">₪${realPaid.toLocaleString()}</span>
          <span class="pay-mob-of">מתוך ₪${realOwed.toLocaleString()}</span>
        </div>
        <div class="pay-client-head-right" style="text-align:left">
          <div style="font-size:18px;font-weight:900;color:${statusCol}">₪${realPaid.toLocaleString()}</div>
          <div style="font-size:10px;color:var(--muted2);margin-top:1px">מתוך ₪${realOwed.toLocaleString()}</div>
        </div>
      </div>
      <div style="padding:0 16px 14px">
        <div style="height:6px;background:var(--s3);border-radius:6px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${pct>=100?'var(--success)':'linear-gradient(90deg,var(--accent),var(--accent2))'};border-radius:6px;transition:width .6s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:var(--muted2)">
          <span style="font-weight:700;color:${statusCol}">${statusTxt}</span>
          <span>${pct}% שולם</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function setVideoQuota(clientName, val) {
  if (!clientData[clientName]) clientData[clientName] = {};
  clientData[clientName].videoQuota = val ? parseInt(val) : null;
  saveClients();
  renderPayments();
}


// ── STAGE SELECT ───────────
function selectStage(s) {
  selStage=s;
  document.querySelectorAll('.stage-opt').forEach(el=>{
    const es=el.dataset.stage; const stg=STAGES[es];
    el.classList.toggle('active', es===s);
    if (es===s) { el.style.borderColor=stg.color+'55'; el.style.color=stg.color; el.style.background=stg.color+'18'; }
    else { el.style.borderColor=''; el.style.color=''; el.style.background=''; }
  });
}

// ── MODAL ──────────────────
function openModal() {
  editId=null;
  document.getElementById('modal-ttl').textContent='פרויקט חדש';
  document.getElementById('del-btn').style.display='none';
  const _wabtn=document.getElementById('wa-modal-btn'); if(_wabtn) _wabtn.style.display='none';
  const _abnm=document.getElementById('archive-btn'); if(_abnm) _abnm.style.display='none';
  ['fn','fc','fnotes'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fp').value=''; document.getElementById('fd').value=''; if(typeof setFpaid==='function') setFpaid('unpaid'); else document.getElementById('fpaid').value='unpaid';
  document.getElementById('ftype').value='reel';
  document.getElementById('fdrive').value='';
  selectStage('script');
  pendingFiles = [];
  renderFilesPreview();
  modalReturnClient = null;
  updateFcList();
  _editVersions = [];
  const _vsec = document.getElementById('versions-section');
  if (_vsec) _vsec.style.display = 'none';
  document.getElementById('overlay').classList.add('open');
}
function openEdit(id) {
  const p=projects.find(x=>x.id===id); if(!p) return;
  editId=id;
  document.getElementById('modal-ttl').textContent='עריכת פרויקט';
  document.getElementById('del-btn').style.display='';
  const _wabtn2=document.getElementById('wa-modal-btn'); if(_wabtn2) _wabtn2.style.display='';
  const _abtn=document.getElementById('archive-btn'); if(_abtn) _abtn.style.display='none';
  document.getElementById('fn').value=p.name;
  document.getElementById('fc').value=p.client;
  document.getElementById('fp').value=p.price||'';
  document.getElementById('fd').value=p.deadline||'';
  if(typeof setFpaid==='function') setFpaid(p.paid||'unpaid'); else document.getElementById('fpaid').value=p.paid||'unpaid';
  document.getElementById('ftype').value=p.type||'reel';
  document.getElementById('fnotes').value=p.notes||'';
  document.getElementById('fdrive').value=p.drive||'';
  selectStage(p.stage||'brief');
  pendingFiles = p.files ? JSON.parse(JSON.stringify(p.files)) : [];
  renderFilesPreview(pendingFiles);
  updateFcList();
  loadVersionsUI(id);
  document.getElementById('overlay').classList.add('open');
}
function closeModal() { document.getElementById('overlay').classList.remove('open'); }
document.getElementById('overlay').addEventListener('click', e=>{ if(e.target===document.getElementById('overlay')) closeModal(); });
document.getElementById('overlay-video').addEventListener('click', e=>{ if(e.target===document.getElementById('overlay-video')) closeVideoModal(); });
document.getElementById('overlay-package').addEventListener('click', e=>{ if(e.target===document.getElementById('overlay-package')) closePackageSettings(); });
document.getElementById('overlay-tracking').addEventListener('click', e=>{ if(e.target===document.getElementById('overlay-tracking')) document.getElementById('overlay-tracking').classList.remove('open'); });

function saveProj() {
  const name=document.getElementById('fn').value.trim();
  const client=document.getElementById('fc').value.trim();
  if (!name||!client) { toast('⚠️ נא למלא שם פרויקט ולקוח'); return; }
  const _cid = (clientData[client] && clientData[client].id) || ensureClientId(client);
  const data={ name, client, clientId: _cid, stage:selStage,
    type:document.getElementById('ftype').value,
    deadline:document.getElementById('fd').value,
    price:document.getElementById('fp').value,
    progress:stageToProgress(selStage),
    paid:document.getElementById('fpaid').value,
    notes:document.getElementById('fnotes').value.trim(),
    drive:document.getElementById('fdrive').value.trim(),
    files: JSON.parse(JSON.stringify(pendingFiles)) };
  if (editId) {
    const i=projects.findIndex(p=>p.id===editId);
    const _op=projects[i]; projects[i]={..._op,...data};
    if(_op.stage!==data.stage) logActivity('stage','🔄',`שלב שונה: ${VID_STAGES[_op.stage]?.label||_op.stage} ← ${VID_STAGES[data.stage]?.label||data.stage}`,data.name,data.client);
    else logActivity('update','✏️','פרויקט עודכן',data.name,data.client);
    toast('✏️ עודכן!');
  } else {
    const _np={id:Date.now().toString(),...data}; projects.push(_np);
    logActivity('create','➕','פרויקט נוצר',_np.name,_np.client);
    toast('✅ נוסף!');
  }
  saveVersionsToProject();
  save(); closeModal(); syncAll();
  // Assign vidNum if new project added for a client with a package
  if (!editId) {
    const _newP = projects[projects.length - 1];
    if (_newP && !_newP.vidNum) {
      const _cd = clientData[_newP.client] || {};
      const _pkg = _cd.package;
      if (_pkg && _pkg.total) {
        const _total = parseInt(_pkg.total) || 10;
        const _used = new Set(projects.filter(p => p.client === _newP.client && p.vidNum).map(p => p.vidNum));
        for (let _i = 1; _i <= _total; _i++) {
          if (!_used.has(_i)) { _newP.vidNum = _i; save(); break; }
        }
      }
    }
  }
  if (modalReturnClient) {
    const rc = modalReturnClient; modalReturnClient = null;
    setTimeout(() => openClientPanel(rc), 60);
  }
}
// ── CUSTOM CONFIRM DIALOG ──────────────────────────────────
function showConfirm({ icon='🗑️', title='האם אתה בטוח?', msg='', okText='אישור', okClass='danger', cancelText='ביטול' } = {}, onOk) {
  document.getElementById('confirm-icon').textContent  = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
  const okBtn     = document.getElementById('confirm-ok-btn');
  const cancelBtn = document.getElementById('confirm-cancel-btn');
  okBtn.textContent     = okText;
  cancelBtn.textContent = cancelText;
  okBtn.className       = `confirm-btn ${okClass}`;
  const overlay = document.getElementById('confirm-overlay');
  overlay.classList.add('open');
  // Clone buttons to remove old listeners
  const newOk     = okBtn.cloneNode(true);
  const newCancel = cancelBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOk, okBtn);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  newOk.onclick = () => { overlay.classList.remove('open'); onOk(); };
  newCancel.onclick = () => overlay.classList.remove('open');
  overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('open'); };
}

function deleteProj() {
  const p = projects.find(x => x.id === editId);
  if (!p) return;
  const name = p.name;
  showConfirm({
    icon: '📦',
    title: 'העברה לארכיון',
    msg: `"${name}" יועבר לארכיון. ניתן לשחזר אותו בהיסטוריה.`,
    okText: 'העבר לארכיון',
    okClass: 'danger',
    cancelText: 'ביטול',
  }, () => {
    archiveData.push({ ...p, archivedAt: Date.now() });
    projects = projects.filter(x => x.id !== editId);
    logActivity('archive', '📦', 'פרויקט הועבר לארכיון', p.name, p.client);
    save(); _saveArchive(); closeModal(); renderPipeline(); renderCalendar(); updateStats();
    updateArchiveBadge();
    toast('📦 הועבר לארכיון');
    if (modalReturnClient) {
      const rc = modalReturnClient; modalReturnClient = null;
      const stillExists = projects.some(p => p.client === rc) || clientData[rc];
      if (stillExists) setTimeout(() => openClientPanel(rc), 60);
    }
  });
}

function toast(msg) {
  document.getElementById('toast-msg').textContent=msg;
  const t=document.getElementById('toast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ── DRAG & DROP ────────────
let dragId = null;

function initDragDrop() {
  // Cards: dragstart / dragend
  document.querySelectorAll('.vcard[draggable="true"]').forEach(card => {
    card.addEventListener('dragstart', e => {
      dragId = card.dataset.id;
      // Small delay so the ghost image renders before .dragging is applied
      requestAnimationFrame(() => card.classList.add('dragging'));
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      document.querySelectorAll('.col-cards').forEach(col => {
        col.classList.remove('drag-over');
        col.querySelectorAll('.drop-placeholder').forEach(ph => ph.remove());
      });
      dragId = null;
    });
    // Prevent click firing when finishing a drag
    card.addEventListener('mousedown', e => { if (e.button !== 0) return; });
  });

  // Columns: dragover / dragleave / drop
  document.querySelectorAll('.col-cards').forEach(col => {
    const stage = col.dataset.stage;
    const stg   = STAGES[stage] || { color: '#888', label: stage };

    col.addEventListener('dragover', e => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
      col.style.setProperty('--col-over-color', stg.color + '0d');
      col.style.setProperty('--col-over-border', stg.color + '55');
      // Show placeholder if not already there
      if (!col.querySelector('.drop-placeholder')) {
        const ph = document.createElement('div');
        ph.className = 'drop-placeholder';
        ph.style.setProperty('--col-over-color', stg.color + '0d');
        ph.style.setProperty('--col-over-border', stg.color + '55');
        col.appendChild(ph);
      }
    });

    col.addEventListener('dragleave', e => {
      // Only remove if we're truly leaving the column (not entering a child)
      if (!col.contains(e.relatedTarget)) {
        col.classList.remove('drag-over');
        col.querySelectorAll('.drop-placeholder').forEach(ph => ph.remove());
      }
    });

    col.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragId) return;
      col.classList.remove('drag-over');
      col.querySelectorAll('.drop-placeholder').forEach(ph => ph.remove());

      const proj = projects.find(p => p.id === dragId);
      if (!proj || proj.stage === stage) return;

      const oldStage = proj.stage;
      proj.stage = stage;
      save();
      renderPipeline();
      updateStats();

      // Flash the moved card
      setTimeout(() => {
        const moved = document.querySelector(`.vcard[data-id="${dragId}"]`);
        if (moved) {
          moved.classList.add('just-dropped');
          moved.addEventListener('animationend', () => moved.classList.remove('just-dropped'), { once: true });
        }
      }, 30);

      toast(`📌 הועבר ל${STAGES[stage]?.label||stage}`);
    });
  });
}


// ── FILE ATTACHMENTS ───────────
// pendingFiles: array of {name, size, type, dataUrl} for current modal session
let pendingFiles = [];

function fileIcon(type) {
  if (type.startsWith('image/')) return null; // show img preview
  if (type.startsWith('video/')) return '🎬';
  if (type === 'application/pdf') return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.startsWith('audio/')) return '🎵';
  return '📎';
}
function fmtSize(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b/1024).toFixed(0) + 'KB';
  return (b/1048576).toFixed(1) + 'MB';
}

function handleFiles(fileList) {
  Array.from(fileList).forEach(file => {
    if (file.size > 10 * 1024 * 1024) { toast('⚠️ קובץ גדול מ-10MB: ' + file.name); return; }
    const reader = new FileReader();
    reader.onload = e => {
      pendingFiles.push({ name: file.name, size: file.size, type: file.type, dataUrl: e.target.result });
      renderFilesPreview();
    };
    reader.readAsDataURL(file);
  });
  // Reset input so same file can be re-added
  document.getElementById('file-input').value = '';
}

function renderFilesPreview(existingFiles) {
  const files = existingFiles || pendingFiles;
  const grid = document.getElementById('files-preview');
  if (!files.length) { grid.innerHTML = ''; return; }
  // Group non-image files into a folder + show images normally
  const imgFiles  = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
  const otherFiles= files.filter(f => !f.type.startsWith('image/') && !f.type.startsWith('video/'));
  const folderHTML = otherFiles.length ? `
    <div class="folder-wrap">
      <div class="folder-item" onclick="toggleFileFolder(this)" title="${otherFiles.length} קבצים">
        <div class="folder-body">
          <div class="folder-back"></div>
          <div class="folder-tab"></div>
          <div class="folder-front">
            <div class="folder-files">
              ${otherFiles.slice(0,3).map(()=>'<div class="folder-file"></div>').join('')}
            </div>
          </div>
          <div class="folder-count">${otherFiles.length}</div>
        </div>
        <div class="folder-name">קבצים מצורפים</div>
      </div>
    </div>
    <div class="folder-expanded" id="folder-expanded-files" style="display:none;flex-wrap:wrap;gap:8px;margin-top:8px">
      ${otherFiles.map((f,i)=>`<div class="file-thumb" onclick="removeFile(${files.indexOf(f)})">
        <div style="font-size:24px;padding:8px">${fileIcon(f.type)}</div>
        <div class="file-name">${f.name}</div>
        <div class="file-rm">✕</div>
      </div>`).join('')}
    </div>` : '';
  grid.innerHTML = folderHTML + imgFiles.map((f, i) => {
    const icon = fileIcon(f.type);
    const isImg   = f.type.startsWith('image/');
    const isVideo = f.type.startsWith('video/');
    let inner;
    if (isImg) {
      inner = `<img src="${f.dataUrl}" alt="${f.name}" onclick="openLightbox('${f.dataUrl}','image')">
<div class="file-name">${f.name}</div>`;
    } else if (isVideo) {
      inner = `<div class="file-icon" style="position:relative;cursor:pointer;" onclick="openLightbox('${f.dataUrl}','video')">
  🎬
  <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-size:9px;background:#ff3c6e;color:#fff;padding:1px 5px;border-radius:4px;">▶ הפעל</div>
</div>
<div class="file-name">${f.name}</div>`;
    } else {
      inner = `<div class="file-icon">${icon}</div>
<div class="file-name">${f.name}</div>`;
    }
    const sizeStr = f.size ? `<div class="file-size">${fmtSize(f.size)}</div>` : '';
    return `<div class="file-thumb">
      ${inner}
      ${sizeStr}
      <button class="file-del" onclick="removeFile(${i}, event)">✕</button>
    </div>`;
  }).join('');
}

function removeFile(idx, e) {
  e.stopPropagation();
  pendingFiles.splice(idx, 1);
  renderFilesPreview();
}

// Dropzone drag events
function dzOver(e) { e.preventDefault(); document.getElementById('dropzone').classList.add('drag-active'); }
function dzLeave(e) { document.getElementById('dropzone').classList.remove('drag-active'); }
function dzDrop(e) {
  e.preventDefault();
  document.getElementById('dropzone').classList.remove('drag-active');
  handleFiles(e.dataTransfer.files);
}

// Lightbox
function openLightbox(dataUrl, type) {
  const lb = document.getElementById('lightbox');
  const content = document.getElementById('lightbox-content');
  if (type === 'image') {
    content.innerHTML = `<img src="${dataUrl}">`;
  } else if (type === 'video') {
    content.innerHTML = `<video src="${dataUrl}" controls autoplay></video>`;
  }
  lb.classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightbox-content').innerHTML = '';
}


// ═══════════════════════════════════════════════════════════════
// TRASH MODULE
// ═══════════════════════════════════════════════════════════════
let trashData = JSON.parse(localStorage.getItem('reel_trash') || '[]');
window.trashData = trashData;
registerLegacyStore('trashData', () => trashData, (nextValue) => {
  trashData = Array.isArray(nextValue) ? nextValue : [];
  window.trashData = trashData;
  return trashData;
});
function _saveTrash() {
  window.trashData = trashData;
  try { localStorage.setItem('reel_trash', JSON.stringify(trashData)); } catch(e) { _storageErr(e); }
}

function updateTrashBadge() {
  const n=trashData.length;
  ['nc-trash','mob-trash-badge'].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    el.textContent=n; el.style.display=n>0?'':'none';
  });
}

function _renderTrashInto(listId, emptyId) {
  const list=document.getElementById(listId);
  const empty=document.getElementById(emptyId);
  if(!list) return;
  if(!trashData.length){list.innerHTML='';if(empty)empty.style.display='';return;}
  if(empty)empty.style.display='none';
  list.innerHTML=[...trashData].reverse().map((item,ri)=>{
    const i=trashData.length-1-ri;
    const sub=item.trashType==='project'?`פרויקט · ${item.client||''}`:'לקוח';
    return `<div style="background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">${item.name}</div><div style="font-size:11px;color:var(--muted2)">${sub} · ${new Date(item.deletedAt).toLocaleDateString('he-IL')}</div></div>
      <button onclick="restoreTrash(${i})" style="background:rgba(0,229,160,.12);border:1px solid rgba(0,229,160,.3);color:var(--success);padding:6px 10px;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h28.69L196.12,79.51a79.84,79.84,0,0,0-57-23.43h-.41A80,80,0,0,0,56.42,183.74a8,8,0,1,1-12.84,9.54A96,96,0,0,1,138.71,40.08h.49a95.91,95.91,0,0,1,68.54,28.1L224,84.69V56a8,8,0,0,1,16,0Zm-26.58,136.26A80,80,0,0,1,57.31,176.49L43.31,162.49H72a8,8,0,0,0,0-16H24a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V174.69l15.51,15.8a96,96,0,0,0,166.29-38.29,8,8,0,0,0-15.38-4.94Z"/></svg> שחזר</button>
      <button onclick="permDelete(${i})" style="background:rgba(255,60,110,.12);border:1px solid rgba(255,60,110,.25);color:var(--danger);padding:6px 8px;border-radius:8px;font-family:inherit;font-size:11px;cursor:pointer;font-weight:700">✕</button>
    </div>`;
  }).join('');
}

function renderTrash() {
  _renderTrashInto('trash-list','empty-trash');
  _renderTrashInto('hist-trash-list','hist-trash-empty');
}

function restoreTrash(i) {
  const item=trashData[i];
  if(item.trashType==='project'){delete item.trashType;delete item.deletedAt;projects.push(item);save();}
  else if(item.trashType==='client'){clientData[item.name]=item.data;if(item.projects){item.projects.forEach(function(p){projects.push(p);});save();}saveClients();}
  trashData.splice(i,1);_saveTrash();renderTrash();updateTrashBadge();syncAll();toast('♻️ שוחזר!');
}
function permDelete(i) {
  showConfirm({icon:'🗑️',title:'מחיקה לצמיתות',msg:'פעולה זו אינה ניתנת לביטול.',okText:'מחק',okClass:'danger',cancelText:'ביטול'},()=>{
    trashData.splice(i,1);_saveTrash();renderTrash();updateTrashBadge();syncAll();toast('🗑️ נמחק');
  });
}
function emptyTrash() {
  if(!trashData.length) return;
  showConfirm({icon:'🗑️',title:'ריקון הפח',msg:'כל הפריטים יימחקו לצמיתות.',okText:'רוקן הכל',okClass:'danger',cancelText:'ביטול'},()=>{
    trashData=[];_saveTrash();renderTrash();updateTrashBadge();syncAll();toast('🗑️ פח רוקן');
  });
}

// Wrap cpDeleteClient to send to trash
window.cpDeleteClient = function() {
  const _dcn=activeClientName;
  const _cProjs=projects.filter(p=>p.client===_dcn);
  const _cnt=_cProjs.length;
  showConfirm({icon:'🏢',title:'העברה לפח',msg:`"${_dcn}" יועבר לפח${_cnt?' יחד עם '+_cnt+' פרויקטים':''}. ניתן לשחזר מהיסטוריה.`,okText:'העבר לפח',okClass:'danger',cancelText:'ביטול'},()=>{
    trashData.push({name:_dcn,trashType:'client',deletedAt:Date.now(),data:clientData[_dcn],projects:_cProjs});
    logActivity('delete','🗑️','לקוח הועבר לפח',_dcn,'');
    projects=projects.filter(p=>p.client!==_dcn);
    delete clientData[_dcn];
    save();saveClients();_saveTrash();updateTrashBadge();updateStats();
    closeClientPanel();renderClients();renderCalendar();
    toast('🗑️ לקוח הועבר לפח');
  });
};

// ═══════════════════════════════════════════════════════════════
// SHOOT-DAY PANEL
// ═══════════════════════════════════════════════════════════════
let _sdpDate = null;
const _MONS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const _DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

function openSDP(dateStr) {
  _sdpDate=dateStr;
  const [y,m,d]=dateStr.split('-').map(Number);
  const dow=new Date(y,m-1,d).getDay();
  document.getElementById('sdp-day').textContent=d;
  document.getElementById('sdp-mon').textContent=_MONS[m-1];
  document.getElementById('sdp-title').textContent=`${_DAYS[dow]}, ${d} ${_MONS[m-1]} ${y}`;

  const projs=projects.filter(p=>p.deadline===dateStr);
  document.getElementById('sdp-projs').innerHTML=projs.length
    ? projs.map(p=>{
        const st=VID_STAGES[p.stage]||{color:'#888',label:''};
        return `<div class="sdp-proj-row" onclick="closeSDP();setTimeout(()=>{if(typeof openProjectWorkspace==='function')openProjectWorkspace('${p.id}');else openEdit('${p.id}')},60)">
          <span style="font-size:18px">${TYPES[p.type]||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'}</span>
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">${h(p.name)}</div><div style="font-size:11px;color:var(--muted2)">${h(p.client)}</div></div>
          <span style="background:${st.color}20;color:${st.color};font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px">${st.label}</span>
        </div>`;}).join('')
    : '<div class="sdp-empty">אין פרויקטים ביום זה</div>';

  const scrips=scriptsData.filter(s=>s.shootDate===dateStr);
  document.getElementById('sdp-scrips').innerHTML=scrips.length
    ? scrips.map(s=>{
        const st=SC_ST[s.status]||SC_ST.draft;
        return `<div class="sdp-scrip-row ${st.cls}" onclick="closeSDP();setTimeout(()=>openScriptEdit('${s.id}'),60)">
          <span style="font-size:18px">${st.emoji}</span>
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">${s.title}</div><div style="font-size:11px;color:var(--muted2)">${s.client||''}</div></div>
          <span class="sc-badge ${st.cls}">${st.lbl}</span>
        </div>`;}).join('')
    : '<div class="sdp-empty">אין תסריטים ליום זה</div>';

  document.getElementById('sdp-overlay').classList.add('open');
}
function closeSDP() { document.getElementById('sdp-overlay').classList.remove('open'); }
function sdpOpenScript() { closeSDP(); setTimeout(()=>openScriptModal(null,_sdpDate),80); }
function sdpOpenProj() { closeSDP(); setTimeout(()=>{ if (typeof openProjectFlow === 'function') openProjectFlow({ deadline: _sdpDate || '' }); else { openModal(); document.getElementById('fd').value=_sdpDate||''; } },80); }
function sdpToGCal() {
  if(!_sdpDate) return;
  const ps=projects.filter(p=>p.deadline===_sdpDate);
  const ss=scriptsData.filter(s=>s.shootDate===_sdpDate);
  const lines=[];
  if(ps.length){lines.push('🎬 פרויקטים:');ps.forEach(p=>lines.push('  • '+p.name+' ('+p.client+')'));}
  if(ss.length){lines.push('📝 תסריטים:');ss.forEach(s=>lines.push('  • '+s.title+(s.client?' ('+s.client+')':'')));}
  const clients=[...new Set([...ps.map(p=>p.client),...ss.map(s=>s.client).filter(Boolean)])];
  window.open(buildGCalUrl({title:'🎬 יום צילום'+(clients.length?' — '+clients.join(', '):''), date:_sdpDate, desc:lines.join('\n')}), '_blank');
}

// ═══════════════════════════════════════════════════════════════
// GOOGLE CALENDAR
// ═══════════════════════════════════════════════════════════════
function buildGCalUrl({title, date, desc}) {
  const d=(date||'').replace(/-/g,'');
  const p=new URLSearchParams({text:title||'אירוע',dates:d+'/'+d,details:desc||''});
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&'+p.toString();
}
function saveScriptAndGCal() {
  const title=document.getElementById('sc-title').value.trim();
  const dt=document.getElementById('sc-shoot-date').value;
  if(!title){toast('⚠️ נא להזין כותרת');return;}
  if(!dt){toast('⚠️ נא לבחור יום צילום');return;}
  saveScript();
  const cl=document.getElementById('sc-client').value;
  const sc=document.getElementById('sc-scene').value.trim();
  window.open(buildGCalUrl({title:'🎬 צילום: '+title+(cl?' — '+cl:''),date:dt,desc:(cl?'לקוח: '+cl+'\n':'')+(sc?'סצנה: '+sc.substring(0,150):'')}), '_blank');
}

// ═══════════════════════════════════════════════════════════════
// SHARE
// ═══════════════════════════════════════════════════════════════
function openShareModal() {
  const url=location.origin+location.pathname+'?share='+encodeURIComponent(activeClientName);
  document.getElementById('share-url-box').textContent=url;
  document.getElementById('overlay-share').classList.add('open');
}
function copyShareUrl() {
  const url=document.getElementById('share-url-box').textContent;
  navigator.clipboard.writeText(url).then(()=>toast('✅ קישור הועתק!'));
}
function checkShareMode() {
  const params=new URLSearchParams(location.search);
  const client=params.get('share');
  if(!client) return false;
  document.querySelector('.app').style.display='none';
  const mobTab=document.querySelector('.mobile-tabbar'); if(mobTab) mobTab.style.display='none';
  const mobTop=document.getElementById('mobile-topbar'); if(mobTop) mobTop.style.display='none';
  const fab=document.getElementById('mobile-fab'); if(fab) fab.style.display='none';
  const page=document.getElementById('share-page');
  page.classList.add('active');
  const name=decodeURIComponent(client);
  document.getElementById('sh-cname').textContent=name;
  const KEYS=['script','filming','editing','approval','published'];
  const projs=projects.filter(p=>p.client===name);
  document.getElementById('sh-content').innerHTML=projs.map(p=>{
    const si=KEYS.indexOf(p.stage);
    const pipe=KEYS.map((k,i)=>{
      const vs=VID_STAGES[k]||{emoji:'',label:k};
      const cls=i<si?'done':i===si?'active':'';
      return `<div class="sh-dot ${cls}">${vs.emoji} ${vs.label}</div>${i<4?'<div class="sh-arrow">◀</div>':''}`;
    }).join('');
    return `<div class="sh-proj">
      <div class="sh-pname">${TYPES[p.type]||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'} ${p.name}</div>
      <div class="sh-psub">שלב נוכחי: <strong>${VID_STAGES[p.stage]?VID_STAGES[p.stage].label:p.stage}</strong></div>
      <div class="sh-pipe">${pipe}</div>
      ${p.progress>0?`<div class="sh-prog-lbl"><span>התקדמות</span><span>${p.progress}%</span></div><div class="sh-prog-bar"><div class="sh-prog-fill" style="width:${p.progress}%"></div></div>`:''}
    </div>`;
  }).join('')||'<div style="text-align:center;color:var(--muted2);padding:40px">אין פרויקטים פעילים</div>';
  return true;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT / IMPORT
// ═══════════════════════════════════════════════════════════════
function exportData() {
  const data=collectBackupData();
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`reel-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importData(e) {
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    showConfirm({icon:'⚠️',title:'ייבוא נתונים',msg:'כל הנתונים הנוכחיים יוחלפו. פעולה זו אינה ניתנת לביטול.',okText:'המשך',okClass:'danger',cancelText:'ביטול'},()=>{
      try {
        const d=JSON.parse(ev.target.result);
        applyImportedBackup(d);
        location.reload();
      } catch(err){toast('❌ קובץ לא תקין');}
    });
  };
  reader.readAsText(file);
}

// ═══════════════════════════════════════════════════════════════
// INIT PATCH
// ═══════════════════════════════════════════════════════════════
function _readBackupJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch (error) { return fallback; }
}

function _setImportedStore(name, value) {
  setLegacyStoreValue(name, value);
}

function _applyImportedPrefs(prefs) {
  if (!prefs || typeof prefs !== 'object') return;
  if ('onboardingDismissed' in prefs) localStorage.setItem('reel_onboarding_dismissed', prefs.onboardingDismissed ? '1' : '0');
  if ('pipelineSort' in prefs) localStorage.setItem('reel_pipeline_sort', prefs.pipelineSort || 'deadline-asc');
  if ('calendarMode' in prefs) localStorage.setItem('reel_calendar_mode', prefs.calendarMode || 'month');
  if ('sidebarCollapsed' in prefs) localStorage.setItem('reel_sidebar_collapsed', prefs.sidebarCollapsed ? '1' : '0');
}

function collectBackupData() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    projects: projects || [],
    clientData: clientData || {},
    trashData: trashData || [],
    scriptsData: scriptsData || [],
    trackingData: typeof trackingData !== 'undefined' ? trackingData : _readBackupJson('reel_tracking', []),
    archiveData: typeof archiveData !== 'undefined' ? archiveData : _readBackupJson('reel_archive', []),
    activityLog: typeof activityLog !== 'undefined' ? activityLog : _readBackupJson('reel_activity', []),
    shootDaysData: typeof shootDaysData !== 'undefined' ? shootDaysData : _readBackupJson('reel_shoot_days', []),
    tasksData: _readBackupJson('reel_tasks', []),
    preferences: {
      onboardingDismissed: localStorage.getItem('reel_onboarding_dismissed') === '1',
      pipelineSort: localStorage.getItem('reel_pipeline_sort') || 'deadline-asc',
      calendarMode: localStorage.getItem('reel_calendar_mode') || 'month',
      sidebarCollapsed: localStorage.getItem('reel_sidebar_collapsed') === '1',
    },
  };
}

function applyImportedBackup(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid backup payload');

  const nextProjects = Array.isArray(data.projects) ? data.projects : [];
  const nextClientData = data.clientData && typeof data.clientData === 'object' ? data.clientData : {};
  const nextTrash = Array.isArray(data.trashData) ? data.trashData : [];
  const nextScripts = Array.isArray(data.scriptsData) ? data.scriptsData : [];
  const nextTracking = Array.isArray(data.trackingData) ? data.trackingData : Array.isArray(data.tracking) ? data.tracking : [];
  const nextArchive = Array.isArray(data.archiveData) ? data.archiveData : Array.isArray(data.archive) ? data.archive : [];
  const nextActivity = Array.isArray(data.activityLog) ? data.activityLog : Array.isArray(data.activity) ? data.activity : [];
  const nextShootDays = Array.isArray(data.shootDaysData) ? data.shootDaysData : Array.isArray(data.shootDays) ? data.shootDays : [];
  const nextTasks = Array.isArray(data.tasksData) ? data.tasksData : Array.isArray(data.tasks) ? data.tasks : [];

  _setImportedStore('projects', nextProjects);
  _setImportedStore('clientData', nextClientData);
  _setImportedStore('trashData', nextTrash);
  _setImportedStore('scriptsData', nextScripts);
  _setImportedStore('trackingData', nextTracking);
  _setImportedStore('archiveData', nextArchive);
  _setImportedStore('activityLog', nextActivity);
  _setImportedStore('shootDaysData', nextShootDays);

  save();
  saveClients();
  _saveTrash();
  _saveSC();
  if (typeof saveTracking_store === 'function') saveTracking_store();
  else localStorage.setItem('reel_tracking', JSON.stringify(nextTracking));
  if (typeof _saveArchive === 'function') _saveArchive();
  else localStorage.setItem('reel_archive', JSON.stringify(nextArchive));
  if (typeof _saveLog === 'function') _saveLog();
  else localStorage.setItem('reel_activity', JSON.stringify(nextActivity));
  if (typeof saveShootDaysStore === 'function') saveShootDaysStore();
  else localStorage.setItem('reel_shoot_days', JSON.stringify(nextShootDays));
  if (typeof window.saveTasksStore === 'function') window.saveTasksStore(nextTasks);
  else localStorage.setItem('reel_tasks', JSON.stringify(nextTasks));

  _applyImportedPrefs(data.preferences);
  syncAll?.();

  return {
    projects: nextProjects,
    clientData: nextClientData,
    trashData: nextTrash,
    scriptsData: nextScripts,
    trackingData: nextTracking,
    archiveData: nextArchive,
    activityLog: nextActivity,
    shootDaysData: nextShootDays,
    tasksData: nextTasks,
  };
}

window.collectBackupData = collectBackupData;
window.applyImportedBackup = applyImportedBackup;

const _origInit = window.init || function(){};
window.addEventListener('load', function() {
  if(!checkShareMode()) {
    updateScriptBadge();
    updateTrashBadge();
  }
});


// ═══════════════════════════════════════════════════════════════
// STAGE → PROGRESS mapping
// ═══════════════════════════════════════════════════════════════
function stageToProgress(stage) {
  return { script: 10, filming: 30, editing: 60, approval: 85, published: 100 }[stage] || 0;
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL SYNC — call after any data change
// ═══════════════════════════════════════════════════════════════
function syncAll() {
  // Re-render whatever view is active
  const active = document.querySelector('.view.active');
  const vid = active ? active.id.replace('view-','') : '';
  renderPipeline(); updateStats();
  if (vid === 'clients' || document.querySelector('.client-detail-overlay.open')) renderClients();
  if (vid === 'calendar') renderCalendar();
  if (vid === 'payments') renderPayments();
  if (vid === 'tracking') renderTracking();
  if (vid === 'scripts') renderScripts();
  if (vid === 'tasks') window.REELApp?.tasksView?.render?.();
  if (vid === 'trash') renderTrash();
  if (vid === 'history') renderHistory();
  // Always re-render open client panel
  if (activeClientName && document.querySelector('.client-detail-overlay.open')) {
    const hasPkgNow = !!(clientData[activeClientName] && clientData[activeClientName].package && clientData[activeClientName].package.total);
    if (hasPkgNow) renderClientPackage(activeClientName);
  }
  updateScriptBadge(); updateTrashBadge(); updateArchiveBadge();
}

// ═══════════════════════════════════════════════════════════════
// ADD CHOOSER
// ═══════════════════════════════════════════════════════════════
function openAddChooser() { document.getElementById('chooser-overlay').classList.add('open'); }
function closeChooser()   { document.getElementById('chooser-overlay').classList.remove('open'); }

// ═══════════════════════════════════════════════════════════════
// PACKAGE CHOOSER — pick client → open package settings for that client
// ═══════════════════════════════════════════════════════════════
function openPackageChooser() {
  const sel = document.getElementById('pkg-chooser-client');
  const names = Object.keys(clientData).sort();
  sel.innerHTML = '<option value="">בחר לקוח...</option>' +
    names.map(n => `<option value="${n}">${n}</option>`).join('');
  document.getElementById('pkg-chooser-overlay').classList.add('open');
}
function openPkgForClient() {
  const name = document.getElementById('pkg-chooser-client').value;
  if (!name) { toast('⚠️ נא לבחור לקוח'); return; }
  document.getElementById('pkg-chooser-overlay').classList.remove('open');
  // Open client panel then open package settings
  openClientPanel(name);
  setTimeout(() => openPackageSettings(), 350);
}

// ═══════════════════════════════════════════════════════════════
// SHOOT DAY MODAL
// ═══════════════════════════════════════════════════════════════
function openShootDayModal(preDate) {
  document.getElementById('shoot-day-date').value = preDate || '';
  document.getElementById('shoot-day-notes').value = '';
  // Fill client select
  const sel = document.getElementById('shoot-day-client');
  const names = Object.keys(clientData).sort();
  sel.innerHTML = '<option value="">בחר לקוח...</option>' +
    names.map(n => `<option value="${n}">${n}</option>`).join('');
  document.getElementById('overlay-shoot-day').classList.add('open');
}
function saveShootDay() {
  const date = document.getElementById('shoot-day-date').value;
  if (!date) { toast('⚠️ נא לבחור תאריך'); return; }
  const client = document.getElementById('shoot-day-client').value;
  const notes  = document.getElementById('shoot-day-notes').value.trim();
  // Store shoot day as a special project type so it shows in calendar
  const existing = projects.find(p => p.type === 'shootday' && p.deadline === date && p.client === client);
  if (!existing) {
    projects.push({
      id: 'sd_' + Date.now(),
      name: 'יום צילום' + (client ? ' — ' + client : ''),
      client: client || '—',
      type: 'shootday',
      stage: 'filming',
      deadline: date,
      notes,
      price: '', paid: 'unpaid', progress: 30,
    });
    save();
  }
  // Also open SDP panel for this day
  document.getElementById('overlay-shoot-day').classList.remove('open');
  setTimeout(() => openSDP(date), 60);
  toast('📅 יום צילום נוסף!');
  syncAll();
}

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// INIT — call on load
// ═══════════════════════════════════════════════════════════════
// Patch the existing init if any, or use window load
const _prevLoad = window.onload;
window.addEventListener('load', function() {
  updateScriptBadge();
  updateTrashBadge();
  updateArchiveBadge();
  if (!checkShareMode()) { /* normal app init already ran */ }
});


// ═══════════════════════════════════════════════════════════════
// CUSTOM DATE PICKER
// ═══════════════════════════════════════════════════════════════
let _dpTargetId = null;
let _dpYear = new Date().getFullYear();
let _dpMonth = new Date().getMonth();
let _dpSelected = null;

const _MONS_DP  = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const _DOWS_DP  = ['א','ב','ג','ד','ה','ו','ש'];

function openDatePicker(fieldId) {
  _dpTargetId = fieldId;
  // Read current value
  const val = document.getElementById(fieldId)?.value;
  if (val) {
    const [y,m,d] = val.split('-').map(Number);
    _dpYear = y; _dpMonth = m - 1; _dpSelected = val;
  } else {
    const now = new Date();
    _dpYear = now.getFullYear(); _dpMonth = now.getMonth(); _dpSelected = null;
  }
  renderDP();
  document.getElementById('dp-overlay').classList.add('open');
}

function closeDatePicker() {
  document.getElementById('dp-overlay').classList.remove('open');
  _dpTargetId = null;
}

function clearDate() {
  if (!_dpTargetId) return;
  setDateValue(_dpTargetId, '');
  closeDatePicker();
}

function dpMove(dir) {
  _dpMonth += dir;
  if (_dpMonth > 11) { _dpMonth = 0; _dpYear++; }
  if (_dpMonth < 0)  { _dpMonth = 11; _dpYear--; }
  renderDP();
}

function dpSelect(dateStr) {
  _dpSelected = dateStr;
  setDateValue(_dpTargetId, dateStr);
  renderDP();
  setTimeout(() => {
    closeDatePicker();
    // If SDP is open, refresh it with new date context
    if (_dpTargetId === 'shoot-day-date') {
      const newDate = document.getElementById('shoot-day-date')?.value;
      if (newDate && document.getElementById('sdp-overlay')?.classList.contains('open')) {
        openSDP(newDate);
      }
    }
  }, 120);
}

function setDateValue(fieldId, val) {
  if (!fieldId) return;
  const hidden = document.getElementById(fieldId);
  if (hidden) hidden.value = val;
  const disp = document.getElementById('dpd-' + fieldId);
  if (disp) {
    if (val) {
      const [y,m,d] = val.split('-').map(Number);
      disp.textContent = `${d} ${_MONS_DP[m-1]} ${y}`;
      disp.classList.remove('placeholder');
    } else {
      disp.textContent = 'בחר תאריך...';
      disp.classList.add('placeholder');
    }
  }
}

function renderDP() {
  const today = new Date();
  const ty = today.getFullYear(), tm = today.getMonth(), td = today.getDate();

  document.getElementById('dp-month-label').textContent = `${_MONS_DP[_dpMonth]} ${_dpYear}`;

  const firstDow = new Date(_dpYear, _dpMonth, 1).getDay();
  const daysInMonth = new Date(_dpYear, _dpMonth + 1, 0).getDate();

  let html = _DOWS_DP.map(d => `<div class="dp-dow">${d}</div>`).join('');

  // Empty cells before first day
  for (let i = 0; i < firstDow; i++) html += '<div class="dp-day empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${_dpYear}-${String(_dpMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday    = d === td && _dpMonth === tm && _dpYear === ty;
    const isSelected = ds === _dpSelected;
    const cls = `dp-day${isToday?' today':''}${isSelected?' selected':''}`;
    html += `<div class="${cls}" onclick="dpSelect('${ds}')">${d}</div>`;
  }

  document.getElementById('dp-grid').innerHTML = html;
}

// Initialise display labels on page load
document.addEventListener('DOMContentLoaded', function() {
  const IDS = ['fd','sc-shoot-date','pkg-start','pkg-end','vid-deadline','tr-date','shoot-day-date'];
  IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) setDateValue(id, el.value);
    else {
      const disp = document.getElementById('dpd-' + id);
      if (disp) disp.classList.add('placeholder');
    }
  });
});



// ═══════════════════════════════════════════════
// FC DATALIST — auto-suggest client names
// ═══════════════════════════════════════════════
function updateFcList() {
  const dl = document.getElementById('fc-list');
  if (!dl) return;
  const names = [...new Set([...projects.map(p=>p.client),...Object.keys(clientData)])].sort();
  dl.innerHTML = names.map(n=>`<option value="${n}">`).join('');
}


// ═══════════════════════════════════════════════════════════════
// FEATURE 1 — UUID / Client ID utilities
// ═══════════════════════════════════════════════════════════════
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function ensureClientId(name) {
  if (!clientData[name]) clientData[name] = {};
  if (!clientData[name].id) { clientData[name].id = genId(); saveClients(); }
  return clientData[name].id;
}

// Migration: run once on load — attach clientId to all existing projects
function migrateClientIds() {
  let dirty = false;
  Object.keys(clientData).forEach(name => {
    if (!clientData[name].id) { clientData[name].id = genId(); dirty = true; }
  });
  projects.forEach(p => {
    if (!p.clientId && p.client) {
      const cid = ensureClientId(p.client);
      p.clientId = cid; dirty = true;
    }
  });
  if (dirty) { save(); saveClients(); }
}

// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
let _gsResults = [];
let _gsFocusIdx = -1;

function runGlobalSearch(q) {
  const wrap = document.getElementById('gs-results');
  const clr  = document.getElementById('gs-clear');
  if (clr) clr.style.display = q ? '' : 'none';
  if (!q.trim()) { wrap.style.display = 'none'; _gsResults = []; return; }
  const lq = q.trim().toLowerCase();

  const projHits = projects.filter(p =>
    p.name.toLowerCase().includes(lq) || (p.client||'').toLowerCase().includes(lq) || (p.notes||'').toLowerCase().includes(lq)
  ).slice(0, 8);

  const clientHits = Object.keys(clientData).filter(name =>
    name.toLowerCase().includes(lq) ||
    (clientData[name].phone||'').includes(lq) ||
    (clientData[name].email||'').toLowerCase().includes(lq)
  ).slice(0, 5);

  _gsResults = [
    ...projHits.map(p => ({ type:'project', data:p })),
    ...clientHits.map(n => ({ type:'client', name:n })),
  ];
  _gsFocusIdx = -1;

  if (!_gsResults.length) {
    wrap.innerHTML = '<div class="gs-empty">אין תוצאות</div>';
    wrap.style.display = '';
    return;
  }

  let html = '';
  if (projHits.length) {
    html += '<div class="gs-section">פרויקטים</div>';
    html += projHits.map((p, i) => {
      const stg = STAGES[p.stage] || {};
      const d = daysLeft(p.deadline);
      const dlc = dlClass(d); const dlt = dlText(d, p.deadline);
      const urgency = (dlc === 'overdue' || dlc === 'deadline') ? `<span class="dl-banner ${dlc==='overdue'?'overdue':'today'}">${dlt}</span>` : '';
      return `<div class="gs-item" data-idx="${i}" onclick="gsGoProject('${p.id}')">
        <span class="gs-item-icon">${TYPES[p.type]||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'}</span>
        <div class="gs-item-main">
          <div class="gs-item-name">${h(p.name)} ${urgency}</div>
          <div class="gs-item-sub">${h(p.client)}${stg.label ? ' · ' + (stg.emoji||'') + ' ' + stg.label : ''}</div>
        </div>
        <span class="gs-item-tag" style="color:${stg.color||'var(--muted2)'}">${stg.label||''}</span>
      </div>`;
    }).join('');
  }

  if (clientHits.length) {
    html += '<div class="gs-section">לקוחות</div>';
    html += clientHits.map((name, i) => {
      const cd = clientData[name] || {};
      const cnt = projects.filter(p => p.client === name).length;
      return `<div class="gs-item" data-idx="${projHits.length + i}" onclick="gsGoClient(this.dataset.cname)" data-cname="${h(name)}">
        <span class="gs-item-icon">🏢</span>
        <div class="gs-item-main">
          <div class="gs-item-name">${h(name)}</div>
          <div class="gs-item-sub">${cnt} פרויקטים${cd.phone ? ' · ' + h(cd.phone) : ''}</div>
        </div>
      </div>`;
    }).join('');
  }

  wrap.innerHTML = html;
  wrap.style.display = '';
  // Trigger AnimatedList gradient on scroll
  wrap.onscroll = function() {
    const top  = document.getElementById('gs-grad-top');
    const bot  = document.getElementById('gs-grad-bottom');
    if (!top || !bot) return;
    top.style.opacity = Math.min(wrap.scrollTop / 40, 1);
    const distBottom = wrap.scrollHeight - (wrap.scrollTop + wrap.clientHeight);
    bot.style.opacity = wrap.scrollHeight <= wrap.clientHeight ? 0 : Math.min(distBottom / 40, 1);
  };
  wrap.dispatchEvent(new Event('scroll'));
}

function gsGoProject(id) {
  clearSearch();
  if (typeof openProjectWorkspace === 'function') openProjectWorkspace(id);
  else openEdit(id);
}
function gsGoClient(name) {
  clearSearch();
  goView('clients');
  setTimeout(() => openClientPanel(name), 120);
}
function showSearchResults() {
  const q = document.getElementById('gs-input')?.value;
  if (q && q.trim()) runGlobalSearch(q);
}
function clearSearch() {
  const inp = document.getElementById('gs-input');
  const res = document.getElementById('gs-results');
  const clr = document.getElementById('gs-clear');
  if (inp) inp.value = '';
  if (res) res.style.display = 'none';
  if (clr) clr.style.display = 'none';
  _gsResults = []; _gsFocusIdx = -1;
}
function gsKeydown(e) {
  const items = document.querySelectorAll('.gs-item');
  if (e.key === 'ArrowDown') { _gsFocusIdx = Math.min(_gsFocusIdx+1, items.length-1); }
  else if (e.key === 'ArrowUp') { _gsFocusIdx = Math.max(_gsFocusIdx-1, 0); }
  else if (e.key === 'Enter' && _gsFocusIdx >= 0) { items[_gsFocusIdx]?.click(); return; }
  else if (e.key === 'Escape') { clearSearch(); return; }
  items.forEach((el, i) => el.classList.toggle('focused', i === _gsFocusIdx));
}
// Close search on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('#global-search-wrap') && !e.target.closest('#gs-results')) {
    const res = document.getElementById('gs-results');
    if (res) res.style.display = 'none';
  }
});

// ═══════════════════════════════════════════════════════════════
// FEATURE 3 — Deadline urgency everywhere (patch renderClientPackage + renderPayments)
// ═══════════════════════════════════════════════════════════════
function deadlineBadge(ds) {
  const d = daysLeft(ds);
  if (d === null) return '';
  if (d < 0)  return `<span class="dl-banner overdue">⚠️ עבר ${-d} ימים</span>`;
  if (d === 0) return `<span class="dl-banner today">🔥 היום!</span>`;
  if (d <= 3)  return `<span class="dl-banner soon">⏰ ${d} ימים</span>`;
  return '';
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 4 — Version history
// ═══════════════════════════════════════════════════════════════
let _editVersions = [];

function loadVersionsUI(projectId) {
  const p = projects.find(x => x.id === projectId);
  const sec = document.getElementById('versions-section');
  if (!p || !sec) return;
  sec.style.display = '';
  _editVersions = p.versions ? JSON.parse(JSON.stringify(p.versions)) : [];
  renderVersionsList();
}

function renderVersionsList() {
  const el = document.getElementById('versions-list');
  if (!el) return;
  const MONTHS = ['ינו','פבר','מרץ','אפר','מאי','יונ','יול','אוג','ספט','אוק','נוב','דצמ'];
  let html = _editVersions.map((v, i) => {
    const dt = v.date ? (([y,m,d]) => `${d} ${MONTHS[m-1]}`)(v.date.split('-').map(Number)) : '';
    return `<div class="version-row">
      <span class="ver-tag">v${v.num}</span>
      ${v.url ? `<a class="ver-link" href="${v.url}" target="_blank" onclick="event.stopPropagation()">${v.url}</a>` : '<span style="color:var(--muted2);font-size:11px">אין לינק</span>'}
      <span class="ver-date">${dt}</span>
      <button class="ver-del" onclick="removeVersion(${i})" title="מחק גרסה">✕</button>
    </div>`;
  }).join('');

  // Add-version form
  const nextNum = _editVersions.length + 1;
  html += `<div class="ver-add-row">
    <input id="ver-url-inp" class="fi" placeholder="לינק לגרסה v${nextNum}..." style="font-size:12px;padding:7px 10px">
    <div class="date-picker-wrap" id="dpw-ver-date" onclick="openDatePicker('ver-date')" style="padding:7px 10px">
      <input type="hidden" id="ver-date">
      <div class="date-picker-display placeholder" id="dpd-ver-date" style="font-size:12px">תאריך...</div>
      <span class="date-picker-icon" style="font-size:13px">📅</span>
    </div>
    <button onclick="addVersion()" style="background:var(--danger);color:#fff;border:none;padding:7px 12px;border-radius:9px;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">+ v${nextNum}</button>
  </div>`;

  el.innerHTML = html;
}

function addVersion() {
  const url  = document.getElementById('ver-url-inp')?.value.trim() || '';
  const date = document.getElementById('ver-date')?.value || '';
  _editVersions.push({ num: _editVersions.length + 1, url, date, addedAt: Date.now() });
  renderVersionsList();
}

function removeVersion(i) {
  _editVersions.splice(i, 1);
  _editVersions.forEach((v, idx) => v.num = idx + 1);
  renderVersionsList();
}

function saveVersionsToProject() {
  if (!editId) return;
  const p = projects.find(x => x.id === editId);
  if (p) { p.versions = JSON.parse(JSON.stringify(_editVersions)); save(); }
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 5 — WhatsApp message on approval stage
// ═══════════════════════════════════════════════════════════════
let _waPhone = '';
let _waProjectId = '';

function maybeShowWaPrompt(projectId, newStage) {
  if (newStage !== 'approval') return;
  const p = projects.find(x => x.id === projectId);
  if (!p) return;
  const cd = clientData[p.client] || {};
  _waPhone = (cd.phone || '').replace(/\D/g, '');
  _waProjectId = projectId;

  const latestVer = p.versions && p.versions.length ? p.versions[p.versions.length - 1] : null;
  const link = latestVer?.url || p.drive || '';
  const clientName = p.client || 'לקוח';

  const msg = `שלום ${clientName} 😊\n\nהסרטון "${p.name}" מוכן לאישורך! 🎬\n${link ? `צפה בסרטון כאן:\n${link}\n` : ''}\nאשמח לקבל פידבק עד 48 שעות.\nתודה! 🙏`;

  document.getElementById('wa-text').value = msg;
  document.getElementById('overlay-wa').classList.add('open');
}

function sendWhatsApp() {
  const text = document.getElementById('wa-text').value;
  const encoded = encodeURIComponent(text);
  const url = _waPhone
    ? `https://wa.me/972${_waPhone.replace(/^0/, '')}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}
function copyWaText() {
  navigator.clipboard.writeText(document.getElementById('wa-text').value)
    .then(() => toast('✅ הועתק!'));
}

// ═══════════════════════════════════════════════════════════════
// PATCH selectStage — trigger WA prompt when changed to approval
// ═══════════════════════════════════════════════════════════════
const _origSelectStage = window.selectStage;
// We monkey-patch via override after DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  migrateClientIds();

  // WA + quickVidStage patched inline
});

// versions patched inline



// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════
let activityLog = JSON.parse(localStorage.getItem('reel_activity') || '[]');
window.activityLog = activityLog;
registerLegacyStore('activityLog', () => activityLog, (nextValue) => {
  activityLog = Array.isArray(nextValue) ? nextValue : [];
  window.activityLog = activityLog;
  return activityLog;
});

function _saveLog() { 
  // Keep last 500 entries
  if (activityLog.length > 500) activityLog = activityLog.slice(-500);
  window.activityLog = activityLog;
  try { localStorage.setItem('reel_activity', JSON.stringify(activityLog)); } catch(e) { _storageErr(e); }
}

function logActivity(type, icon, action, projectName, client) {
  activityLog.push({
    id: Date.now() + '_' + Math.random().toString(36).slice(2,6),
    type, icon, action,
    project: projectName || '',
    client:  client || '',
    ts: Date.now(),
  });
  _saveLog();
}

function clearActivityLog() {
  showConfirm({icon:'🗑️',title:'ניקוי לוג פעילות',msg:'כל הרשומות יימחקו לצמיתות.',okText:'נקה הכל',okClass:'danger',cancelText:'ביטול'},()=>{
    activityLog=[];_saveLog();renderHistory();toast('🗑️ לוג נוקה');
  });
}

// ═══════════════════════════════════════════════════════════════
// ARCHIVE
// ═══════════════════════════════════════════════════════════════
let archiveData = JSON.parse(localStorage.getItem('reel_archive') || '[]');
window.archiveData = archiveData;
registerLegacyStore('archiveData', () => archiveData, (nextValue) => {
  archiveData = Array.isArray(nextValue) ? nextValue : [];
  window.archiveData = archiveData;
  return archiveData;
});
function _saveArchive() {
  window.archiveData = archiveData;
  try { localStorage.setItem('reel_archive', JSON.stringify(archiveData)); } catch(e) { _storageErr(e); }
}

function archiveProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  archiveData.push({ ...p, archivedAt: Date.now() });
  projects = projects.filter(x => x.id !== id);
  logActivity('archive', '📦', 'פרויקט הועבר לארכיון', p.name, p.client);
  save(); _saveArchive(); syncAll();
  updateArchiveBadge();
  toast('📦 הועבר לארכיון!');
}

function restoreFromArchive(id) {
  const item = archiveData.find(x => x.id === id);
  if (!item) return;
  const { archivedAt, ...proj } = item;
  projects.push(proj);
  archiveData = archiveData.filter(x => x.id !== id);
  logActivity('restore', '♻️', 'פרויקט שוחזר מהארכיון', proj.name, proj.client);
  save(); _saveArchive(); syncAll();
  updateArchiveBadge();
  toast('♻️ פרויקט שוחזר!');
}

function deleteFromArchive(id) {
  const item = archiveData.find(x => x.id === id);
  if (!item) return;
  showConfirm({icon:'🗑️',title:'מחיקה לצמיתות',msg:`"${item.name}" יימחק לצמיתות. לא ניתן לשחזר.`,okText:'מחק',okClass:'danger',cancelText:'ביטול'},()=>{
    archiveData=archiveData.filter(x=>x.id!==id);_saveArchive();renderHistory();updateArchiveBadge();syncAll();toast('🗑️ נמחק לצמיתות');
  });
}

function updateArchiveBadge() {
  const n = archiveData.length;
  ['nc-archive','mob-archive-badge'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.textContent = n; el.style.display = n > 0 ? '' : 'none';
  });
}

// ═══════════════════════════════════════════════════════════════
// HISTORY VIEW
// ═══════════════════════════════════════════════════════════════
let _histTab = 'archive';

function setHistoryTab(tab, el) {
  _histTab = tab;
  document.querySelectorAll('#view-history .filter-chip').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  ['archive','log','stats','trash'].forEach(t => {
    const tabEl = document.getElementById('hist-'+t+'-tab');
    if (tabEl) tabEl.style.display = t === tab ? '' : 'none';
  });
  const clearBtn = document.getElementById('hist-clear-btn');
  if (clearBtn) clearBtn.style.display = tab === 'log' ? '' : 'none';
  // Sync mobile subheader chips too
  document.querySelectorAll('#mob-subheader-history .filter-chip').forEach(b => b.classList.remove('active'));
  const mobChips = document.querySelectorAll('#mob-subheader-history .filter-chip');
  const tabIdx = {archive:0,log:1,stats:2,trash:3};
  if (mobChips[tabIdx[tab]]) mobChips[tabIdx[tab]].classList.add('active');
  renderHistory();
}

function renderHistory() {
  const q = (document.getElementById('history-search')?.value || '').trim().toLowerCase();

  // ── Archive tab ──
  if (_histTab === 'archive') {
    const MONS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
    let items = [...archiveData].sort((a,b) => b.archivedAt - a.archivedAt);
    if (q) items = items.filter(x => (x.name||'').toLowerCase().includes(q) || (x.client||'').toLowerCase().includes(q));
    const list = document.getElementById('hist-archive-list');
    const empty = document.getElementById('hist-archive-empty');
    if (!items.length) { list.innerHTML = ''; empty.style.display = ''; return; }
    empty.style.display = 'none';
    list.innerHTML = items.map((p,i) => {
      const d = new Date(p.archivedAt);
      const dateStr = `${d.getDate()} ${MONS[d.getMonth()]} ${d.getFullYear()}`;
      const st = STAGES[p.stage] || VID_STAGES[p.stage] || { emoji: '🎬', label: p.stage || '?', color: '#888' };
      const price = p.price ? `₪${Number(p.price).toLocaleString()}` : '';
      return `<div class="hist-archive-card" style="animation-delay:${i*.04}s">
        <div class="hac-head">
          <div class="hac-name">${TYPES[p.type]||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'} ${h(p.name)}</div>
          <span style="background:${st.color}18;color:${st.color};font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px">${st.emoji} ${st.label}</span>
        </div>
        <div class="hac-meta">
          <span>🏢 ${h(p.client)}</span>
          ${price ? `<span>💰 ${price}</span>` : ''}
          <span>📅 הועבר ${dateStr}</span>
          ${p.deadline ? `<span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24Z"/></svg> דד-ליין: ${p.deadline}</span>` : ''}
        </div>
        <div class="hac-actions">
          <button class="hac-btn hac-btn-restore" onclick="restoreFromArchive('${p.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h28.69L196.12,79.51a79.84,79.84,0,0,0-57-23.43h-.41A80,80,0,0,0,56.42,183.74a8,8,0,1,1-12.84,9.54A96,96,0,0,1,138.71,40.08h.49a95.91,95.91,0,0,1,68.54,28.1L224,84.69V56a8,8,0,0,1,16,0Zm-26.58,136.26A80,80,0,0,1,57.31,176.49L43.31,162.49H72a8,8,0,0,0,0-16H24a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V174.69l15.51,15.8a96,96,0,0,0,166.29-38.29,8,8,0,0,0-15.38-4.94Z"/></svg> שחזר לפעיל</button>
          <button class="hac-btn" onclick="deleteFromArchive('${p.id}')">🗑️ מחק</button>
        </div>
      </div>`;
    }).join('');
  }

  // ── Log tab ──
  if (_histTab === 'log') {
    const MONS = ['ינו','פבר','מרץ','אפר','מאי','יונ','יול','אוג','ספט','אוק','נוב','דצמ'];
    let items = [...activityLog].reverse();
    if (q) items = items.filter(x => (x.action||'').toLowerCase().includes(q) || (x.project||'').toLowerCase().includes(q) || (x.client||'').toLowerCase().includes(q));
    const list = document.getElementById('hist-log-list');
    const empty = document.getElementById('hist-log-empty');
    if (!items.length) { list.innerHTML = ''; empty.style.display = ''; return; }
    empty.style.display = 'none';

    // Group by date
    const groups = {};
    items.forEach(item => {
      const d = new Date(item.ts);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const lbl = `${d.getDate()} ${MONS[d.getMonth()]} ${d.getFullYear()}`;
      if (!groups[key]) groups[key] = { lbl, items: [] };
      groups[key].items.push(item);
    });

    list.innerHTML = Object.entries(groups).map(([key, grp]) => `
      <div class="log-date-label">${grp.lbl}</div>
      <div class="log-wrap">
        ${grp.items.map(item => {
          const d = new Date(item.ts);
          const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
          const typeColors = { create:'var(--success)', update:'var(--cyan)', stage:'var(--warn)', payment:'#a0a0cc', delete:'var(--danger)', archive:'#6c63ff', restore:'var(--success)' };
          const typeBg = { create:'rgba(0,229,160,.1)', update:'rgba(0,229,232,.1)', stage:'rgba(255,200,0,.1)', payment:'rgba(160,160,200,.12)', delete:'rgba(255,60,110,.1)', archive:'rgba(108,99,255,.1)', restore:'rgba(0,229,160,.1)' };
          const col = typeColors[item.type] || 'var(--muted2)';
          const bg  = typeBg[item.type]  || 'rgba(255,255,255,.06)';
          return `<div class="log-row">
            <div class="log-icon-wrap" style="background:${bg}">
              <span class="log-icon">${item.icon}</span>
            </div>
            <div class="log-body">
              <div class="log-action" style="color:${col}">${item.action}</div>
              <div class="log-project">${[item.project, item.client].filter(Boolean).join(' · ')}</div>
            </div>
            <div class="log-time">${time}</div>
          </div>`;
        }).join('')}
      </div>`).join('');
  }

  // ── Stats tab ──
  if (_histTab === 'stats') {
    const allDone = [...archiveData, ...projects.filter(p => p.stage === 'published')];
    const totalArchived = archiveData.length;
    const totalPublished = projects.filter(p => p.stage === 'published').length;
    const totalRevenue = [...archiveData, ...projects].reduce((s,p) => s + (+p.price||0), 0);
    const paidRevenue  = [...archiveData, ...projects].filter(p => p.paid==='paid').reduce((s,p) => s + (+p.price||0), 0);

    // Avg completion time (from archiveData with deadline)
    const withTime = archiveData.filter(p => p.deadline && p.archivedAt);
    const avgDays = withTime.length
      ? Math.round(withTime.reduce((s,p) => s + Math.max(0,(p.archivedAt - new Date(p.deadline).getTime())/86400000), 0) / withTime.length)
      : null;

    // Stage distribution of archived
    const stageCounts = {};
    archiveData.forEach(p => { const st=VID_STAGES[p.stage]; if(st) { stageCounts[st.label] = (stageCounts[st.label]||0)+1; }});
    const maxSt = Math.max(1, ...Object.values(stageCounts));

    // Monthly completion chart (last 6 months)
    const monthly = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthly[key] = { lbl: ['ינו','פבר','מרץ','אפר','מאי','יונ','יול','אוג','ספט','אוק','נוב','דצמ'][d.getMonth()], count: 0 };
    }
    archiveData.forEach(p => {
      if (!p.archivedAt) return;
      const d = new Date(p.archivedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthly[key]) monthly[key].count++;
    });
    const maxMon = Math.max(1, ...Object.values(monthly).map(m=>m.count));

    document.getElementById('hist-stats-content').innerHTML = `
      <div class="hist-stats-grid">
        <div class="hstat-card"><div class="hstat-val">${totalArchived}</div><div class="hstat-lbl">פרויקטים בארכיון</div></div>
        <div class="hstat-card"><div class="hstat-val">${totalPublished}</div><div class="hstat-lbl">פורסמו (פעילים)</div></div>
        <div class="hstat-card"><div class="hstat-val">₪${totalRevenue.toLocaleString()}</div><div class="hstat-lbl">הכנסה כוללת</div><div class="hstat-sub">₪${paidRevenue.toLocaleString()} שולם</div></div>
        <div class="hstat-card"><div class="hstat-val">${activityLog.length}</div><div class="hstat-lbl">פעולות בלוג</div></div>
        ${avgDays !== null ? `<div class="hstat-card"><div class="hstat-val">${avgDays}</div><div class="hstat-lbl">ימים ממוצע לפרויקט</div></div>` : ''}
      </div>

      <div class="hist-chart-wrap">
        <div class="hist-chart-title">📅 השלמות לפי חודש (6 חודשים אחרונים)</div>
        ${Object.values(monthly).map(m => `
          <div class="hist-bar-row">
            <div class="hist-bar-lbl">${m.lbl}</div>
            <div class="hist-bar-track"><div class="hist-bar-fill" style="width:${m.count/maxMon*100}%"></div></div>
            <div class="hist-bar-count">${m.count}</div>
          </div>`).join('')}
      </div>

      ${Object.keys(stageCounts).length ? `
      <div class="hist-chart-wrap">
        <div class="hist-chart-title">📊 שלב השלמה בארכיון</div>
        ${Object.entries(stageCounts).map(([lbl,n]) => `
          <div class="hist-bar-row">
            <div class="hist-bar-lbl">${lbl}</div>
            <div class="hist-bar-track"><div class="hist-bar-fill" style="width:${n/maxSt*100}%;background:linear-gradient(90deg,#6c63ff,#a78bfa)"></div></div>
            <div class="hist-bar-count">${n}</div>
          </div>`).join('')}
      </div>` : ''}
    `;
  }

  // ── Trash tab ──
  if (_histTab === 'trash') {
    _renderTrashInto('hist-trash-list','hist-trash-empty');
  }
}



