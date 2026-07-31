/**
 * Dreamy Cake — evergreen cake + cupcakes offer
 *
 * - Appears 25 seconds after the first eligible page is opened in the tab.
 * - Does not compete with the existing seasonal promo system.
 * - Frequency cap: 7 days after display/dismissal, 14 days after CTA click.
 * - Stores only local timestamps/action labels; nothing is transmitted by this script.
 */
(function () {
  "use strict";

  const CONFIG_URL = "/assets/data/bundle-popup.json";
  const STATE_KEY = "dc_bundle_offer_state_v1";
  const SESSION_KEY = "dc_bundle_offer_session_v1";
  const OVERLAY_ID = "dc-bundle-offer";
  const DAY_MS = 24 * 60 * 60 * 1000;
  const PAGE_STARTED_AT = Date.now();

  const FALLBACK = {
    enabled: true,
    id: "cake-cupcakes-bundle-v1",
    delaySeconds: 25,
    dismissCooldownDays: 7,
    ctaCooldownDays: 14,
    headline: "Complete your celebration",
    title: "Cake + matching cupcakes",
    badge: "20% off cupcakes",
    description: "Add matching cupcakes to your bespoke cake request and save 20% on the cupcake portion.",
    ctaLabel: "Start your bespoke order",
    dismissLabel: "Not now",
    href: "/Bespoke-Order/#bespoke-form",
    cakeImage: "/assets/img/items/themed-cake-main-rose-bouquet-gift-box-cake.webp",
    cakeImageAlt: "Bespoke birthday cake decorated with red roses",
    cupcakeImage: "/assets/img/items/cupcakes-main.webp",
    cupcakeImageAlt: "Matching personalised cupcakes",
    finePrint: "Final pricing depends on design, quantity and delivery.",
    excludedPaths: ["/Bespoke-Order/", "/Thank-You/", "/404.html"]
  };

  function parseJson(value, fallback) {
    try { return JSON.parse(value); } catch (error) { return fallback; }
  }

  function readStorage(storage, key, fallback) {
    try { return parseJson(storage.getItem(key) || "", fallback); } catch (error) { return fallback; }
  }

  function writeStorage(storage, key, value) {
    try { storage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  async function loadConfig() {
    try {
      const response = await fetch(CONFIG_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return Object.assign({}, FALLBACK, await response.json());
    } catch (error) {
      console.warn("[dc-bundle-offer] Config load failed; using fallback.", error);
      return Object.assign({}, FALLBACK);
    }
  }

  function normalisePath(pathname) {
    let path = String(pathname || "/").split("?")[0].split("#")[0];
    if (!path.startsWith("/")) path = "/" + path;
    if (path !== "/" && !path.endsWith("/") && !/\.[a-z0-9]+$/i.test(path)) path += "/";
    return path;
  }

  function isExcluded(cfg) {
    const current = normalisePath(window.location.pathname);
    return (cfg.excludedPaths || []).some(function (candidate) {
      const excluded = normalisePath(candidate);
      return current === excluded || current.startsWith(excluded);
    });
  }

  function getOfferState() {
    return readStorage(window.localStorage, STATE_KEY, {});
  }

  function setCooldown(cfg, days, action) {
    const now = Date.now();
    writeStorage(window.localStorage, STATE_KEY, {
      promoId: cfg.id,
      action: action,
      updatedAt: now,
      expiresAt: now + Math.max(1, Number(days) || 1) * DAY_MS
    });
  }

  function isInCooldown(cfg) {
    const state = getOfferState();
    return !!(
      state &&
      state.promoId === cfg.id &&
      Number(state.expiresAt || 0) > Date.now()
    );
  }

  function getSessionState(cfg) {
    const saved = readStorage(window.sessionStorage, SESSION_KEY, {});
    if (saved.promoId !== cfg.id) {
      return { promoId: cfg.id, startedAt: PAGE_STARTED_AT, shown: false };
    }

    const savedStartedAt = Number(saved.startedAt || 0);
    const legacyActiveMs = Math.max(0, Number(saved.activeMs || 0));

    return {
      promoId: cfg.id,
      // Migrate sessions created by the older active-time implementation.
      startedAt: savedStartedAt > 0 ? savedStartedAt : Date.now() - legacyActiveMs,
      shown: !!saved.shown
    };
  }

  function saveSessionState(state) {
    writeStorage(window.sessionStorage, SESSION_KEY, state);
  }

  function seasonalPromoExists() {
    return !!document.querySelector("#dc-promo-launcher, .dc-promo-overlay");
  }

  function blockingUiExists() {
    return !!document.querySelector(
      ".dc-consent-banner, .modal.show, .offcanvas.show, .dc-promo-overlay, #" + OVERLAY_ID
    );
  }

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildOffer(cfg) {
    const overlay = createElement("div", "dc-bundle-overlay");
    overlay.id = OVERLAY_ID;

    const dialog = createElement("section", "dc-bundle-modal");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "dc-bundle-title");
    dialog.setAttribute("aria-describedby", "dc-bundle-description");
    dialog.tabIndex = -1;

    const closeButton = createElement("button", "dc-bundle-close");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close offer");
    closeButton.innerHTML = "&times;";

    const visual = createElement("div", "dc-bundle-visual");
    const cake = createElement("img", "dc-bundle-cake");
    cake.src = cfg.cakeImage;
    cake.alt = cfg.cakeImageAlt || "Bespoke cake";
    cake.loading = "lazy";
    cake.decoding = "async";

    const cupcakeFrame = createElement("div", "dc-bundle-cupcake-frame");
    const cupcakes = createElement("img", "dc-bundle-cupcakes");
    cupcakes.src = cfg.cupcakeImage;
    cupcakes.alt = cfg.cupcakeImageAlt || "Matching cupcakes";
    cupcakes.loading = "lazy";
    cupcakes.decoding = "async";
    cupcakeFrame.appendChild(cupcakes);
    visual.appendChild(cake);
    visual.appendChild(cupcakeFrame);

    const content = createElement("div", "dc-bundle-content");
    const kicker = createElement("p", "dc-bundle-kicker", cfg.headline);
    const title = createElement("h2", "dc-bundle-title", cfg.title);
    title.id = "dc-bundle-title";
    const badge = createElement("p", "dc-bundle-offer-badge", cfg.badge);
    const description = createElement("p", "dc-bundle-description", cfg.description);
    description.id = "dc-bundle-description";

    const cta = createElement("a", "dc-bundle-cta", cfg.ctaLabel);
    cta.href = cfg.href;
    cta.innerHTML = '<span>' + cfg.ctaLabel + '</span><i class="bi bi-arrow-right" aria-hidden="true"></i>';

    const dismiss = createElement("button", "dc-bundle-dismiss", cfg.dismissLabel);
    dismiss.type = "button";

    content.appendChild(kicker);
    content.appendChild(title);
    content.appendChild(badge);
    content.appendChild(description);
    content.appendChild(cta);
    content.appendChild(dismiss);

    if (cfg.finePrint) {
      const finePrint = createElement("p", "dc-bundle-fine-print", cfg.finePrint);
      content.appendChild(finePrint);
    }

    dialog.appendChild(closeButton);
    dialog.appendChild(visual);
    dialog.appendChild(content);
    overlay.appendChild(dialog);

    return { overlay, dialog, closeButton, dismiss, cta };
  }

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (node) { return node.offsetParent !== null; });
  }

  function openOffer(cfg, sessionState) {
    if (document.getElementById(OVERLAY_ID) || seasonalPromoExists() || blockingUiExists()) return false;

    const ui = buildOffer(cfg);
    const previousFocus = document.activeElement;
    let closed = false;

    setCooldown(cfg, cfg.dismissCooldownDays, "shown");
    sessionState.shown = true;
    saveSessionState(sessionState);

    document.body.appendChild(ui.overlay);
    document.body.classList.add("dc-bundle-open");

    requestAnimationFrame(function () {
      ui.overlay.classList.add("is-visible");
      try { ui.dialog.focus({ preventScroll: true }); } catch (error) { ui.dialog.focus(); }
    });

    function removeDialog() {
      if (ui.overlay.parentNode) ui.overlay.parentNode.removeChild(ui.overlay);
      document.body.classList.remove("dc-bundle-open");
      try {
        if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
      } catch (error) {}
    }

    function closeOffer(action) {
      if (closed) return;
      closed = true;
      if (action === "cta") {
        setCooldown(cfg, cfg.ctaCooldownDays, "cta");
      } else {
        setCooldown(cfg, cfg.dismissCooldownDays, action || "dismissed");
      }
      ui.overlay.classList.remove("is-visible");
      document.removeEventListener("keydown", onKeyDown, true);
      window.setTimeout(removeDialog, 260);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOffer("escape");
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable(ui.dialog);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    ui.closeButton.addEventListener("click", function () { closeOffer("closed"); });
    ui.dismiss.addEventListener("click", function () { closeOffer("dismissed"); });
    ui.cta.addEventListener("click", function () {
      setCooldown(cfg, cfg.ctaCooldownDays, "cta");
    });
    ui.overlay.addEventListener("click", function (event) {
      if (event.target === ui.overlay) closeOffer("backdrop");
    });
    document.addEventListener("keydown", onKeyDown, true);
    return true;
  }

  function startOfferTimer(cfg, preparedState) {
    const requiredMs = Math.max(1, Number(cfg.delaySeconds) || 25) * 1000;
    const sessionState = preparedState || getSessionState(cfg);
    if (sessionState.shown || isInCooldown(cfg)) return;

    let completed = false;
    let timer = null;

    function persist() {
      saveSessionState(sessionState);
    }

    function elapsedSinceFirstPage() {
      const startedAt = Number(sessionState.startedAt || PAGE_STARTED_AT);
      return Math.max(0, Date.now() - startedAt);
    }

    function stopTimer() {
      completed = true;
      if (timer !== null) window.clearInterval(timer);
    }

    function attemptOpen() {
      if (completed || sessionState.shown || isInCooldown(cfg)) {
        stopTimer();
        return;
      }
      if (document.visibilityState !== "visible") return;
      if (seasonalPromoExists()) {
        stopTimer();
        return;
      }
      if (blockingUiExists()) return;
      if (openOffer(cfg, sessionState)) stopTimer();
    }

    function checkTimer() {
      if (elapsedSinceFirstPage() >= requiredMs) attemptOpen();
      persist();
    }

    // The timestamp is created before the seasonal-promo grace period, so
    // config loading and normal page-to-page navigation no longer extend the delay.
    persist();
    checkTimer();
    if (!completed) timer = window.setInterval(checkTimer, 250);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") checkTimer();
    });
    window.addEventListener("pagehide", persist, { once: true });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const cfg = await loadConfig();
    if (/page not found/i.test(document.title || "")) return;
    if (!cfg.enabled || !cfg.id || isExcluded(cfg) || isInCooldown(cfg)) return;

    const sessionState = getSessionState(cfg);
    saveSessionState(sessionState);

    // Give the seasonal script time to load its configuration and create a launcher.
    // This grace period is included in the 25-second session countdown.
    window.setTimeout(function () {
      if (seasonalPromoExists()) return;
      startOfferTimer(cfg, sessionState);
    }, 1200);
  });
})();
