// Bilheteira functionality for Apollo Esmoriz
document.addEventListener('DOMContentLoaded', function() {
    // Initialize bilheteira system
    initializeBilheteira();
});

// Global variables
let selectedEvent = null;
let selectedTickets = {};
let currentStep = 1;

// Event data
const eventsData = {
    'metal-festival': {
        id: 'metal-festival',
        name: 'Metal Festival',
        date: '05/09/2025',
        time: '22:00',
        location: 'Apollo Esmoriz',
        image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        ticketTypes: [
            { id: 'general', name: 'Bilhete Geral', price: 25, available: 150 },
            { id: 'vip', name: 'VIP', price: 45, available: 50 },
            { id: 'backstage', name: 'Backstage Pass', price: 75, available: 20 }
        ]
    },
    'rock-night': {
        id: 'rock-night',
        name: 'Rock Night',
        date: '12/09/2025',
        time: '21:30',
        location: 'Apollo Esmoriz',
        image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        ticketTypes: [
            { id: 'general', name: 'Bilhete Geral', price: 20, available: 200 },
            { id: 'vip', name: 'VIP', price: 35, available: 75 }
        ]
    },
    'indie-session': {
        id: 'indie-session',
        name: 'Indie Session',
        date: '19/09/2025',
        time: '20:00',
        location: 'Apollo Esmoriz',
        image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        ticketTypes: [
            { id: 'general', name: 'Bilhete Geral', price: 15, available: 100 },
            { id: 'premium', name: 'Premium', price: 25, available: 40 }
        ]
    }
};

function initializeBilheteira() {
    // Check URL parameters for pre-selected event
    const urlParams = new URLSearchParams(window.location.search);
    const eventParam = urlParams.get('event');
    
    if (eventParam && eventsData[eventParam]) {
        // Auto-select event and go to step 2
        selectEvent(eventParam);
        goToStep(2);
    }

    // Event selection handlers
    const selectEventBtns = document.querySelectorAll('.select-event-btn');
    selectEventBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventCard = this.closest('.event-card');
            const eventId = eventCard.dataset.event;
            selectEvent(eventId);
            goToStep(2);
        });
    });

    // Navigation handlers
    const backToStep1Btn = document.getElementById('back-to-step-1');
    const backToStep2Btn = document.getElementById('back-to-step-2');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');

    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', () => goToStep(1));
    }

    if (backToStep2Btn) {
        backToStep2Btn.addEventListener('click', () => goToStep(2));
    }

    if (continueToPaymentBtn) {
        continueToPaymentBtn.addEventListener('click', () => goToStep(3));
    }

    // Payment form handler
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }

    // Payment method change handler
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', handlePaymentMethodChange);
    });

    // Success actions
    const downloadTicketsBtn = document.getElementById('download-tickets');
    if (downloadTicketsBtn) {
        downloadTicketsBtn.addEventListener('click', downloadTickets);
    }

    // Initialize payment method display
    handlePaymentMethodChange();
}

function selectEvent(eventId) {
    selectedEvent = eventsData[eventId];
    selectedTickets = {};
    
    // Update selected event info
    updateSelectedEventInfo();
    
    // Generate ticket types
    generateTicketTypes();
    
    // Update summary
    updateTicketSummary();
}

function updateSelectedEventInfo() {
    const container = document.getElementById('selected-event-info');
    if (!container || !selectedEvent) return;

    container.innerHTML = `
        <div class="selected-event">
            <img src="${selectedEvent.image}" alt="${selectedEvent.name}">
            <div class="event-details">
                <h3>${selectedEvent.name}</h3>
                <p><strong>Data:</strong> ${selectedEvent.date} às ${selectedEvent.time}</p>
                <p><strong>Local:</strong> ${selectedEvent.location}</p>
            </div>
        </div>
    `;
}

function generateTicketTypes() {
    const container = document.getElementById('ticket-types');
    if (!container || !selectedEvent) return;

    container.innerHTML = selectedEvent.ticketTypes.map(ticket => `
        <div class="ticket-type" data-ticket-id="${ticket.id}">
            <div class="ticket-info">
                <h4>${ticket.name}</h4>
                <p class="ticket-price">€${ticket.price.toFixed(2)}</p>
                <p class="ticket-availability">${ticket.available} disponíveis</p>
            </div>
            <div class="ticket-quantity">
                <button type="button" class="quantity-btn minus" data-action="decrease">-</button>
                <input type="number" class="quantity-input" value="0" min="0" max="${ticket.available}" readonly>
                <button type="button" class="quantity-btn plus" data-action="increase">+</button>
            </div>
        </div>
    `).join('');

    // Add event listeners to quantity buttons
    container.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityChange);
    });
}

function handleQuantityChange(e) {
    const button = e.target;
    const ticketType = button.closest('.ticket-type');
    const ticketId = ticketType.dataset.ticketId;
    const quantityInput = ticketType.querySelector('.quantity-input');
    const action = button.dataset.action;
    
    let currentQuantity = parseInt(quantityInput.value) || 0;
    const maxQuantity = parseInt(quantityInput.max);
    
    if (action === 'increase' && currentQuantity < maxQuantity) {
        currentQuantity++;
    } else if (action === 'decrease' && currentQuantity > 0) {
        currentQuantity--;
    }
    
    quantityInput.value = currentQuantity;
    
    // Update selected tickets
    if (currentQuantity > 0) {
        selectedTickets[ticketId] = {
            ...selectedEvent.ticketTypes.find(t => t.id === ticketId),
            quantity: currentQuantity
        };
    } else {
        delete selectedTickets[ticketId];
    }
    
    updateTicketSummary();
}

function updateTicketSummary() {
    const summaryContainer = document.querySelector('#ticket-summary .summary-content');
    const continueBtn = document.getElementById('continue-to-payment');
    
    if (!summaryContainer) return;

    const ticketCount = Object.keys(selectedTickets).length;
    
    if (ticketCount === 0) {
        summaryContainer.innerHTML = '<p>Nenhum bilhete selecionado</p>';
        if (continueBtn) continueBtn.disabled = true;
        return;
    }

    let total = 0;
    let totalQuantity = 0;
    
    const summaryHTML = Object.values(selectedTickets).map(ticket => {
        const subtotal = ticket.price * ticket.quantity;
        total += subtotal;
        totalQuantity += ticket.quantity;
        
        return `
            <div class="summary-item">
                <span>${ticket.name} x${ticket.quantity}</span>
                <span>€${subtotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    summaryContainer.innerHTML = `
        ${summaryHTML}
        <div class="summary-total">
            <strong>Total: €${total.toFixed(2)} (${totalQuantity} bilhete${totalQuantity > 1 ? 's' : ''})</strong>
        </div>
    `;

    if (continueBtn) continueBtn.disabled = false;
    
    // Update payment summary
    updatePaymentSummary();
}

function updatePaymentSummary() {
    const container = document.getElementById('payment-summary-details');
    const totalAmountElement = document.getElementById('total-amount');
    
    if (!container || !selectedEvent) return;

    let total = 0;
    let totalQuantity = 0;
    
    const summaryHTML = `
        <div class="payment-event-info">
            <h4>${selectedEvent.name}</h4>
            <p>${selectedEvent.date} às ${selectedEvent.time}</p>
        </div>
        <div class="payment-tickets">
            ${Object.values(selectedTickets).map(ticket => {
                const subtotal = ticket.price * ticket.quantity;
                total += subtotal;
                totalQuantity += ticket.quantity;
                
                return `
                    <div class="payment-ticket-item">
                        <span>${ticket.name} x${ticket.quantity}</span>
                        <span>€${subtotal.toFixed(2)}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = summaryHTML;
    
    if (totalAmountElement) {
        totalAmountElement.textContent = `€${total.toFixed(2)}`;
    }
}

function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.bilheteira-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step-${step}`);
    if (targetStep) {
        targetStep.classList.add('active');
        currentStep = step;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update payment summary if going to payment step
        if (step === 3) {
            updatePaymentSummary();
        }
    }
}

function handlePaymentMethodChange() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedMethod) return;

    // Hide all payment details
    document.querySelectorAll('.payment-details').forEach(detail => {
        detail.style.display = 'none';
    });

    // Show selected payment method details
    const methodValue = selectedMethod.value;
    const detailsElement = document.getElementById(`${methodValue}-details`);
    if (detailsElement) {
        detailsElement.style.display = 'block';
    }
}

async function handlePayment(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const paymentData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        nif: formData.get('nif'),
        paymentMethod: formData.get('payment-method'),
        acceptTerms: document.getElementById('accept-terms').checked
    };

    // Validate form
    if (!validatePaymentForm(paymentData)) {
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('.payment-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'A processar...';
    submitBtn.disabled = true;

    try {
        // Process payment based on method
        let paymentResult;
        
        switch (paymentData.paymentMethod) {
            case 'mbway':
                paymentResult = await processMBWayPayment(formData.get('mbway-phone'));
                break;
            case 'viva-wallet':
                paymentResult = await processVivaWalletPayment();
                break;
            case 'card':
                paymentResult = await processCardPayment({
                    number: formData.get('card-number'),
                    expiry: formData.get('card-expiry'),
                    cvv: formData.get('card-cvv'),
                    name: formData.get('card-name')
                });
                break;
            default:
                throw new Error('Método de pagamento inválido');
        }

        if (paymentResult.success) {
            // Generate order details
            const orderDetails = {
                orderId: 'APL' + Date.now(),
                event: selectedEvent,
                tickets: selectedTickets,
                customer: paymentData,
                total: calculateTotal(),
                paymentMethod: paymentData.paymentMethod,
                timestamp: new Date()
            };

            // Show success page
            showSuccessPage(orderDetails);
            goToStep(4);
            
            // Send confirmation email (simulated)
            await sendConfirmationEmail(orderDetails);
            
        } else {
            throw new Error(paymentResult.message || 'Erro no pagamento');
        }

    } catch (error) {
        console.error('Payment error:', error);
        window.ApolloEsmoriz.showNotification(error.message || 'Erro no pagamento. Tente novamente.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function validatePaymentForm(data) {
    let isValid = true;

    // Basic validation
    if (!data.name || data.name.trim().length < 2) {
        window.ApolloEsmoriz.showNotification('Nome é obrigatório', 'error');
        isValid = false;
    }

    if (!data.email || !window.ApolloEsmoriz.isValidEmail(data.email)) {
        window.ApolloEsmoriz.showNotification('Email válido é obrigatório', 'error');
        isValid = false;
    }

    if (!data.phone || data.phone.trim().length < 9) {
        window.ApolloEsmoriz.showNotification('Telefone válido é obrigatório', 'error');
        isValid = false;
    }

    if (!data.acceptTerms) {
        window.ApolloEsmoriz.showNotification('Deve aceitar os termos e condições', 'error');
        isValid = false;
    }

    // Payment method specific validation
    if (data.paymentMethod === 'mbway') {
        const mbwayPhone = document.getElementById('mbway-phone').value;
        if (!mbwayPhone || mbwayPhone.length !== 9) {
            window.ApolloEsmoriz.showNotification('Número MB WAY inválido', 'error');
            isValid = false;
        }
    }

    if (data.paymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        const cardName = document.getElementById('card-name').value;

        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
            window.ApolloEsmoriz.showNotification('Número de cartão inválido', 'error');
            isValid = false;
        }

        if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            window.ApolloEsmoriz.showNotification('Data de validade inválida (MM/AA)', 'error');
            isValid = false;
        }

        if (!cardCvv || cardCvv.length < 3) {
            window.ApolloEsmoriz.showNotification('CVV inválido', 'error');
            isValid = false;
        }

        if (!cardName || cardName.trim().length < 2) {
            window.ApolloEsmoriz.showNotification('Nome no cartão é obrigatório', 'error');
            isValid = false;
        }
    }

    return isValid;
}

// Payment processing functions (simulated)
async function processMBWayPayment(phoneNumber) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate MB WAY payment
            window.ApolloEsmoriz.showNotification('Pedido MB WAY enviado! Confirme no seu telemóvel.', 'info');
            
            // Simulate user confirmation after 3 seconds
            setTimeout(() => {
                resolve({ success: true, transactionId: 'MBWAY' + Date.now() });
            }, 3000);
        }, 1000);
    });
}

async function processVivaWalletPayment() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate Viva Wallet redirect and payment
            window.ApolloEsmoriz.showNotification('Redirecionando para Viva Wallet...', 'info');
            
            setTimeout(() => {
                resolve({ success: true, transactionId: 'VIVA' + Date.now() });
            }, 2000);
        }, 1000);
    });
}

async function processCardPayment(cardData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate card payment processing
            resolve({ success: true, transactionId: 'CARD' + Date.now() });
        }, 2000);
    });
}

function calculateTotal() {
    return Object.values(selectedTickets).reduce((total, ticket) => {
        return total + (ticket.price * ticket.quantity);
    }, 0);
}

function showSuccessPage(orderDetails) {
    const container = document.getElementById('order-details');
    if (!container) return;

    const ticketsList = Object.values(orderDetails.tickets).map(ticket => 
        `<li>${ticket.name} x${ticket.quantity} - €${(ticket.price * ticket.quantity).toFixed(2)}</li>`
    ).join('');

    container.innerHTML = `
        <div class="order-info">
            <h3>Detalhes da Compra</h3>
            <p><strong>Número do Pedido:</strong> ${orderDetails.orderId}</p>
            <p><strong>Evento:</strong> ${orderDetails.event.name}</p>
            <p><strong>Data:</strong> ${orderDetails.event.date} às ${orderDetails.event.time}</p>
            <p><strong>Local:</strong> ${orderDetails.event.location}</p>
            
            <h4>Bilhetes:</h4>
            <ul class="tickets-list">
                ${ticketsList}
            </ul>
            
            <p><strong>Total Pago:</strong> €${orderDetails.total.toFixed(2)}</p>
            <p><strong>Método de Pagamento:</strong> ${getPaymentMethodName(orderDetails.paymentMethod)}</p>
        </div>
    `;

    // Store order for download
    window.currentOrder = orderDetails;
}

function getPaymentMethodName(method) {
    const names = {
        'mbway': 'MB WAY',
        'viva-wallet': 'Viva Wallet',
        'card': 'Cartão de Crédito/Débito'
    };
    return names[method] || method;
}

async function sendConfirmationEmail(orderDetails) {
    // Simulate sending confirmation email
    return new Promise((resolve) => {
        setTimeout(() => {
            window.ApolloEsmoriz.showNotification('Email de confirmação enviado!', 'success');
            resolve();
        }, 1000);
    });
}

function downloadTickets() {
    if (!window.currentOrder) {
        window.ApolloEsmoriz.showNotification('Erro ao descarregar bilhetes', 'error');
        return;
    }

    // Generate PDF-like content (simulated)
    const ticketContent = generateTicketContent(window.currentOrder);
    
    // Create and download file
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilhetes-${window.currentOrder.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    window.ApolloEsmoriz.showNotification('Bilhetes descarregados!', 'success');
}

function generateTicketContent(orderDetails) {
    const ticketsList = Object.values(orderDetails.tickets).map(ticket => 
        `${ticket.name} x${ticket.quantity} - €${(ticket.price * ticket.quantity).toFixed(2)}`
    ).join('\n');

    return `
APOLLO ESMORIZ - BILHETES ELETRÓNICOS
=====================================

Número do Pedido: ${orderDetails.orderId}
Data da Compra: ${orderDetails.timestamp.toLocaleString('pt-PT')}

EVENTO
------
${orderDetails.event.name}
${orderDetails.event.date} às ${orderDetails.event.time}
${orderDetails.event.location}

BILHETES
--------
${ticketsList}

TOTAL: €${orderDetails.total.toFixed(2)}

CLIENTE
-------
Nome: ${orderDetails.customer.name}
Email: ${orderDetails.customer.email}
Telefone: ${orderDetails.customer.phone}

IMPORTANTE
----------
- Apresente este bilhete na entrada
- É obrigatório apresentar documento de identificação
- Idade mínima: 18 anos
- Proibido fumar no interior
- Idade mínima para consumo de álcool: 21 anos

Para mais informações: info@apolloesmoriz.pt
Website: www.apolloesmoriz.pt

Obrigado pela sua compra!
    `.trim();
}
