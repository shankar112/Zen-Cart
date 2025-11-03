// products.js - simple in-memory catalog and helpers
import { tmpl, money } from './utils.js';

export const PRODUCTS = [
  {id:'p1', name:'Aurora Headphones', price:12999, category:'Audio', rating:4.7, img:'A', desc:'Immersive over‑ear with spatial audio.'},
  {id:'p2', name:'Nebula Smartwatch', price:19999, category:'Wearables', rating:4.5, img:'B', desc:'Fitness + notifications with 5‑day battery.'},
  {id:'p3', name:'Lumen Desk Lamp', price:5999, category:'Home', rating:4.3, img:'C', desc:'Dimmable LED with wireless charging.'},
  {id:'p4', name:'Flux Mechanical Keyboard', price:8999, category:'Peripherals', rating:4.8, img:'D', desc:'Hot‑swappable, RGB, low‑latency.'},
  {id:'p5', name:'Zen Air Purifier', price:14999, category:'Home', rating:4.4, img:'E', desc:'HEPA filtration, ultra‑quiet motor.'},
  {id:'p6', name:'Pulse Action Cam', price:15999, category:'Cameras', rating:4.2, img:'F', desc:'4K/60fps with stabilization.'}
];

export const listProducts = () => PRODUCTS.slice();
export const getProductById = (id) => PRODUCTS.find(p => p.id === id);

export const searchProducts = (term='') => {
  term = term.trim().toLowerCase();
  if (!term) return listProducts();
  // simple relevance: name contains > category contains > desc contains
  const score = (p) => (
    (p.name.toLowerCase().includes(term)?3:0)+
    (p.category.toLowerCase().includes(term)?2:0)+
    (p.desc.toLowerCase().includes(term)?1:0)
  );
  return PRODUCTS.map(p=>[p,score(p)]).filter(([,s])=>s>0).sort((a,b)=>b[1]-a[1]).map(([p])=>p);
};

const svg = (label='Z') => `
  <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" x2="1">
        <stop offset="0%" stop-color="#6ea8fe"/>
        <stop offset="100%" stop-color="#a16efc"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="16" fill="#111829"/>
    <circle cx="40" cy="40" r="26" fill="url(#g)" opacity=".55"/>
    <circle cx="120" cy="80" r="30" fill="url(#g)" opacity=".35"/>
    <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#e9eef7" font-weight="700" font-size="42">${label}</text>
  </svg>`;

export const card = (p) => tmpl(`
  <article class="card glass fade-up shine">
    <div class="thumb">${svg(p.img)}</div>
    <div class="content">
      <div class="row between">
        <h3 class="mb-0" style="font-size:16px">${p.name}</h3>
        <span class="price">${money(p.price)}</span>
      </div>
      <div class="row mt-1">
        <span class="chip">${p.category}</span>
        <span class="rating">★ ${p.rating}</span>
      </div>
      <div class="row mt-2 between">
        <a class="btn ghost" href="pdp.html?id=${p.id}">View</a>
        <button class="btn primary add" data-id="${p.id}">Add to cart</button>
      </div>
    </div>
  </article>
`);

export const summary = (p) => `${p.name} — ${money(p.price)}`;
