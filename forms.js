// forms.js — posts website forms to the Sustainsys Supabase Edge Function
// (submit-application) in the background, with an email fallback if the
// request fails. Used by job-openings.html (applications) and contact.html.
(function () {
  var ENDPOINT = 'https://lubfkbvgrlvyjsrdzlyl.supabase.co/functions/v1/submit-application';
  var APIKEY = 'sb_publishable_us_GrBiHO7DwNTFVE3zMPw_VSVgr1QS';
  var FALLBACK_EMAIL = 'info@sustainsys.co.uk';
  var TIMEOUT_MS = 20000;

  function qs(sel, root) { return (root || document).querySelector(sel); }

  function buildMailto(form, subject) {
    var lines = [];
    new FormData(form).forEach(function (v, k) {
      if (k.charAt(0) === '_' || k === 'kind' || v instanceof File) return;
      if (typeof v === 'string' && v.trim()) lines.push(k.replace(/_/g, ' ') + ': ' + v.trim());
    });
    lines.push('', '(Please attach your CV to this email.)');
    return 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  window.sustainsysSubmit = function (form, opts) {
    opts = opts || {};
    var btn = qs('button[type="submit"]', form);
    var status = opts.status || qs('.form-status', form);
    var original = btn ? btn.innerHTML : '';

    function show(kind, html) {
      if (!status) return;
      status.className = 'form-status ' + kind;
      status.innerHTML = html;
      status.style.display = 'block';
      status.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }
    if (status) status.style.display = 'none';

    var fd = new FormData(form);
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;

    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'apikey': APIKEY },
      body: fd,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (r.ok && data.ok) {
          form.reset();
          show('ok', opts.successHtml || '<strong>Thank you — received.</strong> We will be in touch by email.');
          if (btn) { btn.disabled = false; btn.innerHTML = original; }
          return true;
        }
        var e = new Error(data.error || ('Request failed (' + r.status + ')'));
        e.fromServer = !!data.error;
        throw e;
      });
    }).catch(function (err) {
      var subject = opts.subject || 'Website submission';
      show('err',
        '<strong>Sorry — we could not send this automatically.</strong> ' +
        (err && err.fromServer ? err.message + ' ' : '') +
        'Please <a href="' + buildMailto(form, subject) + '">send it by email</a> instead' +
        (opts.needsAttachment ? ' and attach your CV' : '') + '.');
      if (btn) { btn.disabled = false; btn.innerHTML = original; }
      return false;
    }).finally(function () { if (timer) clearTimeout(timer); });
  };
})();
