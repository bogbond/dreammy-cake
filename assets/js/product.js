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

    // Sizes guide scroll fix (account for fixed header and responsive layouts)
    (function(){
      function isVisible(el){
        if(!el) return false;
        var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if(style && (style.display === 'none' || style.visibility === 'hidden')) return false;
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      }
      function getSizesGuideTarget(){
        var guides = Array.prototype.slice.call(document.querySelectorAll('[data-sizes-guide], #sizes-guide'));
        return guides.find(isVisible) || document.getElementById('sizes-guide') || guides[0];
      }

      document.querySelectorAll('a[href=\"#sizes-guide\"]').forEach(function(link){
        bindOnce(link, 'click', function(ev){
          var target = getSizesGuideTarget();
          if(!target) return;
          ev.preventDefault();
          scrollToWithOffset(target, 8);
          highlightTemporarily(target);
        });
      });

      // Also make native anchor jumps nicer if URL has #sizes-guide
      if (location.hash === '#sizes-guide') {
        setTimeout(function(){ var target = getSizesGuideTarget(); if(target) scrollToWithOffset(target, 8); }, 0);
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


// Product flavour and cupcake flavour helpers
(function(){
  function findForm(node){ return node && node.closest ? node.closest('form') : null; }

  function updateCakeFlavour(select){
    if(!select) return;
    var form = findForm(select);
    if(!form) return;
    var opt = select.options[select.selectedIndex];
    var add = opt ? parseFloat(opt.getAttribute('data-price-add') || '0') : 0;
    if(!Number.isFinite(add)) add = 0;

    var hidden = form.querySelector('input[name="cake_flavour_price_adjustment"]');
    if(!hidden){
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'cake_flavour_price_adjustment';
      form.appendChild(hidden);
    }
    hidden.value = add > 0 ? ('Premium flavour surcharge from +£' + add) : 'No premium flavour surcharge';

    var note = form.querySelector('[data-flavour-selected-note]');
    if(note){
      note.textContent = add > 0 ? ('Premium flavour selected: this adds from +£' + add + ' to the cake quote.') : '';
    }
  }

  function cupcakeLimit(qty){
    qty = parseInt(qty, 10);
    if(!Number.isFinite(qty) || qty <= 6) return 1;
    if(qty < 24) return 2;
    return 3;
  }

  function selectedCupcakeFlavours(form){
    return Array.prototype.slice.call(form.querySelectorAll('[data-cupcake-flavour]:checked'));
  }

  function updateCupcakeForm(form, changedInput){
    if(!form) return;
    var qty = form.querySelector('#cupcake-qty-range');
    var boxes = Array.prototype.slice.call(form.querySelectorAll('[data-cupcake-flavour]'));
    if(!qty || boxes.length === 0) return;

    var qtyNumber = parseInt(qty.value || '6', 10);
    var limit = cupcakeLimit(qtyNumber);
    var qtyValue = form.querySelector('#qtyValue');
    if(qtyValue) qtyValue.textContent = qtyNumber + ' cupcakes';
    var limitLabel = form.querySelector('[data-cupcake-limit-label]');
    if(limitLabel) limitLabel.textContent = limit === 1 ? '1 flavour only' : ('up to ' + limit + ' flavours');

    var selected = selectedCupcakeFlavours(form);
    if(selected.length > limit){
      if(changedInput && changedInput.checked && changedInput.hasAttribute('data-cupcake-flavour')){
        changedInput.checked = false;
      } else {
        selected.slice(limit).forEach(function(input){ input.checked = false; });
      }
      selected = selectedCupcakeFlavours(form);
    }

    boxes.forEach(function(input){
      input.disabled = !input.checked && selected.length >= limit;
    });

    var feedback = form.querySelector('#cupcakeFlavourFeedback');
    if(feedback){
      if(selected.length >= limit){
        feedback.hidden = false;
        feedback.textContent = limit === 1 ? 'This box size allows 1 cupcake flavour.' : 'This box size allows up to ' + limit + ' cupcake flavours.';
      } else {
        feedback.hidden = true;
        feedback.textContent = '';
      }
    }

    var summary = form.querySelector('[data-cupcake-flavour-summary]');
    if(summary){
      var names = selected.map(function(input){ return input.value; });
      summary.value = names.length ? (qtyNumber + ' cupcakes · ' + names.join(', ')) : '';
    }
  }

  function initProductFlavourHelpers(){
    document.querySelectorAll('.product-flavour-select').forEach(updateCakeFlavour);
    document.querySelectorAll('form[data-cupcake-order]').forEach(updateCupcakeForm);

    if(window.__dc_product_flavour_helpers_bound) return;
    document.addEventListener('change', function(ev){
      var target = ev.target;
      if(!target) return;
      if(target.classList && target.classList.contains('product-flavour-select')) updateCakeFlavour(target);
      if(target.id === 'cupcake-qty-range' || target.hasAttribute('data-cupcake-flavour')) updateCupcakeForm(findForm(target), target);
    });
    document.addEventListener('input', function(ev){
      var target = ev.target;
      if(target && target.id === 'cupcake-qty-range') updateCupcakeForm(findForm(target), target);
    });
    document.addEventListener('submit', function(ev){
      var form = ev.target;
      if(!form || !form.matches || !form.matches('form[data-cupcake-order]')) return;
      updateCupcakeForm(form);
      if(selectedCupcakeFlavours(form).length === 0){
        ev.preventDefault();
        var feedback = form.querySelector('#cupcakeFlavourFeedback');
        if(feedback){
          feedback.hidden = false;
          feedback.textContent = 'Please choose at least one cupcake flavour.';
        }
        var first = form.querySelector('[data-cupcake-flavour]');
        if(first){ try{ first.focus({preventScroll:false}); }catch(e){ first.focus(); } }
      }
    }, true);
    window.__dc_product_flavour_helpers_bound = true;
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initProductFlavourHelpers);
  } else {
    initProductFlavourHelpers();
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

