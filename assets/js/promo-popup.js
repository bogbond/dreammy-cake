/**
 * Dreamy Cake — Promo popup (home page)
 * - Desktop: center modal with dimmed backdrop
 * - Mobile: premium bottom-sheet style (non-blocking outside the sheet)
 * - Frequency cap: once per promoId per cooldown window (default 24h) via localStorage
 * - Content: assets/data/promo.json
 */
(function () {
  "use strict";

  const STATE_KEY = "dc_promo_state_v1";

  // Fallback config (used if JSON cannot be fetched, e.g. when opening the site directly via file://)
  const FALLBACK_CONFIG = {
    enabled: true,
    id: "mini-bento-spotlight",
    // Optional schedule window (local time). Use either ISO date (YYYY-MM-DD) or full datetime.
    // validFrom: "2026-02-01",
    // validTo: "2026-02-14",
    validFrom: null,
    validTo: null,
    headline: "Hot offer",
    title: "Mini / Bento Cake",
    subtitle: "A sweet surprise for your favourite person — limited slots this week.",
    image: "assets/img/items/mini-bento-cake-main.webp",
    imageAlt: "Mini bento cake with delicate decoration",
    href: "Products/mini-bento-cake/",
    ctaLabel: "More details",
    dismissLabel: "Not now",
    cooldownHours: 24,
    triggerDelayMs: 6000
  };

  function safeJsonParse(str, fallback) {
    try { return JSON.parse(str); } catch (e) { return fallback; }
  }

  function resolveConfigUrl() {
    // Resolve relative to this script (works with http(s) and file://)
    const cs = document.currentScript;
    if (cs && cs.src) {
      try {
        return new URL("../data/promo.json", cs.src).toString();
      } catch (e) {}
    }
    return "assets/data/promo.json";
  }

  async function loadConfig() {
    const url = resolveConfigUrl();
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const cfg = await res.json();
      return cfg;
    } catch (e) {
      console.warn("[dc-promo] Config load failed:", e);
      return (window.DC_PROMO_CONFIG || FALLBACK_CONFIG);
    }
  }

  function nowMs() { return Date.now ? Date.now() : new Date().getTime(); }

  function getState() {
    return safeJsonParse(localStorage.getItem(STATE_KEY) || "{}", {});
  }

  function setState(next) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(next || {})); } catch (e) {}
  }

  function pick(cfg, keys) {
    if (!cfg) return undefined;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (cfg[k] === undefined || cfg[k] === null) continue;
      const s = String(cfg[k]).trim();
      if (!s) continue;
      return cfg[k];
    }
    return undefined;
  }

  function parseBoundary(raw, mode) {
    // mode: "start" | "end"
    if (raw === undefined || raw === null) return NaN;
    if (typeof raw === "number" && isFinite(raw)) return raw;
    const s = String(raw).trim();
    if (!s) return NaN;

    // Treat date-only as LOCAL time (avoid UTC interpretation quirks of Date.parse("YYYY-MM-DD")).
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      return mode === "end"
        ? new Date(y, mo, d, 23, 59, 59, 999).getTime()
        : new Date(y, mo, d, 0, 0, 0, 0).getTime();
    }

    const t = Date.parse(s);
    return isNaN(t) ? NaN : t;
  }

  function inOptionalDateRange(cfg) {
    // Optional schedule window: validFrom / validTo (or valid_from / valid_to)
    const t = nowMs();
    const fromRaw = pick(cfg, ["validFrom", "valid_from"]);
    const toRaw = pick(cfg, ["validTo", "valid_to"]);

    if (fromRaw !== undefined) {
      const from = parseBoundary(fromRaw, "start");
      if (!isNaN(from) && t < from) return false;
    }
    if (toRaw !== undefined) {
      const to = parseBoundary(toRaw, "end");
      if (!isNaN(to) && t > to) return false;
    }
    return true;
  }

  function shouldShow(cfg) {
    if (!cfg || !cfg.enabled) return false;
    if (!cfg.id) return false;
    if (!inOptionalDateRange(cfg)) return false;

    const cooldownHours = Number(cfg.cooldownHours || 24);
    const cooldownMs = Math.max(1, cooldownHours) * 60 * 60 * 1000;

    const st = getState();
    if (st && st.promoId === cfg.id && st.lastShown) {
      const age = nowMs() - Number(st.lastShown || 0);
      if (age >= 0 && age < cooldownMs) return false;
    }
    return true;
  }

  function markShown(cfg) {
    setState({ promoId: cfg.id, lastShown: nowMs() });
  }

  function el(tag, attrs) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    return node;
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  }

  function buildPopup(cfg) {
    const overlay = el("div", { class: "dc-promo-overlay", hidden: "" });

    const modal = el("div", {
      class: "dc-promo-modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "dc-promo-title",
      "aria-describedby": "dc-promo-subtitle",
      tabindex: "-1"
    });

    const closeBtn = el("button", {
      class: "dc-promo-close",
      type: "button",
      "aria-label": "Close"
    });
    closeBtn.innerHTML = "&times;";

    const header = el("div", { class: "dc-promo-header" });

    if (cfg.headline) {
      header.appendChild(el("div", { class: "dc-promo-kicker", text: String(cfg.headline) }));
    }

    header.appendChild(el("div", { id: "dc-promo-title", class: "dc-promo-title", text: String(cfg.title || "") }));
    header.appendChild(el("div", { id: "dc-promo-subtitle", class: "dc-promo-subtitle", text: String(cfg.subtitle || "") }));

    const imgLink = el("a", { class: "dc-promo-image-link", href: cfg.href || "#", "aria-label": "Open offer details" });
    const imgWrap = el("div", { class: "dc-promo-image-wrap" });

    const img = el("img", {
      class: "dc-promo-image",
      src: cfg.image || "",
      alt: cfg.imageAlt || cfg.title || "Promotion image",
      loading: "lazy",
      decoding: "async"
    });

    imgWrap.appendChild(img);
    imgLink.appendChild(imgWrap);

    const actions = el("div", { class: "dc-promo-actions" });

    const cta = el("a", {
      class: "dc-promo-btn dc-promo-btn--primary",
      href: cfg.href || "#",
      text: String(cfg.ctaLabel || "More details")
    });

    const dismiss = el("button", {
      class: "dc-promo-btn dc-promo-btn--secondary",
      type: "button",
      text: String(cfg.dismissLabel || "Not now")
    });

    actions.appendChild(cta);
    actions.appendChild(dismiss);

    modal.appendChild(closeBtn);
    modal.appendChild(header);
    modal.appendChild(imgLink);
    modal.appendChild(actions);
    overlay.appendChild(modal);

    return { overlay, modal, closeBtn, dismiss, cta, imgLink };
  }

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((n) => n.offsetParent !== null);
  }

  function openPopup(cfg) {
    // Avoid stacking with bootstrap modals/offcanvas
    const anyBootstrapOpen = document.querySelector(".modal.show, .offcanvas.show");
    if (anyBootstrapOpen) return;

    markShown(cfg);

    const prevFocus = document.activeElement;
    const ui = buildPopup(cfg);
    document.body.appendChild(ui.overlay);

    // Show
    ui.overlay.hidden = false;
    document.body.classList.add("dc-promo-open");

    // Animate in
    requestAnimationFrame(() => {
      ui.overlay.classList.add("dc-is-visible");
      ui.modal.focus({ preventScroll: true });
    });

    let closed = false;

    const close = () => {
      if (closed) return;
      closed = true;

      document.body.classList.remove("dc-promo-open");
      ui.overlay.classList.remove("dc-is-visible");

      const remove = () => {
        if (ui.overlay && ui.overlay.parentNode) ui.overlay.parentNode.removeChild(ui.overlay);
        try { if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true }); } catch(e){}
      };

      const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) remove();
      else setTimeout(remove, 300);

      document.removeEventListener("keydown", onKeyDown, true);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      // Focus trap (desktop only; mobile is non-blocking)
      if (e.key === "Tab" && !isMobile()) {
        const focusable = getFocusable(ui.modal);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    ui.closeBtn.addEventListener("click", close);
    ui.dismiss.addEventListener("click", close);

    // Outside click closes on desktop only
    ui.overlay.addEventListener("click", (e) => {
      if (isMobile()) return;
      if (e.target === ui.overlay) close();
    });

    document.addEventListener("keydown", onKeyDown, true);

    if (!cfg.href) {
      [ui.cta, ui.imgLink].forEach((a) => {
        a.addEventListener("click", (e) => e.preventDefault());
      });
    }
  }

  function armOnce(cb) {
    let fired = false;
    return function () {
      if (fired) return;
      fired = true;
      cb();
    };
  }

  function whenVisible(run) {
    if (document.visibilityState === "visible") return run();
    const onVis = () => {
      if (document.visibilityState === "visible") {
        document.removeEventListener("visibilitychange", onVis);
        run();
      }
    };
    document.addEventListener("visibilitychange", onVis);
  }

  function waitForFirstEngagement(startTimer) {
    const fire = armOnce(() => startTimer());

    const opts = { passive: true, once: true };
    window.addEventListener("scroll", fire, opts);
    window.addEventListener("mousemove", fire, opts);
    window.addEventListener("touchstart", fire, opts);
    window.addEventListener("keydown", fire, opts);

    // Fallback: if the user stays idle but the page is visible, show after a longer delay
    setTimeout(() => fire(), 30000);
  }

  function initWithConfig(cfg) {
    if (!shouldShow(cfg)) return;

    const delayMs = Math.max(0, Number(cfg.triggerDelayMs || 6000));

    waitForFirstEngagement(() => {
      whenVisible(() => {
        setTimeout(() => {
          if (!shouldShow(cfg)) return;
          openPopup(cfg);
        }, delayMs);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const cfg = await loadConfig();
    if (cfg) initWithConfig(cfg);
  });
})();
