(function(){
  'use strict';
  var form = document.getElementById('bespokeOrderForm');
  if(!form) return;

  var DISCOUNT_RATE = 0.20;
  var PREMIUM_CAKE_FLAVOUR_FROM = 5;

  var els = {
    productCake: document.getElementById('boProductCake'),
    productCupcakes: document.getElementById('boProductCupcakes'),
    productFeedback: document.getElementById('boProductFeedback'),
    eventDate: document.getElementById('boDate'),
    orderSelection: document.getElementById('boOrderSelection'),
    cakePanel: document.getElementById('cakeDetailsPanel'),
    cupcakePanel: document.getElementById('cupcakeDetailsPanel'),
    deliveryPanel: document.getElementById('deliveryPanel'),
    collectionPanel: document.getElementById('collectionPanel'),
    recipientPanel: document.getElementById('recipientPanel'),
    bundleUnlocked: document.getElementById('bundleUnlocked'),
    dietary: document.getElementById('boDietary'),
    dietaryNote: document.getElementById('boDietaryNote'),
    cupcakeDietary: document.getElementById('boCupcakeDietary'),
    cupcakeDietaryNote: document.getElementById('boCupcakeDietaryNote'),
    flavour: document.getElementById('boFlavour'),
    cakeSize: document.getElementById('boCakeSize'),
    cupcakeQty: document.getElementById('boCupcakeQty'),
    cupcakeFlavourFeedback: document.getElementById('cupcakeFlavourFeedback'),
    fileInput: document.getElementById('boAttachments'),
    fileList: document.getElementById('boFileList'),
    fileLabel: document.getElementById('boFileLabel'),
    uploadDrop: document.getElementById('boUploadDrop'),
    fileFeedback: document.getElementById('boFileFeedback'),
    summaryProducts: document.getElementById('summaryProducts'),
    summaryCake: document.getElementById('summaryCake'),
    summaryCupcakes: document.getElementById('summaryCupcakes'),
    summaryDiscount: document.getElementById('summaryDiscount'),
    summaryDiscountRow: document.getElementById('summaryDiscountRow'),
    summaryDelivery: document.getElementById('summaryDelivery'),
    summaryTotal: document.getElementById('summaryTotal'),
    summaryTotalNote: document.getElementById('summaryTotalNote'),
    hiddenProducts: document.getElementById('boHiddenProducts'),
    hiddenCakeEstimate: document.getElementById('boHiddenCakeEstimate'),
    hiddenCupcakeEstimate: document.getElementById('boHiddenCupcakeEstimate'),
    hiddenBundleDiscount: document.getElementById('boHiddenBundleDiscount'),
    hiddenEstimatedTotal: document.getElementById('boHiddenEstimatedTotal'),
    hiddenDeliverySummary: document.getElementById('boHiddenDeliverySummary'),
    hiddenRequestSummary: document.getElementById('boHiddenRequestSummary')
  };

  function money(n){
    n = Number(n) || 0;
    var rounded = Math.round((n + Number.EPSILON) * 100) / 100;
    if(Math.abs(rounded - Math.round(rounded)) < 0.001) return '\u00a3' + String(Math.round(rounded));
    return '\u00a3' + rounded.toFixed(2);
  }

  function pad2(n){
    n = Number(n) || 0;
    return n < 10 ? '0' + n : String(n);
  }

  function todayISO(){
    var now = new Date();
    return now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
  }

  function updateEventDateMin(){
    if(!els.eventDate) return;
    var min = todayISO();
    if(els.eventDate.min !== min) els.eventDate.min = min;
  }

  function validateEventDate(){
    if(!els.eventDate) return true;
    updateEventDateMin();
    if(els.eventDate.value && els.eventDate.min && els.eventDate.value < els.eventDate.min){
      els.eventDate.setCustomValidity('Please choose today or a future date.');
      return false;
    }
    els.eventDate.setCustomValidity('');
    return true;
  }

  function selectedRadio(name){
    return form.querySelector('input[name="' + name + '"]:checked');
  }

  function selectedOption(select){
    if(!select || select.selectedIndex < 0) return null;
    return select.options[select.selectedIndex];
  }

  function optionPrice(select){
    var opt = selectedOption(select);
    if(!opt) return 0;
    var p = parseFloat(opt.getAttribute('data-price') || '0');
    return Number.isFinite(p) ? p : 0;
  }

  function optionLabel(select){
    var opt = selectedOption(select);
    if(!opt) return '';
    return opt.getAttribute('data-label') || opt.value || opt.textContent.trim();
  }

  function panelControls(panel){
    if(!panel) return [];
    return Array.prototype.slice.call(panel.querySelectorAll('input, select, textarea'));
  }

  function setPanel(panel, show){
    if(!panel) return;
    panel.hidden = !show;
    panelControls(panel).forEach(function(control){
      control.disabled = !show;
      if(!show){
        control.required = false;
        if(control.type === 'checkbox' || control.type === 'radio'){
          if(control.hasAttribute('data-reset-when-hidden')) control.checked = false;
        }
      } else if(control.hasAttribute('data-required-if-visible')){
        control.required = true;
      }
    });
  }

  function setDeliveryRequired(isDelivery){
    form.querySelectorAll('[data-required-if-delivery]').forEach(function(control){
      control.required = !!isDelivery;
      control.disabled = !isDelivery;
      if(!isDelivery && (control.type === 'checkbox' || control.type === 'radio')) control.checked = false;
    });
  }

  function setRecipientRequired(show){
    setPanel(els.recipientPanel, show);
    form.querySelectorAll('[data-required-if-recipient]').forEach(function(control){
      control.required = !!show;
    });
  }

  function hasCake(){ return !!(els.productCake && els.productCake.checked); }
  function hasCupcakes(){ return !!(els.productCupcakes && els.productCupcakes.checked); }
  function hasAnyProduct(){ return hasCake() || hasCupcakes(); }

  function productLabel(){
    if(hasCake() && hasCupcakes()) return 'Custom Cake + Cupcakes';
    if(hasCake()) return 'Custom Cake';
    if(hasCupcakes()) return 'Cupcakes';
    return 'Choose cake, cupcakes or both';
  }

  function validateProductSelection(show){
    var ok = hasAnyProduct();
    if(els.productCake){
      els.productCake.setCustomValidity(ok ? '' : 'Please choose cake, cupcakes or both.');
    }
    if(els.productFeedback){
      els.productFeedback.hidden = ok || !show;
    }
    return ok;
  }

  function cakeFlavourSurcharge(){
    if(!hasCake() || !els.flavour) return 0;
    var opt = selectedOption(els.flavour);
    if(!opt) return 0;
    var add = parseFloat(opt.getAttribute('data-price-add') || '0');
    return Number.isFinite(add) ? add : 0;
  }

  function cakeFlavourLabel(){
    if(!hasCake() || !els.flavour || !els.flavour.value) return '';
    var opt = selectedOption(els.flavour);
    var tier = opt ? opt.getAttribute('data-flavour-tier') : '';
    if(tier === 'premium') return els.flavour.value + ' (premium flavour from +' + money(PREMIUM_CAKE_FLAVOUR_FROM) + ')';
    return els.flavour.value;
  }

  function cakeEstimate(){
    if(!hasCake()) return { price:0, label:'Not selected', flavourAdd:0 };
    var sizePrice = optionPrice(els.cakeSize);
    var label = optionLabel(els.cakeSize);
    var cat = selectedRadio('cake_category');
    var catLabel = cat ? cat.value : 'Cake';
    var catBase = cat ? parseFloat(cat.getAttribute('data-base-price') || '55') : 55;
    if(!Number.isFinite(catBase) || catBase <= 0) catBase = 55;

    var basePrice = sizePrice > 0 ? sizePrice : catBase;
    if(catLabel === 'Themed Cake' && basePrice < 65) basePrice = 65;
    if(catLabel === 'Wedding / Tiered Cake' && basePrice < 150) basePrice = 150;
    if(catLabel === 'Mini / Bento Cake' && (!label || label.indexOf('Mini / Bento') !== -1) && basePrice < 35) basePrice = 35;

    var flavourAdd = cakeFlavourSurcharge();
    var total = basePrice + flavourAdd;
    var flavour = cakeFlavourLabel();
    var displayLabel = (sizePrice > 0 ? label : catLabel + ' - guide') || catLabel;
    if(flavour) displayLabel += ' · ' + flavour;
    return { price: total, label: displayLabel, basePrice: basePrice, flavourAdd: flavourAdd };
  }

  function cupcakeEstimate(){
    if(!hasCupcakes()) return { price:0, label:'Not selected' };
    var price = optionPrice(els.cupcakeQty);
    var label = optionLabel(els.cupcakeQty);
    if(price > 0) return { price:price, label:label };
    return { price:24, label:'Cupcakes - guide from ' + money(24) };
  }

  function cupcakeFlavourLimit(){
    var value = els.cupcakeQty ? els.cupcakeQty.value : '';
    if(value.indexOf('6 cupcakes') === 0) return 1;
    if(value.indexOf('12 cupcakes') === 0 || value.indexOf('18 cupcakes') === 0) return 2;
    if(value.indexOf('24 cupcakes') === 0 || value.indexOf('36 cupcakes') === 0 || value.indexOf('48 cupcakes') === 0 || value.indexOf('96 cupcakes') === 0) return 3;
    return 1;
  }

  function selectedCupcakeFlavours(){
    return Array.prototype.slice.call(form.querySelectorAll('[data-cupcake-flavour]:checked')).map(function(input){ return input.value; });
  }

  function updateCupcakeFlavourRules(changedInput){
    var boxes = Array.prototype.slice.call(form.querySelectorAll('[data-cupcake-flavour]'));
    var limit = cupcakeFlavourLimit();
    var selected = boxes.filter(function(input){ return input.checked; });
    if(selected.length > limit){
      if(changedInput && changedInput.checked && changedInput.hasAttribute('data-cupcake-flavour')){
        changedInput.checked = false;
      } else {
        selected.slice(limit).forEach(function(input){ input.checked = false; });
      }
      selected = boxes.filter(function(input){ return input.checked; });
    }
    boxes.forEach(function(input){
      input.disabled = !hasCupcakes() || (!input.checked && selected.length >= limit);
    });
    if(els.cupcakeFlavourFeedback){
      if(hasCupcakes() && selected.length >= limit){
        els.cupcakeFlavourFeedback.hidden = false;
        els.cupcakeFlavourFeedback.textContent = limit === 1 ? 'This box size allows 1 cupcake flavour.' : 'This box size allows up to ' + limit + ' cupcake flavours.';
      } else {
        els.cupcakeFlavourFeedback.hidden = true;
        els.cupcakeFlavourFeedback.textContent = '';
      }
    }
  }


  var fileQueue = [];
  var canProgrammaticallySetFiles = typeof window.DataTransfer !== 'undefined';

  function filesToArray(files){
    return Array.prototype.slice.call(files || []);
  }

  function fileKey(file){
    if(!file) return '';
    return [file.name || '', file.size || 0, file.lastModified || 0, file.type || ''].join('::');
  }

  function maxUploadFiles(){
    if(!els.fileInput) return 0;
    var max = parseInt(els.fileInput.getAttribute('data-max-files') || '', 10);
    return Number.isFinite(max) && max > 0 ? max : 0;
  }

  function formatFileSize(bytes){
    bytes = Number(bytes) || 0;
    if(bytes <= 0) return '0 KB';
    if(bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1) + ' MB';
  }

  function applyFileQueue(){
    if(!els.fileInput || !canProgrammaticallySetFiles) return;
    try {
      var dt = new window.DataTransfer();
      fileQueue.forEach(function(file){ dt.items.add(file); });
      els.fileInput.files = dt.files;
    } catch(err) {
      canProgrammaticallySetFiles = false;
    }
  }

  function setFileFeedback(message){
    if(els.fileFeedback) els.fileFeedback.textContent = message || '';
  }

  function currentFiles(){
    return canProgrammaticallySetFiles && fileQueue.length ? fileQueue : filesToArray(els.fileInput ? els.fileInput.files : []);
  }

  function renderFileList(files){
    if(!els.fileList) return;
    els.fileList.innerHTML = '';
    if(!files.length){
      els.fileList.hidden = true;
      return;
    }
    files.forEach(function(file, index){
      var li = document.createElement('li');
      var name = document.createElement('span');
      name.textContent = file.name || ('File ' + (index + 1));
      li.appendChild(name);

      var size = document.createElement('small');
      size.textContent = formatFileSize(file.size || 0);
      li.appendChild(size);

      if(canProgrammaticallySetFiles){
        var btn = document.createElement('button');
        btn.className = 'upload-file-remove';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Remove ' + (file.name || 'file'));
        btn.setAttribute('data-file-remove-index', String(index));
        btn.textContent = '×';
        li.appendChild(btn);
      }
      els.fileList.appendChild(li);
    });
    els.fileList.hidden = false;
  }

  function mergeSelectedFiles(files){
    if(!els.fileInput) return;
    var incoming = filesToArray(files);
    if(!canProgrammaticallySetFiles){
      updateFileLabel();
      return;
    }
    if(!incoming.length){
      updateFileLabel();
      return;
    }

    var max = maxUploadFiles();
    var merged = fileQueue.slice();
    var seen = Object.create(null);
    merged.forEach(function(file){ seen[fileKey(file)] = true; });
    incoming.forEach(function(file){
      var key = fileKey(file);
      if(!seen[key]){
        merged.push(file);
        seen[key] = true;
      }
    });

    var trimmed = false;
    if(max && merged.length > max){
      merged = merged.slice(0, max);
      trimmed = true;
    }

    fileQueue = merged;
    applyFileQueue();
    updateFileLabel();
    if(trimmed){
      setFileFeedback(max === 1 ? 'You can upload one file only. Extra files were not added.' : 'You can upload up to ' + max + ' files. Extra files were not added.');
    }
  }

  function removeQueuedFile(index){
    if(!els.fileInput || !canProgrammaticallySetFiles) return;
    fileQueue.splice(index, 1);
    applyFileQueue();
    els.fileInput.setCustomValidity('');
    setFileFeedback('');
    updateFileLabel();
  }

  function deliverySummary(){
    var f = selectedRadio('fulfilment');
    if(!f || f.value === 'collection') return 'Collection preferred';
    var pc = document.getElementById('boPostcode');
    var val = pc && pc.value ? pc.value.trim() : '';
    return val ? ('Delivery to ' + val) : 'Delivery - postcode needed';
  }

  function updatePanels(changedInput){
    setPanel(els.cakePanel, hasCake());
    setPanel(els.cupcakePanel, hasCupcakes());
    if(els.bundleUnlocked) els.bundleUnlocked.hidden = !(hasCake() && hasCupcakes());

    var fulfilment = selectedRadio('fulfilment');
    var isDelivery = fulfilment && fulfilment.value === 'delivery';
    if(els.collectionPanel) els.collectionPanel.hidden = !!isDelivery;
    setPanel(els.deliveryPanel, !!isDelivery);
    setDeliveryRequired(!!isDelivery);

    var rec = selectedRadio('delivery_recipient');
    var someoneElse = !!(isDelivery && rec && rec.value === 'Someone else will receive it');
    setRecipientRequired(someoneElse);

    if(els.dietaryNote && els.dietary){
      els.dietaryNote.hidden = (els.dietary.value || 'Standard') === 'Standard';
    }
    if(els.cupcakeDietaryNote && els.cupcakeDietary){
      els.cupcakeDietaryNote.hidden = (els.cupcakeDietary.value || 'Standard') === 'Standard';
    }

    validateProductSelection(form.classList.contains('was-validated'));
    updateCupcakeFlavourRules(changedInput);
  }

  function updateFileLabel(){
    if(!els.fileInput || !els.fileLabel || !els.uploadDrop) return;
    var files = currentFiles();
    if(!files.length){
      els.fileLabel.textContent = 'Drop one inspo pic here or click to browse';
      els.uploadDrop.classList.remove('has-files');
      renderFileList([]);
      setFileFeedback('');
      return;
    }
    els.uploadDrop.classList.add('has-files');
    if(files.length === 1){
      els.fileLabel.textContent = 'Selected: ' + files[0].name;
    } else {
      els.fileLabel.textContent = files.length === 1 ? 'Selected: ' + files[0].name : 'Selected: ' + files.length + ' files';
    }
    renderFileList(files);
    if(!els.fileInput.validationMessage) setFileFeedback('');
  }

  function updateSummary(){
    var cake = cakeEstimate();
    var cupcakes = cupcakeEstimate();
    var discount = (hasCake() && hasCupcakes() && cupcakes.price > 0) ? cupcakes.price * DISCOUNT_RATE : 0;
    var total = Math.max(0, cake.price + cupcakes.price - discount);
    var products = productLabel();
    var delivery = deliverySummary();
    var cupcakeFlavours = selectedCupcakeFlavours();

    if(els.summaryProducts) els.summaryProducts.textContent = products;
    if(els.summaryCake) els.summaryCake.textContent = hasCake() ? (cake.label + ' - from ' + money(cake.price)) : 'Not selected';
    if(els.summaryCupcakes) els.summaryCupcakes.textContent = hasCupcakes() ? (cupcakes.label + ' - from ' + money(cupcakes.price)) : 'Not selected';
    if(els.summaryDiscountRow) els.summaryDiscountRow.hidden = discount <= 0;
    if(els.summaryDiscount) els.summaryDiscount.textContent = '-' + money(discount);
    if(els.summaryDelivery) els.summaryDelivery.textContent = delivery;
    if(els.summaryTotal) els.summaryTotal.textContent = total > 0 ? money(total) : '\u00a30';
    if(els.summaryTotalNote){
      els.summaryTotalNote.textContent = total > 0 ? 'Starting estimate only. Final quote is confirmed after review.' : 'Select an option to see a guide price.';
    }

    if(els.orderSelection) els.orderSelection.value = products;
    if(els.hiddenProducts) els.hiddenProducts.value = products;
    if(els.hiddenCakeEstimate) els.hiddenCakeEstimate.value = hasCake() ? (cake.label + ' - from ' + money(cake.price)) : 'Not selected';
    if(els.hiddenCupcakeEstimate) els.hiddenCupcakeEstimate.value = hasCupcakes() ? (cupcakes.label + ' - from ' + money(cupcakes.price) + (cupcakeFlavours.length ? ' · flavours: ' + cupcakeFlavours.join(', ') : '')) : 'Not selected';
    if(els.hiddenBundleDiscount) els.hiddenBundleDiscount.value = discount > 0 ? ('-' + money(discount) + ' (20% off cupcakes)') : 'Not applied';
    if(els.hiddenEstimatedTotal) els.hiddenEstimatedTotal.value = total > 0 ? ('from ' + money(total)) : 'Not calculated';
    if(els.hiddenDeliverySummary) els.hiddenDeliverySummary.value = delivery;

    var date = document.getElementById('boDate');
    var occasion = document.getElementById('boOccasion');
    var summary = [
      'Products: ' + products,
      'Occasion: ' + (occasion && occasion.value ? occasion.value : 'not selected'),
      'Event date: ' + (date && date.value ? date.value : 'not selected'),
      'Cake: ' + (hasCake() ? cake.label + ' from ' + money(cake.price) : 'not selected'),
      'Cake flavour surcharge: ' + (cake.flavourAdd > 0 ? 'from +' + money(cake.flavourAdd) : 'not applied'),
      'Cupcakes: ' + (hasCupcakes() ? cupcakes.label + ' from ' + money(cupcakes.price) : 'not selected'),
      'Cupcake flavours: ' + (cupcakeFlavours.length ? cupcakeFlavours.join(', ') : 'not selected'),
      'Bundle discount: ' + (discount > 0 ? '-' + money(discount) : 'not applied'),
      'Delivery: ' + delivery,
      'Estimated from: ' + (total > 0 ? money(total) : 'not calculated'),
      'Note: final quote may change after design review, extras and postcode.'
    ].join(' | ');
    if(els.hiddenRequestSummary) els.hiddenRequestSummary.value = summary;
  }

  function updateAll(changedInput){
    updateEventDateMin();
    updatePanels(changedInput);
    validateEventDate();
    updateSummary();
  }

  form.addEventListener('change', function(event){
    if(event.target === els.fileInput){
      mergeSelectedFiles(els.fileInput.files);
    }
    updateAll(event.target);
  });
  form.addEventListener('input', function(event){
    if(event.target === els.eventDate) validateEventDate();
    updateSummary();
  });

  form.addEventListener('click', function(event){
    var removeButton = event.target && event.target.closest ? event.target.closest('[data-file-remove-index]') : null;
    if(!removeButton) return;
    event.preventDefault();
    var index = parseInt(removeButton.getAttribute('data-file-remove-index') || '-1', 10);
    if(Number.isFinite(index) && index >= 0){
      removeQueuedFile(index);
      updateAll();
      if(els.fileInput){
        try { els.fileInput.dispatchEvent(new Event('change', { bubbles:true })); } catch(err) {}
      }
    }
  });

  form.addEventListener('reset', function(){
    window.setTimeout(function(){
      fileQueue = [];
      applyFileQueue();
      updateFileLabel();
      updateAll();
    }, 0);
  });

  if(els.uploadDrop && els.fileInput){
    ['dragenter','dragover'].forEach(function(name){
      els.uploadDrop.addEventListener(name, function(e){
        e.preventDefault();
        els.uploadDrop.classList.add('is-dragover');
      });
    });
    ['dragleave','drop'].forEach(function(name){
      els.uploadDrop.addEventListener(name, function(e){
        e.preventDefault();
        els.uploadDrop.classList.remove('is-dragover');
      });
    });
    els.uploadDrop.addEventListener('drop', function(e){
      var dt = e.dataTransfer;
      if(dt && dt.files && dt.files.length){
        mergeSelectedFiles(dt.files);
        updateAll();
        try { els.fileInput.dispatchEvent(new Event('change', { bubbles:true })); } catch(err) {}
      }
    });
  }

  form.addEventListener('submit', function(e){
    validateProductSelection(true);
    validateEventDate();
    updateAll();
    if(!form.checkValidity()){
      e.preventDefault();
      form.classList.add('was-validated');
      validateProductSelection(true);
      var firstInvalid = form.querySelector(':invalid');
      if(firstInvalid){
        try { firstInvalid.focus({preventScroll:false}); } catch(err) { firstInvalid.focus(); }
        try { firstInvalid.reportValidity(); } catch(err2) {}
      }
    }
  }, true);

  updateEventDateMin();
  validateEventDate();
  updateFileLabel();
  updateAll();
})();
