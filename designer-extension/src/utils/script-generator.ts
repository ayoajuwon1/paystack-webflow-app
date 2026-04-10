import type { PaymentButtonConfig } from "../types/paystack";

interface GenerateClientScriptOptions {
  publicKey: string;
  config: PaymentButtonConfig;
}

export function generateClientScript({
  publicKey,
  config,
}: GenerateClientScriptOptions): string {
  const channels = JSON.stringify(config.channels);

  return `<script>
(function() {
  var CONFIG = {
    publicKey: ${JSON.stringify(publicKey)},
    defaultCurrency: ${JSON.stringify(config.currency)},
    defaultChannels: ${channels},
    successUrl: ${JSON.stringify(config.successUrl)},
    cancelUrl: ${JSON.stringify(config.cancelUrl)},
    emailMode: ${JSON.stringify(config.emailCollection)},
    emailSelector: ${JSON.stringify(config.emailFieldSelector)}
  };

  var script = document.createElement('script');
  script.src = 'https://js.paystack.co/v2/inline.js';
  script.onload = init;
  document.head.appendChild(script);

  function init() {
    var buttons = document.querySelectorAll('[data-paystack-button]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', handleClick);
    }
  }

  function handleClick(e) {
    e.preventDefault();
    var btn = e.currentTarget;
    var amount = parseInt(btn.getAttribute('data-paystack-amount') || '0', 10);
    var currency = btn.getAttribute('data-paystack-currency') || CONFIG.defaultCurrency;
    var plan = btn.getAttribute('data-paystack-plan') || '';
    var subaccount = btn.getAttribute('data-paystack-subaccount') || '';
    var splitCode = btn.getAttribute('data-paystack-split') || '';
    var emailField = btn.getAttribute('data-paystack-email-field') || CONFIG.emailSelector;

    var email = '';
    if (emailField) {
      var el = document.querySelector(emailField);
      if (el) email = el.value || '';
    }
    if (!email && CONFIG.emailMode === 'prompt') {
      email = prompt('Please enter your email address:');
      if (!email) return;
    }
    if (!email) {
      alert('Email address is required to process payment.');
      return;
    }

    var popup = new PaystackPop();
    var txnConfig = {
      key: CONFIG.publicKey,
      email: email,
      amount: amount,
      currency: currency,
      channels: CONFIG.defaultChannels,
      onSuccess: function(txn) {
        if (CONFIG.successUrl) {
          window.location.href = CONFIG.successUrl + (CONFIG.successUrl.indexOf('?') > -1 ? '&' : '?') + 'reference=' + txn.reference;
        } else {
          showSuccess(btn, txn.reference);
        }
      },
      onCancel: function() {
        if (CONFIG.cancelUrl) {
          window.location.href = CONFIG.cancelUrl;
        }
      }
    };

    if (plan) txnConfig.plan = plan;
    if (subaccount) txnConfig.subaccount = subaccount;
    if (splitCode) txnConfig.split_code = splitCode;

    popup.newTransaction(txnConfig);
  }

  function showSuccess(btn, reference) {
    var msg = document.createElement('div');
    msg.style.cssText = 'padding:12px 16px;background:#e8f5e9;color:#2e7d32;border-radius:8px;margin-top:12px;font-size:14px;font-family:sans-serif';
    msg.textContent = 'Payment successful! Reference: ' + reference;
    btn.parentNode.insertBefore(msg, btn.nextSibling);
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }
})();
</script>`;
}

interface GenerateServerScriptOptions {
  backendUrl: string;
  siteId: string;
  config: PaymentButtonConfig;
}

export function generateServerScript({
  backendUrl,
  siteId,
  config,
}: GenerateServerScriptOptions): string {
  const channels = JSON.stringify(config.channels);

  return `<script>
(function() {
  var CONFIG = {
    apiBase: ${JSON.stringify(backendUrl)},
    siteId: ${JSON.stringify(siteId)},
    defaultCurrency: ${JSON.stringify(config.currency)},
    defaultChannels: ${channels},
    successUrl: ${JSON.stringify(config.successUrl)},
    cancelUrl: ${JSON.stringify(config.cancelUrl)},
    emailMode: ${JSON.stringify(config.emailCollection)},
    emailSelector: ${JSON.stringify(config.emailFieldSelector)}
  };

  var script = document.createElement('script');
  script.src = 'https://js.paystack.co/v2/inline.js';
  script.onload = init;
  document.head.appendChild(script);

  function init() {
    var buttons = document.querySelectorAll('[data-paystack-button]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', handleClick);
    }
  }

  function handleClick(e) {
    e.preventDefault();
    var btn = e.currentTarget;
    btn.disabled = true;
    btn.style.opacity = '0.7';

    var amount = parseInt(btn.getAttribute('data-paystack-amount') || '0', 10);
    var currency = btn.getAttribute('data-paystack-currency') || CONFIG.defaultCurrency;
    var plan = btn.getAttribute('data-paystack-plan') || '';
    var subaccount = btn.getAttribute('data-paystack-subaccount') || '';
    var splitCode = btn.getAttribute('data-paystack-split') || '';
    var emailField = btn.getAttribute('data-paystack-email-field') || CONFIG.emailSelector;

    var email = '';
    if (emailField) {
      var el = document.querySelector(emailField);
      if (el) email = el.value || '';
    }
    if (!email && CONFIG.emailMode === 'prompt') {
      email = prompt('Please enter your email address:');
      if (!email) { btn.disabled = false; btn.style.opacity = '1'; return; }
    }
    if (!email) {
      alert('Email address is required to process payment.');
      btn.disabled = false; btn.style.opacity = '1';
      return;
    }

    var body = {
      siteId: CONFIG.siteId,
      amount: amount,
      email: email,
      currency: currency,
      channels: CONFIG.defaultChannels,
      metadata: {}
    };
    if (plan) body.plan = plan;
    if (subaccount) body.subaccount = subaccount;
    if (splitCode) body.split_code = splitCode;

    fetch(CONFIG.apiBase + '/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.access_code) throw new Error(data.message || 'Failed to initialize');
      var popup = new PaystackPop();
      popup.resumeTransaction({
        accessCode: data.access_code,
        onSuccess: function(txn) {
          fetch(CONFIG.apiBase + '/api/paystack/verify?reference=' + txn.reference)
          .then(function(r) { return r.json(); })
          .then(function(result) {
            if (result.status === 'success') {
              if (CONFIG.successUrl) {
                window.location.href = CONFIG.successUrl + (CONFIG.successUrl.indexOf('?') > -1 ? '&' : '?') + 'reference=' + txn.reference;
              } else {
                showSuccess(btn, txn.reference);
              }
            }
          });
        },
        onCancel: function() {
          btn.disabled = false; btn.style.opacity = '1';
          if (CONFIG.cancelUrl) window.location.href = CONFIG.cancelUrl;
        }
      });
    })
    .catch(function(err) {
      alert('Payment initialization failed: ' + err.message);
      btn.disabled = false; btn.style.opacity = '1';
    });
  }

  function showSuccess(btn, reference) {
    var msg = document.createElement('div');
    msg.style.cssText = 'padding:12px 16px;background:#e8f5e9;color:#2e7d32;border-radius:8px;margin-top:12px;font-size:14px;font-family:sans-serif';
    msg.textContent = 'Payment successful! Reference: ' + reference;
    btn.parentNode.insertBefore(msg, btn.nextSibling);
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }
})();
</script>`;
}
