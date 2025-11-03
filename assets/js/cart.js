// cart.js - localStorage-backed cart + totals
import { storage, toCents } from './utils.js';

const KEY = 'cart';
const TAX_RATE = 0.08; // 8%
const SHIPPING_FLAT = 995; // $9.95
const FREE_SHIPPING_THRESHOLD = 5000; // $50.00

const get = () => storage.get(KEY, []);
const set = (c) => storage.set(KEY, c);

export const getCart = () => get();

export const clearCart = () => set([]);

export const addItem = (id, qty = 1, priceCents = null, name = '') => {
  qty = Math.max(1, Number(qty)||1);
  const cart = get();
  const idx = cart.findIndex(i => i.id === id);
  if (idx >= 0) cart[idx].qty += qty; else cart.push({ id, qty, price: priceCents, name });
  set(cart); return cart;
};

export const updateQty = (id, qty) => {
  qty = Math.max(0, Number(qty)||0);
  const cart = get().map(i => i.id===id?{...i, qty}:i).filter(i => i.qty>0);
  set(cart); return cart;
};

export const removeItem = (id) => { set(get().filter(i => i.id !== id)); return get(); };

export const cartCount = () => get().reduce((n,i)=>n+i.qty,0);

export const computeTotals = () => {
  const items = get();
  const subtotal = items.reduce((sum,i)=>sum + (Number(i.price)||0) * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal===0 ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total, count: cartCount() };
};

export const hydrateCartPrices = (resolver) => {
  // Ensure each item has a price; resolver(id) -> {price,name}
  const cart = get();
  let changed = false;
  const next = cart.map(i => {
    if (i.price==null) { const r = resolver(i.id); if (r) { changed = true; return {...i, price:r.price, name:r.name}; } }
    return i;
  });
  if (changed) set(next);
  return next;
};

export const lineTotal = (i) => (Number(i.price)||0) * i.qty;

export const asCheckoutPayload = (shipping, payment) => ({
  id: `ord_${Date.now()}`,
  placedAt: new Date().toISOString(),
  items: get(),
  amounts: computeTotals(),
  shipping,
  payment: { brand: payment.brand, last4: String(payment.card||'').slice(-4) }
});

export const syncQtyInputs = (root) => {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-qty]');
    if (!b) return;
    const id = b.dataset.id, type = b.dataset.qty;
    const input = root.querySelector(`input[data-qinp="${id}"]`);
    const cur = Number(input.value)||1; const next = type==='inc'?cur+1:Math.max(1,cur-1);
    input.value = next; updateQty(id, next);
    root.dispatchEvent(new CustomEvent('cart:changed'));
  });
};

export const bindRemoveButtons = (root) => {
  root.addEventListener('click', (e) => {
    const r = e.target.closest('[data-remove]');
    if (!r) return;
    removeItem(r.dataset.id);
    root.dispatchEvent(new CustomEvent('cart:changed'));
  });
};

export const setCart = (items) => set(items);
export const setPriceFor = (id, price) => set(get().map(i=>i.id===id?{...i,price:toCents(price)}:i));
