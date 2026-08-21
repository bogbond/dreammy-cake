/* v4.00 dual form provider mode.
   Change only assets/data/form-provider.txt:
   0 = FormSubmit, 1 = Formly.

   Formly keeps the proven minimal relay request:
   access_key + name + email + message (+ one optional file).

   FormSubmit receives each visible field separately with a friendly label.
   Its endpoint must be activated for the intended recipient before mode 0 is enabled.

   v3.30 sends the message body as lightweight HTML (<br> + <strong>) because
   Formly's default email template collapses plain-text newline characters.
*/
(function(){
  'use strict';

  var FORMLY_ENDPOINT = 'https://formly.email/submit';
  var ACCESS_KEY = '8c20c8e2b11242a586b585700f820946';
  var FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/quotes@dreamycake.co.uk';
  var PROVIDER_CONFIG_URL = '/assets/data/form-provider.txt';
  var PROVIDER_FORMSUBMIT = 0;
  var PROVIDER_FORMLY = 1;
  var MAX_BYTES = Math.floor(9.5 * 1024 * 1024);
  var MAX_LABEL = '10 MB';
  var HARD_BREAK = '\u2028';
  var allowedExtensions = ['jpg','jpeg','png','webp','gif','bmp','heic','heif','pdf','tif','tiff'];
  var allowedMimeTypes = ['image/jpeg','image/png','image/webp','image/gif','image/bmp','image/heic','image/heif','application/pdf','image/tiff'];

  var SKIP_NAMES = {
    access_key: true,
    redirect: true,
    honeypot: true,
    website: true,
    request_summary: true,
    _honey: true
  };

  function loadProviderMode(){
    var url = PROVIDER_CONFIG_URL + '?ts=' + Date.now();
    return fetch(url, { cache: 'no-store', credentials: 'same-origin' })
      .then(function(response){
        if(!response.ok) throw new Error('Provider config returned HTTP ' + response.status);
        return response.text();
      })
      .then(function(text){
        var value = String(text || '')
          .split(/\r?\n/)
          .map(function(line){ return line.replace(/#.*$/, '').trim(); })
          .filter(Boolean)
          .join('');
        if(value !== '0' && value !== '1') throw new Error('Provider config must contain only 0 or 1');
        return Number(value);
      })
      .catch(function(error){
        console.warn('Dreamy Cake form provider config unavailable; keeping Formly.', error);
        return PROVIDER_FORMLY;
      });
  }

  var providerModePromise = loadProviderMode();

  var FRIENDLY_LABELS = {
    product_name: 'Product name',
    selected_products: 'Selected products',
    order_selection: 'Selected products',
    cake_estimate: 'Cake estimate',
    cupcake_estimate: 'Cupcake estimate',
    bundle_discount: 'Bundle discount',
    estimated_total: 'Estimated starting total',
    delivery_summary: 'Delivery summary',
    name: 'Full name',
    full_name: 'Full name',
    customer_name: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    company: 'Company / organisation',
    inquiry_type: 'Enquiry type',
    event_type: 'Event type',
    venue_postcode: 'Venue postcode',
    services: 'Requested services',
    quantities: 'Products and approximate quantities',
    budget_range: 'Indicative budget',
    branding_requirements: 'Branding and design direction',
    dietary_requirements: 'Dietary requirements and allergens',
    delivery_setup_requirements: 'Delivery and setup requirements',
    privacy_acknowledged: 'Privacy notice acknowledged',
    instagram_handle: 'Instagram handle',
    event_date: 'Event date',
    preferred_time: 'Preferred time / delivery window',
    guest_count: 'Guests / servings',
    occasion: 'Occasion',
    cake_category: 'Cake type',
    cake_size: 'Cake size / style',
    cake_shape: 'Shape / format',
    dietary_preference: 'Dietary preference',
    cake_flavour: 'Cake flavour',
    cake_message: 'Message / wording on cake',
    cupcake_quantity: 'Cupcake box size / quantity',
    cupcake_flavour: 'Cupcake flavour',
    cupcake_flavours: 'Cupcake flavours',
    cupcake_dietary_preference: 'Cupcake dietary preference',
    cupcake_frosting: 'Frosting type',
    cupcake_decoration_style: 'Decoration style',
    colour_palette: 'Colour palette',
    theme_or_vibe: 'Theme / design vibe',
    personalisation: 'Personalisation',
    budget_from: 'Budget guide',
    reference_links: 'Reference links',
    anything_else: 'Anything else',
    fulfilment: 'Collection / delivery',
    preferred_collection_time: 'Preferred collection time',
    delivery_address: 'Full delivery address',
    delivery_postcode: 'Delivery postcode',
    delivery_window: 'Preferred delivery window',
    delivery_recipient: 'Who will receive the order',
    recipient_name: 'Recipient full name',
    recipient_phone: 'Recipient phone',
    gift_message: 'Gift message',
    allergen_information_acknowledged: 'Allergen information acknowledged',
    subject: 'Subject',
    message: 'Message',
    notes: 'Notes / design ideas',
    date: 'Event date',
    time: 'Time',
    quantity: 'Quantity',
    product_selection: 'Product',
    base_price: 'Base product total',
    card_addon: 'Greeting card add-on',
    card_addon_price: 'Greeting card add-on total',
    card_message: 'Card message',
    estimated_price: 'Estimated total',
    order_summary: 'Order summary',
    notes_allergies: 'Notes / allergies',
    payment_confirmation: 'Payment confirmation',
    flavour: 'Flavour',
    emboss_text: 'Text to emboss',
    delivery_option: 'Delivery or collection',
    postcode: 'Postcode / area'
  };

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

  function showProviderError(form, message){
    var alertBox = form && form.querySelector && form.querySelector('#contactAlert, [data-form-provider-error]');
    if(!alertBox && form){
      alertBox = document.createElement('div');
      alertBox.setAttribute('data-form-provider-error', 'true');
      alertBox.setAttribute('role', 'alert');
      alertBox.className = 'alert alert-danger mt-3';
      form.appendChild(alertBox);
    }
    if(alertBox){
      alertBox.textContent = message;
      alertBox.classList.remove('d-none');
    }
  }

  function ensureHoneypot(form){
    if(!form || form.querySelector('input[name="_honey"]')) return;
    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.position = 'absolute';
    wrap.style.left = '-10000px';
    wrap.style.width = '1px';
    wrap.style.height = '1px';
    wrap.style.overflow = 'hidden';

    var label = document.createElement('label');
    label.textContent = 'Leave this field empty';
    var input = document.createElement('input');
    input.type = 'text';
    input.name = '_honey';
    input.tabIndex = -1;
    input.autocomplete = 'off';
    label.appendChild(input);
    wrap.appendChild(label);
    form.appendChild(wrap);
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function collapseWhitespace(value){
    return String(value == null ? '' : value)
      .replace(/\u00a0/g, ' ')
      .replace(/[\t\r\n ]+/g, ' ')
      .replace(/\s+$/g, '')
      .replace(/^\s+/g, '');
  }

  function cleanForEmail(value){
    return String(value == null ? '' : value)
      .replace(/\u00a0/g, ' ')
      .replace(/[\t ]+/g, ' ')
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(function(line){ return collapseWhitespace(line); })
      .filter(Boolean)
      .join(HARD_BREAK)
      .trim();
  }

  function titleCaseName(name){
    return String(name || '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, function(ch){ return ch.toUpperCase(); });
  }

  function friendlyLabel(name){
    name = String(name || '');
    return FRIENDLY_LABELS[name] || titleCaseName(name || 'Field');
  }

  function textFromElement(el){
    if(!el) return '';
    try {
      if(typeof el.innerText === 'string' && el.innerText.trim()) return collapseWhitespace(el.innerText);
    } catch(err) {}

    function walk(node){
      if(!node) return '';
      if(node.nodeType === 3) return node.nodeValue || '';
      if(node.nodeType !== 1) return '';
      var parts = [];
      Array.prototype.forEach.call(node.childNodes || [], function(child){
        var text = walk(child);
        if(text) parts.push(text);
      });
      return parts.join(' ');
    }

    return collapseWhitespace(walk(el));
  }

  function labelElementFor(control){
    if(!control) return null;
    if(control.labels && control.labels.length) return control.labels[0];
    var id = control.id;
    if(id){
      var labels = document.getElementsByTagName('label');
      for(var i = 0; i < labels.length; i++){
        if(labels[i].getAttribute('for') === id) return labels[i];
      }
    }
    return control.closest && control.closest('label');
  }

  function legendFor(control){
    var fieldset = control && control.closest && control.closest('fieldset');
    if(!fieldset) return '';
    var legend = fieldset.querySelector('legend');
    return legend ? textFromElement(legend).replace(/\*+$/g, '').trim() : '';
  }

  function optionTextForControl(control){
    var label = labelElementFor(control);
    if(label){
      var strong = label.querySelector && label.querySelector('strong');
      var strongText = strong ? textFromElement(strong) : '';
      if(strongText) return strongText.replace(/\*+$/g, '').trim();

      var text = textFromElement(label)
        .replace(/\s+On$/i, '')
        .replace(/\*+$/g, '')
        .trim();
      if(text) return text;
    }
    return collapseWhitespace(control && control.value ? control.value : 'Yes');
  }

  function labelForControl(control){
    if(!control) return '';
    var name = control.name || '';
    var type = (control.type || '').toLowerCase();

    if(type === 'hidden') return friendlyLabel(name);

    if(type === 'radio'){
      return legendFor(control) || friendlyLabel(name);
    }

    if(type === 'checkbox'){
      var group = control.form ? control.form.querySelectorAll('input[type="checkbox"][name="' + cssValue(name) + '"]') : [];
      if(group.length > 1) return legendFor(control) || friendlyLabel(name);
      var checkboxLabel = optionTextForControl(control);
      return checkboxLabel || friendlyLabel(name);
    }

    var label = labelElementFor(control);
    if(label){
      var text = textFromElement(label).replace(/\*+$/g, '').trim();
      if(text) return text;
    }

    return legendFor(control) || friendlyLabel(name || control.id);
  }

  function cssValue(value){
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function selectedOptionText(select){
    if(!select) return '';
    if(select.multiple){
      var vals = [];
      Array.prototype.forEach.call(select.options, function(opt){
        if(opt.selected && opt.value !== '') vals.push(collapseWhitespace(opt.textContent || opt.value));
      });
      return vals.join(', ');
    }
    var opt = select.options[select.selectedIndex];
    if(!opt) return select.value || '';
    if(opt.disabled && opt.value === '') return '';
    var dataLabel = opt.getAttribute && opt.getAttribute('data-label');
    return collapseWhitespace(dataLabel || opt.textContent || opt.value || '');
  }

  function hiddenValueShouldBeIncluded(name, value){
    if(!value) return false;
    if(name === 'access_key' || name === 'redirect') return false;
    if(/^_/.test(name)) return false;
    var lower = String(value).toLowerCase().trim();
    if(lower === 'not selected' || lower === 'not applied' || lower === 'not calculated') return false;
    return true;
  }

  function controlValue(control){
    if(!control || !control.name) return null;
    if(control.disabled) return null;

    var tag = control.tagName ? control.tagName.toLowerCase() : '';
    var type = (control.type || '').toLowerCase();
    var name = control.name || '';

    if(type === 'file' || type === 'submit' || type === 'button' || type === 'reset' || type === 'image') return null;
    if(SKIP_NAMES[name]) return null;

    if(type === 'hidden'){
      var hiddenValue = cleanForEmail(control.value || '');
      return hiddenValueShouldBeIncluded(name, hiddenValue) ? hiddenValue : null;
    }

    if(type === 'radio'){
      if(!control.checked) return null;
      return cleanForEmail(optionTextForControl(control) || control.value || 'Selected');
    }

    if(type === 'checkbox'){
      if(!control.checked) return null;
      return cleanForEmail(optionTextForControl(control) || control.value || 'Yes');
    }

    if(tag === 'select') return cleanForEmail(selectedOptionText(control));
    return cleanForEmail(control.value || '');
  }

  function groupValues(form, selector, name){
    var values = [];
    var controls = form.querySelectorAll(selector + '[name="' + cssValue(name) + '"]');
    Array.prototype.forEach.call(controls, function(control){
      if(control.disabled) return;
      var type = (control.type || '').toLowerCase();
      if((type === 'radio' || type === 'checkbox') && !control.checked) return;
      var val = controlValue(control);
      if(val != null && val !== '') values.push(val);
    });
    return values;
  }

  function addRow(rows, seenRows, label, name, value, hidden){
    label = collapseWhitespace(label || friendlyLabel(name)).replace(/\*+$/g, '').trim();
    value = cleanForEmail(value || '');
    if(!label || !value) return;

    var key = label.toLowerCase() + '::' + value.toLowerCase();
    if(seenRows[key]) return;
    seenRows[key] = true;

    rows.push({ label: label, name: name || '', value: value, hidden: !!hidden });
  }

  function collectFields(form){
    var rows = [];
    var seenControls = Object.create(null);
    var seenRows = Object.create(null);
    var controls = form.querySelectorAll('input, select, textarea');

    Array.prototype.forEach.call(controls, function(control){
      if(!control || !control.name || control.disabled) return;
      var type = (control.type || '').toLowerCase();
      var name = control.name || '';

      if(type === 'file' || type === 'submit' || type === 'button' || type === 'reset' || type === 'image') return;
      if(SKIP_NAMES[name]) return;

      if(type === 'radio'){
        var radioKey = 'radio:' + name;
        if(seenControls[radioKey]) return;
        seenControls[radioKey] = true;
        var radioValues = groupValues(form, 'input[type="radio"]', name);
        if(radioValues.length) addRow(rows, seenRows, labelForControl(control), name, radioValues.join(', '), false);
        return;
      }

      if(type === 'checkbox'){
        var checkboxGroup = form.querySelectorAll('input[type="checkbox"][name="' + cssValue(name) + '"]');
        if(checkboxGroup.length > 1){
          var checkboxKey = 'checkbox:' + name;
          if(seenControls[checkboxKey]) return;
          seenControls[checkboxKey] = true;
          var checkboxValues = groupValues(form, 'input[type="checkbox"]', name);
          if(checkboxValues.length) addRow(rows, seenRows, labelForControl(control), name, checkboxValues.join(', '), false);
          return;
        }
      }

      var value = controlValue(control);
      if(value == null || value === '') return;
      addRow(rows, seenRows, labelForControl(control), name, value, type === 'hidden');
    });

    return rows;
  }

  function firstValue(form, names){
    for(var i = 0; i < names.length; i++){
      var field = form.querySelector('[name="' + cssValue(names[i]) + '"]');
      if(field && cleanForEmail(field.value || '')) return cleanForEmail(field.value || '');
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
    if(form.id === 'contactFormEnhanced') return 'Contact form - Home page';
    if(form.id === 'bespokeOrderForm') return 'Bespoke Order form';
    if(form.id === 'corporateEnquiryForm') return 'Corporate Cakes enquiry form';
    if(product) return 'Product order form - ' + product;
    if(form.classList.contains('product-form')) return 'Product order form - ' + humanPageTitle();
    return dataForm ? ('Website form - ' + dataForm) : ('Website form - ' + humanPageTitle());
  }

  function htmlValue(value){
    return String(value == null ? '' : value)
      .split(HARD_BREAK)
      .map(function(part){ return escapeHtml(part); })
      .filter(function(part){ return part !== ''; })
      .join('<br>  ');
  }

  function addHtmlLine(parts, html){
    parts.push(html + '<br>');
  }

  function addHtmlBlank(parts){
    parts.push('<br>');
  }

  function addHtmlField(parts, label, value){
    if(!value) return;
    addHtmlLine(parts, '<strong>' + escapeHtml(label) + ':</strong> ' + htmlValue(value));
  }

  function buildMessage(form){
    var parts = [];
    var rows = collectFields(form);
    var fileInput = findSelectedFileInput(form);

    addHtmlLine(parts, '<strong>New Dreamy Cake website submission</strong>');
    addHtmlBlank(parts);
    addHtmlField(parts, 'Form', formLabel(form));
    addHtmlField(parts, 'Page title', humanPageTitle());
    addHtmlField(parts, 'Page URL', window.location.href);
    addHtmlField(parts, 'Submitted at', new Date().toISOString());
    addHtmlBlank(parts);
    addHtmlLine(parts, '<strong>Submitted details</strong>');

    rows.forEach(function(row){
      var label = row.label || friendlyLabel(row.name);
      var value = row.value;
      addHtmlLine(parts, '&bull; <strong>' + escapeHtml(label) + ':</strong> ' + htmlValue(value));
    });

    if(fileInput && fileInput.files && fileInput.files.length){
      addHtmlBlank(parts);
      addHtmlField(parts, 'Attachment selected', fileInput.files[0].name + ' (' + Math.round(fileInput.files[0].size / 1024) + ' KB)');
    }

    return parts.join('');
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

  function formSubmitSubject(form){
    return '[DC-WEB] ' + formLabel(form);
  }

  function submitFormSubmitRelay(form, fileInput){
    if(!FORMSUBMIT_ENDPOINT || !/^https:\/\/formsubmit\.co\//i.test(FORMSUBMIT_ENDPOINT)){
      showProviderError(form, 'FormSubmit is not activated yet. Please use email or WhatsApp while we finish the setup.');
      return;
    }

    var relay = document.createElement('form');
    relay.action = FORMSUBMIT_ENDPOINT;
    relay.method = 'POST';
    relay.enctype = 'multipart/form-data';
    relay.style.display = 'none';
    relay.acceptCharset = 'UTF-8';

    addHidden(relay, '_subject', formSubmitSubject(form));
    addHidden(relay, '_template', 'table');
    addHidden(relay, '_captcha', 'false');
    addHidden(relay, '_next', 'https://dreamycake.co.uk/Thank-You/');
    addHidden(relay, '_honey', firstValue(form, ['_honey']));
    addHidden(relay, '_replyto', firstValue(form, ['email']));
    addHidden(relay, 'Submission ID', 'DC-' + Date.now().toString(36).toUpperCase());
    addHidden(relay, 'Form', formLabel(form));
    addHidden(relay, 'Page title', humanPageTitle());
    addHidden(relay, 'Page URL', window.location.href);
    addHidden(relay, 'Submitted at', new Date().toISOString());

    collectFields(form).forEach(function(row){
      addHidden(relay, row.label || friendlyLabel(row.name), row.value);
    });

    if(fileInput && fileInput.files && fileInput.files.length){
      try {
        fileInput.setAttribute('data-original-name', fileInput.name || '');
        fileInput.name = 'attachment';
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
    providerModePromise.then(function(providerMode){
      if(providerMode === PROVIDER_FORMSUBMIT){
        submitFormSubmitRelay(form, fileInput);
        return;
      }
      submitRelayForm(form, fileInput);
    }).catch(function(error){
      console.error('Dreamy Cake form submission failed before sending.', error);
      showProviderError(form, 'The form could not be prepared. Please contact us by email or WhatsApp.');
    });
  }, false);

  function boot(){
    Array.prototype.forEach.call(document.forms || [], function(form){
      if(isFormlyForm(form)) ensureHoneypot(form);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
