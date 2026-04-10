import type { PaymentButtonConfig } from "../types/paystack";

interface GenerateCartScriptOptions {
  publicKey: string;
  config: PaymentButtonConfig;
}

export function generateCartScript({
  publicKey,
  config,
}: GenerateCartScriptOptions): string {
  return `<script>
(function() {
  var CONFIG = {
    publicKey: ${JSON.stringify(publicKey)},
    currency: ${JSON.stringify(config.currency)},
    channels: ${JSON.stringify(config.channels)},
    successUrl: ${JSON.stringify(config.successUrl)},
    cancelUrl: ${JSON.stringify(config.cancelUrl)},
    emailMode: ${JSON.stringify(config.emailCollection)},
    emailSelector: ${JSON.stringify(config.emailFieldSelector)}
  };

  var CART_KEY = 'paystack_cart';
  var cart = loadCart();

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function parsePrice(raw) {
    var cleaned = (raw || '').replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  function fmtPrice(amount) {
    return CONFIG.currency + ' ' + amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.textContent;
  }

  function readProduct(btn) {
    var card = btn.closest('[data-paystack-product-id]') || btn.parentElement;
    var id = (card.getAttribute('data-paystack-product-id') || 'product_' + Date.now());
    var nameEl = card.querySelector('[data-paystack-product]');
    var priceEl = card.querySelector('[data-paystack-price]');
    var imageEl = card.querySelector('[data-paystack-product-image], img');
    var qtyEl = card.querySelector('[data-paystack-qty]');
    var variantSelects = card.querySelectorAll('[data-paystack-variant]');

    var basePrice = priceEl ? parsePrice(priceEl.textContent) : 0;
    var name = nameEl ? nameEl.textContent.trim() : 'Product';
    var image = imageEl ? (imageEl.src || '') : '';
    var qty = qtyEl ? (parseInt(qtyEl.value, 10) || 1) : 1;

    var variants = [];
    var priceAdjust = 0;
    for (var i = 0; i < variantSelects.length; i++) {
      var sel = variantSelects[i];
      var vName = sel.getAttribute('data-paystack-variant') || 'Option';
      variants.push({ name: vName, value: sel.value });
      var opt = sel.options ? sel.options[sel.selectedIndex] : null;
      if (opt && opt.getAttribute('data-price-adjust')) {
        priceAdjust += parseFloat(opt.getAttribute('data-price-adjust')) || 0;
      }
    }

    var variantKey = variants.map(function(v) { return v.name + ':' + v.value; }).join('|');
    return {
      cartId: id + (variantKey ? '_' + variantKey : ''),
      productId: id,
      name: name,
      price: basePrice + priceAdjust,
      image: image,
      qty: qty,
      variants: variants,
      variantLabel: variants.map(function(v) { return v.value; }).join(', ')
    };
  }

  function addToCart(product) {
    var existing = cart.find(function(item) { return item.cartId === product.cartId; });
    if (existing) { existing.qty += product.qty; }
    else { cart.push(product); }
    saveCart();
    updateCartUI();
    showNotif(esc(product.name) + ' added to cart');
  }

  function removeFromCart(cartId) {
    cart = cart.filter(function(item) { return item.cartId !== cartId; });
    saveCart();
    updateCartUI();
  }

  function updateQty(cartId, newQty) {
    if (newQty <= 0) { removeFromCart(cartId); return; }
    var item = cart.find(function(i) { return i.cartId === cartId; });
    if (item) { item.qty = newQty; saveCart(); updateCartUI(); }
  }

  function getTotal() { return cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0); }
  function getCount() { return cart.reduce(function(s, i) { return s + i.qty; }, 0); }
  function clearCart() { cart = []; saveCart(); updateCartUI(); }

  var cartBadge, cartDrawer, cartOverlay;

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = '.psk-badge{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:#0BA4DB;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(11,164,219,0.35);z-index:99998;transition:transform .2s;font-family:-apple-system,sans-serif}.psk-badge:hover{transform:scale(1.08)}.psk-badge svg{width:24px;height:24px}.psk-count{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px}.psk-hide{display:none}.psk-ov{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99998;opacity:0;transition:opacity .25s;pointer-events:none}.psk-ov-open{opacity:1;pointer-events:all}.psk-dw{position:fixed;top:0;right:0;bottom:0;width:380px;max-width:92vw;background:#fff;z-index:99999;transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;font-family:-apple-system,sans-serif;font-size:14px;color:#111827}.psk-dw-open{transform:translateX(0)}.psk-dw-h{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #e5e7eb}.psk-dw-h h2{font-size:17px;font-weight:700;margin:0}.psk-dw-x{background:none;border:none;cursor:pointer;font-size:22px;color:#9ca3af;padding:4px 8px}.psk-dw-x:hover{color:#111}.psk-dw-b{flex:1;overflow-y:auto;padding:16px 20px}.psk-dw-e{text-align:center;padding:48px 16px;color:#9ca3af}.psk-dw-e svg{width:48px;height:48px;margin-bottom:12px;opacity:.4}.psk-it{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #f3f4f6}.psk-it-img{width:56px;height:56px;border-radius:8px;object-fit:cover;background:#f3f4f6;flex-shrink:0}.psk-it-i{flex:1;min-width:0}.psk-it-n{font-weight:600;font-size:13px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.psk-it-v{font-size:11px;color:#6b7280;margin-bottom:4px}.psk-it-p{font-weight:600;color:#0BA4DB;font-size:13px}.psk-it-q{display:flex;align-items:center;gap:0;margin-top:6px}.psk-qb{width:28px;height:28px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;color:#111}.psk-qb:hover{background:#f3f4f6}.psk-qm{border-radius:6px 0 0 6px}.psk-qp{border-radius:0 6px 6px 0}.psk-qv{width:36px;height:28px;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;border-left:none;border-right:none;text-align:center;font-size:13px;font-weight:600;font-family:inherit}.psk-rm{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:11px;margin-top:4px;padding:2px 0}.psk-rm:hover{color:#ef4444}.psk-dw-f{padding:16px 20px;border-top:1px solid #e5e7eb;background:#fafbfc}.psk-tot{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.psk-tot-l{font-size:14px;color:#6b7280}.psk-tot-a{font-size:20px;font-weight:700}.psk-co{width:100%;padding:14px;background:#0BA4DB;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:background .15s;box-shadow:0 2px 8px rgba(11,164,219,.3)}.psk-co:hover{background:#0993c5}.psk-co:disabled{opacity:.5;cursor:not-allowed}.psk-cl{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:12px;margin-top:8px;width:100%;text-align:center;padding:4px}.psk-cl:hover{color:#ef4444}.psk-nf{position:fixed;bottom:90px;right:24px;background:#111827;color:#fff;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:500;z-index:100000;animation:pskIn .25s;box-shadow:0 4px 12px rgba(0,0,0,.15)}@keyframes pskIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  function injectCartUI() {
    injectStyles();

    cartOverlay = document.createElement('div');
    cartOverlay.className = 'psk-ov';
    cartOverlay.addEventListener('click', closeDrawer);
    document.body.appendChild(cartOverlay);

    cartDrawer = document.createElement('div');
    cartDrawer.className = 'psk-dw';
    var head = document.createElement('div'); head.className = 'psk-dw-h';
    var h2 = document.createElement('h2'); h2.textContent = 'Your Cart'; head.appendChild(h2);
    var xBtn = document.createElement('button'); xBtn.className = 'psk-dw-x'; xBtn.textContent = '\\u00d7'; xBtn.addEventListener('click', closeDrawer); head.appendChild(xBtn);
    var body = document.createElement('div'); body.className = 'psk-dw-b';
    var foot = document.createElement('div'); foot.className = 'psk-dw-f';
    cartDrawer.appendChild(head); cartDrawer.appendChild(body); cartDrawer.appendChild(foot);
    document.body.appendChild(cartDrawer);

    cartBadge = document.createElement('div');
    cartBadge.className = 'psk-badge';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
    var p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p1.setAttribute('d', 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z');
    var p2 = document.createElementNS('http://www.w3.org/2000/svg', 'line'); p2.setAttribute('x1','3'); p2.setAttribute('y1','6'); p2.setAttribute('x2','21'); p2.setAttribute('y2','6');
    var p3 = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p3.setAttribute('d', 'M16 10a4 4 0 01-8 0');
    svg.appendChild(p1); svg.appendChild(p2); svg.appendChild(p3);
    cartBadge.appendChild(svg);
    var countEl = document.createElement('span'); countEl.className = 'psk-count psk-hide'; countEl.textContent = '0';
    cartBadge.appendChild(countEl);
    cartBadge.addEventListener('click', openDrawer);
    document.body.appendChild(cartBadge);

    document.querySelectorAll('[data-paystack-cart-trigger]').forEach(function(t) {
      t.addEventListener('click', function(e) { e.preventDefault(); openDrawer(); });
    });

    updateCartUI();
  }

  function openDrawer() {
    cartDrawer.classList.add('psk-dw-open');
    cartOverlay.classList.add('psk-ov-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    cartDrawer.classList.remove('psk-dw-open');
    cartOverlay.classList.remove('psk-ov-open');
    document.body.style.overflow = '';
  }

  function updateCartUI() {
    var count = getCount();
    var countEl = cartBadge.querySelector('.psk-count');
    countEl.textContent = String(count);
    countEl.className = 'psk-count' + (count === 0 ? ' psk-hide' : '');

    var body = cartDrawer.querySelector('.psk-dw-b');
    var foot = cartDrawer.querySelector('.psk-dw-f');

    // Clear body safely
    while (body.firstChild) body.removeChild(body.firstChild);
    while (foot.firstChild) foot.removeChild(foot.firstChild);

    if (cart.length === 0) {
      var empty = document.createElement('div'); empty.className = 'psk-dw-e';
      var emSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      emSvg.setAttribute('viewBox', '0 0 24 24'); emSvg.setAttribute('fill', 'none'); emSvg.setAttribute('stroke', 'currentColor'); emSvg.setAttribute('stroke-width', '1.5');
      var ep = document.createElementNS('http://www.w3.org/2000/svg', 'path'); ep.setAttribute('d', 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z');
      emSvg.appendChild(ep);
      empty.appendChild(emSvg);
      var emP = document.createElement('p'); emP.textContent = 'Your cart is empty';
      empty.appendChild(emP);
      body.appendChild(empty);
      return;
    }

    cart.forEach(function(item) {
      var row = document.createElement('div'); row.className = 'psk-it'; row.setAttribute('data-cid', item.cartId);

      if (item.image) {
        var img = document.createElement('img'); img.className = 'psk-it-img'; img.src = item.image; img.alt = ''; row.appendChild(img);
      } else {
        var ph = document.createElement('div'); ph.className = 'psk-it-img'; row.appendChild(ph);
      }

      var info = document.createElement('div'); info.className = 'psk-it-i';
      var nm = document.createElement('div'); nm.className = 'psk-it-n'; nm.textContent = item.name; info.appendChild(nm);
      if (item.variantLabel) { var vl = document.createElement('div'); vl.className = 'psk-it-v'; vl.textContent = item.variantLabel; info.appendChild(vl); }
      var pr = document.createElement('div'); pr.className = 'psk-it-p'; pr.textContent = fmtPrice(item.price * item.qty); info.appendChild(pr);

      var qw = document.createElement('div'); qw.className = 'psk-it-q';
      var mb = document.createElement('button'); mb.className = 'psk-qb psk-qm'; mb.textContent = '\\u2212';
      mb.addEventListener('click', function() { updateQty(item.cartId, item.qty - 1); });
      var qv = document.createElement('input'); qv.className = 'psk-qv'; qv.type = 'number'; qv.value = String(item.qty); qv.min = '1';
      qv.addEventListener('change', function() { updateQty(item.cartId, parseInt(qv.value, 10) || 1); });
      var pb = document.createElement('button'); pb.className = 'psk-qb psk-qp'; pb.textContent = '+';
      pb.addEventListener('click', function() { updateQty(item.cartId, item.qty + 1); });
      qw.appendChild(mb); qw.appendChild(qv); qw.appendChild(pb); info.appendChild(qw);

      var rm = document.createElement('button'); rm.className = 'psk-rm'; rm.textContent = 'Remove';
      rm.addEventListener('click', function() { removeFromCart(item.cartId); });
      info.appendChild(rm);

      row.appendChild(info);
      body.appendChild(row);
    });

    var totDiv = document.createElement('div'); totDiv.className = 'psk-tot';
    var totL = document.createElement('span'); totL.className = 'psk-tot-l'; totL.textContent = count + ' item' + (count !== 1 ? 's' : '');
    var totA = document.createElement('span'); totA.className = 'psk-tot-a'; totA.textContent = fmtPrice(getTotal());
    totDiv.appendChild(totL); totDiv.appendChild(totA); foot.appendChild(totDiv);

    var coBtn = document.createElement('button'); coBtn.className = 'psk-co';
    coBtn.textContent = 'Checkout \\u00b7 ' + fmtPrice(getTotal());
    coBtn.addEventListener('click', handleCheckout); foot.appendChild(coBtn);

    var clBtn = document.createElement('button'); clBtn.className = 'psk-cl'; clBtn.textContent = 'Clear cart';
    clBtn.addEventListener('click', function() { clearCart(); }); foot.appendChild(clBtn);
  }

  function showNotif(msg) {
    var el = document.createElement('div'); el.className = 'psk-nf'; el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function() { el.remove(); }, 2500);
  }

  function getEmail() {
    var email = '';
    if (CONFIG.emailSelector) {
      var el = document.querySelector(CONFIG.emailSelector);
      if (el) email = el.value || '';
    }
    if (!email && CONFIG.emailMode === 'prompt') {
      email = prompt('Please enter your email address:');
    }
    return email || '';
  }

  function handleCheckout() {
    if (cart.length === 0) return;
    var email = getEmail();
    if (!email) { alert('Email address is required.'); return; }

    var totalKobo = Math.round(getTotal() * 100);
    var lines = cart.map(function(i) {
      return i.name + (i.variantLabel ? ' (' + i.variantLabel + ')' : '') + ' x' + i.qty;
    });

    var popup = new PaystackPop();
    popup.newTransaction({
      key: CONFIG.publicKey, email: email, amount: totalKobo, currency: CONFIG.currency, channels: CONFIG.channels,
      metadata: {
        custom_fields: [
          { display_name: 'Order', variable_name: 'order_items', value: lines.join(', ') },
          { display_name: 'Items', variable_name: 'item_count', value: String(getCount()) }
        ],
        cart: cart.map(function(i) { return { id: i.productId, name: i.name, variant: i.variantLabel, qty: i.qty, unit_price: i.price, total: i.price * i.qty }; })
      },
      onSuccess: function(txn) {
        clearCart(); closeDrawer();
        if (CONFIG.successUrl) { window.location.href = CONFIG.successUrl + (CONFIG.successUrl.indexOf('?') > -1 ? '&' : '?') + 'reference=' + txn.reference; }
        else { showNotif('Payment successful! Ref: ' + txn.reference); }
      },
      onCancel: function() { if (CONFIG.cancelUrl) window.location.href = CONFIG.cancelUrl; }
    });
  }

  function handleBuyNow(btn) {
    var p = readProduct(btn);
    var email = getEmail();
    if (!email) { alert('Email address is required.'); return; }
    var popup = new PaystackPop();
    popup.newTransaction({
      key: CONFIG.publicKey, email: email, amount: Math.round(p.price * p.qty * 100), currency: CONFIG.currency, channels: CONFIG.channels,
      metadata: { custom_fields: [{ display_name: 'Product', variable_name: 'product', value: p.name + (p.variantLabel ? ' (' + p.variantLabel + ')' : '') }, { display_name: 'Qty', variable_name: 'quantity', value: String(p.qty) }] },
      onSuccess: function(txn) {
        if (CONFIG.successUrl) { window.location.href = CONFIG.successUrl + (CONFIG.successUrl.indexOf('?') > -1 ? '&' : '?') + 'reference=' + txn.reference; }
        else { showNotif('Payment successful! Ref: ' + txn.reference); btn.disabled = true; btn.style.opacity = '0.6'; }
      },
      onCancel: function() { if (CONFIG.cancelUrl) window.location.href = CONFIG.cancelUrl; }
    });
  }

  function init() {
    injectCartUI();
    document.querySelectorAll('[data-paystack-button="buy"]').forEach(function(b) { b.addEventListener('click', function(e) { e.preventDefault(); handleBuyNow(b); }); });
    document.querySelectorAll('[data-paystack-button="cart"]').forEach(function(b) { b.addEventListener('click', function(e) { e.preventDefault(); var p = readProduct(b); if (p.price <= 0) { alert('Could not determine price.'); return; } addToCart(p); }); });
    document.querySelectorAll('[data-paystack-button="true"]').forEach(function(b) { b.addEventListener('click', function(e) { e.preventDefault(); handleBuyNow(b); }); });
  }

  var s = document.createElement('script');
  s.src = 'https://js.paystack.co/v2/inline.js';
  s.onload = init;
  document.head.appendChild(s);
})();
</script>`;
}
