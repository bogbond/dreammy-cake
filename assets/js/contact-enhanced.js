
(function(){
  const form = document.getElementById('contactFormEnhanced');
  if(!form) return;

  const alertBox = document.getElementById('contactAlert');
  const btn = document.getElementById('contactSubmitBtn');
  const btnLabel = btn?.querySelector('.btn-label');
  const btnSpinner = btn?.querySelector('.btn-spinner');
  const modal = document.getElementById('contactSuccessModal');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    e.stopPropagation();

    if(!form.checkValidity()){
      form.classList.add('was-validated');
      showAlert('Please fill the required fields.', 'alert-danger');
      return;
    }

    setLoading(true);
    const fd = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' }
    }).then(async (res)=>{
      if(res.ok){
        form.reset();
        form.classList.remove('was-validated');
        showModal(true);
        showAlert('', '', true);
      }else{
        const data = await safeJson(res);
        const msg = data && data.message ? data.message : 'Something went wrong. Please try again or email us: dreamycake.info@gmail.com';
        showAlert(msg, 'alert-danger');
      }
    }).catch(()=>{
      showAlert('Network error. Please try again or email us: dreamycake.info@gmail.com', 'alert-danger');
    }).finally(()=> setLoading(false));
  });

  function safeJson(res){ return res.json().catch(()=>null); }

  function setLoading(state){
    if(!btn) return;
    if(state){
      btn.setAttribute('disabled','disabled');
      if(btnLabel) btnLabel.textContent = 'Sending…';
      if(btnSpinner) btnSpinner.classList.remove('d-none');
    }else{
      btn.removeAttribute('disabled');
      if(btnLabel) btnLabel.textContent = 'Send message';
      if(btnSpinner) btnSpinner.classList.add('d-none');
    }
  }

  function showAlert(message, cls, hide=false){
    if(!alertBox) return;
    if(hide){
      alertBox.className = 'alert d-none';
      alertBox.textContent = '';
      return;
    }
    alertBox.className = 'alert ' + (cls || 'alert-success');
    alertBox.textContent = message || 'Thanks! Your message has been sent.';
  }

  function showModal(open){
    if(!modal) return;
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  document.addEventListener('click', (e)=>{
    if(e.target.matches('[data-close-modal]') || e.target === modal){
      showModal(false);
    }
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') showModal(false);
  });
})();

/* Smooth scroll for CTA contact button */
(function(){
  const link = document.querySelector('a[data-scroll="#contact"]');
  if(!link) return;
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  link.addEventListener('click', function(e){
    const target = document.querySelector('#contact');
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior: mqReduce.matches ? 'auto' : 'smooth', block: 'start'});
    }
  });
})();
