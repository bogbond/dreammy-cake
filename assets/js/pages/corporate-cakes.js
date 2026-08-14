(function () {
  'use strict';

  function initGallery() {
    if (!window.GLightbox) return;
    window.GLightbox({
      selector: '.glightbox',
      loop: true,
      touchNavigation: true,
      keyboardNavigation: true,
      closeButton: true,
      openEffect: 'fade',
      closeEffect: 'fade'
    });
  }

  function initCorporateForm() {
    var form = document.getElementById('corporateEnquiryForm');
    if (!form) return;

    var modeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-corporate-mode]'));
    var modeLinks = Array.prototype.slice.call(document.querySelectorAll('[data-enquiry-mode]'));
    var panels = Array.prototype.slice.call(form.querySelectorAll('[data-mode-panel]'));
    var inquiryType = document.getElementById('corporateInquiryType');
    var serviceInputs = Array.prototype.slice.call(form.querySelectorAll('[data-corporate-service]'));
    var serviceError = form.querySelector('.dc-corporate-service-error');
    var dateInput = document.getElementById('corporateDate');
    var currentMode = 'quote';

    if (dateInput) {
      var today = new Date();
      var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      dateInput.min = iso;
    }

    function clearServiceError() {
      serviceInputs.forEach(function (input) { input.setCustomValidity(''); });
      if (serviceError) serviceError.textContent = '';
    }

    function validateServices() {
      clearServiceError();
      if (currentMode === 'quick') return true;
      var checked = serviceInputs.some(function (input) { return input.checked; });
      if (!checked && serviceInputs[0]) {
        serviceInputs[0].setCustomValidity('Please choose at least one service.');
        if (serviceError) serviceError.textContent = 'Please choose at least one service.';
      }
      return checked;
    }

    function setMode(requestedMode, focusPanel) {
      var isQuick = requestedMode === 'quick';
      currentMode = isQuick ? 'quick' : requestedMode === 'collaboration' ? 'collaboration' : 'quote';
      var visiblePanel = isQuick ? 'quick' : 'quote';

      panels.forEach(function (panel) {
        var active = panel.getAttribute('data-mode-panel') === visiblePanel;
        panel.hidden = !active;
        panel.disabled = !active;
        Array.prototype.forEach.call(panel.querySelectorAll('[data-corporate-required]'), function (field) {
          field.required = active;
        });
      });

      modeButtons.forEach(function (button) {
        var active = button.getAttribute('data-corporate-mode') === visiblePanel;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (inquiryType) {
        inquiryType.value = currentMode === 'quick'
          ? 'Quick corporate question'
          : currentMode === 'collaboration'
            ? 'Creative collaboration proposal'
            : 'Corporate quote request';
      }

      if (currentMode === 'collaboration') {
        serviceInputs.forEach(function (input) {
          if (input.value === 'Creative collaboration') input.checked = true;
        });
      }

      clearServiceError();
      form.classList.remove('was-validated');

      if (focusPanel) {
        var firstField = form.querySelector('[data-mode-panel="' + visiblePanel + '"] input:not([type="hidden"]), [data-mode-panel="' + visiblePanel + '"] select, [data-mode-panel="' + visiblePanel + '"] textarea');
        if (firstField) window.setTimeout(function () { firstField.focus({ preventScroll: true }); }, 450);
      }
    }

    modeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setMode(button.getAttribute('data-corporate-mode') || 'quote', true);
      });
    });

    modeLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setMode(link.getAttribute('data-enquiry-mode') || 'quote', false);
      });
    });

    serviceInputs.forEach(function (input) { input.addEventListener('change', clearServiceError); });

    form.addEventListener('submit', function (event) {
      var fileInput = form.querySelector('[data-file-attachment]');
      if (fileInput && fileInput.files && fileInput.files.length && fileInput.files[0].size > 9961472) {
        fileInput.setCustomValidity('Please upload one file up to 10 MB.');
      } else if (fileInput) {
        fileInput.setCustomValidity('');
      }
      validateServices();
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        var invalid = form.querySelector(':invalid');
        if (invalid) invalid.focus();
        return;
      }
      form.classList.add('was-validated');
      if (window.gtag) {
        window.gtag('event', 'corporate_enquiry_submit', { enquiry_type: currentMode });
      }
    });

    setMode('quote', false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initGallery();
    initCorporateForm();
  });
})();
