(function initReelNewClientFlow(global) {
  function injectModal() {
    if (global.document.getElementById('overlay-new-client')) return;
    global.document.body.insertAdjacentHTML('beforeend', `
      <div class="overlay" id="overlay-new-client" onclick="if(event.target===this)closeNewClientModal()">
        <div class="modal" style="max-width:680px">
          <div class="modal-head">
            <div class="modal-title">לקוח חדש</div>
            <button class="btn-close" type="button" onclick="closeNewClientModal()">✕</button>
          </div>
          <div class="form-2col">
            <div class="fg">
              <label class="fl">שם לקוח *</label>
              <input class="fi" id="new-client-name" placeholder="למשל: קפה העיר">
            </div>
            <div class="fg">
              <label class="fl">איש קשר</label>
              <input class="fi" id="new-client-contact" placeholder="שם איש הקשר">
            </div>
            <div class="fg">
              <label class="fl">טלפון</label>
              <input class="fi" id="new-client-phone" placeholder="050-0000000">
            </div>
            <div class="fg">
              <label class="fl">אימייל</label>
              <input class="fi" id="new-client-email" type="email" placeholder="name@example.com">
            </div>
            <div class="fg">
              <label class="fl">אתר</label>
              <input class="fi" id="new-client-website" placeholder="https://">
            </div>
            <div class="fg">
              <label class="fl">כתובת</label>
              <input class="fi" id="new-client-address" placeholder="עיר / כתובת">
            </div>
          </div>
          <div class="fg">
            <label class="fl">הערות</label>
            <textarea class="fi" id="new-client-notes" rows="4" placeholder="פרטים חשובים על הלקוח, העדפות, תהליך עבודה וכו'"></textarea>
          </div>
          <div class="new-client-note">הלקוח יישמר גם בלי פרויקט פעיל, כדי שלא תצטרך ליצור פרויקט מזויף רק כדי לפתוח כרטיס לקוח.</div>
          <div class="new-client-actions">
            <button class="btn btn-ghost btn-sm" type="button" onclick="closeNewClientModal()">ביטול</button>
            <button class="btn btn-add" type="button" onclick="saveNewClientFromModal()">שמור ופתח כרטיס לקוח</button>
          </div>
        </div>
      </div>
    `);
  }

  function readField(id) {
    return global.document.getElementById(id)?.value.trim() || '';
  }

  function fillForm(values) {
    global.document.getElementById('new-client-name').value = values.name || '';
    global.document.getElementById('new-client-contact').value = values.contact || '';
    global.document.getElementById('new-client-phone').value = values.phone || '';
    global.document.getElementById('new-client-email').value = values.email || '';
    global.document.getElementById('new-client-website').value = values.website || '';
    global.document.getElementById('new-client-address').value = values.address || '';
    global.document.getElementById('new-client-notes').value = values.notes || '';
  }

  function openNewClientModal(prefill) {
    injectModal();
    fillForm(prefill || {});
    global.document.getElementById('overlay-new-client')?.classList.add('open');
    global.setTimeout(() => global.document.getElementById('new-client-name')?.focus(), 30);
  }

  function closeNewClientModal() {
    global.document.getElementById('overlay-new-client')?.classList.remove('open');
  }

  function saveNewClientFromModal() {
    const name = readField('new-client-name');
    if (!name) {
      global.toast?.('נא להזין שם לקוח');
      return;
    }

    if (global.clientData?.[name]) {
      global.toast?.('לקוח בשם הזה כבר קיים');
      global.goView?.('clients');
      closeNewClientModal();
      global.setTimeout(() => global.openClientPanel?.(name), 120);
      return;
    }

    const nextClient = {
      id: typeof global.genId === 'function' ? global.genId() : `client_${Date.now()}`,
      contact: readField('new-client-contact'),
      phone: readField('new-client-phone'),
      email: readField('new-client-email'),
      website: readField('new-client-website'),
      address: readField('new-client-address'),
      notes: readField('new-client-notes'),
      created_at: new Date().toISOString(),
    };

    global.clientData = global.clientData || {};
    global.clientData[name] = nextClient;
    global.saveClients?.();
    global.renderClients?.();
    global.renderCalendar?.();
    global.syncAll?.();
    closeNewClientModal();
    global.goView?.('clients');
    global.setTimeout(() => global.openClientPanel?.(name), 140);
    global.toast?.('לקוח חדש נוסף');
  }

  global.openNewClientModal = openNewClientModal;
  global.closeNewClientModal = closeNewClientModal;
  global.saveNewClientFromModal = saveNewClientFromModal;

  global.document.addEventListener('DOMContentLoaded', injectModal);
})(window);
