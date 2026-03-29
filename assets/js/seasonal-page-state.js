(function(){
  "use strict";

  var COPY_CONFIG = {
  "valentines": {
    "active": {
      "hero-highlights": "Limited slots • Two signature designs • Optional edible photo",
      "hero-note": "<strong>From £25</strong> — pre-orders open in Huntingdon &amp; surrounding areas.",
      "status-heading": "Valentine’s Pre-Orders are open 💌",
      "intro-1": "Two limited bento designs + a box of 6 cupcakes — made to gift, to photograph, and to remember.",
      "intro-2": "Choose your design, add a short message (or an edible photo), and I’ll confirm your slot by email.",
      "order-title": "Join the Pre-Order List",
      "submit-label": "Join the Pre-Order List",
      "sticky-label": "Join the Pre-Order List",
      "faq-cutoff-question": "When is the cut-off date for Valentine’s orders?",
      "faq-cutoff-answer": "Slots are limited and close once dates are full. Please pre-order early to avoid missing out."
    },
    "inactive": {
      "hero-highlights": "Romantic designs • Optional edible photo • Gift-ready finish",
      "hero-note": "<strong>From £25</strong> — seasonal collection available closer to Valentine’s Day.",
      "status-heading": "Valentine’s collection is seasonal 💌",
      "intro-1": "This collection returns in the run-up to Valentine’s Day, with gift-ready bento cakes and cupcakes made to order.",
      "intro-2": "You’re welcome to send an early enquiry now — I’ll let you know about the next release, availability and custom options.",
      "order-title": "Send an early enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "When will Valentine’s orders open?",
      "faq-cutoff-answer": "This collection is seasonal. Pre-orders usually open from {openDate}. You’re welcome to send an early enquiry any time."
    }
  },
  "mothers-day": {
    "active": {
      "hero-highlights": "Limited slots • Soft pastel gift boxes • Optional edible photo",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Mother’s Day pre-orders are open ✨",
      "intro-1": "A thoughtful Mother’s Day collection made to order — soft pastel cupcakes, gift-ready presentation and delicate details that photograph beautifully.",
      "intro-2": "Choose cupcakes, a bento cake or other sweet treats, add a short message (or an edible photo), and I’ll confirm your slot by email.",
      "order-title": "Join the Pre-Order List",
      "submit-label": "Join the Pre-Order List",
      "sticky-label": "Join the Pre-Order List",
      "faq-cutoff-question": "When do Mother’s Day pre-orders close?",
      "faq-cutoff-answer": "Slots are limited and close once dates are full. Please pre-order early to avoid missing out."
    },
    "inactive": {
      "hero-highlights": "Gift-ready treats • Soft pastel styling • Optional edible photo",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Mother’s Day collection is seasonal ✨",
      "intro-1": "This collection returns in the run-up to Mother’s Day, with gift-ready cupcakes, bento cakes and sweet treats made to order.",
      "intro-2": "You’re welcome to send an early enquiry now — I’ll let you know about the next release, availability and custom options.",
      "order-title": "Send an early enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "When will Mother’s Day orders open?",
      "faq-cutoff-answer": "This collection is seasonal. Pre-orders usually open from {openDate}. You’re welcome to send an early enquiry any time."
    }
  },
  "easter": {
    "active": {
      "hero-highlights": "Limited pre-orders • Traditional Ukrainian Easter bread • Spring gift boxes",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Easter pre-orders are open 🌷",
      "intro-1": "A seasonal Easter collection made to order — traditional Paska, soft spring cupcakes and elegant gift-ready presentation for family visits and holiday tables.",
      "intro-2": "Choose your Easter bakes and quantities, and I’ll confirm your collection or delivery slot by email.",
      "order-title": "Join the Pre-Order List",
      "submit-label": "Join the Pre-Order List",
      "sticky-label": "Join the Pre-Order List",
      "faq-cutoff-question": "When do Easter pre-orders close?",
      "faq-cutoff-answer": "Slots are limited and close once dates are full. Please pre-order early to avoid missing out."
    },
    "inactive": {
      "hero-highlights": "Traditional Easter Paska • Spring gift boxes • Made to order",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Easter collection is seasonal 🌷",
      "intro-1": "This collection returns in the run-up to Easter, with traditional Paska and spring cupcakes made to order.",
      "intro-2": "You’re welcome to send an early enquiry now — I’ll let you know about the next release, availability and custom options.",
      "order-title": "Send an early enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "When will Easter orders open?",
      "faq-cutoff-answer": "This collection is seasonal. Pre-orders usually open from {openDate}. You’re welcome to send an early enquiry any time."
    }
  },
  "fathers-day": {
    "active": {
      "hero-highlights": "Limited slots • Bold, modern designs • Optional edible photo",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Father’s Day pre-orders are open 👔",
      "intro-1": "A gift box made to order — clean, modern and seriously tasty.",
      "intro-2": "Choose bento cake, cupcakes or fondant cookies, add a message (or an edible photo), and I’ll confirm your slot.",
      "order-title": "Join the Pre-Order List",
      "submit-label": "Join the Pre-Order List",
      "sticky-label": "Join the Pre-Order List",
      "faq-cutoff-question": "When do Father’s Day pre-orders close?",
      "faq-cutoff-answer": "Slots are limited and close once dates are full. Please pre-order early to avoid missing out."
    },
    "inactive": {
      "hero-highlights": "Bold modern designs • Optional edible photo • Gift-ready finish",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Father’s Day collection is seasonal 👔",
      "intro-1": "This collection returns in the run-up to Father’s Day, with bold gift-ready bakes made to order.",
      "intro-2": "You’re welcome to send an early enquiry now — I’ll let you know about the next release, availability and custom options.",
      "order-title": "Send an early enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "When will Father’s Day orders open?",
      "faq-cutoff-answer": "This collection is seasonal. Pre-orders usually open from {openDate}. You’re welcome to send an early enquiry any time."
    }
  },
  "halloween": {
    "active": {
      "hero-highlights": "Limited slots • Spooky-cute designs • Optional edible photo",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Halloween pre-orders are open 🎃",
      "intro-1": "A spooky-cute treat box made to order — perfect for parties, gifts and weekend treats.",
      "intro-2": "Choose bento cake, cupcakes or fondant cookies, add a message (or an edible photo), and I’ll confirm your slot by email.",
      "order-title": "Join the Pre-Order List",
      "submit-label": "Join the Pre-Order List",
      "sticky-label": "Join the Pre-Order List",
      "faq-cutoff-question": "When do Halloween pre-orders close?",
      "faq-cutoff-answer": "Slots are limited and close once dates are full. Please pre-order early to avoid missing out."
    },
    "inactive": {
      "hero-highlights": "Spooky-cute designs • Optional edible photo • Made to order",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Halloween collection is seasonal 🎃",
      "intro-1": "This collection returns in the run-up to Halloween, with spooky-cute bakes made to order for parties, gifts and weekend treats.",
      "intro-2": "You’re welcome to send an early enquiry now — I’ll let you know about the next release, availability and custom options.",
      "order-title": "Send an early enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "When will Halloween orders open?",
      "faq-cutoff-answer": "This collection is seasonal. Pre-orders usually open from {openDate}. You’re welcome to send an early enquiry any time."
    }
  },
  "christmas": {
    "active": {
      "hero-highlights": "Limited slots • Festive designs • Optional edible photo",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Christmas pre-orders are open ✨",
      "intro-1": "A festive treat box made to order — perfect for gifting, hosting and little “thank you” moments.",
      "intro-2": "Choose bento cake, cupcakes or fondant cookies, add a message (or an edible photo), and I’ll confirm your slot by email.",
      "order-title": "Join the Pre-Order List",
      "submit-label": "Join the Pre-Order List",
      "sticky-label": "Join the Pre-Order List",
      "faq-cutoff-question": "When do Christmas pre-orders close?",
      "faq-cutoff-answer": "Slots are limited and close once dates are full. Please pre-order early to avoid missing out."
    },
    "inactive": {
      "hero-highlights": "Festive designs • Optional edible photo • Gift-ready finish",
      "hero-note": "Collection in Brampton + local delivery around Huntingdon &amp; nearby areas.",
      "status-heading": "Christmas collection is seasonal ✨",
      "intro-1": "This collection returns in the run-up to Christmas, with gift-ready festive bakes made to order.",
      "intro-2": "You’re welcome to send an early enquiry now — I’ll let you know about the next release, availability and custom options.",
      "order-title": "Send an early enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "When will Christmas orders open?",
      "faq-cutoff-answer": "This collection is seasonal. Pre-orders usually open from {openDate}. You’re welcome to send an early enquiry any time."
    }
  }
};
  var CONFIG_URL = (function(){
    try {
      var cs = document.currentScript;
      if (cs && cs.src) return new URL("../data/promo.json", cs.src).toString();
    } catch (e) {}
    return "/assets/data/promo.json";
  })();

  function getTZDateParts(tz) {
    try {
      var fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      var parts = fmt.formatToParts(new Date());
      var out = {};
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === "year" || parts[i].type === "month" || parts[i].type === "day") {
          out[parts[i].type] = Number(parts[i].value);
        }
      }
      if (out.year && out.month && out.day) return out;
    } catch (e) {}
    var now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }

  function utcDate(year, month, day) {
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }

  function addDaysUTC(date, days) {
    return new Date(date.getTime() + days * 86400000);
  }

  function easterSundayUTC(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return utcDate(year, month, day);
  }

  function motheringSundayUTC(year) {
    return addDaysUTC(easterSundayUTC(year), -21);
  }

  function fathersDayUTC(year) {
    var june1 = new Date(Date.UTC(year, 5, 1));
    var dow = june1.getUTCDay();
    var toFirstSunday = (7 - dow) % 7;
    return new Date(Date.UTC(year, 5, 1 + toFirstSunday + 14));
  }

  function resolveDateSpec(spec, year) {
    if (!spec) return null;
    if (typeof spec === "string") {
      var match = /^(\d{2})-(\d{2})$/.exec(spec.trim());
      return match ? utcDate(year, Number(match[1]), Number(match[2])) : null;
    }
    if (typeof spec === "object" && spec.rule) {
      var base = null;
      if (spec.rule === "easterSunday") base = easterSundayUTC(year);
      else if (spec.rule === "easterMonday") base = addDaysUTC(easterSundayUTC(year), 1);
      else if (spec.rule === "motheringSunday") base = motheringSundayUTC(year);
      else if (spec.rule === "fathersDay") base = fathersDayUTC(year);
      if (!base) return null;
      return addDaysUTC(base, Number(spec.offsetDays || 0));
    }
    return null;
  }

  function getRangeForYear(season, startYear) {
    var start = resolveDateSpec(season.dateFrom, startYear);
    var end = resolveDateSpec(season.dateTo, startYear);
    if (!start || !end) return null;
    if (end.getTime() < start.getTime()) {
      var nextEnd = resolveDateSpec(season.dateTo, startYear + 1);
      if (nextEnd) end = nextEnd;
    }
    return { start: start, end: end };
  }

  function getSeasonTimeline(season, tz) {
    var todayParts = getTZDateParts(tz || "Europe/London");
    var today = utcDate(todayParts.year, todayParts.month, todayParts.day);
    var ranges = [];
    for (var year = todayParts.year - 1; year <= todayParts.year + 2; year++) {
      var range = getRangeForYear(season, year);
      if (range) ranges.push(range);
    }
    ranges.sort(function(a, b){ return a.start.getTime() - b.start.getTime(); });
    var activeRange = null;
    var nextRange = null;
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      if (today.getTime() >= range.start.getTime() && today.getTime() <= range.end.getTime()) {
        activeRange = range;
        break;
      }
      if (!nextRange && range.start.getTime() > today.getTime()) nextRange = range;
    }
    if (!nextRange && ranges.length) nextRange = ranges[ranges.length - 1];
    return { today: today, activeRange: activeRange, nextRange: nextRange };
  }

  function formatDate(date) {
    if (!date) return "the seasonal opening date";
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        timeZone: "UTC"
      }).format(date);
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  function renderTemplate(str, vars) {
    return String(str || "").replace(/\{(\w+)\}/g, function(_, key){
      return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "";
    });
  }

  function applyCopy(copy, vars) {
    if (!copy) return;
    Object.keys(copy).forEach(function(key){
      var html = renderTemplate(copy[key], vars || {});
      var nodes = document.querySelectorAll('[data-season-copy="' + key + '"]');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].innerHTML = html;
      }
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function(){
    var root = document.querySelector('[data-season-page]');
    if (!root) return;
    var seasonId = root.getAttribute('data-season-page');
    var copy = COPY_CONFIG[seasonId];
    if (!copy) return;

    fetch(CONFIG_URL, { cache: 'no-store' })
      .then(function(res){ if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function(cfg){
        if (!cfg || !Array.isArray(cfg.seasons)) return null;
        var season = null;
        for (var i = 0; i < cfg.seasons.length; i++) {
          if (cfg.seasons[i] && cfg.seasons[i].id === seasonId) {
            season = cfg.seasons[i];
            break;
          }
        }
        if (!season) return null;
        var timeline = getSeasonTimeline(season, cfg.timezone || 'Europe/London');
        var vars = {
          openDate: formatDate(timeline.nextRange ? timeline.nextRange.start : null),
          endDate: formatDate(timeline.activeRange ? timeline.activeRange.end : null)
        };
        applyCopy(timeline.activeRange ? copy.active : copy.inactive, vars);
      })
      .catch(function(){
        applyCopy(copy.inactive, { openDate: 'the seasonal opening date', endDate: '' });
      });
  });
})();
