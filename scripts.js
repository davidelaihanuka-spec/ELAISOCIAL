// ═══════════════════════════════════════════════════════════════
// SCRIPTS MODULE
// ═══════════════════════════════════════════════════════════════
let scriptsData = JSON.parse(localStorage.getItem('reel_scripts') || '[]');
window.scriptsData = scriptsData;
window.registerLegacyStore?.('scriptsData', () => scriptsData, (nextValue) => {
  scriptsData = Array.isArray(nextValue) ? nextValue : [];
  window.scriptsData = scriptsData;
  return scriptsData;
});
let _scEditId = null, _scFilter = 'all';
function _saveSC() { window.scriptsData = scriptsData; try { localStorage.setItem('reel_scripts', JSON.stringify(scriptsData)); } catch(e) { _storageErr(e); } }

const SC_ST = {
  draft:  { lbl:'טיוטה',        emoji:'📝', cls:'sc-draft'  },
  ready:  { lbl:'מוכן לצילום',  emoji:'✅', cls:'sc-ready'  },
  filmed: { lbl:'צולם',          emoji:'🎥', cls:'sc-filmed' },
};

function updateScriptBadge() {
  const n = scriptsData.filter(s=>s.status!=='filmed').length;
  ['nc-scripts','mob-scripts-badge'].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    el.textContent=n; el.style.display=n>0?'':'none';
  });
}

function setScriptFilter(f, el) {
  _scFilter=f;
  document.querySelectorAll('#view-scripts .filter-chip, #mob-subheader-scripts .filter-chip').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  renderScripts();
}

function renderScripts() {
  const list=document.getElementById('scripts-list');
  const empty=document.getElementById('empty-scripts');
  const months=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  const ord={draft:0,ready:1,filmed:2};
  let data=_scFilter==='all'?scriptsData:scriptsData.filter(s=>s.status===_scFilter);
  data=[...data].sort((a,b)=>(ord[a.status]||0)-(ord[b.status]||0)||(a.shootDate||'').localeCompare(b.shootDate||''));
  if(!data.length){list.innerHTML='';empty.style.display='';return;}
  empty.style.display='none';
  list.innerHTML=data.map((s,i)=>{
    const st=SC_ST[s.status]||SC_ST.draft;
    const ds=s.shootDate?(()=>{const[y,m,d]=s.shootDate.split('-').map(Number);return `${d} ${months[m-1]}`;})():'';
    const prev=(s.scene||s.voiceover||'').substring(0,120);
    return `<div class="script-card ${st.cls} al-hidden" onclick="openScriptEdit('${s.id}')">
      <div class="sc-head">
        <div class="sc-name">${s.title||'ללא כותרת'}</div>
        <span class="sc-badge ${st.cls}">${st.emoji} ${st.lbl}</span>
      </div>
      <div class="sc-meta">${s.client?`<span>🏢 ${s.client}</span>`:''} ${ds?`<span>📅 ${ds}</span>`:''}</div>
      ${prev?`<div class="sc-preview">${prev}${prev.length>=120?'...':''}</div>`:''}
    </div>`;
  }).join('');
  // AnimatedList — IntersectionObserver drives each card in/out
  _observeScriptCards();
}

function fillScriptClients(sel) {
  const hidden=document.getElementById('sc-client'); if(!hidden) return;
  hidden.value=sel||'';
  const lbl=document.getElementById('clp-label-sc-client');
  if(lbl){ lbl.textContent=sel||'בחר לקוח...'; lbl.style.color=sel?'':'var(--muted2)'; }
  _buildClPickerDropdown('sc-client', sel||'');
}

function openScriptModal(preClient, preDate) {
  _scEditId=null;
  document.getElementById('sc-modal-title').textContent='תסריט חדש';
  document.getElementById('sc-del-btn').style.display='none';
  const smb=document.getElementById('sc-save-more-btn'); if(smb) smb.style.display='';
  ['sc-title','sc-scene','sc-voiceover','sc-camera','sc-edit-notes'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(typeof setScStatus==='function') setScStatus('draft'); else document.getElementById('sc-status').value='draft';
  document.getElementById('sc-shoot-date').value=preDate||'';
  fillScriptClients(preClient||'');
  document.getElementById('overlay-script').classList.add('open');
}

function openScriptEdit(id) {
  const s=scriptsData.find(x=>x.id===id); if(!s) return;
  _scEditId=id;
  document.getElementById('sc-modal-title').textContent='עריכת תסריט';
  document.getElementById('sc-del-btn').style.display='';
  const smb=document.getElementById('sc-save-more-btn'); if(smb) smb.style.display='none';
  document.getElementById('sc-title').value=s.title||'';
  document.getElementById('sc-scene').value=s.scene||'';
  document.getElementById('sc-voiceover').value=s.voiceover||'';
  document.getElementById('sc-camera').value=s.camera||'';
  document.getElementById('sc-edit-notes').value=s.editNotes||'';
  if(typeof setScStatus==='function') setScStatus(s.status||'draft'); else document.getElementById('sc-status').value=s.status||'draft';
  document.getElementById('sc-shoot-date').value=s.shootDate||'';
  fillScriptClients(s.client||'');
  document.getElementById('overlay-script').classList.add('open');
}

function closeScriptModal() { document.getElementById('overlay-script').classList.remove('open'); }

function _collectAndSaveScript() {
  const title=document.getElementById('sc-title').value.trim();
  if(!title){toast('⚠️ נא להזין כותרת');return false;}
  const d={
    title, client:document.getElementById('sc-client').value,
    status:document.getElementById('sc-status').value,
    shootDate:document.getElementById('sc-shoot-date').value,
    scene:document.getElementById('sc-scene').value.trim(),
    voiceover:document.getElementById('sc-voiceover').value.trim(),
    camera:document.getElementById('sc-camera').value.trim(),
    editNotes:document.getElementById('sc-edit-notes').value.trim(),
  };
  if(_scEditId){
    const i=scriptsData.findIndex(s=>s.id===_scEditId);
    scriptsData[i]={...scriptsData[i],...d};
  } else {
    scriptsData.push({id:Date.now().toString(),createdAt:Date.now(),...d});
  }
  _saveSC(); renderScripts(); renderCalendar(); updateScriptBadge();
  return true;
}

function saveScript() {
  const isEdit=!!_scEditId;
  if(!_collectAndSaveScript()) return;
  toast(isEdit?'✏️ תסריט עודכן!':'✅ תסריט נוסף!');
  closeScriptModal();
}

function saveScriptAndAddMore() {
  if(!_collectAndSaveScript()) return;
  toast('✅ תסריט נשמר — הוסף עוד');
  _scEditId=null;
  ['sc-title','sc-scene','sc-voiceover','sc-camera','sc-edit-notes'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  document.getElementById('sc-title').focus();
}

function deleteScript() {
  if(!_scEditId) return;
  scriptsData=scriptsData.filter(s=>s.id!==_scEditId);
  _saveSC(); closeScriptModal(); renderScripts(); renderCalendar(); updateScriptBadge();
  toast('🗑️ תסריט נמחק');
}


// ═══════════════════════════════════════════════════════════════
// ANIMATED LIST — IntersectionObserver for scripts
// ═══════════════════════════════════════════════════════════════
let _scObserver = null;

function _observeScriptCards() {
  // Disconnect previous observer
  if (_scObserver) _scObserver.disconnect();

  const cards = document.querySelectorAll('#scripts-list .script-card');
  if (!cards.length) return;

  _scObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(cards).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.remove('al-hidden');
          entry.target.classList.add('al-visible');
        }, Math.min(idx * 55, 320));
      } else {
        entry.target.classList.remove('al-visible');
        entry.target.classList.add('al-hidden');
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px 0px 0px'
  });

  cards.forEach(card => _scObserver.observe(card));
}

