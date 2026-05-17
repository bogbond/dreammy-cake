(function(){
  'use strict';

  // Formly.email handles the actual submission with a normal browser POST.
  // This file intentionally does NOT intercept the contact form submit event.
  // Keeping submission native avoids the old artificial upload/progress timeout flow.

  var form = document.getElementById('contactFormEnhanced');
  var attachmentInput = form ? form.querySelector('input[type="file"][data-file-attachment]') : null;
  var uploadWrap = document.getElementById('contactUploadStatusWrap');
  var uploadText = document.getElementById('contactUploadStatusText');
  var uploadPercent = document.getElementById('contactUploadStatusPercent');
  var uploadBar = document.getElementById('contactUploadProgressBar');

  function hideUploadStatus(){
    if(uploadWrap) uploadWrap.classList.add('d-none');
    if(uploadText) uploadText.textContent = '';
    if(uploadPercent) uploadPercent.textContent = '';
    if(uploadBar){
      uploadBar.style.width = '0%';
      uploadBar.setAttribute('aria-valuenow', '0');
    }
  }

  function showSelectedFile(file){
    if(!uploadWrap || !uploadText) return;
    if(!file){
      hideUploadStatus();
      return;
    }
    uploadWrap.classList.remove('d-none');
    uploadText.textContent = 'Selected: ' + (file.name || 'file') + '. It will be sent with your message.';
    if(uploadPercent) uploadPercent.textContent = 'Ready';
    if(uploadBar){
      uploadBar.className = 'progress-bar';
      uploadBar.style.width = '0%';
      uploadBar.setAttribute('aria-valuenow', '0');
    }
  }

  if(attachmentInput){
    attachmentInput.addEventListener('change', function(){
      var file = attachmentInput.files && attachmentInput.files[0];
      showSelectedFile(file || null);
    });
  }

  var link = document.querySelector('a[data-scroll="#contact"]');
  if(link){
    var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    link.addEventListener('click', function(e){
      var target = document.querySelector('#contact');
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior: mqReduce.matches ? 'auto' : 'smooth', block: 'start'});
      }
    });
  }

  function closeContactModal(){
    var modal = document.getElementById('contactSuccessModal');
    if(!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  window.dcCloseContactModal = closeContactModal;
  document.addEventListener('click', function(e){
    if(e.target && (e.target.matches('[data-close-modal]') || e.target.id === 'contactSuccessModal')){
      e.preventDefault();
      closeContactModal();
    }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeContactModal();
  });
})();
