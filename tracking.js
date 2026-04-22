// ── TRACKING ───────────────────────────────────
let trackingData = JSON.parse(localStorage.getItem('reel_tracking') || '[]');
let editTrackId  = null;
let currentTrackFilter = 'all';

window.trackingData = trackingData;
window.registerLegacyStore?.('trackingData', () => trackingData, (nextValue) => {
  trackingData = Array.isArray(nextValue) ? nextValue : [];
  window.trackingData = trackingData;
  return trackingData;
});

function saveTracking_store() {
  window.trackingData = trackingData;
  try { localStorage.setItem('reel_tracking', JSON.stringify(trackingData)); } catch(e) { _storageErr(e); }
}

function replaceTrackingStore(nextItems) {
  trackingData = Array.isArray(nextItems) ? nextItems : [];
  saveTracking_store();
}

function refreshTrackingViews() {
  refreshTrackingViews();
  syncAll();
  window.REELApp?.projectWorkspaceView?.render?.();
  window.REELApp?.clientWorkspaceView?.render?.();
}

const PLATFORM_INFO = {
  tiktok:    { label: 'TikTok',           emoji: '📱', color: '#00f2ea' },
  instagram: { label: 'Instagram Reels',  emoji: '📸', color: '#e1306c' },
  youtube:   { label: 'YouTube Shorts',   emoji: '▶️', color: '#ff0000' },
  facebook:  { label: 'Facebook',         emoji: '👥', color: '#1877f2' },
};

function setTrackFilter(f, el) {
  currentTrackFilter = f;
  document.querySelectorAll('#view-tracking .filter-chip').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderTracking();
}

function fmtNum(n) {
  if (!n) return '—';
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return Number(n).toLocaleString();
}

function renderTracking() {
  const grid  = document.getElementById('tracking-grid');
  const empty = document.getElementById('empty-tracking');
  const items = currentTrackFilter === 'all' ? trackingData : trackingData.filter(t => t.platform === currentTrackFilter);
  if (!items.length) { grid.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  const sorted = [...items].sort((a,b) => (b.date||'').localeCompare(a.date||''));
  // Carousel wrapper
  const isCarousel = sorted.length > 1;
  const wrapOpen  = isCarousel ? '<div class="carousel-wrap" id="carousel-tracking"><button class="carousel-btn carousel-btn-prev" onclick="carouselMove(-1)">›</button><button class="carousel-btn carousel-btn-next" onclick="carouselMove(1)">‹</button><div class="carousel-track" id="carousel-track">' : '<div class="tracking-grid">';
  const wrapClose = isCarousel ? '</div><div class="carousel-dots" id="carousel-dots"></div></div>' : '</div>';
  grid.innerHTML = wrapOpen + sorted.map((t, i) => {
    const proj  = projects.find(p => p.id === t.projectId);
    const pInfo = PLATFORM_INFO[t.platform] || { label: t.platform, emoji: '📱', color: '#888' };
    const engRate = t.views ? ((+t.likes + +t.comments + +t.shares) / +t.views * 100).toFixed(1) : '—';
    return `<div class="track-card" style="animation-delay:${i*0.05}s">
      <div class="track-card-head">
        <div class="track-platform-badge" style="background:${pInfo.color}18;font-size:22px;">${pInfo.emoji}</div>
        <div>
          <div class="track-proj-name">${proj ? proj.name : 'פרויקט לא נמצא'}</div>
          <div class="track-proj-sub">${pInfo.label} · ${t.date||''} ${t.time ? '· '+t.time : ''} · ${proj ? proj.client : ''}</div>
        </div>
        ${t.url ? `<a class="track-url-link" href="${t.url}" target="_blank" rel="noopener">🔗 צפה בסרטון ↗</a>` : ''}
        <button class="track-edit-btn" onclick="openEditTracking('${t.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M163.31,100.69a16,16,0,0,0-22.63,0L72,169.37,56,224l54.63-16L178.69,140a16,16,0,0,0,0-22.63ZM92.37,214,68,221l7-24.33,77.37-77.38,17.37,17.37ZM168,128.69l-17.37-17.38,11.32-11.31,17.37,17.37ZM216,88H152a8,8,0,0,0,0,16h56V208H48V104H96a8,8,0,0,0,0-16H48A16,16,0,0,0,32,104V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104A16,16,0,0,0,216,88Z"/></svg> ערוך</button>
      </div>
      <div class="track-stats">
        <div class="track-stat"><div class="track-stat-val" style="color:var(--cyan)">${fmtNum(t.views)}</div><div class="track-stat-lbl"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,182.49,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/></svg> צפיות</div></div>
        <div class="track-stat"><div class="track-stat-val" style="color:var(--danger)">${fmtNum(t.likes)}</div><div class="track-stat-lbl"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z"/></svg> לייקים</div></div>
        <div class="track-stat"><div class="track-stat-val" style="color:var(--accent2)">${fmtNum(t.comments)}</div><div class="track-stat-lbl"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216l12.48-37.4a8,8,0,0,0-.67-6.54A88,88,0,1,1,128,216Z"/></svg> תגובות</div></div>
        <div class="track-stat"><div class="track-stat-val" style="color:var(--success)">${fmtNum(t.shares)}</div><div class="track-stat-lbl"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h28.69L196.12,79.51a79.84,79.84,0,0,0-57-23.43h-.41A80,80,0,0,0,56.42,183.74a8,8,0,1,1-12.84,9.54A96,96,0,0,1,138.71,40.08h.49a95.91,95.91,0,0,1,68.54,28.1L224,84.69V56a8,8,0,0,1,16,0Zm-26.58,136.26A80,80,0,0,1,57.31,176.49L43.31,162.49H72a8,8,0,0,0,0-16H24a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V174.69l15.51,15.8a96,96,0,0,0,166.29-38.29,8,8,0,0,0-15.38-4.94Z"/></svg> שיתופים</div></div>
        <div class="track-stat"><div class="track-stat-val" style="color:var(--warn)">${fmtNum(t.saves)}</div><div class="track-stat-lbl"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"/></svg> שמירות</div></div>
        <div class="track-stat"><div class="track-stat-val" style="color:var(--muted2)">${engRate !== '—' ? engRate+'%' : '—'}</div><div class="track-stat-lbl"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M240,56v48a8,8,0,0,1-16,0V75.31l-82.34,82.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0L136,140.69,212.69,64H168a8,8,0,0,1,0-16h64A8,8,0,0,1,240,56Z"/></svg> אינגייג׳</div></div>
      </div>
      ${t.notes ? `<div class="track-notes-row"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M163.31,100.69a16,16,0,0,0-22.63,0L72,169.37,56,224l54.63-16L178.69,140a16,16,0,0,0,0-22.63ZM92.37,214,68,221l7-24.33,77.37-77.38,17.37,17.37ZM168,128.69l-17.37-17.38,11.32-11.31,17.37,17.37ZM216,88H152a8,8,0,0,0,0,16h56V208H48V104H96a8,8,0,0,0,0-16H48A16,16,0,0,0,32,104V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104A16,16,0,0,0,216,88Z"/></svg> ${t.notes}</div>` : ''}
    </div>`;
  }).join('') + wrapClose;
  if (isCarousel) initCarousel();
}

function openAddTracking(projId) {
  editTrackId = null;
  document.getElementById('tracking-modal-title').textContent = 'הוסף נתוני ביצועים';
  document.getElementById('tr-del-btn').style.display = 'none';
  const sel = document.getElementById('tr-project');
  sel.innerHTML = projects.map(p => `<option value="${p.id}" ${p.id===projId?'selected':''}>${h(p.name)} · ${h(p.client)}</option>`).join('');
  ['tr-date','tr-time','tr-url','tr-views','tr-likes','tr-comments','tr-shares','tr-saves','tr-reach','tr-notes']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('tr-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('overlay-tracking').classList.add('open');
}

function openEditTracking(id) {
  const t = trackingData.find(x => x.id === id); if (!t) return;
  editTrackId = id;
  document.getElementById('tracking-modal-title').textContent = 'עריכת נתוני ביצועים';
  document.getElementById('tr-del-btn').style.display = '';
  const sel = document.getElementById('tr-project');
  sel.innerHTML = projects.map(p => `<option value="${p.id}" ${p.id===t.projectId?'selected':''}>${h(p.name)} · ${h(p.client)}</option>`).join('');
  document.getElementById('tr-platform').value  = t.platform  || 'tiktok';
  document.getElementById('tr-date').value      = t.date      || '';
  document.getElementById('tr-time').value      = t.time      || '';
  document.getElementById('tr-url').value       = t.url       || '';
  document.getElementById('tr-views').value     = t.views     || '';
  document.getElementById('tr-likes').value     = t.likes     || '';
  document.getElementById('tr-comments').value  = t.comments  || '';
  document.getElementById('tr-shares').value    = t.shares    || '';
  document.getElementById('tr-saves').value     = t.saves     || '';
  document.getElementById('tr-reach').value     = t.reach     || '';
  document.getElementById('tr-notes').value     = t.notes     || '';
  document.getElementById('overlay-tracking').classList.add('open');
}

function saveTracking() {
  const projectId = document.getElementById('tr-project').value;
  const platform  = document.getElementById('tr-platform').value;
  if (!projectId) { toast('⚠️ נא לבחור פרויקט'); return; }
  const entry = {
    id:        editTrackId || Date.now().toString(),
    projectId, platform,
    date:     document.getElementById('tr-date').value,
    time:     document.getElementById('tr-time').value,
    url:      document.getElementById('tr-url').value.trim(),
    views:    +document.getElementById('tr-views').value    || 0,
    likes:    +document.getElementById('tr-likes').value    || 0,
    comments: +document.getElementById('tr-comments').value || 0,
    shares:   +document.getElementById('tr-shares').value   || 0,
    saves:    +document.getElementById('tr-saves').value    || 0,
    reach:    +document.getElementById('tr-reach').value    || 0,
    notes:    document.getElementById('tr-notes').value.trim(),
  };
  if (editTrackId) {
    const idx = trackingData.findIndex(x => x.id === editTrackId);
    trackingData[idx] = entry;
    toast('✏️ עודכן!');
  } else {
    trackingData.push(entry);
    toast('📊 נתונים נשמרו!');
  }
  saveTracking_store();
  document.getElementById('overlay-tracking').classList.remove('open');
  renderTracking();
}

function deleteTracking() {
  showConfirm({
    icon: '📊',
    title: 'מחיקת נתוני ביצועים',
    msg: 'נתוני המעקב יימחקו לצמיתות.',
    okText: 'כן, מחק',
    okClass: 'danger',
    cancelText: 'ביטול',
  }, () => {
    replaceTrackingStore(trackingData.filter(x => x.id !== editTrackId));
    document.getElementById('overlay-tracking').classList.remove('open');
    refreshTrackingViews();
    toast('🗑️ נמחק');
  });
}


// ═══════════════════════════════════════════════════════════════
// ANIMATED LIST — Enhanced keyboard navigation for search
// ═══════════════════════════════════════════════════════════════
// Patch the existing gsKeydown to also scroll focused item into view
const _origGsKeydown = window.gsKeydown;
window.gsKeydown = function(e) {
  _origGsKeydown && _origGsKeydown(e);
  // Scroll focused item into view smoothly
  const focused = document.querySelector('.gs-item.focused');
  if (focused) {
    focused.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
};

// Search results: re-animate on every new search (reset animation)
const _origRunGS = window.runGlobalSearch;
window.runGlobalSearch = function(q) {
  _origRunGS && _origRunGS(q);
  // Re-trigger animation by forcing reflow on each gs-item
  const items = document.querySelectorAll('.gs-item');
  items.forEach(item => {
    item.style.animation = 'none';
    item.offsetHeight; // reflow
    item.style.animation = '';
  });
};


// ═══════════════════════════════════════════════════════════════
// ANIMATED CLIENT PICKER
// ═══════════════════════════════════════════════════════════════
let _clpFocus = {};   // { fieldId: focusIndex }

function _getClientNames() {
  return [...new Set([...projects.map(p=>p.client),...Object.keys(clientData)])].filter(Boolean).sort();
}

function _clpColor(name) {
  return typeof ac === 'function' ? ac(name) : 'var(--accent)';
}

function _buildClPickerDropdown(fieldId, selectedVal) {
  const drop = document.getElementById('clp-drop-' + fieldId);
  if (!drop) return;
  const names = _getClientNames();
  if (!names.length) {
    drop.innerHTML = '<div style="padding:12px 14px;font-size:12px;color:var(--muted2)">אין לקוחות עדיין</div>';
    return;
  }
  drop.innerHTML =
    '<div class="cl-picker-grad-top"></div>' +
    names.map((n, i) => {
      const col = _clpColor(n);
      const sel = n === selectedVal;
      return `<div class="cl-picker-item${sel?' selected':''}"
        data-value="${h(n)}" data-idx="${i}" data-field="${h(fieldId)}"
        onclick="selectClPicker(this.dataset.field,this.dataset.value)"
        onmouseenter="clpHover(this.dataset.field,+this.dataset.idx)">
        <div class="cl-picker-avatar" style="background:${col}22;color:${col}">${n.charAt(0)}</div>
        <span class="cl-picker-name">${n}</span>
        <span class="cl-picker-check">✓</span>
      </div>`;
    }).join('') +
    '<div class="cl-picker-grad-bottom"></div>';

  // staggered reveal animation
  const _clpItems = drop.querySelectorAll('.cl-picker-item');
  _clpItems.forEach(el => { el.style.transitionDelay = '0s'; el.classList.remove('clp-visible'); });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    _clpItems.forEach((el, i) => {
      el.style.transitionDelay = (i * 0.048) + 's';
      el.classList.add('clp-visible');
    });
  }));
}

function toggleClPicker(fieldId) {
  const drop = document.getElementById('clp-drop-' + fieldId);
  const btn  = document.getElementById('clp-btn-' + fieldId);
  if (!drop || !btn) return;
  const isOpen = drop.classList.contains('open');
  // Close all other pickers
  document.querySelectorAll('.cl-picker-dropdown.open').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.cl-picker-trigger.open').forEach(b => b.classList.remove('open'));
  if (!isOpen) {
    const cur = document.getElementById(fieldId)?.value || '';
    _buildClPickerDropdown(fieldId, cur);
    drop.classList.add('open');
    btn.classList.add('open');
    _clpFocus[fieldId] = -1;
    // scroll-based gradient opacity
    drop.onscroll = function() {
      var st = drop.scrollTop;
      var sh = drop.scrollHeight - drop.clientHeight;
      var gt = drop.querySelector('.cl-picker-grad-top');
      var gb = drop.querySelector('.cl-picker-grad-bottom');
      if (gt) gt.style.opacity = Math.min(1, st / 40);
      if (gb) gb.style.opacity = sh > 4 ? Math.min(1, (sh - st) / 40) : '0';
    };
    drop.onscroll(); // init gradient state
  }
}

function selectClPicker(fieldId, val) {
  const hidden = document.getElementById(fieldId);
  if (hidden) hidden.value = val;
  const lbl = document.getElementById('clp-label-' + fieldId);
  if (lbl) { lbl.textContent = val; lbl.style.color = ''; }
  const drop = document.getElementById('clp-drop-' + fieldId);
  const btn  = document.getElementById('clp-btn-' + fieldId);
  if (drop) drop.classList.remove('open');
  if (btn)  btn.classList.remove('open');
}

function clpHover(fieldId, idx) {
  _clpFocus[fieldId] = idx;
  document.querySelectorAll(`#clp-drop-${fieldId} .cl-picker-item`).forEach((el,i) =>
    el.classList.toggle('focused', i === idx));
}

function clpGetValue(fieldId) {
  return document.getElementById(fieldId)?.value || '';
}

function clpSetValue(fieldId, val) {
  const hidden = document.getElementById(fieldId);
  if (hidden) hidden.value = val;
  const lbl = document.getElementById('clp-label-' + fieldId);
  if (lbl) {
    lbl.textContent = val || 'בחר לקוח...';
    lbl.style.color = val ? '' : 'var(--muted2)';
  }
}

function clpReset(fieldId) {
  clpSetValue(fieldId, '');
}

// Close picker on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.cl-picker-wrap')) {
    document.querySelectorAll('.cl-picker-dropdown.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.cl-picker-trigger.open').forEach(b => b.classList.remove('open'));
  }
});

// Keyboard nav inside pickers
document.addEventListener('keydown', e => {
  const openDrop = document.querySelector('.cl-picker-dropdown.open');
  if (!openDrop) return;
  const fieldId = openDrop.id.replace('clp-drop-', '');
  const items = openDrop.querySelectorAll('.cl-picker-item');
  let idx = _clpFocus[fieldId] ?? -1;
  if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx+1, items.length-1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx-1, 0); }
  else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); items[idx]?.click(); return; }
  else if (e.key === 'Escape') { toggleClPicker(fieldId); return; }
  else return;
  _clpFocus[fieldId] = idx;
  items.forEach((el, i) => el.classList.toggle('focused', i === idx));
  items[idx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});

// ── Patch fillScriptClients to use custom picker ──
const _origFillSC = window.fillScriptClients;
window.fillScriptClients = function(sel) {
  clpSetValue('sc-client', sel || '');
  // Also keep original select logic as fallback for openScriptEdit
};

// ── Patch openScriptEdit to set custom picker value ──
const _origOpenSE = window.openScriptEdit;
window.openScriptEdit = function(id) {
  _origOpenSE && _origOpenSE(id);
  const s = scriptsData.find(x => x.id === id);
  if (s) clpSetValue('sc-client', s.client || '');
};

// ── Patch openScriptModal to reset picker ──
const _origOSM = window.openScriptModal;
window.openScriptModal = function(preClient, preDate) {
  _origOSM && _origOSM(preClient, preDate);
  clpSetValue('sc-client', preClient || '');
};

// ── Patch saveScript to read from hidden input ──
// (hidden input id="sc-client" already holds value — no extra patch needed)

// ── Patch openShootDayModal to reset picker ──
const _origOSDM = window.openShootDayModal;
window.openShootDayModal = function(preDate) {
  _origOSDM && _origOSDM(preDate);
  clpReset('shoot-day-client');
};

// ── Patch openPackageChooser to reset picker ──
const _origOPC = window.openPackageChooser;
window.openPackageChooser = function() {
  _origOPC && _origOPC();
  clpReset('pkg-chooser-client');
};

// ── Patch openPkgForClient to read from hidden input ──
const _origOPFC = window.openPkgForClient;
window.openPkgForClient = function() {
  const name = document.getElementById('pkg-chooser-client')?.value;
  if (!name) { toast('⚠️ נא לבחור לקוח'); return; }
  document.getElementById('pkg-chooser-overlay').classList.remove('open');
  openClientPanel(name);
  setTimeout(() => openPackageSettings(), 350);
};

// ── Patch saveShootDay to read from hidden input ──
const _origSSD = window.saveShootDay;
window.saveShootDay = function() {
  const date   = document.getElementById('shoot-day-date')?.value;
  if (!date) { toast('⚠️ נא לבחור תאריך'); return; }
  const client = document.getElementById('shoot-day-client')?.value || '';
  const notes  = document.getElementById('shoot-day-notes')?.value.trim() || '';
  const existing = projects.find(p => p.type==='shootday' && p.deadline===date && p.client===client);
  if (!existing) {
    projects.push({ id:'sd_'+Date.now(), name:'יום צילום'+(client?' — '+client:''),
      client:client||'—', type:'shootday', stage:'filming', deadline:date,
      notes, price:'', paid:'unpaid', progress:30 });
    save();
  }
  document.getElementById('overlay-shoot-day').classList.remove('open');
  setTimeout(() => openSDP(date), 60);
  toast('📅 יום צילום נוסף!');
  syncAll();
};


// ═══════════════════════════════════════════════════════════════
// CARD NAV — sidebar navigation
// ═══════════════════════════════════════════════════════════════
function cnClick(view, card) {
  // Update active states
  document.querySelectorAll('.cn-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  goView(view, null);
}

// Sync CardNav active state when goView is called externally
const _origGoView = window.goView;
window.goView = function(v, el) {
  _origGoView && _origGoView(v, el);
  // Sync card nav
  document.querySelectorAll('.cn-card').forEach(c => {
    const id = c.id.replace('cn-','');
    c.classList.toggle('active', id === v);
  });
  // Sync dock
  document.querySelectorAll('.dock-item').forEach(d => {
    d.classList.toggle('active', d.dataset.view === v);
  });
};

// ═══════════════════════════════════════════════════════════════
// DOCK — mobile bottom navigation
// ═══════════════════════════════════════════════════════════════
function dockClick(view, btn) {
  document.querySelectorAll('.dock-item').forEach(d => d.classList.remove('active'));
  btn.classList.add('active');
  // Magnification ripple on neighbours
  const items = [...document.querySelectorAll('.dock-item')];
  const idx = items.indexOf(btn);
  items.forEach((item, i) => {
    const dist = Math.abs(i - idx);
    const scale = dist === 0 ? 1.12 : dist === 1 ? 1.06 : 1;
    const ty    = dist === 0 ? -4   : dist === 1 ? -2   : 0;
    item.querySelector('.dock-icon').style.transform = `scale(${scale}) translateY(${ty}px)`;
    setTimeout(() => { item.querySelector('.dock-icon').style.transform = ''; }, 350);
  });
  goView(view, null);
}

// Sync dock badge counts with existing badge update functions
const _origUpdateScriptBadge = window.updateScriptBadge;
window.updateScriptBadge = function() {
  _origUpdateScriptBadge && _origUpdateScriptBadge();
  const n = (typeof scriptsData !== 'undefined' ? scriptsData : []).length;
  const db = document.getElementById('dock-scripts-badge');
  if (db) { db.textContent = n; db.style.display = n > 0 ? 'flex' : 'none'; }
};

const _origUpdateArchiveBadge = window.updateArchiveBadge;
window.updateArchiveBadge = function() {
  _origUpdateArchiveBadge && _origUpdateArchiveBadge();
  const n = (typeof archiveData !== 'undefined' ? archiveData : []).length;
  const db = document.getElementById('dock-archive-badge');
  if (db) { db.textContent = n; db.style.display = n > 0 ? 'flex' : 'none'; }
};

// ═══════════════════════════════════════════════════════════════
// CAROUSEL — tracking performance
// ═══════════════════════════════════════════════════════════════
let _carIdx = 0;
let _carDragX = 0;
let _carDragging = false;

let _carListenersSet = false;
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const dots  = document.getElementById('carousel-dots');
  if (!track) return;

  const cards = track.querySelectorAll('.track-card');
  _carIdx = 0;

  // Build dots
  if (dots) {
    dots.innerHTML = [...cards].map((_,i) =>
      `<div class="carousel-dot${i===0?' active':''}" onclick="carouselGo(${i})"></div>`
    ).join('');
  }

  carouselUpdate();

  // Drag support — only attach once to prevent stacking
  if (!_carListenersSet) {
    _carListenersSet = true;
    document.addEventListener('mousedown', e => {
      const t = document.getElementById('carousel-track');
      if (!t || !t.contains(e.target)) return;
      _carDragX = e.clientX; _carDragging = true; t.classList.add('dragging');
    });
    document.addEventListener('touchstart', e => {
      const t = document.getElementById('carousel-track');
      if (!t || !t.contains(e.target)) return;
      _carDragX = e.touches[0].clientX; _carDragging = true;
    }, { passive: true });
    window.addEventListener('mouseup', e => {
      if (!_carDragging) return; _carDragging = false;
      const t = document.getElementById('carousel-track');
      if (t) t.classList.remove('dragging');
      const diff = _carDragX - e.clientX;
      if (Math.abs(diff) > 40) carouselMove(diff > 0 ? 1 : -1);
    });
    window.addEventListener('touchend', e => {
      if (!_carDragging) return; _carDragging = false;
      const diff = _carDragX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) carouselMove(diff > 0 ? 1 : -1);
    });
  }
}

function carouselMove(dir) {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  const cards = track.querySelectorAll('.track-card');
  _carIdx = Math.max(0, Math.min(_carIdx + dir, cards.length - 1));
  carouselUpdate();
}

function carouselGo(idx) {
  _carIdx = idx;
  carouselUpdate();
}

function carouselUpdate() {
  const track = document.getElementById('carousel-track');
  const dots  = document.getElementById('carousel-dots');
  if (!track) return;
  const cards = track.querySelectorAll('.track-card');
  const cardW = 300 + 16; // card width + gap
  const wrapW = track.parentElement?.clientWidth || 360;
  const offset = (wrapW / 2) - (cardW / 2) - (_carIdx * cardW);
  track.style.transform = `translateX(${offset}px)`;
  cards.forEach((c, i) => c.classList.toggle('carousel-active', i === _carIdx));
  if (dots) {
    dots.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === _carIdx));
  }
}

// ── Theme Toggle ──────────────────────────────────────────────────────────────
(function() {
  const STORAGE_KEY = 'reel-theme';
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');

  const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,40a8,8,0,0,0-5.66,2.34l-16,16a8,8,0,0,0,11.32,11.32l16-16A8,8,0,0,0,192,40ZM224,120H200a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16ZM40,120H16a8,8,0,0,0,0,16H40a8,8,0,0,0,0-16Zm169.66,66.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM128,200a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V208A8,8,0,0,0,128,200Z"/></svg>`;
  const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106.15,106.15,0,0,0,96,56a104.11,104.11,0,0,0,104,104,106.15,106.15,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"/></svg>`;

  function createToggle(id) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const btn = document.createElement('button');
    btn.id = id;
    btn.title = 'החלף מצב תצוגה';
    btn.innerHTML = isLight ? MOON_SVG : SUN_SVG;
    btn.addEventListener('click', function() {
      const nowLight = document.documentElement.getAttribute('data-theme') === 'light';
      const next = nowLight ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
      document.querySelectorAll('#theme-toggle, #theme-toggle-mob').forEach(function(b) {
        b.innerHTML = next === 'light' ? MOON_SVG : SUN_SVG;
      });
    });
    return btn;
  }

  function injectToggles() {
    if (!document.getElementById('theme-toggle')) {
      const topbar = document.querySelector('.topbar');
      if (topbar) topbar.appendChild(createToggle('theme-toggle'));
    }
    if (!document.getElementById('theme-toggle-mob')) {
      const mobBar = document.getElementById('mobile-topbar');
      if (mobBar) mobBar.appendChild(createToggle('theme-toggle-mob'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggles);
  } else {
    injectToggles();
  }
})();

// ══════ SCRIPT 2 (Enhancement IIFE) ══════

/* ── Enhancement JS: X-buttons, stat cards, view toggles, cal-zoom, upcoming ── */
(function(){
  var X_SVG='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" style="pointer-events:none"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>';

  function replaceX(root){
    (root||document).querySelectorAll('button,.file-rm').forEach(function(el){
      if(el.innerHTML.trim()==='✕') el.innerHTML=X_SVG;
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    /* 1 — ✕ → SVG X */
    replaceX();
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        m.addedNodes.forEach(function(n){ if(n.nodeType===1) replaceX(n); });
      });
    }).observe(document.body,{childList:true,subtree:true});

    /* 2 — Stat card navigation */
    var sc=document.querySelectorAll('.stat-card');
    if(sc[0]) sc[0].addEventListener('click',function(){ if(typeof goView==='function') goView('pipeline',null); });
    if(sc[1]) sc[1].addEventListener('click',function(){ if(typeof goView==='function') goView('pipeline',null); });
    if(sc[2]) sc[2].addEventListener('click',function(){ if(typeof goView==='function') goView('payments',null); });
    if(sc[3]) sc[3].addEventListener('click',function(){ if(typeof goView==='function') goView('payments',null); });

    /* 3 — View-toggle ⊞/☰ → SVG */
    var vtK=document.getElementById('vt-kanban');
    var vtL=document.getElementById('vt-list');
    if(vtK) vtK.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor"><path d="M200,24H56A16,16,0,0,0,40,40V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24ZM56,40h80v80H56Zm0,160V136h80v64Zm144,0H152V136h48Zm0-80H152V40h48Z"/></svg>';
    if(vtL) vtL.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></svg>';

    /* 4 — Calendar zoom bar */
    var calNav=document.querySelector('.cal-nav');
    if(calNav&&!document.getElementById('czbar')){
      var zb=document.createElement('div');
      zb.id='czbar'; zb.className='cal-zoom-bar';
      zb.innerHTML=
        '<button class="cal-zoom-btn" id="czout" title="הקטן"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.07a88.21,88.21,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Zm104,0a8,8,0,0,1-8,8H72a8,8,0,0,1,0-16h64A8,8,0,0,1,144,112Z"/></svg></button>'+
        '<span id="czlbl" style="font-size:10px;color:var(--muted2);min-width:30px;text-align:center;font-weight:600">100%</span>'+
        '<button class="cal-zoom-btn" id="czin" title="הגדל"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.07a88.21,88.21,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Zm104,0a8,8,0,0,1-8,8H120v16a8,8,0,0,1-16,0V120H88a8,8,0,0,1,0-16h16V88a8,8,0,0,1,16,0v16h16A8,8,0,0,1,144,112Z"/></svg></button>';
      calNav.appendChild(zb);
      var cg=document.getElementById('cal-grid'),cz=0,czL=['75%','100%','125%'];
      function applyZ(){ cg.classList.toggle('zoom-sm',cz===-1); cg.classList.toggle('zoom-lg',cz===1); document.getElementById('czlbl').textContent=czL[cz+1]; }
      document.getElementById('czout').addEventListener('click',function(){ if(cz>-1){cz--;applyZ();} });
      document.getElementById('czin').addEventListener('click',function(){ if(cz<1){cz++;applyZ();} });
    }

    /* 5 — Date-picker icons → Calendar SVG */
    var DP='<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor" style="vertical-align:middle;pointer-events:none"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24Z"/></svg>';
    document.querySelectorAll('.date-picker-icon').forEach(function(el){ el.innerHTML=DP; });

    /* 6 — Upcoming events: patch renderCalendar */
    if(typeof window.renderCalendar==='function'){
      var _rc=window.renderCalendar;
      window.renderCalendar=function(){ _rc.apply(this,arguments); _upcomingEvt(); };
    }
  });

  function _upcomingEvt(){
    var wrap=document.querySelector('.cal-wrap'); if(!wrap) return;
    var panel=document.getElementById('cal-upcoming');
    if(!panel){ panel=document.createElement('div'); panel.id='cal-upcoming'; wrap.appendChild(panel); }
    var today=new Date(); today.setHours(0,0,0,0);
    var limit=new Date(today); limit.setDate(limit.getDate()+30);
    var projs=typeof projects!=='undefined'?projects:[];
    var up=projs.filter(function(p){ if(!p.deadline) return false; var d=new Date(p.deadline); return d>=today&&d<=limit; }).sort(function(a,b){ return a.deadline<b.deadline?-1:1; });
    if(!up.length){ panel.innerHTML=''; return; }
    var mo=['ינ','פב','מרץ','אפ','מאי','יוני','יולי','אוג','ספ','אוק','נוב','דצ'];
    var _h=typeof h==='function'?h:function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); };
    var html='<div class="cal-upcoming-title">אירועים קרובים (30 יום)</div>';
    up.forEach(function(p){
      var d=new Date(p.deadline);
      var dl=Math.round((d-today)/86400000);
      var ds=dl===0?'היום':dl===1?'מחר':dl+' ימים';
      var col=dl===0?'var(--danger)':dl<=3?'var(--warn)':'var(--accent)';
      html+='<div class="cal-upcoming-item" onclick="if(typeof openEdit===\'function\')openEdit(\''+p.id+'\')">'+
        '<span class="cal-upcoming-dot" style="background:'+col+'"></span>'+
        '<span class="cal-upcoming-name">'+_h(p.name||'')+'</span>'+
        '<span style="color:var(--muted2);font-size:10px;margin-inline-start:auto;white-space:nowrap">'+d.getDate()+' '+mo[d.getMonth()]+' · '+ds+'</span>'+
        '</div>';
    });
    panel.innerHTML=html;
  }

  /* ── sc-status custom dropdown ── */
  var _SC_DEFS={
    draft:{lbl:'טיוטה',svg:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M163.31,100.69a16,16,0,0,0-22.63,0L72,169.37,56,224l54.63-16L178.69,140a16,16,0,0,0,0-22.63ZM92.37,214,68,221l7-24.33,77.37-77.38,17.37,17.37ZM168,128.69l-17.37-17.38,11.32-11.31,17.37,17.37ZM216,88H152a8,8,0,0,0,0,16h56V208H48V104H96a8,8,0,0,0,0-16H48A16,16,0,0,0,32,104V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104A16,16,0,0,0,216,88Z"/></svg>'},
    ready:{lbl:'מוכן לצילום',svg:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,182.49,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/></svg>'},
    filmed:{lbl:'צולם',svg:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M216,80H180.92L207.72,53.2a8,8,0,1,0-11.44-11.17l-35.88,36.72a8.07,8.07,0,0,1-1.15.88H147.3l10.08-28.22A8,8,0,0,0,142.38,43l-12.58,35.19a8.22,8.22,0,0,1-.55.88H115.3l10.08-28.22A8,8,0,0,0,110.38,43L97.8,78.19a8.22,8.22,0,0,1-.55.88H40A16,16,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A16,16,0,0,0,216,80Zm0,120H40V96H216Z"/></svg>'}
  };
  window.setScStatus=function(val){
    var h=document.getElementById('sc-status'); if(!h) return;
    h.value=val;
    var d=_SC_DEFS[val]||_SC_DEFS.draft;
    var lbl=document.getElementById('sc-status-label');
    if(lbl) lbl.innerHTML=d.svg+'<span style="margin-inline-start:3px">'+d.lbl+'</span>';
    var drop=document.getElementById('sc-status-drop');
    if(drop){ drop.classList.remove('open'); drop.querySelectorAll('.sc-status-opt').forEach(function(o){ o.classList.toggle('selected',o.getAttribute('data-val')===val); }); }
  };
  window.toggleScStatus=function(e){
    e.stopPropagation();
    var drop=document.getElementById('sc-status-drop'); if(!drop) return;
    var opening=!drop.classList.contains('open');
    drop.classList.toggle('open',opening);
    if(opening){
      document.addEventListener('click',function _cls(ev){
        var wrap=document.getElementById('sc-status-wrap');
        if(wrap&&!wrap.contains(ev.target)){ drop.classList.remove('open'); document.removeEventListener('click',_cls); }
      });
    }
  };
  /* init default label */
  document.addEventListener('DOMContentLoaded',function(){ if(typeof setScStatus==='function') setScStatus('draft'); });

  /* ── fpaid animated dropdown ── */
  var _FPAID_DEFS={
    unpaid:{lbl:'לא שולם',svg:'<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor" style="color:#ef4444"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a28,28,0,0,1-28,28v4a8,8,0,0,1-16,0v-4H112a8,8,0,0,1,0-16h32a12,12,0,0,0,0-24H112a28,28,0,0,1,0-56v-4a8,8,0,0,1,16,0v4h12a8,8,0,0,1,0,16H112a12,12,0,0,0,0,24h16A28,28,0,0,1,168,148Z"/></svg>'},
    partial:{lbl:'חלקי',svg:'<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor" style="color:#f59e0b"><path d="M232,128A104,104,0,1,1,128,24,104.13,104.13,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM88,128a40,40,0,1,1,40,40A40,40,0,0,1,88,128Z"/></svg>'},
    paid:{lbl:'שולם ✓',svg:'<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor" style="color:#22c55e"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.13,104.13,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>'}
  };
  window.setFpaid=function(val){
    var d=_FPAID_DEFS[val]||_FPAID_DEFS.unpaid;
    var h=document.getElementById('fpaid'); if(h) h.value=val;
    var lbl=document.getElementById('fpaid-label');
    if(lbl) lbl.innerHTML=d.svg+'<span style="margin-inline-start:4px">'+d.lbl+'</span>';
    var drop=document.getElementById('fpaid-drop');
    if(drop){ drop.classList.remove('open'); drop.querySelectorAll('.fpaid-opt').forEach(function(o){ o.classList.toggle('selected',o.getAttribute('data-val')===val); }); }
  };
  window.toggleFpaid=function(e){
    e.stopPropagation();
    var drop=document.getElementById('fpaid-drop'); if(!drop) return;
    var opening=!drop.classList.contains('open');
    drop.classList.toggle('open',opening);
    if(opening){
      document.addEventListener('click',function _cls2(ev){
        var wrap=document.getElementById('fpaid-wrap');
        if(wrap&&!wrap.contains(ev.target)){ drop.classList.remove('open'); document.removeEventListener('click',_cls2); }
      });
    }
  };
  document.addEventListener('DOMContentLoaded',function(){ if(typeof setFpaid==='function') setFpaid('unpaid'); });
})();
