(function(){
  "use strict";

  function safeGtag(eventName, params){
    try{
      if(window.gtag){
        window.gtag('event', eventName, params || {});
      }
    }catch(e){}
  }

  function getClickLocation(el){
    try{
      if(el.closest('footer') || el.closest('#footer')) return 'footer';
      if(el.closest('#header') || el.closest('header') || el.closest('nav')) return 'header';
      var section = el.closest('section[id]');
      if(section && section.id) return section.id;
    }catch(e){}
    return 'body';
  }

  function extractProductSlug(href){
    try{
      var m = String(href).match(/\/Products\/([^\/#]+)(?:\/|#|$)/i);
      if(m && m[1]) return m[1];
      var p = String(window.location.pathname || '');
      var m2 = p.match(/\/Products\/([^\/]+)\/?/i);
      if(m2 && m2[1]) return m2[1];
    }catch(e){}
    return 'current_page';
  }

  document.addEventListener('click', function(e){
    var el = e.target;
    if(!el) return;
    if(el.nodeType === 3) el = el.parentElement; // text node safeguard
    if(!el) return;

    var a = (el.closest ? el.closest('a') : null);
    if(!a) return;

    var href = a.getAttribute('href') || '';

    // phone_click (tel:)
    if(/^tel:/i.test(href)){
      safeGtag('phone_click', {
        location: getClickLocation(a),
        page_path: window.location.pathname
      });
      return;
    }

    // order_click (optional micro-conversion)
    if(/#order/i.test(href)){
      safeGtag('order_click', {
        product_slug: extractProductSlug(href),
        location: getClickLocation(a),
        page_path: window.location.pathname
      });
      return;
    }
  }, { passive: true });
})();
