
// Shared product behaviors
(function(){
  function getOrderTarget(){
    return (window.innerWidth >= 992) ? document.getElementById('order-desktop') : document.getElementById('order-mobile');
  }
  function setupObserver(){
    var sticky = document.querySelector('.mobile-sticky-bar');
    var target = getOrderTarget();
    if(!sticky || !target || !('IntersectionObserver' in window)) return;
    if(window.__orderObs){ try{ window.__orderObs.disconnect(); }catch(e){} }
    window.__orderObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ sticky.classList.add('hidden'); } else { sticky.classList.remove('hidden'); }
      });
    }, {threshold: 0.2});
    window.__orderObs.observe(target);
  }
  function smoothScrollTo(el){
    if(!el) return;
    el.scrollIntoView({behavior:'smooth', block:'start'});
  }
  function highlight(el){
    if(!el) return;
    el.classList.add('order-highlight');
    setTimeout(function(){ el.classList.remove('order-highlight'); }, 3200);
  }
  // Buttons
  var orderBtn = document.getElementById('btn-order-sticky');
  if(orderBtn){
    orderBtn.addEventListener('click', function(e){
      e.preventDefault();
      var t = getOrderTarget();
      smoothScrollTo(t);
      setTimeout(function(){ highlight(t); }, 450);
    });
  }
  var helpBtn = document.getElementById('btn-help-sticky');
  if(helpBtn){
    helpBtn.addEventListener('click', function(e){
      var help = document.getElementById('help');
      if(help){ e.preventDefault(); help.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  }
  // Link offset for sizes guide
  var link = document.getElementById('link-sizes-guide');
  if(link){
    link.addEventListener('click', function(e){
      e.preventDefault();
      var el = document.getElementById('sizes-guide');
      var header = document.getElementById('header');
      var offset = header ? (header.offsetHeight || 0) : 0;
      var top = el.getBoundingClientRect().top + window.scrollY - offset - 10;
      window.scrollTo({top: top, behavior:'smooth'});
    });
  }
  // Min date = today
  var d = new Date();
  var iso = d.toISOString().split('T')[0];
  var dateInput = document.getElementById('date');
  if(dateInput){ dateInput.setAttribute('min', iso); }
  
  // Init

  // Robust Swiper init per gallery (no loop if less than 2 slides)
  

  // Init

  // Robust Swiper init per gallery (no loop if less than 2 slides)
  (function(){
    var swipers = document.querySelectorAll('.product-swiper');
    swipers.forEach(function(node){
      var slides = node.querySelectorAll('.swiper-slide').length;
      if (!window.Swiper || slides === 0) return;
      var loopMode = slides > 1;
      /* silence Swiper loop warning during init */
(function(){var __w=console.warn; console.warn=function(){try{var a=arguments[0]; if(typeof a==='string' && a.indexOf('Swiper Loop Warning')===0) return;}catch(e){}return __w.apply(console, arguments);};
try{ new Swiper(node, {
        autoHeight: true, on: { imagesReady: function(sw){ try{ sw.updateAutoHeight(0); }catch(e){} } }, loop: loopMode,
        slidesPerView: 1,
        slidesPerGroup: 1,
        pagination: { el: node.querySelector('.swiper-pagination'), clickable: true },
        navigation: { nextEl: node.querySelector('.swiper-button-next'), prevEl: node.querySelector('.swiper-button-prev') },
        watchOverflow: true
      });
} finally { console.warn = __w; }})();

    });
  })();

  setupObserver();

  // Smooth scroll helper with header offset
  function scrollToWithOffset(el, extraOffset) {
    if (!el) return;
    var header = document.getElementById('header');
    var headerH = header ? header.offsetHeight : 0;
    var rect = el.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var targetY = rect.top + scrollTop - headerH - (extraOffset || 12);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  // Highlight helper
  function highlightTemporarily(el){
    if(!el) return;
    el.classList.add('highlight-pulse');
    setTimeout(function(){ el.classList.remove('highlight-pulse'); }, 2300);
  }

  // Order buttons (sticky bar or others with data-order-scroll attr)
  (function(){
    var stickyBtn = document.getElementById('btn-order-sticky');
    function goToOrder(ev){
      if(ev) ev.preventDefault();
      var target = getOrderTarget();
      if(!target) return;
      scrollToWithOffset(target, 10);
      // Also focus first input for UX
      var firstInput = target.querySelector('input, select, textarea, button');
      if(firstInput){ try{ firstInput.focus({preventScroll:true}); }catch(e){} }
      highlightTemporarily(target);
    }
    if(stickyBtn){
      stickyBtn.addEventListener('click', goToOrder);
    }
    // Any link with href="#order" or data-order-scroll
    document.querySelectorAll('a[href="#order"], [data-order-scroll]').forEach(function(a){
      a.addEventListener('click', goToOrder);
    });
  })();

  // Sizes guide scroll fix (account for fixed header)
  (function(){
    var link = document.getElementById('link-sizes-guide');
    var target = document.getElementById('sizes-guide');
    if(link && target){
      link.addEventListener('click', function(ev){
        ev.preventDefault();
        scrollToWithOffset(target, 8);
        // Briefly highlight the table for context
        highlightTemporarily(target);
      });
    }
    // Also make native anchor jumps nicer if URL has #sizes-guide
    if (location.hash === '#sizes-guide') {
      setTimeout(function(){ scrollToWithOffset(document.getElementById('sizes-guide'), 8); }, 0);
    }
  })();

  window.addEventListener('resize', setupObserver);
})();


// r55.24: Show Classic Buttercream options when selected
(function(){
  function getContainer(el){
  if(!el || !el.closest){ return null; }
  var order = el.closest("#order-desktop") || el.closest("#order-mobile");
  if(!order){ return null; }
  return order.querySelector(".classic-options");
}
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
  function updateFor(el){
    var container = getContainer(el);
    if(!container) return;
    var isClassic = (el && el.value === 'Classic Buttercream' && el.checked);
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
    // For all cake_type radios in this form, determine current value
    var form = tgt.closest('form');
    var checked = form ? form.querySelector('input[name="cake_type"]:checked') : tgt;
    updateFor(checked || tgt);
  }

  // Bind listeners on both forms
  function initClassicOptions(){
    var radios = document.querySelectorAll('input[name="cake_type"]');
    radios.forEach(function(r){ r.addEventListener('change', handleChange); });
    // On load, set state per form
    // Desktop
    var dForm = document.querySelector('#order form') || document.querySelector('#order');
    if(dForm){
      var initial = dForm.querySelector('input[name="cake_type"]:checked');
      updateFor(initial || dForm.querySelector('input[name="cake_type"]'));
    }
    // Mobile
    // mobile form removed
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initClassicOptions);
  } else {
    initClassicOptions();
  }
})(); 



// r55.29: Force sticky & inline help buttons to navigate to the homepage contact section
(function(){
  function forceContactNav(el){
    if(!el) return;
    var handler = function(e){
      try{
        if(e){ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }
      }catch(_){}
      window.location.assign('/#contact');
    };
    // capture-phase to override any smooth-scroll listeners
    el.addEventListener('click', handler, {capture:true});
  }
  forceContactNav(document.getElementById('btn-help-sticky'));
  forceContactNav(document.getElementById('btn-help'));
})();



