(function initReelInsights(global) {
  const ns = global.REELApp = global.REELApp || {};

  function currency(value) {
    return `₪${(+value || 0).toLocaleString('he-IL')}`;
  }

  function pct(part, total) {
    if (!total) return 0;
    return Math.max(6, Math.round((part / total) * 100));
  }

  function sumProjectPaid(project) {
    if (typeof global.getProjectPaid === 'function') return +global.getProjectPaid(project) || 0;
    return +(project?.paidAmount || 0);
  }

  function renderBarRows(items, emptyText, tone) {
    if (!items.length) return `<div class="insight-empty">${emptyText}</div>`;
    const maxValue = Math.max(...items.map((item) => item.value || 0), 1);
    return items.map((item) => `
      <div class="insight-bar-row">
        <div class="insight-bar-head">
          <strong>${item.label}</strong>
          <span>${item.display || item.value}</span>
        </div>
        <div class="insight-bar-track">
          <span class="insight-bar-fill ${tone || ''}" style="width:${pct(item.value, maxValue)}%"></span>
        </div>
        ${item.meta ? `<small>${item.meta}</small>` : ''}
      </div>
    `).join('');
  }

  function renderMetricCard(label, value, hint) {
    return `<div class="insight-stat">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </div>`;
  }

  function render() {
    const root = global.document.getElementById('insights-grid');
    if (!root) return;

    const projects = global.projects || [];
    const clientMap = global.clientData || {};
    const tracking = global.trackingData || [];
    const shootDays = global.shootDaysData || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalPotential = projects.reduce((sum, project) => sum + (+project.price || 0), 0);
    const totalPaid = projects.reduce((sum, project) => sum + sumProjectPaid(project), 0);
    const totalUnpaid = Math.max(0, totalPotential - totalPaid);
    const activeClients = Object.keys(clientMap).length || new Set(projects.map((project) => project.client).filter(Boolean)).size;
    const overdueProjects = projects.filter((project) => {
      if (!project.deadline || project.stage === 'published') return false;
      const deadline = new Date(project.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline < today;
    }).length;
    const upcomingShootDays = shootDays.filter((item) => {
      if (!item.date) return false;
      const date = new Date(item.date);
      date.setHours(0, 0, 0, 0);
      return date >= today;
    }).length;

    const stageOrder = ['script', 'filming', 'editing', 'approval', 'published'];
    const stageRows = stageOrder.map((stage) => {
      const count = projects.filter((project) => project.stage === stage).length;
      return {
        label: global.STAGES?.[stage]?.label || stage,
        value: count,
        display: `${count} פרויקטים`,
      };
    }).filter((item) => item.value > 0);

    const clientRows = Object.keys(clientMap).map((name) => {
      const clientProjects = projects.filter((project) => project.client === name);
      const revenue = clientProjects.reduce((sum, project) => sum + (+project.price || 0), 0);
      return {
        label: name,
        value: revenue,
        display: currency(revenue),
        meta: `${clientProjects.length} פרויקטים`,
      };
    }).sort((a, b) => b.value - a.value).slice(0, 6);

    const platformMap = {};
    tracking.forEach((entry) => {
      const key = entry.platform || 'other';
      if (!platformMap[key]) platformMap[key] = { views: 0, engagements: 0, count: 0 };
      platformMap[key].views += +entry.views || 0;
      platformMap[key].engagements += (+entry.likes || 0) + (+entry.comments || 0) + (+entry.shares || 0) + (+entry.saves || 0);
      platformMap[key].count += 1;
    });
    const platformRows = Object.entries(platformMap).map(([platform, stats]) => ({
      label: platform,
      value: stats.views,
      display: `${(stats.views || 0).toLocaleString('he-IL')} צפיות`,
      meta: `${(stats.engagements || 0).toLocaleString('he-IL')} אינטראקציות · ${stats.count} רשומות`,
    })).sort((a, b) => b.value - a.value);

    const deliveryRows = [
      { label: 'דדליינים באיחור', value: overdueProjects, display: `${overdueProjects} פרויקטים` },
      { label: 'ימי צילום קרובים', value: upcomingShootDays, display: `${upcomingShootDays} ימים` },
      { label: 'שולם במלואו', value: projects.filter((project) => project.paid === 'paid').length, display: `${projects.filter((project) => project.paid === 'paid').length} פרויקטים` },
      { label: 'ממתין ללקוח', value: projects.filter((project) => project.stage === 'approval').length, display: `${projects.filter((project) => project.stage === 'approval').length} פרויקטים` },
    ].filter((item) => item.value > 0);

    root.innerHTML = `
      <section class="insights-hero">
        <div class="insights-hero-copy">
          <div class="dash-eyebrow">Insights</div>
          <h2>להבין מה עובד, מה תקוע, ואיפה הכסף</h2>
          <p>תצוגת תובנות ראשונה שמרכזת הכנסות, מצב הפקה, לקוחות מובילים וביצועי תוכן בלי לעבור ידנית בין כמה מסכים.</p>
        </div>
        <div class="insights-stats">
          ${renderMetricCard('פוטנציאל הכנסה', currency(totalPotential), 'סך כל שווי הפרויקטים')}
          ${renderMetricCard('שולם בפועל', currency(totalPaid), 'כולל תשלומי פרויקטים וחבילות')}
          ${renderMetricCard('עדיין פתוח', currency(totalUnpaid), 'סכום שעדיין לא הושלם')}
          ${renderMetricCard('לקוחות פעילים', activeClients, 'לקוחות עם נתונים או פרויקטים')}
        </div>
      </section>
      <div class="insight-panels">
        <section class="insight-panel">
          <div class="insight-panel-head">
            <h3>פיזור שלבים</h3>
            <span>איפה העבודה נמצאת עכשיו</span>
          </div>
          <div class="insight-bar-list">
            ${renderBarRows(stageRows, 'עדיין אין פרויקטים להצגה.', 'accent')}
          </div>
        </section>
        <section class="insight-panel">
          <div class="insight-panel-head">
            <h3>לקוחות מובילים</h3>
            <span>לפי שווי פרויקטים</span>
          </div>
          <div class="insight-bar-list">
            ${renderBarRows(clientRows, 'הוסף לקוחות ופרויקטים כדי לראות דירוג.', 'success')}
          </div>
        </section>
        <section class="insight-panel">
          <div class="insight-panel-head">
            <h3>ביצועים לפי פלטפורמה</h3>
            <span>מבוסס על רשומות המעקב</span>
          </div>
          <div class="insight-bar-list">
            ${renderBarRows(platformRows, 'עדיין אין מספיק נתוני מעקב.', 'info')}
          </div>
        </section>
        <section class="insight-panel">
          <div class="insight-panel-head">
            <h3>בריאות תפעולית</h3>
            <span>מה דורש תשומת לב</span>
          </div>
          <div class="insight-bar-list">
            ${renderBarRows(deliveryRows, 'אין כרגע נקודות לחץ בולטות.', 'warning')}
          </div>
        </section>
      </div>
    `;
  }

  ns.insights = { render };
})(window);
