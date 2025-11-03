// utils.js - helpers for DOM, storage, formatting, timing
export const qs = (s, r = document) => r.querySelector(s);
export const qsa = (s, r = document) => [...r.querySelectorAll(s)];
export const on = (t, s, h, o = false) => s.addEventListener(t, h, o);

export const money = (n) => `$${(n/100).toFixed(2)}`;
export const toCents = (v) => Math.round(Number(v) * 100) || 0;

export const debounce = (fn, wait = 250) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
};

const ns = 'zc_';
export const storage = {
  get: (k, d=null) => { try { const v = localStorage.getItem(ns+k); return v?JSON.parse(v):d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(ns+k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(ns+k)
};

export const params = () => Object.fromEntries(new URLSearchParams(location.search));
export const uid = () => Math.random().toString(36).slice(2,9);

export const mountInView = (root = document) => {
  const els = qsa('.fade-up', root);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view'));
  }, { threshold:.15 });
  els.forEach(el => io.observe(el));
};

export const setText = (sel, txt) => { const el = qs(sel); if (el) el.textContent = txt; };

export const tmpl = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export const scrollTop = () => window.scrollTo({top:0,behavior:'smooth'});

export const formData = (form) => Object.fromEntries(new FormData(form).entries());

export const validate = {
  required: (v) => Boolean(String(v||'').trim()),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||''),
  zip: (v) => /^[0-9A-Za-z\-\s]{3,10}$/.test(v||''),
  cardLuhn: (v='') => { v = v.replace(/\D/g,''); let s=0,d=false; for(let i=v.length-1;i>=0;i--){ let n=+v[i]; if(d) { n*=2; if(n>9)n-=9; } s+=n; d=!d; } return v.length>=13 && s%10===0; },
  cvv: (v) => /^\d{3,4}$/.test(v||''),
};

export const pipe = (...fns) => (x) => fns.reduce((v,f)=>f(v), x);
