/*! Dreamy Cake - know-more chip tracking (v32) */
(function(){
  function section(){var nodes=document.querySelectorAll('h1,h2,h3');for(var i=0;i<nodes.length;i++){var t=(nodes[i].textContent||'').trim().toLowerCase();if(t==='want to know more?'){return nodes[i].closest('section')||nodes[i].parentElement;}}return null;}
  function attach(root){ if(!root) return; root.querySelectorAll('a').forEach(function(el){ el.addEventListener('click', function(){ try{ if(window.gtag){ window.gtag('event','info_chip_click',{event_category:'engagement',event_label:(el.textContent||'').trim(),location:'home_know_more'});} }catch(e){} }); }); }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){attach(section());});} else {attach(section());}
})();