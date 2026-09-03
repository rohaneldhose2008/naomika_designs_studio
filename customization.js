/**
 * Naomika Design Studio - Made-to-Order & Bespoke Atelier Client Engine
 */

const CUSTOM_CONFIG = {
  brandName: 'Naomika Design Studio',
  whatsappNumber: '919447000000'
};

let activeCustomProduct = null;
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  initCustomPortfolio();
  setupCustomModalEvents();
  setupSearchEvent();
});

function initCustomPortfolio() {
  if (window.STUDIO_PRODUCTS && Array.isArray(window.STUDIO_PRODUCTS)) {
    allProducts = window.STUDIO_PRODUCTS;
    renderMadeToOrderGrid();
  } else {
    fetch('data/products.json')
      .then(res => res.json())
      .then(data => {
        allProducts = data;
        renderMadeToOrderGrid();
      })
      .catch(err => {
        console.error('Error loading bespoke catalog:', err);
      });
  }
}

function setupSearchEvent() {
  const searchInput = document.getElementById('custom-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      renderMadeToOrderGrid(q);
    });
  }
}

function renderMadeToOrderGrid(query = '') {
  const grid = document.getElementById('made-to-order-grid');
  if (!grid) return;

  const madeToOrderList = allProducts.filter(p => {
    const isCustom = p.category.toLowerCase() === 'customization' ||
                     p.stockStatus === 'Made to Order' ||
                     (p.badge && (p.badge.includes('Couture') || p.badge.includes('Bespoke')));
    if (!isCustom) return false;
    if (!query) return true;
    return p.name.toLowerCase().includes(query) ||
           p.code.toLowerCase().includes(query) ||
           (p.subcategory || '').toLowerCase().includes(query) ||
           (p.description || '').toLowerCase().includes(query);
  });

  grid.innerHTML = '';

  if (madeToOrderList.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0;">No matching bespoke creations found.</p>`;
    return;
  }

  madeToOrderList.forEach(p => {
    const card = document.createElement('div');
    card.className = 'editorial-card';
    card.style.background = '#121216';
    card.style.borderColor = 'rgba(184, 151, 88, 0.3)';
    card.style.cursor = 'pointer';
    card.setAttribute('onclick', `openCustomModal('${p.code}')`);

    card.innerHTML = `
      <div class="editorial-card-img-wrap" style="background: #09090b;">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='images/1.jpeg'"/>
        <span class="editorial-card-badge" style="background: var(--gold-antique); color: #fff;">${p.badge || 'Made To Order'}</span>
      </div>
      <div class="editorial-card-info">
        <div class="editorial-meta-sub" style="color: var(--gold-soft);">
          <span>${p.subcategory || 'Bespoke Atelier'}</span>
          <span style="float: right; font-family: monospace; color: #71717a;">${p.code}</span>
        </div>
        <h3 class="editorial-card-title" style="color: #ffffff; font-size: 1.25rem;">${p.name}</h3>
        <div class="editorial-price-row" style="margin-bottom: 14px;">
          <span class="editorial-price" style="color: var(--gold-soft); font-family: var(--font-editorial); font-size: 1.25rem;">${p.priceDisplay}</span>
          <span style="font-size: 0.68rem; color: #10b981; margin-left: auto; text-transform: uppercase; font-weight: 600;">Made to Order</span>
        </div>
        <button onclick="event.stopPropagation(); openCustomModal('${p.code}')" class="btn-classy" style="width: 100%; background: var(--gold-antique); color: #fff; padding: 11px 0; font-size: 0.72rem;">
          Request Bespoke Fitting &rarr;
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function revealBespokeForm() {
  const trigger = document.getElementById('bespoke-action-trigger');
  const formSection = document.getElementById('custom-form-section');
  if (trigger) trigger.style.display = 'none';
  if (formSection) {
    formSection.style.display = 'block';
    formSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function openCustomModal(code) {
  const p = allProducts.find(item => item.code === code) || {
    code: 'NDS-CU-BESPOKE',
    name: 'Bespoke Haute Couture Creation',
    priceDisplay: 'On Consultation',
    image: 'images/5.png',
    description: 'Custom bespoke bridal dress tailored individually to your measurements in Trivandrum.'
  };

  activeCustomProduct = p;
  const modal = document.getElementById('custom-booking-modal');
  if (!modal) return;

  // Reset two-step form visibility
  const trigger = document.getElementById('bespoke-action-trigger');
  const formSection = document.getElementById('custom-form-section');
  if (trigger) trigger.style.display = 'block';
  if (formSection) formSection.style.display = 'none';

  document.getElementById('custom-modal-title').innerText = p.name;
  document.getElementById('custom-modal-code').innerText = p.code;
  document.getElementById('custom-modal-price').innerText = p.priceDisplay;
  document.getElementById('custom-modal-img').src = p.image;

  const descEl = document.getElementById('custom-modal-desc');
  if (descEl) {
    descEl.innerText = p.description || 'Artisanal Kerala bridal couture crafted with authentic heirloom kasavu, zardozi embroidery, and precision fitting tailored at Naomika Design Studio in Trivandrum.';
  }

  // Thumbnails
  const thumbsContainer = document.getElementById('custom-gallery-thumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = '';
    const images = (p.images && p.images.length > 0) ? p.images : [p.image];
    if (p.image2 && !images.includes(p.image2)) images.push(p.image2);
    if (p.image3 && !images.includes(p.image3)) images.push(p.image3);

    if (images.length > 1) {
      images.forEach(imgSrc => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.style.cssText = 'width: 52px; height: 68px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 1px solid var(--gold-antique); opacity: 0.8;';
        thumb.onclick = () => {
          document.getElementById('custom-modal-img').src = imgSrc;
          thumbsContainer.querySelectorAll('img').forEach(t => t.style.opacity = '0.6');
          thumb.style.opacity = '1';
        };
        thumbsContainer.appendChild(thumb);
      });
    }
  }

  const dateInput = document.getElementById('custom-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  modal.classList.add('open');
}

function closeCustomModal() {
  const modal = document.getElementById('custom-booking-modal');
  if (modal) modal.classList.remove('open');
}

function submitCustomForm(event) {
  event.preventDefault();
  if (!activeCustomProduct) return;

  const name = document.getElementById('custom-name').value.trim();
  const phone = document.getElementById('custom-phone').value.trim();
  const date = document.getElementById('custom-date').value;
  const slot = document.getElementById('custom-slot').value;
  const measurements = document.getElementById('custom-notes').value.trim();

  if (!name || !phone || !date) {
    alert('Please enter your Name, WhatsApp Phone, and preferred Date.');
    return;
  }

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const ticketId = `NDS-BESPOKE-${randomSuffix}`;

  const voucherData = {
    orderId: ticketId,
    date: new Date().toLocaleDateString('en-IN'),
    customerName: name,
    customerPhone: phone,
    appointmentDate: date,
    appointmentSlot: slot,
    notes: measurements || 'Bespoke fitting & consultation requested',
    type: 'Bespoke Customization Appointment',
    items: [
      {
        code: activeCustomProduct.code,
        name: activeCustomProduct.name,
        category: 'Bespoke Custom Tailoring',
        priceDisplay: activeCustomProduct.priceDisplay,
        qty: 1,
        image: activeCustomProduct.image
      }
    ],
    totalDisplay: 'On Consultation'
  };

  const encodedJson = encodeURIComponent(JSON.stringify(voucherData));
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  const receiptUrl = `${baseUrl}receipt.html?data=${encodedJson}`;

  const waMsg = `Hello Naomika Design Studio! ✨\n` +
    `I would like to request a bespoke couture consultation.\n\n` +
    `🏷️ *Ticket ID:* #${ticketId}\n` +
    `👤 *Client Name:* ${name}\n` +
    `📞 *Phone:* ${phone}\n` +
    `👗 *Bespoke Outfit:* ${activeCustomProduct.name} (${activeCustomProduct.code})\n` +
    `📅 *Preferred Available Date:* ${date} (${slot})\n` +
    `📐 *Notes / Measurements:* ${measurements || 'Bespoke Fit'}\n\n` +
    `⚠️ *Studio Availability Notice:* "We will have a look whether our team is available at the same time and let you know."\n\n` +
    `📄 *View Consultation Voucher:* \n${receiptUrl}`;

  const waUrl = `https://wa.me/${CUSTOM_CONFIG.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

  closeCustomModal();
  window.open(receiptUrl, '_blank');
  window.location.href = waUrl;
}

function setupCustomModalEvents() {
  document.querySelectorAll('.modal-backdrop-editorial').forEach(b => {
    b.addEventListener('click', (e) => {
      if (e.target === b) b.classList.remove('open');
    });
  });
}
