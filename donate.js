(function () {
  var PAYPAL_WEB = 'https://paypal.me/littlejonny1';
  var PAYPAL_APP = 'paypal://paypalme/littlejonny1';
  var VENMO_WEB = 'https://venmo.com/jonlawton';
  var VENMO_APP = 'venmo://paycharge?txn=pay&recipients=jonlawton';
  var METHODS = {
    paypal: { web: PAYPAL_WEB, app: PAYPAL_APP, label: 'PayPal' },
    venmo: { web: VENMO_WEB, app: VENMO_APP, label: 'Venmo' }
  };

  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
    document.documentElement.classList.add('donate-is-mobile');
  }

  var modal = document.createElement('div');
  modal.className = 'donate-modal';
  modal.hidden = true;
  modal.innerHTML =
    '<div class="donate-backdrop" data-donate-close></div>' +
    '<div class="donate-dialog" role="dialog" aria-modal="true" aria-labelledby="donate-title" tabindex="-1">' +
      '<button type="button" class="donate-close" data-donate-close aria-label="Close">&times;</button>' +
      '<h2 id="donate-title">Support the music</h2>' +
      '<div class="donate-desktop">' +
        '<div class="donate-toggle">' +
          '<button type="button" data-donate-method="paypal" aria-pressed="true">PayPal</button>' +
          '<button type="button" data-donate-method="venmo" aria-pressed="false">Venmo</button>' +
        '</div>' +
        '<p class="donate-scan">Scan the code to donate to Jon on PayPal</p>' +
        '<div class="donate-qr-wrap">' +
          '<img class="donate-qr is-loaded" data-qr="paypal" src="images/paypal-qr.png?v=2" alt="PayPal QR code">' +
          '<img class="donate-qr is-loaded" data-qr="venmo" src="images/venmo-qr.png" alt="Venmo QR code" hidden>' +
        '</div>' +
        '<p class="donate-direct">Or click <a class="donate-direct-link" href="' + PAYPAL_WEB + '" target="_blank" rel="noopener noreferrer">here</a> to donate directly</p>' +
      '</div>' +
      '<div class="donate-mobile-actions">' +
        '<button type="button" data-donate-app="paypal">PayPal</button>' +
        '<button type="button" data-donate-app="venmo">Venmo</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var dialog = modal.querySelector('.donate-dialog');
  var directLink = modal.querySelector('.donate-direct-link');
  var scanLine = modal.querySelector('.donate-scan');
  var lastFocus = null;

  function setMethod(name) {
    var method = METHODS[name];
    if (!method) return;
    modal.querySelectorAll('[data-qr]').forEach(function (img) {
      img.hidden = img.getAttribute('data-qr') !== name;
    });
    scanLine.textContent = 'Scan the code to donate to Jon on ' + method.label;
    directLink.href = method.web;
    modal.querySelectorAll('[data-donate-method]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-donate-method') === name ? 'true' : 'false');
    });
  }

  function openModal(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    setMethod('paypal');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    dialog.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openAppOrWeb(appUrl, webUrl) {
    var fallback = setTimeout(function () {
      if (!document.hidden) window.location.href = webUrl;
    }, 900);
    function onHide() {
      if (document.hidden) {
        clearTimeout(fallback);
        document.removeEventListener('visibilitychange', onHide);
      }
    }
    document.addEventListener('visibilitychange', onHide);
    window.location.href = appUrl;
  }

  function elFromEvent(e) {
    var t = e.target;
    return t && t.nodeType === 1 ? t : t && t.parentElement;
  }

  document.addEventListener('click', function (e) {
    var el = elFromEvent(e);
    if (!el) return;
    if (el.closest('[data-donate-open]')) {
      openModal(e);
    }
  });

  modal.addEventListener('click', function (e) {
    var el = elFromEvent(e);
    if (!el) return;
    if (el.closest('[data-donate-close]')) {
      closeModal();
      return;
    }
    var methodBtn = el.closest('[data-donate-method]');
    if (methodBtn) {
      setMethod(methodBtn.getAttribute('data-donate-method'));
      return;
    }
    var appBtn = el.closest('[data-donate-app]');
    if (appBtn) {
      var method = METHODS[appBtn.getAttribute('data-donate-app')];
      if (method) openAppOrWeb(method.app, method.web);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
