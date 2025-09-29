// ===== UTILITY FUNCTIONS AND ENHANCEMENTS =====

// Enhanced product search and filtering
class ProductSearch {
    constructor(products) {
        this.products = products;
        this.searchHistory = this.loadSearchHistory();
    }

    search(query, filters = {}) {
        let results = this.products;

        // Text search
        if (query && query.length >= 2) {
            const searchLower = query.toLowerCase();
            results = results.filter(product => 
                product.name.toLowerCase().includes(searchLower) ||
                product.description.toLowerCase().includes(searchLower) ||
                product.brand.toLowerCase().includes(searchLower) ||
                product.category.toLowerCase().includes(searchLower) ||
                (product.features && product.features.some(feature => 
                    feature.toLowerCase().includes(searchLower)
                ))
            );
            
            this.saveSearchTerm(query);
        }

        // Apply filters
        if (filters.category) {
            results = results.filter(p => p.category === filters.category);
        }
        if (filters.brand) {
            results = results.filter(p => p.brand === filters.brand);
        }
        if (filters.priceMin !== undefined) {
            results = results.filter(p => p.price >= filters.priceMin);
        }
        if (filters.priceMax !== undefined) {
            results = results.filter(p => p.price <= filters.priceMax);
        }
        if (filters.rating) {
            results = results.filter(p => p.rating >= filters.rating);
        }
        if (filters.inStock) {
            results = results.filter(p => p.stock > 0);
        }

        return this.sortResults(results, filters.sortBy || 'relevance', query);
    }

    sortResults(products, sortBy, query = '') {
        switch (sortBy) {
            case 'relevance':
                return this.sortByRelevance(products, query);
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
            case 'bestseller':
                return products.sort((a, b) => (b.sales || 0) - (a.sales || 0));
            default:
                return products;
        }
    }

    sortByRelevance(products, query) {
        if (!query) return products;

        const queryLower = query.toLowerCase();
        
        return products.map(product => ({
            ...product,
            relevanceScore: this.calculateRelevance(product, queryLower)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .map(({ relevanceScore, ...product }) => product);
    }

    calculateRelevance(product, query) {
        let score = 0;
        
        // Exact name match (highest priority)
        if (product.name.toLowerCase() === query) score += 100;
        
        // Name starts with query
        if (product.name.toLowerCase().startsWith(query)) score += 50;
        
        // Name contains query
        if (product.name.toLowerCase().includes(query)) score += 25;
        
        // Brand match
        if (product.brand.toLowerCase().includes(query)) score += 15;
        
        // Category match
        if (product.category.toLowerCase().includes(query)) score += 10;
        
        // Description match
        if (product.description.toLowerCase().includes(query)) score += 5;
        
        // Features match
        if (product.features) {
            product.features.forEach(feature => {
                if (feature.toLowerCase().includes(query)) score += 3;
            });
        }
        
        // Boost by rating
        score += product.rating * 2;
        
        // Boost if in stock
        if (product.stock > 0) score += 5;
        
        return score;
    }

    getSearchSuggestions(query, limit = 5) {
        if (!query || query.length < 2) return [];

        const queryLower = query.toLowerCase();
        const suggestions = new Set();

        // Product names
        this.products.forEach(product => {
            if (product.name.toLowerCase().includes(queryLower)) {
                suggestions.add(product.name);
            }
            
            // Brands
            if (product.brand.toLowerCase().includes(queryLower)) {
                suggestions.add(product.brand);
            }
        });

        // Search history
        this.searchHistory.forEach(term => {
            if (term.toLowerCase().includes(queryLower)) {
                suggestions.add(term);
            }
        });

        return Array.from(suggestions).slice(0, limit);
    }

    saveSearchTerm(term) {
        if (!term || term.length < 2) return;
        
        this.searchHistory = this.searchHistory.filter(t => t !== term);
        this.searchHistory.unshift(term);
        this.searchHistory = this.searchHistory.slice(0, 10); // Keep only 10 recent searches
        
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }

    loadSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('searchHistory') || '[]');
        } catch {
            return [];
        }
    }

    getPopularSearches() {
        return [
            'iPhone', 'Samsung', 'Notebook', 'Gaming', 'Wireless',
            'Pro Max', 'MacBook', 'Tablet', 'Headphone', 'Charger'
        ];
    }
}

// Advanced form validation
class FormValidator {
    constructor(form) {
        this.form = form;
        this.rules = {};
        this.messages = {
            required: 'Este campo é obrigatório',
            email: 'Digite um email válido',
            minLength: 'Mínimo de {min} caracteres',
            maxLength: 'Máximo de {max} caracteres',
            pattern: 'Formato inválido',
            confirm: 'Os campos não coincidem',
            custom: 'Valor inválido'
        };
    }

    addRule(fieldName, rules) {
        this.rules[fieldName] = rules;
        return this;
    }

    validate() {
        const formData = new FormData(this.form);
        const errors = {};
        let isValid = true;

        for (const [fieldName, rules] of Object.entries(this.rules)) {
            const value = formData.get(fieldName) || '';
            const fieldErrors = this.validateField(fieldName, value, formData);
            
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
                isValid = false;
            }
        }

        this.displayErrors(errors);
        return isValid;
    }

    validateField(fieldName, value, formData) {
        const rules = this.rules[fieldName];
        const errors = [];

        if (rules.required && !value.trim()) {
            errors.push(this.messages.required);
            return errors; // Don't check other rules if required fails
        }

        if (value.trim()) { // Only validate if value is present
            if (rules.email && !this.isValidEmail(value)) {
                errors.push(this.messages.email);
            }

            if (rules.minLength && value.length < rules.minLength) {
                errors.push(this.messages.minLength.replace('{min}', rules.minLength));
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(this.messages.maxLength.replace('{max}', rules.maxLength));
            }

            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(rules.message || this.messages.pattern);
            }

            if (rules.confirm) {
                const confirmValue = formData.get(rules.confirm) || '';
                if (value !== confirmValue) {
                    errors.push(this.messages.confirm);
                }
            }

            if (rules.custom && !rules.custom(value, formData)) {
                errors.push(rules.message || this.messages.custom);
            }
        }

        return errors;
    }

    displayErrors(errors) {
        // Clear previous errors
        this.form.querySelectorAll('.field-error').forEach(el => el.remove());
        this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Display new errors
        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.textContent = fieldErrors[0]; // Show first error
                
                field.parentNode.appendChild(errorDiv);
            }
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTimes = {};
    }

    start(label) {
        this.startTimes[label] = performance.now();
    }

    end(label) {
        if (this.startTimes[label]) {
            const duration = performance.now() - this.startTimes[label];
            this.metrics[label] = (this.metrics[label] || []);
            this.metrics[label].push(duration);
            delete this.startTimes[label];
            return duration;
        }
        return 0;
    }

    getAverage(label) {
        const values = this.metrics[label];
        if (!values || values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    getMetrics() {
        const result = {};
        for (const [label, values] of Object.entries(this.metrics)) {
            result[label] = {
                count: values.length,
                average: this.getAverage(label),
                min: Math.min(...values),
                max: Math.max(...values),
                total: values.reduce((a, b) => a + b, 0)
            };
        }
        return result;
    }

    logMetrics() {
        console.table(this.getMetrics());
    }
}

// Image lazy loading
class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px',
            threshold: 0.1,
            ...options
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.options
        );
        
        this.init();
    }

    init() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.observer.observe(img));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        }
    }

    observe(element) {
        this.observer.observe(element);
    }
}

// Local storage management
class StorageManager {
    constructor(prefix = 'ecommerce_') {
        this.prefix = prefix;
    }

    set(key, value, expiry = null) {
        try {
            const item = {
                value: value,
                timestamp: Date.now(),
                expiry: expiry
            };
            localStorage.setItem(this.prefix + key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            
            // Check expiry
            if (parsed.expiry && Date.now() > parsed.expiry) {
                this.remove(key);
                return defaultValue;
            }

            return parsed.value;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    getSize() {
        let size = 0;
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                size += localStorage.getItem(key).length;
            }
        });
        return size;
    }
}

// Animation utilities
class AnimationUtils {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    }

    static slideDown(element, duration = 300) {
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight + 'px';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentHeight = progress * element.scrollHeight;
            element.style.height = currentHeight + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    }

    static pulse(element, duration = 1000) {
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = (elapsed % duration) / duration;
            
            const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.05;
            element.style.transform = `scale(${scale})`;
            
            if (elapsed < duration * 3) { // Pulse 3 times
                requestAnimationFrame(animate);
            } else {
                element.style.transform = '';
            }
        }
        
        requestAnimationFrame(animate);
    }
}

// Export utilities for global use
window.EcommerceUtils = {
    ProductSearch,
    FormValidator,
    PerformanceMonitor,
    LazyLoader,
    StorageManager,
    AnimationUtils
};