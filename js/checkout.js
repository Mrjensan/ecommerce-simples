// ===== CHECKOUT FUNCTIONALITY =====

class CheckoutManager {
    constructor(cart, db) {
        this.cart = cart;
        this.db = db;
        this.currentStep = 1;
        this.maxStep = 4;
        this.orderData = {
            personal: {},
            shipping: {},
            payment: {},
            items: [],
            totals: {}
        };
        
        this.init();
    }

    init() {
        this.loadCartData();
        this.setupStepNavigation();
        this.setupFormValidation();
        this.setupShippingCalculation();
        this.setupPaymentMethods();
        this.renderOrderSummary();
        this.showStep(1);
    }

    loadCartData() {
        const cartData = this.cart.getCartData();
        this.orderData.items = cartData.items;
        this.orderData.totals = {
            subtotal: cartData.subtotal,
            discount: cartData.discount,
            shipping: cartData.shipping,
            total: cartData.total,
            appliedCoupon: cartData.appliedCoupon
        };
    }

    setupStepNavigation() {
        // Next step buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.validateCurrentStep()) {
                    this.nextStep();
                }
            });
        });

        // Previous step buttons
        document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevStep();
            });
        });

        // Step indicator clicks
        document.querySelectorAll('.step').forEach((step, index) => {
            step.addEventListener('click', () => {
                if (index + 1 < this.currentStep) {
                    this.showStep(index + 1);
                }
            });
        });
    }

    showStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > this.maxStep) return;
        
        this.currentStep = stepNumber;
        
        // Hide all steps
        document.querySelectorAll('.checkout-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStepEl = document.querySelector(`#step-${stepNumber}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === stepNumber);
        });
        
        // Update page title
        const titles = {
            1: 'Dados Pessoais',
            2: 'Endereço de Entrega', 
            3: 'Forma de Pagamento',
            4: 'Revisar Pedido'
        };
        
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = titles[stepNumber];
        }

        // Focus first input of current step
        setTimeout(() => {
            const firstInput = currentStepEl?.querySelector('input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    nextStep() {
        if (this.currentStep < this.maxStep) {
            this.showStep(this.currentStep + 1);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validatePersonalInfo();
            case 2:
                return this.validateShippingInfo();
            case 3:
                return this.validatePaymentInfo();
            case 4:
                return this.validateOrderReview();
            default:
                return true;
        }
    }

    validatePersonalInfo() {
        const form = document.querySelector('#step-1');
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo é obrigatório');
                isValid = false;
            } else {
                this.clearFieldError(field);
                
                // Specific validations
                if (field.type === 'email' && !this.validateEmail(field.value)) {
                    this.showFieldError(field, 'Email inválido');
                    isValid = false;
                } else if (field.name === 'cpf' && !this.validateCPF(field.value)) {
                    this.showFieldError(field, 'CPF inválido');
                    isValid = false;
                } else if (field.name === 'phone' && !this.validatePhone(field.value)) {
                    this.showFieldError(field, 'Telefone inválido');
                    isValid = false;
                }
            }
        });
        
        if (isValid) {
            this.savePersonalInfo();
        }
        
        return isValid;
    }

    validateShippingInfo() {
        const form = document.querySelector('#step-2');
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo é obrigatório');
                isValid = false;
            } else {
                this.clearFieldError(field);
                
                if (field.name === 'cep' && !this.validateCEP(field.value)) {
                    this.showFieldError(field, 'CEP inválido');
                    isValid = false;
                }
            }
        });
        
        // Check if shipping method is selected
        const shippingMethod = document.querySelector('input[name="shipping"]:checked');
        if (!shippingMethod) {
            window.ecommerceApp.showNotification('Selecione uma forma de entrega', 'error');
            isValid = false;
        }
        
        if (isValid) {
            this.saveShippingInfo();
        }
        
        return isValid;
    }

    validatePaymentInfo() {
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        
        if (!paymentMethod) {
            window.ecommerceApp.showNotification('Selecione uma forma de pagamento', 'error');
            return false;
        }
        
        let isValid = true;
        
        // Validate payment details based on method
        if (paymentMethod.value === 'credit-card') {
            const cardForm = document.querySelector('.payment-details[data-method="credit-card"]');
            const requiredFields = cardForm.querySelectorAll('input[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    this.showFieldError(field, 'Este campo é obrigatório');
                    isValid = false;
                } else {
                    this.clearFieldError(field);
                    
                    if (field.name === 'card-number' && !this.validateCardNumber(field.value)) {
                        this.showFieldError(field, 'Número do cartão inválido');
                        isValid = false;
                    } else if (field.name === 'card-cvv' && !this.validateCVV(field.value)) {
                        this.showFieldError(field, 'CVV inválido');
                        isValid = false;
                    }
                }
            });
        }
        
        if (isValid) {
            this.savePaymentInfo();
        }
        
        return isValid;
    }

    validateOrderReview() {
        const termsCheckbox = document.querySelector('input[name="terms"]');
        
        if (!termsCheckbox || !termsCheckbox.checked) {
            window.ecommerceApp.showNotification('Você deve aceitar os termos e condições', 'error');
            return false;
        }
        
        return true;
    }

    savePersonalInfo() {
        const form = document.querySelector('#step-1');
        const formData = new FormData(form);
        
        this.orderData.personal = {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            cpf: formData.get('cpf'),
            birthDate: formData.get('birth-date')
        };
        
        this.updateOrderReview();
    }

    saveShippingInfo() {
        const form = document.querySelector('#step-2');
        const formData = new FormData(form);
        const shippingMethod = document.querySelector('input[name="shipping"]:checked');
        
        this.orderData.shipping = {
            cep: formData.get('cep'),
            street: formData.get('street'),
            number: formData.get('number'),
            complement: formData.get('complement'),
            neighborhood: formData.get('neighborhood'),
            city: formData.get('city'),
            state: formData.get('state'),
            method: shippingMethod ? shippingMethod.value : null,
            methodName: shippingMethod ? shippingMethod.dataset.name : null,
            cost: shippingMethod ? parseFloat(shippingMethod.dataset.price) : 0,
            estimatedDays: shippingMethod ? shippingMethod.dataset.days : null
        };
        
        // Recalculate totals with new shipping
        this.recalculateShipping();
        this.updateOrderReview();
    }

    savePaymentInfo() {
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        
        this.orderData.payment = {
            method: paymentMethod.value,
            methodName: paymentMethod.dataset.name
        };
        
        if (paymentMethod.value === 'credit-card') {
            const cardForm = document.querySelector('.payment-details[data-method="credit-card"]');
            const formData = new FormData(cardForm);
            
            this.orderData.payment.cardDetails = {
                number: formData.get('card-number'),
                name: formData.get('card-name'),
                expiry: formData.get('card-expiry'),
                cvv: formData.get('card-cvv'),
                installments: formData.get('installments') || 1
            };
        }
        
        this.updateOrderReview();
    }

    setupFormValidation() {
        // Real-time validation for inputs
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // CPF mask and validation
        const cpfInput = document.querySelector('input[name="cpf"]');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                e.target.value = this.maskCPF(e.target.value);
            });
        }

        // Phone mask
        const phoneInput = document.querySelector('input[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = this.maskPhone(e.target.value);
            });
        }

        // CEP mask and auto-complete
        const cepInput = document.querySelector('input[name="cep"]');
        if (cepInput) {
            cepInput.addEventListener('input', (e) => {
                e.target.value = this.maskCEP(e.target.value);
                
                if (e.target.value.length === 9) {
                    this.fetchAddressByCEP(e.target.value.replace('-', ''));
                }
            });
        }

        // Card number mask
        const cardNumberInput = document.querySelector('input[name="card-number"]');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                e.target.value = this.maskCardNumber(e.target.value);
            });
        }

        // Card expiry mask
        const cardExpiryInput = document.querySelector('input[name="card-expiry"]');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                e.target.value = this.maskCardExpiry(e.target.value);
            });
        }
    }

    setupShippingCalculation() {
        // Shipping method selection
        document.querySelectorAll('input[name="shipping"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateShippingCost(e.target);
            });
        });
    }

    setupPaymentMethods() {
        // Payment method selection
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.showPaymentDetails(e.target.value);
            });
        });

        // Installments calculation
        const installmentsSelect = document.querySelector('select[name="installments"]');
        if (installmentsSelect) {
            installmentsSelect.addEventListener('change', (e) => {
                this.updateInstallmentInfo(e.target.value);
            });
        }
    }

    showPaymentDetails(method) {
        // Hide all payment details
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.style.display = 'none';
        });

        // Show selected method details
        const selectedDetails = document.querySelector(`.payment-details[data-method="${method}"]`);
        if (selectedDetails) {
            selectedDetails.style.display = 'block';
        }

        // Generate installment options for credit card
        if (method === 'credit-card') {
            this.generateInstallmentOptions();
        }
    }

    generateInstallmentOptions() {
        const installmentsSelect = document.querySelector('select[name="installments"]');
        const total = this.orderData.totals.total;
        
        if (!installmentsSelect || !total) return;

        let optionsHTML = '';
        
        for (let i = 1; i <= 12; i++) {
            const installmentValue = total / i;
            const interestRate = i > 6 ? 0.02 : 0; // 2% interest after 6 installments
            const finalValue = installmentValue * (1 + (interestRate * (i - 6)));
            
            if (i === 1) {
                optionsHTML += `<option value="1">1x de R$ ${total.toFixed(2)} (à vista)</option>`;
            } else if (i <= 6) {
                optionsHTML += `<option value="${i}">${i}x de R$ ${installmentValue.toFixed(2)} sem juros</option>`;
            } else {
                optionsHTML += `<option value="${i}">${i}x de R$ ${finalValue.toFixed(2)} com juros</option>`;
            }
        }
        
        installmentsSelect.innerHTML = optionsHTML;
    }

    updateInstallmentInfo(installments) {
        const total = this.orderData.totals.total;
        const installmentInfo = document.querySelector('.installment-info');
        
        if (!installmentInfo) return;
        
        if (installments <= 6) {
            const value = total / installments;
            installmentInfo.textContent = `${installments}x de R$ ${value.toFixed(2)} sem juros`;
        } else {
            const interestRate = 0.02;
            const value = (total / installments) * (1 + (interestRate * (installments - 6)));
            installmentInfo.textContent = `${installments}x de R$ ${value.toFixed(2)} com juros`;
        }
    }

    updateShippingCost(shippingRadio) {
        const cost = parseFloat(shippingRadio.dataset.price) || 0;
        
        // Update totals
        this.orderData.totals.shipping = cost;
        this.orderData.totals.total = this.orderData.totals.subtotal - 
            this.orderData.totals.discount + cost;
        
        this.renderOrderSummary();
    }

    recalculateShipping() {
        const selectedShipping = document.querySelector('input[name="shipping"]:checked');
        if (selectedShipping) {
            this.updateShippingCost(selectedShipping);
        }
    }

    renderOrderSummary() {
        const orderSummary = document.querySelector('.order-summary .summary-content');
        if (!orderSummary) return;

        const totals = this.orderData.totals;
        
        orderSummary.innerHTML = `
            <div class="order-items">
                ${this.orderData.items.map(item => `
                    <div class="order-item">
                        <div class="order-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="order-item-details">
                            <div class="order-item-name">${item.name}</div>
                            <div class="order-item-price">
                                ${item.quantity}x R$ ${item.price.toFixed(2)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="summary-row">
                <span>Subtotal</span>
                <span>R$ ${totals.subtotal.toFixed(2)}</span>
            </div>
            
            ${totals.discount > 0 ? `
                <div class="summary-row">
                    <span>Desconto</span>
                    <span class="discount-value">-R$ ${totals.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            
            <div class="summary-row">
                <span>Frete</span>
                <span>${totals.shipping === 0 ? 'Grátis' : `R$ ${totals.shipping.toFixed(2)}`}</span>
            </div>
            
            <div class="summary-divider"></div>
            
            <div class="summary-row total-row">
                <span>Total</span>
                <span>R$ ${totals.total.toFixed(2)}</span>
            </div>
        `;
    }

    updateOrderReview() {
        const personalSection = document.querySelector('.review-section[data-section="personal"] .section-content');
        const shippingSection = document.querySelector('.review-section[data-section="shipping"] .section-content');
        const paymentSection = document.querySelector('.review-section[data-section="payment"] .section-content');
        
        if (personalSection && this.orderData.personal.firstName) {
            personalSection.innerHTML = `
                <p><strong>Nome:</strong> ${this.orderData.personal.firstName} ${this.orderData.personal.lastName}</p>
                <p><strong>Email:</strong> ${this.orderData.personal.email}</p>
                <p><strong>Telefone:</strong> ${this.orderData.personal.phone}</p>
                <p><strong>CPF:</strong> ${this.orderData.personal.cpf}</p>
            `;
        }
        
        if (shippingSection && this.orderData.shipping.street) {
            shippingSection.innerHTML = `
                <p><strong>Endereço:</strong> ${this.orderData.shipping.street}, ${this.orderData.shipping.number}</p>
                ${this.orderData.shipping.complement ? `<p><strong>Complemento:</strong> ${this.orderData.shipping.complement}</p>` : ''}
                <p><strong>Bairro:</strong> ${this.orderData.shipping.neighborhood}</p>
                <p><strong>Cidade:</strong> ${this.orderData.shipping.city} - ${this.orderData.shipping.state}</p>
                <p><strong>CEP:</strong> ${this.orderData.shipping.cep}</p>
                <p><strong>Forma de entrega:</strong> ${this.orderData.shipping.methodName}</p>
            `;
        }
        
        if (paymentSection && this.orderData.payment.method) {
            let paymentHTML = `<p><strong>Método:</strong> ${this.orderData.payment.methodName}</p>`;
            
            if (this.orderData.payment.cardDetails) {
                const card = this.orderData.payment.cardDetails;
                paymentHTML += `
                    <p><strong>Cartão:</strong> **** **** **** ${card.number.slice(-4)}</p>
                    <p><strong>Parcelas:</strong> ${card.installments}x</p>
                `;
            }
            
            paymentSection.innerHTML = paymentHTML;
        }
    }

    async fetchAddressByCEP(cep) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.querySelector('input[name="street"]').value = data.logradouro || '';
                document.querySelector('input[name="neighborhood"]').value = data.bairro || '';
                document.querySelector('input[name="city"]').value = data.localidade || '';
                document.querySelector('select[name="state"]').value = data.uf || '';
                
                // Focus on number field
                document.querySelector('input[name="number"]').focus();
            }
        } catch (error) {
            console.error('Error fetching CEP:', error);
        }
    }

    // Validation helper methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        
        // Basic CPF validation (simplified)
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        return true; // In production, implement full CPF validation
    }

    validatePhone(phone) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    validateCEP(cep) {
        const cepRegex = /^\d{5}-\d{3}$/;
        return cepRegex.test(cep);
    }

    validateCardNumber(number) {
        const cleaned = number.replace(/\D/g, '');
        return cleaned.length >= 13 && cleaned.length <= 19;
    }

    validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    // Mask helper methods
    maskCPF(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }

    maskPhone(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
            .replace(/(-\d{4})\d+?$/, '$1');
    }

    maskCEP(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    }

    maskCardNumber(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{4})(\d)/, '$1 $2')
            .replace(/(\d{4})(\d)/, '$1 $2')
            .replace(/(\d{4})(\d)/, '$1 $2')
            .replace(/( \d{4})\d+?$/, '$1');
    }

    maskCardExpiry(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1/$2')
            .replace(/(\/\d{2})\d+?$/, '$1');
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    validateField(field) {
        if (field.hasAttribute('required') && !field.value.trim()) {
            this.showFieldError(field, 'Este campo é obrigatório');
            return false;
        }

        switch (field.type) {
            case 'email':
                if (field.value && !this.validateEmail(field.value)) {
                    this.showFieldError(field, 'Email inválido');
                    return false;
                }
                break;
        }

        switch (field.name) {
            case 'cpf':
                if (field.value && !this.validateCPF(field.value)) {
                    this.showFieldError(field, 'CPF inválido');
                    return false;
                }
                break;
            case 'phone':
                if (field.value && !this.validatePhone(field.value)) {
                    this.showFieldError(field, 'Telefone inválido');
                    return false;
                }
                break;
            case 'cep':
                if (field.value && !this.validateCEP(field.value)) {
                    this.showFieldError(field, 'CEP inválido');
                    return false;
                }
                break;
        }

        this.clearFieldError(field);
        return true;
    }

    // Finish order
    async finishOrder() {
        const orderButton = document.querySelector('.finish-order-btn');
        if (orderButton) {
            orderButton.disabled = true;
            orderButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create order in database
            const orderId = this.db.createOrder({
                ...this.orderData,
                status: 'confirmed',
                orderDate: new Date().toISOString(),
                estimatedDelivery: this.calculateEstimatedDelivery()
            });

            // Clear cart
            this.cart.clear();

            // Show success modal
            this.showSuccessModal(orderId);

        } catch (error) {
            console.error('Error finishing order:', error);
            window.ecommerceApp.showNotification('Erro ao processar pedido. Tente novamente.', 'error');
            
            if (orderButton) {
                orderButton.disabled = false;
                orderButton.innerHTML = '<i class="fas fa-credit-card"></i> Finalizar Pedido';
            }
        }
    }

    calculateEstimatedDelivery() {
        const days = this.orderData.shipping.estimatedDays || 5;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + parseInt(days));
        return deliveryDate.toISOString();
    }

    showSuccessModal(orderId) {
        const modal = document.querySelector('.success-modal');
        const orderNumberEl = document.querySelector('.order-number strong');
        
        if (orderNumberEl) {
            orderNumberEl.textContent = `#${orderId}`;
        }
        
        if (modal) {
            modal.classList.add('show');
            
            // Setup modal actions
            const continueBtn = modal.querySelector('.continue-shopping');
            const trackBtn = modal.querySelector('.track-order');
            
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    window.location.href = 'products.html';
                });
            }
            
            if (trackBtn) {
                trackBtn.addEventListener('click', () => {
                    window.location.href = `track-order.html?order=${orderId}`;
                });
            }
        }
    }
}

// Initialize pages when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Cart page initialization
    if (window.location.pathname.includes('cart.html')) {
        const cart = window.ecommerceApp?.cart || new Cart();
        cart.updateCartUI();
        
        // Setup continue shopping button
        const continueBtn = document.querySelector('.continue-shopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.location.href = 'products.html';
            });
        }
        
        // Setup checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cart.getTotalItems() > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    window.ecommerceApp?.showNotification('Adicione produtos ao carrinho primeiro', 'warning');
                }
            });
        }
    }
    
    // Checkout page initialization
    if (window.location.pathname.includes('checkout.html')) {
        const cart = window.ecommerceApp?.cart || new Cart();
        const db = window.ecommerceApp?.db || new EcommerceDatabase();
        
        // Check if cart is empty
        if (cart.getTotalItems() === 0) {
            window.location.href = 'cart.html';
            return;
        }
        
        window.checkoutManager = new CheckoutManager(cart, db);
        
        // Setup finish order button
        const finishOrderBtn = document.querySelector('.finish-order-btn');
        if (finishOrderBtn) {
            finishOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.checkoutManager.validateCurrentStep()) {
                    window.checkoutManager.finishOrder();
                }
            });
        }
    }
});