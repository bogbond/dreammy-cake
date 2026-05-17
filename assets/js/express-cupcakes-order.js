// Express Cupcakes – order form client-side logic (quantity slider + extras per 6 + estimate)
(function () {
  var QTY_VALUES = [6, 12, 18, 24, 36, 48];
  var BASE_PRICES = [18, 34, 49, 63, 95, 120]; // GBP, matches QTY_VALUES by index

  var EXTRA_PER_6 = {
    sprinkles: 1,     // +£1 per 6 cupcakes
    ediblePrint: 2    // +£2 per 6 cupcakes
  };

  var IDS = {
    formSelector: 'form[data-product="express-cupcakes"]',

    qtyRange: "products-express-cupcakes-index-f1-qty-range",
    qtySelected: "products-express-cupcakes-index-f1-qty-selected",
    baseDisplay: "products-express-cupcakes-index-f1-base-display",

    sprinkles: "products-express-cupcakes-index-f1-extra-sprinkles",
    ediblePrint: "products-express-cupcakes-index-f1-extra-edible-print",

    ediblePrintFieldsWrap: "products-express-cupcakes-index-f1-edible-print-fields",
    ediblePrintDetails: "products-express-cupcakes-index-f1-edible-print-details",

    frostingSelect: "products-express-cupcakes-index-f1-frosting-select",

    deliveryOption: "products-express-cupcakes-index-html-delivery-option",
    postcode: "products-express-cupcakes-index-f1-postcode",

    estimateDisplay: "products-express-cupcakes-index-f1-estimate-display",

    hiddenQty: "products-express-cupcakes-index-f1-cupcake-quantity",
    hiddenBase: "products-express-cupcakes-index-f1-base-price",
    hiddenEstimate: "products-express-cupcakes-index-f1-estimated-price",
    hiddenExtrasSummary: "products-express-cupcakes-index-f1-extras-summary",
    hiddenFrosting: "products-express-cupcakes-index-f1-frosting-hidden",
    hiddenOrderSummary: "products-express-cupcakes-index-f1-order-summary"
  };

  function money(amount) {
    var rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return "£" + rounded.toFixed(2);
  }

  function getForm() {
    return document.querySelector(IDS.formSelector);
  }

  function q(form, id) {
    if (!form) return null;
    return form.querySelector("#" + id);
  }

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function readQty(form) {
    var range = q(form, IDS.qtyRange);
    var idx = 0;

    if (range) {
      idx = parseInt(range.value || "0", 10);
      if (isNaN(idx)) idx = 0;
      idx = clamp(idx, 0, QTY_VALUES.length - 1);

      // If value is out of range (shouldn't happen), fix the UI too
      if (range.value !== String(idx)) {
        try { range.value = String(idx); } catch (e) {}
      }
    }

    return {
      idx: idx,
      qty: QTY_VALUES[idx],
      base: BASE_PRICES[idx]
    };
  }

  function buildExtrasSummary(flags) {
    var parts = [];
    if (flags.ediblePrint) parts.push("Edible print");
    if (flags.sprinkles) parts.push("Sprinkles");
    return parts.length ? parts.join("; ") : "None";
  }

  function buildExtrasLine(flags, multiplier) {
    var parts = [];
    if (flags.ediblePrint) parts.push("Edible print (+" + money(multiplier * EXTRA_PER_6.ediblePrint) + ")");
    if (flags.sprinkles) parts.push("Sprinkles (+" + money(multiplier * EXTRA_PER_6.sprinkles) + ")");
    return parts.length ? parts.join("; ") : "None";
  }

  function toggleSection(wrap, input, show) {
    if (wrap) {
      wrap.classList.toggle("d-none", !show);
      try { wrap.setAttribute("aria-hidden", (!show).toString()); } catch (e) {}
    }
    if (input) {
      input.disabled = !show;
      if (!show) {
        // Optional field: clear when hidden to keep emails tidy
        try { input.value = ""; } catch (e) {}
      }
    }
  }

  function updateAll(form) {
    if (!form) return;

    var qtyInfo = readQty(form);

    var sprinklesEl = q(form, IDS.sprinkles);
    var edibleEl = q(form, IDS.ediblePrint);

    var flags = {
      sprinkles: !!(sprinklesEl && sprinklesEl.checked),
      ediblePrint: !!(edibleEl && edibleEl.checked)
    };

    var multiplier = qtyInfo.qty / 6; // always 1,2,3,4,6,8 for allowed sizes
    var extrasPer6 = (flags.sprinkles ? EXTRA_PER_6.sprinkles : 0) + (flags.ediblePrint ? EXTRA_PER_6.ediblePrint : 0);
    var extrasTotal = multiplier * extrasPer6;
    var estimated = qtyInfo.base + extrasTotal;

    // UI: selected qty + base
    var selectedEl = q(form, IDS.qtySelected);
    if (selectedEl) selectedEl.textContent = "Selected: " + qtyInfo.qty + " cupcakes";

    var baseEl = q(form, IDS.baseDisplay);
    if (baseEl) baseEl.textContent = money(qtyInfo.base);

    // UI: estimate badge
    var estimateEl = q(form, IDS.estimateDisplay);
    if (estimateEl) estimateEl.textContent = money(estimated);

    // Toggle edible print details
    var edibleWrap = q(form, IDS.ediblePrintFieldsWrap);
    var edibleDetails = q(form, IDS.ediblePrintDetails);
    toggleSection(edibleWrap, edibleDetails, flags.ediblePrint);

    // Delivery: postcode required only for delivery
    var delivery = q(form, IDS.deliveryOption);
    var postcode = q(form, IDS.postcode);
    if (delivery && postcode) {
      var req = delivery.value === "delivery";
      if (req) postcode.setAttribute("required", "");
      else postcode.removeAttribute("required");
    }

    // Frosting hidden (select does not submit as "frosting")
    var frostingSel = q(form, IDS.frostingSelect);
    var frostingValue = frostingSel ? (frostingSel.value || "Buttercream") : "Buttercream";

    // Hidden fields for email submission
    var hiddenQty = q(form, IDS.hiddenQty);
    if (hiddenQty) hiddenQty.value = String(qtyInfo.qty);

    var hiddenBase = q(form, IDS.hiddenBase);
    if (hiddenBase) hiddenBase.value = String(qtyInfo.base);

    var hiddenEst = q(form, IDS.hiddenEstimate);
    if (hiddenEst) hiddenEst.value = money(estimated);

    var hiddenExtras = q(form, IDS.hiddenExtrasSummary);
    if (hiddenExtras) hiddenExtras.value = buildExtrasSummary(flags);

    var hiddenFrosting = q(form, IDS.hiddenFrosting);
    if (hiddenFrosting) hiddenFrosting.value = frostingValue;

    var hiddenSummary = q(form, IDS.hiddenOrderSummary);
    if (hiddenSummary) {
      hiddenSummary.value =
        "Box: " + qtyInfo.qty +
        " | Base: " + money(qtyInfo.base) +
        " | Extras: " + buildExtrasLine(flags, multiplier) +
        " | Estimated: " + money(estimated);
    }
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
    if (!q(form, IDS.qtyRange) || !q(form, IDS.estimateDisplay)) return;

    document.addEventListener("input", onAnyInput);
    document.addEventListener("change", onAnyInput);

    // Initial render
    updateAll(form);

    // Keep in sync if layout is remounted on breakpoint resize
    if (!window.__dc_express_cupcakes_resize_bound) {
      window.addEventListener("resize", function () {
        updateAll(getForm());
      });
      window.__dc_express_cupcakes_resize_bound = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();