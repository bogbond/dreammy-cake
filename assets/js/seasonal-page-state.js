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
      "hero-note": "<strong>From £25</strong> — available to order year-round; featured seasonally around Valentine’s Day.",
      "status-heading": "Valentine’s collection is available to order year-round 💌",
      "intro-1": "Valentine’s bento cakes and cupcakes can be requested year-round, with seasonal promo slots highlighted closer to Valentine’s Day.",
      "intro-2": "Send an enquiry with your date, servings, style ideas and delivery details — I’ll confirm availability, price and the best options for your occasion.",
      "order-title": "Send an enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "Can I order the Valentine’s collection outside the seasonal promo window?",
      "faq-cutoff-answer": "Yes — these designs can be requested year-round. The collection is promoted more actively from {openDate}, but early enquiries are welcome any time."
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
      "status-heading": "Mother’s Day collection is available to order year-round ✨",
      "intro-1": "Mother’s Day cupcakes, bento cakes and sweet treats can be requested year-round, with seasonal promo slots highlighted closer to Mother’s Day.",
      "intro-2": "Send an enquiry with your date, servings, style ideas and delivery details — I’ll confirm availability, price and the best options for your occasion.",
      "order-title": "Send an enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "Can I order the Mother’s Day collection outside the seasonal promo window?",
      "faq-cutoff-answer": "Yes — these designs can be requested year-round. The collection is promoted more actively from {openDate}, but early enquiries are welcome any time."
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
      "status-heading": "Easter collection is available to order year-round 🌷",
      "intro-1": "Easter Paska, spring cakes and cupcakes can be requested year-round, with seasonal promo slots highlighted closer to Easter.",
      "intro-2": "Send an enquiry with your date, servings, style ideas and delivery details — I’ll confirm availability, price and the best options for your occasion.",
      "order-title": "Send an enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "Can I order the Easter collection outside the seasonal promo window?",
      "faq-cutoff-answer": "Yes — these designs can be requested year-round. The collection is promoted more actively from {openDate}, but early enquiries are welcome any time."
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
      "status-heading": "Father’s Day collection is available to order year-round 👔",
      "intro-1": "Father’s Day bento cakes, cupcakes and fondant cookies can be requested year-round, with seasonal promo slots highlighted closer to Father’s Day.",
      "intro-2": "Send an enquiry with your date, servings, style ideas and delivery details — I’ll confirm availability, price and the best options for your occasion.",
      "order-title": "Send an enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "Can I order the Father’s Day collection outside the seasonal promo window?",
      "faq-cutoff-answer": "Yes — these designs can be requested year-round. The collection is promoted more actively from {openDate}, but early enquiries are welcome any time."
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
      "status-heading": "Halloween collection is available to order year-round 🎃",
      "intro-1": "Halloween bento cakes, cupcakes and fondant cookies can be requested year-round, with seasonal promo slots highlighted closer to Halloween.",
      "intro-2": "Send an enquiry with your date, servings, style ideas and delivery details — I’ll confirm availability, price and the best options for your occasion.",
      "order-title": "Send an enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "Can I order the Halloween collection outside the seasonal promo window?",
      "faq-cutoff-answer": "Yes — these designs can be requested year-round. The collection is promoted more actively from {openDate}, but early enquiries are welcome any time."
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
      "status-heading": "Christmas collection is available to order year-round ✨",
      "intro-1": "Christmas bento cakes, cupcakes and fondant cookies can be requested year-round, with seasonal promo slots highlighted closer to Christmas.",
      "intro-2": "Send an enquiry with your date, servings, style ideas and delivery details — I’ll confirm availability, price and the best options for your occasion.",
      "order-title": "Send an enquiry",
      "submit-label": "Send an enquiry",
      "sticky-label": "Send an enquiry",
      "faq-cutoff-question": "Can I order the Christmas collection outside the seasonal promo window?",
      "faq-cutoff-answer": "Yes — these designs can be requested year-round. The collection is promoted more actively from {openDate}, but early enquiries are welcome any time."
    }
  }
};
  var FALLBACK_SEASONS = [{"id":"christmas","enabled":true,"name":"Christmas Collection","href":"/Products/christmas-collection/","orderHref":"/Products/christmas-collection/#order","dateFrom":"11-10","dateTo":"01-01","popup":{"enabled":true,"id":"christmas-collection","headline":"Christmas","title":"Christmas Collection","subtitle":"Limited slots • Festive designs • Optional edible photo","ctaLabel":"View the collection","href":"/Products/christmas-collection/","image":"assets/img/promo/christmas-sale.webp","imageAlt":"Christmas Collection promo"}},{"id":"valentines","enabled":true,"name":"Valentine’s Collection","href":"/Products/valentines-collection/","orderHref":"/Products/valentines-collection/#order","dateFrom":"01-02","dateTo":"02-14","popup":{"enabled":true,"id":"valentines-collection","headline":"Hot offer","title":"Valentine’s Collection","subtitle":"Limited slots • Two signature designs • Optional edible photo.","image":"assets/img/promo/Elegant-Valentine's-Day-Sale.webp","imageAlt":"Valentine’s bento cake and cupcakes","href":"/Products/valentines-collection/","ctaLabel":"More details","dismissLabel":"Not now","cooldownHours":24,"triggerDelayMs":6000}},{"id":"mothers-day","enabled":true,"name":"Mother’s Day Collection","href":"/Products/mothers-day-collection/","orderHref":"/Products/mothers-day-collection/#order","dateFrom":"02-15","dateTo":{"rule":"motheringSunday"},"popup":{"enabled":true,"id":"mothers-day-collection","headline":"Mother’s Day","title":"Mother’s Day Collection","subtitle":"Pre-orders now open • Gift cupcakes & sweet treats","ctaLabel":"View the collection","href":"/Products/mothers-day-collection/","image":"assets/img/promo/mothers-day-collection-gift-cupcakes-preview.webp","imageAlt":"Mother’s Day collection preview with pastel gift cupcakes"}},{"id":"easter","enabled":true,"name":"Easter Collection","href":"/Products/easter-collection/","orderHref":"/Products/easter-collection/#order","dateFrom":{"rule":"motheringSunday","offsetDays":1},"dateTo":{"rule":"easterSunday","offsetDays":1},"popup":{"enabled":true,"id":"easter-collection","headline":"Easter","title":"Easter Collection","subtitle":"Traditional Easter Paska • Spring cupcakes • Limited pre-orders","ctaLabel":"View the collection","href":"/Products/easter-collection/","image":"assets/img/promo/easter-paska-traditional-ukrainian-easter-bread-preview.webp","imageAlt":"Easter collection preview featuring traditional Easter Paska"}},{"id":"fathers-day","enabled":true,"name":"Father’s Day Collection","href":"/Products/fathers-day-collection/","orderHref":"/Products/fathers-day-collection/#order","dateFrom":"05-01","dateTo":{"rule":"fathersDay"},"popup":{"enabled":true,"id":"fathers-day-collection","headline":"Father’s Day","title":"Father’s Day Collection","subtitle":"Limited slots • Bold, modern designs • Optional edible photo","ctaLabel":"View the collection","href":"/Products/fathers-day-collection/","image":"assets/img/promo/fathers-day-sale.webp","imageAlt":"Father’s Day Collection promo"}},{"id":"halloween","enabled":true,"name":"Halloween Collection","href":"/Products/halloween-collection/","orderHref":"/Products/halloween-collection/#order","dateFrom":"09-16","dateTo":"10-31","popup":{"enabled":true,"id":"halloween-collection","headline":"Halloween","title":"Halloween Collection","subtitle":"Limited slots • Spooky-cute designs • Optional edible photo","ctaLabel":"View the collection","href":"/Products/halloween-collection/","image":"assets/img/promo/halloween-sale.webp","imageAlt":"Halloween Collection promo"}}];

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

    function applySeasonFromConfig(cfg) {
      if (!cfg || !Array.isArray(cfg.seasons)) return false;
      var season = null;
      for (var i = 0; i < cfg.seasons.length; i++) {
        if (cfg.seasons[i] && cfg.seasons[i].id === seasonId) {
          season = cfg.seasons[i];
          break;
        }
      }
      if (!season) return false;
      var timeline = getSeasonTimeline(season, cfg.timezone || 'Europe/London');
      var vars = {
        openDate: formatDate(timeline.nextRange ? timeline.nextRange.start : null),
        endDate: formatDate(timeline.activeRange ? timeline.activeRange.end : null)
      };
      applyCopy(timeline.activeRange ? copy.active : copy.inactive, vars);
      return true;
    }

    fetch(CONFIG_URL, { cache: 'no-store' })
      .then(function(res){ if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function(cfg){
        if (!applySeasonFromConfig(cfg)) throw new Error('Missing season config');
      })
      .catch(function(){
        if (!applySeasonFromConfig({ seasons: FALLBACK_SEASONS, timezone: 'Europe/London' })) {
          applyCopy(copy.inactive, { openDate: 'the seasonal opening date', endDate: '' });
        }
      });
  });
})();
