ZenCart – Modern E‑commerce (HTML5/CSS3/JS)

Overview
- Static, multi-page storefront with Home, PLP, PDP, Cart, and Checkout.
- Vanilla JS modules (no build step), CSS variables, responsive layout, and subtle animations.
- Cart state persisted in `localStorage`; debounced search; multi-step checkout with validation.

Structure
- index.html – Home
- plp.html – Product Listing Page
- pdp.html – Product Detail Page
- cart.html – Shopping Cart
- checkout.html – Checkout (multi-step)
- assets/css/base.css – Core styles + animations
- assets/js/utils.js – Helpers (DOM, debounce, storage, price)
- assets/js/products.js – Product catalog + search
- assets/js/cart.js – Cart state + totals
- assets/js/app.js – App init, nav updates, animations
- assets/js/forms.js – Checkout stepper + validation

Local Usage
1) Open `index.html` with a local web server (ES modules require http):
   - Python: `python -m http.server 8080` then visit http://localhost:8080/
   - Node (if installed globally): `npx http-server .`
2) Browse, add to cart, proceed to checkout.

Notes
- All files target <250 lines each and are modular.
- No external network dependencies/CDNs.
