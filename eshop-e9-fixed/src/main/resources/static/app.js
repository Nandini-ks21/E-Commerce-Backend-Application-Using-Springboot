/* ============================================================
   ESHOP — Shared App Logic (auth, products, cart, UPI checkout)
   ============================================================ */

const API = '';  // same origin — Spring Boot serves this at port 8080

/* ── AUTH ── */
function getToken() { return localStorage.getItem('eshop_token'); }
function getRole()  { return localStorage.getItem('eshop_role'); }
function getEmail() { return localStorage.getItem('eshop_email'); }

function setAuth(token, role, email) {
  localStorage.setItem('eshop_token', token);
  localStorage.setItem('eshop_role', role);
  localStorage.setItem('eshop_email', email);
}

function clearAuth() {
  localStorage.removeItem('eshop_token');
  localStorage.removeItem('eshop_role');
  localStorage.removeItem('eshop_email');
}

function isLoggedIn() { return !!getToken(); }
function isAdmin()    { return getRole() === 'ADMIN'; }

function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

/* ── LOADING ── */
function showLoading() {
  document.getElementById('loadingOverlay')?.classList.add('active');
}
function hideLoading() {
  document.getElementById('loadingOverlay')?.classList.remove('active');
}

/* ── TOAST ── */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.classList.remove('show'); }, 3000);
}

/* ── API HELPER ── */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (getToken()) headers['Authorization'] = 'Bearer ' + getToken();
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/* ── LOGIN MODAL ── */
function openLoginModal() {
  document.getElementById('loginModal')?.classList.add('active');
  setTimeout(() => document.getElementById('loginEmail')?.focus(), 100);
}

function closeLoginModal(e) {
  if (e && e.target !== document.getElementById('loginModal')) return;
  document.getElementById('loginModal')?.classList.remove('active');
}

async function login() {
  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errEl    = document.getElementById('loginError');

  if (!email || !password) {
    showError(errEl, 'Please enter email and password');
    return;
  }

  showLoading();
  const { ok, data } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  hideLoading();

  if (ok && data.token) {
    setAuth(data.token, data.role, email);
    document.getElementById('loginModal')?.classList.remove('active');
    updateNavAuth();
    if (data.role === 'ADMIN') {
      window.location.href = 'admin.html';
    }
  } else {
    showError(errEl, data.error || 'Login failed. Check credentials.');
  }
}

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 4000);
}

/* ── NAV AUTH STATE ── */
function updateNavAuth() {
  const authBtn   = document.getElementById('authButtons');
  const userInfo  = document.getElementById('userInfo');
  const userBadge = document.getElementById('userBadge');
  const adminLink = document.getElementById('adminNavLink');

  if (isLoggedIn()) {
    authBtn  && (authBtn.style.display  = 'none');
    userInfo && (userInfo.style.display = 'flex');
    if (userBadge) userBadge.textContent = getEmail();
    if (adminLink && isAdmin()) adminLink.style.display = 'block';
  } else {
    authBtn  && (authBtn.style.display  = 'block');
    userInfo && (userInfo.style.display = 'none');
  }
  updateCartBadge();
}

/* ── FORMAT HELPERS ── */
function formatPrice(p) {
  return '\u20B9' + Number(p).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}

function imgFallback(el) {
  el.src = 'https://placehold.co/400x400/141414/c9a84c?text=No+Image';
}

/* ============================================================
   CART — localStorage-based, linked to product DB via id
   ============================================================ */
function getCart() {
  try { return JSON.parse(localStorage.getItem('eshop_cart') || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('eshop_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

function addToCart(product, e) {
  if (e) e.stopPropagation();

  if (!isLoggedIn()) {
    showToast('Please login to add items to cart', 'error');
    openLoginModal();
    return;
  }

  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    if (existing.qty >= product.stock) {
      showToast('Maximum stock reached', 'error');
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({
      id:          product.id,
      name:        product.name,
      price:       product.price,
      category:    product.category,
      description: product.description,
      imageLink:   product.imageLink,
      stock:       product.stock,
      qty:         1
    });
  }

  saveCart(cart);
  showToast('"' + product.name + '" added to cart \u2713');

  if (e) {
    const btn = e.currentTarget;
    btn.classList.add('added');
    btn.textContent = '\u2713 Added';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.textContent = 'Add to Cart';
    }, 1500);
  }
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCartItems();
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, Math.min(item.stock, item.qty + delta));
  saveCart(cart);
  renderCartItems();
}

function openCartModal() {
  renderCartItems();
  document.getElementById('cartModal')?.classList.add('active');
}

function closeCartModal(e) {
  if (e && e.target !== document.getElementById('cartModal')) return;
  document.getElementById('cartModal')?.classList.remove('active');
}

function renderCartItems() {
  const cart    = getCart();
  const list    = document.getElementById('cartItemsList');
  const summary = document.getElementById('cartSummary');
  if (!list) return;

  if (!cart.length) {
    list.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">\u25CE</div><p>Your cart is empty</p><span>Explore our collection and add items</span></div>';
    if (summary) summary.style.display = 'none';
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total    = subtotal + shipping;

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.imageLink}" alt="${item.name}" onerror="imgFallback(this)"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-cat">${item.category}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">&#8722;</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        <button class="qty-remove" onclick="removeFromCart(${item.id})" title="Remove">&#10005;</button>
      </div>
    </div>
  `).join('');

  if (summary) {
    summary.style.display = 'block';
    summary.innerHTML = `
      <div class="cart-summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="cart-summary-row"><span>Shipping</span><span>${shipping === 0 ? '<span class="free-ship">FREE</span>' : formatPrice(shipping)}</span></div>
      ${shipping > 0 ? '<div class="cart-free-note">Add ' + formatPrice(999 - subtotal) + ' more for free shipping</div>' : ''}
      <div class="cart-summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
      <button class="btn-primary full-width" style="margin-top:20px" onclick="openUpiModal(null, true)">Proceed to Checkout</button>
    `;
  }
}

/* ============================================================
   UPI / BUY NOW MODAL
   ============================================================ */
let _upiProduct   = null;
let _upiFromCart  = false;

function openUpiModal(product, fromCart) {
  fromCart = fromCart || false;
  if (!isLoggedIn()) {
    showToast('Please login to proceed', 'error');
    openLoginModal();
    return;
  }

  _upiProduct  = product;
  _upiFromCart = fromCart;

  document.getElementById('cartModal')?.classList.remove('active');

  const upiModal   = document.getElementById('upiModal');
  const upiSummary = document.getElementById('upiOrderSummary');
  const upiTotal   = document.getElementById('upiTotalAmount');
  if (!upiModal) return;

  var items, subtotal, shipping, total;
  if (fromCart) {
    const cart = getCart();
    items    = cart;
    subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    shipping = subtotal > 999 ? 0 : 99;
    total    = subtotal + shipping;
  } else {
    items    = [Object.assign({}, product, { qty: 1 })];
    subtotal = product.price;
    shipping = 0;
    total    = product.price;
  }

  upiSummary.innerHTML = items.map(function(i) { return `
    <div class="upi-item">
      <img class="upi-item-img" src="${i.imageLink}" alt="${i.name}" onerror="imgFallback(this)"/>
      <div class="upi-item-detail">
        <div class="upi-item-name">${i.name}</div>
        <div class="upi-item-meta">Qty: ${i.qty} &nbsp;&times;&nbsp; ${formatPrice(i.price)}</div>
      </div>
      <div class="upi-item-total">${formatPrice(i.price * i.qty)}</div>
    </div>
  `; }).join('');

  upiTotal.textContent = formatPrice(total);

  document.getElementById('upiIdInput').value = '';
  document.getElementById('upiIdSection').style.display = 'none';
  document.getElementById('upiPayBtn').disabled = true;
  const statusMsg = document.getElementById('upiStatusMsg');
  statusMsg.textContent = '';
  statusMsg.className = 'upi-status-msg';
  document.querySelectorAll('.upi-app-btn').forEach(function(b) { b.classList.remove('selected'); });
  document.getElementById('upiPayBtn').textContent = 'Pay Now';
  document.getElementById('upiPaymentForm').style.display  = 'block';
  document.getElementById('upiSuccessScreen').style.display = 'none';

  upiModal.classList.add('active');
}

function closeUpiModal(e) {
  if (e && e.target !== document.getElementById('upiModal')) return;
  document.getElementById('upiModal')?.classList.remove('active');
}

function selectUpiApp(appName, btn) {
  document.querySelectorAll('.upi-app-btn').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');

  const section = document.getElementById('upiIdSection');
  const label   = document.getElementById('upiIdLabel');
  const input   = document.getElementById('upiIdInput');
  const placeholders = {
    'GPay':       'yourname@okicici',
    'PhonePe':    'yourname@ybl',
    'Paytm':      'yourname@paytm',
    'BHIM':       'yourname@upi',
    'Amazon Pay': 'yourname@apl',
    'Other UPI':  'yourname@bank'
  };

  label.textContent  = 'Enter your ' + appName + ' UPI ID';
  input.placeholder  = placeholders[appName] || 'yourname@upi';
  input.value        = '';
  section.style.display = 'block';
  document.getElementById('upiPayBtn').disabled = true;
  document.getElementById('upiStatusMsg').textContent = '';
  input.focus();
}

function validateUpiId(val) {
  return /^[\w.\-]{3,}@[\w]{3,}$/.test(val.trim());
}

function onUpiIdInput(val) {
  const btn   = document.getElementById('upiPayBtn');
  const msg   = document.getElementById('upiStatusMsg');
  const valid = validateUpiId(val);
  btn.disabled = !valid;
  if (val.length > 3) {
    msg.textContent = valid ? '\u2713 Valid UPI ID' : '\u2717 Enter a valid UPI ID (e.g. name@upi)';
    msg.className   = 'upi-status-msg ' + (valid ? 'valid' : 'invalid');
  } else {
    msg.textContent = '';
  }
}

async function confirmUpiPayment() {
  const btn         = document.getElementById('upiPayBtn');
  const statusMsg   = document.getElementById('upiStatusMsg');
  const upiId       = document.getElementById('upiIdInput').value.trim();
  const selectedBtn = document.querySelector('.upi-app-btn.selected');

  if (!selectedBtn || !validateUpiId(upiId)) return;

  btn.disabled    = true;
  btn.textContent = 'Processing\u2026';
  statusMsg.textContent = 'Verifying UPI ID and initiating payment\u2026';
  statusMsg.className   = 'upi-status-msg pending';

  await new Promise(function(r) { setTimeout(r, 2000); });

  statusMsg.textContent = 'Payment confirmed! Updating inventory\u2026';
  statusMsg.className   = 'upi-status-msg valid';

  const items = _upiFromCart ? getCart() : [Object.assign({}, _upiProduct, { qty: 1 })];

  for (const item of items) {
    const newStock = Math.max(0, item.stock - item.qty);
    await apiFetch('/admins/products/' + item.id, {
      method: 'PUT',
      body: JSON.stringify({
        name:        item.name,
        price:       item.price,
        category:    item.category,
        description: item.description,
        imageLink:   item.imageLink,
        stock:       newStock
      })
    });
  }

  await new Promise(function(r) { setTimeout(r, 600); });

  document.getElementById('upiPaymentForm').style.display  = 'none';
  document.getElementById('upiSuccessScreen').style.display = 'flex';

  const appName = (selectedBtn.querySelector('.upi-app-name') || {}).textContent || 'UPI';
  document.getElementById('upiSuccessApp').textContent = appName;
  document.getElementById('upiSuccessId').textContent  = upiId;
  document.getElementById('upiSuccessTxn').textContent = 'TXN' + Math.random().toString(36).substr(2, 10).toUpperCase();

  if (_upiFromCart) saveCart([]);

  setTimeout(function() { loadProducts(); }, 1000);
}

function closeUpiSuccess() {
  document.getElementById('upiModal')?.classList.remove('active');
  document.getElementById('upiPaymentForm').style.display  = 'block';
  document.getElementById('upiSuccessScreen').style.display = 'none';
  document.getElementById('upiPayBtn').textContent = 'Pay Now';
}

/* ── SHOP PAGE LOGIC ── */
let currentPage = 1;
const PAGE_SIZE = 12;

async function loadProducts() {
  const name     = document.getElementById('searchInput')?.value || '';
  const category = document.getElementById('categoryInput')?.value || '';
  const lower    = document.getElementById('lowerPrice')?.value || 0;
  const higher   = document.getElementById('higherPrice')?.value || 100000;
  const sortRaw  = document.getElementById('sortSelect')?.value || 'id';
  const isDesc   = sortRaw === 'price-desc';
  const sort     = sortRaw === 'price-desc' ? 'price' : sortRaw;

  showLoading();
  const { ok, data } = await apiFetch(
    '/users/products?page=' + currentPage + '&size=' + PAGE_SIZE + '&sort=' + sort + '&desc=' + isDesc + '&name=' + encodeURIComponent(name) + '&category=' + encodeURIComponent(category) + '&lower=' + lower + '&higher=' + higher
  );
  hideLoading();

  const grid    = document.getElementById('productsGrid');
  const emptyEl = document.getElementById('emptyState');
  const countEl = document.getElementById('productCount');

  if (!grid) return;

  if (!ok || !data.products?.length) {
    grid.innerHTML  = '';
    emptyEl && (emptyEl.style.display = 'flex');
    countEl && (countEl.textContent = '0 items');
    renderPagination(0);
    return;
  }

  emptyEl && (emptyEl.style.display = 'none');
  countEl && (countEl.textContent = data.products.length + ' items');

  grid.innerHTML = data.products.map(function(p, i) {
    const pJson = JSON.stringify(p).replace(/"/g, '&quot;');
    return `
    <div class="product-card" style="animation-delay:${i * 0.04}s" onclick="openProductDetail(${pJson})">
      <div class="card-img-wrap">
        <img class="card-img" src="${p.imageLink}" alt="${p.name}" onerror="imgFallback(this)"/>
        <span class="card-category">${p.category}</span>
        ${p.stock <= 3 ? '<span class="card-stock-low">Only ' + p.stock + ' left</span>' : ''}
      </div>
      <div class="card-body">
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.description}</div>
        <div class="card-footer">
          <span class="card-price">${formatPrice(p.price)}</span>
          <span class="card-stock">Stock: ${p.stock}</span>
        </div>
        <div class="card-actions" onclick="event.stopPropagation()">
          <button class="btn-add-cart" onclick="addToCart(${pJson}, event)">Add to Cart</button>
          <button class="btn-buy-now"  onclick="openUpiModal(${pJson}, false)">Buy Now</button>
        </div>
      </div>
    </div>`;
  }).join('');

  renderPagination(data.products.length);
}

function renderPagination(count) {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  const hasNext = count === PAGE_SIZE;
  const hasPrev = currentPage > 1;
  pag.innerHTML = `
    <button class="page-btn" onclick="changePage(-1)" ${!hasPrev ? 'disabled' : ''}>\u2190</button>
    <button class="page-btn active">${currentPage}</button>
    <button class="page-btn" onclick="changePage(1)" ${!hasNext ? 'disabled' : ''}>\u2192</button>
  `;
}

function changePage(delta) {
  currentPage = Math.max(1, currentPage + delta);
  loadProducts();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

let filterTimer;
function handleFilter() {
  currentPage = 1;
  clearTimeout(filterTimer);
  filterTimer = setTimeout(loadProducts, 350);
}

function updatePriceLabel() {
  const lo = Number(document.getElementById('lowerPrice')?.value || 0);
  const hi = Number(document.getElementById('higherPrice')?.value || 100000);
  const lv = document.getElementById('lowerVal');
  const hv = document.getElementById('higherVal');
  if (lv) lv.textContent = lo.toLocaleString('en-IN');
  if (hv) hv.textContent = hi.toLocaleString('en-IN');
}

function scrollToProducts() {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

/* ── PRODUCT DETAIL MODAL ── */
function openProductDetail(p) {
  const el = document.getElementById('productDetail');
  if (!el) return;
  const pJson = JSON.stringify(p).replace(/"/g, '&quot;');
  el.innerHTML = `
    <img class="product-detail-img" src="${p.imageLink}" alt="${p.name}" onerror="imgFallback(this)"/>
    <div class="product-detail-info">
      <div class="detail-category">${p.category}</div>
      <div class="detail-name">${p.name}</div>
      <div class="detail-price">${formatPrice(p.price)}</div>
      <div class="detail-divider"></div>
      <div class="detail-desc">${p.description}</div>
      <div class="detail-stock">Stock available: <strong>${p.stock} units</strong></div>
      <div class="detail-actions">
        <button class="btn-add-cart detail-btn" onclick="addToCart(${pJson}, event)">Add to Cart</button>
        <button class="btn-buy-now  detail-btn" onclick="closeProductModal(); openUpiModal(${pJson}, false)">Buy Now</button>
      </div>
    </div>
  `;
  document.getElementById('productModal')?.classList.add('active');
}

function closeProductModal(e) {
  if (e && e.target !== document.getElementById('productModal')) return;
  document.getElementById('productModal')?.classList.remove('active');
}

/* ── KEYBOARD ESC ── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.getElementById('loginModal')?.classList.remove('active');
    document.getElementById('productModal')?.classList.remove('active');
    document.getElementById('deleteModal')?.classList.remove('active');
    document.getElementById('cartModal')?.classList.remove('active');
    document.getElementById('upiModal')?.classList.remove('active');
  }
});

/* ── NAVBAR SCROLL EFFECT ── */
window.addEventListener('scroll', function() {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.borderBottomColor = window.scrollY > 10 ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.08)';
});

/* ── ENTER KEY on login ── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.getElementById('loginModal')?.classList.contains('active')) {
    login();
  }
});

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() {
  updateNavAuth();

  if (document.getElementById('productsGrid')) {
    loadProducts();
  }

  if (document.getElementById('productsTableBody')) {
    if (!isLoggedIn() || !isAdmin()) {
      window.location.href = 'index.html';
    }
    const badge = document.getElementById('adminUserBadge');
    if (badge) badge.textContent = getEmail();
  }
});
