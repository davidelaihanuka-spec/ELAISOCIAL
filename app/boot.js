(function bootReelCloud(global) {
  const ns = global.REELApp = global.REELApp || {};

  async function saveConfigAndSwitchToLogin() {
    const url = document.getElementById('supabase-url-input').value.trim();
    const anonKey = document.getElementById('supabase-key-input').value.trim();
    const bucket = document.getElementById('supabase-bucket-input').value.trim() || 'reel-files';
    if (!url || !anonKey) {
      ns.shell.showStatus('×™×© ×œ×ž×œ× URL ×•×ž×¤×ª×— anon.', 'error');
      return;
    }
    try {
      ns.config.save({ url, anonKey, bucket });
      await ns.supabase.init();
      ns.shell.showStatus('×”×—×™×‘×•×¨ × ×©×ž×¨. ××¤×©×¨ ×œ×”×ª×—×‘×¨.', 'success');
      ns.shell.showLoginMode();
      ns.state.setSyncStatus('auth');
    } catch (error) {
      ns.shell.showStatus(error.message || '×”×—×™×‘×•×¨ ×œ-Supabase × ×›×©×œ.', 'error');
    }
  }

  async function signIn(isSignUp) {
    const email = document.getElementById('auth-email-input').value.trim();
    const password = document.getElementById('auth-password-input').value;
    if (!email || !password) {
      ns.shell.showStatus('×™×© ×œ×ž×œ× ××™×ž×™×™×œ ×•×¡×™×¡×ž×”.', 'error');
      return;
    }
    ns.shell.showStatus('×ž×‘×¦×¢ ×”×ª×—×‘×¨×•×ª...', 'neutral');
    try {
      await ns.supabase.init();
      if (isSignUp) await ns.repository.auth.signUp(email, password);
      else await ns.repository.auth.signIn(email, password);
      await unlockAndLoad();
      ns.shell.showStatus('', 'neutral');
    } catch (error) {
      ns.shell.showStatus(error.message || '×”×ª×—×‘×¨×•×ª × ×›×©×œ×”.', 'error');
    }
  }

  async function unlockAndLoad() {
    ns.state.setSyncStatus('loading');
    await ns.bridge.loadInitialState();
    bindPostAuthUi();
    document.body.classList.add('reel-ready');
    document.getElementById('reel-auth-overlay').classList.add('hidden');
    ns.dashboard.render();
    ns.state.clearViewHistory();
    ns.state.setCurrentView('dashboard');
    ns.shell.updateBackButton(false);
    const savedFilter = global.localStorage.getItem('reel_active_filter');
    if (savedFilter) global.activeFilter = savedFilter;
    if (ns.onboarding?.shouldAutoOpen?.()) {
      global.goView?.('onboarding');
      ns.onboarding?.render?.();
    } else {
      global.goView?.('dashboard');
    }
    ns.state.setSyncStatus('idle');
    const session = await ns.repository.auth.getSession();
    ns.shell.updateAuthButton(session);
  }

  async function checkSessionAndStart() {
    ns.bridge.installPersistencePatches();
    ns.bridge.installShootDayPatches();
    ns.bridge.installSearchPatch();
    ns.search.bind();

    if (ns.devMode?.isEnabled?.()) {
      ns.devMode.activate();
      bindPostAuthUi();
      document.body.classList.add('reel-ready');
      document.getElementById('reel-auth-overlay')?.classList.add('hidden');
      ns.state.setSyncStatus('idle');
      ns.shell.updateAuthButton({ user: { email: 'Demo mode' } });
      ns.dashboard.render();
      ns.state.clearViewHistory();
      ns.state.setCurrentView('dashboard');
      ns.shell.updateBackButton(false);
      global.goView?.('dashboard');
      return;
    }

    if (!ns.config.isConfigured()) {
      if (ns.config.canConfigureInApp()) ns.shell.showSetupMode();
      else ns.shell.showHostedConfigMissingMode();
      ns.state.setSyncStatus('setup');
      return;
    }

    try {
      await ns.supabase.init();
      const session = await ns.repository.auth.getSession();
      if (!session) {
        ns.shell.showLoginMode();
        ns.state.setSyncStatus('auth');
        return;
      }
      await unlockAndLoad();
    } catch (error) {
      console.error(error);
      if (ns.config.canConfigureInApp()) {
        ns.shell.showSetupMode();
        ns.shell.showStatus(error.message || 'Failed to load the Supabase connection.', 'error');
      } else {
        ns.shell.showHostedConfigMissingMode(error.message || 'Hosted runtime config is missing or invalid.');
      }
      ns.state.setSyncStatus('setup');
    }
  }

  function bindPostAuthUi() {
    ns.clientModel?.normalizeAll?.();
    ns.ledger?.patchLegacyPaymentsView?.();
    ns.enhancements.installPipelineEnhancements();
    ns.enhancements.installClientWorkspaceEnhancements();
    ns.calendarAgenda.ensureAgendaShell();
    ns.calendarAgenda.applyCalendarMode();

    document.querySelectorAll('[data-calendar-mode]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = '1';
      button.addEventListener('click', () => {
        ns.state.setCalendarMode(button.dataset.calendarMode);
        ns.calendarAgenda.applyCalendarMode();
      });
    });

    const authButton = document.getElementById('auth-status-btn');
    if (authButton && !authButton.dataset.bound) {
      authButton.dataset.bound = '1';
      authButton.addEventListener('click', async () => {
        await ns.repository.auth.signOut();
        document.body.classList.remove('reel-ready');
        document.getElementById('reel-auth-overlay').classList.remove('hidden');
        ns.state.clearViewHistory();
        ns.state.setCurrentView('pipeline');
        ns.shell.updateBackButton(false);
        ns.shell.showLoginMode();
        ns.shell.showStatus('×”×ª× ×ª×§×ª ×ž×”×—×©×‘×•×Ÿ.', 'neutral');
        ns.state.setSyncStatus('auth');
      });
    }

    const authButtonOverride = document.getElementById('auth-status-btn');
    if (authButtonOverride && !authButtonOverride.dataset.settingsNavBound) {
      authButtonOverride.dataset.settingsNavBound = '1';
      authButtonOverride.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        global.goView?.('settings');
        ns.settings?.render?.();
      }, true);
    }

    document.getElementById('dashboard-grid')?.addEventListener('click', (event) => {
      const openProject = event.target.closest('[data-open-project]');
      const openShootday = event.target.closest('[data-open-shootday]');
      const openPayment = event.target.closest('[data-open-payment]');
      if (openProject) return global.openProjectWorkspace?.(openProject.dataset.openProject);
      if (openShootday) {
        global.goView?.('calendar');
        return global.setTimeout(() => global.openSDP?.(openShootday.dataset.openShootday), 120);
      }
      if (openPayment) {
        global.goView?.('payments');
        return global.setTimeout(() => global.openPayDetail?.(openPayment.dataset.openPayment), 120);
      }
    });

    ns.shell?.updateInboxBadge?.(ns.inboxModel?.getInbox?.()?.counts?.urgent || 0);

    document.getElementById('calendar-agenda-list')?.addEventListener('click', (event) => {
      const row = event.target.closest('.agenda-row');
      if (!row) return;
      if (row.dataset.agendaKind === 'project') return global.openProjectWorkspace?.(row.dataset.agendaId);
      if (row.dataset.agendaKind === 'script') {
        global.goView?.('scripts');
        return global.setTimeout(() => global.openScriptEdit?.(row.dataset.agendaId), 120);
      }
      if (row.dataset.agendaKind === 'shootday') return global.openSDP?.(row.dataset.agendaDate);
    });

    const clientsGrid = document.getElementById('clients-grid');
    if (clientsGrid && !clientsGrid.dataset.workspaceBound) {
      clientsGrid.dataset.workspaceBound = '1';
      clientsGrid.addEventListener('click', (event) => {
        const card = event.target.closest('.client-card');
        if (!card) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        global.openClientWorkspace?.(card.dataset.cname);
      }, true);
    }

    const pipelineView = document.getElementById('view-pipeline');
    if (pipelineView && !pipelineView.dataset.workspaceBound) {
      pipelineView.dataset.workspaceBound = '1';
      pipelineView.addEventListener('click', (event) => {
        if (ns.state?.ui?.bulkMode) return;
        if (event.target.closest('button, a, input, textarea, select, label, .drag-handle, .bulk-select-toggle')) return;
        const card = event.target.closest('.vcard, .list-row');
        if (!card) return;
        const projectId = card.dataset.id || card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (!projectId) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        global.openProjectWorkspace?.(projectId);
      }, true);
    }

    const clientWorkspaceGrid = document.getElementById('client-workspace-grid');
    if (clientWorkspaceGrid && !clientWorkspaceGrid.dataset.bound) {
      clientWorkspaceGrid.dataset.bound = '1';
      clientWorkspaceGrid.addEventListener('click', (event) => {
        const projectButton = event.target.closest('[data-open-project-workspace]');
        if (projectButton) return global.openProjectWorkspace?.(projectButton.dataset.openProjectWorkspace);

        const actionButton = event.target.closest('[data-client-workspace-action]');
        if (!actionButton) return;

        const clientName = ns.state?.ui?.currentClientName;
        if (!clientName) return;

        const action = actionButton.dataset.clientWorkspaceAction;
        if (action === 'edit') return global.openClientPanel?.(clientName);
        if (action === 'payments') {
          global.goView?.('payments');
          return global.setTimeout(() => global.openPayDetail?.(clientName), 120);
        }
        if (action === 'script') {
          global.goView?.('scripts');
          return global.setTimeout(() => global.openScriptModal?.(clientName), 120);
        }
        if (action === 'task') {
          return global.openTaskComposer?.({ clientName, title: `×ž×¢×§×‘ ×ž×•×œ ${clientName}` });
        }
        if (action === 'new-project') {
          return global.openProjectFlow?.({ clientName });
        }
      });
    }

    const projectWorkspaceGrid = document.getElementById('project-workspace-grid');
    if (projectWorkspaceGrid && !projectWorkspaceGrid.dataset.bound) {
      projectWorkspaceGrid.dataset.bound = '1';
      projectWorkspaceGrid.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-project-workspace-action]');
        if (!actionButton) return;

        const projectId = ns.state?.ui?.currentProjectId;
        const project = (global.projects || []).find((item) => item.id === projectId);
        if (!project) return;

        const action = actionButton.dataset.projectWorkspaceAction;
        if (action === 'edit') return global.openEdit?.(projectId);
        if (action === 'payments') return global.openProjPayPanel?.(projectId);
        if (action === 'tracking') return global.openAddTracking?.(projectId);
        if (action === 'task') return global.openTaskComposer?.({ clientName: project.client, projectId: project.id, projectName: project.name, title: `×ž×¢×§×‘ ×œ×¤×¨×•×™×§×˜ ${project.name}` });
        if (action === 'client') return global.openClientWorkspace?.(project.clientId || project.client);
      });
    }

    const inboxGrid = document.getElementById('inbox-grid');
    if (inboxGrid && !inboxGrid.dataset.bound) {
      inboxGrid.dataset.bound = '1';
      inboxGrid.addEventListener('click', (event) => {
        const row = event.target.closest('.inbox-row');
        if (!row) return;

        const kind = row.dataset.inboxKind;
        const projectId = row.dataset.projectId;
        const clientName = row.dataset.clientName;
        const shootDate = row.dataset.shootDate;

        if (kind === 'overdue' || kind === 'waiting') return global.openProjectWorkspace?.(projectId);
        if (kind === 'unpaid') {
          global.goView?.('payments');
          return global.setTimeout(() => global.openPayDetail?.(clientName), 120);
        }
        if (kind === 'shootday') {
          global.goView?.('calendar');
          return global.setTimeout(() => global.openSDP?.(shootDate), 120);
        }
        if (kind === 'client-gap') return global.openClientWorkspace?.(clientName);
        if (kind === 'task') return global.goView?.('tasks');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    ns.shell.injectShell();
    ns.enhancements.installNavigationEnhancements();
    document.getElementById('save-supabase-config-btn')?.addEventListener('click', saveConfigAndSwitchToLogin);
    document.getElementById('edit-supabase-config-btn')?.addEventListener('click', () => {
      if (!ns.config.canConfigureInApp()) {
        ns.shell.showHostedConfigMissingMode();
        return;
      }
      ns.shell.showSetupMode();
      ns.state.setSyncStatus('setup');
    });
    document.getElementById('auth-signin-btn')?.addEventListener('click', () => signIn(false));
    document.getElementById('auth-signup-btn')?.addEventListener('click', () => signIn(true));
    checkSessionAndStart();
  });
})(window);
