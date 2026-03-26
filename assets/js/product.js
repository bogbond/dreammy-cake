// Shared product behaviors
(function(){
  function getOrderTarget(){
    var desktop = document.getElementById('order-desktop');
    var mobile  = document.getElementById('order-mobile');

    // Safe fallback:
    // - <992px: prefer #order-mobile, else #order-desktop
    // - >=992px: prefer #order-desktop, else #order-mobile
    if (window.innerWidth < 992){
      return mobile || desktop;
    }
    return desktop || mobile;
  }

  // Move the single order card between desktop/mobile slots (one form, responsive layout)
  function mountOrderCard(){
    // New markup uses:
    // - a single .order-card with [data-order-card]
    // - two slots: [data-order-slot="desktop"] and [data-order-slot="mobile"]
    var card = document.querySelector('[data-order-card]');
    if(!card){
      // Backwards-compatible fallback (older markup)
      card = document.querySelector('#order-desktop.order-card') || document.querySelector('#order-mobile .order-card');
      if(card){
        try{ card.setAttribute('data-order-card','1'); }catch(e){}
      }
    }

    var desktopSlot = document.querySelector('[data-order-slot="desktop"]');
    var mobileSlot  = document.querySelector('[data-order-slot="mobile"]');

    // If slots are missing, keep existing layout (some pages may still have two separate order blocks)
    if(!card || !desktopSlot || !mobileSlot) return;

    var target = (window.innerWidth < 992) ? mobileSlot : desktopSlot;
    if(card.parentElement !== target){
      target.appendChild(card);
    }
  }

  // Local date in YYYY-MM-DD (avoid UTC off-by-one near midnight)
  function getLocalTodayISO(){
    var d = new Date();
    var tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().split('T')[0];
  }

  // Smooth scroll helper with fixed header offset
  function scrollToWithOffset(el, extraOffset){
    if(!el) return;
    var header = document.getElementById('header');
    var headerH = header ? (header.offsetHeight || 0) : 0;
    var rect = el.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var targetY = rect.top + scrollTop - headerH - (extraOffset || 12);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  function highlightTemporarily(el){
    if(!el) return;
    el.classList.add('highlight-pulse');
    setTimeout(function(){ el.classList.remove('highlight-pulse'); }, 2300);
  }

  // Avoid duplicate listeners (some builds had duplicates)
  function bindOnce(el, event, handler, options){
    if(!el) return;
    var key = '__dc_bound_' + event;
    if(el[key]) return;
    el.addEventListener(event, handler, options || false);
    el[key] = true;
  }

  // Hide sticky bar when the order form is in view
  function setupObserver(){
    var sticky = document.querySelector('.mobile-sticky-bar');
    var target = getOrderTarget();
    if(!sticky || !target || !('IntersectionObserver' in window)) return;

    if(window.__orderObs){
      try{ window.__orderObs.disconnect(); }catch(e){}
    }

    window.__orderObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ sticky.classList.add('hidden'); }
        else { sticky.classList.remove('hidden'); }
      });
    }, {threshold: 0.2});

    window.__orderObs.observe(target);
  }

  // Robust Swiper init per gallery (no loop if less than 2 slides)
  function initSwiper(){
    var swipers = document.querySelectorAll('.product-swiper');
    swipers.forEach(function(node){
      var slides = node.querySelectorAll('.swiper-slide').length;
      if(!window.Swiper || slides === 0) return;
      var loopMode = slides > 1;

      /* silence Swiper loop warning during init */
      (function(){
        var __w = console.warn;
        console.warn = function(){
          try{
            var a = arguments[0];
            if(typeof a === 'string' && a.indexOf('Swiper Loop Warning') === 0) return;
          }catch(e){}
          return __w.apply(console, arguments);
        };
        try{
          new Swiper(node, {
            autoHeight: true,
            on: { imagesReady: function(sw){ try{ sw.updateAutoHeight(0); }catch(e){} } },
            loop: loopMode,
            slidesPerView: 1,
            slidesPerGroup: 1,
            pagination: { el: node.querySelector('.swiper-pagination'), clickable: true },
            navigation: { nextEl: node.querySelector('.swiper-button-next'), prevEl: node.querySelector('.swiper-button-prev') },
            watchOverflow: true
          });
        } finally {
          console.warn = __w;
        }
      })();
    });
  }

  // Min date = today for all date inputs on the page (or inside the order form)
  function initMinDates(){
    var iso = getLocalTodayISO();
    var dateInputs = document.querySelectorAll('#order-desktop input[type="date"], #order-mobile input[type="date"]');
    if(!dateInputs || dateInputs.length === 0){
      dateInputs = document.querySelectorAll('input[type="date"]');
    }
    dateInputs.forEach(function(inp){
      try{ inp.setAttribute('min', iso); }catch(e){}
    });
  }

  function initButtons(){
    // Order buttons
    function goToOrder(ev){
      var target = getOrderTarget();
      if(!target) return;
      if(ev) ev.preventDefault();
      scrollToWithOffset(target, 10);

      // Focus first input for UX (without changing scroll)
      var firstInput = target.querySelector('input, select, textarea, button');
      if(firstInput){ try{ firstInput.focus({preventScroll:true}); }catch(e){} }

      highlightTemporarily(target);
    }

    bindOnce(document.getElementById('btn-order-sticky'), 'click', goToOrder);

    document.querySelectorAll('a[href="#order"], a[href="#order-desktop"], a[href="#order-mobile"], [data-order-scroll]').forEach(function(a){
      bindOnce(a, 'click', goToOrder);
    });

    // Help / Questions button
    function goToHelp(ev){
      var help = document.getElementById('help');
      if(!help) return;
      if(ev) ev.preventDefault();
      scrollToWithOffset(help, 10);
      highlightTemporarily(help);
    }
    bindOnce(document.getElementById('btn-help-sticky'), 'click', goToHelp);

    // Sizes guide scroll fix (account for fixed header)
    (function(){
      var target = document.getElementById('sizes-guide');
      if(!target) return;

      document.querySelectorAll('a[href=\"#sizes-guide\"]').forEach(function(link){
        bindOnce(link, 'click', function(ev){
          ev.preventDefault();
          scrollToWithOffset(target, 8);
          highlightTemporarily(target);
        });
      });

      // Also make native anchor jumps nicer if URL has #sizes-guide
      if (location.hash === '#sizes-guide') {
        setTimeout(function(){ scrollToWithOffset(target, 8); }, 0);
      }
    })();
  }

  function init(){
    // Ensure we only ever have one order form (move the single card to the right slot)
    mountOrderCard();

    initMinDates();
    initSwiper();
    initButtons();
    setupObserver();

    // Keep layout + observer in sync when switching breakpoints
    if(!window.__dc_product_resize_bound){
      window.addEventListener('resize', function(){
        mountOrderCard();
        setupObserver();
      });
      window.__dc_product_resize_bound = true;
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// r55.24: Show Classic Buttercream options when selected
(function(){
  function setEnabled(container, enabled){
    if(!container) return;
    var inputs = container.querySelectorAll('input');
    inputs.forEach(function(inp){
      inp.disabled = !enabled;
      if(!enabled){
        if(inp.type === 'radio' || inp.type === 'checkbox'){ inp.checked = false; }
        inp.removeAttribute('required');
      } else {
        // Make Sponge and Buttercream required; Filling optional
        if (inp.name === 'cake_sponge' || inp.name === 'cake_buttercream'){
          inp.required = true;
        }
      }
    });
  }

  function findScope(node){
    if(!node || !node.closest) return null;
    return node.closest('#order-desktop') || node.closest('#order-mobile') || node.closest('form');
  }

  function updateScope(scope){
    if(!scope) return;

    var container = scope.querySelector('.classic-options');
    if(!container) return;

    // Determine the selection within the same form/scope
    var form = container.closest('form') || scope.querySelector('form') || scope;
    var checked = form ? form.querySelector('input[name="cake_type"]:checked') : null;
    var isClassic = !!(checked && checked.value === 'Classic Buttercream');

    if(isClassic){
      container.classList.remove('d-none');
      setEnabled(container, true);
    } else {
      container.classList.add('d-none');
      setEnabled(container, false);
    }
  }

  function handleChange(ev){
    var tgt = ev.target;
    if(!tgt || tgt.name !== 'cake_type') return;
    updateScope(findScope(tgt) || document);
  }

  function initClassicOptions(){
    // Delegate once (some pages include multiple product scripts)
    if(!window.__dc_classic_options_bound){
      document.addEventListener('change', handleChange);
      window.__dc_classic_options_bound = true;
    }

    // Initialize BOTH desktop and mobile order blocks on load
    var scopes = Array.prototype.slice.call(document.querySelectorAll('#order-desktop, #order-mobile'));
    if(scopes.length === 0){
      // Fallback: initialize around each classic-options block
      scopes = Array.prototype.slice.call(document.querySelectorAll('.classic-options')).map(function(c){
        return c.closest('form') || c.parentElement;
      }).filter(Boolean);
    }
    scopes.forEach(updateScope);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initClassicOptions);
  } else {
    initClassicOptions();
  }
})();

// r55.26: Floating Express Menu shortcut on regular product pages
(function(){
  var STORAGE_KEY = 'dc_express_shortcut_state';

  function getProductSlug(){
    var path = (window.location.pathname || '').replace(/index\.html$/, '').replace(/\/+$/, '');
    var match = path.match(/^\/Products\/([^/]+)$/);
    return match ? match[1] : '';
  }

  function shouldShowExpressShortcut(){
    var slug = getProductSlug();
    if(!slug) return false;
    if(slug.indexOf('express-') === 0) return false;
    if(/-collection$/.test(slug)) return false;
    return true;
  }

  function getSavedState(){
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch(e){
      return null;
    }
  }

  function saveState(value){
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch(e){}
  }

  function createExpressShortcut(){
    if(!shouldShowExpressShortcut()) return;
    if(document.querySelector('.express-shortcut')) return;

    var root = document.createElement('aside');
    root.className = 'express-shortcut';
    root.setAttribute('aria-label', 'Express Menu shortcut');
    root.innerHTML = ''
      + '<button type="button" class="express-shortcut__peek" aria-label="Open Express Menu shortcut" aria-expanded="false">'
      +   '<i class="bi bi-lightning-charge-fill" aria-hidden="true"></i>'
      +   '<span>Express</span>'
      + '</button>'
      + '<div class="express-shortcut__card" role="complementary">'
      +   '<button type="button" class="express-shortcut__close" aria-label="Collapse Express Menu shortcut">'
      +     '<i class="bi bi-x-lg" aria-hidden="true"></i>'
      +   '</button>'
      +   '<div class="express-shortcut__eyebrow"><i class="bi bi-lightning-charge-fill" aria-hidden="true"></i><span>Need it sooner?</span></div>'
      +   '<p class="express-shortcut__text">See the Express Menu for selected cakes and desserts available today or tomorrow.</p>'
      +   '<div class="express-shortcut__actions">'
      +     '<a class="express-shortcut__cta" href="/Express-Menu/">View Express Menu</a>'
      +   '</div>'
      + '</div>';

    document.body.appendChild(root);

    var peek = root.querySelector('.express-shortcut__peek');
    var closeBtn = root.querySelector('.express-shortcut__close');

    function setCollapsed(collapsed, persist){
      root.classList.toggle('is-collapsed', collapsed);
      peek.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      document.body.classList.toggle('dc-express-shortcut-open', !collapsed);
      document.body.classList.toggle('dc-express-shortcut-collapsed', collapsed);
      if(persist){
        saveState(collapsed ? 'collapsed' : 'open');
      }
    }

    var saved = getSavedState();
    var defaultCollapsed = window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches;
    setCollapsed(saved ? saved === 'collapsed' : defaultCollapsed, false);

    closeBtn.addEventListener('click', function(){
      setCollapsed(true, true);
    });

    peek.addEventListener('click', function(){
      setCollapsed(false, true);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', createExpressShortcut);
  } else {
    createExpressShortcut();
  }
})();

