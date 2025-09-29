// ===== SHOPPING CART CLASS =====

class Cart {
    constructor() {
        this.items = this.loadFromStorage();
        this.coupons = {
            'WELCOME10': { discount: 0.10, type: 'percentage', minValue: 100 },
            'SAVE20': { discount: 0.20, type: 'percentage', minValue: 200 },
            'FRETE15': { discount: 15, type: 'fixed', minValue: 50 },
            'PRIMEIRA50': { discount: 50, type: 'fixed', minValue: 150 }
        };
        this.appliedCoupon = null;
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                brand: product.brand,
                stock: product.stock,
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        this.updateCartUI();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else if (quantity <= item.stock) {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateCartUI();
            }
        }
    }

    getItems() {
        return this.items;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getDiscount() {
        if (!this.appliedCoupon) return 0;
        
        const coupon = this.coupons[this.appliedCoupon];
        const subtotal = this.getSubtotal();
        
        if (subtotal < coupon.minValue) return 0;
        
        if (coupon.type === 'percentage') {
            return subtotal * coupon.discount;
        } else {
            return coupon.discount;
        }
    }

    getShipping() {
        const subtotal = this.getSubtotal();
        return subtotal >= 200 ? 0 : 15; // Free shipping over R$ 200
    }

    getTotal() {
        return this.getSubtotal() - this.getDiscount() + this.getShipping();
    }

    applyCoupon(couponCode) {
        const coupon = this.coupons[couponCode.toUpperCase()];
        
        if (!coupon) {
            throw new Error('Cupom inválido');
        }
        
        if (this.getSubtotal() < coupon.minValue) {
            throw new Error(`Valor mínimo de R$ ${coupon.minValue.toFixed(2)} para este cupom`);
        }
        
        this.appliedCoupon = couponCode.toUpperCase();
        this.saveToStorage();
        return true;
    }

    removeCoupon() {
        this.appliedCoupon = null;
        this.saveToStorage();
    }

    clear() {
        this.items = [];
        this.appliedCoupon = null;
        this.saveToStorage();
        this.updateCartUI();
    }

    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify({
            items: this.items,
            appliedCoupon: this.appliedCoupon
        }));
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('cart');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.appliedCoupon = parsed.appliedCoupon || null;
                return parsed.items || [];
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
        }
        return [];
    }

    updateCartUI() {
        // Update cart count in header
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartPage();
        }
    }

    renderCartPage() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartSummary = document.querySelector('.cart-summary-card');
        
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            this.showEmptyCart();
            return;
        }

        // Render cart items
        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.brand}</p>
                    ${item.originalPrice && item.originalPrice > item.price ? 
                        `<span class="original-price">R$ ${item.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="cart-item-price">
                    R$ ${item.price.toFixed(2)}
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-product-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           min="1" max="${item.stock}" data-product-id="${item.id}">
                    <button class="quantity-btn increase" data-product-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item-btn" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Setup cart item events
        this.setupCartItemEvents();

        // Render cart summary
        this.renderCartSummary();
    }

    setupCartItemEvents() {
        // Quantity decrease buttons
        document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.quantity-btn').dataset.productId);
                const item = this.items.find(item => item.id === productId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });

        // Quantity increase buttons
        document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.quantity-btn').dataset.productId);
                const item = this.items.find(item => item.id === productId);
                if (item && item.quantity < item.stock) {
                    this.updateQuantity(productId, item.quantity + 1);
                } else if (item && item.quantity >= item.stock) {
                    window.ecommerceApp.showNotification('Estoque máximo atingido', 'warning');
                }
            });
        });

        // Quantity input direct change
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const quantity = parseInt(e.target.value);
                const item = this.items.find(item => item.id === productId);
                
                if (item && quantity > 0 && quantity <= item.stock) {
                    this.updateQuantity(productId, quantity);
                } else {
                    e.target.value = item ? item.quantity : 1;
                    if (quantity > item.stock) {
                        window.ecommerceApp.showNotification('Quantidade maior que o estoque disponível', 'error');
                    }
                }
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.remove-item-btn').dataset.productId);
                const item = this.items.find(item => item.id === productId);
                
                if (confirm(`Remover ${item?.name} do carrinho?`)) {
                    this.removeItem(productId);
                    window.ecommerceApp.showNotification('Item removido do carrinho', 'info');
                }
            });
        });
    }

    renderCartSummary() {
        const summaryContent = document.querySelector('.summary-content');
        if (!summaryContent) return;

        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        const shipping = this.getShipping();
        const total = this.getTotal();

        summaryContent.innerHTML = `
            <div class="summary-row">
                <span>Subtotal (${this.getTotalItems()} ${this.getTotalItems() === 1 ? 'item' : 'itens'})</span>
                <span>R$ ${subtotal.toFixed(2)}</span>
            </div>
            
            ${discount > 0 ? `
                <div class="summary-row">
                    <span>Desconto (${this.appliedCoupon})</span>
                    <span class="discount-value">-R$ ${discount.toFixed(2)}</span>
                </div>
            ` : ''}
            
            <div class="summary-row">
                <span>Frete ${shipping === 0 ? '(Grátis)' : ''}</span>
                <span>${shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
            </div>
            
            <div class="summary-divider"></div>
            
            <div class="summary-row total-row">
                <span>Total</span>
                <span>R$ ${total.toFixed(2)}</span>
            </div>
            
            ${subtotal < 200 ? `
                <small class="shipping-info">
                    Adicione mais R$ ${(200 - subtotal).toFixed(2)} e ganhe frete grátis!
                </small>
            ` : ''}
        `;

        // Setup coupon form
        this.setupCouponForm();
        
        // Update checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.items.length === 0;
        }
    }

    setupCouponForm() {
        const couponForm = document.querySelector('.coupon-form');
        const appliedCouponDiv = document.querySelector('.applied-coupon');
        
        if (!couponForm) return;

        // Show/hide coupon form based on applied coupon
        if (this.appliedCoupon) {
            couponForm.style.display = 'none';
            if (appliedCouponDiv) {
                appliedCouponDiv.style.display = 'flex';
                appliedCouponDiv.innerHTML = `
                    <span><i class="fas fa-tag"></i> ${this.appliedCoupon} aplicado</span>
                    <button class="remove-coupon">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Remove coupon event
                appliedCouponDiv.querySelector('.remove-coupon').addEventListener('click', () => {
                    this.removeCoupon();
                    this.renderCartSummary();
                    window.ecommerceApp.showNotification('Cupom removido', 'info');
                });
            }
        } else {
            couponForm.style.display = 'flex';
            if (appliedCouponDiv) appliedCouponDiv.style.display = 'none';
        }

        // Coupon form submission
        couponForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const couponInput = couponForm.querySelector('input');
            const couponCode = couponInput.value.trim();
            
            if (!couponCode) return;
            
            try {
                this.applyCoupon(couponCode);
                this.renderCartSummary();
                couponInput.value = '';
                window.ecommerceApp.showNotification('Cupom aplicado com sucesso!', 'success');
            } catch (error) {
                window.ecommerceApp.showNotification(error.message, 'error');
            }
        });
    }

    showEmptyCart() {
        const cartContent = document.querySelector('.cart-content');
        if (cartContent) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Seu carrinho está vazio</h2>
                    <p>Adicione produtos e eles aparecerão aqui</p>
                    <a href="products.html" class="btn btn-primary">
                        <i class="fas fa-arrow-left"></i>
                        Continuar Comprando
                    </a>
                </div>
            `;
        }

        // Hide cart summary
        const cartSummary = document.querySelector('.cart-summary-card');
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
    }

    // Get cart data for checkout
    getCartData() {
        return {
            items: this.items,
            subtotal: this.getSubtotal(),
            discount: this.getDiscount(),
            shipping: this.getShipping(),
            total: this.getTotal(),
            appliedCoupon: this.appliedCoupon,
            totalItems: this.getTotalItems()
        };
    }
}