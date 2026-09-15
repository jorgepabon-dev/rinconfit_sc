/**
 * Rincón Fit - Client-side Cart & WhatsApp Checkout Logic (Vercel Ready)
 */

let cart = [];
const WEB_DISCOUNT_PERCENT = 0.10;

document.addEventListener('DOMContentLoaded', () => {
  initCartListeners();
  initFormListener();
  initHeaderScrollListener();
  initUbicacionToggle();
});

function initUbicacionToggle() {
  const ubicacionSelect = document.getElementById('rf_ubicacion');
  const envioExterno = document.getElementById('rf-envio-externo');
  const direccionGroup = document.getElementById('rf-direccion-group');
  const ciudadInput = document.getElementById('rf_ciudad');
  const direccionInput = document.getElementById('rf_direccion');
  const ciudadLabel = document.getElementById('rf_ciudad_label');
  const direccionLabel = document.getElementById('rf_direccion_label');

  if (!ubicacionSelect) return;

  function toggleFields() {
    const ubicacion = ubicacionSelect.value;
    const isCardenas = ubicacion === 'Municipio Cárdenas';
    const isOtroMunicipio = ubicacion === 'Otro municipio';
    const isOtroEstado = ubicacion === 'Otro estado';

    if (isCardenas) {
      envioExterno.style.display = 'none';
      direccionGroup.style.display = 'none';

      if (ciudadInput) { ciudadInput.required = false; ciudadInput.value = ''; }
      if (direccionInput) { direccionInput.required = false; direccionInput.value = ''; }
      if (ciudadLabel) ciudadLabel.textContent = 'Municipio y Estado *';
      if (direccionLabel) direccionLabel.textContent = 'Dirección exacta / Agencia *';
      return;
    }

    envioExterno.style.display = 'block';
    direccionGroup.style.display = 'block';

    if (ciudadInput) ciudadInput.required = true;
    if (direccionInput) direccionInput.required = true;

    if (isOtroMunicipio) {
      if (ciudadLabel) ciudadLabel.textContent = 'Municipio y Estado *';
      if (direccionLabel) direccionLabel.textContent = 'Dirección exacta para cotizar envío *';
      if (ciudadInput) ciudadInput.placeholder = 'Ej: San José de Bolívar, Táchira';
      if (direccionInput) direccionInput.placeholder = 'Especifica el municipio y la dirección exacta para cotizar el envío';
    } else if (isOtroEstado) {
      if (ciudadLabel) ciudadLabel.textContent = 'Estado y Ciudad *';
      if (direccionLabel) direccionLabel.textContent = 'Agencia / lugar de retiro *';
      if (ciudadInput) ciudadInput.placeholder = 'Ej: Mérida, Mérida';
      if (direccionInput) direccionInput.placeholder = 'Ej: Agencia Zoom / MRW — punto de encuentro o ciudad';
    }
  }

  ubicacionSelect.addEventListener('change', toggleFields);
  toggleFields();
}

function initHeaderScrollListener() {
  const header = document.querySelector('.rf-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('rf-header-scrolled');
    } else {
      header.classList.remove('rf-header-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Inicializar estado según posición actual
}

function initCartListeners() {
  const cartBtn = document.getElementById('rf-cart-btn');
  const closeCartBtn = document.getElementById('rf-close-cart');
  const modalOverlay = document.getElementById('rf-cart-modal');

  if (cartBtn && modalOverlay) {
    cartBtn.addEventListener('click', () => {
      modalOverlay.classList.add('active');
    });
  }

  if (closeCartBtn && modalOverlay) {
    closeCartBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }
}

function addToCart(name, price, imgUrl) {
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: name,
      price: price,
      imgUrl: imgUrl,
      quantity: 1
    });
  }

  updateCartUI();
  
  // Abrir modal automáticamente al añadir
  const modalOverlay = document.getElementById('rf-cart-modal');
  if (modalOverlay) {
    modalOverlay.classList.add('active');
  }
}

function updateQuantity(index, delta) {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }
  updateCartUI();
}

function getCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * WEB_DISCOUNT_PERCENT;
  const total = subtotal - discount;

  return { subtotal, discount, total };
}

function updateCartUI() {
  const cartCountElem = document.getElementById('rf-cart-count');
  const itemsContainer = document.getElementById('rf-cart-items-container');
  const totalPriceElem = document.getElementById('rf-cart-total-price');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountElem) {
    cartCountElem.textContent = totalItems;
  }

  const { total } = getCartTotals();
  if (totalPriceElem) {
    totalPriceElem.textContent = `$${total.toFixed(2)}`;
  }

  // Renderizar items
  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align:center; padding: 30px 10px; color: #777;">
        <span class="material-symbols-outlined" style="font-size:48px; color:#ccc;">shopping_cart</span>
        <p style="margin-top:10px; font-weight:600;">Tu carrito está vacío</p>
        <p style="font-size:12px;">Agrega tus productos favoritos desde el catálogo.</p>
      </div>
    `;
    return;
  }

  let html = '';
  cart.forEach((item, index) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    html += `
      <div class="rf-cart-item-row">
        <img src="${item.imgUrl}" alt="${item.name}" class="rf-cart-item-img">
        <div class="rf-cart-item-details">
          <div class="rf-cart-item-name">${item.name}</div>
          <div class="rf-cart-item-price">$${itemTotal}</div>
        </div>
        <div class="rf-cart-qty-controls">
          <button type="button" class="rf-qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
          <span style="font-weight:bold; font-size:13px;">${item.quantity}</span>
          <button type="button" class="rf-qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
      </div>
    `;
  });

  itemsContainer.innerHTML = html;
}

function initFormListener() {
  const form = document.getElementById('rf-whatsapp-checkout-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Tu carrito está vacío. Agrega al menos un producto.');
      return;
    }

    const nombre = document.getElementById('rf_nombre').value.trim();
    const cedula = document.getElementById('rf_cedula').value.trim();
    const telefono = document.getElementById('rf_telefono').value.trim();
    const ubicacion = document.getElementById('rf_ubicacion').value;
    const metodoPago = document.getElementById('rf_metodo_pago').value;
    const ciudadInput = document.getElementById('rf_ciudad');
    const direccionInput = document.getElementById('rf_direccion');

    const isCardenas = ubicacion === 'Municipio Cárdenas';
    const isOtroMunicipio = ubicacion === 'Otro municipio';
    const isOtroEstado = ubicacion === 'Otro estado';

    const ciudad = isCardenas
      ? 'Municipio Cárdenas, San Cristóbal, Táchira'
      : (ciudadInput ? ciudadInput.value.trim() : '');

    const direccion = isCardenas
      ? 'Delivery Gratis — Municipio Cárdenas'
      : (direccionInput ? direccionInput.value.trim() : '');

    if (!isCardenas && (!ciudad || !direccion)) {
      alert('Por favor completa la ciudad y la dirección o agencia para continuar.');
      return;
    }

    const numWhatsapp = '584145122975';
    const { subtotal, discount, total } = getCartTotals();

    let msg = `🛒 *NUEVO PEDIDO DE COMPRA - RINCÓN FIT*\n`;
    msg += `-----------------------------------\n`;
    msg += `👤 *Cliente:* ${nombre}\n`;
    msg += `🆔 *Cédula/RIF:* ${cedula}\n`;
    msg += `📱 *Teléfono:* ${telefono}\n`;
    msg += `📍 *Ubicación:* ${ciudad}\n`;
    msg += `🏠 *Envío:* ${direccion}\n`;

    if (isCardenas) {
      msg += `🚚 *Tipo de envío:* Delivery gratuito por vivir en el Municipio Cárdenas.\n`;
    } else if (isOtroMunicipio) {
      msg += `🚚 *Tipo de envío:* Otro municipio. Necesito confirmar la ubicación exacta para cotizar el costo final por WhatsApp.\n`;
    } else if (isOtroEstado) {
      msg += `🚚 *Tipo de envío:* Otro estado. Debemos coordinar la agencia de envío o retiro correspondiente.\n`;
    }

    msg += `💳 *Método de Pago:* ${metodoPago}\n`;
    msg += `-----------------------------------\n`;
    msg += `📦 *DETALLE DEL PEDIDO:*\n`;

    cart.forEach(item => {
      const lineTotal = (item.price * item.quantity).toFixed(2);
      msg += `• ${item.name} x${item.quantity} - $${lineTotal}\n`;
    });

    msg += `-----------------------------------\n`;
    msg += `💸 *Subtotal:* $${subtotal.toFixed(2)}\n`;
    msg += `🎉 *Descuento web 10%:* -$${discount.toFixed(2)}\n`;
    msg += `💰 *TOTAL A PAGAR:* $${total.toFixed(2)}\n\n`;
    msg += `¡Hola! Quisiera confirmar los datos para realizar mi pago por *${metodoPago}*.`;

    cart = [];
    updateCartUI();

    const modalOverlay = document.getElementById('rf-cart-modal');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }

    const urlWa = `https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${encodeURIComponent(msg)}`;
    window.open(urlWa, '_blank');
  });
}
