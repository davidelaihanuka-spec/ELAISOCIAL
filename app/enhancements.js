(function initReelEnhancements(global) {
  const ns = global.REELApp = global.REELApp || {};
  let pipelineUiBound = false;
  let isNavigatingBack = false;
  const STAGE_ORDER = { script: 1, filming: 2, editing: 3, approval: 4, published: 5 };

  function getPipelineFilter() {
    return ns.state.ui.activePipelineFilter || global.localStorage.getItem('reel_active_filter') || 'all';
  }

  function getDeadlineTime(value, fallback) {
    if (!value) return fallback;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? fallback : time;
  }

  function comparePipelineItems(a, b, sort) {
    if (sort === 'deadline-desc') return getDeadlineTime(b.deadline, -Infinity) - getDeadlineTime(a.deadline, -Infinity);
    if (sort === 'price-desc') return (+b.price || 0) - (+a.price || 0);
    if (sort === 'client-asc') return String(a.client || '').localeCompare(String(b.client || ''), 'he');
    if (sort === 'stage-asc') return (STAGE_ORDER[a.stage] || 99) - (STAGE_ORDER[b.stage] || 99);
    return getDeadlineTime(a.deadline, Infinity) - getDeadlineTime(b.deadline, Infinity);
  }

  function sortPipelineItems(items) {
    return [...(items || [])].sort((a, b) => comparePipelineItems(a, b, ns.state.ui.pipelineSort));
  }

  function getLegacyArrayStore(name) {
    if (typeof global.getLegacyStoreValue === 'function') {
      const value = global.getLegacyStoreValue(name, []);
      if (Array.isArray(value)) return value;
    } else if (Array.isArray(global[name])) {
      return global[name];
    }
    return [];
  }

  function setLegacyArrayStore(name, value) {
    if (typeof global.setLegacyStoreValue === 'function') {
      global.setLegacyStoreValue(name, value);
      return;
    }
    global[name] = value;
  }

  function installPipelineEnhancements() {
    ns.shell.ensurePipelineToolbar();
    ns.state.ui.activePipelineFilter = getPipelineFilter();
    const originalSetFilter = global.setFilter;
    if (typeof originalSetFilter === 'function' && !originalSetFilter.__enhanced) {
      global.setFilter = function setFilterEnhanced(filter, element) {
        ns.state.ui.activePipelineFilter = filter;
        global.localStorage.setItem('reel_active_filter', filter);
        originalSetFilter.call(this, filter, element);
      };
      global.setFilter.__enhanced = true;
    }
    const originalFilteredProjects = global.filteredProjects;
    if (typeof originalFilteredProjects === 'function' && !originalFilteredProjects.__enhanced) {
      global.filteredProjects = function filteredProjectsEnhanced() {
        let items = originalFilteredProjects.call(this);
        const activeFilter = getPipelineFilter();
        if (activeFilter === 'today') items = items.filter((project) => ns.dashboard.daysUntil(project.deadline) === 0);
        if (activeFilter === 'waiting') items = items.filter((project) => project.stage === 'approval');
        if (activeFilter === 'unpaid') items = items.filter((project) => project.paid !== 'paid');
        return sortPipelineItems(items);
      };
      global.filteredProjects.__enhanced = true;
    }
    const originalRenderPipeline = global.renderPipeline;
    if (typeof originalRenderPipeline === 'function' && !originalRenderPipeline.__enhanced) {
      global.renderPipeline = function renderPipelineEnhanced() {
        const result = originalRenderPipeline.apply(this, arguments);
        decoratePipelineForBulk();
        updateBulkBar();
        return result;
      };
      global.renderPipeline.__enhanced = true;
    }
    bindPipelineUi();
  }

  function installNavigationEnhancements() {
    const originalGoView = global.goView;
    if (typeof originalGoView === 'function' && !originalGoView.__dashboardEnhanced) {
      global.goView = function goViewEnhanced(view, el) {
        originalGoView.call(this, view, el);
        if (view === 'dashboard') {
          document.getElementById('view-title').textContent = 'דשבורד';
          const mobileTitle = document.getElementById('mob-view-title');
          if (mobileTitle) mobileTitle.textContent = 'דשבורד';
          ns.dashboard.render();
        }
      };
      global.goView.__dashboardEnhanced = true;
    }
  }

  function bindPipelineUi() {
    if (pipelineUiBound) return;
    pipelineUiBound = true;
    const sortSelect = global.document.getElementById('pipeline-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (event) => {
        ns.state.setPipelineSort(event.target.value);
        global.renderPipeline?.();
      });
    }
    global.document.getElementById('bulk-toggle-btn')?.addEventListener('click', () => {
      ns.state.ui.bulkMode = !ns.state.ui.bulkMode;
      if (!ns.state.ui.bulkMode) ns.state.clearBulkSelection();
      global.renderPipeline?.();
    });
    global.document.getElementById('bulk-waiting-btn')?.addEventListener('click', () => applyBulkStage('approval'));
    global.document.getElementById('bulk-published-btn')?.addEventListener('click', () => applyBulkStage('published'));
    global.document.getElementById('bulk-delete-btn')?.addEventListener('click', deleteBulkSelection);
    global.document.getElementById('bulk-archive-btn')?.addEventListener('click', () => {
      [...ns.state.ui.bulkSelected].forEach((id) => global.archiveProject?.(id));
      ns.state.ui.bulkMode = false;
      ns.state.clearBulkSelection();
      global.renderPipeline?.();
    });
  }

  function toggleBulkSelection(id) {
    if (!id) return;
    if (ns.state.ui.bulkSelected.has(id)) ns.state.ui.bulkSelected.delete(id);
    else ns.state.ui.bulkSelected.add(id);
    decoratePipelineForBulk();
    updateBulkBar();
  }

  function moveProjectsToTrash(ids) {
    const selectedIds = new Set(ids || []);
    const projectsStore = getLegacyArrayStore('projects');
    const trashStore = getLegacyArrayStore('trashData');
    const items = projectsStore.filter((project) => selectedIds.has(project.id));
    if (!items.length) return;
    const nextTrash = [...trashStore];
    items.forEach((project) => {
      nextTrash.push({
        ...project,
        trashType: 'project',
        deletedAt: Date.now(),
      });
      global.logActivity?.('delete', '🗑️', 'פרויקט הועבר לפח', project.name, project.client);
    });
    setLegacyArrayStore('trashData', nextTrash);
    setLegacyArrayStore('projects', projectsStore.filter((project) => !selectedIds.has(project.id)));
    global.save?.();
    global._saveTrash?.();
    global.renderTrash?.();
    global.updateTrashBadge?.();
    global.renderCalendar?.();
    global.updateStats?.();
    global.syncAll?.();
  }

  function deleteBulkSelection() {
    const ids = [...ns.state.ui.bulkSelected];
    if (!ids.length) {
      global.toast?.('בחר פרויקט אחד לפחות');
      return;
    }
    global.showConfirm?.({
      icon: '🗑️',
      title: 'העברה לפח',
      msg: `${ids.length} פרויקטים יועברו לפח וניתן יהיה לשחזר אותם משם.`,
      okText: 'העבר לפח',
      okClass: 'danger',
      cancelText: 'ביטול',
    }, () => {
      moveProjectsToTrash(ids);
      ns.state.ui.bulkMode = false;
      ns.state.clearBulkSelection();
      global.renderPipeline?.();
      global.toast?.('🗑️ הפרויקטים הועברו לפח');
    });
  }

  function decoratePipelineForBulk() {
    const enabled = ns.state.ui.bulkMode;
    const selected = ns.state.ui.bulkSelected;
    global.document.querySelectorAll('.vcard, .list-row').forEach((card) => {
      const id = card.dataset.id || card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      if (!id) return;
      card.classList.toggle('bulk-mode', enabled);
      card.classList.toggle('bulk-selected', selected.has(id));
      if (card.classList.contains('vcard')) {
        card.setAttribute('draggable', enabled ? 'false' : 'true');
      }
      if (!card.dataset.bulkBound) {
        card.dataset.bulkBound = '1';
        card.addEventListener('click', (event) => {
          if (!ns.state.ui.bulkMode) return;
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          toggleBulkSelection(id);
        }, true);
      }
      let toggle = card.querySelector('.bulk-select-toggle');
      if (!enabled) {
        if (toggle) toggle.remove();
        return;
      }
      if (!toggle) {
        toggle = global.document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'bulk-select-toggle';
        toggle.textContent = '✓';
        toggle.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleBulkSelection(id);
        });
        card.prepend(toggle);
      }
    });
  }

  function updateBulkBar() {
    const bar = global.document.getElementById('pipeline-bulkbar');
    const label = global.document.getElementById('bulk-count-label');
    const toggle = global.document.getElementById('bulk-toggle-btn');
    if (!bar || !label) return;
    bar.style.display = ns.state.ui.bulkMode ? 'flex' : 'none';
    label.textContent = `${ns.state.ui.bulkSelected.size} נבחרו`;
    if (toggle) toggle.textContent = ns.state.ui.bulkMode ? 'סיום בחירה' : 'בחירה מרובה';
    global.document.querySelectorAll('#pipeline-bulkbar .bulk-action-btn').forEach((button) => {
      button.disabled = ns.state.ui.bulkSelected.size === 0;
    });
  }

  function applyBulkStage(stage) {
    const projectsStore = getLegacyArrayStore('projects');
    projectsStore.forEach((project) => {
      if (ns.state.ui.bulkSelected.has(project.id)) {
        project.stage = stage;
        project.progress = global.stageToProgress ? global.stageToProgress(stage) : project.progress;
      }
    });
    setLegacyArrayStore('projects', [...projectsStore]);
    global.save?.();
    ns.state.clearBulkSelection();
    global.renderPipeline?.();
    global.updateStats?.();
  }

  function installClientWorkspaceEnhancements() {
    const originalOpenClientPanel = global.openClientPanel;
    if (typeof originalOpenClientPanel === 'function' && !originalOpenClientPanel.__enhanced) {
      global.openClientPanel = function openClientPanelEnhanced(name) {
        originalOpenClientPanel.call(this, name);
        const pkgSection = global.document.getElementById('cp-package-section');
        const noPkgSection = global.document.getElementById('cp-nopackage-section');
        if (pkgSection) pkgSection.dataset.forceHidden = pkgSection.style.display === 'none' ? '1' : '0';
        if (noPkgSection) noPkgSection.dataset.forceHidden = noPkgSection.style.display === 'none' ? '1' : '0';
        ns.shell.renderClientPaymentSummary(name);
        ns.state.setClientTab(ns.state.ui.clientTab || 'overview');
      };
      global.openClientPanel.__enhanced = true;
    }
    global.document.querySelectorAll('.client-tab').forEach((tab) => {
      if (tab.dataset.bound) return;
      tab.dataset.bound = '1';
      tab.addEventListener('click', () => ns.state.setClientTab(tab.dataset.clientTab));
    });
    const paymentsButton = global.document.getElementById('cp-open-payments-btn');
    if (paymentsButton && !paymentsButton.dataset.bound) {
      paymentsButton.dataset.bound = '1';
      paymentsButton.addEventListener('click', () => {
        if (!global.activeClientName) return;
        global.closeClientPanel?.();
        global.goView?.('payments');
        global.setTimeout(() => global.openPayDetail?.(global.activeClientName), 120);
      });
    }
  }

  function installExtendedNavigationEnhancements() {
    installNavigationEnhancements();
    const originalGoView = global.goView;
    if (typeof originalGoView !== 'function' || originalGoView.__extendedNavigation) return;
    global.goBack = function goBack() {
      const previousView = ns.state?.popViewHistory?.();
      if (!previousView) return;
      isNavigatingBack = true;
      global.goView(previousView);
    };
    global.goView = function goViewExtended(view, el) {
      const previousView = ns.state?.ui?.currentView || global.document.querySelector('.main')?.getAttribute('data-view') || 'pipeline';
      if (!isNavigatingBack && previousView && view && previousView !== view) {
        ns.state?.pushViewToHistory?.(previousView);
      }
      originalGoView.call(this, view, el);
      ns.state?.setCurrentView?.(view);
      const titles = {
        dashboard: 'דשבורד',
        'client-workspace': 'לקוח',
        inbox: 'Inbox',
        onboarding: 'התחלה',
        tasks: 'משימות',
        receipts: 'קבלות',
        ledger: 'Ledger',
        insights: 'תובנות',
        'project-workspace': 'פרויקט',
        settings: 'הגדרות',
      };
      const subtitles = {
        dashboard: 'מה דורש טיפול עכשיו, מה מתקרב ומה עדיין פתוח',
        'client-workspace': 'תמונת מצב של הלקוח, הפרויקטים, התשלומים והצעדים הבאים',
        inbox: 'מרכז אחד לאיחורים, תשלומים פתוחים, המתנות ללקוח ופעולות המשך',
        onboarding: 'מסך התחלה מודרך לחיבור, ייבוא מידע, לקוח ראשון ופרויקט ראשון',
        tasks: 'שכבת המעקב התפעולית של העבודה: משימות פתוחות, איחורים והשלמות',
        receipts: 'מרכז אחד לאסמכתאות חסרות, קבלות מוכנות לשליחה וקבלות שסומנו כנשלחו',
        ledger: 'כל תנועות הכסף של פרויקטים וחבילות במסך אחד',
        insights: 'הכנסות, ביצועים, לקוחות מובילים וצווארי בקבוק',
        'project-workspace': 'סביבת עבודה מלאה לפרויקט אחד במקום לפתוח רק חלון עריכה',
        settings: 'חיבור, גיבוי, סנכרון ותחזוקת המערכת',
      };
      if (titles[view]) {
        global.document.getElementById('view-title').textContent = titles[view];
        const mobileTitle = global.document.getElementById('mob-view-title');
        if (mobileTitle) mobileTitle.textContent = titles[view];
        const subtitle = global.document.getElementById('view-subtitle');
        if (subtitle) {
          subtitle.textContent = subtitles[view] || '';
          subtitle.style.display = subtitles[view] ? '' : 'none';
        }
      }
      if (view === 'dashboard') ns.dashboard.render();
      if (view === 'client-workspace') ns.clientWorkspaceView?.render?.();
      if (view === 'inbox') ns.inboxView?.render?.();
      if (view === 'onboarding') ns.onboarding?.render?.();
      if (view === 'tasks') ns.tasksView?.render?.();
      if (view === 'receipts') ns.receiptsView?.render?.();
      if (view === 'ledger') ns.ledgerView?.render?.();
      if (view === 'insights') ns.insights?.render?.();
      if (view === 'project-workspace') ns.projectWorkspaceView?.render?.();
      if (view === 'settings') ns.settings?.render?.();
      ns.shell?.updateBackButton?.(ns.state?.canGoBack?.());
      isNavigatingBack = false;
    };
    global.goView.__extendedNavigation = true;
  }

  ns.enhancements = {
    installPipelineEnhancements,
    installClientWorkspaceEnhancements,
    installNavigationEnhancements: installExtendedNavigationEnhancements,
    sortPipelineItems,
  };
})(window);
