(function initReelFormControls(global) {
  const ns = global.REELApp = global.REELApp || {};

  const CONTROL_SELECTOR = 'select:not([multiple]):not([data-native-ui="keep"])';
  let documentObserver = null;
  let openDropdown = null;

  function sanitizeClassName(value) {
    return String(value || '').replace(/[^\w-]+/g, '-');
  }

  function getSelectedOption(select) {
    return select.options[select.selectedIndex] || select.options[0] || null;
  }

  function closeDropdown(instance) {
    if (!instance) return;
    instance.shell.classList.remove('open');
    instance.trigger.classList.remove('open');
    instance.dropdown.hidden = true;
    instance.trigger.setAttribute('aria-expanded', 'false');
    if (openDropdown === instance) openDropdown = null;
  }

  function closeOpenDropdown() {
    closeDropdown(openDropdown);
  }

  function updateOptionSelection(instance) {
    const currentValue = instance.select.value;
    instance.dropdown.querySelectorAll('.ui-select-option').forEach((button) => {
      const selected = button.dataset.value === currentValue;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  function syncSelectUi(select) {
    const instance = select.__customSelect;
    if (!instance) return;
    const selectedOption = getSelectedOption(select);
    instance.label.textContent = selectedOption ? selectedOption.textContent.trim() : 'בחר';
    instance.trigger.disabled = select.disabled;
    instance.trigger.setAttribute('aria-disabled', select.disabled ? 'true' : 'false');
    updateOptionSelection(instance);
  }

  function rebuildOptions(select) {
    const instance = select.__customSelect;
    if (!instance) return;

    instance.dropdown.innerHTML = '';
    Array.from(select.options).forEach((option) => {
      const button = global.document.createElement('button');
      button.type = 'button';
      button.className = 'ui-select-option';
      button.role = 'option';
      button.dataset.value = option.value;
      button.disabled = option.disabled;
      button.innerHTML = `
        <span class="ui-select-option-label">${option.textContent.trim()}</span>
        <span class="ui-select-option-check">✓</span>
      `;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (option.disabled) return;
        select.value = option.value;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncSelectUi(select);
        closeDropdown(instance);
      });
      instance.dropdown.appendChild(button);
    });

    syncSelectUi(select);
  }

  function openInstance(instance) {
    if (instance.select.disabled) return;
    if (openDropdown && openDropdown !== instance) closeDropdown(openDropdown);
    instance.shell.classList.add('open');
    instance.trigger.classList.add('open');
    instance.dropdown.hidden = false;
    instance.trigger.setAttribute('aria-expanded', 'true');
    openDropdown = instance;
  }

  function toggleInstance(instance) {
    if (instance.shell.classList.contains('open')) closeDropdown(instance);
    else openInstance(instance);
  }

  function bindSelectObservers(select) {
    const instance = select.__customSelect;
    if (!instance) return;
    const observer = new MutationObserver(() => rebuildOptions(select));
    observer.observe(select, {
      attributes: true,
      attributeFilter: ['disabled'],
      childList: true,
      subtree: true,
    });
    instance.selectObserver = observer;
  }

  function buildShellClasses(select) {
    const classes = ['ui-select-shell'];
    Array.from(select.classList).forEach((className) => {
      classes.push(`ui-from-${sanitizeClassName(className)}`);
    });
    return classes.join(' ');
  }

  function enhanceSelect(select) {
    if (!select || select.__customSelect) return;

    const shell = global.document.createElement('div');
    shell.className = buildShellClasses(select);

    const trigger = global.document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ui-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `
      <span class="ui-select-label"></span>
      <span class="ui-select-icon" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </span>
    `;

    const dropdown = global.document.createElement('div');
    dropdown.className = 'ui-select-dropdown';
    dropdown.role = 'listbox';
    dropdown.hidden = true;

    shell.appendChild(trigger);
    shell.appendChild(dropdown);
    select.classList.add('ui-native-select');
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');
    select.insertAdjacentElement('afterend', shell);

    const instance = {
      select,
      shell,
      trigger,
      dropdown,
      label: trigger.querySelector('.ui-select-label'),
      selectObserver: null,
    };

    select.__customSelect = instance;

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleInstance(instance);
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openInstance(instance);
        instance.dropdown.querySelector('.ui-select-option.selected, .ui-select-option:not(:disabled)')?.focus();
      }
    });

    dropdown.addEventListener('keydown', (event) => {
      const options = Array.from(dropdown.querySelectorAll('.ui-select-option:not(:disabled)'));
      const currentIndex = options.indexOf(global.document.activeElement);
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDropdown(instance);
        trigger.focus();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        options[Math.min(currentIndex + 1, options.length - 1)]?.focus();
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        options[Math.max(currentIndex - 1, 0)]?.focus();
      }
    });
    dropdown.addEventListener('click', (event) => event.stopPropagation());

    select.addEventListener('change', () => syncSelectUi(select));

    rebuildOptions(select);
    bindSelectObservers(select);
  }

  function enhanceNativeControls(root) {
    (root || global.document).querySelectorAll(CONTROL_SELECTOR).forEach(enhanceSelect);
  }

  function bindGlobalCloseHandlers() {
    if (global.document.body.dataset.formControlsBound) return;
    global.document.body.dataset.formControlsBound = '1';

    global.document.addEventListener('pointerdown', (event) => {
      if (!openDropdown) return;
      if (openDropdown.shell.contains(event.target) || openDropdown.select.contains(event.target)) return;
      closeOpenDropdown();
    });

    global.document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeOpenDropdown();
    });
  }

  function watchForNewControls() {
    if (documentObserver) return;
    documentObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.(CONTROL_SELECTOR)) enhanceSelect(node);
          enhanceNativeControls(node);
        });
      });
    });
    documentObserver.observe(global.document.body, { childList: true, subtree: true });
  }

  function init() {
    bindGlobalCloseHandlers();
    enhanceNativeControls(global.document);
    watchForNewControls();
  }

  ns.formControls = {
    init,
    enhanceNativeControls,
    refresh: enhanceNativeControls,
  };

  global.document.addEventListener('DOMContentLoaded', init);
})(window);
