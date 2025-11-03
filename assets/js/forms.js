// forms.js - checkout stepper + validation
import { qs, qsa, on, formData, validate, setText } from './utils.js';
import { computeTotals, asCheckoutPayload, clearCart } from './cart.js';

const steps = ['shipping','payment','review'];

const showStep = (name) => {
  qsa('[data-step]').forEach(s => s.classList.add('hidden'));
  const active = qs(`[data-step="${name}"]`); if (active) active.classList.remove('hidden');
  setText('#step-label', name.charAt(0).toUpperCase()+name.slice(1));
};

const fillSummary = () => {
  const t = computeTotals();
  setText('#sum-subtotal', `$${(t.subtotal/100).toFixed(2)}`);
  setText('#sum-shipping', `$${(t.shipping/100).toFixed(2)}`);
  setText('#sum-tax', `$${(t.tax/100).toFixed(2)}`);
  setText('#sum-total', `$${(t.total/100).toFixed(2)}`);
};

const validShipping = (data) => (
  validate.required(data.fullname)&&
  validate.email(data.email)&&
  validate.required(data.address)&&
  validate.required(data.city)&&
  validate.zip(data.zip)
);

const validPayment = (data) => (
  validate.cardLuhn(data.card)&&
  /^\d{2}\/\d{2}$/.test(data.exp||'')&&
  validate.cvv(data.cvv)
);

const parseBrand = (card='') => {
  const v = card.replace(/\D/g,'');
  if (/^4/.test(v)) return 'Visa';
  if (/^5[1-5]/.test(v)) return 'Mastercard';
  if (/^3[47]/.test(v)) return 'AmEx';
  return 'Card';
};

export const initCheckout = () => {
  const root = qs('#checkout'); if (!root) return;
  fillSummary(); showStep(steps[0]);

  const next1 = qs('#to-payment');
  const back1 = qs('#back-shipping');
  const next2 = qs('#to-review');
  const back2 = qs('#back-payment');
  const place = qs('#place-order');

  on('click', next1, () => {
    const data = formData(qs('#shipping-form'));
    if (!validShipping(data)) { alert('Please complete shipping details correctly.'); return; }
    showStep('payment');
  });

  on('click', back1, () => showStep('shipping'));

  on('click', next2, () => {
    const pdata = formData(qs('#payment-form'));
    if (!validPayment(pdata)) { alert('Please check card details.'); return; }
    setText('#review-name', formData(qs('#shipping-form')).fullname||'');
    setText('#review-email', formData(qs('#shipping-form')).email||'');
    setText('#review-card', `${parseBrand(pdata.card)} •••• ${String(pdata.card||'').replace(/\D/g,'').slice(-4)}`);
    fillSummary();
    showStep('review');
  });

  on('click', back2, () => showStep('payment'));

  on('click', place, () => {
    const s = formData(qs('#shipping-form'));
    const p = formData(qs('#payment-form'));
    const payload = asCheckoutPayload(s, { ...p, brand: parseBrand(p.card) });
    clearCart();
    showStep('shipping');
    document.body.classList.add('order-placed');
    alert(`Order placed!\nID: ${payload.id}`);
    location.href = 'index.html';
  });
};

document.addEventListener('DOMContentLoaded', initCheckout);
