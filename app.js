/* -------------------------------------------------------------
   LOOP COFFEE JAVASCRIPT ENGINE
   Controls all interactivity, cart mechanics, coffee customizer,
   reservation validation, gallery lightboxes, and smooth animations.
   ------------------------------------------------------------- */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOYfbZ64eITHubPcFRrmK5umnccOKWhW0",
  authDomain: "loop-1b6b2.firebaseapp.com",
  projectId: "loop-1b6b2",
  storageBucket: "loop-1b6b2.firebasestorage.app",
  messagingSenderId: "792965836326",
  appId: "1:792965836326:web:d23d4799de8b07c237c0e7",
  measurementId: "G-ZKCSHB40G9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Web3Forms Access Key for Email Notifications (Get a free key at web3forms.com)
const WEB3FORMS_ACCESS_KEY = "e012facc-e57e-42e8-b330-becd6c918c0b";

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CUSTOM CURSOR
    // ==========================================
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .radio-card, .checkbox-card, .gallery-item');

    if (cursor && cursorDot) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
        });

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovered');
            });
        });
    }

    // ==========================================
    // 2. SCROLL EVENTS: STICKY HEADER & NAV ACTIVE SPY
    // ==========================================
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Sticky Header
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll Spy (Navbar Link Activation)
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset header height
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // ==========================================
    // 3. MOBILE MENU NAVIGATION Toggle
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Toggle hamburger animation in CSS
            const spans = menuToggle.querySelectorAll('span');
            if (menuToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu on clicking link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // ==========================================
    // 4. MENU SYSTEM DATA & CONTROLS
    // ==========================================
    const menuItems = [
        // 1. Coffees
        {
            id: 'coffee-espresso',
            title: 'Espresso',
            price: 300,
            description: 'Freshly pulled double shot of our premium signature house blend.',
            category: 'coffee',
            image: 'assets/ambience_barista.png'
        },
        {
            id: 'coffee-latte',
            title: 'Latte',
            price: 350,
            description: 'Silky steamed milk poured over a rich double shot of espresso.',
            category: 'coffee',
            image: 'assets/ambience_barista.png'
        },
        {
            id: 'coffee-cappuccino',
            title: 'Cappuccino',
            price: 350,
            description: 'Classic espresso drink with equal parts espresso, steamed milk, and rich milk foam.',
            category: 'coffee',
            image: 'assets/ambience_barista.png'
        },
        {
            id: 'coffee-loop-latte',
            title: 'Loop Latte',
            price: 380,
            description: 'Our signature cold latte with a secret cream blend. A local favorite!',
            category: 'coffee',
            image: 'assets/about_coffee.png',
            badge: 'Signature'
        },
        {
            id: 'coffee-very-vanilla',
            title: 'Very Vanilla',
            price: 380,
            description: 'Smooth espresso blended with sweet French vanilla syrup and velvet milk.',
            category: 'coffee',
            image: 'assets/ambience_barista.png'
        },
        {
            id: 'coffee-caramel-macchiato',
            title: 'Caramel Macchiato',
            price: 380,
            description: 'Fresh espresso with steamed milk, sweetened with vanilla and drizzled with caramel.',
            category: 'coffee',
            image: 'assets/sig_macchiato.png',
            badge: 'Best Seller'
        },
        {
            id: 'coffee-hazelnut-heaven',
            title: 'Hazelnut Heaven',
            price: 380,
            description: 'Rich roasted hazelnut syrup combined with our signature double espresso.',
            category: 'coffee',
            image: 'assets/ambience_barista.png'
        },
        {
            id: 'coffee-coconut-creme',
            title: 'Coconut Crème',
            price: 380,
            description: 'Tropical coconut infusion mixed with smooth, creamy steamed milk and espresso.',
            category: 'coffee',
            image: 'assets/ambience_barista.png'
        },
        {
            id: 'coffee-caramel-popcorn',
            title: 'Caramel Popcorn',
            price: 380,
            description: 'A sweet, buttery caramel popcorn latte with a rich espresso kick.',
            category: 'coffee',
            image: 'assets/ambience_barista.png'
        },
        {
            id: 'coffee-mad-mocha',
            title: 'Mad Mocha',
            price: 420,
            description: 'Decadent dark chocolate melted into double espresso and warm textured milk.',
            category: 'coffee',
            image: 'assets/sig_dirty.png'
        },

        // 2. Americano Refreshers
        {
            id: 'refresher-classic',
            title: 'Classic Americano',
            price: 200,
            description: 'Double shot of espresso diluted with hot water or poured over ice.',
            category: 'refreshers',
            image: 'assets/sig_dirty.png'
        },
        {
            id: 'refresher-peach-pulse',
            title: 'Peach Pulse',
            price: 380,
            description: 'A sparkling, sweet peach-infused refresher with an espresso base.',
            category: 'refreshers',
            image: 'assets/sig_dirty.png'
        },
        {
            id: 'refresher-crisp-apple',
            title: 'Crisp Apple',
            price: 380,
            description: 'Zesty and crisp green apple refresher blended with chilled espresso.',
            category: 'refreshers',
            image: 'assets/sig_dirty.png'
        },
        {
            id: 'refresher-lemon-zest',
            title: 'Lemon Zest',
            price: 380,
            description: 'Tangy lemon syrup and soda topped with a float of cold-brewed espresso.',
            category: 'refreshers',
            image: 'assets/sig_dirty.png'
        },
        {
            id: 'refresher-sunset-fusion',
            title: 'Sunset Fusion',
            price: 380,
            description: 'A colorful layered fruit tea refresher topped with chilled espresso.',
            category: 'refreshers',
            image: 'assets/sig_dirty.png'
        },

        // 3. Matcha
        {
            id: 'matcha-iced',
            title: 'Iced Matcha',
            price: 400,
            description: 'Premium stone-ground Japanese matcha whisked with ice-cold milk.',
            category: 'matcha',
            image: 'assets/dessert_tart.png'
        }
    ];

    const menuGrid = document.getElementById('menu-grid');
    const menuSearch = document.getElementById('menu-search');
    const tabBtns = document.querySelectorAll('.tab-btn');

    let activeCategory = 'all';
    let searchQuery = '';

    // Render Menu Items Function
    function renderMenu() {
        if (!menuGrid) return;
        menuGrid.innerHTML = '';

        const filteredItems = menuItems.filter(item => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filteredItems.length === 0) {
            menuGrid.innerHTML = `
                <div class="no-results-message" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">
                    <p>No items match your search "${searchQuery}".</p>
                </div>
            `;
            return;
        }

        filteredItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `
                <div class="menu-card-img-wrapper">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    ${item.badge ? `<span class="menu-card-tag">${item.badge}</span>` : ''}
                </div>
                <div class="menu-card-body">
                    <div>
                        <div class="menu-card-header">
                            <h4 class="menu-card-title">${item.title}</h4>
                            <span class="menu-card-price">Rs. ${item.price}</span>
                        </div>
                        <p class="menu-card-desc">${item.description}</p>
                    </div>
                    <div class="menu-card-footer">
                        <button class="btn btn-secondary btn-sm btn-full add-to-cart-btn" data-id="${item.id}">Add to Order</button>
                    </div>
                </div>
            `;
            menuGrid.appendChild(card);
        });

        // Re-attach add to cart event listeners
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                const product = menuItems.find(item => item.id === itemId);
                if (product) {
                    addToCart(product.id, product.title, product.price, product.image);
                }
            });
        });
    }

    // Search input listener
    if (menuSearch) {
        menuSearch.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderMenu();
        });
    }

    // Category Tabs listeners
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeCategory = e.target.getAttribute('data-tab');
            renderMenu();
        });
    });

    // Initialize Menu
    renderMenu();


    // ==========================================
    // 5. INTERACTIVE COFFEE CUSTOMIZER ENGINE
    // ==========================================
    const sizeRadios = document.querySelectorAll('input[name="size"]');
    const milkRadios = document.querySelectorAll('input[name="milk"]');
    const shotSlider = document.getElementById('espresso-shots');
    const sweetSlider = document.getElementById('sweetness');
    const toppingCheckboxes = document.querySelectorAll('input[name="topping"]');
    
    // Preview targets
    const cupCoffee = document.getElementById('cup-coffee');
    const cupMilk = document.getElementById('cup-milk');
    const cupFoam = document.getElementById('cup-foam');
    const cupTopping = document.getElementById('cup-topping');
    
    // Value labels
    const shotsValLabel = document.getElementById('shots-val');
    const sweetValLabel = document.getElementById('sweet-val');
    const customPriceLabel = document.getElementById('custom-brew-price');
    const caffeineLabel = document.getElementById('stat-caffeine');
    const caloriesLabel = document.getElementById('stat-calories');
    const tempLabel = document.getElementById('stat-temp');
    
    const addCustomBtn = document.getElementById('add-custom-btn');

    function updateCustomizer() {
        if (!shotSlider) return;

        // 1. Get Selected Values
        const size = document.querySelector('input[name="size"]:checked').value;
        const milk = document.querySelector('input[name="milk"]:checked').value;
        const shots = parseInt(shotSlider.value);
        const sweetness = parseInt(sweetSlider.value);
        
        let toppingCount = 0;
        let toppingsPrice = 0;
        let selectedToppings = [];

        toppingCheckboxes.forEach(box => {
            if (box.checked) {
                toppingCount++;
                toppingsPrice += parseFloat(box.getAttribute('data-price'));
                selectedToppings.push(box.value);
            }
        });

        // 2. Calculations
        // Base Espresso price is Rs. 350
        let price = 350;

        // Add size cost
        if (size === 'medium') price += 50;
        if (size === 'large') price += 100;

        // Add milk cost
        if (milk === 'whole') price += 40;
        if (milk === 'oat' || milk === 'almond') price += 80;

        // Add shot cost (first 2 shots included, extra shots Rs. 50 each)
        if (shots > 2) {
            price += (shots - 2) * 50;
        }

        // Add toppings
        price += toppingsPrice;

        // Caffeine: 75mg per shot
        const caffeineVal = shots * 75;

        // Calories: size + milk + toppings + sweet
        let caloriesVal = 10; // base espresso calories
        if (size === 'medium') caloriesVal += 10;
        if (size === 'large') caloriesVal += 20;

        if (milk === 'whole') caloriesVal += 120;
        if (milk === 'oat') caloriesVal += 80;
        if (milk === 'almond') caloriesVal += 50;

        caloriesVal += (sweetness / 25) * 30; // 0, 30, 60, 90, 120 calories

        if (selectedToppings.includes('caramel')) caloriesVal += 50;
        if (selectedToppings.includes('chocolate')) caloriesVal += 20;
        if (selectedToppings.includes('cinnamon')) caloriesVal += 5;
        if (selectedToppings.includes('whipped')) caloriesVal += 90;

        // Temperature
        let tempText = "Hot (65°C)";
        if (milk !== 'none') tempText = "Warm (60°C)";
        if (selectedToppings.includes('whipped')) tempText = "Warm (55°C)";

        // 3. Update Labels
        shotsValLabel.textContent = shots === 1 ? '1 Shot' : `${shots} Shots`;
        sweetValLabel.textContent = sweetness === 0 ? 'Unsweet' : sweetness === 50 ? 'Semi-sweet' : sweetness === 100 ? 'Sweet' : `${sweetness}%`;
        customPriceLabel.textContent = `Rs. ${price}`;
        caffeineLabel.textContent = `${caffeineVal}mg`;
        caloriesLabel.textContent = `${caloriesVal} kcal`;
        tempLabel.textContent = tempText;

        // 4. Update Visual Cup Heights
        // The container holds 100% total height.
        // Let's divide: Coffee layer, Milk layer, Foam layer, Topping layer.
        
        let coffeeHeight = 0;
        let milkHeight = 0;
        let foamHeight = 0;
        let toppingHeight = 0;

        if (milk === 'none') {
            // Espresso pure
            coffeeHeight = 70 + (shots * 5); // 75% to 90% full
            foamHeight = 8; // crema
            milkHeight = 0;
        } else {
            // Coffee + Milk mix
            coffeeHeight = 25 + (shots * 6); // 30% to 50% coffee base
            milkHeight = 45; // base milk layer
            foamHeight = 15; // standard microfoam
        }

        if (selectedToppings.length > 0) {
            toppingHeight = 8 + (selectedToppings.length * 2);
            // Deduct some space to keep within cup bounds
            coffeeHeight -= toppingHeight * 0.4;
            milkHeight -= toppingHeight * 0.4;
        }

        // Apply heights to DOM elements
        cupCoffee.style.height = `${coffeeHeight}%`;
        cupMilk.style.height = `${milkHeight}%`;
        cupFoam.style.height = `${foamHeight}%`;
        cupTopping.style.height = `${toppingHeight}%`;

        // Apply visual colors for milk type
        if (milk === 'whole') {
            cupMilk.style.backgroundColor = '#faf5e8';
        } else if (milk === 'oat') {
            cupMilk.style.backgroundColor = '#f1e7d2';
        } else if (milk === 'almond') {
            cupMilk.style.backgroundColor = '#ede2cd';
        }

        // Visual toppings colors/patterns
        if (selectedToppings.includes('caramel')) {
            cupTopping.style.background = 'repeating-linear-gradient(45deg, #b58455, #b58455 10px, transparent 10px, transparent 20px)';
        } else if (selectedToppings.includes('chocolate')) {
            cupTopping.style.background = 'repeating-linear-gradient(135deg, #422d1b, #422d1b 8px, transparent 8px, transparent 16px)';
        } else {
            cupTopping.style.background = 'transparent';
        }
    }

    // Attach listeners to customizer controls
    if (shotSlider) {
        sizeRadios.forEach(r => r.addEventListener('change', updateCustomizer));
        milkRadios.forEach(r => r.addEventListener('change', updateCustomizer));
        shotSlider.addEventListener('input', updateCustomizer);
        sweetSlider.addEventListener('input', updateCustomizer);
        toppingCheckboxes.forEach(c => c.addEventListener('change', updateCustomizer));

        // Trigger initial calculation
        updateCustomizer();

        // Customizer Add to Cart listener
        addCustomBtn.addEventListener('click', () => {
            const size = document.querySelector('input[name="size"]:checked').value;
            const milk = document.querySelector('input[name="milk"]:checked').value;
            const shots = shotSlider.value;
            const price = parseFloat(customPriceLabel.textContent.replace('Rs. ', ''));
            
            const title = `Custom Loop (${size.charAt(0).toUpperCase() + size.slice(1)})`;
            const meta = `${shots} Shot(s), ${milk !== 'none' ? milk + ' milk' : 'no milk'}`;
            
            addToCart(`custom-${Date.now()}`, title, price, 'assets/ambience_barista.png', meta);
        });
    }


    // ==========================================
    // 6. LIVE SHOPPING CART Drawer
    // ==========================================
    let cart = [];
    
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartTrigger = document.getElementById('cart-trigger');
    const cartClose = document.getElementById('cart-close');
    const cartItemsWrapper = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartFooter = document.getElementById('cart-footer');
    
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    
    const checkoutBtn = document.getElementById('checkout-btn');
    const emptyShopBtn = document.getElementById('cart-empty-shop-btn');
    const successModal = document.getElementById('success-modal');
    const successModalTitle = document.getElementById('success-modal-title');
    const successModalDesc = document.getElementById('success-modal-desc');
    const successModalClose = document.getElementById('success-modal-close');

    // Drawer triggers
    if (cartTrigger) {
        cartTrigger.addEventListener('click', () => {
            cartOverlay.classList.add('active');
            cartDrawer.classList.add('active');
        });
    }
    if (cartClose) {
        cartClose.addEventListener('click', () => {
            cartOverlay.classList.remove('active');
            cartDrawer.classList.remove('active');
        });
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cartOverlay.classList.remove('active');
            cartDrawer.classList.remove('active');
        });
    }
    if (emptyShopBtn) {
        emptyShopBtn.addEventListener('click', () => {
            cartOverlay.classList.remove('active');
            cartDrawer.classList.remove('active');
        });
    }

    // Add to Cart Logic
    function addToCart(id, title, price, image, meta = '') {
        // If it's a standard menu item, check if it's already in the cart
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem && !id.startsWith('custom-')) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                title,
                price,
                image,
                quantity: 1,
                meta
            });
        }
        
        renderCart();
        showToast(`Added ${title} to your order!`);
    }

    // Update Item Quantity
    function updateQty(itemId, amount) {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity += amount;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== itemId);
            }
            renderCart();
        }
    }

    // Remove Item from Cart
    function removeCartItem(itemId) {
        cart = cart.filter(i => i.id !== itemId);
        renderCart();
    }

    // Render Cart DOM Elements
    function renderCart() {
        if (!cartItemsWrapper) return;

        // Badge update
        const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItemsCount;
        
        if (cart.length === 0) {
            cartItemsWrapper.innerHTML = `
                <div class="empty-cart-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    <p>Your order is empty.</p>
                    <a href="#menu" class="btn btn-secondary btn-sm" id="cart-empty-shop-btn-dynamic">View Menu</a>
                </div>
            `;
            cartFooter.style.display = 'none';
            
            // Re-bind dynamic empty shop button
            const dynShopBtn = document.getElementById('cart-empty-shop-btn-dynamic');
            if (dynShopBtn) {
                dynShopBtn.addEventListener('click', () => {
                    cartOverlay.classList.remove('active');
                    cartDrawer.classList.remove('active');
                });
            }
            return;
        }

        cartItemsWrapper.innerHTML = '';
        cartFooter.style.display = 'block';

        let subtotalVal = 0;

        cart.forEach(item => {
            const cost = item.price * item.quantity;
            subtotalVal += cost;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    ${item.meta ? `<p class="cart-item-meta">${item.meta}</p>` : ''}
                    <div class="cart-item-price">Rs. ${item.price}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-selector">
                        <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="item-remove" data-id="${item.id}">Remove</button>
                </div>
            `;
            cartItemsWrapper.appendChild(div);
        });

        // Set totals
        const gstVal = subtotalVal * 0.13;
        const totalVal = subtotalVal + gstVal;

        cartSubtotal.textContent = `Rs. ${Math.round(subtotalVal)}`;
        cartTax.textContent = `Rs. ${Math.round(gstVal)}`;
        cartTotal.textContent = `Rs. ${Math.round(totalVal)}`;

        // Attach quantity buttons listeners
        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                updateQty(e.target.getAttribute('data-id'), -1);
            });
        });
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                updateQty(e.target.getAttribute('data-id'), 1);
            });
        });
        document.querySelectorAll('.item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeCartItem(e.target.getAttribute('data-id'));
            });
        });
    }

    // Toggle EasyPaisa details section in cart drawer
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const easypaisaInstructions = document.getElementById('easypaisa-instructions');
    const easypaisaTidField = document.getElementById('easypaisa-tid');

    if (paymentMethodRadios.length > 0 && easypaisaInstructions && easypaisaTidField) {
        paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'easypaisa') {
                    easypaisaInstructions.classList.add('active');
                } else {
                    easypaisaInstructions.classList.remove('active');
                    easypaisaTidField.value = ''; // clear input
                }
            });
        });
    }

    // Checkout Form Submission Simulation
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const originalBtnText = checkoutBtn.textContent;
            
            // Get selected payment method
            const selectedPaymentRadio = document.querySelector('input[name="payment-method"]:checked');
            const selectedPaymentMethod = selectedPaymentRadio ? selectedPaymentRadio.value : 'cod';
            let transactionId = '';
            let paymentStatus = 'cod';

            if (selectedPaymentMethod === 'easypaisa') {
                if (!easypaisaTidField) return;
                transactionId = easypaisaTidField.value.trim();

                if (!transactionId) {
                    showToast("Please enter your EasyPaisa Transaction ID (TID) to place the order.");
                    return;
                }

                // EasyPaisa TID validation: exactly 11 digits
                const tidRegex = /^\d{11}$/;
                if (!tidRegex.test(transactionId)) {
                    showToast("Invalid Transaction ID. EasyPaisa TID must be exactly 11 digits.");
                    return;
                }
                paymentStatus = 'pending_verification';
            }

            checkoutBtn.textContent = 'Processing Order...';
            checkoutBtn.disabled = true;

            // Formulate receipt order code
            const orderNum = 'LP-' + Math.floor(100000 + Math.random() * 900000);
            
            // Calculate totals before clearing the cart
            const subtotalVal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const gstVal = subtotalVal * 0.13;
            const totalVal = subtotalVal + gstVal;

            // Map cart items for Firebase
            const dbItems = cart.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                meta: item.meta || ''
            }));

            // 1. Save order to Firebase Firestore
            addDoc(collection(db, "orders"), {
                orderId: orderNum,
                items: dbItems,
                subtotal: subtotalVal,
                tax: gstVal,
                total: totalVal,
                timestamp: serverTimestamp(),
                status: 'pending',
                paymentMethod: selectedPaymentMethod,
                transactionId: transactionId,
                paymentStatus: paymentStatus
            })
            .then(docRef => {
                console.log("Order saved to database with ID: ", docRef.id);
                
                // Close Cart drawer
                cartOverlay.classList.remove('active');
                cartDrawer.classList.remove('active');

                // 2. Send email notification via Web3Forms (if access key is configured)
                if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== "YOUR_WEB3FORMS_ACCESS_KEY") {
                    const orderItemsText = cart.map(item => {
                        let text = `${item.title} (x${item.quantity}) - Rs. ${item.price * item.quantity}`;
                        if (item.meta) text += ` [Config: ${item.meta}]`;
                        return text;
                    }).join('\n');

                    fetch("https://api.web3forms.com/submit", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            access_key: WEB3FORMS_ACCESS_KEY,
                            subject: `New Loop Coffee Order: ${orderNum}`,
                            from_name: "Loop Coffee Website",
                            Order_ID: orderNum,
                            Items: orderItemsText,
                            Subtotal: `Rs. ${Math.round(subtotalVal)}`,
                            Tax: `Rs. ${Math.round(gstVal)}`,
                            Total_Amount: `Rs. ${Math.round(totalVal)}`,
                            Payment_Method: selectedPaymentMethod === 'easypaisa' ? 'EasyPaisa Online' : 'Cash on Delivery',
                            Transaction_ID: transactionId || 'N/A'
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            console.log("Order email notification sent successfully!");
                        } else {
                            console.warn("Failed to send order email:", data.message);
                        }
                    })
                    .catch(err => {
                        console.error("Error sending order email:", err);
                    });
                }

                // Reset payment methods
                const defaultRadio = document.querySelector('input[name="payment-method"][value="cod"]');
                if (defaultRadio) {
                    defaultRadio.checked = true;
                    // Trigger change event to hide details
                    defaultRadio.dispatchEvent(new Event('change'));
                }

                successModalTitle.textContent = "Order Placed Successfully!";
                successModalDesc.innerHTML = `
                    Thank you for ordering from Loop Coffee! Your order <strong>${orderNum}</strong> is being processed.<br><br>
                    Please pick up your order at the counter in 10-15 minutes. A copy of the receipt has been logged.
                `;
                successModal.classList.add('active');

                // Clear Cart
                cart = [];
                renderCart();
            })
            .catch(error => {
                console.error("Error saving order to database: ", error);
                showToast("Failed to place order. Database access error: " + error.message);
            })
            .finally(() => {
                checkoutBtn.textContent = originalBtnText;
                checkoutBtn.disabled = false;
            });
        });
    }


    // ==========================================
    // 7. GALLERY LIGHTBOX MODAL
    // ==========================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let activeImageIndex = 0;
    const galleryImagesData = Array.from(galleryItems).map(item => ({
        src: item.querySelector('img').getAttribute('src'),
        title: item.querySelector('h4').textContent,
        desc: item.querySelector('p').textContent
    }));

    function openLightbox(index) {
        activeImageIndex = index;
        const data = galleryImagesData[activeImageIndex];
        
        lightboxImg.setAttribute('src', data.src);
        lightboxCaption.textContent = `${data.title} — ${data.desc}`;
        lightbox.classList.add('active');
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-index'));
            openLightbox(index);
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    }
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            let nextIndex = activeImageIndex - 1;
            if (nextIndex < 0) nextIndex = galleryImagesData.length - 1;
            openLightbox(nextIndex);
        });
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            let nextIndex = activeImageIndex + 1;
            if (nextIndex >= galleryImagesData.length) nextIndex = 0;
            openLightbox(nextIndex);
        });
    }
    // Close on background click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }


    // ==========================================
    // 8. TESTIMONIALS SLIDER AUTOMATION
    // ==========================================
    const slides = document.querySelectorAll('.testimonials-slider .slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let index = currentSlide + 1;
        if (index >= slides.length) index = 0;
        goToSlide(index);
    }

    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 6000);
    }

    function resetSlideShow() {
        clearInterval(slideInterval);
        startSlideShow();
    }

    if (slides.length > 0) {
        startSlideShow();

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-slide'));
                goToSlide(index);
                resetSlideShow();
            });
        });
    }


    // ==========================================
    // 9. RESERVATION & NEWSLETTER FORM HANDLERS
    // ==========================================
    const resForm = document.getElementById('reservation-form');
    
    // Set minimum date picker values to today
    const dateInput = document.getElementById('res-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    if (resForm) {
        resForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = resForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Confirming Reservation...';
                submitBtn.disabled = true;
            }
            
            const name = document.getElementById('res-name').value;
            const email = document.getElementById('res-email').value;
            const date = document.getElementById('res-date').value;
            const timeSlot = document.getElementById('res-time').value;
            const guests = document.getElementById('res-guests').value;
            const areaVal = document.getElementById('res-seating');
            const areaText = areaVal.options[areaVal.selectedIndex].text;
            
            const reservationCode = 'RES-' + Math.floor(1000 + Math.random() * 9000);

            // Save reservation to Firebase Firestore
            addDoc(collection(db, "reservations"), {
                reservationCode: reservationCode,
                name: name,
                email: email,
                date: date,
                timeSlot: timeSlot,
                guests: guests,
                area: areaText,
                timestamp: serverTimestamp()
            })
            .then(docRef => {
                console.log("Reservation saved to database with ID: ", docRef.id);
                
                // Format reservation date nicely
                const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = new Date(date).toLocaleDateString(undefined, dateOptions);

                successModalTitle.textContent = "Reservation Confirmed";
                successModalDesc.innerHTML = `
                    Hello <strong>${name}</strong>,<br><br>
                    We have reserved a spot for <strong>${guests} ${guests === '1' ? 'person' : 'people'}</strong> at the <strong>${areaText}</strong>.<br><br>
                    See you on <strong>${formattedDate}</strong> at <strong>${timeSlot}</strong>.<br>
                    Confirmation Code: <strong>${reservationCode}</strong>.
                `;
                
                successModal.classList.add('active');
                resForm.reset();
            })
            .catch(error => {
                console.error("Error saving reservation: ", error);
                showToast("Failed to book table. Database access error: " + error.message);
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        });
    }

    // Success Modal Close
    if (successModalClose) {
        successModalClose.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
    }
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) successModal.classList.remove('active');
        });
    }

    // Newsletter form submit
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Subscribing...';
                submitBtn.disabled = true;
            }
            
            const email = newsletterForm.querySelector('input').value;
            
            // Save subscriber to Firebase Firestore
            addDoc(collection(db, "subscribers"), {
                email: email,
                timestamp: serverTimestamp()
            })
            .then(docRef => {
                console.log("Subscriber saved to database with ID: ", docRef.id);
                showToast(`Thank you! Roastery updates will be sent to: ${email}`);
                newsletterForm.reset();
            })
            .catch(error => {
                console.error("Error saving subscriber: ", error);
                showToast("Subscription failed. Database access error: " + error.message);
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        });
    }


    // ==========================================
    // 10. TOAST NOTIFICATION SYSTEM
    // ==========================================
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    let toastTimeout;

    function showToast(message) {
        if (!toast) return;
        
        toastMsg.textContent = message;
        toast.classList.add('active');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

});
