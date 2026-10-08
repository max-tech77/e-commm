// ===== Classes (same design as the C++ project) =====
class Product {
  #id; #name; #price;                       // private data = encapsulation
  constructor(id, name, price, image) {
    this.#id = id; this.#name = name; this.#price = price; this.image = image;
  }
  get id() { return this.#id; }
  get name() { return this.#name; }
  get price() { return this.#price; }
  display() { return `${this.#id}. ${this.#name} - Rs ${this.#price}`; }
}

class Electronics extends Product {         // inheritance
  constructor(id, name, price, image, warrantyMonths) {
    super(id, name, price, image);
    this.warrantyMonths = warrantyMonths;
  }
  display() {                               // polymorphism: overrides display()
    return `[Electronics] ${super.display()} (Warranty: ${this.warrantyMonths} months)`;
  }
}

class Clothing extends Product {
  constructor(id, name, price, image, size) {
    super(id, name, price, image);
    this.size = size;
  }
  display() {
    return `[Clothing] ${super.display()} (Size: ${this.size})`;
  }
}

class Customer {
  #name; #phone;
  constructor(name, phone) { this.#name = name; this.#phone = phone; }
  get name() { return this.#name; }
  get phone() { return this.#phone; }
}

class Cart {
  #items = [];                              // list of {product, qty}
  addToCart(product, qty = 1) {
    const found = this.#items.find(i => i.product.id === product.id);
    if (found) found.qty += qty; else this.#items.push({ product, qty });
  }
  changeQty(id, change) {
    const item = this.#items.find(i => i.product.id === id);
    if (!item) return;
    item.qty += change;
    if (item.qty <= 0) this.#items = this.#items.filter(i => i !== item);
  }
  get items() { return this.#items; }
  isEmpty() { return this.#items.length === 0; }
  count() { return this.#items.reduce((n, i) => n + i.qty, 0); }
  calculateTotal() { return this.#items.reduce((t, i) => t + i.product.price * i.qty, 0); }
  clear() { this.#items = []; }
  generateBill(c) {
    let b = "======== BILL ========\n";
    b += `Customer: ${c.name}\nPhone: ${c.phone}\n----------------------\n`;
    this.#items.forEach(i => {
      b += `${i.product.name} x ${i.qty} = Rs ${i.product.price * i.qty}\n`;
    });
    b += `----------------------\nTOTAL: Rs ${this.calculateTotal()}\n======================\n`;
    return b;
  }
}

// ===== Data =====
const products = [
  new Electronics(1, "Smartphone", 15999, "smartphone", 12),
  new Electronics(2, "Headphones", 1999, "headphones", 6),
  new Clothing(3, "T-Shirt", 799, "tshirt", "M"),
  new Clothing(4, "Jeans", 1499, "jeans", "L"),
  new Electronics(5, "Keyboard", 999, "keyboard", 12)
];
const cart = new Cart();

// ===== Image loading: tries several file types, then a grey placeholder =====
const EXTS = ["jpg", "jpeg", "jfif", "png", "webp"];
const PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><rect width="240" height="180" fill="#e5e9f0"/><text x="120" y="95" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#5d677a">No image</text></svg>');
function imgFallback(img) {
  const next = (+img.dataset.try || 0) + 1;
  if (next < EXTS.length) {
    img.dataset.try = next;
    img.src = "images/" + img.dataset.base + "." + EXTS[next];
  } else {
    img.onerror = null;
    img.src = PLACEHOLDER;
  }
}

// ===== Screens =====
const $ = id => document.getElementById(id);
function show(name) {
  document.querySelectorAll(".view").forEach(v => v.hidden = v.id !== name);
  if (name === "cart") renderCart();
  window.scrollTo(0, 0);
}
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1500);
}
function updateCount() { $("count").textContent = cart.count(); }

function renderProducts() {
  $("grid").innerHTML = products.map(p => `
    <article class="card">
      <img src="images/${p.image}.jpg" data-base="${p.image}" alt="${p.name}" onerror="imgFallback(this)">
      <div>
        <h3>${p.name}</h3>
        <small>${p.display()}</small>
        <span class="price">Rs ${p.price}</span>
        <button class="primary" data-add="${p.id}">Add to cart</button>
      </div>
    </article>`).join("");
}

function renderCart() {
  if (cart.isEmpty()) {
    $("cartBody").innerHTML = `<p class="empty">Your cart is empty. Add a product to get started.</p>
      <button class="primary" data-go="products">Browse products</button>`;
    return;
  }
  const rows = cart.items.map(i => `<tr>
    <td>${i.product.name}</td>
    <td><button data-qty="${i.product.id}" data-d="-1" aria-label="Decrease">-</button> ${i.qty}
        <button data-qty="${i.product.id}" data-d="1" aria-label="Increase">+</button></td>
    <td>Rs ${i.product.price}</td><td>Rs ${i.product.price * i.qty}</td></tr>`).join("");
  $("cartBody").innerHTML = `<table><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>${rows}</table>
    <p class="total">Total: Rs ${cart.calculateTotal()}</p>
    <button class="primary" data-go="customer">Checkout</button>`;
}

// ===== Events =====
document.addEventListener("click", e => {
  const go = e.target.closest("[data-go]");
  if (go) return show(go.dataset.go);
  const add = e.target.closest("[data-add]");
  if (add) {
    cart.addToCart(products.find(p => p.id == add.dataset.add));
    updateCount(); toast("Added to cart");
  }
  const q = e.target.closest("[data-qty]");
  if (q) { cart.changeQty(+q.dataset.qty, +q.dataset.d); updateCount(); renderCart(); }
});
$("form").addEventListener("submit", e => {
  e.preventDefault();
  const c = new Customer($("cname").value.trim(), $("cphone").value.trim());
  $("billText").textContent = cart.generateBill(c);
  show("bill");
});
$("newOrder").addEventListener("click", () => {
  cart.clear(); updateCount(); $("form").reset(); show("home");
});

renderProducts();
