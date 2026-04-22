// ── CLIENTS ────────────────
function renderClients() {
  const grid = document.getElementById('clients-grid');
  const empty = document.getElementById('empty-clients');
  const map = {};
  projects.forEach(p=>{
    if (!map[p.client]) map[p.client]={projects:0,revenue:0,active:0};
    map[p.client].projects++;
    map[p.client].revenue+=(+p.price||0);
    if (p.stage!=='published') map[p.client].active++;
  });
  // FIX 4: also show clients that have saved contact data but no active projects
  Object.keys(clientData).forEach(name => {
    if (!map[name]) map[name] = {projects:0, revenue:0, active:0};
  });
  if (!Object.keys(map).length) { grid.innerHTML=''; empty.style.display=''; return; }
  empty.style.display='none';
  grid.innerHTML = Object.entries(map).map(([name,d],i)=>`
    <div class="client-card" style="animation-delay:${i*0.06}s;cursor:pointer;" onclick="openClientPanel(this.dataset.cname)" data-cname="${h(name)}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div class="client-avatar2" style="background:${ac(name)}20;color:${ac(name)};margin-bottom:0">${h(name.charAt(0))}</div>
        <div style="font-size:11px;color:var(--muted2);background:var(--s3);padding:3px 10px;border-radius:20px;">פרטים ›</div>
      </div>
      <div class="client-card-name">${h(name)}</div>
      <div class="client-card-meta" style="margin-bottom:4px;">${d.active} פרויקט${d.active!==1?'ים':''} פעיל${d.active!==1?'ים':''}</div>
      ${clientData[name]&&clientData[name].phone ? `<div style="font-size:11px;color:var(--muted2);margin-bottom:2px;"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"/></svg> ${h(clientData[name].phone)}</div>` : ''}
      ${clientData[name]&&clientData[name].email ? `<div style="font-size:11px;color:var(--muted2);margin-bottom:8px;"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19Z"/></svg> ${h(clientData[name].email)}</div>` : ''}
      <div class="client-stats-row">
        <div class="cstat2"><div class="cstat2-val">${d.projects}</div><div class="cstat2-lbl">פרויקטים</div></div>
        <div class="cstat2"><div class="cstat2-val" style="color:var(--success)">₪${d.revenue.toLocaleString()}</div><div class="cstat2-lbl">שכר כולל</div></div>
      </div>
    </div>`).join('');
}



// ── CLIENT DETAIL PANEL ────────────
let clientData = JSON.parse(localStorage.getItem('reel_clients') || '{}');
window.clientData = clientData;
window.registerLegacyStore?.('clientData', () => clientData, (nextValue) => {
  clientData = nextValue && typeof nextValue === 'object' ? nextValue : {};
  window.clientData = clientData;
  return clientData;
});
// clientData[name] = { phone, email, website, address, contact, notes }

let activeClientName = null;

function saveClients() { window.clientData = clientData; try { localStorage.setItem('reel_clients', JSON.stringify(clientData)); } catch(e) { _storageErr(e); } }

function openClientPanel(name) {
  name = String(name ?? '').trim();
  if (!name) return;
  activeClientName = name;
  const data = clientData[name] || {};
  const stg = STAGES;

  // Header
  const col = ac(name);
  document.getElementById('cp-avatar').style.background = col + '25';
  document.getElementById('cp-avatar').style.color = col;
  document.getElementById('cp-avatar').textContent = name.charAt(0);
  document.getElementById('cp-name-input').value = name;

  // Contact fields
  document.getElementById('cp-phone').value   = data.phone   || '';
  document.getElementById('cp-email').value   = data.email   || '';
  document.getElementById('cp-website').value = data.website || '';
  document.getElementById('cp-address').value = data.address || '';
  document.getElementById('cp-contact').value = data.contact || '';
  document.getElementById('cp-notes').value   = data.notes   || '';

  // Package + numbered videos
  const hasPkg = !!(clientData[name] && clientData[name].package && clientData[name].package.total);
  const pkgSection = document.getElementById('cp-package-section');
  const noPkgSection = document.getElementById('cp-nopackage-section');
  if (pkgSection) pkgSection.style.display = hasPkg ? '' : 'none';
  if (noPkgSection) noPkgSection.style.display = hasPkg ? 'none' : '';

  // Stats — adapt to whether there's a package
  const cProjects = projects.filter(p => p.client === name);
  const pkg = (clientData[name] && clientData[name].package) || {};
  const published = cProjects.filter(p => p.stage === 'published').length;
  const inProgress = cProjects.filter(p => p.stage && p.stage !== 'published').length;

  if (hasPkg) {
    const total = parseInt(pkg.total) || 10;
    const packagePrice = pkg.price ? `₪${Number(pkg.price).toLocaleString()}` : '—';
    const paidStatus = pkg.paid === 'paid' ? '✓ שולם' : pkg.paid === 'partial' ? '⚡ חלקי' : '✗ לא שולם';
    const subEl = document.getElementById('cp-sub-txt');
    if (subEl) subEl.textContent = `${published}/${total} סרטונים פורסמו`;
    document.getElementById('cp-stats').innerHTML = `
      <div class="cp-stat"><div class="cp-stat-val">${total}</div><div class="cp-stat-lbl">סרטונים בחבילה</div></div>
      <div class="cp-stat"><div class="cp-stat-val" style="color:var(--success)">${published}</div><div class="cp-stat-lbl">פורסמו</div></div>
      <div class="cp-stat"><div class="cp-stat-val" style="color:var(--accent2)">${inProgress}</div><div class="cp-stat-lbl">⚙️ בעבודה</div></div>
      <div class="cp-stat"><div class="cp-stat-val" style="color:${pkg.paid==='paid'?'var(--success)':pkg.paid==='partial'?'var(--warn)':'var(--danger)'}">${packagePrice}</div><div class="cp-stat-lbl">${paidStatus}</div></div>`;
    renderClientPackage(name);
  } else {
    const subEl = document.getElementById('cp-sub-txt');
    if (subEl) subEl.textContent = `${cProjects.length} פרויקטים`;
    document.getElementById('cp-stats').innerHTML = `
      <div class="cp-stat"><div class="cp-stat-val">${cProjects.length}</div><div class="cp-stat-lbl">פרויקטים</div></div>
      <div class="cp-stat"><div class="cp-stat-val" style="color:var(--success)">${published}</div><div class="cp-stat-lbl">פורסמו</div></div>
      <div class="cp-stat"><div class="cp-stat-val" style="color:var(--accent2)">${inProgress}</div><div class="cp-stat-lbl">⚙️ בעבודה</div></div>`;
    // render plain project list
    const noPkgContainer = document.getElementById('cp-projects-nopackage');
    if (noPkgContainer) {
      if (!cProjects.length) {
        noPkgContainer.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted2);font-size:13px;">אין פרויקטים עדיין ללקוח זה</div>';
      } else {
        noPkgContainer.innerHTML = '<div class="cp-video-cards">' + cProjects.map((p, idx) => {
          const s = STAGES[p.stage]; const stg = s || {color:'#888',label:'',emoji:''};
          return `<div class="cp-video-card" id="cpvc-${p.id}" onclick="openEditFromPanel('${p.id}')">
            <div class="cp-vc-inner">
              <div class="cp-vc-body" style="padding:12px 14px">
                <div class="cp-vc-name">${p.name}</div>
                <div class="cp-vc-meta">
                  <span class="cp-vc-stage" style="background:${stg.color}18;color:${stg.color}">${stg.label||''}</span>
                  ${p.price?`<span style="font-size:11px;font-weight:700;color:var(--success)">₪${Number(p.price).toLocaleString()}</span>`:''}
                </div>
              </div>
            </div>
          </div>`;
        }).join('') + '</div>';
      }
    }
  }

  // FadeContent — reset animations on all sections before opening
  const _cpSections = document.querySelectorAll('.cp-fade-1, .cp-fade-2, .cp-fade-3, .cp-fade-4');
  _cpSections.forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  });

  document.getElementById('client-overlay').classList.add('open');
}

function closeClientPanel() {
  document.getElementById('client-overlay').classList.remove('open');
  activeClientName = null;
}

function openEditFromPanel(id) {
  const clientName = activeClientName;
  // Close panel first, then open edit modal after transition
  document.getElementById('client-overlay').classList.remove('open');
  setTimeout(() => {
    openEdit(id);
    modalReturnClient = clientName;
  }, 300);
}

function handleCPOverlayClick(e) {
  if (e.target === document.getElementById('client-overlay')) closeClientPanel();
}

function cpNameUpdate(newName) {
  const col = ac(newName || 'A');
  document.getElementById('cp-avatar').style.color = col;
  document.getElementById('cp-avatar').style.background = col + '25';
  document.getElementById('cp-avatar').textContent = (newName||'?').charAt(0);
}

function saveClientData() {
  const newName = document.getElementById('cp-name-input').value.trim();
  if (!newName) { toast('⚠️ נא להזין שם לקוח'); return; }

  const info = {
    phone:   document.getElementById('cp-phone').value.trim(),
    email:   document.getElementById('cp-email').value.trim(),
    website: document.getElementById('cp-website').value.trim(),
    address: document.getElementById('cp-address').value.trim(),
    contact: document.getElementById('cp-contact').value.trim(),
    notes:   document.getElementById('cp-notes').value.trim(),
  };

  // If name changed — update all projects safely (clientId stays, only display name changes)
  if (newName !== activeClientName) {
    // ensure new name has same id as old
    if (!clientData[newName]) {
      clientData[newName] = clientData[activeClientName] || {};
    } else {
      // merge keeping old id
      clientData[newName] = { ...clientData[activeClientName], ...clientData[newName] };
    }
    if (!clientData[newName].id) clientData[newName].id = clientData[activeClientName]?.id || genId();
    projects.forEach(p => { if (p.clientId === clientData[newName].id || p.client === activeClientName) { p.client = newName; p.clientId = clientData[newName].id; } });
    if (activeClientName !== newName) delete clientData[activeClientName];
    save();
  }
  if (!clientData[newName]) clientData[newName] = {};
  if (!clientData[newName].id) clientData[newName].id = genId();
  clientData[newName] = { ...clientData[newName], ...info };
  saveClients();
  activeClientName = newName;
  syncAll(); renderClients(); renderCalendar?.();
  closeClientPanel();
  toast('✅ פרטי לקוח נשמרו!');
}

function cpAddVideo() {
  // Find next empty slot
  const cd    = clientData[activeClientName] || {};
  const pkg   = cd.package;
  if (!pkg || !pkg.total) { toast('⚠️ אין חבילה פעילה ללקוח זה'); return; }
  const total = parseInt(pkg.total) || 10;
  const used  = new Set(projects.filter(p => p.client === activeClientName).map(p => p.vidNum));
  let nextSlot = null;
  for (let i = 1; i <= total; i++) { if (!used.has(i)) { nextSlot = i; break; } }
  if (!nextSlot) { toast('⚠️ כל הסרטונים בחבילה כבר מוגדרים'); return; }
  openVideoModal(activeClientName, nextSlot);
}

function cpDeleteClient() {
  const name = activeClientName;
  const count = projects.filter(p => p.client === name).length;
  showConfirm({
    icon: '🏢',
    title: `העברה לפח`,
    msg: `"${name}" יועבר לפח${count > 0 ? ` יחד עם ${count} פרויקטים` : ''}. ניתן לשחזר מהפח בהמשך.`,
    okText: 'העבר לפח',
    okClass: 'danger',
    cancelText: 'ביטול',
  }, () => {
    const clientProjects = projects.filter(p => p.client === name);
    trashData.push({
      name,
      trashType: 'client',
      deletedAt: Date.now(),
      data: clientData[name],
      projects: clientProjects,
    });
    projects = projects.filter(p => p.client !== name);
    delete clientData[name];
    logActivity('delete', '🗑️', 'לקוח הועבר לפח', name, '');
    save(); saveClients(); _saveTrash();
    closeClientPanel();
    renderClients();
    renderCalendar?.();
    updateTrashBadge?.();
    updateStats();
    syncAll?.();
    toast('🗑️ לקוח הועבר לפח');
  });
}



// ── PACKAGE / BUNDLE SYSTEM ─────────────────────────────────
// clientData[name].package = { name, total, price, paid, startDate, endDate }
// projects that belong to a client = the "videos" in their package
// each project now also has: vidNum (1..total), stage can be 'script'|'filming'|'editing'|'approval'|'published'

const VID_STAGES = {
  script:    { label: 'אישור תסריט', color: '#a78bfa', icon: 'script',    emoji: '✏️' },
  filming:   { label: 'צילום',        color: '#00b4d8', icon: 'filming',   emoji: '🎬' },
  editing:   { label: 'עריכה',        color: '#ff8c42', icon: 'editing',   emoji: '✂️' },
  approval:  { label: 'אישור לקוח',  color: '#ffb830', icon: 'approval',  emoji: '👁️' },
  published: { label: 'פורסם',        color: '#00e5a0', icon: 'published', emoji: '🚀' },
};

// Sync VID_STAGES colors into STAGES
Object.keys(VID_STAGES).forEach(k => {
  if (STAGES[k]) STAGES[k].color = VID_STAGES[k].color;
});

let activeVidNum   = null; // which slot number we're editing
let activeVidStage = 'script';

// ── Package Settings Modal ──
function openPackageSettings() {
  const cd  = clientData[activeClientName] || {};
  const pkg = cd.package || {};
  document.getElementById('pkg-name').value  = pkg.name  || '';
  document.getElementById('pkg-total').value = pkg.total || 10;
  document.getElementById('pkg-price').value = pkg.price || '';
  document.getElementById('pkg-start').value = pkg.startDate || '';
  document.getElementById('pkg-end').value   = pkg.endDate   || '';
  document.getElementById('pkg-paid').value  = pkg.paid || 'unpaid';
  document.getElementById('overlay-package').classList.add('open');
}
function closePackageSettings() {
  document.getElementById('overlay-package').classList.remove('open');
}
function resolveClientPanelName() {
  if (typeof activeClientName === 'string' && activeClientName.trim()) return activeClientName.trim();
  const input = document.getElementById('cp-name-input');
  const value = input && typeof input.value === 'string' ? input.value.trim() : '';
  return value || '';
}
function savePackageSettings() {
  const clientName = resolveClientPanelName();
  if (!clientName) {
    closePackageSettings();
    toast('⚠️ לא נמצא לקוח פעיל לחבילה');
    return;
  }
  activeClientName = clientName;
  if (!clientData[clientName]) clientData[clientName] = {};
  clientData[clientName].package = {
    name:      document.getElementById('pkg-name').value.trim(),
    total:     parseInt(document.getElementById('pkg-total').value) || 10,
    price:     document.getElementById('pkg-price').value,
    paid:      document.getElementById('pkg-paid').value,
    startDate: document.getElementById('pkg-start').value,
    endDate:   document.getElementById('pkg-end').value,
  };
  saveClients();
  closePackageSettings();
  openClientPanel(clientName);
  toast('📦 חבילה נשמרה!');
}

// ── Video-in-package modal ──
function openVideoModal(clientName, vidNum) {
  activeVidNum = vidNum;
  // find existing project for this slot
  const vid = projects.find(p => p.client === clientName && p.vidNum === vidNum);
  document.getElementById('vid-modal-title').textContent = `סרטון #${vidNum}`;
  document.getElementById('vid-name').value     = vid ? (vid.name || '') : '';
  document.getElementById('vid-deadline').value = vid ? (vid.deadline || '') : '';
  document.getElementById('vid-drive').value    = vid ? (vid.drive || '') : '';
  document.getElementById('vid-notes').value    = vid ? (vid.notes || '') : '';
  const st = vid ? (vid.stage || 'script') : 'script';
  activeVidStage = st;
  selectVidStage(st);
  // Open on top of client panel - no need to close panel first
  document.getElementById('overlay-video').classList.add('open');
}
function closeVideoModal() {
  document.getElementById('overlay-video').classList.remove('open');
}
function selectVidStage(s) {
  activeVidStage = s;
  document.querySelectorAll('.vstage-opt').forEach(el => {
    const es = el.dataset.stage;
    const vs = VID_STAGES[es];
    if (!vs) return;
    if (es === s) {
      el.style.borderColor = vs.color + '55';
      el.style.color       = vs.color;
      el.style.background  = vs.color + '18';
    } else {
      el.style.borderColor = '';
      el.style.color       = '';
      el.style.background  = '';
    }
  });
}
function saveVideoInPackage() {
  const name     = document.getElementById('vid-name').value.trim();
  const deadline = document.getElementById('vid-deadline').value;
  const drive    = document.getElementById('vid-drive').value.trim();
  const notes    = document.getElementById('vid-notes').value.trim();
  const cn       = activeClientName;
  const vn       = activeVidNum;

  // Find or create project for this slot
  let vid = projects.find(p => p.client === cn && p.vidNum === vn);
  if (vid) {
    vid.name     = name || `סרטון ${vn}`;
    vid.stage    = activeVidStage;
    vid.deadline = deadline;
    vid.drive    = drive;
    vid.notes    = notes;
  } else {
    const pkg   = (clientData[cn] && clientData[cn].package) || {};
    projects.push({
      id:       Date.now().toString() + '_' + vn,
      client:   cn,
      vidNum:   vn,
      name:     name || `סרטון ${vn}`,
      stage:    activeVidStage,
      deadline, drive, notes,
      type:     'reel',
      price:    '',
      paid:     'unpaid',
      progress: 0,
      files:    [],
    });
  }
  save();
  closeVideoModal();
  syncAll();
  renderClientPackage(cn);
  toast(`✅ סרטון ${vn} עודכן!`);
}

// ── Render package summary + video list with inline stage stepper ──
function renderClientPackage(name) {
  const cd      = clientData[name] || {};
  const pkg     = cd.package || {};
  const total   = parseInt(pkg.total) || 10;
  const cVids   = projects.filter(p => p.client === name);
  const published = cVids.filter(p => p.stage === 'published').length;
  const pct     = total ? Math.round(published / total * 100) : 0;

  // Stage counts
  const stageCounts = {};
  Object.keys(VID_STAGES).forEach(k => stageCounts[k] = 0);
  cVids.forEach(v => { if (stageCounts[v.stage] !== undefined) stageCounts[v.stage]++; });

  // Build vidNum → project map
  const vidMap = {};
  cVids.forEach(v => { if (v.vidNum) vidMap[v.vidNum] = v; });

  // Package summary
  const paidCls = pkg.paid || 'unpaid';
  const paidTxt = paidCls === 'paid' ? '✓ שולם' : paidCls === 'partial' ? '⚡ חלקי' : '✗ לא שולם';
  const dateRange = (pkg.startDate || pkg.endDate)
    ? `📅 ${pkg.startDate ? new Date(pkg.startDate).toLocaleDateString('he-IL',{day:'numeric',month:'short'}) : '?'} — ${pkg.endDate ? new Date(pkg.endDate).toLocaleDateString('he-IL',{day:'numeric',month:'short'}) : '?'}`
    : '';

  document.getElementById('cp-package-summary').innerHTML = `
    <div class="pkg-summary">
      <div class="pkg-name-row">
        <div class="pkg-name">${pkg.name || 'חבילה פעילה'} ${pkg.price ? `· ₪${Number(pkg.price).toLocaleString()}` : ''}</div>
        <div class="pkg-paid-badge ${paidCls}">${paidTxt}</div>
      </div>
      <div class="pkg-progress-wrap">
        <div class="pkg-progress-top">
          <span class="pkg-progress-label">סרטונים שפורסמו</span>
          <span><span class="pkg-progress-count">${published}</span><span class="pkg-progress-total"> / ${total}</span></span>
        </div>
        <div class="pkg-bar"><div class="pkg-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="pkg-stages-row">
        ${Object.entries(VID_STAGES).map(([k,vs]) => stageCounts[k] > 0 ? `
          <div class="pkg-stage-chip" style="background:${vs.color}15;color:${vs.color};">
            ${vs.emoji} ${vs.label} <span class="chip-count">${stageCounts[k]}</span>
          </div>` : '').join('')}
        ${cVids.length < total ? `<div class="pkg-stage-chip">⬜ ממתין <span class="chip-count">${total - cVids.length}</span></div>` : ''}
      </div>
      ${dateRange ? `<div class="pkg-dates">${dateRange}</div>` : ''}
    </div>`;

  // Build stage order array for stepper
  const stageOrder = Object.keys(VID_STAGES); // script, filming, editing, approval, published
  
  // Video rows with inline stage stepper
  let html = '';
  for (let i = 1; i <= total; i++) {
    const v   = vidMap[i];
    const vs  = v ? (VID_STAGES[v.stage] || VID_STAGES.script) : null;
    const d   = v ? daysLeft(v.deadline) : null;
    const dlt = v ? dlText(d, v.deadline) : '';
    const dlc = v ? dlClass(d) : '';
    const curStageIdx = v ? stageOrder.indexOf(v.stage) : -1;

    // Build inline stepper
    const stepperHtml = stageOrder.map((sk, si) => {
      const sv   = VID_STAGES[sk];
      const done = curStageIdx > si;
      const curr = curStageIdx === si;
      const connector = si < stageOrder.length - 1
        ? `<div class="vid-step-connector ${done||curr?'done':''}"></div>` : '';
      return `<div class="vid-step ${done?'done':curr?'current':''}" style="--sc:${sv.color}"
               onclick="event.stopPropagation(); quickVidStage('${name}', ${i}, '${sk}')"
               title="${sv.label}">
          <div class="vid-step-icon">${curr||done ? sv.emoji : '<span style=\"opacity:.3\">' + sv.emoji + '</span>'}</div>
          <div class="vid-step-lbl">${sv.label.split(' ')[0]}</div>
        </div>${connector}`;
    }).join('');

    html += `<div class="vid-row${v && v.stage==='published' ? ' published' : ''}" data-cname="${h(name)}" data-vidnum="${i}" onclick="openVideoModal(this.dataset.cname,+this.dataset.vidnum)" style="animation-delay:${(i-1)*0.04}s">
      <div class="vid-stage-strip" style="background:${vs ? vs.color : 'var(--border2)'}"></div>
      <div class="vid-num-col">
        <div class="vid-num">${i}</div>
      </div>
      <div class="vid-body">
        <div class="vid-title ${!v || !v.name ? 'empty' : ''}">${v && v.name ? v.name : `סרטון ${i} — לחץ לעדכון`}</div>
        <div class="vid-meta">
          ${dlt ? `<span class="vid-deadline vmeta-pill ${dlc}">${dlt}</span>` : ''}
          ${v && v.drive ? `<a href="${v.drive}" target="_blank" onclick="event.stopPropagation()" style="font-size:10px;color:var(--cyan);text-decoration:none;padding:2px 7px;border-radius:5px;background:var(--s3);"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M240,88.23a54.43,54.43,0,0,1-16,37L189.25,160a54.27,54.27,0,0,1-38.63,16h-.05A54.63,54.63,0,0,1,96,119.84a8,8,0,0,1,16,.45A38.62,38.62,0,0,0,150.58,160h0a38.39,38.39,0,0,0,27.31-11.31l34.75-34.75a38.63,38.63,0,0,0-54.63-54.63l-11,11A8,8,0,0,1,135.7,59l11-11A54.65,54.65,0,0,1,224,48,54.86,54.86,0,0,1,240,88.23ZM109,185.66l-11,11A38.41,38.41,0,0,1,70.6,208h0a38.63,38.63,0,0,1-27.29-65.94L78,107.31A38.63,38.63,0,0,1,144,135.71a8,8,0,0,0,16,.45A54.86,54.86,0,0,0,144,96a54.65,54.65,0,0,0-77.27,0L32,130.75A54.62,54.62,0,0,0,70.56,224h0a54.28,54.28,0,0,0,38.64-16l11-11A8,8,0,0,0,109,185.66Z"/></svg> Drive</a>` : ''}
        </div>
      </div>
      <div class="vid-stepper" onclick="event.stopPropagation()">${stepperHtml}</div>
    </div>`;
  }
  document.getElementById('cp-projects').innerHTML = html;
}

function quickVidStage(clientName, vidNum, newStage) {
  // Find or create video slot
  let vid = projects.find(p => p.client === clientName && p.vidNum === vidNum);
  if (!vid) {
    vid = {
      id:       Date.now().toString() + '_' + vidNum,
      client:   clientName, vidNum,
      name:     `סרטון ${vidNum}`,
      stage:    newStage,
      type: 'reel', price: '', paid: 'unpaid', progress: 0, files: [],
    };
    projects.push(vid);
  } else {
    vid.stage = newStage;
  }
  save(); syncAll();
  logActivity('stage','🔄',`שלב שונה → ${VID_STAGES[newStage]?.label||newStage}`,vid.name||`סרטון ${vidNum}`,clientName);
  toast(`${VID_STAGES[newStage]?.emoji||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'} סרטון ${vidNum} → ${VID_STAGES[newStage]?.label||newStage}`);
}

if (!projects.length && window.REELApp?.devMode?.isEnabled?.()) {
  const td = new Date();
  const fmtDate = (offset) => { const d=new Date(td.getTime()+offset*86400000); return d.toISOString().split('T')[0]; };
  projects = [
    {id:'1', name:'ריל השקה מוצר חדש', client:'פיצה פיצה', stage:'editing', type:'reel', deadline:fmtDate(2), price:'2800', progress:70, paid:'partial', notes:'3 גרסאות שונות'},
    {id:'2', name:'קמפיין ספטמבר - X3 רילס', client:'בוטיק מנגו', stage:'approval', type:'reel', deadline:fmtDate(1), price:'4500', progress:100, paid:'unpaid', notes:'ממתין לאישור לקוח'},
    {id:'3', name:'YouTube Short שבועי', client:'קפה גבריאל', stage:'filming', type:'short', deadline:fmtDate(5), price:'1200', progress:30, paid:'unpaid', notes:''},
    {id:'4', name:'פרסומת TikTok', client:'סטארטאפ X', stage:'brief', type:'ad', deadline:fmtDate(14), price:'6000', progress:10, paid:'paid', notes:'צריך לצלם ב-2 לוקיישנים'},
    {id:'5', name:'סטורי מכירה', client:'פיצה פיצה', stage:'published', type:'story', deadline:fmtDate(-3), price:'800', progress:100, paid:'paid', notes:''},
  ];
  save();
}

renderPipeline(); updateStats();
// ── VIDEO CARDS IN CLIENT PANEL ────────────────────────────
function renderVideoCards(clientName) {
  const cProjects = projects.filter(p => p.client === clientName);
  const container = document.getElementById('cp-projects');
  if (!cProjects.length) {
    container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted2);font-size:13px;">אין פרויקטים עדיין ללקוח זה</div>';
    return;
  }
  container.innerHTML = '<div class="cp-video-cards">' + cProjects.map((p, idx) => {
    const s    = STAGES[p.stage] || { label: p.stage || '?', color: '#888', emoji: '' };
    const d    = daysLeft(p.deadline);
    const dlt  = dlText(d, p.deadline);
    const dlc  = dlClass(d);
    const thumb = p.thumbnail || '';
    const driveUrl = p.driveUrl || '';
    const trackCount = trackingData.filter(t => t.projectId === p.id).length;

    return `<div class="cp-video-card" id="cpvc-${p.id}">
      <div class="cp-vc-inner">
        <!-- THUMBNAIL -->
        <div class="cp-vc-thumb" onclick="triggerThumbUpload('${p.id}')">
          ${thumb
            ? `<img src="${thumb}" alt="תמונה מוקטנת">`
            : `<div class="cp-vc-thumb-placeholder">${TYPES[p.type]||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'}</div>`
          }
          <div class="cp-vc-num">${idx + 1}</div>
          <input type="file" id="thumb-input-${p.id}" accept="image/*" onchange="handleThumbUpload('${p.id}', this)">
          <button class="cp-vc-thumb-upload" onclick="event.stopPropagation();triggerThumbUpload('${p.id}')">
            ${thumb ? '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h28.69L196.12,79.51a79.84,79.84,0,0,0-57-23.43h-.41A80,80,0,0,0,56.42,183.74a8,8,0,1,1-12.84,9.54A96,96,0,0,1,138.71,40.08h.49a95.91,95.91,0,0,1,68.54,28.1L224,84.69V56a8,8,0,0,1,16,0Zm-26.58,136.26A80,80,0,0,1,57.31,176.49L43.31,162.49H72a8,8,0,0,0,0-16H24a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V174.69l15.51,15.8a96,96,0,0,0,166.29-38.29,8,8,0,0,0-15.38-4.94Z"/></svg> החלף' : '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0;margin-left:3px"><path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"/></svg> הוסף תמונה'}
          </button>
        </div>
        <!-- BODY -->
        <div class="cp-vc-body">
          <div class="cp-vc-name" title="${p.name}">${p.name}</div>
          <div class="cp-vc-meta">
            <span class="cp-vc-stage" style="background:${s?.color||'#888'}18;color:${s?.color||'#888'}">${s?.emoji||''} ${s?.label||p.stage}</span>
            ${dlt ? `<span class="vmeta-pill ${dlc}" style="font-size:10px">${dlt}</span>` : ''}
            ${p.files && p.files.length ? `<span class="file-badge">📎 ${p.files.length}</span>` : ''}
            ${trackCount ? `<span class="file-badge" style="background:var(--cyan)15;color:var(--cyan)">📊 ${trackCount}</span>` : ''}
          </div>
          <!-- DRIVE LINK -->
          <div id="drive-display-${p.id}">
            ${driveUrl
              ? `<div style="display:flex;align-items:center;gap:6px;">
                  <a class="cp-vc-drive" href="${driveUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
                    <img src="https://www.gstatic.com/images/branding/product/1x/drive_16dp.png" width="12" height="12" onerror="this.style.display='none'">
                    Google Drive
                  </a>
                  <button class="cp-vc-drive-edit" onclick="event.stopPropagation();showDriveInput('${p.id}')" title="ערוך קישור">✏️</button>
                </div>`
              : `<button class="cp-vc-drive" onclick="event.stopPropagation();showDriveInput('${p.id}')" style="cursor:pointer;background:none;border:1px dashed var(--border2);color:var(--muted2);">
                  + הוסף קישור Drive
                </button>`
            }
          </div>
          <div id="drive-input-${p.id}" style="display:none;">
            <div class="drive-inline-row">
              <input class="drive-inline-inp" id="drive-val-${p.id}" placeholder="https://drive.google.com/..." value="${driveUrl}" onclick="event.stopPropagation()">
              <button class="drive-save-btn" onclick="event.stopPropagation();saveDriveUrl('${p.id}')">שמור</button>
            </div>
          </div>
          <!-- ACTIONS -->
          <div class="cp-vc-actions">
            <button class="cp-vc-btn" onclick="openEditFromPanel('${p.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M163.31,100.69a16,16,0,0,0-22.63,0L72,169.37,56,224l54.63-16L178.69,140a16,16,0,0,0,0-22.63ZM92.37,214,68,221l7-24.33,77.37-77.38,17.37,17.37ZM168,128.69l-17.37-17.38,11.32-11.31,17.37,17.37ZM216,88H152a8,8,0,0,0,0,16h56V208H48V104H96a8,8,0,0,0,0-16H48A16,16,0,0,0,32,104V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104A16,16,0,0,0,216,88Z"/></svg> ערוך</button>
            <button class="cp-vc-btn" onclick="event.stopPropagation();openAddTracking('${p.id}')">📊 הוסף מעקב</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('') + '</div>';
}

function triggerThumbUpload(projId) {
  document.getElementById('thumb-input-' + projId).click();
}

function handleThumbUpload(projId, input) {
  const file = input.files[0]; if (!file) return;
  if (file.size > 3 * 1024 * 1024) { toast('⚠️ תמונה גדולה מ-3MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const p = projects.find(x => x.id === projId); if (!p) return;
    p.thumbnail = e.target.result;
    save();
    // re-render just this card
    renderVideoCards(activeClientName);
    toast('🖼️ תמונה נשמרה!');
  };
  reader.readAsDataURL(file);
}

function showDriveInput(projId) {
  document.getElementById('drive-display-' + projId).style.display = 'none';
  document.getElementById('drive-input-'   + projId).style.display = '';
  document.getElementById('drive-val-'     + projId).focus();
}

function saveDriveUrl(projId) {
  const url = document.getElementById('drive-val-' + projId).value.trim();
  const p = projects.find(x => x.id === projId); if (!p) return;
  p.driveUrl = url;
  save();
  renderVideoCards(activeClientName);
  toast('🔗 קישור נשמר!');
}





