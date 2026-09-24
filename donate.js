(function () {
  var PAYPAL_WEB = 'https://www.paypal.com/qrcodes/managed/7fec9b1a-0d22-4950-8a4d-41a32de31b01';
  var PAYPAL_APP = 'paypal://qrcodes/managed/7fec9b1a-0d22-4950-8a4d-41a32de31b01';
  var VENMO_WEB = 'https://venmo.com/jonlawton';
  var VENMO_APP = 'venmo://paycharge?txn=pay&recipients=jonlawton';
  var METHODS = {
    paypal: { qr: 'images/paypal-qr.png', alt: 'PayPal QR code', web: PAYPAL_WEB, app: PAYPAL_APP },
    venmo: { qr: 'images/venmo-qr.png', alt: 'Venmo QR code', web: VENMO_WEB, app: VENMO_APP }
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
        '<div class="donate-toggle" role="tablist">' +
          '<button type="button" data-donate-method="paypal" aria-pressed="true">PayPal</button>' +
          '<button type="button" data-donate-method="venmo" aria-pressed="false">Venmo</button>' +
        '</div>' +
        '<div class="donate-qr-wrap"><img class="donate-qr" src="' + METHODS.paypal.qr + '" alt="' + METHODS.paypal.alt + '"></div>' +
        '<p class="donate-direct">Or click <a class="donate-direct-link" href="' + PAYPAL_WEB + '" target="_blank" rel="noopener noreferrer">here</a> to donate directly</p>' +
      '</div>' +
      '<div class="donate-mobile-actions">' +
        '<button type="button" data-donate-app="paypal">PayPal</button>' +
        '<button type="button" data-donate-app="venmo">Venmo</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var dialog = modal.querySelector('.donate-dialog');
  var qrImg = modal.querySelector('.donate-qr');
  var directLink = modal.querySelector('.donate-direct-link');
  var lastFocus = null;

  function setMethod(name) {
    var method = METHODS[name];
    qrImg.src = method.qr;
    qrImg.alt = method.alt;
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

  document.addEventListener('click', function (e) {
    var openTrigger = e.target.closest('[data-donate-open]');
    if (openTrigger) {
      openModal(e);
      return;
    }
    if (e.target.closest('[data-donate-close]')) {
      closeModal();
      return;
    }
    var methodBtn = e.target.closest('[data-donate-method]');
    if (methodBtn) {
      setMethod(methodBtn.getAttribute('data-donate-method'));
      return;
    }
    var appBtn = e.target.closest('[data-donate-app]');
    if (appBtn) {
      var method = METHODS[appBtn.getAttribute('data-donate-app')];
      openAppOrWeb(method.app, method.web);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
