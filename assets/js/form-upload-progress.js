(function(){
  var REDIRECT_DELAY_MS = 650;
  var SUBMIT_TIMEOUT_MS = 180000;
  var stateMap = new WeakMap();
  var iframeCount = 0;

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
    state = {
      iframe: null,
      timer: null,
      timeout: null,
      progress: 0,
      pending: false,
      submitAt: 0,
      ui: null,
      button: null,
      modalInstance: null
    };
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
    ui.text.textContent = opts.message || 'Uploading…';
    ui.percent.textContent = opts.percentLabel || (percent + '%');
    ui.bar.style.width = percent + '%';
    ui.bar.setAttribute('aria-valuenow', String(percent));
    ui.bar.className = 'progress-bar';

    if(opts.state === 'ready'){
      ui.card.className = 'border rounded-4 bg-light-subtle p-3';
      ui.bar.classList.add('bg-secondary');
    } else if(opts.state === 'success'){
      ui.card.className = 'border border-success-subtle rounded-4 bg-success-subtle p-3';
      ui.bar.classList.add('bg-success');
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
        btnLabel.textContent = text || 'Sending…';
      } else if(tag === 'input'){
        if(!button.dataset.originalValue) button.dataset.originalValue = button.value || '';
        button.value = text || 'Sending…';
      } else {
        if(!button.dataset.originalText) button.dataset.originalText = button.textContent || '';
        button.textContent = text || 'Sending…';
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

  function ensureIframe(form){
    var state = getState(form);
    if(state.iframe) return state.iframe;

    var iframe = document.createElement('iframe');
    iframe.name = 'dc-formsubmit-frame-' + (++iframeCount);
    iframe.title = 'Hidden upload target';
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'absolute';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    document.body.appendChild(iframe);

    iframe.addEventListener('load', function(){
      var s = getState(form);
      if(!s.pending) return;
      // Guard against any immediate about:blank load that might race with setup
      if(Date.now() - s.submitAt < 250) return;

      var nextUrl = getNextUrl(form);
      if(nextUrl){
        try {
          var href = iframe.contentWindow && iframe.contentWindow.location ? iframe.contentWindow.location.href : '';
          if(!href || href === 'about:blank') return;
          var expected = new URL(nextUrl, window.location.href).href;
          var current = new URL(href, window.location.href).href;
          if(current.indexOf(expected) !== 0 && current.indexOf('/Thank-You/') === -1) return;
        } catch(err) {
          // Cross-origin FormSubmit pages are not a reliable success signal.
          // Wait for the same-origin _next redirect or let the timeout show an error.
          return;
        }
      }

      finishSuccess(form);
    });

    state.iframe = iframe;
    return iframe;
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

  function showContactModal(){
    var modalEl = document.getElementById('contactSuccessModal');
    if(!modalEl) return;

    modalEl.classList.add('show');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function hideContactModal(){
    var modalEl = document.getElementById('contactSuccessModal');
    if(!modalEl) return;

    modalEl.classList.remove('show');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function completeProgress(form, message){
    setStatus(form, {
      percent: 100,
      message: message,
      percentLabel: '100%',
      state: 'success'
    });
  }

  function clearPending(state){
    state.pending = false;
    state.progress = 0;
    if(state.timer){ window.clearInterval(state.timer); state.timer = null; }
    if(state.timeout){ window.clearTimeout(state.timeout); state.timeout = null; }
  }

  function finishSuccess(form){
    var state = getState(form);
    if(!state.pending) return;
    clearPending(state);

    var fileInput = getFileInput(form);
    var hasAttachment = !!(fileInput && fileInput.files && fileInput.files.length);
    var successMessage = hasAttachment
      ? (isContactForm(form) ? 'File uploaded successfully. Your message has been sent.' : 'File uploaded successfully. Your request has been sent.')
      : (isContactForm(form) ? 'Your message has been sent successfully.' : 'Your request has been sent successfully.');

    completeProgress(form, successMessage);
    setButtonLoading(form, false);

    if(window.gtag){
      if(isContactForm(form)){
        gtag('event', 'contact_submit_success', {
          lead_type: 'contact_form',
          form_id: form.id || 'contactFormEnhanced',
          page_path: location.pathname
        });
      } else {
        gtag('event', 'generate_lead', {
          lead_type: 'order_form',
          form_id: form.id || form.getAttribute('data-form') || 'order',
          page_path: location.pathname
        });
      }
    }

    try { form.reset(); } catch(err) {}
    form.classList.remove('was-validated');

    if(isContactForm(form)){
      showAlert('', '', true);
      window.setTimeout(function(){ showContactModal(); }, 120);
      window.setTimeout(function(){ hideStatus(form); }, 2500);
    } else {
      var nextUrl = getNextUrl(form);
      if(nextUrl){
        window.setTimeout(function(){ window.location.href = nextUrl; }, REDIRECT_DELAY_MS);
      } else {
        window.setTimeout(function(){ hideStatus(form); }, 2500);
      }
    }
  }

  function failPending(form, message, percentLabel){
    var state = getState(form);
    clearPending(state);
    setButtonLoading(form, false);
    setStatus(form, {
      percent: Math.max(state.progress || 0, 100),
      message: message,
      percentLabel: percentLabel || 'Error',
      state: 'error'
    });
    if(isContactForm(form)){
      showAlert(message, 'alert-danger');
    }
  }

  function beginPseudoProgress(form){
    var state = getState(form);
    var fileInput = getFileInput(form);
    var hasAttachment = !!(fileInput && fileInput.files && fileInput.files.length);
    var selectedButtonText = hasAttachment ? 'Uploading…' : 'Sending…';
    setButtonLoading(form, true, selectedButtonText);
    showAlert('', '', true);

    state.progress = 4;
    setStatus(form, {
      percent: state.progress,
      message: hasAttachment ? (isContactForm(form) ? 'Uploading your file and message…' : 'Uploading your file and request…') : (isContactForm(form) ? 'Sending your message…' : 'Sending your request…'),
      percentLabel: state.progress + '%',
      state: 'uploading'
    });

    state.timer = window.setInterval(function(){
      if(!state.pending) return;
      var increment;
      if(state.progress < 25) increment = 7;
      else if(state.progress < 55) increment = 4;
      else if(state.progress < 80) increment = 2;
      else if(state.progress < 92) increment = 1;
      else increment = 0;
      state.progress = Math.min(92, state.progress + increment);
      var pct = state.progress;
      var msg;
      if(hasAttachment){
        msg = pct >= 90
          ? (isContactForm(form) ? 'Finalising your message…' : 'Finalising your request…')
          : (isContactForm(form) ? 'Uploading your file and message…' : 'Uploading your file and request…');
      } else {
        msg = pct >= 90
          ? (isContactForm(form) ? 'Finalising your message…' : 'Finalising your request…')
          : (isContactForm(form) ? 'Sending your message…' : 'Sending your request…');
      }
      setStatus(form, {
        percent: pct,
        message: msg,
        percentLabel: pct + '%',
        state: pct >= 90 ? 'finishing' : 'uploading'
      });
    }, 180);

    state.timeout = window.setTimeout(function(){
      if(!state.pending) return;
      failPending(form, 'The upload took too long. Please try again.', 'Timed out');
    }, SUBMIT_TIMEOUT_MS);
  }

  function normaliseContactAction(form){
    if(!isContactForm(form)) return;
    if(/\/ajax\//.test(form.action || '')){
      form.action = form.action.replace('/ajax/', '/');
    }
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
    var sizeLabel = sizeMb > 0 ? ' (' + sizeMb.toFixed(1) + ' MB)' : '';
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
    form.dataset.uploadProgressManaged = 'true';
    normaliseContactAction(form);
    var fileInput = getFileInput(form);
    if(fileInput) getUi(form);
    ensureIframe(form);
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

    var state = getState(form);
    if(state.pending){
      e.preventDefault();
      return;
    }

    if(!form.checkValidity()){
      form.classList.add('was-validated');
      if(isContactForm(form)) showAlert('Please fill the required fields.', 'alert-danger');
      return;
    }

    state.pending = true;
    state.submitAt = Date.now();
    var iframe = ensureIframe(form);
    form.setAttribute('target', iframe.name);
    beginPseudoProgress(form);
  });

  window.addEventListener('beforeunload', function(){
    document.querySelectorAll('form[action*="formsubmit.co"]').forEach(function(form){
      var state = stateMap.get(form);
      if(state) clearPending(state);
    });
  });

  function boot(){
    document.querySelectorAll('form[action*="formsubmit.co"]').forEach(initForm);

    // Contact modal close helpers
    document.querySelectorAll('[data-close-modal]').forEach(function(btn){
      if(btn.dataset.dcModalBound === 'true') return;
      btn.dataset.dcModalBound = 'true';
      btn.addEventListener('click', function(){
        hideContactModal();
      });
    });

    var contactModal = document.getElementById('contactSuccessModal');
    if(contactModal && contactModal.dataset.dcModalOverlayBound !== 'true'){
      contactModal.dataset.dcModalOverlayBound = 'true';
      contactModal.addEventListener('click', function(event){
        if(event.target === contactModal){
          hideContactModal();
        }
      });
    }

    if(document.body && document.body.dataset.dcModalEscapeBound !== 'true'){
      document.body.dataset.dcModalEscapeBound = 'true';
      document.addEventListener('keydown', function(event){
        if(event.key === 'Escape'){
          hideContactModal();
        }
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
