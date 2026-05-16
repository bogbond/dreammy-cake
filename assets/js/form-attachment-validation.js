(function(){
  var MAX_BYTES_DEFAULT = 10 * 1024 * 1024;
  var allowedExtensions = ['jpg','jpeg','png','webp','gif','bmp','heic','heif','pdf','tif','tiff'];
  var allowedMimeTypes = [
    'image/jpeg','image/png','image/webp','image/gif','image/bmp','image/heic','image/heif','application/pdf','image/tiff'
  ];

  function getExtension(filename){
    var parts = (filename || '').toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : '';
  }

  function isAllowedFile(file){
    if(!file) return true;
    var ext = getExtension(file.name);
    var mime = (file.type || '').toLowerCase();
    if(allowedExtensions.indexOf(ext) !== -1) return true;
    if(mime && allowedMimeTypes.indexOf(mime) !== -1) return true;
    return false;
  }

  function formatBytes(bytes){
    bytes = Number(bytes) || 0;
    if(bytes >= 1024 * 1024){
      var mb = bytes / (1024 * 1024);
      return (Math.abs(mb - Math.round(mb)) < 0.05 ? Math.round(mb) : mb.toFixed(1)) + ' MB';
    }
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  function feedbackElement(input){
    if(!input) return null;
    var id = input.getAttribute('data-file-feedback-id');
    if(id){
      var explicit = document.getElementById(id);
      if(explicit) return explicit;
    }
    if(input.id === 'boAttachments') return document.getElementById('boFileFeedback');
    return null;
  }

  function setFieldMessage(input, message){
    input.setCustomValidity(message || '');
    var feedback = feedbackElement(input);
    if(feedback) feedback.textContent = message || '';
  }

  function updateFieldState(input){
    if(!input) return;
    input.classList.remove('is-invalid');
    if(input.validationMessage){
      input.classList.add('is-invalid');
    }
  }

  function validateInput(input){
    if(!input) return true;

    var maxBytes = parseInt(input.getAttribute('data-max-bytes') || '', 10);
    if(!Number.isFinite(maxBytes) || maxBytes <= 0) maxBytes = MAX_BYTES_DEFAULT;

    setFieldMessage(input, '');

    var files = input.files;
    if(!files || !files.length){
      updateFieldState(input);
      return true;
    }

    var maxFiles = parseInt(input.getAttribute('data-max-files') || '', 10);
    if(Number.isFinite(maxFiles) && maxFiles > 0 && files.length > maxFiles){
      setFieldMessage(input, 'Please upload up to ' + maxFiles + ' files.');
      updateFieldState(input);
      return false;
    }

    var maxTotalBytes = parseInt(input.getAttribute('data-max-total-bytes') || '', 10);
    var totalBytes = 0;
    for(var i = 0; i < files.length; i++){
      var file = files[i];
      totalBytes += file.size || 0;
      if(file.size > maxBytes){
        setFieldMessage(input, 'Each file must be up to ' + formatBytes(maxBytes) + '.');
        updateFieldState(input);
        return false;
      }

      if(!isAllowedFile(file)){
        setFieldMessage(input, 'Please upload JPG, PNG, WEBP, GIF, BMP, HEIC, TIFF or PDF.');
        updateFieldState(input);
        return false;
      }
    }

    if(Number.isFinite(maxTotalBytes) && maxTotalBytes > 0 && totalBytes > maxTotalBytes){
      setFieldMessage(input, 'Please keep all uploads within ' + formatBytes(maxTotalBytes) + ' total.');
      updateFieldState(input);
      return false;
    }

    updateFieldState(input);
    return true;
  }

  document.addEventListener('change', function(e){
    var input = e.target;
    if(!(input instanceof HTMLInputElement)) return;
    if(input.type !== 'file' || !input.hasAttribute('data-file-attachment')) return;
    validateInput(input);
  });

  document.addEventListener('submit', function(e){
    var form = e.target;
    if(!(form instanceof HTMLFormElement)) return;
    var fileInputs = form.querySelectorAll('input[type="file"][data-file-attachment]');
    if(!fileInputs.length) return;

    var allValid = true;
    fileInputs.forEach(function(input){
      if(!validateInput(input)) allValid = false;
    });

    if(!allValid){
      e.preventDefault();
      form.classList.add('was-validated');
      var firstInvalid = form.querySelector('input[type="file"][data-file-attachment].is-invalid');
      if(firstInvalid){
        try { firstInvalid.reportValidity(); } catch(err) {}
      }
    }
  }, true);
})();
