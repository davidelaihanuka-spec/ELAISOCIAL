// ── CALENDAR ───────────────
function renderCalendar() {
  const months=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  const dnames=['א','ב','ג','ד','ה','ו','ש'];
  document.getElementById('cal-title').textContent=`${months[calM]} ${calY}`;
  const grid=document.getElementById('cal-grid');
  let html=dnames.map(d=>`<div class="cal-header">${d}</div>`).join('');
  const first=new Date(calY,calM,1).getDay();
  const total=new Date(calY,calM+1,0).getDate();
  const today=new Date();
  for(let i=0;i<first;i++) html+='<div></div>';
  for(let d=1;d<=total;d++){
    const isToday=d===today.getDate()&&calM===today.getMonth()&&calY===today.getFullYear();
    const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const evs=projects.filter(p=>p.deadline===ds);
    html+=`<div class="cal-day${isToday?' today':''}" onclick="calDayClick('${ds}', event)" style="cursor:pointer;">
      <div class="cal-day-num">${d}</div>
      ${evs.map(p=>`<div class="cal-event" onclick="openProjectWorkspace('${p.id}')" title="${h(p.name)}">${TYPES[p.type]||'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/></svg>'} ${h(p.name)}</div>`).join('')}
      ${(typeof scriptsData!=='undefined'&&scriptsData.filter(s=>s.shootDate===ds).length)?`<div style="margin-top:2px"><span class="cal-script-dot"></span><span style="font-size:8px;color:var(--success);font-weight:700"> ${scriptsData.filter(s=>s.shootDate===ds).length} תסריט</span></div>`:''}
      <div class="cal-add-hint">＋</div>
    </div>`;
  }
  grid.innerHTML=html;
}

function calDayClick(dateStr, e) {
  if (e.target.classList.contains('cal-event') || e.target.closest('.cal-event')) return;
  openSDP(dateStr);
}
function calPrev(){calM--;if(calM<0){calM=11;calY--;}renderCalendar();}
function calNext(){calM++;if(calM>11){calM=0;calY++;}renderCalendar();}

