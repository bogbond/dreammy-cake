
/* dc-navfix: robust dropdowns (mobile) + active highlighting */
(function(){
  'use strict';

  // Seasonal config (shared with homepage promo popup)
  var DC_SEASONAL_CONFIG_URL = (function(){
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
      var get = function(type){
        for (var i=0;i<parts.length;i++){ if(parts[i].type===type) return parts[i].value; }
        return null;
      };
      var y = Number(get("year"));
      var m = Number(get("month"));
      var d = Number(get("day"));
      if (y && m && d) return { year: y, month: m, day: d };
    } catch (e) {}
    var n = new Date();
    return { year: n.getFullYear(), month: n.getMonth()+1, day: n.getDate() };
  }

  function utcDate(y, m, d){ return new Date(Date.UTC(y, m-1, d, 0,0,0,0)); }
  function addDaysUTC(dt, days){ return new Date(dt.getTime() + days*86400000); }

  function easterSundayUTC(year){
    var a = year % 19;
    var b = Math.floor(year/100);
    var c = year % 100;
    var d = Math.floor(b/4);
    var e = b % 4;
    var f = Math.floor((b+8)/25);
    var g = Math.floor((b - f + 1)/3);
    var h = (19*a + b - d - g + 15) % 30;
    var i = Math.floor(c/4);
    var k = c % 4;
    var l = (32 + 2*e + 2*i - h - k) % 7;
    var m = Math.floor((a + 11*h + 22*l)/451);
    var month = Math.floor((h + l - 7*m + 114)/31);
    var day = ((h + l - 7*m + 114) % 31) + 1;
    return utcDate(year, month, day);
  }
  function motheringSundayUTC(year){ return addDaysUTC(easterSundayUTC(year), -21); }
  function fathersDayUTC(year){
    var june1 = new Date(Date.UTC(year, 5, 1));
    var dow = june1.getUTCDay();
    var toFirstSunday = (7 - dow) % 7;
    var firstSundayDay = 1 + toFirstSunday;
    var thirdSundayDay = firstSundayDay + 14;
    return new Date(Date.UTC(year, 5, thirdSundayDay));
  }

  function resolveDateSpec(spec, year){
    if(!spec) return null;
    if(typeof spec === "string"){
      var s = spec.trim();
      var m = /^(\d{2})-(\d{2})$/.exec(s);
      if(!m) return null;
      return utcDate(year, Number(m[1]), Number(m[2]));
    }
    if(typeof spec === "object" && spec.rule){
      var rule = String(spec.rule);
      var base = null;
      if(rule === "easterSunday") base = easterSundayUTC(year);
      else if(rule === "easterMonday") base = addDaysUTC(easterSundayUTC(year), 1);
      else if(rule === "motheringSunday") base = motheringSundayUTC(year);
      else if(rule === "fathersDay") base = fathersDayUTC(year);
      if(!base) return null;
      var off = Number(spec.offsetDays || 0);
      return addDaysUTC(base, off);
    }
    return null;
  }

  function getRangesForSeason(season, startYear){
    var start = resolveDateSpec(season.dateFrom, startYear);
    if(!start) return [];
    var end = resolveDateSpec(season.dateTo, startYear);
    if(!end) return [];
    if(end.getTime() < start.getTime()){
      var end2 = resolveDateSpec(season.dateTo, startYear+1);
      if(end2) end = end2;
    }
    return [{ start: start, end: end }];
  }

  function findActiveSeason(seasons, tz){
    if(!seasons || !seasons.length) return null;
    var p = getTZDateParts(tz || "Europe/London");
    var today = utcDate(p.year, p.month, p.day);
    var years = [p.year, p.year-1];
    for (var s=0; s<seasons.length; s++){
      var season = seasons[s];
      if(!season || season.enabled === false) continue;
      for (var yi=0; yi<years.length; yi++){
        var ranges = getRangesForSeason(season, years[yi]);
        for (var r=0; r<ranges.length; r++){
          if(today.getTime() >= ranges[r].start.getTime() && today.getTime() <= ranges[r].end.getTime()){
            return season;
          }
        }
      }
    }
    return null;
  }

  function isMobileOpen(){
    return document.body.classList.contains('mobile-nav-active') || window.innerWidth < 1200;
  }

  function bindDropdown(li){
    if(!li || !li.classList || !li.classList.contains('dropdown')) return;
    var trigger = li.querySelector(':scope > .nav-toggle, :scope > a');
    var panel = li.querySelector(':scope > ul');
    if(!trigger || !panel) return;

    // prevent double binding
    if(trigger.dataset && trigger.dataset.dcBind) return;
    if(trigger.dataset) trigger.dataset.dcBind = "1";

    trigger.setAttribute('aria-expanded', trigger.getAttribute('aria-expanded') || 'false');
    trigger.setAttribute('aria-controls', panel.id || (panel.id = (trigger.textContent.trim().toLowerCase()+'-submenu').replace(/\s+/g,'-')));

    trigger.addEventListener('click', function(ev){
      var isA = trigger.tagName.toLowerCase() === 'a';
      if (isA) ev.preventDefault();
      if (!isMobileOpen()) return; // desktop: let :hover work
      var open = trigger.getAttribute('aria-expanded') === 'true';
      var next = !open;
      trigger.setAttribute('aria-expanded', String(next));
      li.classList.toggle('open', next);
      panel.classList.toggle('dropdown-active', next);
      ev.stopPropagation();
    });
  }

  function applySeasonalMenu(cfg){
    if(!cfg || !Array.isArray(cfg.seasons)) return;
    var orderMenu = document.getElementById('order-submenu');
    if(!orderMenu) return;

    var tz = cfg.timezone || "Europe/London";
    var seasons = cfg.seasons.filter(function(s){ return s && s.enabled !== false && s.href; });

    // Remove any previously injected nodes
    Array.prototype.slice.call(orderMenu.querySelectorAll('li.dc-seasonal-featured, li.dc-seasonal-dropdown')).forEach(function(n){
      if(n && n.parentNode === orderMenu) n.parentNode.removeChild(n);
    });

    // Remove static seasonal 'Order ...' links (if present) to avoid duplicates
    seasons.forEach(function(season){
      var targets = [];
      if(season.orderHref) targets.push(season.orderHref);
      if(season.href) targets.push(season.href + '#order');
      Array.prototype.slice.call(orderMenu.querySelectorAll(':scope > li > a')).forEach(function(a){
        var href = a.getAttribute('href') || '';
        for (var i=0;i<targets.length;i++){
          if(href === targets[i] && /\border\b/i.test(a.textContent || '')){
            var li = a.parentNode;
            if(li && li.parentNode === orderMenu) li.parentNode.removeChild(li);
          }
        }
      });
    });

    var active = findActiveSeason(seasons, tz);

    // Featured (active season) item in Order
    if(active && active.featuredInOrder !== false){
      var liF = document.createElement('li');
      liF.className = 'dc-seasonal-featured';
      var aF = document.createElement('a');
      aF.href = active.orderHref || (active.href + '#order');
      var prefix = (cfg.menu && cfg.menu.featuredPrefix) ? cfg.menu.featuredPrefix : 'Order ';
      aF.textContent = prefix + (active.name || 'Seasonal collection');
      liF.appendChild(aF);
      orderMenu.appendChild(liF);
    }

    // Seasonal Collections nested dropdown
    var liD = document.createElement('li');
    liD.className = 'dropdown dc-seasonal-dropdown';
    var aT = document.createElement('a');

    aT.href = '#';

    aT.setAttribute('aria-label', 'Toggle Seasonal Collections submenu');

    var label = (cfg.menu && cfg.menu.seasonalLabel) ? cfg.menu.seasonalLabel : 'Seasonal Collections';

    aT.innerHTML = '<span>' + label + '</span> <i class=\"bi bi-chevron-right\"></i>';
    var ul = document.createElement('ul');
    ul.className = 'dc-seasonal-submenu';

    seasons.forEach(function(season){
      // show all enabled seasons in the archive list
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = season.href;
      a.textContent = season.name || 'Seasonal collection';
      li.appendChild(a);
      ul.appendChild(li);
    });

    liD.appendChild(aT);
    liD.appendChild(ul);
    orderMenu.appendChild(liD);
    bindDropdown(liD);
  }

  function loadSeasonalConfig(){
    return fetch(DC_SEASONAL_CONFIG_URL, { cache: 'no-store' })
      .then(function(res){ if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); })
      .catch(function(){ return null; });
  }


  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function normalizePath(url){
    try{
      var u = new URL(url, location.origin);
      var p = (u.pathname || '/').toLowerCase().replace(/\/+/g,'/');
      if (p !== '/' && p.endsWith('/')) p = p.slice(0,-1);
      return p;
    }catch(e){ return null; }
  }

  ready(function(){
    /* 0) Ensure Express Menu link is present in Order dropdown */
    (function(){
      var orderMenu = document.getElementById('order-submenu');
      if (!orderMenu) return;
      var wanted = '/Express-Menu/';
      var exists = false;
      Array.prototype.slice.call(orderMenu.querySelectorAll(':scope > li > a[href]')).forEach(function(a){
        var href = a.getAttribute('href') || '';
        if (href === wanted) exists = true;
      });
      if (exists) return;
      var li = document.createElement('li');
      li.className = 'dc-express-menu';
      var a = document.createElement('a');
      a.href = wanted;
      a.textContent = 'Express Menu';
      li.appendChild(a);
      orderMenu.insertBefore(li, orderMenu.firstChild);
    })();



    /* 1) Path‑based active item (non‑home) */
    var here = normalizePath(location.href) || '/';
    if (here !== '/') {
      var best = null, bestLen = 0;
      document.querySelectorAll('#navmenu a[href]').forEach(function(a){
        var href = a.getAttribute('href') || '';
        if (!href || href.indexOf('http') === 0) return;
        var i = href.indexOf('#');
        if (i >= 0) href = href.slice(0, i);
        var p = normalizePath(href);
        if (!p) return;
        if (here.indexOf(p) === 0 && p.length > bestLen) { best = a; bestLen = p.length; }
      });
      if (best){
        document.querySelectorAll('#navmenu a.active, #navmenu li.active').forEach(function(el){ el.classList.remove('active'); });
        best.classList.add('active');
        var dd = best.closest('li.dropdown');
        if (dd){ dd.classList.add('active'); var pa = dd.querySelector(':scope > a, :scope > .nav-toggle'); if (pa) pa.classList.add('active'); }
      }
    }

    

    /* 1.5) Seasonal menu (date-driven) */
    loadSeasonalConfig().then(function(cfg){
      if(cfg) applySeasonalMenu(cfg);
    });
/* 2) Mobile dropdown toggles */
    function isMobileOpen(){
      return document.body.classList.contains('mobile-nav-active') || window.innerWidth < 1200;
    }
    Array.prototype.slice.call(document.querySelectorAll('.navmenu li.dropdown')).forEach(function(li){
      var trigger = li.querySelector(':scope > .nav-toggle, :scope > a');
      var panel   = li.querySelector(':scope > ul');
      if (!trigger || !panel) return;
      // ARIA
      trigger.setAttribute('aria-expanded', trigger.getAttribute('aria-expanded') || 'false');
      trigger.setAttribute('aria-controls', panel.id || (panel.id = (trigger.textContent.trim().toLowerCase()+'-submenu').replace(/\s+/g,'-')));
      // Click
      trigger.addEventListener('click', function(ev){
        var isA = trigger.tagName.toLowerCase() === 'a';
        if (isA) ev.preventDefault();
        if (!isMobileOpen()) return; // desktop: let :hover work
        var open = trigger.getAttribute('aria-expanded') === 'true';
        var next = !open;
        trigger.setAttribute('aria-expanded', String(next));
        li.classList.toggle('open', next);
        panel.classList.toggle('dropdown-active', next);
        ev.stopPropagation();
      });
    });

  });
})();
