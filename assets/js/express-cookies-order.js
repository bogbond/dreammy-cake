// Freshly Made Cookies – order form client-side logic (pack size selector + estimate)
// Notes:
// - No extras
// - Delivery fee is confirmed separately (not included in estimate)
// - Uses event delegation and re-queries the form to survive DOM moves by product.js
(function () {
  var PACK_PRICES = {
    4: 14,
    6: 20,
    12: 38
  };

  var IDS = {
    formSelector: 'form[data-product="freshly-made-cookies"]',

    // UI controls
    packRadiosSelector: 'input[name="cookie_pack_ui"]',
    flavourSelect: 'products-freshly-made-cookies-index-f1-flavour-select',
    deliveryOption: 'products-freshly-made-cookies-index-f1-delivery-option',
    postcode: 'products-freshly-made-cookies-index-f1-postcode',

    // UI display
    estimateDisplay: 'products-freshly-made-cookies-index-f1-estimate-display',

    // Hidden fields for email (formsubmit)
    hiddenPack: 'products-freshly-made-cookies-index-f1-pack-size-hidden',
    hiddenBase: 'products-freshly-made-cookies-index-f1-base-price',
    hiddenEstimate: 'products-freshly-made-cookies-index-f1-estimated-price',
    hiddenFlavour: 'products-freshly-made-cookies-index-f1-flavour-hidden',
    hiddenDelivery: 'products-freshly-made-cookies-index-f1-collection-delivery-hidden',
    hiddenPostcode: 'products-freshly-made-cookies-index-f1-postcode-hidden',
    hiddenOrderSummary: 'products-freshly-made-cookies-index-f1-order-summary'
  };

  function money(amount) {
    var rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return '£' + rounded.toFixed(2);
  }

  function getForm() {
    return document.querySelector(IDS.formSelector);
  }

  function q(form, id) {
    if (!form) return null;
    return form.querySelector('#' + id);
  }

  function readPackSize(form) {
    if (!form) return 4;

    var checked = form.querySelector(IDS.packRadiosSelector + ':checked');
    var val = checked ? parseInt(checked.value || '4', 10) : 4;

    if (val !== 4 && val !== 6 && val !== 12) val = 4;
    return val;
  }

  function readFlavour(form) {
    var sel = q(form, IDS.flavourSelect);
    return sel ? (sel.value || '') : '';
  }

  function readDelivery(form) {
    var sel = q(form, IDS.deliveryOption);
    var v = sel ? (sel.value || '') : '';
    if (v === 'delivery') return 'Delivery';
    if (v === 'collection') return 'Collection';
    return '';
  }

  function readPostcode(form) {
    var input = q(form, IDS.postcode);
    return input ? (input.value || '').trim() : '';
  }

  function setPostcodeRequired(form, isRequired) {
    var input = q(form, IDS.postcode);
    if (!input) return;
    if (isRequired) input.setAttribute('required', '');
    else input.removeAttribute('required');
  }

  function updateAll(form) {
    if (!form) return;

    var pack = readPackSize(form);
    var base = PACK_PRICES[pack] || 14;
    var estimated = base;

    // UI: estimate badge
    var estimateEl = q(form, IDS.estimateDisplay);
    if (estimateEl) estimateEl.textContent = money(estimated);

    // Delivery: postcode required only for delivery
    var deliverySel = q(form, IDS.deliveryOption);
    var isDelivery = !!(deliverySel && deliverySel.value === 'delivery');
    setPostcodeRequired(form, isDelivery);

    var flavour = readFlavour(form);
    var deliveryLabel = readDelivery(form);
    var postcodeVal = isDelivery ? readPostcode(form) : '';

    // Hidden fields
    var hiddenPack = q(form, IDS.hiddenPack);
    if (hiddenPack) hiddenPack.value = String(pack);

    var hiddenBase = q(form, IDS.hiddenBase);
    if (hiddenBase) hiddenBase.value = String(base);

    var hiddenEst = q(form, IDS.hiddenEstimate);
    if (hiddenEst) hiddenEst.value = money(estimated);

    var hiddenFlavour = q(form, IDS.hiddenFlavour);
    if (hiddenFlavour) hiddenFlavour.value = flavour;

    var hiddenDelivery = q(form, IDS.hiddenDelivery);
    if (hiddenDelivery) hiddenDelivery.value = deliveryLabel;

    var hiddenPostcode = q(form, IDS.hiddenPostcode);
    if (hiddenPostcode) hiddenPostcode.value = postcodeVal;

    var hiddenSummary = q(form, IDS.hiddenOrderSummary);
    if (hiddenSummary) {
      hiddenSummary.value =
        'Pack: ' + pack + ' (' + money(base) + ')' +
        ' | Flavour: ' + (flavour || '—') +
        ' | Delivery: ' + (deliveryLabel || '—') +
        (isDelivery && postcodeVal ? (' (' + postcodeVal + ')') : '') +
        ' | Estimated: ' + money(estimated);
    }
  }

  function disableUiFields(form) {
    if (!form) return;

    // Disable UI-only inputs so email stays tidy (hidden fields carry the real values)
    try {
      var packs = form.querySelectorAll(IDS.packRadiosSelector);
      packs.forEach(function (el) { el.disabled = true; });
    } catch (e) {}

    var flavour = q(form, IDS.flavourSelect);
    if (flavour) flavour.disabled = true;

    var delivery = q(form, IDS.deliveryOption);
    if (delivery) delivery.disabled = true;

    var postcode = q(form, IDS.postcode);
    if (postcode) postcode.disabled = true;
  }

  function onAnyInput(e) {
    var form = getForm();
    if (!form) return;

    var t = e && e.target;
    if (!t || !form.contains(t)) return;

    updateAll(form);
  }

  function init() {
    var form = getForm();
    if (!form) return;

    // Safety: do nothing if key elements are missing
    if (!form.querySelector(IDS.packRadiosSelector) || !q(form, IDS.estimateDisplay)) return;

    document.addEventListener('input', onAnyInput);
    document.addEventListener('change', onAnyInput);

    // Ensure hidden fields are always up to date right before submit
    form.addEventListener('submit', function () {
      updateAll(getForm());
      disableUiFields(getForm());
    });

    // Initial render
    updateAll(form);

    // Keep in sync if layout is remounted on breakpoint resize
    if (!window.__dc_express_cookies_resize_bound) {
      window.addEventListener('resize', function () {
        updateAll(getForm());
      });
      window.__dc_express_cookies_resize_bound = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
