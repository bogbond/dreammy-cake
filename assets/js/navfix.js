/* Dreamy Cake navigation: path-based active state for internal pages. */
(function(){
  'use strict';
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function normalise(url){
    try{
      var u = new URL(url, location.origin);
      var p = (u.pathname || '/').toLowerCase().replace(/\/+/g, '/');
      if(p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
      return p;
    }catch(e){ return null; }
  }
  ready(function(){
    var nav = document.getElementById('navmenu');
    if(!nav) return;
    var here = normalise(location.href) || '/';
    if(here === '/') return; // Homepage scrollspy in main.js controls the active section.
    var best = null;
    var bestLen = 0;
    nav.querySelectorAll('a[href]').forEach(function(a){
      var raw = a.getAttribute('href') || '';
      if(!raw || raw.charAt(0) === '#' || /^https?:/i.test(raw)) return;
      var base = raw.split('#')[0] || '/';
      var path = normalise(base);
      if(!path || path === '/') return;
      if(here === path && path.length > bestLen){ best = a; bestLen = path.length; }
    });
    if(!best) return;
    nav.querySelectorAll('a.active').forEach(function(a){ a.classList.remove('active'); a.removeAttribute('aria-current'); });
    nav.querySelectorAll('li.nav-current').forEach(function(li){ li.classList.remove('nav-current'); });
    best.classList.add('active');
    best.setAttribute('aria-current','page');
    var li = best.closest('li');
    if(li) li.classList.add('nav-current');
  });
})();
