"use strict";

// Product data: each product has its own details.
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 1499,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=75"
    },
    {
        id: 2,
        name: "Smart Watch",
        category: "Electronics",
        price: 2299,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=75"
    },
    {
        id: 3,
        name: "Running Shoes",
        category: "Fashion",
        price: 1899,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=75"
    },
    {
        id: 4,
        name: "Backpack",
        category: "Accessories",
        price: 999,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=75"
    },
    {
        id: 5,
        name: "Classic Sunglasses",
        category: "Accessories",
        price: 799,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=75"
    },
    {
        id: 6,
        name: "Casual T-Shirt",
        category: "Fashion",
        price: 599,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=75"
    }
];

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const productMessage = document.getElementById("productMessage");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const clearCartButton = document.getElementById("clearCart");

// Load saved cart data if available.
let cart = [];

try {
    const savedCart = JSON.parse(localStorage.getItem("shopease-cart") || "[]");

    if (Array.isArray(savedCart)) {
        cart = savedCart.filter(item =>
            products.some(product => product.id === item.id) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        );
    }
} catch (error) {
    cart = [];
}

function formatPrice(price) {
    return "₹" + price.toLocaleString("en-IN");
}

// Display products on the page.
function displayProducts() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortOrder = sortFilter.value;

    let filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchText);
        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesName && matchesCategory;
    });

    if (sortOrder === "low") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    productGrid.replaceChildren();

    productMessage.textContent = filteredProducts.length
        ? `${filteredProducts.length} product(s) found.`
        : "No products found. Try another search.";

    filteredProducts.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.alt = product.name + " image unavailable";
            image.style.display = "none";
        }, { once: true });

        const name = document.createElement("h3");
        name.textContent = product.name;

        const category = document.createElement("p");
        category.className = "category";
        category.textContent = product.category;

        const price = document.createElement("p");
        price.className = "price";
        price.textContent = formatPrice(product.price);

        const button = document.createElement("button");
        button.textContent = "Add to Cart";
        button.addEventListener("click", () => addToCart(product.id));

        card.append(image, name, category, price, button);
        productGrid.appendChild(card);
    });
}

// Save cart data in the browser.
function saveCart() {
    try {
        localStorage.setItem("shopease-cart", JSON.stringify(cart));
    } catch (error) {
        console.warn("Cart could not be saved in this browser.");
    }
}

// Add a product or increase its quantity.
function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    saveCart();
    displayCart();
}

// Change quantity by one.
function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(cartItem => cartItem.id !== productId);
    }

    saveCart();
    displayCart();
}

// Remove a product from the cart.
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCart();
}

// Show cart products and calculate the total.
function displayCart() {
    cartItems.replaceChildren();

    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);

        if (!product) return;

        totalQuantity += item.quantity;
        totalPrice += product.price * item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";

        const details = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent =
            `${formatPrice(product.price)} × ${item.quantity}`;

        details.append(name, price);

        const actions = document.createElement("div");
        actions.className = "cart-actions";

        const minusButton = document.createElement("button");
        minusButton.className = "quantity-button";
        minusButton.textContent = "−";
        minusButton.setAttribute("aria-label", "Decrease quantity");
        minusButton.addEventListener("click", () =>
            changeQuantity(product.id, -1)
        );

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plusButton = document.createElement("button");
        plusButton.className = "quantity-button";
        plusButton.textContent = "+";
        plusButton.setAttribute("aria-label", "Increase quantity");
        plusButton.addEventListener("click", () =>
            changeQuantity(product.id, 1)
        );

        const removeButton = document.createElement("button");
        removeButton.className = "remove-button";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () =>
            removeFromCart(product.id)
        );

        actions.append(
            minusButton,
            quantity,
            plusButton,
            removeButton
        );

        row.append(details, actions);
        cartItems.appendChild(row);
    });

    if (cart.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Your cart is empty. Add some products!";
        cartItems.appendChild(emptyMessage);
    }

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = "Total: " + formatPrice(totalPrice);
}

// Search and filter event listeners.
searchInput.addEventListener("input", displayProducts);
categoryFilter.addEventListener("change", displayProducts);
sortFilter.addEventListener("change", displayProducts);

// Clear all cart items.
clearCartButton.addEventListener("click", () => {
    cart = [];
    saveCart();
    displayCart();
});

// Simple client-side hash navigation.
function handleNavigation() {
    const page = window.location.hash.slice(1) || "home";
    const target = document.getElementById(page);

    if (target) {
        target.scrollIntoView({ behavior: "smooth" });
    }
}

window.addEventListener("hashchange", handleNavigation);

// Start the application.
displayProducts();
displayCart();
handleNavigation();