
// ── PIPELINE ───────────────
function renderPipeline() {
  const fps = filteredProjects();
  const empty = document.getElementById('empty-pipeline');
  if (!fps.length) { empty.style.display=''; document.getElementById('kanban-grid').innerHTML=''; document.getElementById('list-grid').innerHTML=''; return; }
  empty.style.display='none';
  if (viewMode==='kanban') renderKanban(fps);
  else renderList(fps);
}

function renderKanban(list) {
  const grid = document.getElementById('kanban-grid');
  grid.innerHTML = Object.entries(STAGES).map(([key,stg]) => {
    const col = list.filter(p=>p.stage===key);
    const cards = col.map((p,i) => {
      const d=daysLeft(p.deadline);
      const dlc=dlClass(d); const dlt=dlText(d,p.deadline);
      const prog=p.progress||0;
      return `<div class="vcard${p.stage==='published'?' published':''}" draggable="true" data-id="${p.id}" style="--col-color:${stg.color}; animation-delay:${i*0.06}s; position:relative;" onclick="openEdit('${p.id}')">
        <div class="drag-handle" title="גרור">⠿⠿</div>
        <div class="vcard-thumb" style="background:linear-gradient(135deg,${stg.color}18,${stg.color}06);">
          ${TYPES[p.type]||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'}
        </div>
        <div class="vcard-client">
          <div class="client-dot" style="background:${ac(p.client)}"></div>
          ${h(p.client)}
        </div>
        <div class="vcard-name">${h(p.name)}</div>
        <div class="vcard-meta">
          ${deadlineBadge(p.deadline)}
          ${dlt?`<span class="vmeta-pill ${dlc}">${dlt}</span>`:''}
          ${p.price?`<span class="vmeta-pill ${p.paid==='paid'?'price':p.paid==='partial'?'':'unpaid'}">₪${Number(p.price).toLocaleString()}</span>`:''}
          ${(p.files&&p.files.length)?`<span class="file-badge">📎 ${p.files.length}</span>`:''}
        </div>
        <div class="vcard-progress" style="margin-top:${prog>0?8:0}px;">
          ${prog>0?`<div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div>`:''}
        </div>
      </div>`;
    }).join('');
    return `<div class="pipeline-col" style="--col-color:${stg.color}">
      <div class="col-header">
        <div class="col-dot" style="background:${stg.color}"></div>
        <div class="col-title">${STAGE_ICONS[stg.icon]||''} ${stg.label}</div>
        <div class="col-count">${col.length}</div>
      </div>
      <div class="col-cards" data-stage="${key}">${cards||''}</div>
    </div>`;
  }).join('');
  // Wire up drag & drop after DOM is updated
  initDragDrop();
}

function renderList(list) {
  const grid = document.getElementById('list-grid');
  if (!list.length) { grid.innerHTML=''; return; }
  grid.innerHTML = list.map((p,i) => {
    const stg=STAGES[p.stage]||{label:p.stage||'?',color:'#888888',icon:'',emoji:'❓'};
    const d=daysLeft(p.deadline); const dlt=dlText(d,p.deadline); const dlc=dlClass(d);
    const paidLabel = p.paid==='paid'?'שולם':p.paid==='partial'?'חלקי':'לא שולם';
    return `<div class="list-row${p.stage==='published'?' published':''}" style="animation-delay:${i*0.04}s" onclick="openEdit('${p.id}')">
      <div class="list-status-bar" style="background:${stg.color}"></div>
      <div class="list-type-icon">${TYPES[p.type]||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'}</div>
      <div class="list-info">
        <div class="list-name">${h(p.name)}</div>
        <div class="list-client">${h(p.client)}</div>
      </div>
      <div class="list-meta">
        <span class="list-stage-badge" style="background:${stg.color}18;color:${stg.color}">${stg.label}</span>
        ${dlt?`<span class="vmeta-pill ${dlc}">${dlt}</span>`:''}
      </div>
      <div class="progress-mini">
        <div class="progress-bar"><div class="progress-fill" style="width:${p.progress||0}%"></div></div>
        <div class="progress-pct">${p.progress||0}%</div>
      </div>
      <div class="list-price-paid">
        <div class="price-col">${p.price?'₪'+Number(p.price).toLocaleString():'-'}</div>
        <div class="paid-pill ${p.paid}">${paidLabel}</div>
      </div>
    </div>`;
  }).join('');
}

function toggleFileFolder(el) {
  const exp = document.getElementById('folder-expanded-files');
  if (!exp) return;
  const isOpen = exp.style.display !== 'none';
  exp.style.display = isOpen ? 'none' : 'flex';
  el.closest('.folder-item').style.transform = isOpen ? '' : 'translateY(-4px) scale(1.04)';
}

