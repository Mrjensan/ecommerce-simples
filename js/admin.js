// ===== ADMIN DASHBOARD FUNCTIONALITY =====

class AdminDashboard {
    constructor() {
        this.db = new EcommerceDatabase();
        this.currentSection = 'dashboard';
        this.isMobileMenuOpen = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMobileMenu();
        this.loadDashboardData();
        this.setupNotifications();
        this.renderCharts();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        this.isMobileMenuOpen = false;
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    showSection(sectionName) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Produtos',
            'orders': 'Pedidos',
            'customers': 'Clientes',
            'analytics': 'Analytics',
            'settings': 'Configurações'
        };

        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
        }

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.querySelector(`#${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Load section-specific data
        this.loadSectionData(sectionName);
        
        // Close mobile menu if open
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                this.renderCharts();
                break;
            case 'products':
                this.loadProductsData();
                break;
            case 'orders':
                this.loadOrdersData();
                break;
            case 'customers':
                this.loadCustomersData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
        }
    }

    loadDashboardData() {
        const stats = this.db.getAnalytics();
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            // Revenue
            statCards[0].querySelector('.stat-value').textContent = `R$ ${stats.totalRevenue.toFixed(2)}`;
            statCards[0].querySelector('.stat-change').textContent = '+12.5%';
            
            // Orders
            statCards[1].querySelector('.stat-value').textContent = stats.totalOrders;
            statCards[1].querySelector('.stat-change').textContent = '+8.2%';
            
            // Products
            statCards[2].querySelector('.stat-value').textContent = this.db.getProducts().length;
            statCards[2].querySelector('.stat-change').textContent = '+2.1%';
            
            // Customers
            statCards[3].querySelector('.stat-value').textContent = stats.totalCustomers;
            statCards[3].querySelector('.stat-change').textContent = '+15.3%';
        }

        // Load recent orders widget
        this.loadRecentOrders();
        
        // Load top products widget
        this.loadTopProducts();
    }

    loadRecentOrders() {
        const recentOrdersWidget = document.querySelector('#recent-orders .widget-content');
        if (!recentOrdersWidget) return;

        const orders = this.db.getOrders().slice(0, 5);
        
        recentOrdersWidget.innerHTML = `
            <div class="orders-list">
                ${orders.map(order => `
                    <div class="order-item">
                        <div class="order-info">
                            <div class="order-id">#${order.id}</div>
                            <div class="order-customer">${order.customerName}</div>
                            <div class="order-date">${new Date(order.date).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div class="order-status">
                            <span class="status-badge ${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span>
                        </div>
                        <div class="order-total">R$ ${order.total.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadTopProducts() {
        const topProductsWidget = document.querySelector('#top-products .widget-content');
        if (!topProductsWidget) return;

        const products = this.db.getProducts().slice(0, 5);
        
        topProductsWidget.innerHTML = `
            <div class="products-list">
                ${products.map(product => `
                    <div class="product-item">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-sales">142 vendas</div>
                        </div>
                        <div class="product-revenue">R$ ${(product.price * 142).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadProductsData() {
        const products = this.db.getProducts();
        const tableBody = document.querySelector('#products-table tbody');
        
        if (!tableBody) return;

        tableBody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <div class="product-cell">
                        <img src="${product.image}" alt="${product.name}" class="product-thumb">
                        <div>
                            <div class="product-name">${product.name}</div>
                            <div class="product-sku">SKU: ${product.id.toString().padStart(6, '0')}</div>
                        </div>
                    </div>
                </td>
                <td>${product.category}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>
                    <span class="stock-badge ${product.stock <= 5 ? 'low' : 'normal'}">
                        ${product.stock} un.
                    </span>
                </td>
                <td>
                    <span class="status-badge ${product.status || 'active'}">${product.status || 'Ativo'}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit-product" data-id="${product.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-product" data-id="${product.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Setup product action buttons
        this.setupProductActions();
    }

    loadOrdersData() {
        const orders = this.db.getOrders();
        const tableBody = document.querySelector('#orders-table tbody');
        
        if (!tableBody) return;

        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>${new Date(order.date).toLocaleDateString('pt-BR')}</td>
                <td>
                    <span class="status-badge ${order.status.toLowerCase().replace(' ', '-')}">
                        ${order.status}
                    </span>
                </td>
                <td>R$ ${order.total.toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-order" data-id="${order.id}" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-order" data-id="${order.id}" title="Editar Status">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.setupOrderActions();
    }

    loadCustomersData() {
        const customers = this.db.getCustomers();
        const tableBody = document.querySelector('#customers-table tbody');
        
        if (!tableBody) return;

        tableBody.innerHTML = customers.map(customer => `
            <tr>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">
                            ${customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="customer-name">${customer.name}</div>
                            <div class="customer-email">${customer.email}</div>
                        </div>
                    </div>
                </td>
                <td>${customer.totalOrders}</td>
                <td>R$ ${customer.totalSpent.toFixed(2)}</td>
                <td>${new Date(customer.lastOrder).toLocaleDateString('pt-BR')}</td>
                <td>
                    <span class="status-badge ${customer.status}">
                        ${customer.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-customer" data-id="${customer.id}" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-customer" data-id="${customer.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupProductActions() {
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.edit-product').dataset.id;
                this.showEditProductModal(productId);
            });
        });

        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.delete-product').dataset.id;
                this.deleteProduct(productId);
            });
        });
    }

    setupOrderActions() {
        document.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.view-order').dataset.id;
                this.showOrderDetails(orderId);
            });
        });

        document.querySelectorAll('.edit-order').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.edit-order').dataset.id;
                this.showEditOrderModal(orderId);
            });
        });
    }

    setupNotifications() {
        const notificationsBtn = document.querySelector('.notifications-btn');
        const notificationsPanel = document.querySelector('.notifications-panel');
        
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationsPanel?.classList.toggle('show');
            });
        }

        // Mark all as read
        const markAllRead = document.querySelector('.mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                document.querySelectorAll('.notification-item').forEach(item => {
                    item.classList.add('read');
                });
                this.updateNotificationCount(0);
            });
        }

        // Close notifications when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationsPanel?.contains(e.target) && 
                !notificationsBtn?.contains(e.target)) {
                notificationsPanel?.classList.remove('show');
            }
        });
    }

    updateNotificationCount(count) {
        const notificationCount = document.querySelector('.notification-count');
        if (notificationCount) {
            if (count > 0) {
                notificationCount.textContent = count;
                notificationCount.style.display = 'flex';
            } else {
                notificationCount.style.display = 'none';
            }
        }
    }

    renderCharts() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            // Load Chart.js dynamically
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.initCharts();
            document.head.appendChild(script);
        } else {
            this.initCharts();
        }
    }

    initCharts() {
        this.renderSalesChart();
        this.renderTopCategoriesChart();
    }

    renderSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Vendas',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    renderTopCategoriesChart() {
        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Smartphones', 'Notebooks', 'Tablets', 'Acessórios', 'Outros'],
                datasets: [{
                    data: [35, 25, 15, 15, 10],
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Modal functions
    showEditProductModal(productId) {
        const product = this.db.getProductById(parseInt(productId));
        if (!product) return;

        const modal = this.createModal('Editar Produto', `
            <form id="edit-product-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nome do Produto</label>
                        <input type="text" name="name" value="${product.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Preço</label>
                        <input type="number" name="price" value="${product.price}" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Categoria</label>
                        <select name="category" required>
                            <option value="Smartphones" ${product.category === 'Smartphones' ? 'selected' : ''}>Smartphones</option>
                            <option value="Notebooks" ${product.category === 'Notebooks' ? 'selected' : ''}>Notebooks</option>
                            <option value="Tablets" ${product.category === 'Tablets' ? 'selected' : ''}>Tablets</option>
                            <option value="Acessórios" ${product.category === 'Acessórios' ? 'selected' : ''}>Acessórios</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estoque</label>
                        <input type="number" name="stock" value="${product.stock}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea name="description" rows="3">${product.description}</textarea>
                </div>
            </form>
        `);

        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct(productId, new FormData(e.target));
            this.closeModal();
        });
    }

    saveProduct(productId, formData) {
        // In a real app, this would call an API
        console.log('Saving product:', productId, Object.fromEntries(formData));
        this.showNotification('Produto atualizado com sucesso!', 'success');
        this.loadProductsData(); // Refresh the table
    }

    deleteProduct(productId) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            // In a real app, this would call an API
            console.log('Deleting product:', productId);
            this.showNotification('Produto excluído com sucesso!', 'success');
            this.loadProductsData(); // Refresh the table
        }
    }

    showOrderDetails(orderId) {
        const order = this.db.getOrders().find(o => o.id == orderId);
        if (!order) return;

        const modal = this.createModal(`Pedido #${order.id}`, `
            <div class="order-details">
                <div class="order-header">
                    <div class="order-status">
                        <span class="status-badge ${order.status.toLowerCase().replace(' ', '-')}">
                            ${order.status}
                        </span>
                    </div>
                    <div class="order-date">
                        Data: ${new Date(order.date).toLocaleDateString('pt-BR')}
                    </div>
                </div>
                
                <div class="customer-info">
                    <h4>Cliente</h4>
                    <p><strong>Nome:</strong> ${order.customerName}</p>
                    <p><strong>Email:</strong> ${order.customerEmail}</p>
                    <p><strong>Telefone:</strong> ${order.customerPhone}</p>
                </div>
                
                <div class="order-items">
                    <h4>Itens do Pedido</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name}</span>
                            <span>${item.quantity}x R$ ${item.price.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-total">
                    <h4>Total: R$ ${order.total.toFixed(2)}</h4>
                </div>
            </div>
        `, 'large');
    }

    createModal(title, content, size = '') {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content ${size}">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary save-modal">Salvar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup close events
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    }

    showNotification(message, type = 'info') {
        // Reuse the notification system from the main app
        if (window.ecommerceApp) {
            window.ecommerceApp.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        window.adminDashboard = new AdminDashboard();
        
        // Load Chart.js for analytics
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js';
        document.head.appendChild(chartScript);
    }
});