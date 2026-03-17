(function(){
  const form = document.getElementById('contactFormEnhanced');
  if(!form) return;

  const alertBox = document.getElementById('contactAlert');
  const btn = document.getElementById('contactSubmitBtn');
  const btnLabel = btn?.querySelector('.btn-label');
  const btnSpinner = btn?.querySelector('.btn-spinner');
  const modal = document.getElementById('contactSuccessModal');
  const attachmentInput = form.querySelector('input[type="file"][data-file-attachment]');
  const uploadWrap = document.getElementById('contactUploadStatusWrap');
  const uploadCard = document.getElementById('contactUploadStatusCard');
  const uploadText = document.getElementById('contactUploadStatusText');
  const uploadPercent = document.getElementById('contactUploadStatusPercent');
  const uploadBar = document.getElementById('contactUploadProgressBar');
  let activeXhr = null;
  let hideUploadTimer = null;

  if(attachmentInput){
    attachmentInput.addEventListener('change', function(){
      const file = attachmentInput.files && attachmentInput.files[0];
      if(!file){
        hideUploadStatus();
        return;
      }

      setUploadStatus({
        visible: true,
        percent: 0,
        message: 'Selected: ' + file.name + '. It will upload when you send the form.',
        percentLabel: 'Ready',
        state: 'ready'
      });
    });
  }

  form.addEventListener('submit', function(e){
    if(e.defaultPrevented) return;

    e.preventDefault();
    e.stopPropagation();

    if(!form.checkValidity()){
      form.classList.add('was-validated');
      showAlert('Please fill the required fields.', 'alert-danger');
      return;
    }

    const hasAttachment = !!(attachmentInput && attachmentInput.files && attachmentInput.files.length);
    const fd = new FormData(form);

    showAlert('', '', true);
    setLoading(true, hasAttachment ? 'Uploading…' : 'Sending…');

    if(hasAttachment){
      setUploadStatus({
        visible: true,
        percent: 0,
        message: 'Uploading your file…',
        percentLabel: '0%',
        state: 'uploading'
      });
    } else {
      hideUploadStatus();
    }

    const xhr = new XMLHttpRequest();
    activeXhr = xhr;
    xhr.open('POST', form.action, true);
    xhr.timeout = 120000;
    xhr.setRequestHeader('Accept', 'application/json');

    if(hasAttachment && xhr.upload){
      xhr.upload.addEventListener('loadstart', function(){
        setUploadStatus({
          visible: true,
          percent: 0,
          message: 'Uploading your file…',
          percentLabel: '0%',
          state: 'uploading'
        });
      });

      xhr.upload.addEventListener('progress', function(event){
        if(!event.lengthComputable) return;
        const pct = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)));
        setUploadStatus({
          visible: true,
          percent: pct,
          message: pct >= 100 ? 'File uploaded — sending your message…' : 'Uploading your file…',
          percentLabel: pct + '%',
          state: pct >= 100 ? 'finishing' : 'uploading'
        });
      });

      xhr.upload.addEventListener('load', function(){
        setUploadStatus({
          visible: true,
          percent: 100,
          message: 'File uploaded — waiting for confirmation…',
          percentLabel: '100%',
          state: 'finishing'
        });
      });
    }

    xhr.addEventListener('load', function(){
      const data = safeJson(xhr.responseText);

      if(xhr.status >= 200 && xhr.status < 300){
        if(hasAttachment){
          setUploadStatus({
            visible: true,
            percent: 100,
            message: 'File uploaded successfully. Your message has been sent.',
            percentLabel: '100%',
            state: 'success'
          });
        }

        form.reset();
        form.classList.remove('was-validated');
        showModal(true);
        showAlert('', '', true);
        if(window.gtag){ gtag('event','contact_submit_success',{
          lead_type:'contact_form',
          form_id:'contactFormEnhanced',
          page_path: location.pathname
        }); }

        if(hasAttachment){
          window.clearTimeout(hideUploadTimer);
          hideUploadTimer = window.setTimeout(hideUploadStatus, 2400);
        }
      } else {
        const msg = data && data.message ? data.message : 'Something went wrong. Please try again or email us: contact@dreamycake.co.uk';
        if(hasAttachment){
          setUploadStatus({
            visible: true,
            percent: 100,
            message: 'Upload did not complete. Please try again.',
            percentLabel: 'Error',
            state: 'error'
          });
        }
        showAlert(msg, 'alert-danger');
      }
    });

    xhr.addEventListener('error', function(){
      if(hasAttachment){
        setUploadStatus({
          visible: true,
          percent: 100,
          message: 'Upload failed because of a network error. Please try again.',
          percentLabel: 'Error',
          state: 'error'
        });
      }
      showAlert('Network error. Please try again or email us: contact@dreamycake.co.uk', 'alert-danger');
    });

    xhr.addEventListener('timeout', function(){
      if(hasAttachment){
        setUploadStatus({
          visible: true,
          percent: 100,
          message: 'The upload took too long. Please try again.',
          percentLabel: 'Timed out',
          state: 'error'
        });
      }
      showAlert('The request took too long. Please try again or email us: contact@dreamycake.co.uk', 'alert-danger');
    });

    xhr.addEventListener('loadend', function(){
      activeXhr = null;
      setLoading(false);
    });

    xhr.send(fd);
  });

  function safeJson(text){
    try { return JSON.parse(text); } catch(err) { return null; }
  }

  function setLoading(state, loadingText){
    if(!btn) return;
    if(state){
      btn.setAttribute('disabled','disabled');
      if(btnLabel) btnLabel.textContent = loadingText || 'Sending…';
      if(btnSpinner) btnSpinner.classList.remove('d-none');
    } else {
      btn.removeAttribute('disabled');
      if(btnLabel) btnLabel.textContent = 'Send message';
      if(btnSpinner) btnSpinner.classList.add('d-none');
    }
  }

  function setUploadStatus(opts){
    if(!uploadWrap || !uploadCard || !uploadText || !uploadPercent || !uploadBar) return;
    window.clearTimeout(hideUploadTimer);

    const percent = Number.isFinite(opts.percent) ? Math.max(0, Math.min(100, opts.percent)) : 0;
    uploadWrap.classList.remove('d-none');
    uploadText.textContent = opts.message || 'Uploading your file…';
    uploadPercent.textContent = opts.percentLabel || (percent + '%');
    uploadBar.style.width = percent + '%';
    uploadBar.setAttribute('aria-valuenow', String(percent));
    uploadBar.className = 'progress-bar';

    if(opts.state === 'uploading'){
      uploadCard.className = 'border rounded-4 bg-light-subtle p-3';
      uploadBar.classList.add('progress-bar-striped', 'progress-bar-animated');
    } else if(opts.state === 'ready'){
      uploadCard.className = 'border rounded-4 bg-light-subtle p-3';
    } else if(opts.state === 'finishing'){
      uploadCard.className = 'border rounded-4 bg-light-subtle p-3';
      uploadBar.classList.add('progress-bar-striped', 'progress-bar-animated');
    } else if(opts.state === 'success'){
      uploadCard.className = 'border border-success-subtle rounded-4 bg-success-subtle p-3';
      uploadBar.classList.add('bg-success');
    } else if(opts.state === 'error'){
      uploadCard.className = 'border border-danger-subtle rounded-4 bg-danger-subtle p-3';
      uploadBar.classList.add('bg-danger');
    }
  }

  function hideUploadStatus(){
    if(!uploadWrap || !uploadText || !uploadPercent || !uploadBar || !uploadCard) return;
    uploadWrap.classList.add('d-none');
    uploadText.textContent = 'File ready to upload with your message.';
    uploadPercent.textContent = '0%';
    uploadCard.className = 'border rounded-4 bg-light-subtle p-3';
    uploadBar.className = 'progress-bar progress-bar-striped progress-bar-animated';
    uploadBar.style.width = '0%';
    uploadBar.setAttribute('aria-valuenow', '0');
  }

  function showAlert(message, cls, hide=false){
    if(!alertBox) return;
    if(hide){
      alertBox.className = 'alert d-none mt-3';
      alertBox.textContent = '';
      return;
    }
    alertBox.className = 'alert mt-3 ' + (cls || 'alert-success');
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
