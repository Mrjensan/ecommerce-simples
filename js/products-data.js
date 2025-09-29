// Banco de dados simulado do e-commerce
class EcommerceDatabase {
  constructor() {
    this.initializeDatabase();
  }

  // Inicializar banco de dados com dados de exemplo
  initializeDatabase() {
    // Produtos
    if (!localStorage.getItem('ecommerce_products')) {
      localStorage.setItem('ecommerce_products', JSON.stringify(this.getDefaultProducts()));
    }
    
    // Pedidos
    if (!localStorage.getItem('ecommerce_orders')) {
      localStorage.setItem('ecommerce_orders', JSON.stringify(this.getDefaultOrders()));
    }
    
    // Clientes
    if (!localStorage.getItem('ecommerce_customers')) {
      localStorage.setItem('ecommerce_customers', JSON.stringify(this.getDefaultCustomers()));
    }
    
    // Cupons
    if (!localStorage.getItem('ecommerce_coupons')) {
      localStorage.setItem('ecommerce_coupons', JSON.stringify(this.getDefaultCoupons()));
    }
    
    // Analytics
    if (!localStorage.getItem('ecommerce_analytics')) {
      localStorage.setItem('ecommerce_analytics', JSON.stringify(this.getDefaultAnalytics()));
    }
  }

  // Produtos padrão
  getDefaultProducts() {
    return [
      {
        id: 1,
        name: "iPhone 15 Pro Max",
        category: "smartphones",
        brand: "apple",
        price: 7999.00,
        originalPrice: 8999.00,
        description: "iPhone 15 Pro Max com chip A17 Pro, câmera de 48MP e tela Super Retina XDR de 6.7 polegadas.",
        images: ["https://via.placeholder.com/400x400?text=iPhone+15+Pro"],
        inStock: 25,
        rating: 4.8,
        reviews: 156,
        featured: true,
        tags: ["novo", "promocao", "mais-vendido"],
        specifications: {
          "Tela": "6.7\" Super Retina XDR",
          "Processador": "A17 Pro",
          "Câmera": "48MP + 12MP + 12MP",
          "Bateria": "4422 mAh",
          "Armazenamento": "256GB"
        },
        createdAt: "2024-09-15",
        status: "active"
      },
      {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        category: "smartphones",
        brand: "samsung",
        price: 6499.00,
        originalPrice: 7199.00,
        description: "Galaxy S24 Ultra com S Pen integrada, câmera de 200MP e tela Dynamic AMOLED 2X de 6.8\".",
        images: ["https://via.placeholder.com/400x400?text=Galaxy+S24"],
        inStock: 18,
        rating: 4.7,
        reviews: 89,
        featured: true,
        tags: ["android", "s-pen", "camera-pro"],
        specifications: {
          "Tela": "6.8\" Dynamic AMOLED 2X",
          "Processador": "Snapdragon 8 Gen 3",
          "Câmera": "200MP + 50MP + 12MP + 10MP",
          "Bateria": "5000 mAh",
          "Armazenamento": "512GB"
        },
        createdAt: "2024-09-10",
        status: "active"
      },
      {
        id: 3,
        name: "MacBook Pro 16\" M3 Pro",
        category: "laptops",
        brand: "apple",
        price: 21999.00,
        originalPrice: 24999.00,
        description: "MacBook Pro com chip M3 Pro, 18GB de RAM e tela Liquid Retina XDR de 16.2 polegadas.",
        images: ["https://via.placeholder.com/400x400?text=MacBook+Pro"],
        inStock: 8,
        rating: 4.9,
        reviews: 67,
        featured: true,
        tags: ["profissional", "apple", "m3"],
        specifications: {
          "Tela": "16.2\" Liquid Retina XDR",
          "Processador": "Apple M3 Pro",
          "Memória": "18GB RAM",
          "Armazenamento": "512GB SSD",
          "Bateria": "Até 22 horas"
        },
        createdAt: "2024-09-05",
        status: "active"
      },
      {
        id: 4,
        name: "Dell XPS 13 Plus",
        category: "laptops",
        brand: "dell",
        price: 8999.00,
        originalPrice: 9999.00,
        description: "Notebook ultrabook com Intel Core i7 de 12ª geração, 16GB RAM e tela InfinityEdge 13.4\".",
        images: ["https://via.placeholder.com/400x400?text=Dell+XPS"],
        inStock: 12,
        rating: 4.6,
        reviews: 43,
        featured: false,
        tags: ["ultrabook", "windows", "business"],
        specifications: {
          "Tela": "13.4\" InfinityEdge",
          "Processador": "Intel Core i7-1270P",
          "Memória": "16GB LPDDR5",
          "Armazenamento": "1TB SSD",
          "Bateria": "Até 12 horas"
        },
        createdAt: "2024-08-28",
        status: "active"
      },
      {
        id: 5,
        name: "iPad Pro 12.9\" M2",
        category: "tablets",
        brand: "apple",
        price: 13499.00,
        originalPrice: 14999.00,
        description: "iPad Pro com chip M2, tela Liquid Retina XDR de 12.9\" e suporte ao Apple Pencil de 2ª geração.",
        images: ["https://via.placeholder.com/400x400?text=iPad+Pro"],
        inStock: 15,
        rating: 4.8,
        reviews: 91,
        featured: true,
        tags: ["tablet", "apple", "criativo"],
        specifications: {
          "Tela": "12.9\" Liquid Retina XDR",
          "Processador": "Apple M2",
          "Armazenamento": "256GB",
          "Câmera": "12MP + 10MP",
          "Conectividade": "Wi-Fi 6E + 5G"
        },
        createdAt: "2024-08-20",
        status: "active"
      },
      {
        id: 6,
        name: "AirPods Pro 2ª Geração",
        category: "acessorios",
        brand: "apple",
        price: 2299.00,
        originalPrice: 2699.00,
        description: "AirPods Pro com cancelamento ativo de ruído, áudio espacial personalizado e estojo MagSafe.",
        images: ["https://via.placeholder.com/400x400?text=AirPods+Pro"],
        inStock: 45,
        rating: 4.7,
        reviews: 234,
        featured: true,
        tags: ["fone", "sem-fio", "noise-cancelling"],
        specifications: {
          "Cancelamento de Ruído": "Ativo adaptativo",
          "Bateria": "Até 6h (30h com estojo)",
          "Conectividade": "Bluetooth 5.3",
          "Resistência": "IPX4",
          "Extras": "Áudio espacial, MagSafe"
        },
        createdAt: "2024-08-15",
        status: "active"
      },
      {
        id: 7,
        name: "Sony WH-1000XM5",
        category: "acessorios",
        brand: "sony",
        price: 1899.00,
        originalPrice: 2199.00,
        description: "Headphone over-ear com cancelamento de ruído líder do mercado e 30 horas de bateria.",
        images: ["https://via.placeholder.com/400x400?text=Sony+WH1000XM5"],
        inStock: 32,
        rating: 4.8,
        reviews: 187,
        featured: false,
        tags: ["headphone", "noise-cancelling", "premium"],
        specifications: {
          "Cancelamento de Ruído": "Duplo processador V1",
          "Bateria": "30 horas",
          "Conectividade": "Bluetooth 5.2, NFC",
          "Drivers": "30mm",
          "Peso": "250g"
        },
        createdAt: "2024-08-10",
        status: "active"
      },
      {
        id: 8,
        name: "PlayStation 5 Digital",
        category: "games",
        brand: "sony",
        price: 3799.00,
        originalPrice: 4199.00,
        description: "Console PlayStation 5 Digital Edition com SSD ultra-rápido e controle DualSense.",
        images: ["https://via.placeholder.com/400x400?text=PS5+Digital"],
        inStock: 5,
        rating: 4.9,
        reviews: 312,
        featured: true,
        tags: ["console", "games", "4k"],
        specifications: {
          "CPU": "AMD Zen 2",
          "GPU": "AMD RDNA 2",
          "Memória": "16GB GDDR6",
          "Armazenamento": "825GB SSD",
          "Resolução": "Até 4K@120fps"
        },
        createdAt: "2024-08-05",
        status: "active"
      },
      {
        id: 9,
        name: "Lenovo ThinkPad X1 Carbon",
        category: "laptops",
        brand: "lenovo",
        price: 12999.00,
        originalPrice: 14999.00,
        description: "Notebook empresarial ultraleve com Intel vPro, 32GB RAM e tela 14\" 2K.",
        images: ["https://via.placeholder.com/400x400?text=ThinkPad+X1"],
        inStock: 7,
        rating: 4.7,
        reviews: 56,
        featured: false,
        tags: ["business", "ultraleve", "seguranca"],
        specifications: {
          "Tela": "14\" 2K IPS",
          "Processador": "Intel Core i7 vPro",
          "Memória": "32GB LPDDR5",
          "Armazenamento": "1TB SSD",
          "Peso": "1.12kg"
        },
        createdAt: "2024-07-30",
        status: "active"
      },
      {
        id: 10,
        name: "Samsung Galaxy Tab S9 Ultra",
        category: "tablets",
        brand: "samsung",
        price: 8999.00,
        originalPrice: 9999.00,
        description: "Tablet premium com tela AMOLED de 14.6\", S Pen incluída e performance flagship.",
        images: ["https://via.placeholder.com/400x400?text=Galaxy+Tab+S9"],
        inStock: 11,
        rating: 4.6,
        reviews: 78,
        featured: false,
        tags: ["tablet", "android", "s-pen"],
        specifications: {
          "Tela": "14.6\" Dynamic AMOLED 2X",
          "Processador": "Snapdragon 8 Gen 2",
          "Memória": "12GB RAM",
          "Armazenamento": "256GB",
          "S Pen": "Incluída"
        },
        createdAt: "2024-07-25",
        status: "active"
      }
    ];
  }

  // Pedidos de exemplo
  getDefaultOrders() {
    return [
      {
        id: "ORD-2024-001",
        customerId: "CUST-001",
        customerName: "João Silva",
        customerEmail: "joao@email.com",
        items: [
          { productId: 1, productName: "iPhone 15 Pro Max", quantity: 1, price: 7999.00, total: 7999.00 }
        ],
        subtotal: 7999.00,
        shipping: 0.00,
        discount: 0.00,
        total: 7999.00,
        status: "delivered",
        paymentMethod: "credit-card",
        shippingMethod: "standard",
        shippingAddress: {
          street: "Rua das Flores, 123",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234-567"
        },
        createdAt: "2024-09-25T14:30:00Z",
        updatedAt: "2024-09-28T10:15:00Z",
        trackingCode: "BR123456789"
      },
      {
        id: "ORD-2024-002",
        customerId: "CUST-002",
        customerName: "Maria Santos",
        customerEmail: "maria@email.com",
        items: [
          { productId: 3, productName: "MacBook Pro 16\" M3 Pro", quantity: 1, price: 21999.00, total: 21999.00 },
          { productId: 6, productName: "AirPods Pro 2ª Geração", quantity: 1, price: 2299.00, total: 2299.00 }
        ],
        subtotal: 24298.00,
        shipping: 0.00,
        discount: 1214.90,
        total: 23083.10,
        status: "processing",
        paymentMethod: "pix",
        shippingMethod: "express",
        couponCode: "DESCONTO5",
        shippingAddress: {
          street: "Av. Paulista, 1000",
          city: "São Paulo",
          state: "SP",
          zipCode: "01310-100"
        },
        createdAt: "2024-09-28T09:20:00Z",
        updatedAt: "2024-09-28T09:20:00Z"
      },
      {
        id: "ORD-2024-003",
        customerId: "CUST-003",
        customerName: "Pedro Oliveira",
        customerEmail: "pedro@email.com",
        items: [
          { productId: 8, productName: "PlayStation 5 Digital", quantity: 1, price: 3799.00, total: 3799.00 }
        ],
        subtotal: 3799.00,
        shipping: 19.90,
        discount: 0.00,
        total: 3818.90,
        status: "shipped",
        paymentMethod: "credit-card",
        shippingMethod: "express",
        shippingAddress: {
          street: "Rua dos Games, 456",
          city: "Rio de Janeiro",
          state: "RJ",
          zipCode: "20000-000"
        },
        createdAt: "2024-09-27T16:45:00Z",
        updatedAt: "2024-09-28T08:30:00Z",
        trackingCode: "BR987654321"
      }
    ];
  }

  // Clientes de exemplo
  getDefaultCustomers() {
    return [
      {
        id: "CUST-001",
        name: "João Silva",
        email: "joao@email.com",
        phone: "(11) 99999-9999",
        cpf: "123.456.789-00",
        birthDate: "1985-03-15",
        addresses: [
          {
            id: "ADDR-001",
            type: "home",
            street: "Rua das Flores, 123",
            neighborhood: "Vila Madalena",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
            default: true
          }
        ],
        orders: ["ORD-2024-001"],
        totalSpent: 7999.00,
        createdAt: "2024-01-15T10:00:00Z",
        lastPurchase: "2024-09-25T14:30:00Z"
      },
      {
        id: "CUST-002",
        name: "Maria Santos",
        email: "maria@email.com",
        phone: "(11) 88888-8888",
        cpf: "987.654.321-00",
        birthDate: "1990-07-22",
        addresses: [
          {
            id: "ADDR-002",
            type: "work",
            street: "Av. Paulista, 1000",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            default: true
          }
        ],
        orders: ["ORD-2024-002"],
        totalSpent: 23083.10,
        createdAt: "2024-02-20T14:30:00Z",
        lastPurchase: "2024-09-28T09:20:00Z"
      },
      {
        id: "CUST-003",
        name: "Pedro Oliveira",
        email: "pedro@email.com",
        phone: "(21) 77777-7777",
        cpf: "456.789.123-00",
        birthDate: "1988-12-10",
        addresses: [
          {
            id: "ADDR-003",
            type: "home",
            street: "Rua dos Games, 456",
            neighborhood: "Copacabana",
            city: "Rio de Janeiro",
            state: "RJ",
            zipCode: "20000-000",
            default: true
          }
        ],
        orders: ["ORD-2024-003"],
        totalSpent: 3818.90,
        createdAt: "2024-03-10T11:15:00Z",
        lastPurchase: "2024-09-27T16:45:00Z"
      }
    ];
  }

  // Cupons de desconto
  getDefaultCoupons() {
    return [
      {
        code: "DESCONTO5",
        description: "5% de desconto",
        type: "percentage",
        value: 5,
        minAmount: 1000,
        maxDiscount: 500,
        active: true,
        usageCount: 15,
        maxUsage: 100,
        expiresAt: "2024-12-31T23:59:59Z",
        createdAt: "2024-09-01T00:00:00Z"
      },
      {
        code: "FRETEGRATIS",
        description: "Frete grátis",
        type: "free-shipping",
        value: 0,
        minAmount: 199,
        active: true,
        usageCount: 45,
        maxUsage: 1000,
        expiresAt: "2024-12-31T23:59:59Z",
        createdAt: "2024-09-01T00:00:00Z"
      },
      {
        code: "BEMVINDO50",
        description: "R$ 50 de desconto para novos clientes",
        type: "fixed",
        value: 50,
        minAmount: 200,
        active: true,
        newCustomersOnly: true,
        usageCount: 28,
        maxUsage: 500,
        expiresAt: "2024-12-31T23:59:59Z",
        createdAt: "2024-09-01T00:00:00Z"
      }
    ];
  }

  // Dados de analytics
  getDefaultAnalytics() {
    return {
      dailySales: [
        { date: "2024-09-22", revenue: 12450.00, orders: 15, visitors: 1250 },
        { date: "2024-09-23", revenue: 18750.00, orders: 23, visitors: 1890 },
        { date: "2024-09-24", revenue: 9820.00, orders: 12, visitors: 1456 },
        { date: "2024-09-25", revenue: 22100.00, orders: 28, visitors: 2341 },
        { date: "2024-09-26", revenue: 15670.00, orders: 19, visitors: 1876 },
        { date: "2024-09-27", revenue: 19450.00, orders: 25, visitors: 2156 },
        { date: "2024-09-28", revenue: 15420.00, orders: 21, visitors: 1987 }
      ],
      topProducts: [
        { productId: 1, name: "iPhone 15 Pro Max", sales: 45, revenue: 359955.00 },
        { productId: 3, name: "MacBook Pro 16\" M3 Pro", sales: 12, revenue: 263988.00 },
        { productId: 6, name: "AirPods Pro 2ª Geração", sales: 78, revenue: 179322.00 },
        { productId: 8, name: "PlayStation 5 Digital", sales: 25, revenue: 94975.00 },
        { productId: 2, name: "Samsung Galaxy S24 Ultra", sales: 32, revenue: 207968.00 }
      ],
      categoryStats: [
        { category: "smartphones", sales: 145, revenue: 892350.00, percentage: 35.2 },
        { category: "laptops", sales: 45, revenue: 567800.00, percentage: 22.4 },
        { category: "acessorios", sales: 234, revenue: 445670.00, percentage: 17.6 },
        { category: "tablets", sales: 67, revenue: 398750.00, percentage: 15.7 },
        { category: "games", sales: 89, revenue: 231450.00, percentage: 9.1 }
      ],
      conversionMetrics: {
        conversionRate: 3.2,
        abandonmentRate: 68.5,
        averageOrderValue: 327.50,
        returnCustomerRate: 24.8,
        customerLifetimeValue: 1245.30
      }
    };
  }

  // Métodos para manipular dados
  getProducts(filters = {}) {
    let products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
    
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    if (filters.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }
    
    if (filters.minPrice) {
      products = products.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= filters.maxPrice);
    }
    
    if (filters.inStock) {
      products = products.filter(p => p.inStock > 0);
    }
    
    if (filters.featured) {
      products = products.filter(p => p.featured);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    return products;
  }

  getProduct(id) {
    const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
    return products.find(p => p.id === parseInt(id));
  }

  addProduct(product) {
    const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
    const newProduct = {
      ...product,
      id: Math.max(...products.map(p => p.id)) + 1,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    products.push(newProduct);
    localStorage.setItem('ecommerce_products', JSON.stringify(products));
    return newProduct;
  }

  updateProduct(id, updates) {
    const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
    const index = products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('ecommerce_products', JSON.stringify(products));
      return products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
    const filteredProducts = products.filter(p => p.id !== parseInt(id));
    localStorage.setItem('ecommerce_products', JSON.stringify(filteredProducts));
    return filteredProducts.length < products.length;
  }

  getOrders(filters = {}) {
    let orders = JSON.parse(localStorage.getItem('ecommerce_orders') || '[]');
    
    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    
    if (filters.customerId) {
      orders = orders.filter(o => o.customerId === filters.customerId);
    }
    
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('ecommerce_orders') || '[]');
    const newOrder = {
      ...orderData,
      id: `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('ecommerce_orders', JSON.stringify(orders));
    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('ecommerce_orders') || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      localStorage.setItem('ecommerce_orders', JSON.stringify(orders));
      return orders[index];
    }
    return null;
  }

  getCustomers() {
    return JSON.parse(localStorage.getItem('ecommerce_customers') || '[]');
  }

  getCoupons() {
    return JSON.parse(localStorage.getItem('ecommerce_coupons') || '[]');
  }

  validateCoupon(code, orderValue, isNewCustomer = false) {
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.active);
    
    if (!coupon) {
      return { valid: false, message: "Cupom inválido ou expirado" };
    }
    
    if (new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, message: "Cupom expirado" };
    }
    
    if (coupon.minAmount && orderValue < coupon.minAmount) {
      return { valid: false, message: `Valor mínimo de R$ ${coupon.minAmount.toFixed(2)}` };
    }
    
    if (coupon.newCustomersOnly && !isNewCustomer) {
      return { valid: false, message: "Cupom válido apenas para novos clientes" };
    }
    
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      return { valid: false, message: "Cupom esgotado" };
    }
    
    return { valid: true, coupon };
  }

  getAnalytics() {
    return JSON.parse(localStorage.getItem('ecommerce_analytics') || '{}');
  }

  updateAnalytics(data) {
    localStorage.setItem('ecommerce_analytics', JSON.stringify(data));
  }

  // Método para resetar dados (útil para desenvolvimento)
  resetDatabase() {
    localStorage.removeItem('ecommerce_products');
    localStorage.removeItem('ecommerce_orders');
    localStorage.removeItem('ecommerce_customers');
    localStorage.removeItem('ecommerce_coupons');
    localStorage.removeItem('ecommerce_analytics');
    this.initializeDatabase();
  }
}

// Instância global do banco de dados
window.ecommerceDB = new EcommerceDatabase();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EcommerceDatabase;
}