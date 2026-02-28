// Express Bento Cake – order form client-side logic (extras + estimate)
(function () {
  var BASE_PRICE = 30;

  var EXTRA_PRICES = {
    plaque: 3,
    sprinkles: 2,
    bow: 2.5
  };

  var CAKE_COLOUR_SURCHARGE = {
    White: 0,
    Pink: 2,
    Blue: 2,
    Purple: 2,
    Red: 3
  };

  var IDS = {
    plaque: "products-express-bento-cake-index-f1-extra-topper",
    sprinkles: "products-express-bento-cake-index-f1-extra-sprinkles",
    bow: "products-express-bento-cake-index-f1-extra-bow",

    plaqueFieldsWrap: "products-express-bento-cake-index-f1-topper-fields",
    plaqueText: "products-express-bento-cake-index-f1-topper-text",

    cakeColour: "products-express-bento-cake-index-f1-cake-colour",
    cakeColourSurchargeLabel: "products-express-bento-cake-index-f1-cake-colour-surcharge",

    deliveryOption: "products-express-bento-cake-index-html-delivery-option",
    postcode: "products-express-bento-cake-index-f1-postcode",

    estimateDisplay: "products-express-bento-cake-index-f1-estimate-display",
    hiddenPrice: "products-express-bento-cake-index-f1-estimated-price",
    hiddenSummary: "products-express-bento-cake-index-f1-extras-summary"
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function money(amount) {
    var rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return "£" + rounded.toFixed(2);
  }

  function safeReset(el) {
    if (!el) return;
    try {
      if (el.tagName === "SELECT") {
        // Keep current selection unless explicitly reset elsewhere
        // (we don't reset cake colour automatically)
        el.selectedIndex = 0;
      } else if (el.type === "checkbox" || el.type === "radio") {
        el.checked = false;
      } else {
        el.value = "";
      }
    } catch (e) {}
  }

  function toggleSection(wrapId, fieldIds, shouldShow) {
    var wrap = byId(wrapId);
    if (wrap) {
      wrap.classList.toggle("d-none", !shouldShow);
      try {
        wrap.setAttribute("aria-hidden", (!shouldShow).toString());
      } catch (e) {}
    }

    (fieldIds || []).forEach(function (fid) {
      var el = byId(fid);
      if (!el) return;
      el.disabled = !shouldShow;
      if (!shouldShow) safeReset(el);
    });
  }

  function cakeColourInfo(value) {
    var v = value || "White";
    if (!Object.prototype.hasOwnProperty.call(CAKE_COLOUR_SURCHARGE, v)) v = "White";
    var s = CAKE_COLOUR_SURCHARGE[v] || 0;
    return { value: v, surcharge: s };
  }

  function updateCakeColourLabel(info) {
    var label = byId(IDS.cakeColourSurchargeLabel);
    if (!label) return;

    if (!info || info.value === "White" || info.surcharge === 0) {
      label.textContent = "Included (+£0)";
    } else {
      label.textContent = "(+£" + info.surcharge.toFixed(0) + ")";
    }
  }

  function readState() {
    var plaque = byId(IDS.plaque);
    var sprinkles = byId(IDS.sprinkles);
    var bow = byId(IDS.bow);

    var cakeColourEl = byId(IDS.cakeColour);
    var colour = cakeColourEl ? cakeColourEl.value : "White";

    var plaqueTextEl = byId(IDS.plaqueText);
    var plaqueText = plaqueTextEl ? (plaqueTextEl.value || "") : "";

    return {
      plaque: !!(plaque && plaque.checked),
      sprinkles: !!(sprinkles && sprinkles.checked),
      bow: !!(bow && bow.checked),
      cakeColour: colour || "White",
      plaqueText: plaqueText
    };
  }

  function buildSummary(state) {
    var parts = [];

    if (state.plaque) {
      var txt = (state.plaqueText || "").trim();
      parts.push('Lay-flat cake topper: "' + (txt || "").replace(/\s+/g, " ").slice(0, 25) + '"');
    }
    if (state.sprinkles) parts.push("Sprinkles");
    if (state.bow) parts.push("Bow");

    var colourInfo = cakeColourInfo(state.cakeColour);
    if (colourInfo.value && colourInfo.value !== "White") {
      parts.push("Cake colour: " + colourInfo.value);
    }


    if (!parts.length) return "None";

    return parts.join("; ");
  }

  function updateAll() {
    var state = readState();

    // Show/hide + enable/disable dependent fields (only plaque text)
    toggleSection(IDS.plaqueFieldsWrap, [IDS.plaqueText], state.plaque);

    // Plaque text is required only when plaque is selected
    var plaqueTextEl = byId(IDS.plaqueText);
    if (plaqueTextEl) {
      if (state.plaque) plaqueTextEl.setAttribute("required", "");
      else plaqueTextEl.removeAttribute("required");
    }

    // Delivery: postcode required only for delivery (fee confirmed later)
    var delivery = byId(IDS.deliveryOption);
    var postcode = byId(IDS.postcode);
    if (delivery && postcode) {
      var req = delivery.value === "delivery";
      if (req) postcode.setAttribute("required", "");
      else postcode.removeAttribute("required");
    }

    // Cake colour surcharge label
    var colourInfo = cakeColourInfo(state.cakeColour);
    updateCakeColourLabel(colourInfo);

    // Estimate (delivery not included)
    var total =
      BASE_PRICE +
      (state.plaque ? EXTRA_PRICES.plaque : 0) +
      (state.sprinkles ? EXTRA_PRICES.sprinkles : 0) +
      (state.bow ? EXTRA_PRICES.bow : 0) +
      (colourInfo.surcharge || 0);

    var totalStr = money(total);

    var display = byId(IDS.estimateDisplay);
    if (display) display.textContent = totalStr;

    var hiddenPrice = byId(IDS.hiddenPrice);
    if (hiddenPrice) hiddenPrice.value = totalStr;

    var hiddenSummary = byId(IDS.hiddenSummary);
    if (hiddenSummary) hiddenSummary.value = buildSummary(state);
  }

  function init() {
    // If the page doesn't have the expected elements, do nothing (safety)
    if (!byId(IDS.estimateDisplay) && !byId(IDS.hiddenPrice)) return;

    // Event delegation: resilient to product.js moving the order card between slots
    document.addEventListener("change", function (e) {
      var t = e.target;
      if (!t) return;
      var id = t.id || "";
      if (
        id === IDS.plaque ||
        id === IDS.sprinkles ||
        id === IDS.bow ||
        id === IDS.deliveryOption ||
        id === IDS.cakeColour
      ) {
        updateAll();
      }
    });

    document.addEventListener("input", function (e) {
      var t = e.target;
      if (!t) return;
      var id = t.id || "";
      // Update summary live as the user types plaque text
      if (id === IDS.plaqueText) updateAll();
    });

    // Initial render
    updateAll();

    // Keep in sync if layout is remounted on breakpoint resize
    if (!window.__dc_express_bento_resize_bound) {
      window.addEventListener("resize", function () {
        updateAll();
      });
      window.__dc_express_bento_resize_bound = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
