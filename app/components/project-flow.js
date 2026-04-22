(function initReelProjectFlow(global) {
  const ns = global.REELApp = global.REELApp || {};
  let pendingPreset = null;
  let initialSnapshot = '';
  let suppressCloseGuard = false;

  function byId(id) {
    return global.document.getElementById(id);
  }

  function createSection(id, title, description) {
    const section = global.document.createElement('section');
    section.className = 'project-flow-section';
    section.dataset.projectSection = id;
    section.innerHTML = `
      <div class="project-flow-section-head">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      <div class="project-flow-section-body"></div>
    `;
    return section;
  }

  function getSelectedStage() {
    return byId('stage-grid')?.querySelector('.stage-opt.active')?.dataset.stage || global.selStage || '';
  }

  function activateSection(sectionId) {
    global.document.querySelectorAll('.project-flow-nav-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.section === sectionId);
    });
    global.document.querySelectorAll('.project-flow-section').forEach((section) => {
      section.classList.toggle('active', section.dataset.projectSection === sectionId);
    });
  }

  function clearInvalidStates() {
    ['fn', 'fc', 'fp', 'fdrive'].forEach((id) => {
      byId(id)?.classList.remove('project-flow-invalid');
    });
    byId('stage-grid')?.classList.remove('project-flow-invalid');
  }

  function showValidation(messages, focusId, sectionId) {
    const box = byId('project-flow-status');
    if (!box) return;
    box.dataset.tone = 'error';
    box.innerHTML = `
      <strong>צריך להשלים כמה דברים לפני השמירה</strong>
      <ul>${messages.map((message) => `<li>${message}</li>`).join('')}</ul>
    `;
    if (sectionId) activateSection(sectionId);
    if (focusId) global.setTimeout(() => byId(focusId)?.focus(), 20);
  }

  function clearValidation() {
    const box = byId('project-flow-status');
    if (!box) return;
    box.dataset.tone = 'neutral';
    box.innerHTML = '<strong>שמור על שם ברור, לקוח משויך, ודדליין כשיש כזה כדי שהפרויקט יופיע נכון ב-Inbox, Dashboard ו-Workspace.</strong>';
    clearInvalidStates();
  }

  function serializeModalState() {
    return JSON.stringify({
      name: byId('fn')?.value || '',
      client: byId('fc')?.value || '',
      price: byId('fp')?.value || '',
      deadline: byId('fd')?.value || '',
      paid: byId('fpaid')?.value || '',
      type: byId('ftype')?.value || '',
      notes: byId('fnotes')?.value || '',
      drive: byId('fdrive')?.value || '',
      stage: getSelectedStage(),
      files: global.pendingFiles || [],
      versions: global._editVersions || [],
    });
  }

  function rememberSnapshot() {
    initialSnapshot = serializeModalState();
  }

  function hasUnsavedChanges() {
    const overlay = byId('overlay');
    if (!overlay?.classList.contains('open')) return false;
    return serializeModalState() !== initialSnapshot;
  }

  function discardChangesAndClose() {
    suppressCloseGuard = true;
    try {
      global.closeModal?.__projectFlowOriginal?.apply(global, []);
    } finally {
      suppressCloseGuard = false;
      initialSnapshot = '';
    }
  }

  function confirmDiscardChanges() {
    global.showConfirm?.({
      icon: '⚠️',
      title: 'לסגור בלי לשמור?',
      msg: 'יש שינויים שלא נשמרו בפרויקט. אם תסגור עכשיו הם יאבדו.',
      okText: 'סגור בלי לשמור',
      okClass: 'danger',
      cancelText: 'חזור לעריכה',
    }, discardChangesAndClose);
  }

  function updateContext(mode) {
    const summary = byId('project-flow-summary');
    const title = byId('modal-ttl')?.textContent || '';
    const client = byId('fc')?.value?.trim();
    const stage = getSelectedStage() || 'script';
    const stageLabel = global.STAGES?.[stage]?.label || stage;
    if (!summary) return;
    summary.innerHTML = `
      <div class="project-flow-kicker">${mode === 'edit' ? 'עריכת פרויקט' : 'פרויקט חדש'}</div>
      <div class="project-flow-title">${title}</div>
      <div class="project-flow-meta">
        <span>${client || 'ללא לקוח משויך'}</span>
        <span>${stageLabel}</span>
      </div>
    `;
  }

  function ensureStructure() {
    const modal = global.document.querySelector('#overlay .modal');
    if (!modal || modal.dataset.projectFlowReady === '1') return;

    const modalHead = modal.querySelector('.modal-head');
    const form2 = modal.querySelector('.form-2col');
    const stageGroup = byId('stage-grid')?.closest('.fg');
    const form3 = modal.querySelector('.form-3col');
    const deadlineField = form3?.children?.[0] || null;
    const priceField = form3?.children?.[1] || null;
    const paidField = form3?.children?.[2] || null;
    const typeField = byId('ftype')?.closest('.fg');
    const notesField = byId('fnotes')?.closest('.fg');
    const driveField = byId('fdrive')?.closest('.fg');
    const versionsField = byId('versions-section');
    const filesField = byId('dropzone')?.closest('.fg');
    const actions = modal.querySelector('.modal-actions');
    if (!modalHead || !form2 || !stageGroup || !deadlineField || !priceField || !paidField || !typeField || !notesField || !driveField || !filesField || !actions) {
      return;
    }

    modal.classList.add('project-flow-modal');

    const intro = global.document.createElement('div');
    intro.className = 'project-flow-top';
    intro.innerHTML = `
      <div class="project-flow-summary" id="project-flow-summary"></div>
      <div class="project-flow-nav" id="project-flow-nav">
        <button type="button" class="project-flow-nav-btn active" data-section="basics">בסיס</button>
        <button type="button" class="project-flow-nav-btn" data-section="production">הפקה</button>
        <button type="button" class="project-flow-nav-btn" data-section="finance">כספים וקישורים</button>
      </div>
    `;
    modalHead.insertAdjacentElement('afterend', intro);

    const stageShell = global.document.createElement('div');
    stageShell.className = 'project-flow-stage-shell';
    stageShell.append(stageGroup);
    intro.insertAdjacentElement('afterend', stageShell);

    const shell = global.document.createElement('div');
    shell.className = 'project-flow-shell';

    const basics = createSection('basics', 'Basics', 'השם, הלקוח והשלב הראשוני שיקבעו איפה הפרויקט מופיע במערכת.');
    const production = createSection('production', 'Production', 'לו"ז, סוג תוכן, הערות וקבצים שקשורים לעבודה עצמה.');
    const finance = createSection('finance', 'Finance & Links', 'תמחור, סטטוס תשלום, קישורים רלוונטיים ופעולות סיום.');

    basics.querySelector('.project-flow-section-body').append(form2);

    const productionBody = production.querySelector('.project-flow-section-body');
    const productionGrid = global.document.createElement('div');
    productionGrid.className = 'project-flow-grid two';
    productionGrid.append(deadlineField, typeField);
    productionBody.append(productionGrid, notesField);
    if (versionsField) productionBody.append(versionsField);
    productionBody.append(filesField);

    const financeBody = finance.querySelector('.project-flow-section-body');
    const financeGrid = global.document.createElement('div');
    financeGrid.className = 'project-flow-grid three';
    financeGrid.append(priceField, paidField, driveField);
    financeBody.append(financeGrid);

    shell.append(basics, production, finance);
    actions.insertAdjacentElement('beforebegin', shell);

    const status = global.document.createElement('div');
    status.className = 'project-flow-status';
    status.id = 'project-flow-status';
    actions.insertAdjacentElement('beforebegin', status);

    if (form3) form3.remove();

    intro.querySelectorAll('.project-flow-nav-btn').forEach((button) => {
      button.addEventListener('click', () => activateSection(button.dataset.section));
    });

    ['fn', 'fc', 'fp', 'fdrive', 'fd', 'fnotes'].forEach((id) => {
      byId(id)?.addEventListener('input', () => {
        byId(id)?.classList.remove('project-flow-invalid');
        updateContext(global.editId ? 'edit' : 'create');
      });
    });

    ['fpaid', 'ftype', 'fd'].forEach((id) => {
      byId(id)?.addEventListener('change', () => {
        byId(id)?.classList.remove('project-flow-invalid');
        updateContext(global.editId ? 'edit' : 'create');
      });
    });

    byId('stage-grid')?.addEventListener('click', () => {
      byId('stage-grid')?.classList.remove('project-flow-invalid');
      updateContext(global.editId ? 'edit' : 'create');
    });

    modal.dataset.projectFlowReady = '1';
    clearValidation();
    updateContext('create');
    activateSection('basics');
  }

  function validateBeforeSave() {
    clearInvalidStates();
    const messages = [];
    const name = byId('fn')?.value?.trim();
    const client = byId('fc')?.value?.trim();
    const price = byId('fp')?.value;
    const drive = byId('fdrive')?.value?.trim();
    const stage = getSelectedStage();

    if (!name) {
      messages.push('חסר שם לפרויקט.');
      byId('fn')?.classList.add('project-flow-invalid');
    }
    if (!client) {
      messages.push('חסר לקוח משויך.');
      byId('fc')?.classList.add('project-flow-invalid');
    }
    if (price && +price < 0) {
      messages.push('מחיר הפרויקט לא יכול להיות שלילי.');
      byId('fp')?.classList.add('project-flow-invalid');
    }
    if (drive && !/^https?:\/\//i.test(drive)) {
      messages.push('קישור Drive צריך להתחיל ב-http:// או https://');
      byId('fdrive')?.classList.add('project-flow-invalid');
    }

    if (!stage) {
      messages.push('בחר שלב עבודה לפרויקט.');
      byId('stage-grid')?.classList.add('project-flow-invalid');
    }

    if (messages.length) {
      const focusId = !name ? 'fn' : !client ? 'fc' : (price && +price < 0) ? 'fp' : (drive && !/^https?:\/\//i.test(drive)) ? 'fdrive' : 'fn';
      const sectionId = (!name || !client || !stage) ? 'basics' : (!price && !drive ? 'production' : 'finance');
      showValidation(messages, focusId, sectionId);
      return false;
    }
    clearValidation();
    return true;
  }

  function applyPreset() {
    const preset = pendingPreset;
    pendingPreset = null;
    if (!preset) return;
    if (preset.clientName && byId('fc')) byId('fc').value = preset.clientName;
    if (preset.name && byId('fn')) byId('fn').value = preset.name;
    if (preset.deadline && byId('fd')) byId('fd').value = preset.deadline;
    if (preset.type && byId('ftype')) byId('ftype').value = preset.type;
    if (preset.notes && byId('fnotes')) byId('fnotes').value = preset.notes;
    if (preset.drive && byId('fdrive')) byId('fdrive').value = preset.drive;
    if (preset.paid && byId('fpaid')) byId('fpaid').value = preset.paid;
    if (preset.stage && typeof global.selectStage === 'function') global.selectStage(preset.stage);
  }

  function patchLegacyApi() {
    ensureStructure();

    const originalOpenModal = global.openModal;
    if (typeof originalOpenModal === 'function' && !originalOpenModal.__projectFlowPatched) {
      global.openModal = function openModalPatched() {
        originalOpenModal.apply(this, arguments);
        ensureStructure();
        applyPreset();
        const archiveBtn = byId('archive-btn');
        if (archiveBtn) archiveBtn.style.display = 'none';
        clearValidation();
        activateSection('basics');
        updateContext('create');
        rememberSnapshot();
      };
      global.openModal.__projectFlowPatched = true;
    }

    const originalOpenEdit = global.openEdit;
    if (typeof originalOpenEdit === 'function' && !originalOpenEdit.__projectFlowPatched) {
      global.openEdit = function openEditPatched(id) {
        originalOpenEdit.call(this, id);
        ensureStructure();
        const archiveBtn = byId('archive-btn');
        if (archiveBtn) archiveBtn.style.display = '';
        clearValidation();
        activateSection('basics');
        updateContext('edit');
        rememberSnapshot();
      };
      global.openEdit.__projectFlowPatched = true;
    }

    const originalSaveProj = global.saveProj;
    if (typeof originalSaveProj === 'function' && !originalSaveProj.__projectFlowPatched) {
      global.saveProj = function saveProjPatched() {
        if (!validateBeforeSave()) return;
        suppressCloseGuard = true;
        try {
          originalSaveProj.apply(this, arguments);
        } finally {
          suppressCloseGuard = false;
          initialSnapshot = '';
        }
      };
      global.saveProj.__projectFlowPatched = true;
    }

    const originalCloseModal = global.closeModal;
    if (typeof originalCloseModal === 'function' && !originalCloseModal.__projectFlowPatched) {
      global.closeModal.__projectFlowOriginal = originalCloseModal;
      global.closeModal = function closeModalPatched() {
        if (!suppressCloseGuard && hasUnsavedChanges()) {
          confirmDiscardChanges();
          return;
        }
        clearValidation();
        originalCloseModal.apply(this, arguments);
        initialSnapshot = '';
      };
      global.closeModal.__projectFlowPatched = true;
      global.closeModal.__projectFlowOriginal = originalCloseModal;
    }

    const originalArchiveProject = global.archiveProject;
    if (typeof originalArchiveProject === 'function' && !originalArchiveProject.__projectFlowPatched) {
      global.archiveProject = function archiveProjectPatched() {
        suppressCloseGuard = true;
        try {
          return originalArchiveProject.apply(this, arguments);
        } finally {
          global.setTimeout(() => {
            suppressCloseGuard = false;
            initialSnapshot = '';
          }, 0);
        }
      };
      global.archiveProject.__projectFlowPatched = true;
    }

    const originalDeleteProj = global.deleteProj;
    if (typeof originalDeleteProj === 'function' && !originalDeleteProj.__projectFlowPatched) {
      global.deleteProj = function deleteProjPatched() {
        const projectList = typeof projects !== 'undefined' ? projects : [];
        const project = projectList.find((item) => item.id === global.editId);
        if (!project) return;
        global.showConfirm?.({
          icon: '📦',
          title: 'העברה לארכיון',
          msg: `"${project.name}" יועבר לארכיון. ניתן לשחזר אותו בהיסטוריה.`,
          okText: 'העבר לארכיון',
          okClass: 'danger',
          cancelText: 'ביטול',
        }, () => {
          suppressCloseGuard = true;
          try {
            archiveData.push({ ...project, archivedAt: Date.now() });
            projects = projects.filter((item) => item.id !== global.editId);
            logActivity('archive', '📦', 'פרויקט הועבר לארכיון', project.name, project.client);
            save();
            _saveArchive();
            global.closeModal?.__projectFlowOriginal?.apply(global, []);
            renderPipeline();
            renderCalendar();
            updateStats();
            updateArchiveBadge();
            toast('📦 הועבר לארכיון');
            if (modalReturnClient) {
              const returnClient = modalReturnClient;
              modalReturnClient = null;
              const stillExists = projects.some((item) => item.client === returnClient) || clientData[returnClient];
              if (stillExists) global.setTimeout(() => openClientPanel(returnClient), 60);
            }
          } finally {
            global.setTimeout(() => {
              suppressCloseGuard = false;
              initialSnapshot = '';
            }, 0);
          }
        });
      };
      global.deleteProj.__projectFlowPatched = true;
    }
  }

  function openProjectFlow(options) {
    pendingPreset = options || null;
    global.goView?.('pipeline');
    global.openModal?.();
  }

  ns.projectFlow = {
    ensureStructure,
    activateSection,
    clearValidation,
    patchLegacyApi,
    openProjectFlow,
  };

  global.openProjectFlow = openProjectFlow;

  global.document.addEventListener('DOMContentLoaded', () => {
    ensureStructure();
    patchLegacyApi();
  });
})(window);
