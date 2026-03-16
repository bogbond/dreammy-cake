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

    input.setCustomValidity('');

    var files = input.files;
    if(!files || !files.length){
      updateFieldState(input);
      return true;
    }

    var file = files[0];
    if(file.size > maxBytes){
      input.setCustomValidity('Please upload a file up to 10 MB.');
      updateFieldState(input);
      return false;
    }

    if(!isAllowedFile(file)){
      input.setCustomValidity('Please upload JPG, PNG, WEBP, GIF, BMP, HEIC, TIFF or PDF.');
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
