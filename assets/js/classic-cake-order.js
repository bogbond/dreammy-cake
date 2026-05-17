// Classic Cake – order form client-side logic (size + style + topper + estimate)
(function () {
  var TOPPER_PRICE = 4.5; // GBP

  var SIZE_INFO = {
    "6 inch": { base: 60, servings: "8–12 servings" },
    "8 inch": { base: 80, servings: "14–20 servings" }
  };

  var STYLE_INFO = {
    choco: { name: "Chocolate & Biscoff Drip Cake", flavour: "Choco Biscoff" },
    teddy: { name: "White & Gold Teddy Cake", flavour: "Vanilla Raspberry" }
  };

  var IDS = {
    formSelector: 'form[data-product="classic-cake"]',

    // UI controls
    size6: "products-classic-cake-index-f1-size-6",
    size8: "products-classic-cake-index-f1-size-8",
    styleChoco: "products-classic-cake-index-f1-style-choco",
    styleTeddy: "products-classic-cake-index-f1-style-teddy",

    topper: "products-classic-cake-index-f1-extra-topper",
    topperFieldsWrap: "products-classic-cake-index-f1-topper-fields",
    topperText: "products-classic-cake-index-f1-topper-text",

    deliveryOption: "products-classic-cake-index-f1-delivery-option",
    postcode: "products-classic-cake-index-f1-postcode",

    estimateDisplay: "products-classic-cake-index-f1-estimate-display",

    // Hidden fields for email submission
    hiddenSize: "products-classic-cake-index-f1-size-hidden",
    hiddenStyle: "products-classic-cake-index-f1-style-hidden",
    hiddenBase: "products-classic-cake-index-f1-base-price",
    hiddenTopperSelected: "products-classic-cake-index-f1-topper-selected",
    hiddenTopperText: "products-classic-cake-index-f1-topper-text-hidden",
    hiddenEstimated: "products-classic-cake-index-f1-estimated-price",
    hiddenSummary: "products-classic-cake-index-f1-order-summary"
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

  function safeReset(el) {
    if (!el) return;
    try {
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = false;
      } else {
        el.value = "";
      }
    } catch (e) {}
  }

  function toggleSection(wrap, input, show) {
    if (wrap) {
      wrap.classList.toggle("d-none", !show);
      try { wrap.setAttribute("aria-hidden", (!show).toString()); } catch (e) {}
    }

    if (input) {
      input.disabled = !show;
      if (!show) safeReset(input);
    }
  }

  function readSize(form) {
    var s6 = q(form, IDS.size6);
    var s8 = q(form, IDS.size8);

    if (s8 && s8.checked) return "8 inch";
    if (s6 && s6.checked) return "6 inch";

    // Fallback
    return "6 inch";
  }

  function readStyle(form) {
    var choco = q(form, IDS.styleChoco);
    var teddy = q(form, IDS.styleTeddy);

    if (teddy && teddy.checked) return STYLE_INFO.teddy;
    if (choco && choco.checked) return STYLE_INFO.choco;

    // Fallback
    return STYLE_INFO.choco;
  }

  function updateAll(form) {
    if (!form) return;

    // Safety: if the essential elements are missing, do nothing
    if (!q(form, IDS.estimateDisplay)) return;

    var size = readSize(form);
    var sizeInfo = SIZE_INFO[size] || SIZE_INFO["6 inch"];

    var styleInfo = readStyle(form);

    var topperEl = q(form, IDS.topper);
    var topperOn = !!(topperEl && topperEl.checked);

    var topperWrap = q(form, IDS.topperFieldsWrap);
    var topperTextEl = q(form, IDS.topperText);

    toggleSection(topperWrap, topperTextEl, topperOn);

    // Topper text: required only when topper is selected
    var topperText = "";
    if (topperTextEl) {
      if (topperOn) {
        topperTextEl.setAttribute("required", "");
        topperText = (topperTextEl.value || "").trim().replace(/\s+/g, " ").slice(0, 25);
        // Keep DOM in sync if user pasted extra spaces
        if (topperTextEl.value !== topperText) {
          try { topperTextEl.value = topperText; } catch (e) {}
        }
      } else {
        topperTextEl.removeAttribute("required");
      }
    }

    // Delivery: postcode required only for delivery
    var deliveryEl = q(form, IDS.deliveryOption);
    var postcodeEl = q(form, IDS.postcode);
    if (deliveryEl && postcodeEl) {
      var req = deliveryEl.value === "delivery";
      if (req) postcodeEl.setAttribute("required", "");
      else postcodeEl.removeAttribute("required");
    }

    // Estimate (delivery fee is NOT included)
    var estimated = sizeInfo.base + (topperOn ? TOPPER_PRICE : 0);
    var estimatedStr = money(estimated);

    var estimateDisplay = q(form, IDS.estimateDisplay);
    if (estimateDisplay) estimateDisplay.textContent = estimatedStr;

    // Hidden fields
    var hiddenSize = q(form, IDS.hiddenSize);
    if (hiddenSize) hiddenSize.value = size;

    var hiddenStyle = q(form, IDS.hiddenStyle);
    if (hiddenStyle) hiddenStyle.value = styleInfo.name;

    var hiddenBase = q(form, IDS.hiddenBase);
    if (hiddenBase) hiddenBase.value = String(sizeInfo.base);

    var hiddenTopperSelected = q(form, IDS.hiddenTopperSelected);
    if (hiddenTopperSelected) hiddenTopperSelected.value = topperOn ? "Yes" : "No";

    var hiddenTopperText = q(form, IDS.hiddenTopperText);
    if (hiddenTopperText) hiddenTopperText.value = topperOn ? topperText : "";

    var hiddenEstimated = q(form, IDS.hiddenEstimated);
    if (hiddenEstimated) hiddenEstimated.value = estimatedStr;

    // Order summary (readable)
    var deliveryLabel = "";
    if (deliveryEl) {
      if (deliveryEl.value === "delivery") deliveryLabel = "Delivery";
      else if (deliveryEl.value === "collection") deliveryLabel = "Collection";
    }

    var postcodeVal = postcodeEl ? (postcodeEl.value || "").trim().replace(/\s+/g, " ") : "";

    var sizeLine = size + " (£" + sizeInfo.base.toFixed(0) + ", " + sizeInfo.servings + ")";
    var styleLine = styleInfo.name + " (" + styleInfo.flavour + " inside)";

    var topperLine = topperOn ? ("Yes" + (topperText ? ' ("' + topperText + '")' : "")) : "No";

    var deliveryLine = deliveryLabel ? deliveryLabel : "";
    if (deliveryLabel === "Delivery" && postcodeVal) {
      deliveryLine += " (" + postcodeVal + ")";
    }

    var summary =
      "Size: " + sizeLine +
      " | Style: " + styleLine +
      " | Topper: " + topperLine +
      " | Delivery: " + deliveryLine +
      " | Base: " + money(sizeInfo.base) +
      " | Estimated: " + estimatedStr;

    var hiddenSummary = q(form, IDS.hiddenSummary);
    if (hiddenSummary) hiddenSummary.value = summary;
  }

  function disableUiFields(form) {
    if (!form) return;

    // Disable UI-only inputs so the email stays tidy (hidden fields carry the real values)
    try {
      var sizeRadios = form.querySelectorAll('input[name="size_ui"]');
      sizeRadios.forEach(function (el) { el.disabled = true; });

      var styleRadios = form.querySelectorAll('input[name="style_ui"]');
      styleRadios.forEach(function (el) { el.disabled = true; });
    } catch (e) {}

    var topperEl = q(form, IDS.topper);
    if (topperEl) topperEl.disabled = true;

    var topperTextEl = q(form, IDS.topperText);
    if (topperTextEl) topperTextEl.disabled = true;
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

    // Safety: if key elements are missing, do nothing
    if (!q(form, IDS.estimateDisplay)) return;

    // Event delegation: resilient to product.js moving the order card between slots
    document.addEventListener("input", onAnyInput);
    document.addEventListener("change", onAnyInput);

    // Ensure hidden fields are always up to date right before submit
    form.addEventListener("submit", function () {
      updateAll(getForm());
      disableUiFields(getForm());
    });

    // Initial render
    updateAll(form);

    // Keep in sync if layout is remounted on breakpoint resize
    if (!window.__dc_classic_cake_resize_bound) {
      window.addEventListener("resize", function () {
        updateAll(getForm());
      });
      window.__dc_classic_cake_resize_bound = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
