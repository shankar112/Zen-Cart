// bundle.js — accessible, no-ESM fallback with keyboard support
(() => {
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const on=(t,el,fn,opt)=>el&&el.addEventListener(t,fn,opt);
  const debounce=(fn,wait=250)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),wait)}};
  const money=(n)=>`$${(n/100).toFixed(2)}`;

  // Storage
  const storage={ get:(k,d=[])=>{try{const v=localStorage.getItem('zc_'+k);return v?JSON.parse(v):d}catch{return d}}, set:(k,v)=>localStorage.setItem('zc_'+k,JSON.stringify(v)) };

  // Small utils
  const tmpl=(h)=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstElementChild};
  const params=()=>Object.fromEntries(new URLSearchParams(location.search));
  const setText=(sel,txt)=>{const el=qs(sel); if(el) el.textContent=txt};

  // In‑view animation
  const mountInView=()=>{const els=qsa('.fade-up'); if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in-view'));return;} const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('in-view')),{threshold:.01,rootMargin:'0px 0px -10% 0px'}); els.forEach(el=>{const r=el.getBoundingClientRect(); if(r.top<innerHeight*0.9) el.classList.add('in-view'); io.observe(el);});};

  // Toast + SR announce
  const toast=(msg)=>{let t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');t.textContent=msg;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),200);},1600);let sr=qs('#sr-announce');if(!sr){sr=document.createElement('div');sr.id='sr-announce';sr.className='sr-only';sr.setAttribute('role','status');sr.setAttribute('aria-live','polite');document.body.appendChild(sr);} sr.textContent=msg; setTimeout(()=>sr.textContent='',1000)};

  // Catalog (mock)
  const PRODUCTS=[
    {id:'p1',name:'Aurora Headphones',price:12999,category:'Audio',rating:4.7,img:'A',desc:'Immersive over‑ear with spatial audio.'},
    {id:'p2',name:'Nebula Smartwatch',price:19999,category:'Wearables',rating:4.5,img:'B',desc:'Fitness + notifications with 5‑day battery.'},
    {id:'p3',name:'Lumen Desk Lamp',price:5999,category:'Home',rating:4.3,img:'C',desc:'Dimmable LED with wireless charging.'},
    {id:'p4',name:'Flux Mechanical Keyboard',price:8999,category:'Peripherals',rating:4.8,img:'D',desc:'Hot‑swappable, RGB, low‑latency.'},
    {id:'p5',name:'Zen Air Purifier',price:14999,category:'Home',rating:4.4,img:'E',desc:'HEPA filtration, ultra‑quiet motor.'},
    {id:'p6',name:'Pulse Action Cam',price:15999,category:'Cameras',rating:4.2,img:'F',desc:'4K/60fps with stabilization.'}
  ];
  const getProductById=(id)=>PRODUCTS.find(p=>p.id===id);
  const searchProducts=(term='')=>{term=term.trim().toLowerCase(); if(!term) return PRODUCTS.slice(); const score=p=> (p.name.toLowerCase().includes(term)?3:0)+(p.category.toLowerCase().includes(term)?2:0)+(p.desc.toLowerCase().includes(term)?1:0); return PRODUCTS.map(p=>[p,score(p)]).filter(([,s])=>s>0).sort((a,b)=>b[1]-a[1]).map(([p])=>p)};
  const svg=(l='Z')=>`<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="16" fill="#111829"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#e9eef7" font-weight="700" font-size="42">${l}</text></svg>`;
  const card=(p)=>tmpl(`<article class="card glass fade-up shine" data-id="${p.id}" tabindex="0" role="link" aria-label="View ${p.name}"><div class="thumb">${svg(p.img)}</div><div class="content"><div class="row between"><h3 class="mb-0" id="t_${p.id}" style="font-size:16px">${p.name}</h3><span class="price" aria-label="Price ${money(p.price)}">${money(p.price)}</span></div><div class="row mt-1"><span class="chip">${p.category}</span><span class="rating" aria-label="Rating ${p.rating} of 5">★ ${p.rating}</span></div><div class="row mt-2 between"><a class="btn ghost view-link" href="pdp.html?id=${p.id}" aria-labelledby="t_${p.id}">View</a><button class="btn primary add" data-id="${p.id}" aria-label="Add ${p.name} to cart">Add to cart</button></div></div></article>`);

  // Cart
  const TAX=0.08, SHIP=995, FREE=5000; const get=()=>storage.get('cart',[]), set=(c)=>storage.set('cart',c);
  const cartCount=()=>get().reduce((n,i)=>n+i.qty,0);
  const addItem=(id,qty=1,price=null,name='')=>{qty=Math.max(1,Number(qty)||1);const c=get();const i=c.findIndex(x=>x.id===id); if(i>=0)c[i].qty+=qty; else c.push({id,qty,price,name}); set(c)};
  const updateQty=(id,qty)=>{qty=Math.max(0,Number(qty)||0); set(get().map(i=>i.id===id?{...i,qty}:i).filter(i=>i.qty>0))};
  const removeItem=(id)=>set(get().filter(i=>i.id!==id));
  const hydrate=(resolver)=>{const c=get(); let changed=false; const n=c.map(i=>{ if(i.price==null){const r=resolver(i.id); if(r){changed=true; return {...i,price:r.price,name:r.name}}} return i;}); if(changed)set(n)};
  const lineTotal=(i)=>(Number(i.price)||0)*i.qty;
  const totals=()=>{const items=get(); const subtotal=items.reduce((s,i)=>s+lineTotal(i),0); const shipping=subtotal>=FREE||subtotal===0?0:SHIP; const tax=Math.round(subtotal*TAX); return { subtotal, shipping, tax, total: subtotal+shipping+tax, count: cartCount() } };

  // Views
  const updateBadge=()=>setText('#cart-count', String(cartCount()));
  const renderFeatured=()=>{const host=qs('#featured'); if(!host) return; host.innerHTML=''; PRODUCTS.slice(0,4).forEach(p=>host.appendChild(card(p))); };
  const bindPLP=()=>{const grid=qs('#plp'); if(!grid) return; const draw=(arr)=>{grid.innerHTML=''; arr.forEach(p=>grid.appendChild(card(p)))}; draw(PRODUCTS); const s=qs('#search'); const clr=qs('#clear'); s&&on('input',s,debounce(e=>draw(searchProducts(e.target.value)),200)); clr&&on('click',clr,()=>{s.value=''; s.dispatchEvent(new Event('input'))}); };
  const initPDP=()=>{const name=qs('#name'); if(!name) return; const p=getProductById(params().id); if(!p){qs('main').innerHTML='<p>Product not found.</p>'; return;} setText('#bc-name',p.name); setText('#name',p.name); setText('#desc',p.desc); setText('#cat',p.category); setText('#rate',`★ ${p.rating}`); setText('#price',money(p.price)); qs('#img').innerHTML=`<div class="thumb" style="aspect-ratio:4/3">${svg(p.img)}</div>`; const q=qs('#qty'); on('click',qs('#inc'),()=>q.value=String((Number(q.value)||1)+1)); on('click',qs('#dec'),()=>q.value=String(Math.max(1,(Number(q.value)||1)-1))); on('click',qs('#add'),()=>{addItem(p.id,Number(q.value)||1,p.price,p.name); updateBadge(); toast('Added to cart'); location.href='cart.html'}); };
  const initCart=()=>{const tbody=qs('#rows'); if(!tbody) return; const fmt=(n)=>money(n); const render=()=>{hydrate(id=>{const p=getProductById(id); return p?{price:p.price,name:p.name}:null}); const cart=get(); tbody.innerHTML=cart.length?'':'<tr><td colspan="4" class="muted">Your cart is empty.</td></tr>'; cart.forEach(i=>{const row=tmpl(`<tr><td>${i.name||i.id}</td><td><div class="qty"><button data-dec data-id="${i.id}">-</button><input data-qinp="${i.id}" value="${i.qty}"/><button data-inc data-id="${i.id}">+</button></div></td><td class="text-right">${fmt(lineTotal(i))}</td><td class="text-right"><button class="btn ghost" data-remove data-id="${i.id}">Remove</button></td></tr>`); tbody.appendChild(row)}); const t=totals(); setText('#s-sub',fmt(t.subtotal)); setText('#s-ship',fmt(t.shipping)); setText('#s-tax',fmt(t.tax)); setText('#s-total',fmt(t.total)); updateBadge(); }; on('click',tbody,(e)=>{const dec=e.target.closest('[data-dec]'); const inc=e.target.closest('[data-inc]'); const rm=e.target.closest('[data-remove]'); if(dec||inc){const id=(dec||inc).dataset.id; const inp=qs(`input[data-qinp="${id}"]`); const cur=Number(inp.value)||1; const next=inc?cur+1:Math.max(1,cur-1); inp.value=next; updateQty(id,next); render(); return;} if(rm){removeItem(rm.dataset.id); render();}}); on('input',tbody,(e)=>{const inp=e.target.closest('input[data-qinp]'); if(!inp) return; const id=inp.dataset.qinp; const v=Math.max(1,Number(inp.value)||1); inp.value=v; updateQty(id,v); render();}); render(); };
  const initCheckout=()=>{const root=qs('#checkout'); if(!root) return; const fill=()=>{const t=totals(); setText('#sum-subtotal',money(t.subtotal)); setText('#sum-shipping',money(t.shipping)); setText('#sum-tax',money(t.tax)); setText('#sum-total',money(t.total));}; const show=(n)=>{qsa('[data-step]').forEach(s=>s.classList.add('hidden')); const a=qs(`[data-step="${n}"]`); a&&a.classList.remove('hidden'); setText('#step-label', n.charAt(0).toUpperCase()+n.slice(1));}; fill(); show('shipping'); const fd=(f)=>Object.fromEntries(new FormData(qs(f)).entries()); const email=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||''); const zip=v=>/^[0-9A-Za-z\-\s]{3,10}$/.test(v||''); const luhn=(v='')=>{v=v.replace(/\D/g,''); let s=0,d=false; for(let i=v.length-1;i>=0;i--){let n=+v[i]; if(d){n*=2;if(n>9)n-=9} s+=n; d=!d;} return v.length>=13&&s%10===0}; on('click',qs('#to-payment'),()=>{const d=fd('#shipping-form'); if(!(d.fullname&&email(d.email)&&d.address&&d.city&&zip(d.zip))){alert('Please complete shipping details correctly.'); return;} show('payment')}); on('click',qs('#back-shipping'),()=>show('shipping')); on('click',qs('#to-review'),()=>{const p=fd('#payment-form'); if(!(luhn(p.card)&&/^\d{2}\/\d{2}$/.test(p.exp||'')&&/^\d{3,4}$/.test(p.cvv||''))){alert('Please check card details.'); return;} setText('#review-name', fd('#shipping-form').fullname||''); setText('#review-email', fd('#shipping-form').email||''); setText('#review-card', `${(/^4/.test(p.card)?'Visa':/^5[1-5]/.test(p.card)?'Mastercard':/^3[47]/.test(p.card)?'AmEx':'Card')} •••• ${String(p.card||'').replace(/\D/g,'').slice(-4)}`); fill(); show('review')}); on('click',qs('#back-payment'),()=>show('payment')); on('click',qs('#place-order'),()=>{alert('Order placed!'); storage.set('cart',[]); location.href='index.html'}); };

  // Boot
  const boot=()=>{updateBadge(); renderFeatured(); bindPLP(); initPDP(); initCart(); initCheckout(); mountInView(); const y=qs('#year'); if(y) y.textContent=new Date().getFullYear(); };
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);} else {boot();}

  // Delegated interactions (capture) — add to cart, view, card click
  document.addEventListener('click',(e)=>{
    const add=e.target.closest('button.add');
    if(add){const id=add.dataset.id; const p=getProductById(id); if(p){addItem(id,1,p.price,p.name); updateBadge(); toast('Added to cart'); e.preventDefault();} return; }
    const view=e.target.closest('a.view-link');
    if(view){e.preventDefault(); location.href=view.getAttribute('href'); return;}
    const cardEl=e.target.closest('article.card[data-id]');
    if(cardEl && !e.target.closest('a,button,.btn')){ location.href=`pdp.html?id=${cardEl.dataset.id}`; }
  }, true);

  // Keyboard: Enter/Space on focused card
  document.addEventListener('keydown',(e)=>{
    if(!(e.key==='Enter'||e.key===' ')) return; const el=document.activeElement;
    if(el && el.matches('article.card[data-id]')){ e.preventDefault(); location.href=`pdp.html?id=${el.dataset.id}`; }
  }, true);

  // Expose init helpers (used by pages if needed)
  window.ZC={ initPDP, initCart, initCheckout };
})();

