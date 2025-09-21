
/* dc-navfix: robust dropdowns (mobile) + active highlighting */
(function(){
  'use strict';

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
