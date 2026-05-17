(function(){
  'use strict';

  // v3.25: no custom honeypot fields; Formly server-side spam checks still apply.

  var FORMLY_ENDPOINT_PATTERN = /formly\.email\/submit/i;
  var THANK_YOU_PATH = '/Thank-You/';

  function isFormlyForm(form){
    return form instanceof HTMLFormElement && FORMLY_ENDPOINT_PATTERN.test(form.action || '');
  }

  function ensureHidden(form, name){
    var input = form.querySelector('input[name="' + name + '"]');
    if(!input){
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.insertBefore(input, form.firstChild);
    }
    return input;
  }

  function absoluteThankYouUrl(){
    return window.location.origin + THANK_YOU_PATH;
  }

  function prepareForm(form){
    if(!isFormlyForm(form)) return;

    var redirect = ensureHidden(form, 'redirect');
    redirect.value = absoluteThankYouUrl();

    var sourceUrl = ensureHidden(form, 'source_page_url');
    sourceUrl.value = window.location.href;

    var sourceTitle = ensureHidden(form, 'source_page_title');
    sourceTitle.value = document.title || '';

    var submittedAt = ensureHidden(form, 'submitted_at');
    submittedAt.value = new Date().toISOString();

    var pageUrl = form.querySelector('input[name="page_url"]');
    if(pageUrl){
      pageUrl.value = window.location.href;
    }
  }

  function boot(){
    document.querySelectorAll('form[action*="formly.email/submit"]').forEach(prepareForm);
  }

  document.addEventListener('submit', function(event){
    var form = event.target;
    if(!isFormlyForm(form)) return;
    prepareForm(form);
  }, true);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
