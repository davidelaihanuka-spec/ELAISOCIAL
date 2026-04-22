(function initReelAppState(global) {
  const ns = global.REELApp = global.REELApp || {};

  const state = {
    canonical: {
      ownerId: null,
      clients: [],
      packages: [],
      projects: [],
      scripts: [],
      shootDays: [],
      tasks: [],
      paymentEntries: [],
      tracking: [],
      activity: [],
      archive: [],
      trash: [],
    },
    ui: {
      pipelineSort: global.localStorage.getItem('reel_pipeline_sort') || 'deadline-asc',
      bulkMode: false,
      bulkSelected: new Set(),
      calendarMode: global.localStorage.getItem('reel_calendar_mode') || 'month',
      onboardingDismissed: global.localStorage.getItem('reel_onboarding_dismissed') === '1',
      clientTab: 'overview',
      currentClientId: null,
      currentClientName: '',
      currentProjectId: null,
      currentView: global.document.querySelector('.main')?.getAttribute('data-view') || 'pipeline',
      viewHistory: [],
      syncStatus: 'idle',
    },

    replaceCanonical(nextState) {
      this.canonical = {
        ownerId: nextState.ownerId || null,
        clients: nextState.clients || [],
        packages: nextState.packages || [],
        projects: nextState.projects || [],
        scripts: nextState.scripts || [],
        shootDays: nextState.shootDays || [],
        tasks: nextState.tasks || [],
        paymentEntries: nextState.paymentEntries || [],
        tracking: nextState.tracking || [],
        activity: nextState.activity || [],
        archive: nextState.archive || [],
        trash: nextState.trash || [],
      };
      return this.canonical;
    },

    setSyncStatus(nextStatus) {
      this.ui.syncStatus = nextStatus;
      if (typeof ns.shell?.updateSyncChip === 'function') ns.shell.updateSyncChip(nextStatus);
    },

    setPipelineSort(nextSort) {
      this.ui.pipelineSort = nextSort;
      global.localStorage.setItem('reel_pipeline_sort', nextSort);
    },

    setCalendarMode(nextMode) {
      this.ui.calendarMode = nextMode;
      global.localStorage.setItem('reel_calendar_mode', nextMode);
    },

    setOnboardingDismissed(nextValue) {
      this.ui.onboardingDismissed = Boolean(nextValue);
      global.localStorage.setItem('reel_onboarding_dismissed', nextValue ? '1' : '0');
    },

    setClientTab(nextTab) {
      this.ui.clientTab = nextTab;
      if (typeof ns.shell?.applyClientTab === 'function') ns.shell.applyClientTab(nextTab);
    },

    setCurrentClient(nextId, nextName) {
      this.ui.currentClientId = nextId || null;
      this.ui.currentClientName = nextName || '';
    },

    setCurrentProject(nextId) {
      this.ui.currentProjectId = nextId || null;
    },

    setCurrentView(nextView) {
      this.ui.currentView = nextView || 'pipeline';
    },

    pushViewToHistory(nextView) {
      if (!nextView) return;
      const history = this.ui.viewHistory || [];
      if (history[history.length - 1] === nextView) return;
      this.ui.viewHistory = [...history, nextView].slice(-24);
    },

    popViewHistory() {
      const history = [...(this.ui.viewHistory || [])];
      const previous = history.pop() || null;
      this.ui.viewHistory = history;
      return previous;
    },

    clearViewHistory() {
      this.ui.viewHistory = [];
    },

    canGoBack() {
      return Boolean((this.ui.viewHistory || []).length);
    },

    clearBulkSelection() {
      this.ui.bulkSelected = new Set();
    },
  };

  ns.state = state;
})(window);
