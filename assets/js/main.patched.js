(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled, { passive: true });
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    (mobileNavToggleBtn) && mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    (navmenu) && navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    (navmenu) && navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });
  // Ensure mobile dropdowns also toggle when clicking the parent <a>
  document.querySelectorAll('.navmenu .dropdown > a').forEach(function(link) {
    (link) && link.addEventListener('click', function(e) {
      if (document.body.classList.contains('mobile-nav-active')) {
        e.preventDefault();
        const parent = this.parentElement;
        const submenu = parent.querySelector('ul, .dropdown-menu');
        parent.classList.toggle('active');
        if (submenu) submenu.classList.toggle('dropdown-active');
        e.stopImmediatePropagation();
      }
    });
  });


  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
  (scrollTop) && scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate glightbox
   */
  let glightbox = null;
const _glSel = '.glightbox';
if (document.querySelector(_glSel)) {
  glightbox = window.GLightbox && GLightbox({ selector: _glSel });
}

  if (glightbox) glightbox.on('open', () => {
    document.querySelectorAll('.scroll-top, .back-to-top, .fab-contact').forEach(el => {
      el.dataset._prevDisplay = el.style.display;
      el.style.display = 'none';
    });
  });
  if (glightbox) glightbox.on('close', () => {
    document.querySelectorAll('.scroll-top, .back-to-top, .fab-contact').forEach(el => {
      el.style.display = el.dataset._prevDisplay || '';
      delete el.dataset._prevDisplay;
    });
  });
/**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    const showMoreBtn = document.querySelector('#show-more-btn');

    // Function to toggle show more button and hidden items
    function toggleShowMore(filterValue) {
      if (filterValue === '*') {
        // For "All" filter, restore hidden items for elements 13–31
        isotopeItem.querySelectorAll('.portfolio-item').forEach((item, index) => {
          if (index >= 12) { // Elements 13–31 (0-based index)
            item.classList.add('hidden-portfolio-item');
          }
        });
        if (showMoreBtn) {
          showMoreBtn.style.display = 'block';
        }
      } else {
        // For other filters, show all items and hide button
        isotopeItem.querySelectorAll('.hidden-portfolio-item').forEach(item => {
          item.classList.remove('hidden-portfolio-item');
        });
        if (showMoreBtn) {
          showMoreBtn.style.display = 'none';
        }
      }
      initIsotope.arrange();
      (glightbox && glightbox.reload && glightbox.reload());
    }

    // Initialize Isotope
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
      // Apply initial filter state
      toggleShowMore(filter);
    });

    // Filter click handler
    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      (filters) && filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        const filterValue = this.getAttribute('data-filter');
        initIsotope.arrange({
          filter: filterValue
        });
        toggleShowMore(filterValue);
      }, false);
    });

    // Portfolio Show More Button
    if (showMoreBtn) {
      (showMoreBtn) && showMoreBtn.addEventListener('click', () => {
        isotopeItem.querySelectorAll('.hidden-portfolio-item').forEach(item => {
          item.classList.remove('hidden-portfolio-item');
        });
        initIsotope.arrange();
        (glightbox && glightbox.reload && glightbox.reload());
        showMoreBtn.style.display = 'none';
      });
    }
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    (faqItem) && faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    });
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);
})();

// DC Final: Pricing mobile-active + GA4
document.addEventListener('DOMContentLoaded', function(){
  const section = document.getElementById('pricing');
  const cards = Array.from(document.querySelectorAll('#pricing .price-card'));
  if (!section || !cards.length) return;
  const mqMobile = window.matchMedia('(max-width: 991.98px)');
  function setActive(el){ cards.forEach(c => c.classList.toggle('active', c === el)); }
  function visibilityRatio(el){
    const r = el.getBoundingClientRect();
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const vw = Math.max(document.documentElement.clientWidth,  window.innerWidth  || 0);
    const ix = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    const iy = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    const interArea = ix * iy;
    const elArea = Math.max(1, r.width * r.height);
    return interArea / elArea;
  }
  function updateActive(){
    if (!mqMobile.matches) { setActive(null); return; }
    let best = null, bestRatio = 0;
    for (const c of cards){ const ratio = visibilityRatio(c); if (ratio > bestRatio){ bestRatio = ratio; best = c; } }
    if (best && bestRatio >= 0.60) setActive(best); else setActive(null);
  }
  const throttled = (()=>{ let t; return ()=>{ if (t) return; t=requestAnimationFrame(()=>{ t=0; updateActive(); }); }; })();
  ['scroll','resize','orientationchange'].forEach(ev => window.addEventListener(ev, throttled, { passive: true }));
  (mqMobile) && mqMobile.addEventListener('change', updateActive);
  updateActive();

  // GA4 events
  let listFired = false;
  const listObserver = new IntersectionObserver((entries) => {
    if (listFired) return;
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        listFired = true;
        if (window.gtag) {
          const items = cards.map(c => ({ 
            item_id: c.dataset.itemId || '',
            item_name: c.dataset.itemName || '',
            item_category: c.dataset.itemCategory || 'cakes',
            price: c.dataset.itemPrice || ''
          }));
          window.gtag('event', 'view_item_list', { item_list_name: 'Pricing', items });
        }
        listObserver.disconnect();
      }
    });
  }, { threshold: [0, .5, 1] });
  listObserver.observe(section);

  function clickHandler(e){
    const card = e.currentTarget.closest('.price-card');
    if (!card || !window.gtag) return;
    window.gtag('event', 'select_item', {
      item_list_name: 'Pricing',
      items: [{
        item_id: card.dataset.itemId || '',
        item_name: card.dataset.itemName || '',
        item_category: card.dataset.itemCategory || 'cakes',
        price: card.dataset.itemPrice || ''
      }]
    });
  }
  cards.forEach(c => c.querySelectorAll('a').forEach(a => (a) && a.addEventListener('click', clickHandler)));
});


// DC Final: header sitename autosize one-line
document.addEventListener('DOMContentLoaded', function(){
  const mqPhone = window.matchMedia('(max-width: 575.98px)');
  const logo = document.querySelector('#header .logo .sitename');
  const menu = document.querySelector('#header .mobile-nav-toggle');
  if (!logo || !menu) return;
  const MIN = 16, MAX = 28, GUTTER = 14;
  function fitOnce(){
    if (!mqPhone.matches) { logo.style.fontSize=''; logo.style.whiteSpace=''; return; }
    logo.style.whiteSpace = 'nowrap';
    const header = document.getElementById('header');
    const avail = Math.max(60, header.clientWidth - menu.offsetWidth - GUTTER - 8);
    let lo = MIN, hi = MAX, best = MIN;
    for (let i=0;i<12;i++){ 
      const mid = (lo+hi)/2;
      logo.style.fontSize = mid + 'px';
      const w = logo.scrollWidth;
      if (w <= avail) { best = mid; lo = mid; } else { hi = mid; }
    }
    logo.style.fontSize = Math.round(best*100)/100 + 'px';
  }
  const throttle = (()=>{ let t; return ()=>{ if(t) return; t=requestAnimationFrame(()=>{ t=0; fitOnce(); }); }; })();
  ['resize','orientationchange'].forEach(ev=> window.addEventListener(ev, throttle, {passive:true}));
  (mqPhone) && mqPhone.addEventListener('change', fitOnce);
  fitOnce();
});



// === DC: Portfolio gallery JS v2 (hi‑res lightbox, 8-per-page, captions off-screen SEO, mobile overlap fix, remove old grid) ===
document.addEventListener('DOMContentLoaded', function () {
  const sec = document.getElementById('portfolio');
  if (!sec) return;

  // Remove OLD portfolio grids/cards if present (template leftovers)
  const oldGrids = sec.querySelectorAll('.portfolio-container, .portfolio-grid, .isotope-container, .portfolio-item, .portfolio-wrap');
  oldGrids.forEach(el => el.remove());

  // Try to collect existing <img> from markup to preserve ALTs and (optionally) data-full
  const existing = Array.from(sec.querySelectorAll('img')).map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt') || '',
    full: img.dataset.full || ''
  })).filter(x => x.src);

  // CONFIG: You can define explicit hi-res mapping here if filenames differ.
  // Example: const HIRES = { "assets/img/items/themed-cake-main.webp": "assets/img/cakes/hi/12-birthday-cake-huntingdon.webp", ... };
  const HIRES = window.DC_PORTFOLIO_HIRES || {};

  // When we don't have data-full or HIRES mapping, try a few common filename patterns.
  function smartResolveFull(triggerEl){
  try{
    const a = triggerEl.closest && triggerEl.closest('a');
    const img = triggerEl.tagName === 'IMG' ? triggerEl : (a ? a.querySelector('img') : null);
    const cand = (a && a.getAttribute('data-full')) || (img && img.getAttribute('data-full'));
    if (cand) return cand;
    if (a && a.getAttribute('href')){
      let href = a.getAttribute('href');
      if (/\.(jpe?g|png|webp|avif)$/i.test(href)){
        href = href.replace('/preview/', '/').replace('/cakes/preview/', '/cakes/').replace('-sm.', '-xl.').replace('/thumbs/', '/full/');
        return href;
      }
    }
    const src = (img && (img.currentSrc || img.src)) || '';
    if (src){
      let hi = src.replace('/preview/', '/').replace('/cakes/preview/', '/cakes/').replace('-sm.', '-xl.').replace('/thumbs/', '/full/');
      return hi;
    }
    return (img && (img.currentSrc || img.src)) || (a && a.getAttribute('href')) || '';
  }catch(e){ return ''; }
}
function inferFull(src) {
  if (HIRES[src]) return HIRES[src];
  if (/\/preview\//.test(src)) src = src.replace('/preview/', '/');
  if (/-sm\.(jpe?g|png|webp|avif)$/i.test(src)) src = src.replace(/-sm\.(jpe?g|png|webp|avif)$/i, '-xl.$1');
  if (/\/thumbs\//.test(src)) src = src.replace('/thumbs/', '/full/');
  return src;
}

  // Build our image list (src, alt, full)
  const IMAGES = (existing.length ? existing : [
    {src: 'assets/img/items/themed-cake-main.webp', alt: 'Birthday cake — Huntingdon, Cambridgeshire', full: ''},
    {src: 'assets/img/items/celebration-cake-main.webp', alt: 'Graduation cake — Cambridgeshire', full: ''},
    {src: 'assets/img/items/mini-bento-cake-main.webp', alt: 'Mini / Bento cake — Brampton', full: ''},
    {src: 'assets/img/cakes/25-celebration-cupcakes.webp', alt: 'Celebration cupcakes — Cambridge area', full: ''},
    {src: 'assets/img/cakes/22-cookie-cambridgeshire.webp', alt: 'Personalised postage cookie — Cambridgeshire', full: ''},
  ]).map(obj => ({ src: obj.src, alt: obj.alt || '', full: obj.full || inferFull(obj.src) }));

  // Build gallery skeleton
  const container = sec.querySelector('.container') || sec;
  let grid = sec.querySelector('.gallery');
  if (grid) grid.remove();
  grid = document.createElement('div');
  grid.className = 'gallery';
  container.appendChild(grid);

  // Lightbox
  let lb = document.querySelector('.dc-lightbox');
  if (!lb) {
    lb = document.createElement('div'); lb.className = 'dc-lightbox';
    lb.replaceChildren();
    const _btnClose = document.createElement('button'); _btnClose.className='close'; _btnClose.setAttribute('aria-label','Close'); _btnClose.textContent='×';
    const _btnPrev  = document.createElement('button'); _btnPrev.className='prev'; _btnPrev.setAttribute('aria-label','Previous'); _btnPrev.textContent='‹';
    const _img      = document.createElement('img'); _img.alt='';
    const _btnNext  = document.createElement('button'); _btnNext.className='next'; _btnNext.setAttribute('aria-label','Next'); _btnNext.textContent='›';
    lb.append(_btnClose, _btnPrev, _img, _btnNext);
    document.body.appendChild(lb);
  }
  const lbImg = lb.querySelector('img');
  const btnClose = lb.querySelector('.close');
  const btnPrev  = lb.querySelector('.prev');
  const btnNext  = lb.querySelector('.next');
  let current = 0;

  function openLightbox(i){
    current = i; updateLightbox();
    lb.classList.add('open'); document.documentElement.classList.add('dc-lightbox-open');
    // Hide "back to top" floating button if present
    document.querySelectorAll('.scroll-top, .back-to-top, .fab-contact').forEach(el => { el.dataset._prevDisplay = el.style.display; el.style.display = 'none'; });
    document.documentElement.style.overflow = 'hidden';
  }
  function closeLightbox(){
    lb.classList.remove('open'); document.documentElement.classList.remove('dc-lightbox-open');
    // Restore back-to-top
    document.querySelectorAll('.scroll-top, .back-to-top, .fab-contact').forEach(el => { el.style.display = el.dataset._prevDisplay || ''; delete el.dataset._prevDisplay; });
    document.documentElement.style.overflow = '';
  }
  function updateLightbox(){
    const item = IMAGES[current];
    lbImg.src = item.full || item.src;
    lbImg.alt = item.alt || '';
  }
  function prev(){ current = (current - 1 + IMAGES.length) % IMAGES.length; updateLightbox(); }
  function next(){ current = (current + 1) % IMAGES.length; updateLightbox(); }
  (btnClose) && btnClose.addEventListener('click', closeLightbox);
  (btnPrev) && btnPrev.addEventListener('click', prev);
  (btnNext) && btnNext.addEventListener('click', next);
  (lb) && lb.addEventListener('click', (e)=>{ if (e.target === lb) closeLightbox(); });
  
  // Touch swipe navigation
  let touchStartX = 0, touchStartY = 0;
  const SWIPE_THRESHOLD = 40;
  (lb) && lb.addEventListener('touchstart', (e)=>{
    if(!e.touches || !e.touches.length) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, {passive:true});
  (lb) && lb.addEventListener('touchend', (e)=>{
    if(!e.changedTouches || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD){
      if (dx < 0) next(); else prev();
    }
  }, {passive:true});

  document.addEventListener('keydown', (e)=>{
         if (!lb.classList.contains('open')) return; if (e.key==='Escape') closeLightbox(); if (e.key==='ArrowLeft') prev(); if (e.key==='ArrowRight') next(); });

  // Render items with INITIAL=8 and LOAD_STEP=8
  const INITIAL = 8, LOAD_STEP = 8;
  let rendered = 0;

  function createItem(obj, index){
  const item = document.createElement('div');
  item.className = 'gallery-item';
  const img = document.createElement('img');
  img.src = obj.src; img.alt = obj.alt;
  img.loading = 'lazy'; img.decoding = 'async';
  img.dataset.full = obj.full;
  img.dataset.index = String(index);
  item.appendChild(img);
  (item) && item.addEventListener('click', ()=> openLightbox(index));
  return item;
}

  function renderBatch(count){
    const end = Math.min(IMAGES.length, rendered + count);
    for (let i = rendered; i < end; i++) grid.appendChild(createItem(IMAGES[i], i));
    rendered = end;
    if (rendered >= IMAGES.length && loadBtn) loadBtn.setAttribute('disabled','disabled');
  }

  // Load more
  let loadWrap = sec.querySelector('.load-more-wrap');
  if (!loadWrap) {
    loadWrap = document.createElement('div'); loadWrap.className = 'load-more-wrap';
    container.appendChild(loadWrap);
  }
  let loadBtn = loadWrap.querySelector('button');
  if (!loadBtn) {
    loadBtn = document.createElement('button'); loadBtn.type = 'button'; loadBtn.className = 'btn-load-more'; loadBtn.textContent = 'Load more';
    loadWrap.appendChild(loadBtn);
  }
  (loadBtn) && loadBtn.addEventListener('click', ()=> renderBatch(LOAD_STEP));

  // CTA under gallery
  let cta = sec.querySelector('.cta-after');
  if (!cta) {
    cta = document.createElement('div'); cta.className = 'cta-after';
    cta.replaceChildren();
    const _a1 = document.createElement('a'); _a1.href='/#contact'; _a1.className='btn btn-primary'; _a1.textContent='Inspired? Start an order →';
    const _a2 = document.createElement('a'); _a2.href='#pricing'; _a2.className='btn btn-outline'; _a2.textContent='See Pricing';
    cta.append(_a1, _a2);
    container.appendChild(cta);
  }

  // Initial render
  renderBatch(INITIAL);
});


// Unified "Get a quote" behaviour
document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('a.btn-quote[href="#contact"]');
  const contact = document.querySelector('#contact');
  const subject = document.querySelector('#subject');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  btns.forEach(btn => {
    (btn) && btn.addEventListener('click', (e) => {
      if (!contact) return;
      e.preventDefault();
      if (subject && !subject.value) {
        const ctx = btn.getAttribute('data-quote') || 'Quote request';
        subject.value = `Quote request — ${ctx}`;
      }
      contact.scrollIntoView({ behavior: mqReduce.matches ? 'auto' : 'smooth', block: 'start' });
    });
  });
});

// v13 scrub cities in section-subtitle (UX copy only)
document.addEventListener('DOMContentLoaded', () => {
  const cityRe = /\b(Huntingdon|Cambridge|Peterborough|Bedford|London)\b(?:[\s•,;&/]+(Huntingdon|Cambridge|Peterborough|Bedford|London))*?/i;
  document.querySelectorAll('section .section-subtitle').forEach(p => {
    const txt = (p.textContent || '').trim();
    if (!txt) return;
    if (cityRe.test(txt) && txt.length <= 160) {
      const stripped = txt.replace(cityRe, '').replace(/^[\s•,;–-]+|[\s•,;–-]+$/g,'');
      if (stripped.length < 12) { p.remove(); }
      else { p.textContent = stripped; }
    }
  });
});
