// Minimal JS for the three pages
(function() {
  // Helper: smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    (a) && a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
    // Guard against invalid selectors like '#'
    if (!href || href === '#' || href.trim() === '') { return; }
    if (!href.startsWith('#') || href.length < 2) { return; }
    let target;
    try {
      target = document.querySelector(href);
    } catch (err) {
      // Invalid selector (e.g., '#'), abort smoothly
      return;
    }
    if (!target) { return; }
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Delivery estimator (approx £5–£30 based on distance)
  const dist = document.querySelector('#dc-distance');
  const fee = document.querySelector('#dc-fee');
  const kmLbl = document.querySelector('#dc-km');
  function formatGBP(n){ return '£' + Math.round(n); }
  function updateFee() {
    if (!dist || !fee) return;
    const km = Math.max(0, Math.min(50, Number(dist.value || 0)));
    // new rule: 0–5 km free (£0), from 6–50 km map linearly £5..£30
const min = 5, max = 30;
let price;
if (km <= 5) {
  price = 0;
} else {
  const kmAdj = Math.max(6, Math.min(50, km));
  const t = (kmAdj - 6) / (50 - 6); // 6km -> 0 ; 50km -> 1
  price = min + t * (max - min);
}
if (kmLbl) kmLbl.textContent = km + ' km';
fee.replaceChildren();
fee.append(price===0 ? '≈ £0 ' : ('≈ ' + formatGBP(price) + ' '));
    const _span = document.createElement('span'); _span.className='dim'; _span.textContent = (price===0 ? '(free within 5 km)' : '(final quote after postcode & timing)');
    fee.append(_span);
  }
  if (dist) {
    (dist) && dist.addEventListener('input', updateFee);
    updateFee();
  }

  // Accordion toggles
  document.querySelectorAll('[data-accordion]').forEach(function(acc){
    (acc) && acc.addEventListener('click', function(){
      const p = this.parentElement;
      p.classList.toggle('open');
      const body = p.querySelector('.acc-body');
      if (body) {
        body.style.maxHeight = p.classList.contains('open') ? body.scrollHeight + 'px' : '0px';
      }
    });
  });

  // Add logo image to header (with fallback) for these pages
  (function addLogo(){
    var logoLink = document.querySelector('#header .logo');
    if (!logoLink) return;
    if (logoLink.querySelector('img')) return; // already has
    var img = new Image();
    img.alt = 'Dreamy Cake Bakery';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.height = 28;
    img.src = '/assets/img/logo.png';
    img.onerror = function(){ img.src = '/assets/img/logo.png'; };
    logoLink.insertBefore(img, logoLink.firstChild);
  })();
})();

// --- lightweight header behaviors for info pages ---
(function(){
  function updateScrolled(){
    if (window.scrollY > 0) document.body.classList.add('scrolled');
    else document.body.classList.remove('scrolled');
  }
  window.addEventListener('scroll', updateScrolled, {passive:true});
  updateScrolled();

  var burger = document.querySelector('.mobile-nav-toggle');
  if (burger){
    burger.addEventListener('click', function(){
      document.body.classList.toggle('mobile-nav-active');
      this.classList.toggle('bi-list');
      this.classList.toggle('bi-x');
    });
  }
})();
