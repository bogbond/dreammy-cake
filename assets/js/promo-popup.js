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
  const LAUNCHER_ID = "dc-promo-launcher";

  // Fallback config (used if JSON cannot be fetched, e.g. when opening the site directly via file://)
  const FALLBACK_CONFIG = {
    // Default: disabled (we only show when an active seasonal promo is found)
    enabled: false,
    id: "seasonal",
    headline: "Hot offer",
    title: "",
    subtitle: "",
    image: "",
    imageAlt: "",
    href: "#",
    ctaLabel: "More details",
    dismissLabel: "Not now",
    cooldownHours: 24,
    triggerDelayMs: 6000
  };

  function safeJsonParse(str, fallback) {
    try { return JSON.parse(str); } catch (e) { return fallback; }
  }
  // --- Seasonal promo support (shared config for popup + menu) -----------------
  function getTZDateParts(tz) {
    try {
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      const parts = fmt.formatToParts(new Date());
      const get = (type) => {
        const p = parts.find((x) => x.type === type);
        return p ? p.value : null;
      };
      const y = Number(get("year"));
      const m = Number(get("month"));
      const d = Number(get("day"));
      if (y && m && d) return { year: y, month: m, day: d };
    } catch (e) {}
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() };
  }

  function utcDate(y, m, d) {
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  }

  function addDaysUTC(dt, days) {
    return new Date(dt.getTime() + days * 86400000);
  }

  function easterSundayUTC(year) {
    // Meeus/Jones/Butcher Gregorian algorithm
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=Mar, 4=Apr
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return utcDate(year, month, day);
  }

  function motheringSundayUTC(year) {
    // UK Mothering Sunday = 3 weeks before Easter Sunday
    return addDaysUTC(easterSundayUTC(year), -21);
  }

  function fathersDayUTC(year) {
    // 3rd Sunday in June (UK)
    const june1 = new Date(Date.UTC(year, 5, 1)); // month=5 => June
    const dow = june1.getUTCDay(); // 0=Sun
    const toFirstSunday = (7 - dow) % 7;
    const firstSundayDay = 1 + toFirstSunday;
    const thirdSundayDay = firstSundayDay + 14;
    return new Date(Date.UTC(year, 5, thirdSundayDay));
  }

  function resolveDateSpec(spec, year) {
    if (!spec) return null;
    if (typeof spec === "string") {
      const s = spec.trim();
      const m = /^(\d{2})-(\d{2})$/.exec(s);
      if (!m) return null;
      return utcDate(year, Number(m[1]), Number(m[2]));
    }
    if (typeof spec === "object" && spec.rule) {
      const rule = String(spec.rule);
      let base = null;
      if (rule === "easterSunday") base = easterSundayUTC(year);
      else if (rule === "easterMonday") base = addDaysUTC(easterSundayUTC(year), 1);
      else if (rule === "motheringSunday") base = motheringSundayUTC(year);
      else if (rule === "fathersDay") base = fathersDayUTC(year);
      if (!base) return null;
      const off = Number(spec.offsetDays || 0);
      return addDaysUTC(base, off);
    }
    return null;
  }

  function getCandidateRanges(season, year) {
    // Evaluate for the given start-year. If end < start, try end in next year (for cross-year seasons).
    const start = resolveDateSpec(season.dateFrom, year);
    if (!start) return [];
    let end = resolveDateSpec(season.dateTo, year);
    if (!end) return [];
    if (end.getTime() < start.getTime()) {
      const end2 = resolveDateSpec(season.dateTo, year + 1);
      if (end2) end = end2;
    }
    return [{ start, end }];
  }

  function findActiveSeason(seasons, tz) {
    if (!Array.isArray(seasons)) return null;
    const p = getTZDateParts(tz || "Europe/London");
    const today = utcDate(p.year, p.month, p.day);
    const yearsToCheck = [p.year, p.year - 1]; // handles cross-year ranges like Nov → Jan
    for (const season of seasons) {
      if (!season || season.enabled === false) continue;
      for (const y of yearsToCheck) {
        const ranges = getCandidateRanges(season, y);
        for (const r of ranges) {
          if (today.getTime() >= r.start.getTime() && today.getTime() <= r.end.getTime()) {
            return season;
          }
        }
      }
    }
    return null;
  }

  function normalizePromoConfig(raw) {
    if (!raw) return null;

    // New format: one config controls both menu + popup
    if (raw.seasons && Array.isArray(raw.seasons)) {
      const tz = raw.timezone || "Europe/London";
      const active = findActiveSeason(raw.seasons, tz);
      if (!active) return { enabled: false };

      const popup = (active.popup && active.popup.enabled !== false) ? active.popup : null;
      if (!popup) return { enabled: false };

      const defaults = (raw.popupDefaults && typeof raw.popupDefaults === "object") ? raw.popupDefaults : {};
      const cfg = Object.assign({}, defaults, popup);

      // Backfill sensible defaults
      cfg.enabled = true;
      cfg.id = cfg.id || active.id || "seasonal";
      cfg.title = cfg.title || active.name || "Seasonal collection";
      cfg.href = cfg.href || active.href || (active.orderHref || "#");

      return cfg;
    }

    // Old format: promo.json is a single popup config object
    return raw;
  }
  // ---------------------------------------------------------------------------


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
      const raw = await res.json();
      return normalizePromoConfig(raw);
    } catch (e) {
      console.warn("[dc-promo] Config load failed:", e);
      const raw = (window.DC_PROMO_CONFIG || FALLBACK_CONFIG);
      return normalizePromoConfig(raw);
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

  // --- Launcher (collapsed promo button) -------------------------------------
  function getLauncherLabel(cfg) {
    const explicit = pick(cfg, ["launcherLabel", "launcher_label"]);
    if (explicit !== undefined) return String(explicit);
    const t = String(cfg.title || "").trim();
    if (t && t.length <= 26) return t;
    return "Seasonal offer";
  }

  function ensureLauncher(cfg) {
    let btn = document.getElementById(LAUNCHER_ID);
    if (btn) return btn;
    btn = el("button", { id: LAUNCHER_ID, class: "dc-promo-launcher", type: "button" });
    btn.setAttribute("aria-label", "Open seasonal offer");
    btn.textContent = getLauncherLabel(cfg);
    document.body.appendChild(btn);
    return btn;
  }

  function showLauncher(btn, cfg) {
    if (!btn) return;
    if (cfg) btn.textContent = getLauncherLabel(cfg);
    btn.classList.add("dc-is-visible");
    positionLauncher(btn);
  }

  function hideLauncher(btn) {
    if (!btn) return;
    btn.classList.remove("dc-is-visible");
  }

  function getFixedBottomOffset(rect) {
    if (!rect) return 0;
    const distFromBottom = Math.max(0, Math.round(window.innerHeight - rect.bottom));
    return distFromBottom + Math.round(rect.height);
  }

  function computeLauncherBottomPx() {
    let base = 16;
    const gap = 10;

    // Cookie consent banner (full-width at bottom)
    const banner = document.querySelector(".dc-consent-banner");
    if (banner) {
      const r = banner.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        base = Math.max(base, getFixedBottomOffset(r) + gap);
      }
    }

    // Cookie "Manage" pill (bottom-left)
    const manage = document.querySelector(".dc-consent-manage");
    if (manage) {
      const r = manage.getBoundingClientRect();
      const cs = window.getComputedStyle(manage);
      const visible = r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
      if (visible) {
        base = Math.max(base, getFixedBottomOffset(r) + gap);
      }
    }

    return base;
  }

  function positionLauncher(btn) {
    if (!btn) return;
    const px = computeLauncherBottomPx();
    btn.style.setProperty("--dc-promo-launcher-bottom", `${px}px`);
  }

  function rectCenter(r) {
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function collapseTransform(modalRect, launcherRect) {
    if (!modalRect || !launcherRect) return null;
    const mc = rectCenter(modalRect);
    const lc = rectCenter(launcherRect);
    const dx = lc.x - mc.x;
    const dy = lc.y - mc.y;
    const scale = 0.22;
    return `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${scale})`;
  }
  // ---------------------------------------------------------------------------

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

  function openPopup(cfg, opts) {
    opts = opts || {};
    const launcher = opts.launcher || null;
    const fromLauncher = !!opts.fromLauncher;

    // Avoid stacking with bootstrap modals/offcanvas
    const anyBootstrapOpen = document.querySelector(".modal.show, .offcanvas.show");
    if (anyBootstrapOpen) return;

    markShown(cfg);

    const prevFocus = document.activeElement;
    const ui = buildPopup(cfg);
    document.body.appendChild(ui.overlay);

    // Launcher stays visible only when popup is collapsed/closed
    if (launcher) hideLauncher(launcher);

    ui.overlay.hidden = false;
    document.body.classList.add("dc-promo-open");

    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canCollapse = !prefersReduced && launcher && launcher.getBoundingClientRect;

    // If opened from launcher, animate from the launcher's position (unfold effect)
    if (fromLauncher && canCollapse) {
      try {
        const launcherRect = launcher.getBoundingClientRect();

        // Prevent flash while measuring
        ui.overlay.style.visibility = "hidden";
        ui.modal.classList.add("dc-no-anim");

        // Force final layout (visible state) to compute deltas
        ui.overlay.classList.add("dc-is-visible");
        const modalRect = ui.modal.getBoundingClientRect();
        const tr = collapseTransform(modalRect, launcherRect);
        if (tr) ui.modal.style.setProperty("--dc-promo-transform", tr);

        // Back to collapsed state (base) before animating in
        ui.overlay.classList.remove("dc-is-visible");
        ui.modal.classList.remove("dc-no-anim");
        ui.overlay.style.visibility = "";
      } catch (e) {
        ui.overlay.style.visibility = "";
        ui.modal.classList.remove("dc-no-anim");
        ui.overlay.classList.remove("dc-is-visible");
      }
    }

    // Animate in
    requestAnimationFrame(() => {
      ui.overlay.classList.add("dc-is-visible");
      ui.modal.focus({ preventScroll: true });
    });

    let closed = false;

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

    const close = () => {
      if (closed) return;
      closed = true;

      document.body.classList.remove("dc-promo-open");

      const remove = () => {
        if (ui.overlay && ui.overlay.parentNode) ui.overlay.parentNode.removeChild(ui.overlay);
        try { if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true }); } catch(e){}
        if (launcher) showLauncher(launcher, cfg);
      };

      // Collapse animation into launcher (if available)
      if (canCollapse) {
        try {
          const launcherRect = launcher.getBoundingClientRect();
          const modalRect = ui.modal.getBoundingClientRect();
          const tr = collapseTransform(modalRect, launcherRect);
          if (tr) ui.modal.style.setProperty("--dc-promo-transform", tr);
        } catch(e){}
      }

      ui.overlay.classList.remove("dc-is-visible");

      const prefersReduced2 = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced2) remove();
      else setTimeout(remove, 300);

      document.removeEventListener("keydown", onKeyDown, true);
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

  function initWithConfig(cfg, launcher) {
    if (!shouldShow(cfg)) return;

    const delayMs = Math.max(0, Number(cfg.triggerDelayMs || 6000));

    waitForFirstEngagement(() => {
      whenVisible(() => {
        setTimeout(() => {
          if (!shouldShow(cfg)) return;
          openPopup(cfg, { launcher });
        }, delayMs);
      });
    });

    // Safety fallback: show after 30s if user never interacts
    setTimeout(() => {
      if (document.hidden) return;
      if (!shouldShow(cfg)) return;
      openPopup(cfg, { launcher });
    }, 30000);
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const cfg = await loadConfig();
    if (!cfg || !cfg.enabled) return;

    const launcher = ensureLauncher(cfg);
    hideLauncher(launcher);

    // Keep the launcher from overlapping other fixed UI (cookie button/banner).
    const reposition = () => positionLauncher(launcher);
    reposition();
    window.addEventListener("resize", reposition);

    // Cookie banner is mounted/unmounted dynamically. Re-check position when DOM changes.
    if (window.MutationObserver && document.body) {
      const mo = new MutationObserver(() => reposition());
      mo.observe(document.body, { childList: true });
      // A couple of extra runs after load to catch late widgets.
      setTimeout(reposition, 300);
      setTimeout(reposition, 1000);
    }

    launcher.addEventListener("click", function () {
      openPopup(cfg, { launcher: launcher, fromLauncher: true });
    });

    // Auto-open at most once per cooldown window, but keep a small launcher button
    // so the promo can be reopened anytime.
    if (shouldShow(cfg)) {
      initWithConfig(cfg, launcher);
    } else {
      showLauncher(launcher, cfg);
    }
  });
})();
