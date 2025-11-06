// app.js - app bootstrap: nav count, animations, search hookups
import { qs, qsa, on, debounce, mountInView, setText } from './utils.js';
import { cartCount, addItem } from './cart.js';
import { card, listProducts, searchProducts, getProductById } from './products.js';

const updateCartBadge = () => setText('#cart-count', String(cartCount()));

const renderFeatured = () => {
  const host = qs('#featured'); if (!host) return;
  const items = listProducts().slice(0,4);
  items.forEach(p => host.appendChild(card(p)));
  host.addEventListener('click', (e) => {
    const b = e.target.closest('.add');
    if (!b) return; const id = b.dataset.id; const p = getProductById(id);
    addItem(id, 1, p.price, p.name); updateCartBadge();
  });
};

const bindPLP = () => {
  const grid = qs('#plp'); if (!grid) return;
  const render = (arr) => { grid.innerHTML=''; arr.forEach(p=>grid.appendChild(card(p))); };
  render(listProducts());
  const search = qs('#search');
  if (search) on('input', search, debounce(e=> render(searchProducts(e.target.value)), 200));
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.add');
    if (!b) return; const id = b.dataset.id; const p = getProductById(id);
    addItem(id, 1, p.price, p.name); updateCartBadge();
  });
};

export const initApp = () => {
  updateCartBadge();
  renderFeatured();
  bindPLP();
  // Observe after dynamic content is injected
  mountInView();
};

document.addEventListener('DOMContentLoaded', initApp);
