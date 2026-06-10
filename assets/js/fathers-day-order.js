// Father’s Day Collection – order form calculator (product + quantity + card add-on)
(function () {
  "use strict";

  var CARD_PRICE = 3;

  var IDS = {
    formSelector: 'form[data-product="fathers-day-collection"]',
    product: "products-fathers-day-collection-index-f1-product",
    quantity: "products-fathers-day-collection-index-f1-quantity",
    cupcakeWrap: "products-fathers-day-collection-index-f1-cupcake-flavour-wrap",
    cupcakeFlavour: "products-fathers-day-collection-index-f1-cupcake-flavour",
    cardAddon: "products-fathers-day-collection-index-f1-card-add-on",
    cardMessageWrap: "products-fathers-day-collection-index-f1-card-message-wrap",
    cardMessage: "products-fathers-day-collection-index-f1-card-message",
    fulfilment: "products-fathers-day-collection-index-f1-fulfilment",
    postcode: "products-fathers-day-collection-index-f1-postcode",
    estimateDisplay: "products-fathers-day-collection-index-f1-estimate-display",
    estimateNote: "products-fathers-day-collection-index-f1-estimate-note",
    hiddenBase: "products-fathers-day-collection-index-f1-base-price",
    hiddenCard: "products-fathers-day-collection-index-f1-card-addon-price",
    hiddenEstimate: "products-fathers-day-collection-index-f1-estimated-price",
    hiddenSummary: "products-fathers-day-collection-index-f1-order-summary"
  };

  function money(amount) {
    var rounded = Math.round((Number(amount || 0) + Number.EPSILON) * 100) / 100;
    return "£" + rounded.toFixed(2);
  }

  function getForm() {
    return document.querySelector(IDS.formSelector);
  }

  function q(form, id) {
    return form ? form.querySelector("#" + id) : null;
  }

  function selectedOption(select) {
    return select && select.options ? select.options[select.selectedIndex] : null;
  }

  function optionLabel(option) {
    if (!option) return "";
    return option.getAttribute("data-label") || option.textContent || option.value || "";
  }

  function readProduct(form) {
    var select = q(form, IDS.product);
    var option = selectedOption(select);
    if (!select || !select.value || !option || option.disabled) {
      return { label: "", value: "", price: 0, requiresCupcakeFlavour: false };
    }
    var price = parseFloat(option.getAttribute("data-price") || "0");
    if (!Number.isFinite(price)) price = 0;
    return {
      label: optionLabel(option).trim(),
      value: select.value,
      price: price,
      requiresCupcakeFlavour: option.getAttribute("data-requires-cupcake-flavour") === "true"
    };
  }

  function readQuantity(form) {
    var input = q(form, IDS.quantity);
    var value = parseInt(input && input.value ? input.value : "1", 10);
    if (!Number.isFinite(value) || value < 1) value = 1;
    if (input && String(value) !== input.value) {
      try { input.value = String(value); } catch (e) {}
    }
    return value;
  }

  function setRequired(input, required) {
    if (!input) return;
    if (required) input.setAttribute("required", "");
    else input.removeAttribute("required");
  }

  function setDisabled(input, disabled, clear) {
    if (!input) return;
    input.disabled = !!disabled;
    if (disabled && clear) {
      try { input.value = ""; } catch (e) {}
    }
  }

  function toggleWrap(wrap, show) {
    if (!wrap) return;
    wrap.classList.toggle("d-none", !show);
    try { wrap.setAttribute("aria-hidden", (!show).toString()); } catch (e) {}
  }

  function updateAll(form) {
    if (!form) return;

    var product = readProduct(form);
    var qty = readQuantity(form);
    var base = product.price * qty;

    var cardSelect = q(form, IDS.cardAddon);
    var cardOn = !!(cardSelect && cardSelect.value === "Yes, add a card +£3");
    var cardTotal = cardOn ? CARD_PRICE : 0;
    var estimated = base + cardTotal;

    var cupcakeWrap = q(form, IDS.cupcakeWrap);
    var cupcakeFlavour = q(form, IDS.cupcakeFlavour);
    var needCupcakeFlavour = !!product.requiresCupcakeFlavour;
    toggleWrap(cupcakeWrap, needCupcakeFlavour);
    setDisabled(cupcakeFlavour, !needCupcakeFlavour, !needCupcakeFlavour);
    setRequired(cupcakeFlavour, needCupcakeFlavour);

    var cardWrap = q(form, IDS.cardMessageWrap);
    var cardMessage = q(form, IDS.cardMessage);
    toggleWrap(cardWrap, cardOn);
    setDisabled(cardMessage, !cardOn, !cardOn);
    setRequired(cardMessage, cardOn);

    var fulfilment = q(form, IDS.fulfilment);
    var fulfilmentOpt = selectedOption(fulfilment);
    var needsPostcode = !!(fulfilmentOpt && fulfilmentOpt.getAttribute("data-needs-postcode") === "true");
    var postcode = q(form, IDS.postcode);
    setRequired(postcode, needsPostcode);

    var estimateDisplay = q(form, IDS.estimateDisplay);
    if (estimateDisplay) estimateDisplay.textContent = product.value ? money(estimated) : "Choose product";

    var estimateNote = q(form, IDS.estimateNote);
    if (estimateNote) {
      if (!product.value) estimateNote.textContent = "Choose a product to calculate the estimate.";
      else if (fulfilment && fulfilment.value === "Paid delivery quote needed") estimateNote.textContent = "Paid delivery quote is confirmed separately and is not included.";
      else if (fulfilment && fulfilment.value.indexOf("Free local delivery") === 0) estimateNote.textContent = "Free local delivery adds £0 for Brampton, Huntingdon and Godmanchester.";
      else estimateNote.textContent = "Delivery quote is confirmed separately.";
    }

    var hiddenBase = q(form, IDS.hiddenBase);
    if (hiddenBase) hiddenBase.value = product.value ? money(base) : "Not calculated";

    var hiddenCard = q(form, IDS.hiddenCard);
    if (hiddenCard) hiddenCard.value = cardOn ? money(cardTotal) + " greeting card add-on" : "No card";

    var hiddenEstimate = q(form, IDS.hiddenEstimate);
    if (hiddenEstimate) hiddenEstimate.value = product.value ? money(estimated) : "Not calculated";

    var cupcakeText = needCupcakeFlavour ? (cupcakeFlavour && cupcakeFlavour.value ? cupcakeFlavour.value : "Not selected") : "Not applicable";
    var fulfilmentText = fulfilment && fulfilment.value ? fulfilment.value : "Not selected";
    var hiddenSummary = q(form, IDS.hiddenSummary);
    if (hiddenSummary) {
      hiddenSummary.value = product.value ?
        "Product: " + product.label +
        " | Quantity: " + qty +
        " | Base: " + money(base) +
        " | Cupcake flavour: " + cupcakeText +
        " | Greeting card: " + (cardOn ? "+" + money(CARD_PRICE) : "No") +
        " | Collection/delivery: " + fulfilmentText +
        " | Estimated: " + money(estimated) +
        " | Note: slot secured only after confirmation and full payment" :
        "Not calculated";
    }
  }

  function onAnyInput(e) {
    var form = getForm();
    if (!form) return;
    var target = e && e.target;
    if (!target || !form.contains(target)) return;
    updateAll(form);
  }

  function init() {
    var form = getForm();
    if (!form) return;
    if (!q(form, IDS.product) || !q(form, IDS.estimateDisplay)) return;

    document.addEventListener("input", onAnyInput);
    document.addEventListener("change", onAnyInput);
    updateAll(form);

    if (!window.__dc_fathers_day_resize_bound) {
      window.addEventListener("resize", function () { updateAll(getForm()); });
      window.__dc_fathers_day_resize_bound = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
