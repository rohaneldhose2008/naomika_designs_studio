/**
 * Naomika Design Studio - Client Storefront & Cart Engine
 */

const CONFIG = {
  brandName: 'Naomika Design Studio',
  whatsappNumber: '919447000000',
  currency: '₹',
  pageSize: 50
};

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSort = 'default';
let displayedCount = 0;
let activeModalProduct = null;

// Cart System (NO emojis)
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  initProducts();
  setupFilterEvents();
  setupModalEvents();
  highlightActiveNav();
  renderCartUI();
});

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('nds_cart');
    if (saved) cart = JSON.parse(saved);
  } catch (e) {
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('nds_cart', JSON.stringify(cart));
  } catch (e){}
  renderCartUI();
}

function initProducts() {
  if (window.STUDIO_PRODUCTS && Array.isArray(window.STUDIO_PRODUCTS)) {
    allProducts = window.STUDIO_PRODUCTS;
    processAndRender();
  } else {
    fetch('data/products.json')
      .then(res => res.json())
      .then(data => {
        allProducts = data;
        processAndRender();
      })
      .catch(err => {
        console.error('Error loading catalog:', err);
      });
  }
}

function processAndRender() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('ladies-wear')) {
    currentCategory = 'ladies wear';
  } else if (path.includes('mens-wear')) {
    currentCategory = 'mens wear';
  } else if (path.includes('customization')) {
    currentCategory = 'customization';
  } else {
    currentCategory = 'all';
  }

  applyFilters();
}

function applyFilters() {
  filteredProducts = allProducts.filter(item => {
    if (currentCategory !== 'all') {
      if (item.category.toLowerCase() !== currentCategory.toLowerCase()) return false;
    }
    return true;
  });

  if (currentSort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else {
    filteredProducts.sort((a, b) => b.id - a.id);
  }

  // Strictly show latest 50 products on the Home page (no 51st item)
  if (currentCategory === 'all') {
    filteredProducts = filteredProducts.slice(0, 50);
  }

  displayedCount = 0;
  const grid = document.getElementById('products-grid-target');
  if (grid) grid.innerHTML = '';

  renderNextBatch();
}

function renderNextBatch() {
  const grid = document.getElementById('products-grid-target');
  if (!grid) return;

  const nextBatch = filteredProducts.slice(displayedCount, displayedCount + CONFIG.pageSize);
  displayedCount += nextBatch.length;

  if (nextBatch.length === 0 && displayedCount === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--text-dim);">
        <p style="font-family: var(--font-editorial); font-size: 1.6rem; margin-bottom: 8px;">No Creations Found</p>
        <p style="font-size: 0.85rem;">Please check back later for our new collection releases.</p>
      </div>
    `;
    return;
  }

  nextBatch.forEach(product => {
    const card = document.createElement('div');
    card.className = 'editorial-card';
    // Entire card is clickable anywhere to pop up full product details
    card.setAttribute('onclick', `openQuickView('${product.code}')`);

    // Notice: NO description on product cards; only a single "Add to Cart" button (no emojis)
    card.innerHTML = `
      <div class="editorial-card-img-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='images/1.jpeg'"/>
        <span class="editorial-card-badge">${product.badge || 'Fresh Arrivals'}</span>
      </div>
      <div class="editorial-card-info">
        <div class="editorial-meta-sub">
          <span>${product.subcategory || product.category}</span>
          <span style="float: right; font-family: monospace; color: var(--text-muted);">${product.code}</span>
        </div>
        <h3 class="editorial-card-title">${product.name}</h3>
        <div class="editorial-price-row">
          <span class="editorial-price">${product.priceDisplay}</span>
          ${product.originalPriceDisplay ? `<span class="editorial-orig-price">${product.originalPriceDisplay}</span>` : ''}
          <span style="font-size: 0.65rem; color: #10b981; margin-left: auto; text-transform: uppercase; font-weight: 600;">${product.stockStatus || 'In Stock'}</span>
        </div>
        <div class="editorial-actions" style="grid-template-columns: 1fr;">
          <button class="btn-card-add-cart" onclick="event.stopPropagation(); addToCart('${product.code}')">
            Add to Cart
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  const countEl = document.getElementById('products-count-label');
  if (countEl) {
    countEl.innerText = `Displaying ${displayedCount} of ${filteredProducts.length} Creations`;
  }
}

function setupFilterEvents() {
  const sort = document.getElementById('catalog-sort-select');
  if (sort) {
    sort.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }

  const search = document.getElementById('catalog-search-input');
  if (search) {
    search.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      filteredProducts = allProducts.filter(item => {
        if (currentCategory !== 'all') {
          if (item.category.toLowerCase() !== currentCategory.toLowerCase()) return false;
        }
        if (!q) return true;
        return item.name.toLowerCase().includes(q) ||
               item.code.toLowerCase().includes(q) ||
               (item.subcategory || '').toLowerCase().includes(q);
      });
      if (currentCategory === 'all') filteredProducts = filteredProducts.slice(0, 50);
      displayedCount = 0;
      const grid = document.getElementById('products-grid-target');
      if (grid) grid.innerHTML = '';
      renderNextBatch();
    });
  }
}

// Big Product Details Modal with 3-Photo Viewer Support
function openQuickView(code) {
  const p = allProducts.find(item => item.code === code);
  if (!p) return;
  activeModalProduct = p;

  const modal = document.getElementById('quickview-modal');
  if (!modal) return;

  document.getElementById('qv-title').innerText = p.name;
  document.getElementById('qv-code').innerText = p.code;
  document.getElementById('qv-sub').innerText = `${p.category} • ${p.subcategory || 'Signature Couture'}`;
  document.getElementById('qv-price').innerText = p.priceDisplay;
  document.getElementById('qv-orig-price').innerText = p.originalPriceDisplay || '';
  document.getElementById('qv-desc').innerText = p.description || 'Handcrafted designer creation tailored with authentic artisanal expertise in Trivandrum, Kerala.';
  document.getElementById('qv-img').src = p.image;
  document.getElementById('qv-stock').innerText = p.stockStatus || 'In Stock';

  // Support 3 Photos in Details Modal
  const galleryThumbs = document.getElementById('qv-gallery-thumbs');
  if (galleryThumbs) {
    galleryThumbs.innerHTML = '';
    const images = (p.images && p.images.length > 0) ? p.images : [p.image];
    if (p.image2 && !images.includes(p.image2)) images.push(p.image2);
    if (p.image3 && !images.includes(p.image3)) images.push(p.image3);

    if (images.length > 1) {
      images.forEach((imgSrc, idx) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.style.cssText = 'width: 48px; height: 62px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 1px solid var(--border-gold); opacity: 0.8;';
        thumb.onclick = () => {
          document.getElementById('qv-img').src = imgSrc;
          galleryThumbs.querySelectorAll('img').forEach(t => t.style.opacity = '0.6');
          thumb.style.opacity = '1';
        };
        galleryThumbs.appendChild(thumb);
      });
    }
  }

  modal.classList.add('open');
}

function closeQuickView() {
  const modal = document.getElementById('quickview-modal');
  if (modal) modal.classList.remove('open');
}

// Cart Engine (No emojis)
function addToCart(code, customSize = null) {
  const p = allProducts.find(item => item.code === code);
  if (!p) return;

  const size = customSize || (document.getElementById('qv-size-select') ? document.getElementById('qv-size-select').value : 'M (Medium)');
  const existingIndex = cart.findIndex(item => item.code === code && item.size === size);

  if (existingIndex >= 0) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      code: p.code,
      name: p.name,
      category: p.category,
      price: p.price,
      priceDisplay: p.priceDisplay,
      image: p.image,
      size: size,
      qty: 1
    });
  }

  saveCartToStorage();
  openCartDrawer();
}

function updateCartQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCartToStorage();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCartToStorage();
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer-backdrop');
  if (drawer) drawer.classList.add('open');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer-backdrop');
  if (drawer) drawer.classList.remove('open');
}

function renderCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Update badges
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.innerText = totalItems;
  });

  const cartList = document.getElementById('cart-items-list');
  const cartSubtotal = document.getElementById('cart-subtotal-price');

  if (cartSubtotal) {
    cartSubtotal.innerText = `₹${totalPrice.toLocaleString('en-IN')}`;
  }

  if (!cartList) return;

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-dim);">
        <p style="font-family: var(--font-editorial); font-size: 1.4rem; color: var(--text-charcoal); margin-bottom: 6px;">Your Cart is Empty</p>
        <p style="font-size: 0.8rem;">Browse our creations and click Add to Cart to begin.</p>
      </div>
    `;
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) checkoutBtn.disabled = false;

  cartList.innerHTML = '';
  cart.forEach((item, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.06); align-items: center;';
    row.innerHTML = `
      <img src="${item.image}" style="width: 58px; height: 75px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-gold);" onerror="this.src='images/1.jpeg'"/>
      <div style="flex: 1;">
        <h4 style="font-family: var(--font-editorial); font-size: 1.05rem; font-weight: 600; line-height: 1.2; margin-bottom: 3px;">${item.name}</h4>
        <div style="font-size: 0.72rem; color: var(--gold-burnished); font-weight: 500;">Size: ${item.size} • <span style="font-family: monospace; color: #888;">${item.code}</span></div>
        <div style="font-weight: 600; font-size: 0.95rem; margin-top: 4px; color: var(--text-charcoal);">${item.priceDisplay}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <button onclick="removeFromCart(${idx})" style="color: #ef4444; font-size: 0.75rem; text-decoration: underline; background: none; border: none; cursor: pointer;">Remove</button>
        <div style="display: flex; align-items: center; border: 1px solid #e4e4e7; border-radius: 4px; background: #fafafa;">
          <button onclick="updateCartQty(${idx}, -1)" style="padding: 2px 8px; font-weight: bold; background: none; border: none; cursor: pointer;">-</button>
          <span style="padding: 2px 8px; font-size: 0.8rem; font-weight: 600;">${item.qty}</span>
          <button onclick="updateCartQty(${idx}, 1)" style="padding: 2px 8px; font-weight: bold; background: none; border: none; cursor: pointer;">+</button>
        </div>
      </div>
    `;
    cartList.appendChild(row);
  });
}

// Checkout & Order Modal (With Big Product Card Preview)
function openCheckoutModal() {
  closeCartDrawer();
  closeQuickView();

  if (cart.length === 0) {
    alert('Your cart is empty. Please select a creation first.');
    return;
  }

  const modal = document.getElementById('order-modal');
  if (!modal) return;

  const previewWrap = document.getElementById('checkout-big-preview');
  if (previewWrap) {
    previewWrap.innerHTML = '';
    cart.forEach(item => {
      const card = document.createElement('div');
      card.style.cssText = 'display: flex; gap: 18px; padding: 16px; background: var(--bg-cream); border: 1px solid var(--border-gold); border-radius: 12px; margin-bottom: 12px; align-items: center;';
      card.innerHTML = `
        <img src="${item.image}" style="width: 80px; height: 104px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-gold); box-shadow: 0 4px 12px rgba(0,0,0,0.08);" onerror="this.src='images/1.jpeg'"/>
        <div style="flex: 1;">
          <span style="font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold-burnished); font-weight: 600;">${item.category}</span>
          <h4 style="font-family: var(--font-editorial); font-size: 1.3rem; font-weight: 600; color: var(--text-charcoal); margin: 2px 0 6px;">${item.name}</h4>
          <div style="font-size: 0.78rem; color: var(--text-dim);">Product Code: <strong style="font-family: monospace;">${item.code}</strong></div>
          <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Selected Size: <strong>${item.size}</strong> • Qty: <strong>${item.qty}</strong></div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Total</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--gold-antique); font-family: var(--font-editorial);">
            ₹${(item.price * item.qty).toLocaleString('en-IN')}
          </div>
        </div>
      `;
      previewWrap.appendChild(card);
    });
  }

  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalEl = document.getElementById('checkout-grand-total');
  if (totalEl) totalEl.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

  modal.classList.add('open');
}

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) modal.classList.remove('open');
}

function submitOrderForm(event) {
  event.preventDefault();
  if (cart.length === 0) return;

  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const city = document.getElementById('cust-city').value.trim();
  const notes = document.getElementById('cust-notes').value.trim();

  if (!name || !phone || !address) {
    alert('Please enter your Name, WhatsApp Phone, and Delivery Address.');
    return;
  }

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderId = `NDS-${randomSuffix}`;
  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const orderData = {
    orderId,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    customerCity: city,
    notes,
    items: cart,
    total: grandTotal,
    totalDisplay: `₹${grandTotal.toLocaleString('en-IN')}`
  };

  const encodedJson = encodeURIComponent(JSON.stringify(orderData));
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  const receiptUrl = `${baseUrl}receipt.html?data=${encodedJson}`;

  let itemsSummary = cart.map(i => `• ${i.name} (${i.code}) - Size: ${i.size} - Qty: ${i.qty} - ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n');

  const waMessage = `Hello Naomika Design Studio!\n` +
    `I would like to place an order from your boutique collection.\n\n` +
    `*Order ID:* #${orderId}\n` +
    `*Customer Name:* ${name}\n` +
    `*Phone:* ${phone}\n` +
    `*Delivery Address:* ${address}, ${city}\n\n` +
    `*Items Ordered:*\n${itemsSummary}\n\n` +
    `*Grand Total:* ₹${grandTotal.toLocaleString('en-IN')}\n\n` +
    `*Official Digital Receipt:* \n${receiptUrl}`;

  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  // Clear cart after checkout
  cart = [];
  saveCartToStorage();

  closeOrderModal();
  window.open(receiptUrl, '_blank');
  window.location.href = waUrl;
}

function setupModalEvents() {
  document.querySelectorAll('.modal-backdrop-editorial, .cart-drawer-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });
}

function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-editorial-links a, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPath)) {
      link.classList.add('active');
    }
  });
}
