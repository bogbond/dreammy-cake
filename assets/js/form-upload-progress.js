(function(){
  var stateMap = new WeakMap();

  function isFormSubmitForm(form){
    return form instanceof HTMLFormElement && /formsubmit\.co/.test(form.action || '');
  }

  function isContactForm(form){
    return form && form.id === 'contactFormEnhanced';
  }

  function getFileInput(form){
    return form ? form.querySelector('input[type="file"][data-file-attachment]') : null;
  }

  function getSubmitButton(form){
    return form ? form.querySelector('button[type="submit"], input[type="submit"]') : null;
  }

  function getState(form){
    var state = stateMap.get(form);
    if(state) return state;
    state = { ui: null, button: null };
    stateMap.set(form, state);
    return state;
  }

  function getContactUi(){
    var wrap = document.getElementById('contactUploadStatusWrap');
    var card = document.getElementById('contactUploadStatusCard');
    var text = document.getElementById('contactUploadStatusText');
    var percent = document.getElementById('contactUploadStatusPercent');
    var bar = document.getElementById('contactUploadProgressBar');
    if(!(wrap && card && text && percent && bar)) return null;
    return { wrap: wrap, card: card, text: text, percent: percent, bar: bar };
  }

  function createOrderUi(form){
    if(!form) return null;
    var existing = form.querySelector('[data-upload-status-wrap="true"]');
    if(existing){
      return {
        wrap: existing,
        card: existing.querySelector('[data-upload-status-card="true"]') || existing.firstElementChild,
        text: existing.querySelector('[data-upload-status-text="true"]'),
        percent: existing.querySelector('[data-upload-status-percent="true"]'),
        bar: existing.querySelector('[data-upload-progress-bar="true"]')
      };
    }

    var fileInput = getFileInput(form);
    if(!fileInput) return null;
    var fieldWrap = fileInput.closest('.col-12, .col-6, .col-md-6') || fileInput.parentElement;
    if(!fieldWrap) return null;

    var wrap = document.createElement('div');
    wrap.className = 'col-12 mt-2 d-none';
    wrap.setAttribute('data-upload-status-wrap', 'true');

    var card = document.createElement('div');
    card.className = 'border rounded-4 bg-light-subtle p-3';
    card.setAttribute('data-upload-status-card', 'true');

    var head = document.createElement('div');
    head.className = 'd-flex flex-wrap justify-content-between align-items-center gap-2 mb-2';

    var text = document.createElement('div');
    text.className = 'small fw-semibold';
    text.setAttribute('data-upload-status-text', 'true');
    text.textContent = 'File ready to upload with your request.';

    var percent = document.createElement('div');
    percent.className = 'small text-body-secondary';
    percent.setAttribute('data-upload-status-percent', 'true');
    percent.textContent = '0%';

    var progress = document.createElement('div');
    progress.className = 'progress';
    progress.style.height = '10px';

    var bar = document.createElement('div');
    bar.className = 'progress-bar progress-bar-striped progress-bar-animated';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', '0');
    bar.setAttribute('data-upload-progress-bar', 'true');
    bar.style.width = '0%';

    progress.appendChild(bar);
    head.appendChild(text);
    head.appendChild(percent);
    card.appendChild(head);
    card.appendChild(progress);
    wrap.appendChild(card);
    fieldWrap.insertAdjacentElement('afterend', wrap);

    return { wrap: wrap, card: card, text: text, percent: percent, bar: bar };
  }

  function getUi(form){
    var state = getState(form);
    if(state.ui) return state.ui;
    state.ui = isContactForm(form) ? getContactUi() : createOrderUi(form);
    return state.ui;
  }

  function setStatus(form, opts){
    var ui = getUi(form);
    if(!ui || !ui.wrap || !ui.card || !ui.text || !ui.percent || !ui.bar) return;
    var percent = Number.isFinite(opts.percent) ? Math.max(0, Math.min(100, opts.percent)) : 0;
    ui.wrap.classList.remove('d-none');
    ui.text.textContent = opts.message || 'Preparing upload...';
    ui.percent.textContent = opts.percentLabel || (percent + '%');
    ui.bar.style.width = percent + '%';
    ui.bar.setAttribute('aria-valuenow', String(percent));
    ui.bar.className = 'progress-bar';

    if(opts.state === 'ready'){
      ui.card.className = 'border rounded-4 bg-light-subtle p-3';
      ui.bar.classList.add('bg-secondary');
    } else if(opts.state === 'error'){
      ui.card.className = 'border border-danger-subtle rounded-4 bg-danger-subtle p-3';
      ui.bar.classList.add('bg-danger');
    } else {
      ui.card.className = 'border rounded-4 bg-light-subtle p-3';
      ui.bar.classList.add('progress-bar-striped', 'progress-bar-animated');
    }
  }

  function hideStatus(form){
    var ui = getUi(form);
    if(!ui || !ui.wrap || !ui.card || !ui.text || !ui.percent || !ui.bar) return;
    ui.wrap.classList.add('d-none');
    ui.card.className = 'border rounded-4 bg-light-subtle p-3';
    ui.text.textContent = isContactForm(form) ? 'File ready to upload with your message.' : 'File ready to upload with your request.';
    ui.percent.textContent = '0%';
    ui.bar.className = 'progress-bar progress-bar-striped progress-bar-animated';
    ui.bar.style.width = '0%';
    ui.bar.setAttribute('aria-valuenow', '0');
  }

  function setButtonLoading(form, isLoading, text){
    var state = getState(form);
    var button = state.button || getSubmitButton(form);
    state.button = button;
    if(!button) return;

    var btnLabel = button.querySelector ? button.querySelector('.btn-label') : null;
    var spinner = button.querySelector ? button.querySelector('.btn-spinner') : null;
    var tag = button.tagName ? button.tagName.toLowerCase() : '';

    if(isLoading){
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      if(btnLabel){
        if(!btnLabel.dataset.originalText) btnLabel.dataset.originalText = btnLabel.textContent || '';
        btnLabel.textContent = text || 'Sending...';
      } else if(tag === 'input'){
        if(!button.dataset.originalValue) button.dataset.originalValue = button.value || '';
        button.value = text || 'Sending...';
      } else {
        if(!button.dataset.originalText) button.dataset.originalText = button.textContent || '';
        button.textContent = text || 'Sending...';
      }
      if(spinner) spinner.classList.remove('d-none');
    } else {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      if(btnLabel && btnLabel.dataset.originalText){
        btnLabel.textContent = btnLabel.dataset.originalText;
      } else if(tag === 'input' && button.dataset.originalValue){
        button.value = button.dataset.originalValue;
      } else if(tag !== 'input' && button.dataset.originalText){
        button.textContent = button.dataset.originalText;
      }
      if(spinner) spinner.classList.add('d-none');
    }
  }

  function getNextUrl(form){
    var nextInput = form.querySelector('input[name="_next"]');
    return nextInput && nextInput.value ? nextInput.value : '';
  }

  function syncNextUrlToCurrentOrigin(form){
    var nextInput = form ? form.querySelector('input[name="_next"]') : null;
    if(!nextInput) return;

    try {
      var currentValue = nextInput.value || '/Thank-You/';
      var parsed = new URL(currentValue, window.location.href);
      var path = parsed.pathname.replace(/\/+$/, '') || '/';
      if(path === '/Thank-You' && window.location.origin && window.location.protocol !== 'file:'){
        nextInput.value = new URL('/Thank-You/', window.location.origin).href;
      }
    } catch(err) {
      // Leave the original value untouched if URL parsing is not available.
    }
  }

  function showAlert(message, klass, hide){
    var alertBox = document.getElementById('contactAlert');
    if(!alertBox) return;
    if(hide || !message){
      alertBox.textContent = '';
      alertBox.className = 'alert d-none mt-3';
      return;
    }
    alertBox.textContent = message;
    alertBox.className = 'alert mt-3 ' + (klass || 'alert-info');
  }

  function formatBytes(bytes){
    bytes = Number(bytes) || 0;
    if(bytes >= 1024 * 1024){
      var mb = bytes / (1024 * 1024);
      return (Math.abs(mb - Math.round(mb)) < 0.05 ? Math.round(mb) : mb.toFixed(1)) + ' MB';
    }
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  function onFileChange(input){
    var form = input && input.form;
    if(!isFormSubmitForm(form)) return;
    var files = input.files;
    var file = files && files[0];
    if(!file){
      hideStatus(form);
      return;
    }
    var totalBytes = 0;
    Array.prototype.slice.call(files).forEach(function(f){ totalBytes += f.size || 0; });
    var sizeMb = totalBytes ? (totalBytes / (1024 * 1024)) : 0;
    var sizeLabel = sizeMb > 0 ? ' (' + formatBytes(totalBytes) + ')' : '';
    var label = files.length > 1 ? (files.length + ' files') : file.name;
    setStatus(form, {
      percent: 0,
      message: 'Selected: ' + label + sizeLabel + '. It will upload when you send the form.',
      percentLabel: 'Ready',
      state: 'ready'
    });
  }

  function initForm(form){
    if(!isFormSubmitForm(form)) return;
    form.removeAttribute('target');
    form.dataset.nativeFormsubmit = 'true';
    syncNextUrlToCurrentOrigin(form);
    var fileInput = getFileInput(form);
    if(fileInput) getUi(form);
  }

  document.addEventListener('change', function(e){
    var input = e.target;
    if(!(input instanceof HTMLInputElement)) return;
    if(input.type !== 'file' || !input.hasAttribute('data-file-attachment')) return;
    onFileChange(input);
  });

  document.addEventListener('submit', function(e){
    var form = e.target;
    if(!isFormSubmitForm(form)) return;

    initForm(form);

    if(e.defaultPrevented) return;

    if(!form.checkValidity()){
      e.preventDefault();
      form.classList.add('was-validated');
      if(isContactForm(form)) showAlert('Please fill the required fields.', 'alert-danger');
      var firstInvalid = form.querySelector(':invalid');
      if(firstInvalid){
        try { firstInvalid.focus({ preventScroll: false }); } catch(err) { try { firstInvalid.focus(); } catch(err2) {} }
        try { firstInvalid.reportValidity(); } catch(err3) {}
      }
      return;
    }

    // Let the browser submit the multipart form normally. This is more reliable
    // for FormSubmit attachments than AJAX or a hidden iframe and avoids false
    // 92% progress timeouts.
    form.removeAttribute('target');
    syncNextUrlToCurrentOrigin(form);
    showAlert('', '', true);

    var fileInput = getFileInput(form);
    var hasAttachment = !!(fileInput && fileInput.files && fileInput.files.length);
    setButtonLoading(form, true, hasAttachment ? 'Uploading...' : 'Sending...');
    setStatus(form, {
      percent: 35,
      message: hasAttachment
        ? (isContactForm(form) ? 'Uploading your file and message...' : 'Uploading your file and request...')
        : (isContactForm(form) ? 'Sending your message...' : 'Sending your request...'),
      percentLabel: 'Please wait',
      state: 'uploading'
    });
    // No preventDefault here: native browser submission continues.
  });

  function boot(){
    document.querySelectorAll('form[action*="formsubmit.co"]').forEach(initForm);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
