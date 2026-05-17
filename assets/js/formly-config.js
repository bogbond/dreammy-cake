/* v3.27 Formly relay mode.
   Formly's minimal name/email/message form works, while the full styled forms can be
   flagged by server-side bot detection. This script keeps the visible site forms intact,
   then submits a clean minimal relay form to Formly:
   access_key + name + email + message (+ one optional file).
*/
(function(){
  'use strict';

  var FORMLY_ENDPOINT = 'https://formly.email/submit';
  var ACCESS_KEY = '8c20c8e2b11242a586b585700f820946';
  var MAX_BYTES = Math.floor(9.5 * 1024 * 1024);
  var MAX_LABEL = '10 MB';
  var allowedExtensions = ['jpg','jpeg','png','webp','gif','bmp','heic','heif','pdf','tif','tiff'];
  var allowedMimeTypes = ['image/jpeg','image/png','image/webp','image/gif','image/bmp','image/heic','image/heif','application/pdf','image/tiff'];

  function isFormlyForm(form){
    return form instanceof HTMLFormElement && (form.getAttribute('action') || '').replace(/\/+$/, '') === FORMLY_ENDPOINT.replace(/\/+$/, '');
  }

  function addHidden(form, name, value){
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value == null ? '' : String(value);
    form.appendChild(input);
    return input;
  }

  function normalizeText(value){
    return String(value == null ? '' : value).replace(/\s+$/g, '').replace(/^\s+/g, '');
  }

  function titleCaseName(name){
    return String(name || '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, function(ch){ return ch.toUpperCase(); });
  }

  function labelFor(control){
    if(!control) return '';
    var id = control.id;
    if(id){
      try {
        var label = document.querySelector('label[for="' + CSS.escape(id) + '"]');
        if(label) return normalizeText(label.textContent).replace(/\*+$/, '').trim();
      } catch(err) {}
    }

    var parentLabel = control.closest && control.closest('label');
    if(parentLabel) return normalizeText(parentLabel.textContent).replace(/\*+$/, '').trim();

    var fieldset = control.closest && control.closest('fieldset');
    if(fieldset){
      var legend = fieldset.querySelector('legend');
      if(legend) return normalizeText(legend.textContent).replace(/\*+$/, '').trim();
    }

    return titleCaseName(control.name || control.id || 'Field');
  }

  function selectedOptionText(select){
    if(!select) return '';
    if(select.multiple){
      var vals = [];
      Array.prototype.forEach.call(select.options, function(opt){
        if(opt.selected && opt.value !== '') vals.push(normalizeText(opt.textContent || opt.value));
      });
      return vals.join(', ');
    }
    var opt = select.options[select.selectedIndex];
    if(!opt) return select.value || '';
    if(opt.disabled && opt.value === '') return '';
    return normalizeText(opt.textContent || opt.value || '');
  }

  function controlValue(control){
    if(!control || !control.name) return null;
    var tag = control.tagName ? control.tagName.toLowerCase() : '';
    var type = (control.type || '').toLowerCase();

    if(type === 'file' || type === 'submit' || type === 'button' || type === 'reset' || type === 'image') return null;
    if(control.name === 'access_key') return null;
    if(control.name === 'honeypot' || control.name === 'website') return null;
    if(type === 'hidden' && (/^_/.test(control.name) || control.name === 'redirect')) return null;

    if(type === 'radio' || type === 'checkbox'){
      if(!control.checked) return null;
      return normalizeText(control.value || 'Yes');
    }
    if(tag === 'select') return selectedOptionText(control);
    return normalizeText(control.value || '');
  }

  function collectFields(form){
    var rows = [];
    var seen = Object.create(null);
    var controls = form.querySelectorAll('input, select, textarea');

    Array.prototype.forEach.call(controls, function(control){
      var value = controlValue(control);
      if(value == null || value === '') return;

      var type = (control.type || '').toLowerCase();
      var name = control.name || '';
      var key = name || control.id || labelFor(control);
      var label = labelFor(control) || titleCaseName(name);

      if(type === 'radio'){
        if(seen['radio:' + name]) return;
        seen['radio:' + name] = true;
      }

      if(type === 'checkbox'){
        if(seen['checkbox-label:' + name]){
          // Append multiple checked checkboxes with the same label on separate lines.
        }
      }

      rows.push({ label: label, name: name, value: value, hidden: type === 'hidden' });
    });

    return rows;
  }

  function firstValue(form, names){
    for(var i = 0; i < names.length; i++){
      var field = form.querySelector('[name="' + names[i] + '"]');
      if(field && normalizeText(field.value || '')) return normalizeText(field.value || '');
    }
    return '';
  }

  function findSelectedFileInput(form){
    var inputs = form.querySelectorAll('input[type="file"]');
    for(var i = 0; i < inputs.length; i++){
      if(inputs[i].files && inputs[i].files.length) return inputs[i];
    }
    return null;
  }

  function getExtension(filename){
    var parts = String(filename || '').toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : '';
  }

  function isAllowedFile(file){
    if(!file) return true;
    var ext = getExtension(file.name);
    var mime = String(file.type || '').toLowerCase();
    return allowedExtensions.indexOf(ext) !== -1 || (mime && allowedMimeTypes.indexOf(mime) !== -1);
  }

  function validateFileInput(fileInput){
    if(!fileInput || !fileInput.files || !fileInput.files.length) return true;
    if(fileInput.files.length > 1){
      fileInput.setCustomValidity('Please upload one file only.');
      try { fileInput.reportValidity(); } catch(err) {}
      return false;
    }
    var file = fileInput.files[0];
    if(file.size > MAX_BYTES){
      fileInput.setCustomValidity('Please upload one file up to ' + MAX_LABEL + '.');
      try { fileInput.reportValidity(); } catch(err2) {}
      return false;
    }
    if(!isAllowedFile(file)){
      fileInput.setCustomValidity('Please upload JPG, PNG, WEBP, GIF, BMP, HEIC, TIFF or PDF.');
      try { fileInput.reportValidity(); } catch(err3) {}
      return false;
    }
    fileInput.setCustomValidity('');
    return true;
  }

  function humanPageTitle(){
    var title = document.title || '';
    return title.replace(/\s*\|\s*Dreamy Cake.*$/i, '').trim() || title || 'Dreamy Cake website';
  }

  function formLabel(form){
    var dataForm = form.getAttribute('data-form') || '';
    var product = firstValue(form, ['product_name']);
    if(form.id === 'contactFormEnhanced') return 'Contact form — Home page';
    if(form.id === 'bespokeOrderForm') return 'Bespoke Order form';
    if(product) return 'Product order form — ' + product;
    if(form.classList.contains('product-form')) return 'Product order form — ' + humanPageTitle();
    return dataForm ? ('Website form — ' + dataForm) : ('Website form — ' + humanPageTitle());
  }

  function buildMessage(form){
    var lines = [];
    var rows = collectFields(form);
    var fileInput = findSelectedFileInput(form);

    lines.push('New Dreamy Cake website submission');
    lines.push('');
    lines.push('Form: ' + formLabel(form));
    lines.push('Page title: ' + humanPageTitle());
    lines.push('Page URL: ' + window.location.href);
    lines.push('Submitted at: ' + new Date().toISOString());
    lines.push('');
    lines.push('Submitted details:');

    rows.forEach(function(row){
      var label = row.label || titleCaseName(row.name);
      var value = row.value;
      if(row.name === 'message' || row.name === 'notes' || row.name === 'description' || /message|notes|idea|brief|details/i.test(row.name)){
        lines.push('');
        lines.push(label + ':');
        lines.push(value);
      } else {
        lines.push(label + ': ' + value);
      }
    });

    if(fileInput && fileInput.files && fileInput.files.length){
      lines.push('');
      lines.push('Attachment selected: ' + fileInput.files[0].name + ' (' + Math.round(fileInput.files[0].size / 1024) + ' KB)');
    }

    return lines.join('\n');
  }

  function submitRelayForm(form, fileInput){
    var relay = document.createElement('form');
    relay.action = FORMLY_ENDPOINT;
    relay.method = 'POST';
    relay.style.display = 'none';
    relay.acceptCharset = 'UTF-8';

    addHidden(relay, 'access_key', ACCESS_KEY);
    addHidden(relay, 'name', firstValue(form, ['name', 'full_name', 'customer_name']) || 'Website visitor');
    addHidden(relay, 'email', firstValue(form, ['email']) || 'contact@dreamycake.co.uk');
    addHidden(relay, 'message', buildMessage(form));

    if(fileInput && fileInput.files && fileInput.files.length){
      relay.enctype = 'multipart/form-data';
      try {
        fileInput.setAttribute('data-original-name', fileInput.name || '');
        fileInput.name = 'file';
        relay.appendChild(fileInput);
      } catch(err) {}
    }

    document.body.appendChild(relay);
    relay.submit();
  }

  document.addEventListener('submit', function(e){
    var form = e.target;
    if(!isFormlyForm(form)) return;
    if(form.hasAttribute('data-formly-native')) return;
    if(e.defaultPrevented) return;

    var fileInput = findSelectedFileInput(form);
    if(!validateFileInput(fileInput)){
      e.preventDefault();
      form.classList.add('was-validated');
      return;
    }

    e.preventDefault();
    submitRelayForm(form, fileInput);
  }, false);
})();
