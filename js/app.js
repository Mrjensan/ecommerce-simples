// ===== ECOMMERCE APP - MAIN JAVASCRIPT =====

class EcommerceApp {
    constructor() {
        this.db = new EcommerceDatabase();
        this.cart = new Cart();
        this.currentPage = this.getCurrentPage();
        this.filters = {
            category: null,
            brand: null,
            priceMin: 0,
            priceMax: 5000,
            rating: null,
            search: ''
        };
        this.sortBy = 'featured';
        this.viewMode = 'grid';
        this.currentStep = 1;
        
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadPageContent();
        this.setupTheme();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('products.html')) return 'products';
        if (path.includes('cart.html')) return 'cart';
        if (path.includes('checkout.html')) return 'checkout';
        if (path.includes('admin.html')) return 'admin';
        return 'home';
    }

    initializeEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.setupMobileMenu();
            this.setupNotifications();
            this.updateCartCount();
        });

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filters.search = e.target.value;
                if (this.currentPage === 'products') {
                    this.filterProducts();
                } else {
                    this.handleGlobalSearch(e.target.value);
                }
            }, 300));
        }

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
    }

    loadPageContent() {
        switch (this.currentPage) {
            case 'home':
                this.initHomePage();
                break;
            case 'products':
                this.initProductsPage();
                break;
            case 'cart':
                this.initCartPage();
                break;
            case 'checkout':
                this.initCheckoutPage();
                break;
            case 'admin':
                this.initAdminPage();
                break;
        }
    }

    // ===== HOME PAGE FUNCTIONALITY =====
    initHomePage() {
        this.loadFeaturedProducts();
        this.setupProductCarousel();
        this.setupNewsletterForm();
        this.setupHeroAnimation();
    }

    loadFeaturedProducts() {
        const featuredContainer = document.querySelector('.featured-products .products-grid');
        if (!featuredContainer) return;

        const featuredProducts = this.db.getProducts().slice(0, 8);
        featuredContainer.innerHTML = featuredProducts.map(product => 
            this.createProductCard(product)
        ).join('');

        this.setupProductCardEvents(featuredContainer);
    }

    setupProductCarousel() {
        const heroProducts = document.querySelector('.hero-products');
        if (!heroProducts) return;

        const products = this.db.getProducts().slice(0, 3);
        let currentIndex = 0;

        const updateCarousel = () => {
            heroProducts.innerHTML = `
                <div class="hero-product-item active">
                    <img src="${products[currentIndex].image}" alt="${products[currentIndex].name}">
                    <div class="product-info">
                        <h3>${products[currentIndex].name}</h3>
                        <p class="price">R$ ${products[currentIndex].price.toFixed(2)}</p>
                    </div>
                </div>
            `;
            currentIndex = (currentIndex + 1) % products.length;
        };

        updateCarousel();
        setInterval(updateCarousel, 3000);
    }

    setupNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (!newsletterForm) return;

        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            
            if (this.validateEmail(email)) {
                this.showNotification('Obrigado! Você se inscreveu na nossa newsletter.', 'success');
                e.target.reset();
            } else {
                this.showNotification('Por favor, insira um email válido.', 'error');
            }
        });
    }

    setupHeroAnimation() {
        const heroText = document.querySelector('.hero-text');
        if (heroText) {
            heroText.classList.add('animate-fade-in');
        }
    }

    // ===== PRODUCTS PAGE FUNCTIONALITY =====
    initProductsPage() {
        this.loadProducts();
        this.setupFilters();
        this.setupSorting();
        this.setupViewToggle();
        this.setupPagination();
        this.updateBreadcrumb();
    }

    loadProducts() {
        const products = this.getFilteredProducts();
        const productsGrid = document.querySelector('.products-grid');
        const resultsCount = document.querySelector('.results-count');
        
        if (!productsGrid) return;

        if (products.length === 0) {
            this.showNoResults();
            return;
        }

        productsGrid.innerHTML = products.map(product => 
            this.createProductCard(product)
        ).join('');

        if (resultsCount) {
            resultsCount.textContent = `${products.length} produtos encontrados`;
        }

        this.setupProductCardEvents(productsGrid);
        this.updateActiveFilters();
    }

    getFilteredProducts() {
        let products = this.db.getProducts();

        // Apply filters
        if (this.filters.category) {
            products = products.filter(p => p.category === this.filters.category);
        }

        if (this.filters.brand) {
            products = products.filter(p => p.brand === this.filters.brand);
        }

        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.brand.toLowerCase().includes(searchLower)
            );
        }

        // Price range
        products = products.filter(p => 
            p.price >= this.filters.priceMin && p.price <= this.filters.priceMax
        );

        // Rating filter
        if (this.filters.rating) {
            products = products.filter(p => p.rating >= this.filters.rating);
        }

        // Apply sorting
        return this.sortProducts(products);
    }

    sortProducts(products) {
        switch (this.sortBy) {
            case 'price-asc':
                return products.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return products.sort((a, b) => b.price - a.price);
            case 'name':
                return products.sort((a, b) => a.name.localeCompare(b.name));
            case 'rating':
                return products.sort((a, b) => b.rating - a.rating);
            case 'newest':
                return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            default: // featured
                return products.sort((a, b) => b.featured - a.featured);
        }
    }

    setupFilters() {
        // Category filters
        document.querySelectorAll('.filter-option input[name="category"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.category = e.target.checked ? e.target.value : null;
                this.filterProducts();
            });
        });

        // Brand filters
        document.querySelectorAll('.filter-option input[name="brand"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.brand = e.target.checked ? e.target.value : null;
                this.filterProducts();
            });
        });

        // Price range
        const priceMin = document.querySelector('#price-min');
        const priceMax = document.querySelector('#price-max');
        const priceSlider = document.querySelector('#price-slider');

        if (priceMin && priceMax) {
            priceMin.addEventListener('input', this.debounce(() => {
                this.filters.priceMin = parseInt(priceMin.value) || 0;
                this.filterProducts();
                this.updatePriceDisplay();
            }, 500));

            priceMax.addEventListener('input', this.debounce(() => {
                this.filters.priceMax = parseInt(priceMax.value) || 5000;
                this.filterProducts();
                this.updatePriceDisplay();
            }, 500));
        }

        // Rating filters
        document.querySelectorAll('input[name="rating"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.rating = e.target.checked ? parseInt(e.target.value) : null;
                this.filterProducts();
            });
        });

        // Clear filters
        const clearFilters = document.querySelector('.clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', this.clearAllFilters.bind(this));
        }
    }

    setupSorting() {
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.filterProducts();
            });
        }
    }

    setupViewToggle() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.view-btn.active')?.classList.remove('active');
                e.target.classList.add('active');
                
                this.viewMode = e.target.dataset.view;
                const productsGrid = document.querySelector('.products-grid');
                
                if (this.viewMode === 'list') {
                    productsGrid.classList.add('list-view');
                } else {
                    productsGrid.classList.remove('list-view');
                }
            });
        });
    }

    filterProducts() {
        this.loadProducts();
    }

    clearAllFilters() {
        this.filters = {
            category: null,
            brand: null,
            priceMin: 0,
            priceMax: 5000,
            rating: null,
            search: ''
        };

        // Reset form elements
        document.querySelectorAll('.filter-option input').forEach(input => {
            input.checked = false;
        });

        const priceMin = document.querySelector('#price-min');
        const priceMax = document.querySelector('#price-max');
        if (priceMin) priceMin.value = 0;
        if (priceMax) priceMax.value = 5000;

        this.updatePriceDisplay();
        this.filterProducts();
    }

    updatePriceDisplay() {
        const priceDisplay = document.querySelector('.price-display');
        if (priceDisplay) {
            priceDisplay.textContent = `R$ ${this.filters.priceMin} - R$ ${this.filters.priceMax}`;
        }
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.querySelector('.active-filters');
        if (!activeFiltersContainer) return;

        const activeFilters = [];

        if (this.filters.category) {
            activeFilters.push({ type: 'category', value: this.filters.category, label: this.filters.category });
        }
        
        if (this.filters.brand) {
            activeFilters.push({ type: 'brand', value: this.filters.brand, label: this.filters.brand });
        }
        
        if (this.filters.rating) {
            activeFilters.push({ type: 'rating', value: this.filters.rating, label: `${this.filters.rating}+ estrelas` });
        }

        if (this.filters.search) {
            activeFilters.push({ type: 'search', value: this.filters.search, label: `"${this.filters.search}"` });
        }

        activeFiltersContainer.innerHTML = activeFilters.map(filter => `
            <span class="active-filter">
                ${filter.label}
                <button class="remove-filter" data-type="${filter.type}" data-value="${filter.value}">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');

        // Setup remove filter events
        document.querySelectorAll('.remove-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.closest('.remove-filter').dataset.type;
                this.removeFilter(type);
            });
        });
    }

    removeFilter(type) {
        switch (type) {
            case 'category':
                this.filters.category = null;
                document.querySelector('input[name="category"]:checked')?.click();
                break;
            case 'brand':
                this.filters.brand = null;
                document.querySelector('input[name="brand"]:checked')?.click();
                break;
            case 'rating':
                this.filters.rating = null;
                document.querySelector('input[name="rating"]:checked').checked = false;
                break;
            case 'search':
                this.filters.search = '';
                const searchInput = document.querySelector('.search-input');
                if (searchInput) searchInput.value = '';
                break;
        }
        this.filterProducts();
    }

    showNoResults() {
        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente ajustar os filtros ou fazer uma nova busca.</p>
                    <button class="btn btn-primary clear-filters">Limpar Filtros</button>
                </div>
            `;

            // Setup clear filters button
            document.querySelector('.no-results .clear-filters')
                ?.addEventListener('click', this.clearAllFilters.bind(this));
        }
    }

    // ===== PRODUCT CARD FUNCTIONALITY =====
    createProductCard(product) {
        const discountPercent = product.originalPrice ? 
            Math.round((1 - product.price / product.originalPrice) * 100) : 0;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    ${product.stock <= 5 ? '<span class="stock-badge">Últimas unidades</span>' : ''}
                    ${discountPercent > 0 ? `<span class="discount-badge">-${discountPercent}%</span>` : ''}
                    <div class="product-actions">
                        <button class="btn-icon quick-view" title="Visualização rápida" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon add-to-wishlist" title="Adicionar aos favoritos" data-product-id="${product.id}">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="btn-icon add-to-compare" title="Comparar" data-product-id="${product.id}">
                            <i class="fas fa-balance-scale"></i>
                        </button>
                    </div>
                </div>
                <div class="product-content">
                    <div class="product-rating">
                        <div class="stars">
                            ${this.createStarsHTML(product.rating)}
                        </div>
                        <span class="rating-text">(${product.reviews || 0})</span>
                    </div>
                    <h3 class="product-name">
                        <a href="product-details.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <p class="product-brand">${product.brand}</p>
                    <div class="product-pricing">
                        ${product.originalPrice ? `<span class="original-price">R$ ${product.originalPrice.toFixed(2)}</span>` : ''}
                        <span class="current-price">R$ ${product.price.toFixed(2)}</span>
                    </div>
                    <div class="product-features">
                        ${product.features?.slice(0, 2).map(feature => `<span class="feature">${feature}</span>`).join('') || ''}
                    </div>
                    <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
    }

    createStarsHTML(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    }

    setupProductCardEvents(container) {
        // Add to cart buttons
        container.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(e.target.closest('.add-to-cart').dataset.productId);
                this.addToCart(productId);
            });
        });

        // Quick view buttons
        container.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.quick-view').dataset.productId);
                this.showQuickView(productId);
            });
        });

        // Wishlist buttons
        container.querySelectorAll('.add-to-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.add-to-wishlist').dataset.productId);
                this.toggleWishlist(productId, e.target);
            });
        });
    }

    // ===== CART FUNCTIONALITY =====
    addToCart(productId, quantity = 1) {
        const product = this.db.getProductById(productId);
        if (!product) return;

        if (product.stock < quantity) {
            this.showNotification('Produto sem estoque suficiente.', 'error');
            return;
        }

        this.cart.addItem(product, quantity);
        this.updateCartCount();
        this.showNotification(`${product.name} adicionado ao carrinho!`, 'success');
        
        // Update button state
        const button = document.querySelector(`[data-product-id="${productId}"].add-to-cart`);
        if (button) {
            button.innerHTML = '<i class="fas fa-check"></i> Adicionado';
            button.classList.add('added');
            
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho';
                button.classList.remove('added');
            }, 2000);
        }
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.cart.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // ===== UTILITY FUNCTIONS =====
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
                mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
            });
        }
    }

    setupNotifications() {
        // Setup notification permissions if supported
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                // Notification.requestPermission();
            }
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    handleGlobalSearch(query) {
        if (query.length < 2) return;
        
        // Redirect to products page with search
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }

    showQuickView(productId) {
        const product = this.db.getProductById(productId);
        if (!product) return;

        // Implementation for quick view modal would go here
        console.log('Quick view for product:', product);
    }

    toggleWishlist(productId, button) {
        const icon = button.querySelector('i');
        const isInWishlist = icon.classList.contains('fas');

        if (isInWishlist) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.showNotification('Removido dos favoritos', 'info');
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.showNotification('Adicionado aos favoritos', 'success');
        }

        // Here you would save to localStorage or send to server
    }

    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb && this.filters.category) {
            const categorySpan = breadcrumb.querySelector('.category-name');
            if (categorySpan) {
                categorySpan.textContent = this.filters.category;
            }
        }
    }

    setupPagination() {
        const loadMoreBtn = document.querySelector('.load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                // Implementation for load more functionality
                this.showNotification('Carregando mais produtos...', 'info');
            });
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ecommerceApp = new EcommerceApp();
});